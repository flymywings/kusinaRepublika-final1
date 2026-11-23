import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {beamHD, cloudHD, cobbleHD, ctex, planksHD, rep, roofHD, stoneHD} from '../upstream/templates/bridge/paint';
import {NOINK} from '../upstream/templates/bridge/ink';
import {twoTone} from '../upstream/templates/bridge/shade';
import {mayorFace, mayorHairline, mayorHead} from './mayor-look';
import {BIRD_SEAT, NEST, NOTCH} from './story';

type V3 = [number, number, number];
type Place = {position: V3};
type Painted = THREE.MeshLambertMaterial | THREE.MeshPhongMaterial;
const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const mats = new Map<string, Painted>();

function color(hex: string) {
  let material = mats.get(hex);
  if (!material) {
    material = twoTone(new THREE.MeshLambertMaterial({color: hex}));
    mats.set(hex, material);
  }
  return material;
}

function painted(id: string, map: () => THREE.Texture) {
  let material = mats.get(id);
  if (!material) {
    material = twoTone(new THREE.MeshLambertMaterial({map: map()}));
    mats.set(id, material);
  }
  return material;
}

function gilded(hex: string, shine = '#ffd793') {
  const id = `gold-${hex}-${shine}`;
  let material = mats.get(id);
  if (!material) {
    material = twoTone(new THREE.MeshPhongMaterial({color: hex, specular: shine, shininess: 24}));
    mats.set(id, material);
  }
  return material;
}

const timber = () => painted('village-timber', beamHD);
const tableWood = () => painted('village-plank', planksHD);
const pedestal = () => painted('village-stone', () => stoneHD('mayor-plinth', ['#c9bdaa', '#b5a999', '#dfcfb9', '#c0b3a1'], '#817a74'));

/** Merge persistent details by paint and shadow behavior before handing them to the ink pass. */
class SetPieces {
  private pieces = new Map<THREE.Material, {geometry: THREE.BufferGeometry[]; shadow: boolean}>();
  offset = new THREE.Matrix4();

  at(x: number, z: number, yaw = 0) {
    this.offset.makeRotationY(yaw).setPosition(x, 0, z);
  }

  add(geometry: THREE.BufferGeometry, position: V3, material: THREE.Material, euler: V3 = [0, 0, 0], shadow = true) {
    const pose = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...euler)), new THREE.Vector3(1, 1, 1));
    this.addMatrix(geometry, pose, material, shadow);
  }

  private addMatrix(geometry: THREE.BufferGeometry, pose: THREE.Matrix4, material: THREE.Material, shadow = true) {
    const ready = geometry.index ? geometry.toNonIndexed() : geometry;
    if (ready !== geometry) geometry.dispose();
    ready.clearGroups();
    ready.applyMatrix4(pose.premultiply(this.offset));
    const batch = this.pieces.get(material) ?? {geometry: [], shadow};
    batch.geometry.push(ready);
    batch.shadow ||= shadow;
    this.pieces.set(material, batch);
  }

  box(position: V3, size: V3, material: THREE.Material, rotation: V3 = [0, 0, 0]) {
    this.add(new THREE.BoxGeometry(...size), position, material, rotation);
  }

  beam(a: V3, b: V3, width: number, material: THREE.Material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);
    const pose = new THREE.Matrix4().compose(start.lerp(end, .5), new THREE.Quaternion().setFromUnitVectors(UP, delta.clone().normalize()), new THREE.Vector3(1, 1, 1));
    this.addMatrix(new THREE.BoxGeometry(width, delta.length(), width), pose, material);
  }

  quad(a: V3, b: V3, c: V3, d: V3, material: THREE.Material, repeat = 1) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, repeat, 0, repeat, 1, 0, 0, repeat, 1, 0, 1], 2));
    geometry.computeVertexNormals();
    this.add(geometry, [0, 0, 0], material);
  }

  build() {
    const root = new THREE.Group();
    for (const [material, {geometry, shadow}] of this.pieces) {
      const joined = mergeGeometries(geometry);
      if (!joined) throw new Error('Could not batch the village geometry');
      const mesh = new THREE.Mesh(joined, material);
      mesh.receiveShadow = true;
      mesh.castShadow = shadow;
      root.add(mesh);
      for (const fragment of geometry) fragment.dispose();
    }
    return root;
  }
}

function facadePaint(tint: string) {
  return painted(`facade-${tint}`, () => ctex(`mayor-limewash-${tint}`, 256, 256, (g, rng) => {
    g.fillStyle = tint;
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(255,234,206,.18)';
    for (let i = 0; i < 20; i++) g.fillRect(rng() * 256, rng() * 256, 14 + rng() * 35, 5 + rng() * 15);
    for (let i = 0; i < 95; i++) {
      g.fillStyle = i % 2 ? 'rgba(120,95,79,.085)' : 'rgba(255,244,222,.24)';
      g.fillRect(rng() * 256, rng() * 256, 1 + rng() * 3, 1 + rng() * 3);
    }
  }));
}

