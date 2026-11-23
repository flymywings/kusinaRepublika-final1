import React, { useMemo } from 'react';
import * as THREE from 'three';
import { makeLabelMap, makeScuffedMap, surfaceMaterial } from './StoreMaterials';

type Vec3 = [number, number, number];
type Place = { position: Vec3; yaw?: number };
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 20, 1);
const unitBottle = new THREE.CylinderGeometry(.72, 1, 1, 16, 1);
const unitSnack = new THREE.SphereGeometry(1, 16, 12);

function Box({ p, s, m, cast = true }: { p: Vec3; s: Vec3; m: THREE.Material; cast?: boolean }) {
  return <mesh geometry={boxGeo} position={p} scale={s} material={m} castShadow={cast} receiveShadow />;
}
function Cylinder({ p, r, h, m, rotation }: { p: Vec3; r: number; h: number; m: THREE.Material; rotation?: Vec3 }) {
  return <mesh geometry={unitCylinder} position={p} scale={[r, h, r]} rotation={rotation} material={m} castShadow />;
}
function instanceSet(geometry: THREE.BufferGeometry, material: THREE.Material, items: Array<{p: Vec3; s: Vec3; yaw?: number}>) {
  const inst = new THREE.InstancedMesh(geometry, material, items.length);
  const dummy = new THREE.Object3D();
  items.forEach((it, i) => {
    dummy.position.set(...it.p); dummy.scale.set(...it.s); dummy.rotation.set(0, it.yaw ?? 0, 0);
    dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
  });
  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true; inst.receiveShadow = true;
  return inst;
}

function stockGroup(width: number, levels: number, baseY: number, materials: {
  can: THREE.Material; carton: THREE.Material; bottle: THREE.Material; neck: THREE.Material; cap: THREE.Material; snack: THREE.Material;
}, rowStep = .37, centerOffset = .15) {
  const cans: Array<{p: Vec3; s: Vec3}> = [];
  const cartons: Array<{p: Vec3; s: Vec3; yaw?: number}> = [];
  const bottles: Array<{p: Vec3; s: Vec3}> = [];
  const snacks: Array<{p: Vec3; s: Vec3; yaw?: number}> = [];
  for (let row = 0; row < levels; row++) {
    const y = baseY + row * rowStep + centerOffset;
    const count = Math.max(5, Math.floor(width / .20));
    const start = -width / 2 + .13;
    for (let i = 0; i < count; i++) {
      const x = start + i * ((width - .26) / Math.max(1, count - 1));
      if (row % 4 === 0) cans.push({ p: [x, y, .12], s: [.082, .20, .082] });
      else if (row % 4 === 1) cartons.push({ p: [x, y, .12], s: [.13, .22, .115], yaw: ((i % 3) - 1) * .035 });
      else if (row % 4 === 2) bottles.push({ p: [x, y, .12], s: [.075, .22, .075] });
      else snacks.push({ p: [x, y, .12], s: [.083, .105, .034], yaw: ((i % 3) - 1) * .045 });
    }
  }
  const group = new THREE.Group();
  if (cans.length) group.add(instanceSet(unitCylinder, materials.can, cans));
  if (cartons.length) group.add(instanceSet(boxGeo, materials.carton, cartons));
  if (snacks.length) group.add(instanceSet(unitSnack, materials.snack, snacks));
  if (bottles.length) {
    group.add(instanceSet(unitBottle, materials.bottle, bottles));
    group.add(instanceSet(unitCylinder, materials.neck, bottles.map(v => ({p: [v.p[0], v.p[1] + .135, v.p[2]] as Vec3, s: [.031, .055, .031]}))));
    group.add(instanceSet(unitCylinder, materials.cap, bottles.map(v => ({p: [v.p[0], v.p[1] + .17, v.p[2]] as Vec3, s: [.033, .018, .033]}))));
  }
  return group;
}

