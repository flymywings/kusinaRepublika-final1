// Hook B, "the mirror", round 1: card 1 (frames 0-148) and shot 2A. A pure function of the frame number.
// Frame times come from words-v3-corrected.json. Nothing here retimes or edits the narration.
import {SET,MIRROR,type V3} from './consts';
import type {Face,Pose,P,Role} from '../cast/b/rig';

export const FPS=30;
/** Word start frames, rounded from words-v3-corrected.json (start seconds x 30). */
export const WF={intimidating:209,pierced:185,This:2,girl:10,looked:22,terrified:26,of:49,his:51,face:54,then:72,came:80,back:88,to:95,buy:99,him:109,cake:112,Rintaro:137,is:149,tall:156};
export const SHOTS={A1:[0,53],B1:[54,98],C1:[99,148],A2:[149,199]} as const;
/** Fork ticks. They become her heartbeat at the turn, so the rhythm is shared. */
export const TICKS=[0,11,21,32,42];

export interface Actor {
 id:string;role:Role;at:V3;pose:Omit<Pose,'role'>;stranger?:{hair:string;cloth:string};
 /** A reflection card: parallel to the wall, mirrored, clipped to the glass rectangle (card space, mm), cooler and darker. */
 glass?:{scale:number;mask:{x0:number;x1:number;y0:number;y1:number};cool:number;soft:number};
 /** Small things drawn on the card: a coin between finger and thumb, an earring glint (card space, mm). The hands are the approved cast B dots. */
 overlay?:{coin?:P;glint?:P};
}
export interface Sun {pos:V3;color:string;i:number;hemi:string;hemiI?:number;mood?:{lit:V3;shade:V3;lift:V3;tint:V3;fill:number}}
export interface Shot {
 id:string;eye:V3;look:V3;fov:number;blur:number;focus:V3;warmth:number;sun:Sun;
 actors:Actor[];door:number;bell:number;meal:boolean;box?:boolean;
 slice?:{p:V3;turn:number};coins?:V3[];roll?:number;
}
export const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ease=(t:number,a:number,b:number)=>{const x=clamp((t-a)/(b-a));return x*x*x*(x*(x*6-15)+10);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const v3=(a:V3,b:V3,t:number):V3=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const p2=(a:P,b:P,t:number):P=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
/** closed frames: lids half, shut, shut, half. `slow` holds the shut frames longer. */
const blink=(f:number,at:number[],slow=false)=>{for(const a of at){const n=f-a;const seq=slow?[.5,1,1,1,1,.5]:[.5,1,1,.5];if(n>=0&&n<seq.length)return seq[n];}return 0;};
const breathe=(f:number,period=34,ph=0)=>Math.sin((f/period+ph)*Math.PI*2);

// ---------------------------------------------------------------------------------------------------------------
// Camera. 1A/1B: close and a little low, her face at the middle of the frame, his reflection above and behind her.
// 1C: raised so the table top is seen from about 27 degrees. Pushes are per-frame rates on the distance to a focus of
// expansion between the two faces: 0.22 % from frame 0, 0.6 % for 8 frames on "terrified", 0.6 % for 9 frames toward the mirror on "face".
export interface Cam {eye:V3;pitch:number;fov:number}
export const CAMA:Cam={eye:[.92,1.0,.95],pitch:1.4,fov:40};
export const CAMC:Cam={eye:[.95,1.72,.4],pitch:18,fov:48};
export const CAM=CAMA;
/** Where the opening push is heading: his reflected face. */
const foeHim=():V3=>[HIM.head[0],HIM.head[1],MIRROR.card];
/** Where the 1C move settles and keeps pushing: her hands and the box. */
const HANDS_FOE:V3=[.9,.8,-1.9];
const BASE=.0016;
function rate(f:number){
 if(f>=WF.terrified&&f<WF.terrified+10)return .006;
 if(f>=WF.face&&f<WF.face+10)return .006;
 return BASE;
}
function kAt(f:number){let k=1;for(let i=0;i<f;i++)k*=1-rate(i);return k;}
const toward=(e:V3,p:V3,k:number):V3=>[p[0]+(e[0]-p[0])*k,p[1]+(e[1]-p[1])*k,p[2]+(e[2]-p[2])*k];
/** The camera is one move per shot. 1A/1B: a steady push toward his face, with a punch on "terrified" and another on "face". 1C: a rise
 *  and settle onto her hands and the box, then a steady push toward them, with one punch toward his reflection on "Rintaro". No sway. */
export function camAt(f:number):Cam{
 const T0=WF.buy-8; // the rise starts a few frames before the cut so the box is already clear of the caption band at f99
 if(f<T0)return {eye:toward(CAMA.eye,foeHim(),kAt(f)),pitch:CAMA.pitch,fov:CAMA.fov};
 const s0=toward(CAMA.eye,foeHim(),kAt(T0)),u=1-(1-clamp((f-T0)/30))**3;
 let eye=v3(s0,CAMC.eye,u),g=1;
 for(let i=T0;i<=f;i++)g*=1-.0024;
 eye=toward(eye,HANDS_FOE,g);
 if(f>=WF.Rintaro){let h=1;for(let i=WF.Rintaro;i<=f;i++)h*=1-.0045;eye=toward(eye,foeHim(),h);}
 return {eye,pitch:lerp(CAMA.pitch,CAMC.pitch,u),fov:lerp(CAMA.fov,CAMC.fov,u)};
}
const lookOf=(c:Cam):V3=>{const r=c.pitch*Math.PI/180;return [c.eye[0],c.eye[1]-Math.sin(r)*10,c.eye[2]-Math.cos(r)*10];};

// Suns. The time of day is the light: late-afternoon gold across her and the wall, next-morning neutral daylight.
const EVE:Sun={pos:[10,2.3,1.6],color:'#ffa95a',i:4.0,hemi:'#ecd2b2',mood:{lit:[1.75,1.32,.9],shade:[.58,.48,.44],lift:[.05,.04,.05],tint:[1,.9,.76],fill:.9}};
const MORN:Sun={pos:[-5,5.2,9],color:'#fff8ee',i:4.8,hemi:'#f2f6f8',hemiI:.85,mood:{lit:[1.4,1.36,1.28],shade:[.52,.54,.6],lift:[.05,.05,.07],tint:[1,.985,.965],fill:.93}};

// ---------------------------------------------------------------------------------------------------------------
// Her. Frame 0 is the STARE state.
const HER_AT:V3=SET.seat;
const HC_HER=1.048; // world height of her eyes
export const HER_EYES:V3=[HER_AT[0],HC_HER,HER_AT[2]];

/** A card-space hand position (mm, y down) that lands on world point `w`, seen from `eye`. */
function cardHand(eye:V3,w:V3,card:V3=HER_AT):P{
 const k=(card[2]-eye[2])/(w[2]-eye[2]),x=eye[0]+(w[0]-eye[0])*k,y=eye[1]+(w[1]-eye[1])*k;
 return [(x-card[0])*1000,-(y-card[1])*1000];
}

/** The tremble that carries the fork ticks. */
function forkHand(f:number):P{
 const base:P=[-385,-1015];
 let dy=0;for(const t of TICKS)if(f>=t&&f<t+3)dy+=[12,18,7][f-t];
 const calm=f>=WF.face?.55:1;
 return [base[0]+calm*(3.4*Math.sin(f*1.9)+1.7*Math.sin(f*3.3+1)),base[1]+dy+calm*(2.8*Math.sin(f*2.4+.5))];
}

/** her recoil on "terrified": a quick lean away from him, and back */
const recoil=(f:number)=>.05*ease(f,18,26)*(1-ease(f,30,44));
function herEve(f:number):Actor{
 const w=ease(f,0,WF.terrified);
 const face:Face={
  wide:lerp(.55,.95,w),look:[lerp(.5,.95,w),lerp(-.5,-.95,w)],brow:[lerp(-1.2,-1.9,w),lerp(-.8,-.5,w)],
  mouthShift:-2,mouth:0,full:1,crumb:true,
  // frame 0 is mid-startle: the eyes are already part open and aimed at the glass
  blink:blink(f,[9,40,66]),
 };
 const hand=forkHand(f);
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{
  face,lean:-recoil(f),tilt:.006*breathe(f,34,.25),hands:[hand,[190,-960]],elbows:[[-330,-880],[260,-760]],prop:'fork',propAt:hand}};
}