function awningPaint(tint: string) {
  return painted(`awning-${tint}`, () => ctex(`mayor-striped-${tint}`, 192, 96, (g) => {
    g.fillStyle = '#f2dfb9';
    g.fillRect(0, 0, 192, 96);
    g.fillStyle = tint;
    for (let x = 0; x < 192; x += 48) g.fillRect(x, 0, 25, 96);
    g.fillStyle = 'rgba(255,249,222,.24)';
    g.fillRect(0, 0, 192, 5);
    g.fillStyle = 'rgba(83,55,45,.21)';
    g.fillRect(0, 91, 192, 5);
  }));
}

function signPaint(word: string) {
  return painted(`village-sign-${word}`, () => ctex(`mayor-sign-${word}`, 256, 76, (g) => {
    g.fillStyle = '#34535a';
    g.fillRect(0, 0, 256, 76);
    g.strokeStyle = '#e8bc73';
    g.lineWidth = 3;
    g.strokeRect(7, 7, 242, 62);
    g.fillStyle = '#f5dcaa';
    g.font = 'bold 33px Georgia';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(word, 128, 39, 223);
  }));
}

function windowPiece(set: SetPieces, x: number, y: number, z: number, shutter: string, open = false) {
  const frame = color('#543f3c');
  const glass = color(open ? '#343e4f' : '#83aab5');
  const trim = color('#e7d4af');
  set.box([x, y, z], [.69, .84, .075], frame);
  set.box([x, y + .015, z + .041], [.53, .65, .02], glass);
  if (!open) {
    set.box([x, y + .015, z + .058], [.034, .65, .02], trim);
    set.box([x, y + .015, z + .059], [.52, .033, .02], trim);
    set.box([x - .16, y + .19, z + .054], [.16, .028, .014], color('#c7dde0'), [0, 0, -.45]);
  }
  for (const side of [-1, 1]) {
    const sx = x + side * .46;
    set.box([sx, y, z + .045], [.22, .74, .07], color(shutter), [0, side * .19, 0]);
    set.box([sx, y - .19, z + .083], [.20, .032, .016], frame);
    set.box([sx, y + .19, z + .083], [.20, .032, .016], frame);
  }
  set.box([x, y - .43, z + .11], [.80, .09, .20], trim);
}

function doorPiece(set: SetPieces, x: number, z: number, open: boolean, tint: string) {
  const post = color('#67504a');
  const height = 1.86;
  const shape = new THREE.Shape();
  shape.moveTo(-.52, 0); shape.lineTo(.52, 0); shape.lineTo(.52, 1.40);
  shape.quadraticCurveTo(.43, height, 0, height); shape.quadraticCurveTo(-.43, height, -.52, 1.40); shape.closePath();
  set.add(new THREE.ShapeGeometry(shape, 8), [x, .01, z + .045], post);
  set.add(new THREE.ShapeGeometry(shape, 8).scale(.83, .95, 1), [x, .01, z + .061], color(open ? '#302b34' : tint));
  set.box([x, .045, z + .15], [1.17, .09, .31], color('#bbac97'));
  if (!open) {
    for (const dx of [-.29, -.10, .11, .30]) set.box([x + dx, .77, z + .077], [.019, 1.47, .018], color('#614947'));
    set.add(new THREE.SphereGeometry(.047, 8, 6), [x + .25, .89, z + .092], gilded('#d0a260'));
  }
}

function awning(set: SetPieces, x: number, y: number, z: number, width: number, tint: string, depth: number) {
  const half = width / 2;
  const canopy = awningPaint(tint);
  set.quad([x - half, y - .25, z + depth], [x + half, y - .25, z + depth], [x + half, y, z], [x - half, y, z], canopy);
  set.quad([x - half, y - .40, z + depth], [x + half, y - .40, z + depth], [x + half, y - .25, z + depth], [x - half, y - .25, z + depth], canopy);
  for (const side of [-1, 1]) {
    set.beam([x + side * half, y - .27, z + depth], [x + side * half, y - .48, z + .06], .037, timber());
  }
}

type House = {x: number; z: number; w: number; h: number; d: number; wall: string; roof: string; shutter: string; yaw?: number; doorX?: number; open?: boolean; sign?: string; awning?: string; far?: boolean; windowX?: number};

