import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {NOINK} from '../bridge-recreation/ink';
import {cardShade, CARD_K} from '../upstream/templates/bridge/cardshade';
import {Pen, blobPts, headBlob, mul, thickAngle} from '../bridge-recreation/toon';
import {mayorHairline, mayorHead} from './mayor-look';

type Vec3 = [number, number, number];
type Point = [number, number];
type Role = 'mayor' | 'guard' | 'carpenter' | 'baker' | 'villager';
type Expression = 'neutral' | 'proud' | 'alert' | 'worried' | 'amused' | 'focused';

export interface PersonProps {
  role: Role;
  position: Vec3;
  yaw?: number;
  variant?: number;
  expression?: Expression;
  step?: number;
  stride?: number;
  hand?: Vec3;
  otherHand?: Vec3;
  tilt?: number;
  crouch?: number;
  frame?: number;
  scale?: number;
  chain?: boolean;
  lookUp?: number;
}

export interface WoodpeckerProps {
  position: Vec3;
  yaw?: number;
  wing?: number;
  pitch?: number;
  peck?: number;
  scale?: number;
}

const INK = '#2a1b29';
const CARD_W = 2.25;
const CARD_H = 2.50;
const CARD_BASE = -.09;
const clamp = (n: number, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const blend = (a: number, b: number, t: number) => a + (b - a) * t;
const NO_OUTLINE = (mesh: THREE.Object3D) => mesh.layers.set(NOINK);
const contactShade = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  vertexShader: 'varying vec2 tex; void main(){ tex=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'varying vec2 tex; void main(){ float d=length((tex-.5)*2.); gl_FragColor=vec4(.040,.028,.064,.39*(1.-smoothstep(.16,1.,d))); }',
});

function shape(ctx: CanvasRenderingContext2D, fill: string | CanvasGradient, trace: () => void, width = .019) {
  ctx.beginPath();
  trace();
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (width > 0) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number, trace: () => void) {
  ctx.beginPath();
  trace();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function oval(ctx: CanvasRenderingContext2D, center: Point, rx: number, ry: number, fill: string | CanvasGradient, width = .019, angle = 0) {
  shape(ctx, fill, () => ctx.ellipse(...center, rx, ry, angle, 0, 2 * Math.PI), width);
}

function line(ctx: CanvasRenderingContext2D, color: string, width: number, points: Point[]) {
  stroke(ctx, color, width, () => {
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
  });
}

function gradient(ctx: CanvasRenderingContext2D, x: number, light: string, dark: string) {
  const fill = ctx.createLinearGradient(x - .31, .06, x + .32, -.04);
  fill.addColorStop(0, light);
  fill.addColorStop(.58, light);
  fill.addColorStop(1, dark);
  return fill;
}

const OUTFITS = {
  mayor: {skin:'#ffe1bf', shade:'#e6aa87', coat:'#308b89', dark:'#225a61', trousers:'#393549', hair:'#30222e'},
  guard: {skin:'#f6cea6', shade:'#d69b78', coat:'#626f9c', dark:'#424f75', trousers:'#39344b', hair:'#49303a'},
  carpenter: {skin:'#e5b189', shade:'#c48a68', coat:'#bc7a48', dark:'#83472e', trousers:'#483648', hair:'#412f32'},
  baker: {skin:'#ffe0bc', shade:'#dbab87', coat:'#cb8f62', dark:'#9a553f', trousers:'#44425a', hair:'#755044'},
  villager: {skin:'#eac29c', shade:'#c78e70', coat:'#7e8b58', dark:'#545c3c', trousers:'#4d4255', hair:'#48332f'},
} as const;

const VILLAGER_COLORS = [
  ['#7e8b58','#545c3c','#e1b48b','#ba7f63'],
  ['#a15465','#703748','#ecc29a','#cc8e69'],
  ['#be8546','#885730','#ad7559','#90533f'],
  ['#657a9d','#42516e','#edbd9b','#c98b71'],
] as const;

function outfitFor(role: Role, variant: number) {
  const outfit = OUTFITS[role];
  if (role === 'guard' && variant % 2) return {...outfit, coat: '#7d5d84', dark: '#543b61'};
  if (role !== 'villager') return outfit;
  const [coat, dark, skin, shade] = VILLAGER_COLORS[Math.abs(variant) % VILLAGER_COLORS.length];
  return {...outfit, coat, dark, skin, shade};
}

function groundedFoot(step: number, stride: number, side: number) {
  const normalized = (step / (2 * Math.PI) + (side > 0 ? .5 : 0)) % 1;
  const t = normalized < 0 ? normalized + 1 : normalized;
  if (t < .58) return {advance: stride * blend(.30, -.30, t / .58), lift: 0};
  const swing = (t - .58) / .42;
  return {advance: stride * blend(-.30, .30, swing), lift: stride * .24 * Math.sin(Math.PI * swing)};
}

const HEAD_SEEDS = {mayor: 23, guard: 7, carpenter: 12, baker: 31, villager: 18} as const;
const castHeads = new Map<number, Point[]>();

function castHead(seed: number): Point[] {
  let outline = castHeads.get(seed);
  if (!outline) {
    outline = blobPts(0, 0, headBlob(seed, 1, 0), 64).map(([x, y]) => [x, -y]);
    castHeads.set(seed, outline);
  }
  return outline;
}

function tracePoints(ctx: CanvasRenderingContext2D, points: Point[], width: number, height: number) {
  ctx.moveTo(points[0][0] * width, points[0][1] * height);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0] * width, points[i][1] * height);
}

