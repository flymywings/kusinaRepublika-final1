import {M,spline} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
import {sceneAt,shotAt} from './contract';
type V=[number,number,number];
type Key={f:number;p:V;l:V;fov:number;blur:number;path?:V[]};
const k=(f:number,p:V,l:V,fov=48,blur=8,path?:V[]):Key=>({f,p,l,fov,blur,path});
const field:Key[]=[
 k(0,[-.04,.58,1.4],[-.12,.24,.5],48,14),k(50,[-.02,.52,1.35],[-.08,.18,.5],46,14),k(76,[.05,.42,1.25],[-.01,.08,.5],44,14),
 k(105,[1.7,2.5,6.9],[0,1,0],48,7),k(165,[6.2,4.6,11.1],[0,1.05,-.5],54,0),
 k(235,[3.1,3.4,7],[0,1,0],49,5,[[5,4.7,9],[4.5,4,8]]),
 k(274,[.38,.52,1.4],[0,.10,.5],46,12),k(299,[.15,2.02,3.6],[-.35,1.6,.5],44,12),
 k(312,[1.15,.55,.6],[.74,.14,-.55],47,12),k(337,[1.6,1.95,3.4],[1.1,1.65,-.55],44,12),
 k(370,[2.2,2.4,6.5],[.2,1.2,-.45],49,7),k(412,[.7,1.9,3.3],[.08,1.35,-.2],43,12),
 k(472,[.5,1.85,2.9],[.08,1.35,-.2],43,13),
];
const office:Key[]=[k(472,[.65,2.4,5.5],[.6,1.38,.05],49,7),k(520,[-.15,2,2.8],[-.35,1.36,-.28],45,13),k(558,[3.1,2.65,6.4],[.4,1.1,-.7],49,6),k(588,[2.1,2.5,5.5],[-.4,1.15,-.8],45,9)];
const investigation:Key[]=[k(588,[2.2,2.9,6.7],[-.2,1,0],48,7),k(634,[.6,1.6,3],[-.3,.8,.55],43,11),k(676,[.85,2.3,3.6],[.05,.48,.4],44,4),k(710,[1.05,2.4,3.4],[.2,.4,.25],45,3),k(756,[1.4,2.6,3.6],[.3,.25,-.15],47,1),k(776,[1.42,2.58,3.58],[.3,.25,-.15],47,1)];
const london:Key[]=[k(776,[.6,1.65,2.5],[0,1.12,.15],45,12),k(825,[2.5,2.8,6],[0,1.25,-.3],49,6),k(876,[.1,1.75,2.6],[.2,1.14,.12],45,12)];
const empty:Key[]=[k(876,[.45,.5,1.3],[.48,.02,.7],45,12),k(926,[.75,.62,1.6],[.48,.02,.7],45,10)];
const payoff:Key[]=[k(926,[.5,1.85,3.4],[.4,1.3,-.35],45,10),k(948,[1.4,2.1,3.9],[1.1,1.35,-.9],43,12),k(981,[1.45,1.9,2.8],[1.15,1.35,-.9],42,13)];
const lerp3=(a:V,b:V,t:number):V=>a.map((v,i)=>v+(b[i]-v)*t) as V;
export function viewAt(frame:number){
 const keys=frame<472?field:frame<588?office:frame<776?investigation:frame<876?london:frame<926?empty:payoff;
 let i=keys.findIndex((v,j)=>j<keys.length-1&&frame>=v.f&&frame<keys[j+1].f);
 if(i<0)i=frame<keys[0].f?0:keys.length-2;
 const a=keys[i],b=keys[i+1],t=M.smooth((frame-a.f)/(b.f-a.f));
 const p=(b.path?spline([a.p,...b.path,b.p],t):lerp3(a.p,b.p,t)) as V;
 const look=lerp3(a.l,b.l,t),focus=look;
 const creep=1-.00024*Math.max(0,frame-a.f);
 return {position:lerp3(look,p,creep),look,focus,fov:a.fov+(b.fov-a.fov)*t,blur:a.blur+(b.blur-a.blur)*t,roll:0};
}
export function directionAt(frame:number){
 const scene=sceneAt(frame),cool=(frame>=588&&frame<776)||frame>=876;
 const flash=[472,588,776,876,926].reduce((m,f)=>Math.max(m,Math.max(0,1-Math.abs(frame-f)/3)),0)*.76;
 return {scene,beat:shotAt(frame).beat,cool,flash};
}
