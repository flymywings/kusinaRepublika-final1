import {interpolate} from 'remotion';
import {glide} from '../upstream/templates/bridge/story';

export const frames = 780;
const times = [0, 105, 235, 390, 540, 660, 779];
export function track(frame: number, values: number[]) {
  return interpolate(frame, times, values, {
    easing: glide, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}


type Position = [number, number, number];
type CameraPose = {position: Position; look: Position; focus: Position; fov: number; roll: number; blur: number};
type CameraKey = {frame: number; duration: number; pose: (frame: number) => CameraPose};
const mix = (a:number,b:number,t:number) => a+(b-a)*t;
const mixPosition = (a:Position,b:Position,t:number): Position => [
  mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t),
];

export const SHOTS = [
  {name:'Bangka afloat',start:0,end:82},
  {name:'Coastal village',start:82,end:153},
  {name:'Fault and wave',start:153,end:378},
  {name:'Bangka grounded',start:378,end:535},
  {name:'Reaction and turn',start:535,end:627},
  {name:'Path uphill',start:627,end:780},
];

export const FAULT = {start:241,end:257,travelEnd:348};
const KICKS = [{frame:FAULT.start, strength:.8}];
const BANGKA: Position = [-.55,.12,4.75];

export function personAt(frame: number): Position {
  const x = interpolate(frame,[555,650,779],[-3,-5.25,-8],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const y = (x < -6 ? 1.7+(-6-x)*.43 : (-2-x)*.425) + (x < -3.55 ? .12 : 0);
  return [x,y,5.3];
}

export function disturbanceAt(frame: number) {
  return interpolate(frame,[FAULT.end,FAULT.travelEnd],[0,-2.65],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
}

function dolly(start: number, position: Position, look: Position, fov: number, blur: number,
  options: {focus?:Position; roll?:number; rate?:number; slide?:number} = {}): CameraKey {
  return {frame:start,duration:24,pose(frame) {
    const elapsed = Math.max(0,frame-start);
    const push = 1-Math.exp(-(options.rate ?? .0011)*elapsed);
    const next = mixPosition(position,look,push);
    next[0] += elapsed*(options.slide ?? 0);
    return {position:next,look,focus:options.focus ?? look,fov,roll:options.roll ?? 0,blur};
  }};
}

const boatAngle: Position = [1.6,2.05,12.7];
const boatLook: Position = [-1.44,.73,4.75];
const CAMS: CameraKey[][] = [
  [
    dolly(0,boatAngle,boatLook,47,12,{focus:BANGKA,slide:-.009}),
    dolly(47,[1.3,2.0,12.15],[-1.42,.73,4.75],47,10,{focus:BANGKA}),
  ],
  [
    dolly(82,[3.2,6.6,18],[-2.15,.8,3.7],44,6,{slide:-.008}),
    dolly(117,[3.35,6.1,17.1],[-1.7,.42,3.8],44,7),
  ],
  [
    dolly(153,[0,3.25,19],[0,-.45,0],49,4,{rate:.0005}),
    {frame:262,duration:32,pose(frame) {
      const wave = disturbanceAt(frame);
      return {position:[wave*.18,3.05,18.45],look:[wave*.24,-.37,0],focus:[wave,.42,0],fov:50,roll:0,blur:4};
    }},
  ],
  [
    dolly(378,boatAngle,boatLook,47,12,{focus:BANGKA,slide:-.009}),
    dolly(453,[1.9,1.56,10.4],[-.37,.02,4.5],44,8,{focus:[-.15,-.3,4.6]}),
  ],
  [
    {frame:535,duration:24,pose(frame) {
      const [x,y,z] = personAt(frame);
      const drift = (frame-535)*.005;
      return {position:[x+.35+drift,y+1.475,9.1-drift*.35],look:[x,y+.9,z],
        focus:[x,y+1.16,z],fov:39,roll:0,blur:12};
    }},
  ],
  [
    {frame:627,duration:24,pose(frame) {
      const [x,y,z] = personAt(frame);
      return {position:[x+2.4,y+2.55,12],look:[x+.15,y+.75,z],focus:[x,y+.85,z],fov:43,roll:0,blur:8};
    }},
    {...dolly(663,[-1.8,8.5,22],[-4.1,1.55,3.7],49,6,{rate:.0006}),duration:38},
  ],
];

export function shotAt(frame: number) {
  const index = SHOTS.findIndex(shot => frame < shot.end);
  return Math.max(0,index < 0 ? SHOTS.length-1 : index);
}

export function cameraAt(frame: number) {
  const keys = CAMS[shotAt(frame)];
  let result = keys[0].pose(frame);
  for (const key of keys.slice(1)) {
    if (frame < key.frame) break;
    const next = key.pose(frame);
    const blend = glide((frame-key.frame)/key.duration);
    result = {position:mixPosition(result.position,next.position,blend),look:mixPosition(result.look,next.look,blend),
      focus:mixPosition(result.focus,next.focus,blend),fov:mix(result.fov,next.fov,blend),
      roll:mix(result.roll,next.roll,blend),blur:mix(result.blur,next.blur,blend)};
  }
  for (const kick of KICKS) {
    const age = frame-kick.frame;
    if (age < 0 || age >= 7) continue;
    const amount = kick.strength*(age%2 ? -1 : 1)*(1-age/7)**1.5;
    result.look = [result.look[0]+amount*.065,result.look[1]+amount*.035,result.look[2]];
    result.roll += amount*.004;
  }
  return result;
}


const FOREGROUND = {uphillRail: {hideFrom:627, hideUntil:670}};
export function foregroundAt(frame: number) {
  const cue = FOREGROUND.uphillRail;
  return {uphillRail: frame < cue.hideFrom || frame >= cue.hideUntil};
}