// the morning: calm, and her hands do the buying
const COIN1:V3=[.55,SET.table.top+.003,-1.99],COIN2:V3=[.62,SET.table.top+.003,-1.99];
const BOX0:V3=[.9,SET.table.top,-1.98],BOX1:V3=[.9,SET.table.top,-1.84];
function boxAt(f:number):V3{const u=ease(f,102,WF.cake);return [lerp(BOX0[0],BOX1[0],u),BOX0[1],lerp(BOX0[2],BOX1[2],u)];}

function herMorn(f:number,eye:V3):Actor{
 // the hands hover just above the table so they stay clear of the props they work on
 const hov=(w:V3,up:number)=>cardHand(eye,[w[0],w[1]+up,w[2]]);
 const calm:Face={wide:0,look:[0,-.2],brow:[-.5,-.5],mouth:.4,blink:blink(f,[76,118])};
 const rest:P=[-330,-1000],back:P=hov([.45,SET.table.top,-1.95],.1);
 // The coins land at the back of the table, within her reach and just under the table's rear edge. The dot is the cast B dot:
 // it carries the coin down to the landing spot, sits 14 mm above its centre (so it overlaps the coin) and the resting coin
 // appears at exactly that projected spot on the release frame (f99 and f103).
 const cc1=cardHand(eye,COIN1),cc2=cardHand(eye,COIN2);
 const touch=(c:P):P=>[c[0],c[1]-14],air=(c:P,up:number):P=>[c[0]-12,c[1]-up];
 let h0:P=rest;
 if(f<84)h0=rest;
 else if(f<93)h0=p2(rest,air(cc1,150),ease(f,84,93));
 else if(f<WF.buy)h0=p2(air(cc1,150),touch(cc1),ease(f,93,WF.buy));
 else if(f<101)h0=p2(touch(cc1),air(cc1,70),ease(f,WF.buy,101));
 else if(f<103)h0=p2(air(cc1,70),touch(cc2),ease(f,101,103));
 else if(f<110)h0=p2(touch(cc2),air(cc2,120),ease(f,103,110));
 else h0=p2(air(cc2,120),back,ease(f,110,124));
 // the coin in the dot hand: it glides onto the exact landing spot just before release (the card draws the coin 6 mm right, 6 mm up of this point)
 let coin:P|undefined;
 if(f>=84&&f<WF.buy)coin=p2(h0,[cc1[0]-6,cc1[1]+6],ease(f,93,98));
 else if(f>=WF.buy&&f<103)coin=p2(h0,[cc2[0]-6,cc2[1]+6],ease(f,100,102));
 // left hand (screen right): slides the box toward the lens, fingertips on its rear edge, then stays there
 // fingertips rest on the rear lip of the box (top edge, 5.6 cm up) from the first push to the end of the pause
 const b=boxAt(f),lip=(q:V3)=>hov([q[0]+.085,q[1]+.056,q[2]-.058],.016),onBox=lip(b);
 let h1:P=[190,-960];
 if(f>=96&&f<103)h1=p2([190,-960],lip(BOX0),ease(f,96,102));else if(f>=102)h1=onBox;
 const hands:[P,P]=[h0,h1];
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{
  // the next morning: she is in her school clothes
  outfit:'school',face:{...calm,look:[0,f>=WF.cake+6?-.55:-.2]},tilt:.006*breathe(f,34,.25),hands,elbows:[[-290,-900],[260,-820]]},
  overlay:coin?{coin}:undefined};
}

