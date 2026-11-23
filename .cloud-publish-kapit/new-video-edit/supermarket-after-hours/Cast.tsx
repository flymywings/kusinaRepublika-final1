import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {NOINK} from './lib/ink';
import {cardShade, CARD_K} from './lib/cardshade';
import {Pen, blobPts, headBlob, mul, thickAngle} from './lib/toon';
import {mayorHairline, mayorHead} from './baseline/mayor-look';
import type {FacialPerformance} from './performance';

type Vec3 = [number, number, number];
type Point = [number, number];
type Role = 'mayor' | 'guard' | 'carpenter' | 'baker' | 'villager' | 'sasaki' | 'yamada' | 'tayama' | 'staff';
type Expression = 'neutral' | 'proud' | 'alert' | 'worried' | 'amused' | 'focused' | 'tired' | 'flustered' | 'soft' | 'teasing' | 'disappointed' | 'touched';
type FaceView = 'front' | 'three-quarter' | 'profile' | 'rear';

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
  view?: FaceView;
  look?: -1 | 1;
  shadow?: 'day' | 'sunset';
  shadowDirection?: Point;
  gaze?: Vec3;
  softness?: number;
  talk?: number;
  headTilt?: number;
  feet?: [Vec3,Vec3];
  facePerformance?: FacialPerformance;
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
function groundShade(color: THREE.Vector3, opacity: number, core: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {tint: {value: color}, opacity: {value: opacity}, core: {value: core}},
    vertexShader: 'varying vec2 tex; void main(){ tex=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec2 tex; uniform vec3 tint; uniform float opacity,core; void main(){ float d=length((tex-.5)*2.); gl_FragColor=vec4(tint,opacity*(1.-smoothstep(core,1.,d))); }',
  });
}
const contactShade = groundShade(new THREE.Vector3(.08, .065, .135), .51, .22);
const tailShade = groundShade(new THREE.Vector3(.14, .15, .24), .23, .04);

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
  sasaki: {skin:'#f1d9c5',shade:'#d2b5a8',coat:'#6a829b',dark:'#3f536b',trousers:'#617a94',hair:'#2d323b'},
  yamada: {skin:'#f7e0d3',shade:'#d7b5ae',coat:'#e2e5b9',dark:'#b0b28e',trousers:'#41474d',hair:'#874957'},
  tayama: {skin:'#f7e0d3',shade:'#d7b5ae',coat:'#343545',dark:'#20222f',trousers:'#78636a',hair:'#874957'},
  staff: {skin:'#f4d8c4',shade:'#d0ad9d',coat:'#e2e5b9',dark:'#b0b28e',trousers:'#41474d',hair:'#98928f'},
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

const HEAD_SEEDS = {mayor: 23, guard: 7, carpenter: 12, baker: 31, villager: 18,sasaki:39,yamada:45,tayama:45,staff:31} as const;
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
const DIAMOND_MOOD = {neutral:'calm',proud:'sly',alert:'inspect',worried:'doubt',amused:'pleased',focused:'inspect',tired:'calm',flustered:'doubt',soft:'pleased',teasing:'sly'} as const;

function diamondFace(pen: Pen, mood: Expression, view: FaceView, look: -1 | 1, gaze: number, blink: number, lookUp: number, fringe: boolean, role?:Role, softness=0) {
  if (view === 'rear') return;

  const m = DIAMOND_MOOD[mood];
  const facing = look * (view === 'front' ? 0 : view === 'three-quarter' ? .55 : .95);
  const profile = view === 'profile';
  const fx = facing * blend(18, 41, Math.abs(facing));
  const ey = 4;
  for (const q of profile ? [-look] : [-1, 1]) {
    const ex = profile ? look * 40 : fx + q * (view === 'front' ? 31 : 27);
    if (blink > .8) pen.stroke([[ex - 15, ey], [ex + 15, ey]], 6);
    else if (m === 'inspect' || m === 'sly' || m === 'doubt') {
      pen.ell(ex, ey + 1, 18, m === 'sly' ? 11+softness*3 : 17, '#fffaf0', 4);
      pen.dot(ex + gaze, ey - 5 * lookUp, 8,role==='sasaki'?'#655a52':'#63776c');
      pen.dot(ex+gaze,ey-5*lookUp,4,INK);
    } else if (m === 'pleased'&&role!=='tayama'&&!(role==='yamada'&&softness<.5)) pen.arc(ex, ey + 8, 17, 12, 205, 335, 6);
    else if(role==='tayama'||role==='yamada'&&softness<.5){
      pen.ell(ex,ey+3,17,12+softness*2,'#fffaf0',4);pen.dot(ex+gaze,ey+3,8,'#63776c');pen.dot(ex+gaze,ey+3,4,INK);
      pen.stroke([[ex-18,ey-7],[ex+17,ey-6]],5);
    }
    else {
      pen.ell(ex + facing * 4, ey + 5, 15, blink ? 4 : 11, INK, 0, 0, 180);
      pen.stroke([[ex - 18, ey], [ex + 18, ey]], 8);
    }
    const naturalBrowY = ey - 44 - 4 * lookUp + (m === 'doubt' ? q * 10 : 0);
    const browY = (fringe ? Math.max(-43, naturalBrowY) : naturalBrowY)+(role==='tayama'?softness*7:0);
    pen.stroke([[ex - 18, browY + (m === 'sly' ? -q * 3*(1-softness) : 0)], [ex + 17, browY + q * 5*(role==='tayama'?1-softness:1)]], role==='sasaki'?7:5);
    if(role==='sasaki'){pen.stroke([[ex-19,ey+19],[ex+12,ey+22]],3,'#b2928c');pen.stroke([[ex-17,browY-15],[ex+11,browY-18]],2,'#bf9b92');}
  }

  if(mood==='tired')pen.stroke([[fx-14,48],[fx+13,47]],5);
  else if(role==='tayama'){
    pen.arc(fx+2,43,21-softness*4,8+softness*3,8,170,4);
    pen.stroke([[fx+look*26,31],[fx+look*30,28]],2,'#bd888b');
  } else if (m === 'pleased') {
    pen.ell(fx, 44, 23, 10, '#5a1e28', 5, 0, 180);
    pen.stroke([[fx - 18, 46], [fx + 18, 46]], 5, '#fff8ed');
  } else if (m === 'inspect') pen.stroke([[fx - 13, 49], [fx + 13, 47]], 6);
  else if (m === 'doubt') pen.stroke([[fx - 14, 51], [fx + 13, 47]], 7);
  else pen.arc(fx + 3, 43, 22, 10, 10, 155, 7);
}

