import {useFrame} from '@react-three/fiber';
import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {blobMaterial, cardShade} from '../upstream/templates/bridge/cardshade';
import {NOINK} from '../upstream/templates/bridge/ink';
import {glide} from '../upstream/templates/bridge/story';
import {blobPts, bodyFront, fxContact, headBlob, INK, mix, Outfit, PARENT, Pen, shade, SKIN, thickAngle} from '../upstream/templates/bridge/toon';
import {coastHeight} from './CoastSet';

const actorX = -3;
const actorZ = 5.3;
const groundY = .425;
const cardScale = .00216;
export const RUN_STEP = 172;
type Position = readonly [number, number, number];
const startPosition: Position = [actorX, groundY, actorZ];
const outfit = {
  ...PARENT,
  jacket: '#478987',
  buttons: '#f2ca88',
  pants: '#34324a',
  boots: '#322735',
  skin: '#f2c99e',
  hair: '#37242b',
};
const cardNormal = new THREE.Vector3(0, 0, 1);
const groundAt: (x: number, z: number) => number = coastHeight;

export function drawReactionMark(pen: Pen, text: '?!' | '!', x: number, y: number, age: number) {
  const [anchorX, anchorY] = pen.P(x, y);
  const context = pen.g;
  const scale = .88 + .16 * glide(age / 3) - .04 * glide((age - 3) / 4);
  context.save();
  context.translate(anchorX, anchorY);
  context.rotate(text === '?!' ? -.12 : .12);
  context.scale(scale, scale);
  context.font = '900 98px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.lineWidth = 11;
  context.strokeStyle = '#fce2b6';
  context.fillStyle = '#df292e';
  context.strokeText(text, 0, 0);
  context.fillText(text, 0, 0);
  context.restore();
}

function drawWovenHat(pen: Pen, x: number, y: number, head: ReturnType<typeof headBlob>, light: number, rear = 0) {
  const brimY = y - head.b * .64;
  const brimWidth = head.a * (1.42 - .10 * rear);
  const brimDepth = head.b * (.14 + .055 * rear);
  const crown: [number, number][] = [[x - .73 * head.a, brimY], [x - .58 * head.a, brimY - .29 * head.b],
    [x - .38 * head.a, brimY - .51 * head.b], [x + .34 * head.a, brimY - .55 * head.b],
    [x + .60 * head.a, brimY - .30 * head.b], [x + .75 * head.a, brimY],
    [x + .37 * head.a, brimY + .07 * head.b], [x - .37 * head.a, brimY + .07 * head.b]];
  pen.ell(x, brimY + 3, brimWidth, brimDepth + 4, '#996739', 6);
  pen.ell(x, brimY, brimWidth, brimDepth, '#e0ac62', 4);
  pen.arc(x, brimY, brimWidth * .93, brimDepth * .76, 12, 168, 2, '#966236');
  pen.gradFill(crown, '#e9b875', '#a87141', light);
  pen.clip(crown, () => {
    for (let i = -6; i <= 6; i++) {
      const threadX = x + i * 15;
      pen.stroke([[threadX - 18, brimY + 6], [threadX + 14, brimY - 74]], 2.2, '#b98854');
      pen.stroke([[threadX + 20, brimY + 6], [threadX - 13, brimY - 74]], 1.8, '#f5cd89');
    }
    pen.stroke([[x - 92, brimY - 11], [x - 38, brimY - 4], [x + 40, brimY - 4], [x + 94, brimY - 13]], 10, '#325453');
  });
  pen.inkRing(crown, 6, thickAngle(light));
}

export function drawWorkPouch(pen: Pen, x: number, y: number) {
  pen.poly([[x - 27, y - 4], [x + 26, y - 2], [x + 22, y + 40],
    [x + 7, y + 49], [x - 23, y + 43]], '#b77c49', 5);
  pen.poly([[x - 28, y - 8], [x + 28, y - 7], [x + 22, y + 13], [x - 22, y + 15]], '#d59856', 4);
  pen.dot(x, y + 8, 3.5, '#edc877');
}

