import {useFrame} from '@react-three/fiber';
import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {blobMaterial, cardShade} from '../upstream/templates/bridge/cardshade';
import {NOINK} from '../upstream/templates/bridge/ink';
import {glide} from '../upstream/templates/bridge/story';
import {bodyFront, fxContact, headBlob, Outfit, Pen} from '../upstream/templates/bridge/toon';
import {drawCoastRun, drawWorkPouch, RUN_STEP} from './CoastActor';
import {coastHeight} from './CoastSet';

const width = 600;
const height = 1000;
const normal = new THREE.Vector3(0, 0, 1);
const groundAt: (x: number, z: number) => number = coastHeight;
const ropeNotice = 462;
const ropeDrop = 470;
const basketSetDown = 545;
const residents = [
  {x: -3.9, z: 2.85, size: .00183, seed: 43, notice: ropeNotice, leave: 518, speed: .040, outfit: {
    jacket: '#bd613f', pants: '#3f3e56', boots: '#342835', skin: '#dca777', hair: '#38262c', cap: '#ddad69',
    belt: '#735235', build: 'stout',
  } satisfies Outfit},
  {x: -6.0, z: 3.65, size: .00167, seed: 71, notice: 523, leave: 551, speed: .043, outfit: {
    jacket: '#727e48', pants: '#4b3c51', boots: '#382932', skin: '#edb689', hair: '#3f252c', build: 'adult',
  } satisfies Outfit},
];

function drawRopeWorkerDetails(pen: Pen, facing: -1 | 1, phase: number, tilt: number, heldRope: boolean) {
  const head = headBlob(43, 118, facing);
  const headHeight = 2 * head.b;
  const unit = 2 * head.a / 100;
  const bob = heldRope ? .015 * 3.47 * headHeight * Math.cos(phase * Math.PI * 4) : 0;
  const torsoBottom = 975 - 1.32 * headHeight + bob;
  const hip = torsoBottom - .12 * headHeight;
  const torsoX = 300 + 3 * unit * facing;
  const torsoWidth = .46 * 2 * head.a / 1.06;
  const swing = Math.sin(phase * Math.PI * 2);
  const handX = torsoX + 1.12 * torsoWidth + (7 - 6 * Math.max(0, swing) + 4 * Math.max(0, -swing)) * unit;
  const handY = torsoBottom - .11 * headHeight - Math.abs(swing) * 9 * unit;
  const curl = 10 * swing;
  const bodySway = heldRope ? swing : 0;
  pen.rot = [(tilt + bodySway) * Math.PI / 180, 300, hip];
  drawWorkPouch(pen, torsoX - 50, torsoBottom - 40);
  if (!heldRope) {
    pen.rot = null;
    return;
  }
  for (let i = 0; i < 3; i++) {
    const x = handX - 5 * i + .5 * curl;
    const y = handY + 47 + 5 * i;
    pen.arc(x, y, 42 - 4 * i, 46 - 3 * i, 0, 360, 12);
    pen.arc(x, y, 42 - 4 * i, 46 - 3 * i, 0, 360, 7, '#e7bc7e');
  }
  const tail: [number, number][] = [[handX, handY], [handX + 26 + curl, handY + 19],
    [handX + 41 + curl, handY + 62], [handX + 62 + curl, handY + 92]];
  pen.stroke(tail, 10);
  pen.stroke(tail, 6, '#c59c65');
  pen.dot(handX, handY, 5.5 * unit);
  pen.stroke([[handX - 3, handY + 3], [handX + 5, handY + 7]], 2.5, '#ba8963');
  pen.rot = null;
}

function DroppedRope({frame}: {frame: number}) {
  const fall = Math.min(1, (frame - ropeDrop) / 10);
  const x = -3.72 + .07 * fall;
  return <group position={[x, groundAt(x, 2.73) + .026 + .53 * (1 - fall * fall), 2.73]}
    rotation={[(-.18 + .68 * fall) * Math.PI, .28, .13 + .28 * fall]} scale={1.25}>
    {[.064, .088, .116].map((radius, index) => (
      <mesh key={radius} position={[index * .013, 0, index * .009]} castShadow receiveShadow>
        <torusGeometry args={[radius, .012, 5, 18]} />
        <meshStandardMaterial color="#ad8554" roughness={.89} />
      </mesh>
    ))}
  </group>;
}