function house(set: SetPieces, data: House) {
  const {x, z, w, h, d, wall, roof, shutter, yaw = 0, far = false, doorX = 0, open = false} = data;
  set.at(x, z, yaw);
  const half = w / 2;
  const ridge = h + w * .34;
  const facade = far ? color(wall) : facadePaint(wall);
  const framing = far ? color('#66544c') : timber();
  const tiles = far ? color(roof) : painted(`village-roof-${roof}`, () => roofHD(roof, roof === '#53627a'));
  set.box([0, h / 2, -d / 2], [w, h, d], facade);
  const gable = new THREE.Shape();
  gable.moveTo(-half, 0); gable.lineTo(half, 0); gable.lineTo(0, ridge - h); gable.closePath();
  set.add(new THREE.ExtrudeGeometry(gable, {depth: d, bevelEnabled: false}), [0, h, -d], facade);
  const e = .15;
  set.quad([-half - e, h - .08, e], [0, ridge + .10, e], [0, ridge + .10, -d - e], [-half - e, h - .08, -d - e], tiles, .78);
  set.quad([0, ridge + .10, e], [half + e, h - .08, e], [half + e, h - .08, -d - e], [0, ridge + .10, -d - e], tiles, .78);
  set.beam([-half - e, h - .09, e], [0, ridge + .10, e], .10, framing);
  set.beam([0, ridge + .10, e], [half + e, h - .09, e], .10, framing);
  set.beam([0, ridge + .105, e], [0, ridge + .105, -d - e], .12, color(roof));
  const chimneyX = w * .23;
  set.box([chimneyX, ridge - .02, -d * .67], [.34, .92, .40], color('#9c6c60'));
  set.box([chimneyX, ridge + .46, -d * .67], [.44, .13, .48], color('#725356'));
  if (far) {
    for (const xx of [-w * .23, w * .23]) set.box([xx, h * .71, .025], [.46, .61, .044], color('#667583'));
    return;
  }
  for (const sx of [-1, 1]) {
    set.box([sx * (half - .055), h * .51, .045], [.12, h * .98, .11], framing);
    set.beam([sx * (half - .10), h * .60, .059], [sx * .39, h * .51, .059], .09, framing);
  }
  set.box([0, h * .51, .050], [w, .13, .12], framing);
  set.box([0, h - .045, .066], [w, .14, .15], framing);
  set.beam([0, h + .04, .05], [0, ridge - .035, .05], .085, framing);
  doorPiece(set, doorX, 0, open, shutter);
  if (w > 2.4) windowPiece(set, doorX + (doorX >= 0 ? -1 : 1) * (w * .25 + .24), 1.08, .05, shutter);
  const upperY = h * .73;
  for (const xx of [-w * .235, w * .235]) windowPiece(set, xx, upperY, .05, shutter, !!data.windowX && xx < 0);
  if (data.sign) set.box([doorX, 2.05, .13], [1.16, .29, .065], signPaint(data.sign));
  if (data.awning) awning(set, 0, 2.39, .09, w - .14, data.awning, .66);
  set.box([0, .10, .065], [w, .13, .13], pedestal());
}

function crate(set: SetPieces, x: number, y: number, z: number, size: number) {
  set.box([x, y + size * .45, z], [size, size * .90, size * .80], tableWood());
  for (const dx of [-.37, .37]) set.box([x + dx * size, y + size * .45, z + size * .41], [.08, size * .91, .065], timber());
  set.beam([x - size * .37, y + .07, z + size * .44], [x + size * .37, y + size * .83, z + size * .44], .07, timber());
}

function barrel(set: SetPieces, x: number, z: number, size: number) {
  const wood = tableWood();
  const hoops = color('#555660');
  const points = [[.29, 0], [.34, .08], [.38, .34], [.38, .46], [.33, .67], [.28, .73]].map(([r, y]) => new THREE.Vector2(r * size, y * size));
  set.add(new THREE.LatheGeometry(points, 12), [x, 0, z], wood);
  set.add(new THREE.CylinderGeometry(.279 * size, .279 * size, .027, 12), [x, .72 * size, z], wood);
  for (const [y, r] of [[.13, .352], [.59, .353]]) set.add(new THREE.CylinderGeometry(r * size, r * size, .041, 12, 1, true), [x, y * size, z], hoops);
}

function flowerBox(set: SetPieces, x: number, y: number, z: number, tint: string) {
  set.box([x, y, z], [.69, .18, .24], tableWood());
  for (let i = 0; i < 5; i++) {
    const dx = -.26 + .13 * i;
    set.add(new THREE.IcosahedronGeometry(.095, 0), [x + dx, y + .13 + .04 * (i % 2), z + .025], color(i % 2 ? '#54766a' : '#679375'));
    set.add(new THREE.IcosahedronGeometry(.055, 0), [x + dx, y + .23 + .05 * (i % 2), z + .061], color(tint));
  }
}

function lantern(set: SetPieces, x: number, y: number, z: number) {
  const metal = color('#49505a');
  set.beam([x, y + .30, z - .28], [x, y + .30, z], .042, metal);
  set.box([x, y, z], [.16, .25, .16], color('#efba70'));
  for (const dx of [-.082, .082]) for (const dz of [-.082, .082]) set.box([x + dx, y, z + dz], [.025, .27, .025], metal);
  set.add(new THREE.ConeGeometry(.15, .13, 4), [x, y + .19, z], metal, [0, Math.PI / 4, 0]);
  set.box([x, y - .15, z], [.21, .043, .21], metal);
}

function table(set: SetPieces) {
  set.at(-3.15, 2.15);
  const wood = tableWood();
  const frame = timber();
  set.box([0, .964, 0], [2.55, .112, 1.05], wood);
  for (const x of [-1.08, 1.08]) for (const z of [-.39, .39]) set.box([x, .46, z], [.135, .92, .14], frame);
  for (const z of [-.42, .42]) set.box([0, .79, z], [2.31, .14, .075], frame);
  for (const x of [-1.08, 1.08]) set.box([x, .46, 0], [.09, .09, .80], frame);
  for (const x of [-1.17, 1.17]) for (const z of [-.40, .40]) set.add(new THREE.CylinderGeometry(.025, .025, .009, 6), [x, 1.024, z], color('#665d55'));
}