export function drawCoastRun(pen: Pen, outfit: Outfit, seed: number, phase: number, projection: number, rear: number, light: number, effort = 1) {
  const head = headBlob(seed, 118, 1 - rear);
  const width = 2 * head.a;
  const height = 2 * head.b;
  const unit = width / 100;
  const thick = thickAngle(light);
  const step = RUN_STEP * projection * effort;
  const contact = .39;
  const ankle = 975 - 4 * unit;
  const legLength = (outfit.build === 'stout' ? 1.44 : 1.52) * height - 4 * unit;
  const hip = ankle - legLength + (11 - 24 * Math.cos(phase * Math.PI * 4)) * effort;
  const shoulder = hip - .84 * height;
  const spread = 9 + 30 * rear;
  const armSwing = Math.sin(phase * Math.PI * 2);

  // As in the bridge stride, stance feet move back at exactly the actor's speed.
  // Shorter contact leaves a brief airborne interval between footfalls.
  for (const side of [-1, 1]) {
    const cycle = (phase + (side === 1 ? .5 : 0)) % 1;
    const swing = Math.max(0, (cycle - contact) / (1 - contact));
    const offset = cycle < contact ? step * (contact - 2 * cycle)
      : step * (contact * (2 * glide(swing) - 1) - (1 - contact) / Math.PI * Math.sin(2 * Math.PI * swing));
    const footX = 300 + side * spread + offset;
    const footY = ankle - 86 * Math.sin(Math.PI * swing) * effort;
    const legX = 300 + side * spread * .72;
    pen.stroke([[legX, hip], [(legX + footX) / 2 + (12 + 46 * swing) * projection, (hip + footY) / 2], [footX, footY]],
      5.8 * unit, mix(outfit.pants, INK, side === -1 ? .71 : .55));
    pen.line([[footX - 4 * unit, footY], [footX + (7 + 6 * projection) * unit, footY + 11 * Math.sin(2 * Math.PI * swing)]],
      outfit.boots, 7.5 * unit, false);
  }

  pen.rot = [(.12 + .18 * projection + .035 * Math.cos(phase * 4 * Math.PI)) * effort, 300, hip];
  const torsoWidth = outfit.build === 'stout' ? .38 : .31;
  const back = blobPts(300, shoulder + .53 * height, {
    a: width * (torsoWidth + .073 * rear), b: .65 * height, nTop: 2.2, nBot: 2.5,
    egg: -.10, asym: .045, rot: 0, noise: .007, seed: seed + 7,
  });
  const drawArm = (side: number) => {
    const shoulderX = 300 + side * width * (.16 + rear * .14);
    const swing = side * armSwing * (32 + 40 * projection) * effort;
    const sleeve = mix(outfit.jacket, INK, side === -1 ? .67 : .42);
    const handX = shoulderX + 25 * projection + side * 12 + swing;
    const handY = shoulder + (.25 + .38 * (1 - effort)) * height - swing * .25;
    pen.stroke([[shoulderX, shoulder], [shoulderX - 23 * projection + side * 18 + swing * .51, shoulder + .37 * height],
      [handX, handY]], 5.5 * unit, sleeve);
    pen.dot(handX, handY, 5.3 * unit);
  };
  drawArm(-1);
  pen.gradFill(back, outfit.jacket, shade(outfit.jacket, .66), light);
  pen.inkRing(back, 5 * unit, thick);
  pen.arc(300, shoulder + 15, 61 + rear * 15, 16, 12, 161, 3.3, shade(outfit.jacket, .72));
  pen.stroke([[297 + 59 * (1 - rear), shoulder + 46], [294 + 65 * (1 - rear), shoulder + 92],
    [296 + 62 * (1 - rear), hip + 24]], 2.1, shade(outfit.jacket, .84));
  if (outfit.belt) {
    pen.stroke([[300 - torsoWidth * width, hip + 7], [300, hip + 14], [300 + torsoWidth * width, hip + 7]], 8, outfit.belt);
    drawWorkPouch(pen, 348 - 92 * rear, hip + 12);
  }
  drawArm(1);

  const headX = 304 + (1 - rear) * 19;
  const headY = shoulder - head.b + 4;
  const face = blobPts(headX, headY, head);
  const skin = outfit.skin ?? SKIN;
  pen.shadedFill(face, skin, shade(skin, .87), light, head.a);
  const hairline: [number, number][] = [[headX - 128, headY + 52], [headX - 88, headY + 76],
    [headX - 55, headY + 90], [headX - 25, headY + 84], [headX + 2, headY + 73],
    [headX + 21 + 14 * rear, headY + 12 + 58 * rear], [headX + 40 + 19 * rear, headY - 25 + 79 * rear],
    [headX + 73, headY - 44 + 70 * rear], [headX + 125, headY - 41 + 29 * rear]];
  pen.clip(face, () => {
    const hair = outfit.hair ?? '#37242b';
    pen.gradFill([...hairline, [headX + 139, headY - 132], [headX - 142, headY - 134]],
      mix(hair, skin, .12), hair, light);
    pen.stroke(hairline, 3.3, INK);
    pen.stroke([[headX - 49, headY - 71], [headX - 20, headY - 81], [headX + 7, headY - 82]], 3.8, mix(hair, skin, .21));
    // The face turns around the contour with the camera and disappears behind it.
    const faceX = headX + 72 + 53 * rear;
    pen.stroke([[faceX - 13, headY - 17], [faceX + 13, headY - 10]], 6, INK);
    pen.ell(faceX + 2, headY - 2, 7, 9, INK);
    pen.stroke([[faceX - 8, headY + 35], [faceX + 5, headY + 32], [faceX + 13, headY + 39]], 5, INK);
  });
  pen.ell(headX + 15 + 63 * rear, headY + 25 + 8 * rear, 13 + 3 * (1 - rear), 19, shade(skin, .93), 3.8, 0, 360, 14);
  pen.inkRing(face, 5 * unit, thick);
  if (seed === 17) drawWovenHat(pen, headX, headY, head, light, rear);
  pen.rot = null;
}

