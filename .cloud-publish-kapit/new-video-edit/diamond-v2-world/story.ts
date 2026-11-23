import {M,spline} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
import {sceneAt,shotAt} from './contract';
type V=[number,number,number];
type Key={f:number;p:V;l:V;fov:number;blur:number;path?:V[]};
const k=(f:number,p:V,l:V,fov=45,blur=8,path?:V[]):Key=>({f,p,l,fov,blur,path});
const field:Key[]=[
 k(0,[.2,2.1,4.7],[0,1.0,-.2],47,5),
 k(9,[.2,2.08,4.6],[0,1.03,-.2],47,5),
 k(51,[0,1.85,2.95],[-.25,1.4,.45],43,11),
 k(83,[-.02,1.82,2.85],[-.25,1.4,.45],43,11),
 k(115,[-.03,1.8,2.78],[-.25,1.4,.45],43,11),
 k(137,[-.03,1.8,2.75],[-.25,1.4,.45],43,11),
 k(168,[4.3,3.8,8.3],[-.1,1.0,-1.25],50,0,[[2.1,3.3,6.7]]),
 k(211,[4.15,3.7,8.1],[-.1,1.0,-1.25],50,0),
 k(238,[.45,1.95,3.1],[-.32,1.35,.4],44,11),
 k(273,[.42,1.92,3.0],[-.32,1.35,.4],44,11),
 k(294,[1.6,1.04,1.9],[.77,.42,-.55],43,9),
 k(319,[1.8,1.9,3.6],[1.0,1.32,-.4],44,11),
 k(341,[1.6,2.45,5.5],[0,1.3,-.25],46,6),
 k(367,[.9,1.9,2.9],[.03,1.33,-.08],43,12),
 k(391,[.82,1.88,2.75],[.03,1.33,-.08],43,12),
 k(424,[.74,1.94,3.0],[.03,1.43,-.15],44,11),
];
const office:Key[]=[k(425,[1.7,2.5,5.6],[.2,1.2,-.3],47,7),k(450,[.65,1.9,2.9],[.05,1.2,-.08],44,12),k(489,[.5,1.88,2.75],[-.1,1.2,-.15],44,12),k(520,[2.3,2.4,5.1],[.1,1.25,-.8],46,7),k(553,[2.15,2.4,5.1],[-.35,1.3,-.9],46,7)];
const investigate:Key[]=[k(554,[2.2,2.8,6.1],[.1,.9,.15],46,6),k(586,[1.1,1.9,3.4],[-.08,.65,.55],43,7),k(622,[.85,.85,1.95],[.0,.12,.5],43,9),k(658,[.8,.83,1.89],[.0,.12,.5],43,9),k(688,[1.5,1.65,2.8],[.05,-.08,.5],44,2),k(714,[1.3,1.25,2.5],[.05,-.28,.5],43,1),k(739,[1.27,1.23,2.46],[.05,-.28,.5],43,1)];
const london:Key[]=[k(740,[.8,1.9,3.6],[.08,1.15,-.1],45,9),k(767,[.7,1.7,2.2],[.08,1.14,.07],43,12),k(814,[.68,1.69,2.18],[.08,1.14,.07],43,12)];
const plant:Key[]=[k(815,[.85,.95,2.0],[0,.28,.5],43,10),k(839,[.78,.86,1.88],[0,.18,.5],43,10)];
const empty:Key[]=[k(840,[1.25,1.25,2.5],[.05,-.28,.5],43,1),k(889,[1.23,1.23,2.46],[.05,-.28,.5],43,1)];
const payoff:Key[]=[k(890,[1.3,2.25,5.2],[.25,1.22,-.55],46,6),k(908,[1.8,1.95,3.3],[.9,1.35,-.85],43,11),k(951,[1.72,1.91,3.05],[.9,1.35,-.85],43,12)];
const lerp3=(a:V,b:V,t:number):V=>a.map((v,i)=>v+(b[i]-v)*t) as V;
export function viewAt(frame:number){
 const keys=frame<425?field:frame<554?office:frame<740?investigate:frame<815?london:frame<840?plant:frame<890?empty:payoff;
 let i=keys.findIndex((v,j)=>j<keys.length-1&&frame>=v.f&&frame<keys[j+1].f);if(i<0)i=frame<keys[0].f?0:keys.length-2;
 const a=keys[i],b=keys[i+1],t=M.smooth(Math.max(0,Math.min(1,(frame-a.f)/(b.f-a.f))));
 const position=(b.path?spline([a.p,...b.path,b.p],t):lerp3(a.p,b.p,t)) as V;
 const look=lerp3(a.l,b.l,t);return {position,look,focus:look,fov:a.fov+(b.fov-a.fov)*t,blur:a.blur+(b.blur-a.blur)*t,roll:0};
}
export function directionAt(frame:number){
 const scene=sceneAt(frame),cool=(frame>=554&&frame<740)||frame>=840;
 const flash=[425,554,740,815,840,890].reduce((m,f)=>Math.max(m,Math.max(0,1-Math.abs(frame-f)/4)),0)*.78;
 return {scene,beat:shotAt(frame).beat,cool,flash,flashback:frame>=740&&frame<840};
}