// Face strokes and dimensions come from Diamond V5's drawPerson, in its
// original 118px head units. The Mayor rig supplies view and world gaze.
const DIAMOND_MOOD = {neutral: 'calm', proud: 'sly', alert: 'inspect', worried: 'doubt', amused: 'pleased', focused: 'inspect'} as const;

function diamondFace(pen: Pen, mood: Expression, facing: number, front: number, gaze: number, blink: number, lookUp: number) {
  const m = DIAMOND_MOOD[mood];
  const profile = Math.abs(facing);
  const fx = facing * blend(18, 41, profile);
  const ey = 4;
  const g = pen.g;
  g.save();
  g.globalAlpha *= clamp((front + .29) / .37);
  for (const q of [-1, 1]) {
    const ex = fx + q * blend(31, 24, profile);
    const farEye = q * facing > 0;
    const alpha = farEye ? clamp((.84 - profile) / .22) : 1;
    if (alpha <= 0) continue;
    g.save();
    g.globalAlpha *= alpha;
    if (farEye && alpha < 1) {
      g.translate(ex, ey);
      g.scale(Math.sqrt(alpha), Math.sqrt(alpha));
      g.translate(-ex, -ey);
    }
    if (blink > .8) pen.stroke([[ex - 15, ey], [ex + 15, ey]], 8);
    else if (m === 'inspect' || m === 'sly' || m === 'doubt') {
      pen.ell(ex, ey + 1, 18, m === 'sly' ? 11 : 17, '#fffaf0', 5);
      pen.dot(ex + gaze, ey - 5 * lookUp, 7);
    } else if (m === 'pleased') pen.arc(ex, ey + 8, 17, 12, 205, 335, 7);
    else {
      pen.ell(ex + facing * 4, ey + 5, 15, blink ? 4 : 11, INK, 0, 0, 180);
      pen.stroke([[ex - 18, ey], [ex + 18, ey]], 8);
    }
    const browY = ey - 44 - 4 * lookUp + (m === 'doubt' ? q * 10 : 0);
    pen.stroke([[ex - 18, browY + (m === 'sly' ? -q * 3 : 0)], [ex + 17, browY + q * 5]], 9);
    g.restore();
  }

  if (m === 'pleased') {
    pen.ell(fx, 44, 23, 10, '#5a1e28', 5, 0, 180);
    pen.stroke([[fx - 18, 46], [fx + 18, 46]], 5, '#fff8ed');
  } else if (m === 'inspect') pen.stroke([[fx - 13, 49], [fx + 13, 47]], 6);
  else if (m === 'doubt') pen.stroke([[fx - 14, 51], [fx + 13, 47]], 7);
  else pen.arc(fx + 3, 43, 22, 10, 10, 155, 7);
  g.restore();
}

