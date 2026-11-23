import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {NOINK} from '../upstream/templates/bridge/ink';

const halfWidth = 3.72;
const halfDepth = 1.05;
const rockBase = -2.6;
const faultSlope = -.64;
const seaFloor = -.95;
const columns = 72;
type Point = [number, number, number];

const stoneColors = ['#79573d', '#9d614d', '#8d9fa9', '#be8051', '#e4b67a'];
const layerStops = [0, .18, .42, .61, .83, 1];

function layerHeight(x: number, layer: number) {
  const base = THREE.MathUtils.lerp(rockBase, seaFloor, layerStops[layer]);
  if (layer === 0 || layer === layerStops.length - 1) return base;
  return base + .052 * Math.sin(x * 2.45 + layer * .86) + .023 * Math.sin(x * 5 + layer);
}

function faultX(height: number) {
  return faultSlope * (height - seaFloor);
}

function createRock(raised: boolean) {
  const positions: number[] = [];
  const colors: number[] = [];
  function face(a: Point, b: Point, c: Point, d: Point, paint: THREE.Color, detail = 0) {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (const brightness of [1, 1 + detail]) {
      for (let i = 0; i < 3; i++) colors.push(paint.r * brightness, paint.g * brightness, paint.b * brightness);
    }
  }
  function point(column: number, layer: number, z: number): Point {
    const x = THREE.MathUtils.lerp(raised ? 0 : -halfWidth, raised ? halfWidth : 0, column);
    const height = layerHeight(x, layer);
    const shear = raised ? 1 - column : column;
    return [x + faultX(height) * shear, height, z];
  }

  for (let band = 0; band < stoneColors.length; band++) {
    const paint = new THREE.Color(stoneColors[band]);
    for (let column = 0; column < 8; column++) {
      const a = column / 8;
      const b = (column + 1) / 8;
      const variation = paint.clone().multiplyScalar(1 + .03 * Math.sin(column * 4.2 + band * 1.7));
      face(point(a, band, halfDepth), point(b, band, halfDepth), point(b, band + 1, halfDepth), point(a, band + 1, halfDepth), variation, .02);
      face(point(b, band, -halfDepth), point(a, band, -halfDepth), point(a, band + 1, -halfDepth), point(b, band + 1, -halfDepth), variation);
    }
    face(point(0, band, -halfDepth), point(0, band, halfDepth), point(0, band + 1, halfDepth), point(0, band + 1, -halfDepth), paint);
    face(point(1, band, halfDepth), point(1, band, -halfDepth), point(1, band + 1, -halfDepth), point(1, band + 1, halfDepth), paint);
  }

  const top = layerStops.length - 1;
  face(point(0, top, halfDepth), point(1, top, halfDepth), point(1, top, -halfDepth), point(0, top, -halfDepth), new THREE.Color('#d4a76c'));
  face(point(0, 0, -halfDepth), point(1, 0, -halfDepth), point(1, 0, halfDepth), point(0, 0, halfDepth), new THREE.Color(stoneColors[0]));
  const mesh = new THREE.BufferGeometry();
  mesh.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  mesh.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  mesh.computeVertexNormals();
  return mesh;
}

function waterHeight(x: number, lift: number, disturbance: number) {
  const crest = .58 * Math.exp(-Math.pow((x - disturbance) / .75, 2));
  const trough = .30 * Math.exp(-Math.pow((x - disturbance + .95) / .55, 2));
  return .52 + lift * (crest - trough);
}

