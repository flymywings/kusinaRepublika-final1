// Hook v5 (HOOK-SHOTLIST.md): card 1 only, frames 0-149. A pure function of the frame number. No mirror reflection in the hook.
// 1A (f0-71): her face alone, big, one push in that lands on "terrified". Evening, cool reading.
// 1B (dissolve on "then" f72, then the glide): next morning. The camera comes in from the doorway side, past the case and the table, to table height at the booth.
// Frame times come from words-v3-corrected.json. Nothing here retimes or edits the narration.
import {SET,type V3} from './consts';
import type {Face,Pose,P,Role} from '../cast/b-hands/rig';

export const FPS=30;
/** Word start frames, rounded from words-v3-corrected.json (start seconds x 30). */
export const WF={This:2,girl:10,looked:22,terrified:26,of:49,his:51,face:54,then:72,came:80,back:88,to:95,buy:99,him:109,cake:112,Rintaro:137,is:149};
export const SHOTS={A:[0,71],B:[72,149]} as const;
/** Fork ticks. They become her heartbeat at the turn, so the rhythm is shared. */
export const TICKS=[0,11,21,32,42];

export interface Actor {
 id:string;role:Role;at:V3;pose:Omit<Pose,'role'>;stranger?:{hair:string;cloth:string};
 /** Small things drawn on the card: a coin between finger and thumb, an earring glint (card space, mm). The hands are the approved cast B dots. */
 /** a reflection card: clipped to the glass rectangle (card space, mm), cooler, optionally blurred */
 glass?:{scale:number;mask:{x0:number;x1:number;y0:number;y1:number};cool:number;soft:number};
 overlay?:{coin?:P;glint?:P;cloth?:P};
}
export interface Sun {pos:V3;color:string;i:number;hemi:string;hemiI?:number;mood?:{lit:V3;shade:V3;lift:V3;tint:V3;fill:number}}
export interface Shot {
 id:string;eye:V3;look:V3;fov:number;blur:number;focus:V3;warmth:number;sun:Sun;
 actors:Actor[];door:number;bell:number;meal:boolean;box?:boolean;
 slice?:{p:V3;turn:number};coins?:V3[];roll?:number;
}
export const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ease=(t:number,a:number,b:number)=>{const x=clamp((t-a)/(b-a));return x*x*x*(x*(x*6-15)+10);};
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const v3=(a:V3,b:V3,t:number):V3=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const p2=(a:P,b:P,t:number):P=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
/** closed frames: lids half, shut, shut, half. `slow` holds the shut frames longer. */
export const blink=(f:number,at:number[],slow=false)=>{for(const a of at){const n=f-a;const seq=slow?[.5,1,1,1,1,.5]:[.5,1,1,.5];if(n>=0&&n<seq.length)return seq[n];}return 0;};
/** piecewise keyframes, smooth between keys: [frame,value] */
export const key=(f:number,k:[number,number][])=>{if(f<=k[0][0])return k[0][1];for(let i=1;i<k.length;i++){if(f<=k[i][0]){const [a,va]=k[i-1],[b,vb]=k[i];return lerp(va,vb,ease(f,a,b));}}return k[k.length-1][1];};
export const breathe=(f:number,period=34,ph=0)=>Math.sin((f/period+ph)*Math.PI*2);

// ---------------------------------------------------------------------------------------------------------------
// Her. Frame 0 is the STARE state.
export const HER_AT:V3=SET.seat;
const HC_HER=1.048; // world height of her eyes
export const HER_EYES:V3=[HER_AT[0],HC_HER,HER_AT[2]];

// ---------------------------------------------------------------------------------------------------------------
// Camera. Both layers share one function of the frame. The camera always looks along -z with a downward pitch (the project() maths in rules.ts relies on that).
export interface Cam {eye:V3;pitch:number;fov:number}
/** 1A: close on her face, centred. One push toward her eyes: slow from frame 0, a punch on "terrified" (f22-31), then a slow drift. */
export const CAM_A:Cam={eye:[.74,1.45,.0],pitch:15,fov:40};
function rateA(f:number){return f>=22&&f<31?.010:.0016;}
function kA(f:number){let k=1;for(let i=0;i<f;i++)k*=1-rateA(i);return k;}
export const toward=(e:V3,p:V3,k:number):V3=>[p[0]+(e[0]-p[0])*k,p[1]+(e[1]-p[1])*k,p[2]+(e[2]-p[2])*k];

