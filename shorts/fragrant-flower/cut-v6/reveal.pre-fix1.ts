// Cards 5A-5F: the rewind and "her side" (proof build). Everything is a pure function of the frame number.
// Shot frames and word frames come from the shot list (film-shots.json) and the voice words (words-v4.json), never typed in here.
import {SET,MIRROR,type V3} from './consts';
import film from '../../../production-pipeline-proposal/film-shots.json';
import words from '../../../production-pipeline-proposal/voice/johnny-take-02/words-v4.json';
import {resolveShots,wordFrame} from '../../../pipeline/film-time.mjs';
import {chunkALayersAt,A as CA} from './chunkA';
import {EVE,HER_AT,HER_EYES,CAM_A,TICKS,hookLayersAt,sceneAt,ease,clamp,lerp,v3,key,blink,breathe,toward,lookOf,type Actor,type Shot,type Layer,type Cam,type Sun} from './story';
import type {Face,P} from '../cast/b-hands/rig';

const SH=Object.fromEntries((resolveShots(film as any,words as any) as any[]).map(s=>[s.id,s])) as Record<string,{f0:number;f1:number;n:number}>;
const wf=(l:number,w:string,n=1)=>wordFrame(words as any,l,w,n);
/** 5B and 5C are one merged move: C marks the second half (the mirror), where B ends on the cards' own timeline */
export const R={A:SH['5A'],B:{...SH['5B'],f1:wf(12,'look')},C:{f0:wf(12,'look'),f1:SH['5B'].f1},D:SH['5D'],E:SH['5E'],F:SH['5F']};
const fHER=wf(12,'HER'),fFlush=wf(14,'and'),fPound=wf(15,'POUNDING.'),fHe=wf(16,"He'd");
/** Rewind source: the proof reverses the hook (f122 back to f0, the STARE state). The full cut reverses cards 4E back to 3C instead. */
export const REWIND_SRC:[number,number]=[CA.a4E.f1-1,CA.a3C.f0+14];

// --- light: cool grey at the landing, gold spreading from her window, warmest at the flush
const COOL:Sun={...EVE,mood:{lit:[1.28,1.22,1.12],shade:[.5,.5,.56],lift:[.05,.05,.07],tint:[.96,.95,.95],fill:.9}};
export const WARM:Sun={...EVE,i:4.4,mood:{lit:[1.95,1.4,.86],shade:[.62,.5,.44],lift:[.06,.045,.05],tint:[1,.88,.72],fill:.92}};
function sunMix(a:Sun,b:Sun,t:number):Sun{
 const m=(x:V3,y:V3):V3=>[lerp(x[0],y[0],t),lerp(x[1],y[1],t),lerp(x[2],y[2],t)],A=a.mood!,B=b.mood!;
 return {...b,i:lerp(a.i,b.i,t),mood:{lit:m(A.lit,B.lit),shade:m(A.shade,B.shade),lift:m(A.lift,B.lift),tint:m(A.tint,B.tint),fill:lerp(A.fill,B.fill,t)}};
}
const sunAt=(f:number):Sun=>f<fHER+4?COOL:f<R.E.f0?sunMix(COOL,EVE,ease(f,fHER+4,R.C.f0+34)):sunMix(EVE,WARM,ease(f,R.E.f0,fPound));

// --- the mirror: his reflection watches her (first seen in 5C)
export const HIS_SCALE=.74,HIS_HEAD_Y=1.639,HIM_HEAD:[number,number]=[.93,1.5];
export function glassMask(card:V3,sc:number){
 const m=MIRROR,pad=.012;
 const gx=[(m.x-m.w/2+pad-card[0]),(m.x+m.w/2-pad-card[0])].map(x=>-x*1000/sc).sort((a,b)=>a-b);
 const gy=[(m.y-m.h/2+pad-card[1]),(m.y+m.h/2-pad-card[1])].map(y=>y*1000/sc);
 return {x0:gx[0],x1:gx[1],y0:-gy[1],y1:-gy[0]};
}
function himMirror(f:number):Actor{
 const door=ease(f,R.C.f0+8,R.C.f0+22);
 const face:Face={look:[lerp(-1.1,-1.4,door),.35],blink:blink(f,[R.C.f0+26])};
 const rise=1-ease(f,R.C.f0,R.C.f0+16),peek=.33*rise;
 const at:V3=[HIM_HEAD[0]+.25*rise,HIM_HEAD[1]-HIS_HEAD_Y*HIS_SCALE+.004*breathe(f,40,.1)-(1.1-peek)*rise,MIRROR.card];
 // the glass clears like fogged glass: a blur that falls away as the camera finishes its rise
 const soft=7*(1-ease(f,R.C.f0,R.C.f0+16));
 return {id:'him-mirror',role:'rintaro',at,pose:{face,shade:.1,tilt:-.004*breathe(f,40,.1)},glass:{scale:HIS_SCALE,mask:glassMask(at,HIS_SCALE),cool:.1,soft}};
}