// ---------------------------------------------------------------------------------------------------------------
// His reflection: a mirrored copy of his card behind the glass, cooler and darker, with the default lidded "Guarded" face.
// Behind her, in the same glass, the blurred back of her head at her mirrored place.
const HIS_SCALE=1.1;
const HIS_HEAD_Y=1.639; // head centre height above the card's feet, metres
export const HIM={head:[1.05,1.46] as [number,number]};
function glassMask(card:V3,sc:number){
 const m=MIRROR,pad=.012;
 const gx=[(m.x-m.w/2+pad-card[0]),(m.x+m.w/2-pad-card[0])].map(x=>-x*1000/sc).sort((a,b)=>a-b);
 const gy=[(m.y-m.h/2+pad-card[1]),(m.y+m.h/2-pad-card[1])].map(y=>y*1000/sc);
 return {x0:gx[0],x1:gx[1],y0:-gy[1],y1:-gy[0]};
}
function himCard(f:number):Actor{
 const door=ease(f,WF.came-2,WF.came+4); // his eyes go to the door bell on "came"
 const dropEyes=ease(f,WF.cake-3,WF.cake+3);
 const face:Face={look:[lerp(0,-1.1,door),.55*dropEyes],blink:blink(f,[30,66],false)||(f>=64&&f<70?1:0)||blink(f,[WF.cake+12])};
 const at:V3=[HIM.head[0],HIM.head[1]-HIS_HEAD_Y*HIS_SCALE+.004*breathe(f,40,.1),MIRROR.card];
 return {id:'him-mirror',role:'rintaro',at,pose:{face,shade:.1,tilt:-.004*breathe(f,40,.1)},
  glass:{scale:HIS_SCALE,mask:glassMask(at,HIS_SCALE),cool:.1,soft:f<WF.face-7?7:f<WF.face?7*(1-ease(f,WF.face-7,WF.face)):0}};
}
/** the back of her head, mirrored: a card at her mirrored place, flipped, cooler, blurred */
function herBack(f:number,phase:'eve'|'morn'):Actor{
 const sc=1.0,at:V3=[HER_AT[0]-.42,1.12-1.268*sc+.004*breathe(f,34,.25),MIRROR.card+.002];
 // a flipped card turns a lean the other way on screen, so the sign is opposite to hers
 return {id:'her-back-mirror',role:'kaoruko',at,pose:{back:true,outfit:phase==='morn'?'school':'cafe',shade:.45,lean:phase==='eve'?recoil(f):0,tilt:-.006*breathe(f,34,.25)},
  glass:{scale:sc,mask:glassMask(at,sc),cool:.28,soft:5}};
}