// Shared frontal drawing: the two appearances change styling, never facial geometry.
function womanArt(ctx:CanvasRenderingContext2D,pose:PersonProps,contact:(p:Vec3)=>Point){
 const work=pose.role==='yamada',soft=pose.softness??0,f=pose.frame??0;
 const skin='#f5ddd0',hair='#82434c',hairLight='#a45b64',coat=work?'#dfe2b3':'#2b2d3a';
 const angle=-(pose.tilt??0),pivot=.78;
 const body=(x:number,y:number):Point=>[Math.cos(angle)*x-Math.sin(angle)*(y-pivot),pivot+Math.sin(angle)*x+Math.cos(angle)*(y-pivot)];
 const bodySpace=()=>{ctx.translate(0,pivot);ctx.rotate(angle);ctx.translate(0,-pivot)};
 // Tights/trousers have a visible calf and meet the boot shaft without a skin-coloured patch.
 for(const side of [-1,1]){
  const hip=body(side*.105,.66),ankle:Point=[side*.116,.16];
  stroke(ctx,INK,work?.105:.080,()=>{ctx.moveTo(...hip);ctx.quadraticCurveTo(side*.135,.36,...ankle)});
  stroke(ctx,work?'#42484d':'#776971',work?.079:.058,()=>{ctx.moveTo(...hip);ctx.quadraticCurveTo(side*.135,.36,...ankle)});
  if(work)oval(ctx,[side*.116,.055],.078,.042,'#30313a',.010);
  else shape(ctx,'#d9e3e5',()=>{const x=side*.116;ctx.moveTo(x-.050,.205);ctx.lineTo(x+.049,.205);ctx.lineTo(x+.045,.075);ctx.quadraticCurveTo(x+.087,.045,x+.080,.022);ctx.lineTo(x-.060,.022);ctx.quadraticCurveTo(x-.069,.052,x-.049,.085)},.011);
 }
 ctx.save();bodySpace();
 // A short visible neck separates the chin, choker and jacket.
 shape(ctx,skin,()=>{ctx.moveTo(-.059,1.42);ctx.lineTo(.059,1.42);ctx.lineTo(.067,1.245);ctx.quadraticCurveTo(0,1.21,-.067,1.245)},.010);
 if(work){
  shape(ctx,'#dfe2b3',()=>{ctx.moveTo(-.065,1.29);ctx.quadraticCurveTo(-.18,1.28,-.205,1.18);ctx.lineTo(-.19,.68);ctx.lineTo(.19,.68);ctx.lineTo(.205,1.18);ctx.quadraticCurveTo(.18,1.28,.065,1.29)},.015);
  shape(ctx,'#bc4e58',()=>{ctx.moveTo(-.13,1.16);ctx.quadraticCurveTo(0,1.12,.13,1.16);ctx.lineTo(.205,.49);ctx.quadraticCurveTo(0,.46,-.205,.49)},.014);
  for(const side of [-1,1])line(ctx,'#36373c',.022,[[side*.117,1.16],[side*.125,1.27]]);
  line(ctx,'#39373d',.019,[[-.17,.83],[.17,.83]]);
  for(const side of [-1,1])shape(ctx,'#edf0c9',()=>{ctx.moveTo(side*.014,1.26);ctx.lineTo(side*.068,1.29);ctx.lineTo(side*.10,1.21);ctx.lineTo(side*.045,1.18)},.007);
  shape(ctx,'#e5eee2',()=>ctx.rect(.065,1.095,.085,.054),.005);
  line(ctx,'#637a74',.006,[[.078,1.127],[.138,1.127]]);
  line(ctx,'#9b3e49',.006,[[-.12,.70],[.115,.70],[.105,.61],[-.11,.61]]);
 }else{
  shape(ctx,'#d4e1e3',()=>{ctx.moveTo(-.065,1.28);ctx.lineTo(-.16,1.25);ctx.quadraticCurveTo(-.185,1.05,-.153,.80);ctx.lineTo(-.215,.49);ctx.quadraticCurveTo(0,.465,.215,.49);ctx.lineTo(.153,.80);ctx.quadraticCurveTo(.185,1.05,.16,1.25);ctx.lineTo(.065,1.28);ctx.quadraticCurveTo(0,1.245,-.065,1.28)},.014);
  for(const side of [-1,1]){
   shape(ctx,'#2c2e3b',()=>{ctx.moveTo(side*.065,1.285);ctx.quadraticCurveTo(side*.19,1.30,side*.218,1.185);ctx.lineTo(side*.205,.82);ctx.lineTo(side*.12,.80);ctx.lineTo(side*.10,1.10)},.012);
   line(ctx,'#626779',.008,[[side*.075,1.25],[side*.136,1.17],[side*.103,1.08],[side*.128,.88]]);
  }
  line(ctx,'#879a9f',.006,[[-.06,1.20],[.03,1.18],[.10,1.20]]);
  line(ctx,'#a1b2b6',.006,[[-.11,.69],[-.04,.64]]);
  line(ctx,'#a1b2b6',.006,[[.09,.64],[.14,.58]]);
  line(ctx,'#242832',.030,[[-.168,.805],[.168,.805]]);
  shape(ctx,'#b9a06c',()=>ctx.rect(-.026,.786,.052,.041),.006);
  shape(ctx,'#20232b',()=>ctx.rect(-.012,.796,.027,.022),0);
  line(ctx,'#26232d',.026,[[-.060,1.322],[.060,1.322]]);
 }
 ctx.restore();
 // Choose the arm by its screen-space target; a left-hand target must not cross the chest.
 const targets=[pose.hand,pose.otherHand].filter(Boolean).map(p=>contact(p!)).sort((a,b)=>a[0]-b[0]);
 for(const side of [-1,1]){
  const shoulder=body(side*.175,1.23),hand=targets[side<0?0:1]??body(side*.265,.80);
  const elbow:Point=[blend(shoulder[0],hand[0],.52)+side*.052,blend(shoulder[1],hand[1],.52)-.070];
  const trace=()=>{ctx.moveTo(...shoulder);ctx.quadraticCurveTo(...elbow,...hand)};
  stroke(ctx,INK,.089,trace);stroke(ctx,coat,.067,trace);
  const wrist:Point=[blend(elbow[0],hand[0],.88),blend(elbow[1],hand[1],.88)];
  line(ctx,work?'#bec493':'#505462',.047,[wrist,hand]);
  oval(ctx,hand,.038,.032,skin,.009,-side*.15);
 }
 const center=body(0,1.63);
 ctx.save();ctx.translate(...center);ctx.rotate(angle+(pose.headTilt??0));ctx.translate(0,-1.63);
 // Compact crown and narrow side locks replace the rejected enclosing hood shape.
 shape(ctx,hair,()=>{ctx.moveTo(-.217,1.54);ctx.bezierCurveTo(-.275,1.73,-.219,1.925,0,1.925);ctx.bezierCurveTo(.219,1.925,.275,1.73,.217,1.54);ctx.lineTo(.165,1.56);ctx.lineTo(-.165,1.56)},.013);
 if(!work){oval(ctx,[.224,1.575],.060,.075,hair,.010);line(ctx,'#b78084',.006,[[.247,1.60],[.274,1.57]]);}
 for(const side of [-1,1])shape(ctx,hair,()=>{ctx.moveTo(side*.185,1.75);ctx.quadraticCurveTo(side*.260,1.56,side*(work?.245:.224),work?1.285:1.345);ctx.quadraticCurveTo(side*.195,work?1.26:1.35,side*.182,1.405);ctx.lineTo(side*.151,1.68)},.011);
 const face=ctx.createLinearGradient(-.22,0,.24,0);face.addColorStop(0,'#e2bdaf');face.addColorStop(.18,skin);face.addColorStop(.78,skin);face.addColorStop(1,'#dfb8aa');
 shape(ctx,face,()=>{ctx.moveTo(0,1.884);ctx.bezierCurveTo(-.157,1.89,-.218,1.79,-.217,1.638);ctx.bezierCurveTo(-.214,1.50,-.117,1.375,0,1.367);ctx.bezierCurveTo(.117,1.375,.214,1.50,.217,1.638);ctx.bezierCurveTo(.218,1.79,.157,1.89,0,1.884)},.014);
 for(const side of [-1,1])oval(ctx,[side*.210,1.591],.019,.034,skin,.007);
 // Fringe: a few curved clumps, no vertical comb of identical stripes.
 if(work){
  shape(ctx,hair,()=>{ctx.moveTo(-.218,1.695);ctx.quadraticCurveTo(-.234,1.91,-.015,1.918);ctx.quadraticCurveTo(.212,1.92,.221,1.725);ctx.bezierCurveTo(.117,1.70,.028,1.75,-.087,1.841);ctx.quadraticCurveTo(-.135,1.75,-.218,1.695)},.008);
  line(ctx,hairLight,.009,[[-.087,1.855],[-.019,1.807],[.071,1.766],[.162,1.747]]);
  shape(ctx,'#b54d58',()=>{ctx.moveTo(-.255,1.81);ctx.lineTo(-.186,1.942);ctx.quadraticCurveTo(0,1.995,.186,1.942);ctx.lineTo(.255,1.81);ctx.lineTo(.208,1.823);ctx.quadraticCurveTo(0,1.925,-.208,1.823)},.011);
  line(ctx,'#d27b7f',.009,[[-.182,1.926],[0,1.958],[.182,1.926]]);
 }else{
  shape(ctx,hair,()=>{ctx.moveTo(-.220,1.72);ctx.quadraticCurveTo(-.239,1.922,0,1.922);ctx.quadraticCurveTo(.239,1.922,.220,1.72);ctx.lineTo(.146,1.707);ctx.quadraticCurveTo(.11,1.708,.086,1.73);ctx.quadraticCurveTo(.039,1.702,0,1.72);ctx.quadraticCurveTo(-.045,1.703,-.087,1.731);ctx.quadraticCurveTo(-.13,1.706,-.159,1.713);ctx.lineTo(-.220,1.72)},.008);
  for(const x of [-.139,-.047,.054,.145])stroke(ctx,hairLight,.006,()=>{ctx.moveTo(x*.80,1.872);ctx.quadraticCurveTo(x*1.08,1.80,x,1.735)});
 }
 const blink=(f+33)%113<3,smiling=work&&soft>.5;
 const gaze=pose.gaze?clamp(contact(pose.gaze)[0]*.09,-.012,.012):0;
 for(const side of [-1,1]){
  const x=side*.080,y=1.615;
  if(blink||smiling)stroke(ctx,INK,.007,()=>{ctx.moveTo(x-.039,y);ctx.quadraticCurveTo(x,y+(smiling?.024:.004),x+.039,y)});
  else{
   const h=work?.045:.034+soft*.010;
   shape(ctx,'#fff8ef',()=>{ctx.moveTo(x-.040,y);ctx.quadraticCurveTo(x-.005,y+h,x+.041,y+.001);ctx.quadraticCurveTo(x+.004,y-h*.90,x-.040,y)},.005);
   oval(ctx,[x+gaze,y],.012,.015,'#73575a',0);oval(ctx,[x+gaze,y],.006,.010,'#30272e',0);oval(ctx,[x+gaze-.003,y+.006],.003,.003,'#fff9ed',0);
   stroke(ctx,INK,.008,()=>{ctx.moveTo(x-.042,y+.002);ctx.quadraticCurveTo(x,y+h,x+.043,y+.003)});
  }
  const brow=1.677+(work?0:side*.004*(1-soft));
  stroke(ctx,'#643b43',.007,()=>{ctx.moveTo(x-.037,brow);ctx.quadraticCurveTo(x,brow+.009,x+.035,brow-.002)});
  if(!work){oval(ctx,[side*.222,1.609],.005,.005,'#c9cacc',.002);oval(ctx,[side*.224,1.585],.007,.010,'#c5c7c8',.003);}
 }
 stroke(ctx,'#c29389',.004,()=>{ctx.moveTo(.003,1.568);ctx.lineTo(-.009,1.535);ctx.lineTo(.007,1.530)});
 if(smiling){shape(ctx,'#743a42',()=>{ctx.moveTo(-.038,1.485);ctx.quadraticCurveTo(0,1.467,.038,1.485);ctx.quadraticCurveTo(0,1.431,-.038,1.485)},.004);line(ctx,'#fff7e8',.006,[[-.027,1.481],[.026,1.481]]);}
 else stroke(ctx,'#69404a',.006,()=>{ctx.moveTo(-.028,1.475);ctx.quadraticCurveTo(.004,1.452,.036,1.478+(work?0:(1-soft)*.010))});
 ctx.restore();
}