function makeStockMaterials() {
  const canMap = makeLabelMap('SODA', '#bd553f');
  const boxMap = makeLabelMap('PANTRY', '#557d78');
  const bottleMap = makeLabelMap('FRESH', '#d9a43e');
  const snackMap = makeLabelMap('CRISP', '#ba704b');
  return {
    can: new THREE.MeshStandardMaterial({ color: '#cf6250', map: canMap, roughness: .34, metalness: .35 }),
    carton: new THREE.MeshStandardMaterial({ color: '#e2bd75', map: boxMap, roughness: .78 }),
    bottle: new THREE.MeshStandardMaterial({ color: '#54a18b', map: bottleMap, roughness: .32, metalness: .04 }),
    neck: new THREE.MeshStandardMaterial({ color: '#d4b168', roughness: .3 }),
    cap: new THREE.MeshStandardMaterial({ color: '#e5d6a9', roughness: .3 }),
    snack: new THREE.MeshStandardMaterial({ color: '#d98c5d', map: snackMap, roughness: .58 }),
  };
}

export function Shelf({ position, yaw = 0, length = 2.3 }: Place & { length?: number }) {
  const mats = useMemo(() => {
    const wear = makeScuffedMap('#62656a', 13);
    return {
      frame: surfaceMaterial('#363b40', .58, wear), shelf: surfaceMaterial('#a8aa9e', .52), rail: surfaceMaterial('#e1ded3', .42),
      price: surfaceMaterial('#f2d77b', .58), ...makeStockMaterials(),
    };
  }, []);
  const stock = useMemo(() => stockGroup(length - .12, 4, .30, mats, .38, .15), [length, mats]);
  const levels = [.30, .68, 1.06, 1.44];
  return <group position={position} rotation-y={yaw}>
    <Box p={[0, .055, 0]} s={[length, .11, .55]} m={mats.frame}/>
    <Box p={[0, .91, -.255]} s={[length, 1.68, .035]} m={mats.frame}/>
    {[-length / 2 + .045, length / 2 - .045].map(x => <React.Fragment key={x}>
      <Box p={[x, .91, .255]} s={[.07, 1.72, .055]} m={mats.frame}/>
      <Box p={[x, .91, -.245]} s={[.055, 1.72, .07]} m={mats.frame}/>
    </React.Fragment>)}
    {levels.map((y, i) => <React.Fragment key={y}>
      <Box p={[0, y, .04]} s={[length - .06, .065, .47]} m={mats.shelf}/>
      <Box p={[0, y + .045, .273]} s={[length - .08, .035, .018]} m={mats.rail}/>
      <Box p={[0, y + .018, .286]} s={[length - .10, .032, .008]} m={mats.price}/>
    </React.Fragment>)}
    <primitive object={stock}/>
  </group>;
}

export function FridgeBank({ position, yaw = 0, width = 3.6 }: Place & { width?: number }) {
  const mats = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: '#d4d9d8', roughness: .42, metalness: .43, map: makeScuffedMap('#d4d9d8', 27) }),
    dark: new THREE.MeshStandardMaterial({ color: '#293238', roughness: .44, metalness: .25 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#b9dce0', roughness: .12, metalness: .05, transmission: .22, transparent: true, opacity: .40, depthWrite: false }),
    shelf: new THREE.MeshStandardMaterial({ color: '#aab4b3', roughness: .32, metalness: .34 }),
    strip: new THREE.MeshStandardMaterial({ color: '#fff4ce', emissive: '#ffdc8a', emissiveIntensity: 1.65, roughness: .25 }),
    handle: new THREE.MeshStandardMaterial({ color: '#59656a', metalness: .72, roughness: .26 }),
    ...makeStockMaterials(),
  }), []);
  const doorW = (width - .18) / 3;
  const fridgeStock = useMemo(() => stockGroup(width - .28, 4, .28, mats, .48, .15), [width, mats]);
  return <group position={position} rotation-y={yaw}>
    {/* Open-front insulated shell: sides/top/bottom and a set-back dark liner leave a real stock cavity. */}
    <Box p={[-width / 2 + .05, 1.16, 0]} s={[.10, 2.32, .75]} m={mats.body}/>
    <Box p={[width / 2 - .05, 1.16, 0]} s={[.10, 2.32, .75]} m={mats.body}/>
    <Box p={[0, 2.275, 0]} s={[width, .09, .75]} m={mats.body}/>
    <Box p={[0, .045, 0]} s={[width, .09, .75]} m={mats.body}/>
    <Box p={[0, 1.16, -.331]} s={[width - .20, 2.13, .035]} m={mats.dark}/>
    {[-1, 0, 1].map(i => {
      const x = i * (doorW + .015);
      return <React.Fragment key={i}>
        <Box p={[x, 1.19, .405]} s={[doorW, 2.10, .027]} m={mats.glass} cast={false}/>
        <Box p={[x - doorW / 2 + .035, 1.19, .436]} s={[.045, 2.06, .045]} m={mats.body}/>
        <Box p={[x + doorW / 2 - .052, 1.20, .444]} s={[.025, .59, .035]} m={mats.handle}/>
        <Box p={[x, .28, .22]} s={[doorW - .08, .032, .37]} m={mats.shelf}/>
        <Box p={[x, .76, .22]} s={[doorW - .08, .032, .37]} m={mats.shelf}/>
        <Box p={[x, 1.24, .22]} s={[doorW - .08, .032, .37]} m={mats.shelf}/>
        <Box p={[x, 1.72, .22]} s={[doorW - .08, .032, .37]} m={mats.shelf}/>
        <Box p={[x - doorW / 2 + .08, 1.20, .23]} s={[.018, 1.91, .024]} m={mats.strip}/>
      </React.Fragment>;
    })}
    <Box p={[0, .22, .43]} s={[width - .1, .055, .035]} m={mats.dark}/>
    <Box p={[0, 2.23, .40]} s={[width - .08, .075, .03]} m={mats.dark}/>
    <primitive object={fridgeStock}/>
    {[-1.25, 0, 1.25].map(x => <Box key={x} p={[x, .105, -.01]} s={[.34, .21, .58]} m={mats.dark}/>)}
  </group>;
}