// --- her: the frame-0 state, then it is read again. No fear: a small closed mouth, soft brows, the crumb. Flush starts on "and her heart was".
const beatDy=(f:number,t0:number)=>{let d=0;for(const t of TICKS){const n=f-t0-t;if(n>=0&&n<3)d+=[26,40,14][n];}return d;};
export function herReveal(f:number):Actor{
 const k=f-R.B.f0;
 const E=R.E.f0;
 const face:Face={
  wide:key(f,[[R.B.f0,.9],[fHER,.9],[R.C.f0,.3],[R.F.f1,.35]]),
  look:[key(f,[[R.B.f0,.5],[E+4,.5],[E+12,-1.3],[E+28,-1.3],[E+36,.5]]),key(f,[[R.B.f0,-.5],[E,-.5],[E+12,.3],[E+28,.3],[E+36,-.5]])],
  brow:[key(f,[[R.B.f0,-3.4],[fHER,-3.4],[R.C.f0,-.9],[E,-.9],[fPound,-2.2]]),key(f,[[R.B.f0,-.6],[R.C.f0,-.5],[fPound,-1]])],
  mouthShift:-2,mouth:key(f,[[R.B.f0,-.9],[fHER,-.9],[R.C.f0-4,.15],[R.F.f1,.15]]),
  parted:key(f,[[fPound-3,0],[fPound+3,.7],[R.F.f1,.5]]),
  full:1,crumb:true,
  flush:key(f,[[fFlush,0],[fPound,.8],[R.F.f1,.2]]),seen:key(f,[[fPound-9,0],[fPound-1,1],[R.F.f1,1]]),
  blink:blink(f,[R.B.f0+22,R.C.f0+14,E+4],true),
 };
 const tremble=1.4*Math.sin(f*1.9)+.8*Math.sin(f*3.3+1);
 const coll=ease(f,E+8,E+26); // the free hand closes on her collar
 const hand0:P=[-270+tremble,-1030+beatDy(f,fPound)+(f<fPound?beatDy(k,0):0)];
 const hand1:P=[lerp(190,95,coll),lerp(-960,-985,coll)+beatDy(f,fPound)];
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{
  face,tilt:.006*breathe(f,34,.25),bow:.08*(ease(f,E+8,E+16)-ease(f,E+30,E+40)),hands:[hand0,hand1],elbows:[[-330,-880],[lerp(260,200,coll),lerp(-760,-840,coll)]],prop:'fork',propAt:hand0}};
}

// --- his back, blurred, in the foreground for the pull back in 5F
export const himBack=():Actor=>({id:'him-back',role:'rintaro',at:[.3,0,-.5],pose:{back:true,outfit:'cafe'}});
// --- him in the shop, behind the case, as she sees him (5D)
function himShop(f:number):Actor{
 const k=f-R.D.f0,stop=ease(k,10,16);
 return {id:'him',role:'rintaro',at:[SET.behindCase[0]+.55,SET.behindCase[1],SET.behindCase[2]+.004*breathe(f,40,.1)*0],pose:{
  outfit:'cafe',tilt:-.004*breathe(f,40,.1),face:{look:[lerp(.2,1,stop),0],wide:.25,brow:[-.8,-.3],blink:blink(f,[R.D.f0+20,R.D.f0+38]),mouth:0},
  // the cloth hand wipes until "mountain"-style stop: it travels, then stops
  hands:[[-150+lerp(Math.sin(k*.5)*40,0,stop),-720],[170,-820]],elbows:[[-250,-760],[280,-700]]},overlay:{cloth:[-150+lerp(Math.sin(k*.5)*40,0,stop),-720]}};
}