function waterSkin(columns: number, bands: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((columns + 1) * bands * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const indices: number[] = [];
  for (let i = 0; i < columns; i++) {
    for (let band = 0; band < bands - 1; band++) {
      const a = i * bands + band, b = a + bands;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  geometry.setIndex(indices);
  return geometry;
}

function updateWater(front: THREE.BufferGeometry, surface: THREE.BufferGeometry, caps: THREE.BufferGeometry, lift: number, disturbance: number) {
  const frontPoints = front.getAttribute('position');
  const surfacePoints = surface.getAttribute('position');
  const endPoints = caps.getAttribute('position');
  const rightEdge = halfWidth + faultSlope * lift;
  for (let i = 0; i <= columns; i++) {
    const x = THREE.MathUtils.lerp(-halfWidth, rightEdge, i / columns);
    const height = waterHeight(x, lift, disturbance);
    // The slightly inset section lets the lifted rock occlude the blue where they meet.
    frontPoints.setXYZ(i * 2, x, seaFloor - .012, halfDepth - .008);
    frontPoints.setXYZ(i * 2 + 1, x, height, halfDepth - .008);
    surfacePoints.setXYZ(i * 2, x, height, halfDepth - .008);
    surfacePoints.setXYZ(i * 2 + 1, x, height, -halfDepth);
  }
  for (const [index, x] of [-halfWidth, rightEdge].entries()) {
    const base = index * 4;
    const height = waterHeight(x, lift, disturbance);
    const floor = seaFloor + (x > 0 ? lift : 0) - .012;
    endPoints.setXYZ(base, x, floor, halfDepth - .008);
    endPoints.setXYZ(base + 1, x, height, halfDepth - .008);
    endPoints.setXYZ(base + 2, x, height, -halfDepth);
    endPoints.setXYZ(base + 3, x, floor, -halfDepth);
  }
  endPoints.needsUpdate = true;
  caps.computeVertexNormals();
  frontPoints.needsUpdate = true;
  surfacePoints.needsUpdate = true;
  front.computeVertexNormals();
  surface.computeVertexNormals();
}

function updateCrest(crest: THREE.BufferGeometry, lift: number, disturbance: number) {
  const points = crest.getAttribute('position');
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = THREE.MathUtils.clamp(disturbance + (t - .5) * 1.42, -halfWidth, halfWidth);
    const width = .035 * Math.sin(Math.PI * t);
    const height = waterHeight(x, lift, disturbance) + .014;
    points.setXYZ(i * 2, x, height, .73);
    points.setXYZ(i * 2 + 1, x, height, .73 - width);
  }
  points.needsUpdate = true;
}

export function FaultModel({lift, disturbance}: {lift: number; disturbance: number}) {
  const {lower, upper, front, surface, caps, crest} = useMemo(() => {
    const caps = new THREE.BufferGeometry();
    caps.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24), 3).setUsage(THREE.DynamicDrawUsage));
    caps.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6]);
    return {
      lower: createRock(false),
      upper: createRock(true),
      front: waterSkin(columns, 2),
      surface: waterSkin(columns, 2),
      caps,
      crest: waterSkin(24, 2),
    };
  }, []);
  useEffect(() => () => {
    for (const geometry of [lower, upper, front, surface, caps, crest]) geometry.dispose();
  }, [lower, upper, front, surface, caps, crest]);

  updateWater(front, surface, caps, lift, disturbance);
  if (lift > .08) updateCrest(crest, lift, disturbance);

  return <>
    <mesh geometry={lower}><meshStandardMaterial vertexColors roughness={1}/></mesh>
    <mesh geometry={upper} position={[faultSlope * lift, lift, 0]}><meshStandardMaterial vertexColors roughness={1}/></mesh>
    <mesh position={[faultX((rockBase + seaFloor) / 2), (rockBase + seaFloor) / 2, halfDepth + .008]}
      rotation-z={Math.atan(-faultSlope)} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <boxGeometry args={[.026, (seaFloor - rockBase) * Math.hypot(1, faultSlope), .012]}/>
      <meshBasicMaterial color="#392c34"/>
    </mesh>
    <mesh geometry={front} frustumCulled={false}>
      <meshStandardMaterial color="#278cae" emissive="#176787" emissiveIntensity={.16} side={THREE.DoubleSide} roughness={.82}/>
    </mesh>
    <mesh geometry={caps} frustumCulled={false}>
      <meshStandardMaterial color="#226d8c" side={THREE.DoubleSide} roughness={.82}/>
    </mesh>
    <mesh geometry={surface} frustumCulled={false}>
      <meshStandardMaterial color="#57c8ce" emissive="#1c7a82" emissiveIntensity={.14} side={THREE.DoubleSide} roughness={.67}/>
    </mesh>
    {lift > .08 && <mesh geometry={crest} frustumCulled={false} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <meshBasicMaterial color="#c1f7ed" side={THREE.DoubleSide}/>
    </mesh>}
  </>;
}