/** 1B: from the doorway side (x -0.1, z 2.6, high and wide) to the table at the booth (x .85, z .5, low), a symmetric 34 frame glide f68-102,
 *  then a slow push toward her hands and the box and one punch on "Rintaro". */
export const CAM_DOOR:Cam={eye:[-.1,1.45,2.6],pitch:5,fov:54};
export const CAM_TABLE:Cam={eye:[.85,1.12,-.15],pitch:7,fov:42};
const HANDS_FOE:V3=[.9,.8,-1.9];
const GLIDE=[68,117] as const; // r5: the pan to her sticks 0.5 s longer (was 68-102)
export function camAt(f0:number,phase:'eve'|'morn'):Cam{
 const f=phase==='morn'?Math.min(f0,122):f0; // the morning layer is held still from f122 so nothing drifts under the fade
 if(phase==='eve')return {eye:toward(CAM_A.eye,HER_EYES,kA(f)),pitch:CAM_A.pitch,fov:CAM_A.fov};
 const u=ease(f,GLIDE[0],GLIDE[1]);
 let eye=v3(CAM_DOOR.eye,CAM_TABLE.eye,u),g=1;
 for(let i=GLIDE[1];i<=f;i++)g*=1-.0024;
 eye=toward(eye,HANDS_FOE,g);
 if(f>=WF.Rintaro){let h=1;for(let i=WF.Rintaro;i<=f;i++)h*=1-.0045;eye=toward(eye,HER_EYES,h);}
 return {eye,pitch:lerp(CAM_DOOR.pitch,CAM_TABLE.pitch,u),fov:lerp(CAM_DOOR.fov,CAM_TABLE.fov,u)};
}
export const lookOf=(c:Cam):V3=>{const r=c.pitch*Math.PI/180;return [c.eye[0],c.eye[1]-Math.sin(r)*10,c.eye[2]-Math.cos(r)*10];};

// Suns. The time of day is the light: late-afternoon gold across her and the wall, next-morning neutral daylight.
export const EVE:Sun={pos:[10,2.3,1.6],color:'#ffa95a',i:4.0,hemi:'#ecd2b2',mood:{lit:[1.75,1.32,.9],shade:[.58,.48,.44],lift:[.05,.04,.05],tint:[1,.9,.76],fill:.9}};
export const MORN:Sun={pos:[-5,5.2,9],color:'#f2f7ff',i:5.2,hemi:'#eef4fa',hemiI:1,mood:{lit:[1.36,1.4,1.44],shade:[.52,.56,.64],lift:[.05,.05,.08],tint:[.97,.99,1.02],fill:.95}};

/** A card-space hand position (mm, y down) that lands on world point `w`, seen from `eye`. */
export function cardHand(eye:V3,w:V3,card:V3=HER_AT):P{
 const k=(card[2]-eye[2])/(w[2]-eye[2]),x=eye[0]+(w[0]-eye[0])*k,y=eye[1]+(w[1]-eye[1])*k;
 return [(x-card[0])*1000,-(y-card[1])*1000];
}

/** The tremble that carries the fork ticks. */
export function forkHand(f:number):P{
 const base:P=[-270,-1030];
 let dy=0;for(const t of TICKS)if(f>=t&&f<t+3)dy+=[12,18,7][f-t];
 const calm=(f>=WF.face?.55:1)*(1+1.8*ease(f,20,28)*(1-ease(f,38,58)));
 return [base[0]+calm*(3.4*Math.sin(f*1.9)+1.7*Math.sin(f*3.3+1)),base[1]+dy+calm*(2.8*Math.sin(f*2.4+.5))];
}