export function Checkout({ position, yaw = 0 }: Place) {
  const mats = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: '#577e78', roughness: .66, map: makeScuffedMap('#577e78', 44) }),
    edge: new THREE.MeshStandardMaterial({ color: '#313a3b', metalness: .35, roughness: .48 }),
    top: new THREE.MeshStandardMaterial({ color: '#e2ded1', roughness: .38 }),
    glass: new THREE.MeshStandardMaterial({ color: '#79c9c4', emissive: '#39a99e', emissiveIntensity: .62, roughness: .24 }),
    screen: new THREE.MeshStandardMaterial({ color: '#1c3735', emissive: '#183f38', emissiveIntensity: .6, roughness: .22 }),
    paper: new THREE.MeshStandardMaterial({ color: '#faf0d8', roughness: .8 }),
    label: new THREE.MeshStandardMaterial({ map: makeLabelMap('TOTAL', '#315955'), roughness: .7 }),
  }), []);
  return <group position={position} rotation-y={yaw}>
    <Box p={[0, .45, 0]} s={[2.1, .90, .8]} m={mats.body}/>
    <Box p={[0, .93, 0]} s={[2.18, .04, .86]} m={mats.edge}/>
    <Box p={[-.48, .949, .15]} s={[.73, .012, .48]} m={mats.top}/>
    <Box p={[-.48, .958, .15]} s={[.23, .012, .28]} m={mats.glass}/>
    <Box p={[.64, .949, -.09]} s={[.42, .012, .30]} m={mats.edge}/>
    <Box p={[.64, .958, -.09]} s={[.34, .012, .22]} m={mats.glass}/>
    <group position={[-.66, 1.04, -.23]} rotation-x={-.18}>
      <Box p={[0, .18, 0]} s={[.34, .36, .06]} m={mats.edge}/>
      <Box p={[0, .19, .034]} s={[.29, .27, .012]} m={mats.screen}/>
      <mesh geometry={boxGeo} position={[0, .19, .041]} scale={[.24, .18, .002]} material={mats.label}/>
    </group>
    <Cylinder p={[.91, 1.055, -.19]} r={.073} h={.16} m={mats.paper}/>
    <Cylinder p={[.91, 1.14, -.19]} r={.074} h={.018} m={mats.top}/>
    <Box p={[0, .17, -.25]} s={[1.88, .12, .035]} m={mats.edge}/>
  </group>;
}