// ---------------------------------------------------------------------------------------------------------------
// Focus: her eyes, then his reflection landing on "face", then coins, box, her eyes.
const HIM_FOCUS=():V3=>[HIM.head[0],HIM.head[1],MIRROR.card];
function focusAt(f:number):V3{
 if(f<WF.face-7)return HER_EYES;
 if(f<WF.face)return v3(HER_EYES,HIM_FOCUS(),ease(f,WF.face-7,WF.face));
 if(f<WF.buy)return HIM_FOCUS();
 const coins:V3=[.63,.8,-1.78],box:V3=[BOX1[0],.85,BOX1[2]];
 if(f<WF.cake)return v3(coins,box,ease(f,WF.buy,WF.cake));
 return v3(box,HER_EYES,ease(f,WF.cake,118));
}

export function sceneAt(f:number,phase:'eve'|'morn'):Shot{
 const c=camAt(f),eye=c.eye,look=lookOf(c);
 const eve=phase==='eve';
 const actors:Actor[]=[eve?herEve(f):herMorn(f,eye),himCard(f),herBack(f,phase)];
 const base={eye,look,fov:c.fov,blur:f<WF.buy?15:12,focus:focusAt(f),actors};
 if(eve)return {id:'1A-1B',...base,warmth:.82,sun:EVE,door:0,bell:0,meal:true};
 const coins:V3[]=[];if(f>=WF.buy)coins.push(COIN1);if(f>=103)coins.push(COIN2);
 return {id:'1B-1C',...base,warmth:.42,sun:MORN,door:0,bell:0,meal:false,coins,slice:{p:boxAt(f),turn:.08}};
}