/** her recoil on "terrified": a quick lean away, and back */
const recoil=(f:number)=>.2*ease(f,18,26)*(1-ease(f,34,54));
const shrink=(f:number)=>.7*ease(f,20,28)*(1-ease(f,40,60));
export function herEve(f:number):Actor{
 // Wary at the start, then a full ":o" on "terrified" (mouth open, brows up and in, eyes wide), held through "of his", then the mouth closes tight on "face".
 const w=ease(f,0,WF.terrified);
 const face:Face={
  wide:key(f,[[0,.9],[14,.95],[24,1],[56,1],[70,.6]]),
  // eyes dart: toward him on "looked", locked on "terrified", then down and away on "face"
  look:[key(f,[[0,.5],[14,.9],[26,1],[32,-.2],[38,1],[44,-.4],[50,.9],[58,-.6],[70,-.8]]),key(f,[[0,-.5],[26,-1],[32,-.3],[38,-1],[44,-.5],[50,-1],[58,.9],[70,.8]])],
  brow:[key(f,[[0,-3.4],[14,-4],[25,-5.8],[54,-5.2],[70,-2.8]]),key(f,[[0,-.6],[25,-.9],[54,-.7],[70,-.6]])],
  mouthShift:-2,mouth:key(f,[[0,-.9],[16,-.9],[20,0],[56,0],[66,-1.2]]),parted:key(f,[[0,0],[19,0],[26,2.2],[48,2.2],[58,.6],[64,0]]),full:1,crumb:true,
  blink:blink(f,[9,64],true),
 };

 const hand=forkHand(f);
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{
  face,lean:-recoil(f),hunch:shrink(f),bow:.12*ease(f,20,28)*(1-ease(f,44,62)),tilt:.006*breathe(f,34,.25)-.08*ease(f,20,28)*(1-ease(f,40,62)),hands:[hand,[lerp(190,120,ease(f,22,30)*(1-ease(f,44,64))),lerp(-960,-720,ease(f,22,30)*(1-ease(f,44,64)))]],elbows:[[-330,-880],[260,-760]],prop:'fork',propAt:hand}};
}

// the morning: calm, and her hands do the buying
const COIN1:V3=[.55,SET.table.top+.003,-1.99],COIN2:V3=[.62,SET.table.top+.003,-1.99];
const BOX0:V3=[1.05,SET.table.top,-1.98],BOX1:V3=[1.05,SET.table.top,-1.7];
function boxAt(f:number):V3{const u=ease(f,102,WF.cake);return [lerp(BOX0[0],BOX1[0],u),BOX0[1],lerp(BOX0[2],BOX1[2],u)];}