function paintSurface(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas2D is required for the coastal character.');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return {context, texture};
}

function makeActor() {
  const card = paintSurface(600, 1000);
  const geometry = new THREE.PlaneGeometry(600 * cardScale, 1000 * cardScale, 1, 8);
  geometry.translate(0, (975 - 500) * cardScale, 0);
  const rest = geometry.getAttribute('position').clone();
  const material = cardShade(new THREE.MeshLambertMaterial({
    map: card.texture,
    alphaTest: .5,
    side: THREE.DoubleSide,
  }));
  const figure = new THREE.Mesh(geometry, material);
  figure.layers.set(NOINK);
  figure.position.set(actorX, groundY, actorZ);
  figure.receiveShadow = true;
  figure.renderOrder = 1;

  const contact = paintSurface(128, 128);
  fxContact(new Pen(contact.context), '#9291a4');
  contact.texture.needsUpdate = true;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(.72, .46), blobMaterial(contact.texture));
  shadow.layers.set(NOINK);

  const root = new THREE.Group();
  root.add(shadow, figure);
  return {root, figure, card, contact, shadow, rest, groundNormal: new THREE.Vector3(),
    right: new THREE.Vector3(), sun: new THREE.Vector3(),
    target: new THREE.Vector3(), drawnFrame: -1, drawnLight: Number.NaN};
}