// ---------------------------------------------------------------------------------------------------------------
// Shot 2A: the street. His real face lands exactly where the reflected one was, then the camera pulls back to his full height.
const ASP=9/16;
/** screen position (0..1) and view depth of a world point, for a camera that looks along the pitch line */
export function project(eye:V3,pitchDeg:number,fov:number,p:V3):{u:number;v:number;d:number}{
 const t=Math.tan(fov*Math.PI/360),pr=pitchDeg*Math.PI/180,dx=p[0]-eye[0],dy=p[1]-eye[1],dz=p[2]-eye[2];
 const fwd=-dz*Math.cos(pr)-dy*Math.sin(pr),up=dy*Math.cos(pr)-dz*Math.sin(pr);
 return {u:.5+.5*dx/(fwd*t*ASP),v:.5-.5*up/(fwd*t),d:fwd};
}
const HIM_HALF_W=.28; // his head half width in metres, from the rig (a = 280 mm)
/** where his head sits on screen on the last frame of 1C */
export function handoffTarget(){
 const f=WF.is-1,c=camAt(f),cc:V3=[HIM.head[0],HIM.head[1],MIRROR.card];
 const a=project(c.eye,c.pitch,c.fov,cc),l=project(c.eye,c.pitch,c.fov,[cc[0]-HIM_HALF_W*HIS_SCALE,cc[1],cc[2]]);
 return {u:a.u,v:a.v,w:2*(a.u-l.u)};
}
const STREET:Sun={pos:[7,3.9,9],color:'#ffbf7c',i:3.4,hemi:'#d9cdb8'};
const HIM_REAL:V3=[1.0,0,4.4];
const HANDS_IN:[P,P]=[[-196,-850],[196,-850]],STRAP:P=[-150,-1128];
function himReal(f:number):Actor{
 const hand=ease(f,WF.tall+6,WF.tall+18);
 const glint=f>=WF.pierced&&f<WF.pierced+4?[302,-1572] as P:undefined;
 return {id:'him',role:'rintaro',at:[HIM_REAL[0],HIM_REAL[1]+.004*breathe(f,40,.1),HIM_REAL[2]],pose:{outfit:'school',tilt:-.004*breathe(f,40,.1),
  face:{look:[lerp(0,-.4,ease(f,WF.is+4,WF.is+16)),0],blink:blink(f,[154,186])},
  hands:[p2(HANDS_IN[0],STRAP,hand),HANDS_IN[1]],elbows:[[-330,lerp(-1040,-1010,hand)],[330,-1040]]},overlay:glint?{glint}:undefined};
}
function streetAt(f:number):Shot{
 const m=handoffTarget(),fov=lerp(CAMC.fov,40,ease(f,WF.is,WF.is+14));
 const t=Math.tan(fov*Math.PI/360),span=2*t;
 const headY=HIS_HEAD_Y;
 const d0=2*HIM_HALF_W/(m.w*span*ASP);
 const eye0:V3=[HIM_REAL[0]-(m.u-.5)*d0*span*ASP,headY+(m.v-.5)*d0*span,HIM_REAL[2]+d0];
 // pull back to his full height: fast out of the cut, easing out, with a steady push under it
 const e=1-(1-clamp((f-WF.is)/14))**3,drift=1+.0024*(f-WF.is);
 const d1=d0*m.w/.24;
 const eyeEnd:V3=[HIM_REAL[0]+.05,headY-.26*d1*span,HIM_REAL[2]+d1];
 const eye0b:V3=[eye0[0],eye0[1],eye0[2]];
 const pe=v3(eye0b,eyeEnd,e);
 const eye:V3=[pe[0],pe[1],HIM_REAL[2]+(pe[2]-HIM_REAL[2])*drift];
 const look:V3=[eye[0],eye[1],eye[2]-10];
 const focus:V3=[HIM_REAL[0],headY,HIM_REAL[2]];
 return {id:'2A',eye,look,fov,blur:lerp(16,11,e),focus,warmth:.6,sun:STREET,actors:[himReal(f)],door:0,bell:0,meal:false};
}