function buildSquare() {
  const set = new SetPieces();
  set.add(new THREE.PlaneGeometry(66, 66), [0, 0, -9], painted('village-paving', () => rep(cobbleHD(), 7, 7)), [-Math.PI / 2, 0, 0], false);
  const routeStone = painted('village-edging', () => rep(stoneHD('mayor-curb', ['#c8bda9', '#b6aa98', '#d1c4b4', '#c6bbaf']), 3, 1));
  set.box([0, .056, -4.86], [12.4, .11, .22], routeStone);
  const houses: House[] = [
    {x: -7.32, z: -5.32, w: 3.62, h: 3.66, d: 3.0, wall: '#d6ac81', roof: '#995c56', shutter: '#698986', yaw: .12},
    {x: -2.90, z: -5.94, w: 3.54, h: 4.07, d: 3.23, wall: '#f0d0a1', roof: '#a85f52', shutter: '#567b72', open: true, sign: 'BOULANGERIE', awning: '#b86d55'},
    {x: -.12, z: -6.70, w: 1.98, h: 4.93, d: 3.2, wall: '#d3a183', roof: '#53627a', shutter: '#5e747d', yaw: -.04},
    {x: 2.10, z: -5.84, w: 3.15, h: 3.78, d: 2.92, wall: '#ded1a3', roof: '#53627a', shutter: '#79865d', open: true, sign: 'ÉPICERIE', windowX: 1.36},
    {x: 5.61, z: -5.26, w: 3.61, h: 4.38, d: 3.34, wall: '#c8bda5', roof: '#8c575b', shutter: '#617689', yaw: -.10},
    {x: 8.54, z: -3.04, w: 2.69, h: 3.70, d: 2.92, wall: '#e1b994', roof: '#b86b52', shutter: '#6c8374', yaw: -.53},
    {x: -8.00, z: -.85, w: 3.0, h: 3.36, d: 2.84, wall: '#d4b896', roof: '#666b7f', shutter: '#8b6b62', yaw: .67},
    {x: 7.31, z: 2.00, w: 3.19, h: 4.48, d: 3.2, wall: '#d6c1a3', roof: '#8b5251', shutter: '#57776d', yaw: -.86},
    {x: -11.0, z: -12.8, w: 4.2, h: 5.20, d: 3.7, wall: '#adb0ad', roof: '#867784', shutter: '#607777', far: true},
    {x: -6.31, z: -12.2, w: 3.6, h: 5.52, d: 3.7, wall: '#c9b5ab', roof: '#817280', shutter: '#607777', far: true, yaw: .18},
    {x: -1.51, z: -14.64, w: 3.86, h: 5.95, d: 3.7, wall: '#c6c4b6', roof: '#7e8498', shutter: '#607777', far: true, yaw: -.17},
    {x: 2.81, z: -12.8, w: 3.72, h: 5.67, d: 3.7, wall: '#bab9aa', roof: '#7d7089', shutter: '#607777', far: true, yaw: -.17},
    {x: 9.04, z: -13.31, w: 5.4, h: 5.1, d: 3.7, wall: '#c5bdaf', roof: '#878599', shutter: '#607777', far: true},
  ];
  for (const facade of houses) house(set, facade);

  set.at(5.48, -13.8);
  set.box([0, 3.95, -1.25], [1.67, 7.90, 2.6], color('#c9c4b4'));
  set.box([0, 7.5, -1.25], [1.91, .17, 2.78], color('#a79590'));
  set.add(new THREE.ConeGeometry(1.40, 2.0, 4), [0, 8.91, -1.25], color('#758099'), [0, Math.PI / 4, 0]);
  set.box([0, 6.83, .057], [.59, .93, .15], color('#697283'));
  set.box([0, 9.93, -1.25], [.07, .48, .07], color('#725e69'));
  set.box([0, 10.02, -1.25], [.29, .065, .07], color('#725e69'));

  set.at(0, 0);
  flowerBox(set, -3.73, 2.53, -5.72, '#ba6458');
  flowerBox(set, 2.84, 2.37, -5.61, '#b96d57');
  flowerBox(set, 6.24, 2.73, -5.08, '#d0a35b');
  lantern(set, -1.53, 1.99, -5.58);
  lantern(set, 3.25, 2.00, -5.59);
  crate(set, 3.71, 0, -4.95, .49);
  crate(set, 4.17, 0, -4.93, .42);
  barrel(set, -4.61, -4.35, 1.0);
  barrel(set, 4.23, -3.99, .93);

  set.at(5.31, -.46, -.40);
  awning(set, 0, 2.75, -.56, 2.22, '#6d827b', 1.11);
  for (const x of [-1.02, 1.02]) {
    set.beam([x, 0, .53], [x, 2.51, .53], .105, timber());
    set.beam([x, 0, -.52], [x, 2.75, -.52], .105, timber());
  }
  set.box([0, .93, .05], [2.08, .10, .90], tableWood());
  crate(set, .57, 0, .18, .58);
  barrel(set, -.62, .15, .82);

  table(set);
  return set.build();
}