export function Crates({ position, yaw = 0 }: Place) {
  const mats = useMemo(() => ({
    red: surfaceMaterial('#bf5144', .73), blue: surfaceMaterial('#427987', .74), yellow: surfaceMaterial('#d6a345', .72),
    dark: surfaceMaterial('#30383b', .7), ...makeStockMaterials(),
  }), []);
  const basket = (x: number, z: number, color: THREE.Material, shift = 0) => <group key={`${x}-${z}`} position={[x, shift, z]}>
    <Box p={[0, .20, 0]} s={[.74, .10, .58]} m={color}/>
    {[-.34, .34].map(a => <Box key={`x${a}`} p={[a, .36, 0]} s={[.065, .34, .58]} m={color}/>)}
    {[-.25, .25].map(a => <Box key={`z${a}`} p={[0, .36, a]} s={[.74, .34, .065]} m={color}/>)}
    {[-.18, 0, .18].map(a => <React.Fragment key={`hole${a}`}>
      <Box p={[a, .36, .294]} s={[.09, .14, .008]} m={mats.dark}/>
      <Box p={[a, .36, -.294]} s={[.09, .14, .008]} m={mats.dark}/>
    </React.Fragment>)}
    <Cylinder p={[-.18, .48, 0]} r={.065} h={.22} m={mats.can}/>
    <Cylinder p={[.04, .48, 0]} r={.058} h={.20} m={mats.bottle}/>
    <Cylinder p={[.04, .59, 0]} r={.025} h={.04} m={mats.cap}/>
  </group>;
  return <group position={position} rotation-y={yaw}>
    {basket(-.39, -.30, mats.red)}{basket(.39, -.30, mats.blue)}
    {basket(0, .31, mats.yellow, .54)}
  </group>;
}

export function VendingMachine({ position, yaw = 0 }: Place) {
  const mats = useMemo(() => ({
    shell: new THREE.MeshStandardMaterial({ color: '#b94f48', roughness: .46, metalness: .22, map: makeScuffedMap('#b94f48', 82) }),
    dark: new THREE.MeshStandardMaterial({ color: '#262d32', roughness: .32, metalness: .24 }),
    glass: new THREE.MeshStandardMaterial({ color: '#a6d4d1', roughness: .16, metalness: .12, transparent: true, opacity: .60, depthWrite: false }),
    glow: new THREE.MeshStandardMaterial({ color: '#fff1c5', emissive: '#f5bd56', emissiveIntensity: 1.1, roughness: .36 }),
    button: new THREE.MeshStandardMaterial({ color: '#f1dfaa', emissive: '#d9a347', emissiveIntensity: .24 }),
    ...makeStockMaterials(),
  }), []);
  const items = useMemo(() => stockGroup(.55, 4, .25, mats), [mats]);
  return <group position={position} rotation-y={yaw}>
    <Box p={[0, .925, 0]} s={[.9, 1.85, .65]} m={mats.shell}/>
    <Box p={[-.105, 1.05, .337]} s={[.58, 1.34, .025]} m={mats.dark}/>
    <Box p={[-.105, 1.05, .354]} s={[.54, 1.28, .012]} m={mats.glass} cast={false}/>
    <primitive object={items}/>
    <Box p={[.30, 1.15, .341]} s={[.18, .30, .025]} m={mats.dark}/>
    {[.20, .45, .70, .95, 1.20].map(y => <React.Fragment key={y}>
      <Cylinder p={[.29, y, .365]} r={.023} h={.018} m={mats.button} rotation={[Math.PI / 2, 0, 0]}/>
      <Box p={[-.10, y - .155, .355]} s={[.52, .012, .014]} m={mats.glow}/>
    </React.Fragment>)}
    <Box p={[.08, .37, .354]} s={[.44, .17, .035]} m={mats.dark}/>
    <Box p={[.08, .385, .375]} s={[.34, .09, .008]} m={mats.glow}/>
    <Box p={[0, .04, 0]} s={[.78, .08, .53]} m={mats.dark}/>
  </group>;
}

export function Sign({ text, width = 1.2, height = .35, bg = '#263b3b', color = '#f5e8c8' }: {
  text: string; width?: number; height?: number; bg?: string; color?: string;
}) {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d0ad69'; ctx.lineWidth = 12; ctx.strokeRect(8, 8, 1008, 240);
    ctx.fillStyle = color; ctx.font = 'bold 112px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 28).toUpperCase(), 512, 129, 940);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
    return new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false });
  }, [text, bg, color]);
  return <mesh scale={[width, height, 1]} material={material}><planeGeometry args={[1, 1]} /></mesh>;
}