export function CoastActor({frame, position = startPosition}: {frame: number; position?: Position}) {
  const actor = useMemo(makeActor, []);
  useEffect(() => () => {
    actor.card.texture.dispose();
    actor.contact.texture.dispose();
    actor.root.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
  }, [actor]);

  useFrame(({camera, scene}) => {
    const {figure, shadow, groundNormal, rest, right, sun, target} = actor;
    const [x, y, z] = position;
    const uphill = frame >= 575;
    camera.getWorldPosition(target);
    const view = (target.x - x) / Math.max(.001, Math.hypot(target.x - x, target.z - z));
    const rear = THREE.MathUtils.smoothstep(view, .28, .94);
    figure.position.set(x, y, z);
    figure.rotation.y = Math.atan2(target.x - x, target.z - z);
    right.set(Math.cos(figure.rotation.y), 0, -Math.sin(figure.rotation.y));
    const slope = (groundAt(x + .15, z) - groundAt(x - .15, z)) / .3;
    groundNormal.set(-slope, 1, 0).normalize();
    shadow.position.copy(figure.position).addScaledVector(groundNormal, .014);
    shadow.quaternion.setFromUnitVectors(cardNormal, groundNormal);

    // Follow the hillside at the soles while keeping the upper body upright.
    const vertices = figure.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const height = rest.getY(i);
      const groundBlend = 1 - THREE.MathUtils.smoothstep(height, .06, .78);
      vertices.setY(i, height + (uphill ? slope * right.x * rest.getX(i) * groundBlend : 0));
    }
    vertices.needsUpdate = true;
    const key = scene.children.find((child): child is THREE.DirectionalLight =>
      child instanceof THREE.DirectionalLight && child.visible);
    if (key) key.getWorldPosition(sun).sub(key.target.getWorldPosition(target)).normalize();
    else sun.set(-.55, .8, .2);
    const light = Math.atan2(-sun.y, sun.dot(right));
    if (actor.drawnFrame === frame && Math.abs(actor.drawnLight - light) < .001) return;

    const {context, texture} = actor.card;
    context.clearRect(0, 0, 600, 1000);
    if (uphill) {
      const distance = Math.max(0, actorX - x);
      const mirror = right.x >= 0;
      context.save();
      if (mirror) {
        context.translate(600, 0);
        context.scale(-1, 1);
      }
      const pen = new Pen(context);
      const phase = distance / (2 * RUN_STEP * cardScale);
      const projection = Math.max(.15, Math.abs(right.x));
      const cardLight = mirror ? Math.PI - light : light;
      drawCoastRun(pen, outfit, 17, phase, projection, rear, cardLight, .28 + .72 * glide((frame - 575) / 16));
      context.restore();
    } else {
      // Eyes lead the opening glance and the turn away from the exposed shore.
      const glance = glide((frame - 7) / 20);
      const lean = glide((frame - 15) / 25) - .45 * glide((frame - 54) / 22);
      const track = glide((frame - 431) / 73);
      const concern = glide((frame - 471) / 41);
      const turn = glide((frame - 554) / 21);
      const listen = glide((frame - 514) / 13);
      const blink = [0, .65, 1, .55, 0][frame - (frame < 100 ? 42 : frame < 520 ? 443 : 551)] ?? 0;
      const pen = new Pen(context);
      const facing = frame >= 568 ? -1 : frame >= 558 ? 0 : 1;
      const tilt = 4.5 * lean + 6.5 * track - 3.5 * concern - 16 * turn;
      const headTilt = 6 * glance - 2 * lean + 10 * track - 5 * concern - 9 * listen - 15 * turn;
      bodyFront(pen, outfit, {
        mode: 'stand',
        expr: frame >= 533 && frame < 552 ? 'shock' : frame >= 478 ? 'nervous' : 'neutral',
        facing,
        look: -.35 + 1.3 * glance + 1.35 * track - 1.4 * listen - 2.7 * turn,
        tilt, headTilt,
        blink,
        light,
        seed: 17,
      });
      const head = headBlob(17, 118, facing);
      const chin = 975 - 2.5 * head.b * 2;
      const toHip = .98 * head.b * 2;
      const angle = tilt * Math.PI / 180;
      pen.rot = [(tilt + headTilt) * Math.PI / 180, 300, chin, Math.sin(angle) * toHip,
        (1 - Math.cos(angle)) * toHip];
      drawWovenHat(pen, 300 + 7 * facing, chin - head.b, head, light);
      if (frame >= 538 && frame < 553) {
        drawReactionMark(pen, '!', 300 + 1.74 * head.a, chin - 1.64 * head.b, frame - 538);
      }
    }
    texture.needsUpdate = true;
    actor.drawnFrame = frame;
    actor.drawnLight = light;
  });

  return <primitive object={actor.root} dispose={null}/>;
}