// ---------------------------------------------------------------------------------------------------------------
// Shot 2B, opening state only (card 2: "intimidating", the coolest light): a medium shot, he keeps walking with his eyes lowered, two
// blurred backs in the foreground, a push, and the 4 degree roll beginning. The cut lands on the word at f209.
const COOL:Sun={pos:[7,3.9,9],color:'#dfe6f2',i:3.0,hemi:'#d4dbe6',mood:{lit:[1.1,1.16,1.3],shade:[.3,.34,.45],lift:[.04,.05,.09],tint:[.94,.97,1.04],fill:.85}};
function streetB(f:number):Shot{
 const k=f-WF.intimidating,step=k/6*Math.PI;
 const him:V3=[1.0,0,3.9+.02*k];
 const eye:V3=[.9,1.1,him[2]+3.5-.0022*k*3.5];
 const lift=(q:number)=>Math.max(0,q)*70,L=Math.sin(step),Rr=-Math.sin(step);
 const actors:Actor[]=[
  {id:'him',role:'rintaro',at:[him[0],him[1]+.012*Math.abs(Math.sin(step)),him[2]],pose:{outfit:'school',tilt:-.01*Math.sin(step),hunch:.12,
   face:{look:[-.3,.85],brow:[-.8,.4],blink:blink(f,[212])},feet:[[-110,-lift(L)],[110,-lift(Rr)]],hands:[[-212,-840],[212,-840]],elbows:[[-330,-1040],[330,-1040]]}},
  {id:'back-a',role:'rintaro',at:[.36,-.5,eye[2]-2.3],pose:{back:true,outfit:'school',tilt:.03*Math.min(1,k/6)},stranger:{hair:'#5b5049',cloth:'#6c7074'}},
  {id:'back-b',role:'kaoruko',at:[1.45,-.35,eye[2]-2.2],pose:{back:true,outfit:'school',tilt:-.03*Math.min(1,k/6)},stranger:{hair:'#625048',cloth:'#80746c'}},
 ];
 return {id:'2B',eye,look:[eye[0],eye[1],eye[2]-10],fov:38,blur:14,focus:[him[0],1.64,him[2]],warmth:.3,sun:COOL,actors,door:0,bell:0,meal:false,roll:.07*ease(f,WF.intimidating,WF.intimidating+13)};
}

export interface Layer {shot:Shot;opacity:number}
/** The 6-frame dissolve from evening to morning starts on "then". */
export function layersAt(f:number):Layer[]{
 if(f>=WF.intimidating)return [{shot:streetB(f),opacity:1}];
 if(f>=WF.is)return [{shot:streetAt(f),opacity:1}];
 const u=clamp((f-WF.then)/6);
 if(f<WF.then)return [{shot:sceneAt(f,'eve'),opacity:1}];
 if(f>=WF.then+6)return [{shot:sceneAt(f,'morn'),opacity:1}];
 const s=u*u*(3-2*u);
 return [{shot:sceneAt(f,'eve'),opacity:1},{shot:sceneAt(f,'morn'),opacity:s}];
}
/** The named state other cards reuse: frame 0 exactly. Card 3C, 4E, 5B (frame 896) and card 7's last frame start from it. */
export const stare=(k=0)=>sceneAt(k,'eve');
export const STARE=()=>stare(0);
