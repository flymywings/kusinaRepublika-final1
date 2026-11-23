import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {NOINK} from '../bridge-recreation/ink';
import {cardShade, CARD_K} from '../upstream/templates/bridge/cardshade';

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
  mayor: {skin:'#f2c198', shade:'#d99979', coat:'#318087', dark:'#205660', trousers:'#3d465e', hair:'#30252e'},
  guard: {skin:'#e8b586', shade:'#bf805b', coat:'#59698d', dark:'#39476e', trousers:'#30394d', hair:'#49303a'},
  carpenter: {skin:'#d8a47c', shade:'#a96f56', coat:'#b67646', dark:'#79452f', trousers:'#49404d', hair:'#412f32'},
  baker: {skin:'#efc39d', shade:'#d89979', coat:'#cb8f62', dark:'#9a553f', trousers:'#44425a', hair:'#755044'},
  villager: {skin:'#e1b48b', shade:'#ba7f63', coat:'#7e8b58', dark:'#545c3c', trousers:'#4d4255', hair:'#48332f'},
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

function personArt(ctx: CanvasRenderingContext2D, pose: PersonProps, relativeYaw: number, contact: (point: Vec3) => Point) {
  const {role, variant = 0, expression = 'neutral', step = 0, stride = 0, tilt = 0, crouch = 0, frame = 0, chain = true} = pose;
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
    line(ctx, INK, .101, [hip, knee, ankle]);
    line(ctx, outfit.trousers, .069, [hip, knee, ankle]);
    const [heel, floor] = project(side * .136, foot.lift, foot.advance - .073);
    const [toe] = project(side * .136, foot.lift, foot.advance + .128);
    const shoeX = (heel + toe) / 2;
    const rx = .083 + Math.abs(toe - heel) * .30;
    shape(ctx, '#3b2b3b', () => {
      ctx.moveTo(shoeX - rx, floor + .010);
      ctx.quadraticCurveTo(shoeX - rx - .021, floor + .093, shoeX - rx * .35, floor + .106);
      ctx.quadraticCurveTo(shoeX + rx * .98, floor + .106, shoeX + rx, floor + .042);
      ctx.quadraticCurveTo(shoeX + rx, floor + .01, shoeX + rx * .52, floor + .009);
    }, .017);
    line(ctx, '#b48770', .011, [[shoeX - rx * .45, floor + .080], [shoeX + rx * .34, floor + .080]]);
  }

  const reach = (side: number) => {
    const target = side > 0 ? pose.hand : pose.otherHand;
    const shoulder = torsoPoint(side * .228 * wide, 1.252, -.004);
    const swing = Math.cos(step + (side > 0 ? Math.PI : 0)) * movement;
    const hand = target ? contact(target) : torsoPoint(side * .30 * wide, .77 + Math.abs(swing) * .13, swing * .29);
    const elbow = target
      ? [blend(shoulder[0], hand[0], .52) + side * front * .068, blend(shoulder[1], hand[1], .50) - .12] as Point
      : torsoPoint(side * .278 * wide, .98, swing * .11 - .04);
    line(ctx, INK, .118, [shoulder, elbow, hand]);
    line(ctx, outfit.dark, .082, [shoulder, elbow, hand]);
    line(ctx, outfit.coat, .044, [[shoulder[0] - .012, shoulder[1] + .009], [elbow[0] - .011, elbow[1] + .008]]);
    oval(ctx, hand, .062, .055, outfit.skin, .015, -.25 * facing);
    if (target) {
      stroke(ctx, '#956553', .009, () => {
        ctx.moveTo(hand[0] - .019, hand[1] - .014);
        ctx.quadraticCurveTo(hand[0] + .003, hand[1] - .021, hand[0] + .015, hand[1] - .008);
      });
    }
  };

  const nearArm = pose.hand && !pose.otherHand ? 1 : pose.otherHand && !pose.hand ? -1 : facing > .16 ? -1 : 1;
  reach(-nearArm);
  ctx.save();
  ctx.translate(0, pelvis);
  ctx.rotate(lean);
  const torsoWidth = wide * blend(.275, .195, profile);
  shape(ctx, gradient(ctx, 0, outfit.coat, outfit.dark), () => {
    ctx.moveTo(-torsoWidth * .97, .035);
    ctx.quadraticCurveTo(-torsoWidth * 1.02, .34, -torsoWidth * .88, .53);
    ctx.quadraticCurveTo(-torsoWidth * .45, .67, facing * .045, .655);
    ctx.quadraticCurveTo(torsoWidth * .79, .67, torsoWidth * .93, .52);
    ctx.quadraticCurveTo(torsoWidth, .32, torsoWidth * 1.03, .041);
    ctx.lineTo(torsoWidth * .36, .007);
    ctx.quadraticCurveTo(facing * .035, .035, -torsoWidth * .32, .012);
  });

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
    line(ctx, outfit.dark, .013, [[seam + .005, .442], [seam + .015, .066]]);
    for (const y of [.30, .20, .105]) oval(ctx, [seam + .036, y], .023, .020, '#dfb55c', .008);
    if (role === 'mayor' && chain) {
      const shoulder = .19 * Math.max(.23, front);
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
    } else {
      line(ctx, '#dfb28d', .028, [[seam - .12 * front, .595], [seam + .04, .497], [seam + .13 * front, .557]]);
      line(ctx, outfit.dark, .014, [[seam, .468], [seam + .014, .06]]);
    }
  }
  ctx.restore();

  const headX = facing * .035;
  const headY = .875;
  const headWidth = blend(role === 'mayor' ? .315 : .275, role === 'mayor' ? .257 : .226, profile);
  const headH = role === 'baker' ? .290 : .303;
  const back = clamp((-front + .08) / .74);
  ctx.translate(headX, headY);
  shape(ctx, gradient(ctx, 0, outfit.skin, outfit.shade), () => {
    ctx.moveTo(-headWidth * .92, .030);
    ctx.bezierCurveTo(-headWidth * .95, headH * .78, -headWidth * .52, headH * 1.02, -.015, headH * .99);
    ctx.bezierCurveTo(headWidth * .70, headH * 1.015, headWidth * 1.02, headH * .68, headWidth * .99, .015);
    ctx.bezierCurveTo(headWidth * .98, -headH * .66, headWidth * .51, -headH * .99, .028, -headH * .94);
    ctx.bezierCurveTo(-headWidth * .62, -headH * .93, -headWidth * .91, -headH * .55, -headWidth * .92, .030);
  }, .022);

  // The hairline moves continuously across the same head silhouette as it turns.
  const hairDepth = back * .41;
  const sweep = facing * .085;
  shape(ctx, outfit.hair, () => {
    ctx.moveTo(-headWidth * .96, .073 - hairDepth * .50);
    ctx.bezierCurveTo(-headWidth * 1.04, .245, -headWidth * .65, .324, -.047, .320);
    ctx.bezierCurveTo(.042, .325, headWidth * .53, .286, headWidth * .91, .207);
    ctx.quadraticCurveTo(headWidth * 1.04, .170, headWidth * .98, .066 - hairDepth * .42);
    ctx.quadraticCurveTo(headWidth * .84, .102 - hairDepth * .77, headWidth * .72 + sweep, .140 - hairDepth * .82);
    ctx.quadraticCurveTo(sweep + .057, .160 - hairDepth, sweep - .030, .210 - hairDepth * .88);
    ctx.quadraticCurveTo(-headWidth * .52, .104 - hairDepth * .80, -headWidth * .75, .105 - hairDepth * .65);
  }, .015);
  stroke(ctx, '#827078', .013, () => {
    ctx.moveTo(-headWidth * .72, .228);
    ctx.quadraticCurveTo(-.06, .314, headWidth * .55, .257);
  });

  if (profile > .47) {
    const ear = -Math.sign(facing) * headWidth * blend(.93, .64, profile);
    ctx.save();
    ctx.globalAlpha *= clamp((profile - .47) / .29);
    oval(ctx, [ear, -.039], .042, .058, outfit.skin, .014, -.27 * facing);
    stroke(ctx, outfit.shade, .010, () => {
      ctx.moveTo(ear - .015, -.05);
      ctx.quadraticCurveTo(ear - .007, -.010, ear + .014, -.027);
    });
    ctx.restore();
  }

  if (role === 'guard' || role === 'baker' || (role === 'villager' && variant % 2 === 1)) {
    const steel = role === 'guard';
    const fabric = steel ? '#5b6584' : role === 'baker' ? '#eee5cf' : '#b36a76';
    shape(ctx, fabric, () => {
      ctx.moveTo(-headWidth * 1.02, .154);
      if (steel) {
        ctx.quadraticCurveTo(-headWidth * .96, .313, -.109, .365);
        ctx.quadraticCurveTo(.035, .394, headWidth * .67, .312);
        ctx.quadraticCurveTo(headWidth * 1.01, .265, headWidth * 1.03, .154);
      } else {
        ctx.bezierCurveTo(-headWidth * 1.19, .25, -headWidth * .77, .399, -.086, .367);
        ctx.quadraticCurveTo(.018, .435, headWidth * .42, .365);
        ctx.quadraticCurveTo(headWidth * 1.14, .379, headWidth * 1.03, .154);
      }
      ctx.quadraticCurveTo(.03, .11, -headWidth * 1.02, .154);
    }, .019);
    line(ctx, steel ? '#b2bbca' : '#ba9c91', .017, [[-headWidth * .89, .183], [.015, .156], [headWidth * .91, .182]]);
    if (steel) oval(ctx, [facing * .202, .230], .026, .027, '#d2ae66', .011);
  }

  const faceVis = clamp((front + .23) / .58);
  const blinkPhase = (Math.floor(frame) + 21 + variant * 17 + role.length * 6) % 97;
  const eyeOpening = blinkPhase === 0 || blinkPhase === 3 ? .52 : blinkPhase < 3 ? .11 : 1;
  const browHeight = expression === 'alert' ? .037 : expression === 'worried' ? .021 : expression === 'focused' ? -.012 : 0;
  for (const side of [-1, 1]) {
    const angle = relativeYaw - side * .43;
    const visible = clamp((Math.cos(angle) - .03) / .36);
    if (visible <= 0) continue;
    const x = Math.sin(angle) * (headWidth * .89);
    const eyeY = .058 + (expression === 'worried' ? .004 : 0);
    const eyeWidth = .038 * blend(.60, 1, visible);
    const eyeH = (expression === 'alert' ? .037 : expression === 'proud' ? .023 : .029) * eyeOpening;
    ctx.save();
    ctx.globalAlpha *= visible;
    oval(ctx, [x, eyeY], eyeWidth, Math.max(.003, eyeH), '#f8dfc8', .009);
    if (eyeOpening > .25) oval(ctx, [x + facing * .006, eyeY - .003], .014, eyeH * .78, INK, 0);
    const slope = expression === 'worried' ? side * .022 : expression === 'focused' ? -side * .023 : side * .007;
    stroke(ctx, outfit.hair, .017, () => {
      ctx.moveTo(x - .041, eyeY + .062 + browHeight - slope);
      ctx.quadraticCurveTo(x - .002, eyeY + .074 + browHeight, x + .040, eyeY + .060 + browHeight + slope);
    });
    ctx.restore();
  }

  if (faceVis > 0) {
    ctx.save();
    ctx.globalAlpha *= faceVis;
    const noseX = facing * (headWidth * .95);
    stroke(ctx, '#986454', .012, () => {
      ctx.moveTo(noseX - facing * .022, .032);
      ctx.quadraticCurveTo(noseX + facing * .041, -.004, noseX + facing * .018, -.035);
      ctx.quadraticCurveTo(noseX, -.049, noseX - facing * .031 - .016, -.038);
    });
    const mouthX = facing * (headWidth * .79);
    const mouthSpan = (role === 'mayor' ? .075 : .062) * blend(1, .51, profile);
    if (role === 'mayor') {
      shape(ctx, outfit.hair, () => {
        ctx.moveTo(mouthX - mouthSpan * 1.22, -.100);
        ctx.quadraticCurveTo(mouthX - .038, -.063, mouthX, -.083);
        ctx.quadraticCurveTo(mouthX + .035, -.062, mouthX + mouthSpan * 1.20, -.10);
        ctx.quadraticCurveTo(mouthX + mouthSpan * .66, -.129, mouthX, -.112);
        ctx.quadraticCurveTo(mouthX - mouthSpan * .72, -.129, mouthX - mouthSpan * 1.22, -.10);
      }, 0);
    }
    if (role === 'carpenter') {
      for (const [dx, y] of [[-.108, -.164], [-.066, -.205], [-.017, -.225], [.035, -.224], [.083, -.193]]) {
        line(ctx, '#956252', .010, [[mouthX * .71 + dx, y], [mouthX * .71 + dx + .007, y + .011]]);
      }
    }
    if (expression === 'alert') {
      oval(ctx, [mouthX, -.142], mouthSpan * .50, .028, '#74444b', .010);
    } else {
      const curl = expression === 'proud' || expression === 'amused' ? -.046 : expression === 'worried' ? .029 : -.006;
      stroke(ctx, '#6e3d43', .014, () => {
        ctx.moveTo(mouthX - mouthSpan, -.135);
        ctx.quadraticCurveTo(mouthX - facing * .006, -.138 + curl, mouthX + mouthSpan, -.135 + (expression === 'amused' ? .016 : 0));
      });
    }
    ctx.restore();
  }
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
    {!bird && <mesh position={[0, .011, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.36 * scale, .21 * scale, 1]} onUpdate={NO_OUTLINE}>
      <circleGeometry args={[1, 24]}/>
      <meshBasicMaterial color="#36263e" opacity={.17} transparent depthWrite={false}/>
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