// --- cameras (always looking along -z, pitch down; the rules maths relies on that)
const PUSH=.0016;
export const RISE_TO:Cam={eye:[.8,1.6,-.15],pitch:12,fov:40};
function camB(f:number):Cam{
 const k=f-R.B.f0,e0=toward(CAM_A.eye,HER_EYES,Math.pow(1-PUSH,k)),u=ease(f,fHER,R.C.f0);
 return {eye:v3(e0,RISE_TO.eye,u),pitch:lerp(CAM_A.pitch,RISE_TO.pitch,u),fov:lerp(CAM_A.fov,RISE_TO.fov,u)};
}
function camC(f:number):Cam{return {eye:toward(RISE_TO.eye,HER_EYES,Math.pow(1-PUSH,f-R.C.f0)),pitch:RISE_TO.pitch,fov:RISE_TO.fov};}
const E0:Cam={eye:[.8,1.56,.48],pitch:11,fov:42};
function camE(f:number):Cam{return {eye:toward(E0.eye,HER_EYES,Math.pow(1-.003,f-R.E.f0)),pitch:E0.pitch,fov:E0.fov};}
export function camF(f:number):Cam{
 const base=camE(R.E.f1-1);let kk=1;
 for(let i=R.F.f0;i<=f;i++)kk*=1-(i>=fPound&&i<fPound+10?.006:.002)*(1-ease(i,fHe,R.F.f1));
 const e=toward(base.eye,HER_EYES,kk),pull=ease(f,fHe,R.F.f1);
 return {eye:[e[0]+.05*pull,e[1]+.1*pull,e[2]+.9*pull],pitch:lerp(base.pitch,10,pull),fov:lerp(base.fov,44,pull)};
}
const camD=(f:number):Cam=>({eye:[-.95+.05*ease(f,R.D.f0,R.D.f1),1.3,.45-.4*ease(f,R.D.f0,R.D.f1)],pitch:0,fov:40});
const herBack=(f:number):Actor=>({id:'her-back',role:'kaoruko',at:[-1.38,.004*breathe(f),-1.3],pose:{back:true,outfit:'cafe'}});

function shotOf(id:string,c:Cam,f:number,actors:Actor[],focus:V3,blur:number,extra:Partial<Shot>={}):Shot{
 return {id,eye:c.eye,look:lookOf(c),fov:c.fov,blur,focus,warmth:.82,sun:sunAt(f),actors,door:0,bell:0,meal:true,...extra};
}
function revealShot(f:number):Shot{
 if(f<R.C.f0)return shotOf('5B',camB(f),f,[herReveal(f)],HER_EYES,14);
 if(f<R.D.f0)return shotOf('5C',camC(f),f,[herReveal(f),himMirror(f)],HER_EYES,14);
 if(f<R.E.f0)return shotOf('5D',camD(f),f,[himShop(f),herBack(f)],[SET.behindCase[0]+.55,1.64,SET.behindCase[2]],13);
 if(f<R.F.f0)return shotOf('5E',camE(f),f,[herReveal(f)],HER_EYES,12);
 const roll=.07*ease(f,fPound,fPound+13);
 return shotOf('5F',camF(f),f,[herReveal(f),...(f>=fHe-12?[himBack()]:[])],HER_EYES,12,{roll});
}

/** 5A: the picture reverses at once, accelerating then slowing, and lands on hook frame 0 (the STARE state) on the last frame. */
function rewindLayers(f:number):Layer[]{
 const r=f-R.A.f0,u=ease(r,0,R.A.n-1),g=Math.round(lerp(REWIND_SRC[0],REWIND_SRC[1],u));
 return r>=R.A.n-2?hookLayersAt(0):chunkALayersAt(g); // the last two frames are hook frame 0 exactly
}
export function revealLayersAt(f:number):Layer[]{
 if(f<R.B.f0)return rewindLayers(f);
 return [{shot:revealShot(f),opacity:1}];
}
/** tape effect over the rewind: strength, a tear band position and a vertical jitter, all deterministic */
export function fxAt(f:number){
 if(f<R.A.f0||f>=R.B.f0)return {tape:0,tearY:0,tearW:0,jit:0};
 const r=f-R.A.f0,hash=(n:number)=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
 const tapeK=ease(r,0,4)*(1-ease(r,R.A.n-5,R.A.n-1));
 return {tape:tapeK,tearY:hash(r)*.9+.03,tearW:(hash(r+9)>.45?.035+.05*hash(r+3):0)*tapeK,jit:(hash(r+5)-.5)*8*tapeK};
}
export const REVEAL_RANGE=[R.A.f0,R.F.f1] as const;