function herMorn(f:number,eye:V3):Actor{
 // the hands hover just above the table so they stay clear of the props they work on
 const hov=(w:V3,up:number)=>cardHand(eye,[w[0],w[1]+up,w[2]]);
 // Morning: nervous on "then came back", a big shy smile on "buy", a happy squint on "cake", then hopeful eyes up. The face is finished by f122 and then HELD
 // unchanged through the fade to Rintaro, so nothing moves on her face while it dissolves.
 const g=Math.min(f,122);
 const calm:Face={wide:key(g,[[66,.1],[80,.1],[88,0],[94,-.85],[108,-.85],[112,.15],[122,.5]]),
  // neutral return on "then came back"; head and eyes DROP to the box on "buy" (a small smile); chin lifts into the big smile on "cake"; then the eyes go up to him
  look:[key(g,[[66,0],[84,0],[92,.5],[108,.5],[114,0],[122,0]]),key(g,[[66,-.1],[84,-.1],[92,1.8],[108,1.8],[114,-.4],[122,-1.1]])],
  brow:[key(g,[[72,-.4],[84,-.3],[99,-.8],[112,-2.4],[122,-3.4]]),key(g,[[72,-.4],[84,-.3],[112,-.2],[122,-1.6]])],
  mouth:key(g,[[72,.15],[90,.15],[99,.45],[108,.5],[112,1.9],[122,1.3]]),
  smileEyes:g>=113&&g<=119,blink:f<=122?blink(g,[76,124]):0};
 const gt=.07*ease(g,90,98)*(1-ease(g,106,112))+ease(g,108,114)*.05-.02*ease(g,114,122);
 const rest:P=[-330,-1000],back:P=hov([.45,SET.table.top,-1.95],.1);
 // The coins land at the back of the table. The dot is the cast B dot: it carries the coin down to the landing spot, sits 14 mm above its centre
 // and the resting coin appears at exactly that projected spot on the release frame (f99 and f103).
 const cc1=cardHand(eye,COIN1),cc2=cardHand(eye,COIN2);
 const touch=(c:P):P=>[c[0],c[1]-14],air=(c:P,up:number):P=>[c[0]-12,c[1]-up];
 let h0:P=rest;
 if(f<84)h0=rest;
 else if(f<93)h0=p2(rest,air(cc1,150),ease(f,84,93));
 else if(f<WF.buy)h0=p2(air(cc1,150),touch(cc1),ease(f,93,WF.buy));
 else if(f<101)h0=p2(touch(cc1),air(cc1,70),ease(f,WF.buy,101));
 else if(f<103)h0=p2(air(cc1,70),touch(cc2),ease(f,101,103));
 else if(f<110)h0=p2(touch(cc2),air(cc2,120),ease(f,103,110));
 else h0=p2(air(cc2,120),back,ease(f,110,122));
 // the coin in the dot hand: it glides onto the exact landing spot just before release (the card draws the coin 6 mm right, 6 mm up of this point)
 let coin:P|undefined;
 if(f>=84&&f<WF.buy)coin=p2(h0,[cc1[0]-6,cc1[1]+6],ease(f,93,98));
 else if(f>=WF.buy&&f<103)coin=p2(h0,[cc2[0]-6,cc2[1]+6],ease(f,100,102));
 // left hand (screen right): slides the box toward the lens, fingertips on its rear edge, then stays there
 const b=boxAt(f),lip=(q:V3)=>hov([q[0]+.085,q[1]+.056,q[2]-.058],.016),onBox=lip(b);
 let h1:P=[190,-960];
 if(f>=96&&f<103)h1=p2([190,-960],lip(BOX0),ease(f,96,102));else if(f>=102)h1=onBox;
 const hands:[P,P]=[h0,h1];
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(g),HER_AT[2]],pose:{
  // the next morning: she is in her school clothes
  outfit:'school',bow:.3*ease(g,88,96)*(1-ease(g,106,112))-.1*ease(g,108,114)*(1-.4*ease(g,114,122)),face:calm,tilt:.006*breathe(g,34,.25)+gt,hands,elbows:[[-290,-900],[260,-820]]},
  overlay:coin?{coin}:undefined};
}

// ---------------------------------------------------------------------------------------------------------------
// Focus: her eyes in 1A. In 1B her eyes through the glide, then coins, box, her eyes.
function focusAt(f:number,phase:'eve'|'morn'):V3{
 if(phase==='eve')return HER_EYES;
 const coins:V3=[.63,.8,-1.78],box:V3=[BOX1[0],.85,BOX1[2]];
 if(f<92)return HER_EYES;
 if(f<WF.buy)return v3(HER_EYES,coins,ease(f,92,WF.buy));
 if(f<WF.cake)return v3(coins,box,ease(f,WF.buy,WF.cake));
 return v3(box,HER_EYES,ease(f,WF.cake,118));
}

export function sceneAt(f:number,phase:'eve'|'morn'):Shot{
 const c=camAt(f,phase),eye=c.eye,look=lookOf(c);
 const eve=phase==='eve';
 const base={eye,look,fov:c.fov,blur:eve?15:f<WF.buy?14:12,focus:focusAt(f,phase)};
 if(eve)return {id:'1A',...base,actors:[herEve(f)],warmth:.82,sun:EVE,door:0,bell:0,meal:true};
 const coins:V3[]=[];if(f>=WF.buy)coins.push(COIN1);if(f>=103)coins.push(COIN2);
 return {id:'1B',...base,actors:[herMorn(f,eye)],warmth:.42,sun:MORN,door:0,bell:0,meal:false,coins,slice:{p:boxAt(f),turn:.08}};
}