function drawHeldBasket(pen: Pen, seed: number, tilt: number) {
  const head = headBlob(seed, 118, 1);
  const headHeight = 2 * head.b;
  const unit = 2 * head.a / 100;
  const torsoBottom = 975 - 1.4 * headHeight;
  const torsoX = 300 + 3 * unit;
  const torsoWidth = .4 * 2 * head.a / 1.06;
  const x = torsoX - 1.12 * torsoWidth - 7 * unit;
  const y = torsoBottom - .06 * headHeight;
  pen.rot = [tilt * Math.PI / 180, 300, torsoBottom - .12 * headHeight];
  pen.arc(x, y + 31, 36, 35, 180, 360, 7, '#805635');
  pen.poly([[x - 45, y + 29], [x + 45, y + 29], [x + 32, y + 70], [x - 32, y + 70]], '#ac7e4e', 5);
  for (const offset of [-20, 0, 20]) {
    pen.stroke([[x + offset, y + 33], [x + offset * .78, y + 66]], 2.5, '#805635');
  }
  pen.stroke([[x - 39, y + 44], [x + 39, y + 44]], 3, '#ce9d62');
  pen.dot(x, y, 5.5 * unit);
  pen.rot = null;
}

function surface(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas2D is required for the village characters.');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return {context, texture};
}

function makeResident(size: number) {
  const card = surface(width, height);
  const geometry = new THREE.PlaneGeometry(width * size, height * size, 1, 8);
  geometry.translate(0, (975 - height / 2) * size, 0);
  const rest = geometry.getAttribute('position').clone();
  const figure = new THREE.Mesh(geometry, cardShade(new THREE.MeshLambertMaterial({
    map: card.texture, alphaTest: .5, side: THREE.DoubleSide,
  })));
  figure.layers.set(NOINK);
  figure.receiveShadow = true;
  figure.renderOrder = 1;

  const contact = surface(128, 128);
  fxContact(new Pen(contact.context), '#817588');
  contact.texture.needsUpdate = true;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.56, .36), blobMaterial(contact.texture));
  shadow.layers.set(NOINK);

  const root = new THREE.Group();
  root.add(figure, shadow);
  return {root, figure, shadow, card, contact, rest, right: new THREE.Vector3(), slope: new THREE.Vector3(),
    cameraPos: new THREE.Vector3(), sun: new THREE.Vector3(), lightTarget: new THREE.Vector3(), frame: -1, light: NaN};
}