function personArt(ctx: CanvasRenderingContext2D, pose: PersonProps, relativeYaw: number, contact: (point: Vec3) => Point) {
  if(pose.role==='tayama'||pose.role==='yamada'){womanArt(ctx,pose,contact);return;}
  if(pose.view==='front')relativeYaw=0;
  const {role, variant = 0, expression = 'neutral', step = 0, stride = 0, tilt = 0, crouch = 0, frame = 0, chain = true, lookUp = 0} = pose;
  const outfit = outfitFor(role, variant);
  const facing = Math.sin(relativeYaw);
  const front = Math.cos(relativeYaw);
  const profile = Math.abs(facing);
  const view = pose.view ?? (front < -.69 ? 'rear' : front < .45 ? 'profile' : front < .90 ? 'three-quarter' : 'front');
  const look = pose.look ?? (facing < 0 ? -1 : 1);
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
    const planted=pose.feet?contact(pose.feet[side>0?1:0]):undefined;
    const ankle:Point = planted?[planted[0],planted[1]+.083]:project(side * .136, foot.lift + .083, foot.advance);
    const knee:Point = planted?[blend(hip[0],ankle[0],.51),blend(hip[1],ankle[1],.52)]:project(side * (.128 + kneel * .048), .405 + foot.lift * .31 - kneel * .215, foot.advance * .44 - foot.lift * .39 + kneel * .23);
    stroke(ctx, outfit.trousers, .049, () => {
      ctx.moveTo(...hip);
      ctx.quadraticCurveTo(...knee, ...ankle);
    });
    const [heel, floor] = project(side * .136, foot.lift, foot.advance - .073);
    const [toe] = project(side * .136, foot.lift, foot.advance + .128);
    const shoeX = planted?planted[0]:(heel + toe) / 2;
    const shoeFloor=planted?planted[1]:floor;
    const rx = .064 + Math.abs(toe - heel) * .30;
    if(role==='tayama')shape(ctx,'#d9e2e2',()=>{ctx.moveTo(shoeX-rx*.74,floor+.04);ctx.lineTo(shoeX-rx*.80,floor+.23);ctx.lineTo(shoeX+rx*.68,floor+.23);ctx.lineTo(shoeX+rx*.64,floor+.08);ctx.lineTo(shoeX+rx*1.18,floor+.04);ctx.lineTo(shoeX+rx*1.15,floor+.015);ctx.lineTo(shoeX-rx*.77,floor+.015)},.013);
    else oval(ctx, [shoeX, shoeFloor + .036], rx, .035, INK, 0);
    line(ctx, outfit.trousers, .049, [ankle, [shoeX, shoeFloor + .048]]);
  }

  const reach = (side: number) => {
    const contacts=[pose.hand,pose.otherHand].filter(Boolean).sort((a,b)=>contact(a!)[0]-contact(b!)[0]);
    const target = pose.view==='front'?contacts[side<0?0:1]:side > 0 ? pose.hand : pose.otherHand;
    const shoulder = torsoPoint(side * .163 * wide, 1.199, -.004);
    const swing = Math.cos(step + (side > 0 ? Math.PI : 0)) * movement;
    const hand = target ? contact(target) : torsoPoint(side * .30 * wide, .77 + Math.abs(swing) * .13, swing * .29);
    const elbow = target
      ? [blend(shoulder[0], hand[0], .52) + side * front * .068, blend(shoulder[1], hand[1], .50) - .12] as Point
      : torsoPoint(side * .278 * wide, .98, swing * .11 - .04);
    stroke(ctx, outfit.coat, .064, () => {
      ctx.moveTo(...shoulder);
      ctx.quadraticCurveTo(...elbow, ...hand);
    });
    if(role==='sasaki')line(ctx,'#e9e7df',.044,[[blend(shoulder[0],hand[0],.93),blend(shoulder[1],hand[1],.93)],hand]);
    const palm = target ? .048 : .036;
    oval(ctx, hand, palm, palm * .90, target ? outfit.skin : INK, target ? .011 : 0);
  };

  const nearArm = pose.hand && !pose.otherHand ? 1 : pose.otherHand && !pose.hand ? -1 : facing > .16 ? -1 : 1;
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

  if(role==='tayama'){
    shape(ctx,'#dce5e3',()=>{ctx.moveTo(-torsoWidth*.72,.61);ctx.lineTo(torsoWidth*.72,.61);ctx.lineTo(torsoWidth*1.04,-.27);ctx.quadraticCurveTo(0,-.32,-torsoWidth*1.04,-.27)},.019);
    for(const side of [-1,1])shape(ctx,outfit.coat,()=>{ctx.moveTo(side*torsoWidth*.86,.61);ctx.lineTo(side*torsoWidth*1.03,.42);ctx.lineTo(side*torsoWidth*.98,.08);ctx.lineTo(side*torsoWidth*.57,.11);ctx.lineTo(side*torsoWidth*.44,.59)},.015);
    line(ctx,'#8c8e9a',.009,[[-torsoWidth*.86,.57],[-torsoWidth*.53,.47],[-torsoWidth*.65,.32]]);
    line(ctx,'#8c8e9a',.009,[[torsoWidth*.86,.57],[torsoWidth*.53,.47],[torsoWidth*.65,.32]]);
    line(ctx,'#242934',.039,[[-torsoWidth*.83,.06],[torsoWidth*.83,.06]]);
    shape(ctx,'#b4a168',()=>ctx.rect(-.027,.035,.055,.045),.008);
    line(ctx,'#9caeb0',.009,[[-.10,-.04],[-.14,-.18],[-.02,-.25]]);
    line(ctx,'#9caeb0',.009,[[.06,.30],[.16,.19],[.02,.17]]);
    line(ctx,'#25232e',.027,[[-.087,.636],[.085,.636]]);
  }

  const frontOpacity = clamp((front + .13) / .42);
  const seam = facing * .145;
  ctx.save();
  ctx.globalAlpha *= frontOpacity;
  if(role==='sasaki'){
    const width=.11*Math.max(.20,front);
    shape(ctx,'#f2f1e6',()=>{ctx.moveTo(seam-width,.625);ctx.lineTo(seam+width,.625);ctx.lineTo(seam+.035,.26)},.012);
    shape(ctx,'#87414c',()=>{ctx.moveTo(seam-.018,.565);ctx.lineTo(seam+.02,.565);ctx.lineTo(seam+.035,.31);ctx.lineTo(seam+.009,.27);ctx.lineTo(seam-.025,.31)},.008);
    for(const side of [-1,1])line(ctx,'#354a61',.013,[[seam+side*.12,.61],[seam+side*.17,.47],[seam+side*.06,.35],[seam+side*.01,.20]]);
    oval(ctx,[seam+.012,.19],.011,.011,'#263847',0);
    line(ctx,'#3b526c',.010,[[seam-.19,.26],[seam-.08,.25]]);
    line(ctx,'#3b526c',.010,[[seam+.09,.24],[seam+.20,.25]]);
  } else if(role==='yamada'||role==='staff'){
    shape(ctx,'#be535c',()=>{ctx.moveTo(seam-.14,.54);ctx.lineTo(seam+.14,.54);ctx.lineTo(seam+.22,-.28);ctx.quadraticCurveTo(seam,-.31,seam-.22,-.28)},.018);
    for(const side of [-1,1])line(ctx,'#34353b',.037,[[seam+side*.12,.54],[seam+side*.105,.635]]);
    line(ctx,'#34353b',.025,[[seam-.18,.20],[seam+.18,.20]]);
    line(ctx,'#b4b98a',.012,[[seam-.06,.63],[seam-.005,.56],[seam+.045,.63]]);
    shape(ctx,'#e3f1e8',()=>ctx.rect(seam+.065,.485,.075,.053),.006);
    line(ctx,'#638884',.008,[[seam+.073,.510],[seam+.128,.510]]);
    line(ctx,'#99414c',.009,[[seam-.13,.04],[seam+.12,.04],[seam+.1,-.06],[seam-.12,-.06]]);
  } else if(role==='tayama'){
    // Dress and jacket details are already drawn above; preserve the open neckline.
  } else if (role === 'mayor' || role === 'guard') {
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

  ctx.restore();
  reach(-nearArm);
  ctx.save();
  ctx.translate(0,pelvis);
  ctx.rotate(lean);
  const headX = facing * .021;
  const headY = .875 + .018 * lookUp;
  const headWidth = (role === 'mayor' ? .320 : role === 'sasaki'?.248:role==='yamada'||role==='tayama'?.253:role === 'baker' ? .291 : .283) * blend(1, .94, profile);
  const headHeight = role === 'mayor'||role==='sasaki' ? .313 : .295;
  const head = role === 'mayor' ? mayorHead : castHead(HEAD_SEEDS[role] + (role === 'villager' ? variant * 3 : 0));
  if(role==='yamada'||role==='tayama'){
    shape(ctx,outfit.hair,()=>{ctx.moveTo(headX-.252,headY+.16);ctx.bezierCurveTo(headX-.33,headY-.12,headX-.28,headY-.35,headX-.16,headY-.39);ctx.lineTo(headX+.17,headY-.39);ctx.bezierCurveTo(headX+.30,headY-.26,headX+.31,headY+.05,headX+.25,headY+.19)},.019);
  }
  ctx.translate(headX, headY);
  ctx.rotate(facing * .105 * lookUp+(pose.headTilt??0));
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
  if (view === 'rear') {
    shape(ctx, outfit.hair, () => {
      ctx.moveTo(-headWidth * 1.1, headHeight * 1.08);
      ctx.lineTo(headWidth * 1.1, headHeight * 1.08);
      ctx.lineTo(headWidth * 1.1, -headHeight * .58);
      ctx.quadraticCurveTo(0, -headHeight * .96, -headWidth * 1.1, -headHeight * .50);
    }, 0);
  } else if(role==='sasaki'){
    shape(ctx,outfit.hair,()=>{ctx.moveTo(-headWidth*1.1,headHeight*.10);ctx.lineTo(-headWidth*.83,headHeight*.85);ctx.quadraticCurveTo(-headWidth*.2,headHeight*1.15,headWidth*.90,headHeight*.83);ctx.lineTo(headWidth*.96,headHeight*.05);ctx.lineTo(headWidth*.66,headHeight*.60);ctx.quadraticCurveTo(-headWidth*.2,headHeight*.36,-headWidth*1.1,headHeight*.10)},0);
    for(const side of [-1,1]){line(ctx,'#9da3aa',.018,[[side*headWidth*.86,headHeight*.28],[side*headWidth*.73,headHeight*.62],[side*headWidth*.46,headHeight*.77]]);}
    line(ctx,'#565d68',.014,[[-headWidth*.65,headHeight*.69],[-headWidth*.16,headHeight*.88],[headWidth*.39,headHeight*.88]]);
  } else if(role==='tayama'){
    shape(ctx,outfit.hair,()=>{ctx.moveTo(-headWidth*1.1,headHeight*.04);ctx.lineTo(-headWidth*1.03,headHeight*.90);ctx.quadraticCurveTo(0,headHeight*1.2,headWidth*1.06,headHeight*.88);ctx.lineTo(headWidth*1.06,headHeight*.04);for(let x=1.0;x>=-1.01;x-=.25)ctx.lineTo(x*headWidth,headHeight*(x%0.5===0?.11:.18));},0);
    for(let x=-.7;x<=.71;x+=.27)line(ctx,'#a66a77',.009,[[x*headWidth,headHeight*.82],[x*headWidth,headHeight*.2]]);
  } else if(role==='yamada'){
    shape(ctx,outfit.hair,()=>{ctx.moveTo(-headWidth*1.1,headHeight*.1);ctx.lineTo(-headWidth,headHeight*.95);ctx.quadraticCurveTo(0,headHeight*1.13,headWidth*1.1,headHeight*.87);ctx.lineTo(headWidth,headHeight*.11);ctx.bezierCurveTo(headWidth*.3,headHeight*.10,-headWidth*.3,headHeight*.67,-headWidth*.51,headHeight*.78);ctx.quadraticCurveTo(-headWidth*.65,headHeight*.3,-headWidth*1.1,headHeight*.1)},0);
    line(ctx,'#ae7681',.018,[[-headWidth*.42,headHeight*.72],[headWidth*.05,headHeight*.39],[headWidth*.7,headHeight*.22]]);
  } else if (role === 'mayor') {
    shape(ctx, outfit.hair, () => tracePoints(ctx, mayorHairline, headWidth, headHeight), 0);
  } else {
    shape(ctx, outfit.hair, () => {
      ctx.moveTo(-headWidth, headHeight * .24);
      ctx.quadraticCurveTo(-headWidth * .72, headHeight * .96, 0, headHeight * .94);
      ctx.quadraticCurveTo(headWidth * .69, headHeight * 1.04, headWidth, headHeight * .35);
      ctx.quadraticCurveTo(headWidth * .10, headHeight * .51, -headWidth, headHeight * .24);
    }, 0);
  }
  ctx.restore();

  if(role==='yamada'||role==='staff'){
    shape(ctx,'#bd535d',()=>{ctx.moveTo(-headWidth*1.13,headHeight*.56);ctx.lineTo(-headWidth*.74,headHeight*1.05);ctx.quadraticCurveTo(0,headHeight*1.15,headWidth*.77,headHeight*1.04);ctx.lineTo(headWidth*1.14,headHeight*.55);ctx.lineTo(headWidth*.92,headHeight*.58);ctx.quadraticCurveTo(0,headHeight*.99,-headWidth*.91,headHeight*.57)},.014);
    line(ctx,'#e18a8e',.014,[[-headWidth*.77,headHeight*.96],[headWidth*.73,headHeight*.97]]);
  }
  if(role==='tayama'){
    for(const side of [-1,1]){oval(ctx,[side*headWidth*.91,-.042],.018,.026,'#c2c3bc',.007);oval(ctx,[side*headWidth*.96,.011],.011,.011,'#d3d6cf',.005);}
  }
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
  const gaze = pose.gaze ? clamp((contact(pose.gaze)[0]-headX)*25,-7,7):pose.hand ? clamp((contact(pose.hand)[0] - headX) * 36, -7, 7) : pose.look === undefined ? facing * 5 : look * 5;
  ctx.save();
  ctx.scale(headWidth / 118, -headHeight / 118);
  diamondFace(pen, expression, view, look, gaze, blink, lookUp, role === 'mayor',role,pose.softness??0);
  ctx.restore();
  ctx.restore();
  reach(nearArm);
}

