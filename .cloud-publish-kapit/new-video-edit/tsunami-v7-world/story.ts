import {interpolate} from 'remotion';
import {glide} from '../upstream/templates/bridge/story';
import {FAULT} from '../tsunami/story';
import {coastHeight} from './CoastSet';
import {retreatAt} from './shore';

type Point = [number, number, number];
type Pose = {position: Point; look: Point; focus: Point; fov: number; blur: number; roll: number};
type Key = {frame: number; duration: number; pose: (frame: number) => Pose};

export const OPENING_FRAMES = 82;
export const FULL_FRAMES = 756;
export const DIVE_FRAME = 153;
export const SURFACE_FRAME = 409;
export const CUTS = [0, 52, 93, DIVE_FRAME, SURFACE_FRAME, 535, FULL_FRAMES];

function ramp(frame: number, start: number, end: number, from: number, to: number) {
  return interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}

function pointBetween(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t, a[2] + (b[2]-a[2])*t];
}

function dolly(frame: number, position: Point, look: Point, fov: number, blur: number, focus = look, rate = .0011): Key {
  return {frame, duration: 24, pose(f) {
    const push = 1 - Math.exp(-rate*Math.max(0, f-frame));
    return {position: pointBetween(position,look,push), look, focus, fov, blur, roll: 0};
  }};
}

function resolve(keys: Key[], frame: number) {
  let view = keys[0].pose(frame);
  for (const key of keys.slice(1)) {
    if (frame < key.frame) break;
    const t = glide((frame-key.frame)/key.duration);
    const next = key.pose(frame);
    view = {
      position: pointBetween(view.position, next.position, t),
      look: pointBetween(view.look, next.look, t),
      focus: pointBetween(view.focus, next.focus, t),
      fov: view.fov+(next.fov-view.fov)*t,
      blur: view.blur+(next.blur-view.blur)*t,
      roll: view.roll+(next.roll-view.roll)*t,
    };
  }
  return view;
}

const coastAngle: Point = [.4,1.86,13.45];
const coastAim: Point = [-1.23,.92,4.65];
const bowContact: Point = [-.5,.04,5.42];
const shoreEntry = dolly(115,[1.55,1.08,8.8],[-1.46,-.1,6.15],53,3);
const resurfacing = dolly(384,[1.9,.49,9.2],[-1.12,-.32,5.6],51,2,[-1.46,-.2,6.15]);

const CAMS: Key[][] = [
  [dolly(0,coastAngle,coastAim,56,8,bowContact)],
  [
    dolly(52,[1.56,1.18,9.82],[-.67,.42,4.99],44,11,bowContact),
    {...dolly(56,[.84,1.05,8.95],[-.63,.24,5.09],44,12,bowContact), duration: 26},
  ],
  [
    dolly(93,[4.9,8.8,22],[-2.6,.72,3.2],48,0),
    {...shoreEntry, duration:38},
  ],
  [
    shoreEntry,
    {...dolly(154,[1.8,-.65,6.8],[0,-1.05,-1.2],52,0), duration: 37},
    {...dolly(204,[-.90,-.32,4.1],[1.05,-1.66,.35],49,3,[.9,-1.75,.28],.0005), duration: 33},
    {...dolly(264,[1.30,-.84,4.9],[-.65,-.32,-1.2],52,0), duration: 34},
    {...dolly(315,[1.65,-.54,8.8],[-1.18,-.34,5.8],49,1,[-1.46,-.22,6.15],.0002), duration: 34},
    {...resurfacing, duration: 25},
  ],
  [
    resurfacing,
    {...dolly(411,coastAngle,coastAim,56,6,bowContact), duration: 30},
    {...dolly(440,[-3.75,2.48,11.25],[-4.41,1.42,3.64],54,10,[-3.9,1.5,2.85]), duration: 25},
    {...dolly(462,[-3.26,1.95,8.65],[-3.97,1.26,2.92],43,13,[-3.9,1.43,2.85]), duration: 24},
  ],
];

export function coastBeat(frame: number) {
  const index = CUTS.findIndex(end => frame < end);
  const shot = index < 0 ? CUTS.length-2 : Math.max(0,index-1);
  const retreat = retreatAt(frame);
  const runAge = Math.max(0,frame-580);
  const acceleration = Math.min(runAge,14);
  const x = -3-.043*(acceleration*acceleration/28+runAge-acceleration);
  const actor: Point = [x,coastHeight(x),5.3];
  const lift = ramp(frame,FAULT.start,FAULT.end,0,.874);
  const disturbance = ramp(frame,FAULT.end,340,0,-2.65);
  let view: Pose;
  if (shot < CAMS.length) {
    view = resolve(CAMS[shot],frame);
    const age = frame-FAULT.start;
    if (shot===3 && age>=0 && age<7) {
      const kick = .8*(age%2 ? -1 : 1)*(1-age/7)**1.5;
      view.look = [view.look[0]+kick*.06,view.look[1]+kick*.035,view.look[2]];
      view.roll = kick*.003;
    }
  } else {
    const close = glide((frame-539)/28);
    const orbit = glide((frame-572)/39);
    const follow = glide((frame-608)/38);
    const widen = glide((frame-645)/39);
    const drift = Math.max(0,frame-684)/(FULL_FRAMES-684);
    const side = pointBetween([x+.55,actor[1]+1.91,9.73-.82*close],[x+2.38,actor[1]+1.2,9.25],orbit);
    const rear: Point = [x+4.45,actor[1]+1.68,7.65];
    const face = pointBetween([x+.13,actor[1]+1.22+.14*close,5.22],[x-.17,actor[1]+1.08,5.3],orbit);
    view = {
      position:pointBetween(pointBetween(side,rear,follow),[-1.8-1.8*drift,10.35+.35*drift,22.5+2.3*drift],widen),
      look:pointBetween(pointBetween(face,[x-.54,actor[1]+1.07,5.3],follow),[-5.05-1.15*drift,2.45,3.9],widen),
      focus:[x,actor[1]+1.54-.42*follow,5.3],fov:42-3*close*(1-orbit)+4*orbit+9*widen,
      blur:(14-7*follow)*(1-widen),roll:0,
    };
  }
  return {shot,view,actor,retreat,lift,disturbance};
}