function relief(points: [number, number][], depth: number, bevel: number) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, steps: 1});
}

const headCenterY = 3.42;
const headWidth = .475;
const headHeight = (NEST[1] - headCenterY - .027) / Math.max(...mayorHead.map(([, y]) => y));
const headDepth = .271;

function facePoint([x, y]: [number, number], depth = headDepth): V3 {
  return [x * headWidth, headCenterY + y * headHeight, depth];
}

function smoothRelief(points: [number, number][], depth: number, bevel: number) {
  const outline = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), true);
  return relief(outline.getPoints(points.length * 5).slice(0, -1).map(({x, y}) => [x, y]), depth, bevel);
}

function sculptedFace(base: SetPieces, gold: Painted, light: Painted, shade: Painted, deep: Painted) {
  base.add(relief(mayorHead.map(([x, y]) => [x * headWidth, y * headHeight]), .45, .027), [0, headCenterY, headDepth - .477], gold);

  // The shared swept fringe is a shallow relief. Insetting its crown keeps the nest seat flat.
  const hair = mayorHairline.map(([x, y]): [number, number] => [x * headWidth * .90, y * headHeight * .96]);
  base.add(smoothRelief(hair, .012, .005), [0, headCenterY, headDepth - .003], shade);
  const [eyeX, eyeY] = mayorFace.eyeRadius;
  for (const [x, y] of mayorFace.eyes) {
    const side = Math.sign(x);
    base.add(new THREE.SphereGeometry(1, 16, 12).scale(eyeX * headWidth, eyeY * headHeight, .026), facePoint([x, y]), light);
    base.add(new THREE.SphereGeometry(1, 12, 9).scale(.031, .035, .012), facePoint([x + .024, y], headDepth + .024), deep);
    const brow = [[x - .145, mayorFace.browY - side * .029], [x, mayorFace.browY + .025], [x + .145, mayorFace.browY + side * .029]] as [number, number][];
    base.add(cord(brow.map(point => facePoint(point, headDepth + .004)), .017), [0, 0, 0], deep);
  }

  const smile = [[-.23, mayorFace.smileY + .031], [0, mayorFace.smileY - .052], [.23, mayorFace.smileY + .051]] as [number, number][];
  base.add(cord(smile.map(point => facePoint(point, headDepth + .003)), .014), [0, 0, 0], deep);
}

function statueModel() {
  const stone = pedestal();
  const gold = gilded('#ce9437');
  const light = gilded('#e2aa4d');
  const shade = gilded('#a7712f');
  const deep = gilded('#84542b', '#c48847');
  const base = new SetPieces();
  for (const [height, size, width] of [[.10, .20, 1.94], [.23, .10, 1.76], [.62, .70, 1.46], [1.03, .12, 1.72], [1.16, .14, 1.88]]) {
    base.box([0, height, 0], [width, size, width * .89], stone);
  }
  base.box([0, .68, .668], [.77, .28, .045], shade);
  base.box([0, .68, .700], [.65, .18, .018], light);
  for (const x of [-.27, .27]) base.add(new THREE.SphereGeometry(.034, 8, 6), [x, .68, .717], deep);
  base.box([0, 1.25, 0], [1.18, .07, .74], shade);
  for (const side of [-1, 1]) {
    base.add(cord([[side * .18, 1.41, .01], [side * .18, 1.65, -.017], [side * .20, 1.93, -.035]], .076), [0, 0, 0], gold);
    base.add(new THREE.SphereGeometry(1, 16, 9).scale(.116, .064, .19), [side * .19, 1.33, .096], shade);
  }
  const coat: [number, number][] = [[0, -.52], [-.32, -.47], [-.45, -.24], [-.45, .16], [-.33, .42], [-.17, .52], [.14, .53], [.32, .43], [.43, .23], [.46, -.14], [.39, -.39], [.24, -.50]];
  base.add(smoothRelief(coat, .375, .067), [0, 2.36, -.212], gold);
  base.add(smoothRelief([[-.24, .43], [0, .29], [.25, .44], [.14, .20], [0, .13], [-.13, .23]], .010, .005), [0, 2.36, .225], light);
  base.add(cord([[-.34, 2.68, .219], [-.19, 2.52, .253], [0, 2.43, .259], [.19, 2.52, .253], [.34, 2.68, .219]], .034), [0, 0, 0], deep);
  base.add(cord([[-.34, 2.69, .239], [-.19, 2.53, .275], [0, 2.44, .282], [.19, 2.53, .275], [.34, 2.69, .239]], .020), [0, 0, 0], light);
  base.add(new THREE.CylinderGeometry(.083, .083, .022, 16), [0, 2.403, .272], deep, [Math.PI / 2, 0, 0]);
  base.add(new THREE.CylinderGeometry(.060, .060, .021, 16), [0, 2.403, .292], light, [Math.PI / 2, 0, 0]);
  for (const y of [2.07, 2.23]) base.add(new THREE.SphereGeometry(.029, 10, 8).scale(1, 1, .65), [0, y, .232], shade);

  base.add(cord([[-.40, 2.68, -.025], [-.52, 2.52, .035], [-.48, 2.38, .25]], .084), [0, 0, 0], gold);
  base.add(new THREE.SphereGeometry(.104, 14, 10).scale(.90, .93, 1.25), [-.48, 2.38, .271], light);
  base.add(cord([[.39, 2.68, -.02], [.61, 2.77, .061], [.69, 3.04, .264], [.72, 3.163, .287]], .090), [0, 0, 0], gold);
  const [perchX, perchY, perchZ] = BIRD_SEAT;
  const palm: [number, number][] = [[-.15, -.063], [-.106, -.105], [.102, -.105], [.153, -.057], [.153, .060], [.105, .104], [-.106, .104], [-.15, .059]];
  // Both toes reach forward off center, so the top plane must span the full contact patch.
  base.add(smoothRelief(palm, .057, .013), [perchX, perchY - .070, perchZ], light, [-Math.PI / 2, 0, 0]);
  base.add(new THREE.SphereGeometry(1, 12, 9).scale(.048, .034, .057), [perchX - .075, perchY - .067, perchZ + .080], gold);
  base.add(new THREE.CylinderGeometry(.111, .14, .19, 12), [0, 2.92, -.01], shade);
  sculptedFace(base, gold, light, shade, deep);
  return base.build();
}