type CardProps = {
  position: Vec3;
  scale: number;
  facing: number;
  feet?: [Vec3,Vec3];
  footGround?: [number,number];
  bird?: boolean;
  shadow?: PersonProps['shadow'];
  shadowDirection?: Point;
  paint: (context: CanvasRenderingContext2D, relativeYaw: number, contact: (point: Vec3) => Point) => void;
};

export function Card({position, scale, facing, feet, footGround, bird = false, shadow = 'day', shadowDirection = [-1, 1], paint}: CardProps) {
  const {camera,gl} = useThree();
  const textureDetail = gl.getPixelRatio() > 1 ? 4 : 1;
  const mesh = useRef<THREE.Mesh>(null);
  const groundShadow = useRef<THREE.Mesh>(null);
  const lastDraw = useRef<{paint: CardProps['paint']; x: number; y: number; z: number} | undefined>(undefined);
  const resources = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = (bird ? 740 : 608) * textureDetail;
    canvas.height = (bird ? 460 : 672) * textureDetail;
    const context = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const material = cardShade(new THREE.MeshLambertMaterial({map: texture, alphaTest: .42, side: THREE.DoubleSide}));
    const silhouette = new THREE.MeshBasicMaterial({map: texture, color: '#111027',
      opacity: .32, transparent: true, depthWrite: false, side: THREE.DoubleSide});
    silhouette.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>',
        'diffuseColor.a *= texture2D(map, vMapUv).a;');
    };
    const width = bird ? 1.68 : CARD_W;
    const height = bird ? 1.06 : CARD_H;
    const base = bird ? -.19 : CARD_BASE;
    const geometry = new THREE.PlaneGeometry(width, height).translate(0, height / 2 + base, 0);
    const footShades=[contactShade.clone(),contactShade.clone()];
    return {canvas, context, texture, material, silhouette, geometry, width, height, base,footShades};
  }, [bird, textureDetail]);

  useLayoutEffect(() => () => {
    resources.texture.dispose();
    resources.material.dispose();
    resources.silhouette.dispose();
    resources.geometry.dispose();
    resources.footShades.forEach(m=>m.dispose());
  }, [resources]);

  const draw = () => {
    if (!mesh.current) return;
    const {x, y, z} = camera.position;
    const last = lastDraw.current;
    if (last?.paint === paint && last.x === x && last.y === y && last.z === z) return;
    lastDraw.current = {paint, x, y, z};
    // A nearer parallel card keeps projected floor contacts above the floor mesh.
    // Reproject the body back to its original image size/position; feet retain world-space anchors.
    const planeZ=feet?Math.max(position[2],feet[0][2],feet[1][2])+.035:position[2];
    const cameraX = camera.position.x - position[0];
    const cameraZ = camera.position.z - planeZ;
    const distance = feet?cameraZ:Math.hypot(cameraX, cameraZ);
    const yaw = feet?0:distance > .0001 ? Math.atan2(cameraX, cameraZ) : 0;
    mesh.current.position.z=planeZ-position[2];
    mesh.current.rotation.y = yaw;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    if (groundShadow.current) {
      const stretch = .15;
      groundShadow.current.matrix.set(
        cos * scale, -shadowDirection[0] * stretch * scale, 0, 0,
        0, 0, 1, .012 - position[1],
        -sin * scale, -shadowDirection[1] * stretch * scale, 0, 0,
        0, 0, 0, 1,
      );
      groundShadow.current.matrixWorldNeedsUpdate = true;
    }
    const contact = (point: Vec3): Point => {
      if(feet){const projection=distance/Math.max(.2,camera.position.z-point[2]);return[((point[0]-camera.position.x)*projection+camera.position.x-position[0])/scale,((point[1]-camera.position.y)*projection+camera.position.y-position[1])/scale];}
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
    if(feet){
      const k=distance/(camera.position.z-position[2]),sx=(position[0]-camera.position.x)*(k-1)/scale,sy=(position[1]-camera.position.y)*(k-1)/scale;
      context.save();context.translate(sx,sy);context.scale(k,k);
      paint(context,0,p=>{const v=contact(p);return[(v[0]-sx)/k,(v[1]-sy)/k];});context.restore();
      const floor=Math.min(feet[0][1],feet[1][1])-.002;
      feet.forEach((p,i)=>{resources.footShades[i].uniforms.opacity.value=Math.max(.09,.62*(1-(p[1]-(footGround?.[i]??floor))/.12));});
    }else paint(context, facing - yaw, contact);
    texture.needsUpdate = true;
  };

  useLayoutEffect(draw);
  useFrame(draw);
  const [sunX, sunZ] = shadowDirection;
  const sunLength = Math.hypot(sunX, sunZ) || 1;
  const awayX = -sunX / sunLength;
  const awayZ = -sunZ / sunLength;
  const shadowYaw = Math.atan2(-awayZ, awayX);
  const grounded = !bird && position[1] < .12;
  return <group position={position}>
    {grounded && shadow === 'sunset' && <mesh ref={groundShadow} matrixAutoUpdate={false} frustumCulled={false}
      geometry={resources.geometry} material={resources.silhouette} onUpdate={NO_OUTLINE} />}
    {grounded && feet&&feet.map((p,i)=><mesh key={i} position={[p[0]-position[0],(footGround?.[i]??Math.min(feet[0][1],feet[1][1])-.002)-position[1]+.003,p[2]-position[2]]} rotation={[-Math.PI/2,0,0]} scale={[.10*scale,.055*scale,1]} material={resources.footShades[i]} onUpdate={NO_OUTLINE}><circleGeometry args={[1,24]}/></mesh>)}
    {grounded && !feet&&<group rotation-y={shadowYaw}>
      {shadow === 'day' && <mesh position={[.54 * scale, .013, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.90 * scale, .30 * scale, 1]} onUpdate={NO_OUTLINE} material={tailShade}>
        <circleGeometry args={[1, 24]}/>
      </mesh>}
      <mesh position={[.03 * scale, .017, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.36 * scale, .25 * scale, 1]} onUpdate={NO_OUTLINE} material={contactShade}>
        <circleGeometry args={[1, 24]}/>
      </mesh>
    </group>}
    <mesh ref={mesh} scale={scale} geometry={resources.geometry} material={resources.material} receiveShadow onUpdate={NO_OUTLINE}
      onBeforeRender={(renderer) => {CARD_K.uPx.value = (renderer.getRenderTarget()?.height ?? renderer.domElement.height) / 1920;}} />
  </group>;
}

export function Person(pose: PersonProps) {
  return <Card position={pose.position} scale={pose.scale ?? 1} facing={pose.yaw ?? 0}
    shadow={pose.shadow} shadowDirection={pose.shadowDirection}
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