function personArt(ctx: CanvasRenderingContext2D, pose: PersonProps, relativeYaw: number, contact: (point: Vec3) => Point) {
  const {role, variant = 0, expression = 'neutral', step = 0, stride = 0, tilt = 0, crouch = 0, frame = 0, chain = true, lookUp = 0} = pose;
  const outfit = outfitFor(role, variant);
  const facing = Math.sin(relativeYaw);
  const front = Math.cos(relativeYaw);
  const profile = Math.abs(facing);
  const wide = role === 'mayor' || role === 'baker' ? 1.08 : 1;
  const kneel = clamp(crouch);
  const movement = clamp(stride) * (1 - kneel);
  const bob = movement * (.022 + .025 * Math.cos(step * 2));
  const pelvis = .71 + bob - .51 * kneel;
  const lean = -tilt - facing * movement * .12;
  const project = (x: number, y: number, z: number): Point => [x * front + z * facing, y];
  const torsoPoint = (x: number, y: number, z: number): Point => {
    const [horizontal] = project(x, y, z);
    const height = y - .71;
    return [Math.cos(lean) * horizontal - Math.sin(lean) * height, pelvis + Math.sin(lean) * horizontal + Math.cos(lean) * height];
  };

  const sides = facing > 0 ? [1, -1] : [-1, 1];
  for (const side of sides) {
    const foot = groundedFoot(step, movement, side);
    const hip = torsoPoint(side * .116, .78, 0);
    const ankle = project(side * .136, foot.lift + .083, foot.advance);
    const knee = project(side * (.128 + kneel * .048), .405 + foot.lift * .31 - kneel * .215, foot.advance * .44 - foot.lift * .39 + kneel * .23);
    stroke(ctx, outfit.trousers, .049, () => {
      ctx.moveTo(...hip);
      ctx.quadraticCurveTo(...knee, ...ankle);
    });
    const [heel, floor] = project(side * .136, foot.lift, foot.advance - .073);
    const [toe] = project(side * .136, foot.lift, foot.advance + .128);
    const shoeX = (heel + toe) / 2;
    const rx = .064 + Math.abs(toe - heel) * .30;
    oval(ctx, [shoeX, floor + .036], rx, .035, INK, 0);
    line(ctx, outfit.trousers, .049, [ankle, [shoeX, floor + .048]]);
  }

  const reach = (side: number) => {
    const target = side > 0 ? pose.hand : pose.otherHand;
    const shoulder = torsoPoint(side * .163 * wide, 1.199, -.004);
    const swing = Math.cos(step + (side > 0 ? Math.PI : 0)) * movement;
    const hand = target ? contact(target) : torsoPoint(side * .30 * wide, .77 + Math.abs(swing) * .13, swing * .29);
    const elbow = target
      ? [blend(shoulder[0], hand[0], .52) + side * front * .068, blend(shoulder[1], hand[1], .50) - .12] as Point
      : torsoPoint(side * .278 * wide, .98, swing * .11 - .04);
    stroke(ctx, outfit.dark, .051, () => {
      ctx.moveTo(...shoulder);
      ctx.quadraticCurveTo(...elbow, ...hand);
    });
    const palm = target ? .048 : .036;
    oval(ctx, hand, palm, palm * .90, target ? outfit.skin : INK, target ? .011 : 0);
  };

  const nearArm = pose.hand && !pose.otherHand ? 1 : pose.otherHand && !pose.hand ? -1 : facing > .16 ? -1 : 1;
  reach(-nearArm);
  ctx.save();
  ctx.translate(0, pelvis);
  ctx.rotate(lean);
  const torsoWidth = wide * blend(.239, .180, profile);
  shape(ctx, gradient(ctx, 0, outfit.coat, outfit.dark), () => {
    ctx.moveTo(facing * .035, -.008);
    ctx.bezierCurveTo(-torsoWidth * .88, -.022, -torsoWidth * 1.06, .085, -torsoWidth * 1.02, .265);
    ctx.bezierCurveTo(-torsoWidth * .99, .471, -torsoWidth * .57, .651, facing * .025, .653);
    ctx.bezierCurveTo(torsoWidth * .68, .657, torsoWidth * 1.00, .455, torsoWidth * 1.03, .249);
    ctx.bezierCurveTo(torsoWidth * 1.07, .081, torsoWidth * .83, -.015, facing * .035, -.008);
  }, .027);

  const frontOpacity = clamp((front + .13) / .42);
  const seam = facing * .145;
  ctx.save();
  ctx.globalAlpha *= frontOpacity;
  if (role === 'mayor' || role === 'guard') {
    shape(ctx, role === 'mayor' ? '#e8d8b6' : '#aeb6c1', () => {
      ctx.moveTo(seam - .105 * Math.max(.28, front), .60);
      ctx.lineTo(seam + .109 * Math.max(.28, front), .60);
      ctx.lineTo(seam + .005, .445);
    }, .013);
    for (const y of [.29, .18]) oval(ctx, [seam + .030, y], .017, .016, '#dfb55c', 0);
    if (role === 'mayor' && chain) {
      const shoulder = .17 * Math.max(.23, front);
      stroke(ctx, '#513e36', .032, () => {
        ctx.moveTo(seam - shoulder, .558);
        ctx.quadraticCurveTo(seam + .013, .258, seam + shoulder, .564);
      });
      stroke(ctx, '#e9be64', .019, () => {
        ctx.moveTo(seam - shoulder, .558);
        ctx.quadraticCurveTo(seam + .013, .258, seam + shoulder, .564);
      });
      oval(ctx, [seam + .013, .394], .046, .041, '#f3cc78', .013);
      oval(ctx, [seam + .014, .397], .017, .014, '#bc713c', 0);
    }
  } else {
    const apron = role === 'carpenter' || role === 'baker';
    if (apron) {
      const span = .16 * Math.max(.27, front);
      const fabric = role === 'baker' ? '#efe2cb' : '#a0654d';
      shape(ctx, fabric, () => {
        ctx.moveTo(seam - span * .66, .49);
        ctx.lineTo(seam + span * .63, .49);
        ctx.lineTo(seam + span, .02);
        ctx.quadraticCurveTo(seam, -.015, seam - span, .02);
      }, .015);
      line(ctx, role === 'baker' ? '#a98672' : '#71453c', .010, [[seam - span * .53, .23], [seam + span * .53, .23], [seam + span * .45, .13], [seam - span * .45, .13]]);
      line(ctx, fabric, .024, [[seam - span * .59, .49], [seam - .058 * front, .603], [seam + .067 * front, .607], [seam + span * .60, .49]]);
    } else line(ctx, '#dfb28d', .028, [[seam - .11 * front, .575], [seam + .03, .499], [seam + .11 * front, .558]]);
  }
  ctx.restore();

  const headX = facing * .021;
  const headY = .875 + .018 * lookUp;
  const headWidth = (role === 'mayor' ? .320 : role === 'baker' ? .291 : .283) * blend(1, .94, profile);
  const headHeight = role === 'mayor' ? .313 : .295;
  const head = role === 'mayor' ? mayorHead : castHead(HEAD_SEEDS[role] + (role === 'villager' ? variant * 3 : 0));
  ctx.translate(headX, headY);
  ctx.rotate(facing * .105 * lookUp);
  const outline = head.map(([x, y]): Point => [x * 118, -y * 118]);
  const pen = new Pen(ctx);
  ctx.save();
  ctx.scale(headWidth / 118, -headHeight / 118);
  pen.shadedFill(outline, outfit.skin, mul(outfit.skin, [.96, .86, .84]), -2.1, 118);
  pen.inkRing(outline, 12, thickAngle(-2.1));
  ctx.restore();

  // Keep the seeded head silhouette fixed through glances and turns.
  ctx.save();
  ctx.beginPath();
  tracePoints(ctx, head, headWidth, headHeight);
  ctx.closePath();
  ctx.clip();
  const back = clamp((-front + .09) / .81);
  if (role === 'mayor') {
    shape(ctx, outfit.hair, () => tracePoints(ctx, mayorHairline, headWidth, headHeight), 0);
  } else {
    shape(ctx, outfit.hair, () => {
      ctx.moveTo(-headWidth, headHeight * .24);
      ctx.quadraticCurveTo(-headWidth * .72, headHeight * .96, 0, headHeight * .94);
      ctx.quadraticCurveTo(headWidth * .69, headHeight * 1.04, headWidth, headHeight * .35);
      ctx.quadraticCurveTo(headWidth * .10, headHeight * .51, -headWidth, headHeight * .24);
    }, 0);
  }
  if (back > 0) {
    ctx.globalAlpha *= back;
    shape(ctx, outfit.hair, () => {
      ctx.moveTo(-headWidth * 1.1, headHeight);
      ctx.lineTo(headWidth * 1.1, headHeight);
      ctx.lineTo(headWidth * 1.1, -headHeight * .58);
      ctx.quadraticCurveTo(0, -headHeight * .96, -headWidth * 1.1, -headHeight * .50);
    }, 0);
  }
  ctx.restore();

  if (role === 'guard' || role === 'baker' || (role === 'villager' && variant % 2 === 1)) {
    const guard = role === 'guard';
    const capColor = guard ? '#63739b' : role === 'baker' ? '#eee5cf' : '#ad5f72';
    const brimY = .52 * headHeight;
    const capHeight = role === 'baker' ? .146 : .130;
    const capX = facing * headWidth * .09;
    shape(ctx, capColor, () => {
      ctx.moveTo(capX - headWidth * .92, brimY);
      ctx.bezierCurveTo(capX - headWidth * .88, brimY + capHeight, capX - headWidth * .31, brimY + capHeight * 1.17, capX, brimY + capHeight * 1.16);
      ctx.bezierCurveTo(capX + headWidth * .63, brimY + capHeight * 1.14, capX + headWidth * .91, brimY + capHeight * .66, capX + headWidth * .95, brimY);
      ctx.quadraticCurveTo(capX, brimY - .032, capX - headWidth * .92, brimY);
    }, .023);
    if (guard) {
      line(ctx, '#bfc5d0', .012, [[capX - headWidth * .74, brimY + .022], [capX + headWidth * .73, brimY + .022]]);
      oval(ctx, [capX + facing * .124, brimY + .071], .022, .022, '#edc878', .009);
    }
  }

  const blinkPhase = (Math.floor(frame) + 21 + variant * 17 + role.length * 6) % 97;
  const blink = blinkPhase === 1 || blinkPhase === 2 ? 1 : blinkPhase === 0 || blinkPhase === 3 ? .5 : 0;
  const gaze = pose.hand ? clamp((contact(pose.hand)[0] - headX) * 36, -7, 7) : facing * 5;
  ctx.save();
  ctx.scale(headWidth / 118, -headHeight / 118);
  diamondFace(pen, expression, facing, front, gaze, blink, lookUp);
  ctx.restore();
  ctx.restore();
  reach(nearArm);
}

