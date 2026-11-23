import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {NOINK} from '../upstream/templates/bridge/ink';

const width = 3.72;
const depth = 1.05;
const bed = (x: number) => .1 - .31 * x;
const base = -2.6;
const layerStops = [0, .19, .4, .61, .81, 1];
const layerColors = ['#79573d', '#9d614d', '#8d9fa9', '#be8051', '#e4b67a'];
const layerY = (x: number, i: number) => THREE.MathUtils.lerp(base, bed(x), layerStops[i]);
type Point = [number, number, number];

function quad() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return geometry;
}

function setQuad(geometry: THREE.BufferGeometry, a: Point, b: Point, c: Point, d: Point) {
  const points = geometry.getAttribute('position');
  [a, b, c, d].forEach(([x, y, z], index) => points.setXYZ(index, x, y, z));
  points.needsUpdate = true;
  geometry.computeVertexNormals();
}

function createBed() {
  const positions: number[] = [];
  const colors: number[] = [];
  function face(a: Point, b: Point, c: Point, d: Point, color: string) {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    const paint = new THREE.Color(color);
    for (let i = 0; i < 6; i++) colors.push(paint.r, paint.g, paint.b);
  }

  layerColors.forEach((color, i) => {
    const a = layerY(-width, i), b = layerY(width, i);
    const c = layerY(width, i + 1), d = layerY(-width, i + 1);
    face([-width, a, depth], [width, b, depth], [width, c, depth], [-width, d, depth], color);
    face([width, b, -depth], [-width, a, -depth], [-width, d, -depth], [width, c, -depth], color);
    face([width, b, depth], [width, b, -depth], [width, c, -depth], [width, c, depth], color);
    face([-width, a, -depth], [-width, a, depth], [-width, d, depth], [-width, d, -depth], color);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function ShallowsModel({drawdown}: {drawdown: number}) {
  const parts = useMemo(() => ({
    rock: createBed(), dry: quad(), wet: quad(), front: quad(), water: quad(), end: quad(), foam: quad(),
  }), []);
  useEffect(() => () => Object.values(parts).forEach(geometry => geometry.dispose()), [parts]);

  const level = THREE.MathUtils.lerp(.52, -.33, THREE.MathUtils.clamp(drawdown, 0, 1));
  const start = (.1 - .52) / .31;
  const shore = (.1 - level) / .31;
  setQuad(parts.dry, [-width, bed(-width), depth], [start, bed(start), depth],
    [start, bed(start), -depth], [-width, bed(-width), -depth]);
  setQuad(parts.wet, [start, bed(start), depth], [shore, bed(shore), depth],
    [shore, bed(shore), -depth], [start, bed(start), -depth]);
  setQuad(parts.front, [shore, level, depth], [width, bed(width), depth],
    [width, level, depth], [shore, level, depth]);
  setQuad(parts.water, [shore, level, depth], [width, level, depth], [width, level, -depth], [shore, level, -depth]);
  setQuad(parts.end, [width, bed(width), depth], [width, bed(width), -depth],
    [width, level, -depth], [width, level, depth]);
  setQuad(parts.foam, [shore+.01, level+.011, depth], [shore+.08, level+.011, depth],
    [shore+.055, level+.011, -depth], [shore+.01, level+.011, -depth]);

  return <>
    <mesh geometry={parts.rock}><meshStandardMaterial vertexColors roughness={1}/></mesh>
    <mesh geometry={parts.dry} frustumCulled={false}>
      <meshStandardMaterial color="#e8c585" roughness={1}/>
    </mesh>
    {drawdown > .001 && <mesh geometry={parts.wet} frustumCulled={false}>
      <meshStandardMaterial color="#a97c50" roughness={.81}/>
    </mesh>}
    <mesh geometry={parts.front} frustumCulled={false}>
      <meshStandardMaterial color="#278cae" side={THREE.DoubleSide} roughness={.82}/>
    </mesh>
    <mesh geometry={parts.end} frustumCulled={false}>
      <meshStandardMaterial color="#226d8c" side={THREE.DoubleSide} roughness={.82}/>
    </mesh>
    <mesh geometry={parts.water} frustumCulled={false}>
      <meshStandardMaterial color="#57c8ce" side={THREE.DoubleSide} roughness={.67}/>
    </mesh>
    <mesh geometry={parts.foam} frustumCulled={false} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <meshBasicMaterial color="#c1f7ed" side={THREE.DoubleSide}/>
    </mesh>
  </>;
}