function woodGrain() {
  return painted('village-chip-wood', () => ctex('mayor-fractured-heartwood', 384, 320, (g, rand) => {
    const gradient = g.createLinearGradient(0, 0, 384, 320);
    gradient.addColorStop(0, '#eac88e'); gradient.addColorStop(.60, '#c88751'); gradient.addColorStop(1, '#efc58a');
    g.fillStyle = gradient; g.fillRect(0, 0, 384, 320);
    for (let i = 0; i < 29; i++) {
      const y = i * 13 - 20;
      g.strokeStyle = ['#a25e39', '#835039', '#e6a86d', '#af704b'][i % 4];
      g.lineWidth = 1.1 + rand() * 4.4;
      g.beginPath(); g.moveTo(-16, y);
      g.bezierCurveTo(96, y - 24, 136, y + 29, 219, y - 9);
      g.quadraticCurveTo(283, y - 36, 400, y + 7); g.stroke();
    }
    for (let i = 0; i < 7; i++) {
      g.strokeStyle = i % 2 ? '#744d38' : '#cf985e'; g.lineWidth = i % 3 + 1;
      g.beginPath(); g.ellipse(215, 163, 8 + i * 5, 2 + i * 1.5, -.28, 0, TAU); g.stroke();
    }
  }));
}

function chippedArea() {
  const points: [number, number][] = [[.270, .085], [.346, .109], [.375, .163], [.352, .258], [.304, .301], [.271, .265], [.283, .214], [.252, .167]];
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  const raw = new THREE.ShapeGeometry(shape);
  const positions = raw.getAttribute('position');
  const uvs = raw.getAttribute('uv');
  for (let i = 0; i < positions.count; i++) uvs.setXY(i, (positions.getX(i) - .247) * 7.75, (positions.getY(i) - .08) * 4.45);
  const wood = new THREE.Mesh(raw, woodGrain());
  wood.position.set(0, headCenterY, NOTCH[2]);
  return wood;
}

function cloudMaterial(seed: number) {
  return new THREE.MeshBasicMaterial({map: cloudHD(seed), transparent: true, depthWrite: false, opacity: .73, side: THREE.DoubleSide, fog: false});
}

function Clouds({frame, sunset}: {frame: number; sunset: number}) {
  const cloudMats = useMemo(() => [11, 16, 29].map(cloudMaterial), []);
  return <group>{[[-16, 12.3, -41, 12, 5], [2, 13.3, -49, 15, 6], [21, 12.4, -44, 12.5, 5.8]].map(([x, y, z, w, h], index) => {
    const material = cloudMats[index];
    material.color.setRGB(1, 1 - .10 * sunset, 1 - .27 * sunset);
    return <mesh key={index} position={[x + frame * (.0009 + .00035 * index), y, z]} material={material} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <planeGeometry args={[w, h]}/>
    </mesh>;
  })}</group>;
}

export function World({frame, sunset, chipMissing}: {frame: number; sunset: number; chipMissing: boolean}) {
  const square = useMemo(buildSquare, []);
  const statue = useMemo(statueModel, []);
  const scar = useMemo(chippedArea, []);
  return <group name="French-village-square">
    <primitive object={square}/><primitive object={statue}/>
    {chipMissing && <primitive object={scar}/>}
    <Clouds frame={frame} sunset={sunset}/>
  </group>;
}

