import React, { useMemo } from 'react';
import * as THREE from 'three';
import { twoTone } from '../upstream/templates/bridge/shade';
import { Pen, fxContact } from '../upstream/templates/bridge/toon';
import { NOINK } from '../bridge-recreation/ink';
import { blobMaterial } from '../upstream/templates/bridge/cardshade';

const RED = '#c8202c';
const RED_DARK = '#8d1119';
const GLASS = '#1d2733';
const CHROME = '#ccd4de';
const TIRE = '#14161b';

const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));

function sideBody() {
  const s = new THREE.Shape();
  s.moveTo(-2.12, 0.36);
  s.lineTo(-2.18, 0.58);
  s.lineTo(-1.86, 0.68);
  s.lineTo(-1.1, 0.75);
  s.lineTo(-0.5, 0.79);
  s.lineTo(0.98, 0.79);
  s.lineTo(1.7, 0.77);
  s.lineTo(2.1, 0.7);
  s.lineTo(2.16, 0.48);
  s.lineTo(2.08, 0.36);
  s.lineTo(1.0, 0.34);
  s.lineTo(-1.0, 0.34);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.72, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.09, bevelSegments: 2, steps: 1 });
  g.translate(0, 0, -0.86);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function sideCabin() {
  const s = new THREE.Shape();
  s.moveTo(-0.6, 0.77);
  s.lineTo(-0.2, 1.1);
  s.lineTo(0.5, 1.13);
  s.lineTo(0.98, 0.78);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.56, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1, steps: 1 });
  g.translate(0, 0, -0.78);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function roofPlate() {
  const s = new THREE.Shape();
  s.moveTo(-0.24, 1.09);
  s.lineTo(0.52, 1.12);
  s.lineTo(0.48, 1.17);
  s.lineTo(-0.28, 1.14);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1.64, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 1, steps: 1 });
  g.translate(0, 0, -0.82);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function useContact() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    fxContact(new Pen(c.getContext('2d')!), '#2a2028');
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

export function Car({
  position,
  rotation = [0, 0, 0],
  roll = 0,
  lights = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  roll?: number;
  lights?: number;
}) {
  const geo = useMemo(() => ({ body: sideBody(), cabin: sideCabin(), roof: roofPlate() }), []);
  const mat = useMemo(
    () => ({
      body: lam({ color: RED }),
      bodyDark: lam({ color: RED_DARK }),
      glass: new THREE.MeshPhongMaterial({ color: GLASS, shininess: 40, specular: new THREE.Color(0.05, 0.07, 0.1) }),
      chrome: lam({ color: CHROME }),
      tire: lam({ color: TIRE }),
      grille: lam({ color: '#141821' }),
      head: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.2, 1.5), toneMapped: false, fog: false }),
      tail: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.14, 0.1), toneMapped: false, fog: false }),
      plate: lam({ color: '#f2e9cf' }),
      badge: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, 0.2), toneMapped: false, fog: false }),
    }),
    []
  );
  const contact = useContact();
  const shadowMat = useMemo(() => blobMaterial(contact), [contact]);
  const wheel = useMemo(() => new THREE.CylinderGeometry(0.36, 0.36, 0.26, 20), []);
  const hub = useMemo(() => new THREE.CylinderGeometry(0.2, 0.2, 0.28, 18), []);
  const bolt = useMemo(() => new THREE.BoxGeometry(0.26, 0.02, 0.07), []);

  const wheels: [number, number][] = [
    [-0.86, -1.34],
    [0.86, -1.34],
    [-0.86, 1.38],
    [0.86, 1.38],
  ];

  return (
    <group position={position} rotation={rotation}>
      {/* ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} renderOrder={1}>
        <planeGeometry args={[2.9, 5.4]} />
        <primitive object={shadowMat} attach="material" />
      </mesh>

      <mesh geometry={geo.body} material={mat.body} castShadow receiveShadow />
      <mesh geometry={geo.cabin} material={mat.glass} castShadow />
      <mesh geometry={geo.roof} material={mat.bodyDark} castShadow />

      {/* beltline chrome */}
      <mesh position={[0, 0.795, 0.2]} material={mat.chrome}>
        <boxGeometry args={[1.92, 0.03, 1.16]} />
      </mesh>

      {/* nose grille + splitter */}
      <mesh position={[0, 0.46, -2.16]} material={mat.grille}>
        <boxGeometry args={[1.24, 0.26, 0.1]} />
      </mesh>
      <mesh position={[0, 0.34, -2.18]} material={mat.bodyDark}>
        <boxGeometry args={[1.9, 0.1, 0.16]} />
      </mesh>
      {[-0.66, 0.66].map((x, i) => (
        <group key={i} position={[x, 0.6, -2.14]}>
          <mesh material={mat.chrome}>
            <boxGeometry args={[0.42, 0.16, 0.1]} />
          </mesh>
          <mesh position={[0, 0, -0.03]} material={mat.head} onUpdate={(m) => m.layers.set(NOINK)}>
            <boxGeometry args={[0.32, 0.09, 0.06]} />
          </mesh>
        </group>
      ))}

      {/* yellow nose badge */}
      <mesh position={[0, 0.62, -2.19]} material={mat.badge}>
        <boxGeometry args={[0.11, 0.13, 0.02]} />
      </mesh>

      {/* side vents */}
      {[-0.965, 0.965].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.6]} material={mat.grille}>
          <boxGeometry args={[0.02, 0.16, 0.62]} />
        </mesh>
      ))}

      {/* tail */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.62, 2.16]} material={mat.tail} onUpdate={(m) => m.layers.set(NOINK)}>
          <boxGeometry args={[0.5, 0.13, 0.06]} />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 2.17]} material={mat.plate}>
        <boxGeometry args={[0.52, 0.18, 0.03]} />
      </mesh>
      {/* ducktail */}
      <mesh position={[0, 0.85, 1.88]} rotation={[0.14, 0, 0]} material={mat.bodyDark} castShadow>
        <boxGeometry args={[1.7, 0.06, 0.4]} />
      </mesh>

      {/* mirrors */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 0.9, -0.4]} material={mat.body} castShadow>
          <boxGeometry args={[0.16, 0.09, 0.18]} />
        </mesh>
      ))}

      {/* wheels */}
      {wheels.map(([x, z], i) => (
        <group key={i} position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh geometry={wheel} material={mat.tire} castShadow />
          <group rotation={[0, roll, 0]}>
            <mesh geometry={hub} material={mat.chrome} />
            {[0, 1, 2, 3, 4].map((k) => (
              <mesh
                key={k}
                geometry={bolt}
                material={mat.grille}
                position={[0.15, 0.155, 0]}
                rotation={[0, (k * Math.PI * 2) / 5, 0]}
              />
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}