type CardProps = {
  position: Vec3;
  scale: number;
  facing: number;
  bird?: boolean;
  paint: (context: CanvasRenderingContext2D, relativeYaw: number, contact: (point: Vec3) => Point) => void;
};

function Card({position, scale, facing, bird = false, paint}: CardProps) {
  const {camera} = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const lastDraw = useRef<{paint: CardProps['paint']; x: number; y: number; z: number} | undefined>(undefined);
  const resources = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = bird ? 740 : 608;
    canvas.height = bird ? 460 : 672;
    const context = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = cardShade(new THREE.MeshLambertMaterial({map: texture, alphaTest: .42, side: THREE.DoubleSide}));
    const depth = new THREE.MeshDepthMaterial({map: texture, alphaTest: .42, depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide});
    const width = bird ? 1.68 : CARD_W;
    const height = bird ? 1.06 : CARD_H;
    const base = bird ? -.19 : CARD_BASE;
    const geometry = new THREE.PlaneGeometry(width, height).translate(0, height / 2 + base, 0);
    return {canvas, context, texture, material, depth, geometry, width, height, base};
  }, [bird]);

  useLayoutEffect(() => () => {
    resources.texture.dispose();
    resources.material.dispose();
    resources.depth.dispose();
    resources.geometry.dispose();
  }, [resources]);

  const draw = () => {
    if (!mesh.current) return;
    const {x, y, z} = camera.position;
    const last = lastDraw.current;
    if (last?.paint === paint && last.x === x && last.y === y && last.z === z) return;
    lastDraw.current = {paint, x, y, z};
    const cameraX = camera.position.x - position[0];
    const cameraZ = camera.position.z - position[2];
    const distance = Math.hypot(cameraX, cameraZ);
    const yaw = distance > .0001 ? Math.atan2(cameraX, cameraZ) : 0;
    mesh.current.rotation.y = yaw;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const contact = (point: Vec3): Point => {
      const dx = point[0] - position[0];
      const dz = point[2] - position[2];
      const forward = sin * dx + cos * dz;
      const projection = distance / Math.max(distance * .30, distance - forward);
      return [(cos * dx - sin * dz) * projection / scale, ((point[1] - camera.position.y) * projection + camera.position.y - position[1]) / scale];
    };
    const {canvas, context, texture, width, height, base} = resources;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(canvas.width / width, 0, 0, -canvas.height / height, canvas.width / 2, canvas.height * (height + base) / height);
    context.lineJoin = 'round';
    context.lineCap = 'round';
    paint(context, facing - yaw, contact);
    texture.needsUpdate = true;
  };

  useLayoutEffect(draw);
  useFrame(draw);
  return <group position={position}>
    {!bird && position[1] < .12 && <mesh position={[.045, .011, .027]} rotation={[-Math.PI / 2, 0, 0]} scale={[.44 * scale, .26 * scale, 1]} onUpdate={NO_OUTLINE} material={contactShade}>
      <circleGeometry args={[1, 24]}/>
    </mesh>}
    <mesh ref={mesh} scale={scale} geometry={resources.geometry} material={resources.material} customDepthMaterial={resources.depth} castShadow={!bird} receiveShadow onUpdate={NO_OUTLINE}
      onBeforeRender={(renderer) => {CARD_K.uPx.value = (renderer.getRenderTarget()?.height ?? renderer.domElement.height) / 1920;}} />
  </group>;
}