function SilkPouch() {
  const geometry = useMemo(() => {
    const profile = [[.05, 0], [.145, .023], [.213, .080], [.226, .148], [.201, .220], [.153, .278], [.079, .343], [.10, .369], [.122, .402], [.109, .417]].map(([r, y]) => new THREE.Vector2(r, y));
    const mesh = new THREE.LatheGeometry(profile, 28);
    const attribute = mesh.getAttribute('position');
    for (let i = 0; i < attribute.count; i++) {
      const x = attribute.getX(i), y = attribute.getY(i), z = attribute.getZ(i);
      const fold = 1 + Math.sin(Math.atan2(z, x) * 7) * (.045 + .075 * y);
      attribute.setXYZ(i, x * fold - .031 * y, y + .008 * Math.sin(Math.atan2(z, x) * 4), z * fold * .77);
    }
    mesh.computeVertexNormals();
    return mesh;
  }, []);
  const cloth = painted('plum-pouch-cloth', () => ctex('mayor-pouch-linen', 256, 256, (g, random) => {
    g.fillStyle = '#a85144'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 120; i++) {
      g.fillStyle = i % 2 ? 'rgba(251,180,131,.26)' : 'rgba(99,44,54,.27)';
      g.fillRect(random() * 256, random() * 256, 1.2, 3 + random() * 17);
    }
  }));
  return <mesh geometry={geometry} material={cloth} castShadow receiveShadow/>;
}

function cord(points: V3[], radius: number) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point))), 12, radius, 5, false);
}

export function Pouch({position, yaw = 0, scale = 1}: Place & {yaw?: number; scale?: number}) {
  const strings = useMemo(() => [cord([[.04, .344, .075], [.12, .375, .106], [.169, .303, .120], [.144, .237, .141]], .012), cord([[.038, .35, .077], [-.02, .356, .101], [-.061, .319, .13], [-.030, .281, .142]], .011)], []);
  return <group name="marked-tax-pouch" position={position} rotation-y={yaw} scale={scale}>
    <SilkPouch/>
    <mesh position={[0, .412, 0]} scale={[1, 1, .78]} material={color('#593d38')}><cylinderGeometry args={[.100, .10, .009, 18]}/></mesh>
    <mesh position={[0, .344, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, .84, 1]} material={color('#efd19a')}><torusGeometry args={[.088, .015, 6, 19]}/></mesh>
    {strings.map((geometry, index) => <mesh key={index} geometry={geometry} material={color('#edca91')}/>)}
    {[-1, 1].map(side => <group key={side} position={[side * .033, .414, .009]} rotation={[.34, -.18, side * .46]}>
      <mesh position={[0, .026, 0]} material={gilded('#f0bc56')}><cylinderGeometry args={[.059, .059, .016, 12]}/></mesh>
    </group>)}
    <mesh position={[0, .173, .169]} rotation={[0, 0, Math.PI / 4]} material={color('#f5d29a')} castShadow><boxGeometry args={[.132, .132, .015]}/></mesh>
    <mesh position={[0, .173, .178]} rotation={[0, 0, Math.PI / 4]} material={color('#62513e')}><boxGeometry args={[.063, .063, .012]}/></mesh>
  </group>;
}

function sketchPaint() {
  return painted('mayor-bird-paper', () => ctex('mayor-bounty-illustration', 448, 360, (g, random) => {
    g.fillStyle = '#efe2b7'; g.fillRect(0, 0, 448, 360);
    for (let i = 0; i < 120; i++) {
      g.fillStyle = i % 2 ? 'rgba(174,135,91,.10)' : 'rgba(255,249,213,.28)';
      g.fillRect(random() * 448, random() * 360, 2 + random() * 18, 1 + random() * 3);
    }
    g.strokeStyle = '#897053'; g.lineWidth = 2.6; g.strokeRect(14, 14, 420, 332);
    g.save(); g.translate(222, 179); g.rotate(-.12); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-21, 24); g.lineTo(-80, 112); g.lineTo(-52, 121); g.lineTo(7, 58); g.closePath(); g.fillStyle = '#29313a'; g.fill();
    g.beginPath(); g.ellipse(-3, 23, 53, 81, .43, 0, TAU); g.fillStyle = '#30353e'; g.fill();
    g.beginPath(); g.ellipse(16, 31, 31, 53, .28, -.42, Math.PI * 1.66); g.fillStyle = '#faf1da'; g.fill();
    g.beginPath(); g.ellipse(29, -57, 44, 35, -.27, 0, TAU); g.fillStyle = '#333944'; g.fill();
    g.beginPath(); g.ellipse(33, -47, 31, 13, -.26, 0, TAU); g.fillStyle = '#fff3d8'; g.fill();
    g.beginPath(); g.moveTo(-10, -72); g.quadraticCurveTo(5, -116, 47, -91); g.quadraticCurveTo(69, -91, 69, -72); g.closePath(); g.fillStyle = '#b3463f'; g.fill();
    g.beginPath(); g.moveTo(62, -64); g.lineTo(130, -54); g.lineTo(64, -45); g.closePath(); g.fillStyle = '#52535a'; g.fill();
    g.beginPath(); g.ellipse(-15, 21, 25, 58, .54, 0, TAU); g.fillStyle = '#48515b'; g.fill();
    g.strokeStyle = '#faf0d3'; g.lineWidth = 5; g.beginPath(); g.moveTo(-23, -2); g.quadraticCurveTo(-14, 21, -40, 56); g.stroke();
    g.fillStyle = '#271e25'; g.beginPath(); g.arc(48, -65, 6, 0, TAU); g.fill();
    g.strokeStyle = '#6d6258'; g.lineWidth = 6; g.beginPath(); g.moveTo(3, 61); g.lineTo(20, 81); g.lineTo(35, 77); g.moveTo(15, 55); g.lineTo(31, 69); g.lineTo(46, 67); g.stroke();
    g.restore();
    g.strokeStyle = '#af9571'; g.lineWidth = 2.5;
    for (const y of [288, 299, 310]) {g.beginPath(); g.moveTo(65, y); g.lineTo(146 + (y % 20) * 2, y); g.stroke();}
  }));
}

