import {M} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
import {sceneAt,shotAt} from './contract';
type V=[number,number,number];
type Key={f:number;p:V;l:V;fov:number;blur:number;cut?:boolean};
const k=(f:number,p:V,l:V,fov=45,blur=8,cut=false):Key=>({f,p,l,fov,blur,cut});
// Completed-action coverage changes receive a four-output-frame dissolve
// in index.tsx, rather than a large unmotivated fly-through. Outgoing
// plates contain no captions, so words remain crisp above the dissolve.
export const DISSOLVE_FRAMES=[170,209,256];
const hook:Key[]=[
 // Payment and the sellers' glance play within one stable composition.
 // The longer reframe limits travel speed instead of forcing every move
 // into the reference's median duration.
 k(0,[-.65,1.8,3.7],[-.90,1.42,-.75],47,8),
 k(70,[-.65,1.78,3.50],[-.90,1.42,-.75],47,8),
 k(123,[1.05,1.75,2.90],[.65,1.49,-.70],45,10),
 k(136,[1.04,1.74,2.87],[.65,1.49,-.70],45,10),
];
const field:Key[]=[
 k(137,[3.90,3.50,7.70],[-.1,1.0,-1.25],50,0),
 k(211,[3.82,3.46,7.55],[-.1,1.0,-1.25],50,0),
 k(212,[.60,1.40,3.40],[-.15,.85,.5],44,6,true),
 k(225,[.60,1.40,3.40],[-.15,.85,.5],44,6),
 k(258,[.55,1.65,3.15],[-.15,1.30,.5],44,8),
 k(260,[.54,1.65,3.14],[-.15,1.30,.5],44,8),
 k(261,[1.40,1.40,3.05],[.90,.80,-.55],45,6,true),
 k(264,[1.40,1.40,3.05],[.90,.80,-.55],45,6),
 k(296,[1.38,1.65,2.92],[.90,1.28,-.55],45,8),
 k(319,[1.38,1.65,2.90],[.90,1.28,-.55],45,8),
 k(320,[.90,1.80,2.80],[.10,1.38,-.10],44,8,true),
 k(365,[.65,1.72,2.80],[.20,1.46,-.25],46,10),
 k(394,[.65,1.72,2.72],[.20,1.46,-.25],46,10),
 k(424,[.45,1.70,2.70],[-.05,1.48,.30],46,10),
];
const office:Key[]=[
 k(425,[0,1.85,4.10],[-.10,1.35,-.70],45,7),
 k(502,[0,1.83,3.90],[-.10,1.35,-.70],45,7),
 k(553,[0,1.82,3.82],[-.10,1.35,-.70],45,7),
];
const investigate:Key[]=[
 k(554,[1.10,1.75,3.90],[-.30,.65,.5],44,4),
 k(599,[1.08,1.74,3.82],[-.30,.65,.5],44,4),
 k(632,[1.10,1.20,3.00],[.25,.15,.45],44,4),
 k(670,[1.08,1.19,2.95],[.25,.15,.45],44,4),
 k(704,[1.50,1.70,3.10],[.10,-.10,.5],44,1),
 k(739,[1.48,1.68,3.05],[.10,-.10,.5],44,1),
];
const london:Key[]=[
 k(740,[.35,1.80,3.35],[.10,1.25,-.50],44,7),
 k(809,[.32,1.78,3.18],[.10,1.25,-.50],44,7),
];
const plant:Key[]=[
 k(810,[.80,1.10,2.60],[-.05,.42,.5],46,6),
 k(818,[.80,1.10,2.60],[-.05,.42,.5],46,6),
 k(842,[.70,.70,2.20],[.02,.12,.5],46,6),
 k(857,[.69,.69,2.16],[.02,.12,.5],46,6),
];
const empty:Key[]=[k(858,[1.48,1.68,3.05],[.10,-.10,.5],44,1),k(889,[1.47,1.67,3.00],[.10,-.10,.5],44,1)];
const payoff:Key[]=[k(890,[1.10,1.70,1.90],[.94,1.44,-.75],44,11),k(951,[1.08,1.69,1.78],[.94,1.44,-.75],44,11)];
const lerp3=(a:V,b:V,t:number):V=>a.map((v,i)=>v+(b[i]-v)*t) as V;
export function viewAt(frame:number){
 const keys=frame<137?hook:frame<425?field:frame<554?office:frame<740?investigate:frame<810?london:frame<858?plant:frame<890?empty:payoff;
 let i=keys.findIndex((v,j)=>j<keys.length-1&&frame>=v.f&&frame<keys[j+1].f);if(i<0)i=frame<keys[0].f?0:keys.length-2;
 const a=keys[i],b=keys[i+1],t=b.cut?0:M.smooth(Math.max(0,Math.min(1,(frame-a.f)/(b.f-a.f))));
 const position=lerp3(a.p,b.p,t);
 const look=lerp3(a.l,b.l,t);return {position,look,focus:look,fov:a.fov+(b.fov-a.fov)*t,blur:a.blur+(b.blur-a.blur)*t,roll:0};
}
export function directionAt(frame:number){
 const scene=sceneAt(frame),coolness=M.smooth(Math.max(0,Math.min(1,(frame-540)/120))),cool=frame>=554;
 const flash=[137,425,554,740,810,858,890].reduce((m,f)=>Math.max(m,Math.max(0,1-Math.abs(frame-f)/4)),0)*.78;
 return {scene,beat:shotAt(frame).beat,cool,coolness,flash,flashback:frame>=740&&frame<858};
}