export function Person(pose: PersonProps) {
  return <Card position={pose.position} scale={pose.scale ?? 1} facing={pose.yaw ?? 0}
    paint={(ctx, relativeYaw, contact) => personArt(ctx, pose, relativeYaw, contact)}/>;
}

function birdArt(ctx: CanvasRenderingContext2D, pose: WoodpeckerProps, relativeYaw: number, contact: (point: Vec3) => Point) {
  const wing = clamp(pose.wing ?? 0);
  const peck = clamp(pose.peck ?? 0);
  const pitch = pose.pitch ?? 0;
  const yaw = pose.yaw ?? 0;
  const scale = pose.scale ?? 1;
  const side = Math.sin(relativeYaw);
  const front = Math.cos(relativeYaw);
  const profile = Math.abs(side);
  const billSign = side < 0 ? -1 : 1;
  const project = (x: number, y: number, z: number): Point => {
    const h = y * Math.cos(pitch) + z * Math.sin(pitch);
    const d = z * Math.cos(pitch) - y * Math.sin(pitch);
    const [ox, oy, oz] = pose.position;
    return contact([ox + scale * (Math.cos(yaw) * x + Math.sin(yaw) * d), oy + scale * h, oz + scale * (-Math.sin(yaw) * x + Math.cos(yaw) * d)]);
  };

  const foot = project(0, .014, .025);
  const hip = project(0, .18, -.055);
  const shoulder = project(0, .32 - peck * .03, .05 + peck * .07);
  const head = project(0, .461 - peck * .067, .11 + peck * .095);
  const tail = project(0, .125 + wing * .032, -.31);
  const tailRoot = project(0, .205, -.10);
  const headHeight = .136 - peck * .008;
  const headWidth = blend(.126, .151, profile);
  const tailSide = .08 * Math.max(.36, Math.abs(front));
  shape(ctx, '#3f333e', () => {
    ctx.moveTo(tailRoot[0] - tailSide, tailRoot[1] + .03);
    ctx.lineTo(tail[0] - tailSide * .62, tail[1] - .071);
    ctx.quadraticCurveTo(tail[0], tail[1] - .092, tail[0] + tailSide * .72, tail[1] - .056);
    ctx.lineTo(tailRoot[0] + tailSide, tailRoot[1] + .02);
  }, .014);

  const wingPath = (sign: number, near: boolean) => {
    const attach = project(sign * .102, .285, -.045);
    const spread = project(sign * (.16 + wing * .44), .20 + wing * .31, -.22 + wing * .10);
    const tip = project(sign * (.16 + wing * .55), .19 + wing * .41, -.17 + wing * .13);
    const lower = project(sign * (.11 + wing * .26), .17 + wing * .12, -.245);
    shape(ctx, near ? '#34313e' : '#53525d', () => {
      ctx.moveTo(attach[0] - .052, attach[1] + .058);
      ctx.quadraticCurveTo(spread[0], spread[1] + .102, tip[0], tip[1] + .044);
      ctx.quadraticCurveTo(spread[0] + sign * .025, spread[1] - .035, lower[0], lower[1] - .034);
      ctx.quadraticCurveTo(attach[0] + .103, attach[1] - .056, attach[0] - .052, attach[1] + .058);
    }, .014);
    const patchX = blend(attach[0], spread[0], .39);
    const patchY = blend(attach[1], spread[1], .40);
    oval(ctx, [patchX, patchY], .076 + .042 * wing, .035, near ? '#efe7d8' : '#c4bec4', 0,
      Math.atan2(spread[1] - attach[1], spread[0] - attach[0]));
  };

  for (const n of [-1, 1]) {
    const start = project(n * .066, .124 + wing * .016, -.055);
    const ankle = project(n * .069, .041 + wing * .029, .007);
    const toe = project(n * .078, .009 + wing * .025, .102 - wing * .07);
    line(ctx, INK, .020, [start, ankle, toe]);
    line(ctx, '#af8c6d', .009, [start, ankle, toe]);
    line(ctx, INK, .013, [ankle, [foot[0] + n * .063, foot[1] + .005 + wing * .018]]);
  }
  const nearWing = side > 0 ? -1 : 1;
  wingPath(-nearWing, false);
  const bodyX = blend(hip[0], shoulder[0], .41);
  const bodyY = blend(hip[1], shoulder[1], .38);
  const bodyAngle = Math.atan2(shoulder[1] - hip[1], shoulder[0] - hip[0]) - Math.PI / 2;
  oval(ctx, [bodyX, bodyY], .132, .19, gradient(ctx, bodyX, '#494650', '#23202b'), .019, bodyAngle);
  oval(ctx, [bodyX + side * .067, bodyY + .010], .083, .145, '#f3e8d5', 0, bodyAngle);
  wingPath(nearWing, true);

  oval(ctx, head, headWidth, headHeight, '#383341', .018);
  const cheek: Point = [head[0] + side * .048, head[1] - .038];
  oval(ctx, cheek, .088, .063, '#f6e7ce', 0, -.22 * side);
  shape(ctx, '#c44448', () => {
    ctx.moveTo(head[0] - headWidth * .94, head[1] + .036);
    ctx.bezierCurveTo(head[0] - headWidth * .80, head[1] + .142, head[0] + headWidth * .54, head[1] + .174, head[0] + headWidth * .85, head[1] + .078);
    ctx.quadraticCurveTo(head[0] + headWidth * .11, head[1] + .044, head[0] - headWidth * .94, head[1] + .036);
  }, .012);
  stroke(ctx, '#ed7a65', .011, () => {
    ctx.moveTo(head[0] - headWidth * .58, head[1] + .094);
    ctx.quadraticCurveTo(head[0] - .014, head[1] + .137, head[0] + headWidth * .49, head[1] + .102);
  });

  const bill = project(0, .443 - peck * .063, .354 + peck * .066);
  const billBase = project(0, .436 - peck * .057, .179 + peck * .095);
  const billHalf = blend(.047, .024, profile);
  shape(ctx, '#b5a294', () => {
    ctx.moveTo(billBase[0] - billSign * billHalf, billBase[1] + .038);
    ctx.lineTo(...bill);
    ctx.lineTo(billBase[0] - billSign * billHalf, billBase[1] - .030);
    ctx.quadraticCurveTo(billBase[0] - billSign * billHalf * 1.40, billBase[1], billBase[0] - billSign * billHalf, billBase[1] + .038);
  }, .013);
  line(ctx, '#6b5b5b', .007, [[billBase[0] - billSign * billHalf, billBase[1] - .006], bill]);

  for (const n of [-1, 1]) {
    const visible = clamp((Math.cos(relativeYaw - n * .70) + .13) / .53);
    if (visible <= 0) continue;
    const x = head[0] + headWidth * .79 * Math.sin(relativeYaw - n * .70);
    ctx.save();
    ctx.globalAlpha *= visible;
    oval(ctx, [x, head[1] + .024], .030, .033, '#fcf4e4', .008);
    oval(ctx, [x + side * .007, head[1] + .023], .015, .018, INK, 0);
    ctx.restore();
  }
}

export function Woodpecker(pose: WoodpeckerProps) {
  return <Card bird position={pose.position} scale={pose.scale ?? 1} facing={pose.yaw ?? 0}
    paint={(ctx, relativeYaw, contact) => birdArt(ctx, pose, relativeYaw, contact)}/>;
}