// ---------------------------------------------------------------------------------------------------------------
// Rintaro. The street shot fades in over the last frames of 1B so his face is already on screen when the name is said (f137).
// It starts framed like her face (same place and size) so the dissolve is a matched one, then pulls back to his full height from "Rintaro".
export const FADE=[125,137] as const;
export const HIS_HEAD_Y=1.639;const ASP=9/16,HIM_HALF_W=.28;
export const STREET:Sun={pos:[7,3.9,9],color:'#ffbf7c',i:3.4,hemi:'#d9cdb8'};
export const HIM_REAL:V3=[1.0,0,4.4];
const HANDS_IN:[P,P]=[[-196,-850],[196,-850]];
function himReal(f:number):Actor{
 return {id:'him',role:'rintaro',at:[HIM_REAL[0],HIM_REAL[1]+.004*breathe(f,40,.1),HIM_REAL[2]],pose:{outfit:'school',tilt:-.004*breathe(f,40,.1),
  face:{look:[lerp(0,-.4,ease(f,WF.Rintaro+2,WF.Rintaro+12)),0],blink:blink(f,[WF.Rintaro+4])},
  hands:HANDS_IN,elbows:[[-330,-1040],[330,-1040]]}};
}
export function streetAt(f:number):Shot{
 const m={u:.44,v:.36,w:.6};
 const fov=lerp(CAM_TABLE.fov,40,ease(f,FADE[0],FADE[1]));
 const t=Math.tan(fov*Math.PI/360),span=2*t;
 const d0=2*HIM_HALF_W/(m.w*span*ASP);
 const eye0:V3=[HIM_REAL[0]-(m.u-.5)*d0*span*ASP,HIS_HEAD_Y+(m.v-.5)*d0*span,HIM_REAL[2]+d0];
 const d1=d0*m.w/.7;
 const eyeEnd:V3=[HIM_REAL[0]-(m.u-.5)*d1*span*ASP,HIS_HEAD_Y+(.47-.5)*d1*span,HIM_REAL[2]+d1];
 // a steady push under the fade, then the pull back to his full height from the name
 const e=ease(f,WF.Rintaro-4,149),drift=1-.0024*(WF.Rintaro-clamp(f,FADE[0],WF.Rintaro)),pe=v3(eye0,eyeEnd,e);
 const eye:V3=[pe[0],pe[1],HIM_REAL[2]+(pe[2]-HIM_REAL[2])*drift];
 return {id:'2A',eye,look:[eye[0],eye[1],eye[2]-10],fov,blur:lerp(16,13,e),focus:[HIM_REAL[0],HIS_HEAD_Y,HIM_REAL[2]],warmth:.6,sun:STREET,actors:[himReal(f)],door:0,bell:0,meal:false};
}

export interface Layer {shot:Shot;opacity:number}
/** The 6-frame dissolve from evening to morning starts on "then"; the fade to Rintaro's street runs f125-137. */
export function hookLayersAt(f:number):Layer[]{
 const u=clamp((f-WF.then)/6);
 if(f<WF.then)return [{shot:sceneAt(f,'eve'),opacity:1}];
 if(f<WF.then+6)return [{shot:sceneAt(f,'eve'),opacity:1-clamp((f-WF.then)/3)},{shot:sceneAt(f,'morn'),opacity:clamp((f-WF.then-3)/3)}];
 if(f<FADE[0])return [{shot:sceneAt(f,'morn'),opacity:1}];
 if(f<FADE[1]){const q=clamp((f-FADE[0])/(FADE[1]-FADE[0])),s=q*q*(3-2*q);return [{shot:sceneAt(f,'morn'),opacity:1},{shot:streetAt(f),opacity:s}];}
 return [{shot:streetAt(f),opacity:1}];
}
/** The named state other cards reuse: frame 0 exactly. */
export const stare=(k=0)=>sceneAt(k,'eve');
export const STARE=()=>stare(0);
export const project=(eye:V3,pitchDeg:number,fov:number,p:V3):{u:number;v:number;d:number}=>{
 const ASP=9/16,t=Math.tan(fov*Math.PI/360),pr=pitchDeg*Math.PI/180,dx=p[0]-eye[0],dy=p[1]-eye[1],dz=p[2]-eye[2];
 const fwd=-dz*Math.cos(pr)-dy*Math.sin(pr),up=dy*Math.cos(pr)-dz*Math.sin(pr);
 return {u:.5+.5*dx/(fwd*t*ASP),v:.5-.5*up/(fwd*t),d:fwd};
};