export function BirdSketch({position, yaw = 0}: Place & {yaw?: number}) {
  return <group name="woodpecker-bounty-sketch" position={position} rotation-y={yaw}>
    <mesh position={[0, .011, 0]} material={color('#ae8157')} castShadow receiveShadow><boxGeometry args={[.746, .022, .607]}/></mesh>
    <mesh position={[0, .024, 0]} rotation={[-Math.PI / 2, 0, 0]} material={sketchPaint()} receiveShadow><planeGeometry args={[.72, .580]}/></mesh>
  </group>;
}

function chipModel() {
  const contour: [number, number][] = [[-.235, -.059], [-.181, -.155], [-.020, -.133], [.069, -.171], [.231, -.085], [.207, -.005], [.248, .091], [.094, .123], [.005, .176], [-.085, .128], [-.222, .139]];
  const shape = new THREE.Shape();
  contour.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y)); shape.closePath();
  const slab = new THREE.ExtrudeGeometry(shape, {depth: .085, bevelEnabled: true, bevelSize: .014, bevelThickness: .011, bevelSegments: 1});
  slab.rotateX(-Math.PI / 2).translate(0, -.043, 0);
  const uv = slab.getAttribute('uv');
  const vertices = slab.getAttribute('position');
  for (let i = 0; i < vertices.count; i++) uv.setXY(i, (vertices.getX(i) + .25) * 2, (vertices.getZ(i) + .18) / .36);
  const shell = new THREE.Mesh(slab, [woodGrain(), color('#ac713e')]);
  shell.castShadow = shell.receiveShadow = true;
  const plating = new THREE.ShapeGeometry(shape);
  plating.rotateX(-Math.PI / 2).translate(0, .055, 0);
  const top = new THREE.Mesh(plating, gilded('#dc9e40'));
  const group = new THREE.Group(); group.add(shell, top);
  return group;
}

export function Chip({position, rotation = [0, 0, 0], scale = 1}: Place & {rotation?: V3; scale?: number}) {
  const model = useMemo(chipModel, []);
  return <group name="painted-wood-chip" position={position} rotation={rotation} scale={scale}><primitive object={model}/></group>;
}

export function Coin({position, rotation = [0, 0, 0]}: Place & {rotation?: V3}) {
  return <group position={position} rotation={rotation}>
    <mesh material={gilded('#e0a340')} castShadow><cylinderGeometry args={[.083, .083, .023, 16]}/></mesh>
    <mesh position={[0, .012, 0]} material={gilded('#f5c564')}><cylinderGeometry args={[.062, .062, .007, 16]}/></mesh>
    <mesh position={[0, .018, 0]} rotation={[0, Math.PI / 4, 0]} material={gilded('#c38535')}><boxGeometry args={[.04, .004, .04]}/></mesh>
  </group>;
}

export function Chain({position, yaw = 0, tilt = 0}: Place & {yaw?: number; tilt?: number}) {
  return <group name="mayoral-chain" position={position} rotation-x={tilt} rotation-y={yaw}>
    {Array.from({length: 13}, (_, i) => {
      const a = i * TAU / 13;
      return <mesh key={i} position={[Math.sin(a) * .246, .029, Math.cos(a) * .174]} scale={[1, 1.30, 1]} rotation={[-Math.PI / 2 + (i % 2) * .32, 0, a]} material={gilded('#d7a047')} castShadow>
        <torusGeometry args={[.049, .011, 6, 12]}/>
      </mesh>;
    })}
    <mesh position={[0, .030, .185]} material={gilded('#eab45d')} castShadow><cylinderGeometry args={[.079, .079, .032, 10]}/></mesh>
    <mesh position={[0, .052, .186]} material={color('#6e8079')}><cylinderGeometry args={[.041, .041, .012, 6]}/></mesh>
  </group>;
}

function nestModel() {
  const set = new SetPieces();
  set.add(new THREE.SphereGeometry(.33, 15, 8).scale(1, .27, .8), [0, .015, 0], color('#756149'));
  for (let i = 0; i < 43; i++) {
    const a = i * 2.399963;
    const next = a + .39 + .12 * (i % 3);
    const radius = .285 + .027 * Math.sin(i * 2.9);
    const y = .053 + (i % 4) * .019;
    set.beam([Math.cos(a) * radius, y, Math.sin(a) * radius * .79], [Math.cos(next) * (radius + .022), y + .025 * Math.sin(i), Math.sin(next) * (radius + .022) * .79], .024, color(['#a08761', '#8c7453', '#b69a70'][i % 3]));
  }
  return set.build();
}

export function Nest({position}: Place) {
  const model = useMemo(nestModel, []);
  return <group name="woodpecker-nest" position={position}><primitive object={model}/></group>;
}