function Resident({frame, resident}: {frame: number; resident: typeof residents[number]}) {
  const actor = useMemo(() => makeResident(resident.size), [resident.size]);
  useEffect(() => () => {
    actor.card.texture.dispose();
    actor.contact.texture.dispose();
    actor.figure.geometry.dispose();
    actor.figure.material.dispose();
    actor.shadow.geometry.dispose();
    actor.shadow.material.dispose();
  }, [actor]);

  useFrame(({camera, scene}) => {
    const {figure, shadow, rest, right, slope, cameraPos, sun, lightTarget} = actor;
    const {z, size, seed, notice, leave, speed, outfit} = resident;
    const elapsed = Math.max(0, frame - leave);
    const travel = speed * (elapsed - 12 * (1 - Math.exp(-elapsed / 12)));
    const x = resident.x - travel;
    camera.getWorldPosition(cameraPos);
    const view = (cameraPos.x - x) / Math.max(.001, Math.hypot(cameraPos.x - x, cameraPos.z - z));
    figure.position.set(x, groundAt(x, z) + .014, z);
    figure.rotation.y = Math.atan2(cameraPos.x - x, cameraPos.z - z);
    right.set(Math.cos(figure.rotation.y), 0, -Math.sin(figure.rotation.y));
    const grade = (groundAt(x + .1, z) - groundAt(x - .1, z)) / .2;
    slope.set(-grade, 1, 0).normalize();
    shadow.position.copy(figure.position).addScaledVector(slope, .012);
    shadow.quaternion.setFromUnitVectors(normal, slope);

    const vertices = figure.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const height = rest.getY(i);
      const blend = 1 - THREE.MathUtils.smoothstep(height, .05, .65);
      vertices.setY(i, height + grade * right.x * rest.getX(i) * blend);
    }
    vertices.needsUpdate = true;

    const key = scene.children.find((child): child is THREE.DirectionalLight =>
      child instanceof THREE.DirectionalLight && child.visible);
    if (key) key.getWorldPosition(sun).sub(key.target.getWorldPosition(lightTarget)).normalize();
    else sun.set(-.55, .8, .2);
    const light = Math.atan2(-sun.y, sun.dot(right));
    if (frame === actor.frame && Math.abs(light - actor.light) < .001) return;

    const {context, texture} = actor.card;
    context.clearRect(0, 0, width, height);
    const pen = new Pen(context);
    if (frame >= leave) {
      const mirror = right.x >= 0;
      context.save();
      if (mirror) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      drawCoastRun(pen, outfit, seed, travel / (2 * RUN_STEP * size), Math.max(.18, Math.abs(right.x)),
        THREE.MathUtils.smoothstep(view, .28, .94), mirror ? Math.PI - light : light, .35 + .65 * glide(elapsed / 12));
      context.restore();
    } else {
      const glance = glide((frame - notice) / 18);
      const turn = glide((frame - leave + 11) / 11);
      const blink = [0, .7, 1, .55, 0][(frame + seed) % 106] ?? 0;
      const call = seed === 43 && frame >= notice + 15 && frame < leave - 8;
      const heldRope = seed === 43 && frame < ropeDrop;
      const heldBasket = seed === 71 && frame < basketSetDown;
      const workTime = Math.min(frame, notice) / 36;
      const tilt = heldRope ? 6 + 4 * Math.sin(workTime * Math.PI * 2) + 3 * glance : 7 * glance - 19 * turn;
      const facing = turn > .55 ? -1 : 1;
      const alert = call ? Math.sin((frame - 477) * .26) > -.25 : frame >= notice + 4 && frame < notice + 22;
      const headTilt = 3 * Math.sin((frame + seed) / 29) + 9 * glance - 16 * turn - (heldBasket ? 6 * (1 - glance) : 0);
      bodyFront(pen, outfit, {
        mode: heldRope ? 'stroll' : 'stand', phase: workTime, lift: 0, facing,
        expr: alert ? 'shock' : glance > .3 ? 'nervous' : 'neutral',
        look: .12 + .87 * glance - 2.4 * turn - (call ? 1.6 * glide((frame - 477) / 11) : 0), tilt,
        headTilt,
        wave: call ? .33 + .27 * Math.sin(frame * .23) : undefined,
        light, seed, blink,
      });
      if (seed === 43) drawRopeWorkerDetails(pen, facing, workTime, tilt, heldRope);
      if (heldBasket) drawHeldBasket(pen, seed, tilt);
    }
    texture.needsUpdate = true;
    actor.frame = frame;
    actor.light = light;
  });

  return <primitive object={actor.root} dispose={null}/>;
}

export function VillageExtras({frame}: {frame: number}) {
  return <>
    {residents.map(resident => <Resident key={resident.seed} frame={frame} resident={resident}/>)}
    {frame >= ropeDrop && <DroppedRope frame={frame}/>}
    {frame >= basketSetDown && (
      <mesh position={[-6.16, groundAt(-6.16, 3.78) + .074 + .45 * (1 - Math.min(1, (frame - basketSetDown) / 8) ** 2), 3.78]}
        rotation={[0, -.4, -.14]} castShadow receiveShadow>
        <cylinderGeometry args={[.075, .055, .12, 7]} />
        <meshStandardMaterial color="#a57a4d" roughness={.94} />
      </mesh>
    )}
  </>;
}
