// The 24.4 s pilot, as a pure function of time.
// One idea: he does to her what everyone does to him. He looks at part of a face and decides what it means.
//   - From his height the plates hide her mouth: only two wide eyes, so he reads fear.
//   - The same shot rises 45 cm: a full cheek, a crumb, nine plates. She was embarrassed.
//   - He folds smaller all film. On the line, the hook's camera rises to his eyes and he stops folding.
import {SET,type V3} from '../sets/Cafe';
import type {Face,Pose,P,Role} from '../cast/b/rig';

export interface Actor {id:string;role:Role;at:V3;pose:Omit<Pose,'role'>;stranger?:{hair:string;cloth:string}}
export interface Shot {
 id:string;eye:V3;look:V3;fov:number;blur:number;focus?:V3;
 /** 0 = how he imagines it (cool), 1 = how it is (warm) */ warmth:number;
 actors:Actor[];door:number;bell:number;meal:boolean;box?:boolean;
 fork?:{p:V3;r:V3};
}
export const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ease=(t:number,a:number,b:number)=>{const x=clamp((t-a)/(b-a));return x*x*x*(x*(x*6-15)+10);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const v=(a:V3,b:V3,t:number):V3=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const p2=(a:P,b:P,t:number):P=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
/** 4 frames: half, shut, shut, half */
const blink=(t:number,...at:number[])=>{for(const a of at){const n=Math.floor((t-a)*30+1e-4);if(n>=0&&n<4)return[.5,1,1,.5][n];}return 0;};
/** Every hold creeps in (motion.md 5.1). */
const push=(eye:V3,look:V3,t:number,rate=.0016):V3=>v(look,eye,(1-rate)**(Math.max(0,t)*30));
const swing=(t:number,hit:number)=>t<hit?0:.55*Math.exp(-(t-hit)*2.2)*Math.sin((t-hit)*15);

export const CUT={flight0:1,close0:1.87,notice:2.7,flight:4.2,ruined:5.47,returns:7.4,ready:8.87,rewind:12.45,frozen:12.93,herSide:13.45,offer:16.45,sincere:18.1,seen:19.95,street:21.45,today:23.4};

const DOOR=SET.door.x;

function hookPOV(t:number):Shot{
 const look:V3=[.8,1.47,-.45],eye=push([.8,1.02,-2.05],look,t,.0022),u=clamp((t-.22)/.5);
 return{id:'hook',eye,look,fov:50,blur:9,warmth:0,door:0,bell:0,meal:true,
  fork:{p:[.94,lerp(1.56,.3,u*u),-1.16],r:[.3*u,0,.5+u*4.6]},
  actors:[
   {id:'her-back',role:'kaoruko',at:[1.178,-.12,-1.52],pose:{back:true}},
   {id:'him',role:'rintaro',at:SET.stand,pose:{shade:.8,face:{look:[0,.55]}}}]};
}

/** The door, from the street. She runs out at us and uncovers him, small, inside. */
function flight(t:number):Shot{
 // t is seconds since the burst.
 const u=clamp(t/.88),travel=4.6*u**1.4,z=1.75+travel,x=DOOR+.62*ease(u,.5,1);
 const phase=travel/.42*Math.PI,l=Math.max(0,Math.sin(phase)),r=Math.max(0,-Math.sin(phase));
 const bob=.05*Math.abs(Math.sin(phase));
 const actors:Actor[]=[{id:'him',role:'rintaro',at:[DOOR-.02,0,.1],pose:{hunch:.5*ease(t,.45,1),face:{wide:-.9*ease(t,.75,.95),brow:[-1.8*ease(t,.6,.95),0]}}}];
 if(z<5.7)actors.push({id:'her',role:'kaoruko',at:[x,bob,z],pose:{
  face:{wide:.9,brow:[-1.8,-.4],mouth:-.15,look:[.35,0]},lean:.1*Math.sin(phase),tilt:-.07*Math.sin(phase),hairFlow:.45+.6*u,
  hands:[[-300,-690-130*r],[300,-690-130*l]],elbows:[[-285,-830],[285,-830]],
  feet:[[-103-20*l,-120*l],[103+20*r,-120*r]]}});
 return{id:'flight',eye:[DOOR,1.12,5.85],look:[DOOR,1.12,.1],fov:45,blur:5,focus:[DOOR,1.2,z<4.6?z:.1],warmth:.12,
  door:ease(t,0,.22)*(1-.45*ease(t,.8,1.3)),bell:swing(t,.12),meal:true,actors};
}

function hookClose(t:number):Shot{
 const k=t-CUT.close0,look:V3=[DOOR,1.5,.1];
 return{id:'hook-close',eye:push([DOOR,1.5,2.2],look,k,.003),look,fov:38,blur:10,warmth:.1,door:.3,bell:0,meal:true,actors:[{
  id:'him',role:'rintaro',at:[DOOR,0,.1],pose:{hunch:.25+.5*ease(k,.2,.7),tilt:-.035*ease(k,.2,.7),
   face:{blink:blink(k,.14),wide:k>.24?-1:0,look:[-.4,.4],brow:[-2.3*ease(k,.1,.45),.6*ease(k,.1,.45)],mouth:-.2*ease(k,.1,.5)}}}]};
}

// Her table, from his eyes
const LOW={eye:[.8,1.04,-.55] as V3,look:[.8,1.045,-2.45] as V3,fov:38};
const HIGH={eye:[.8,1.52,-.62] as V3,look:[.8,.955,-2.45] as V3,fov:43.5};
const MOUTH_HAND:P=[125,-1010],LOW_HAND:P=[-150,-990],CHEEK:[P,P]=[[-170,-1112],[170,-1112]];

function notices(t:number):Shot{
 // "notices" is at 3.46. The look lands two frames before it.
 const w=ease(t,3.36,3.48);
 return{id:'notices',eye:push(LOW.eye,LOW.look,t-CUT.notice,.0024),look:LOW.look,fov:LOW.fov,blur:9,warmth:.08,door:0,bell:0,meal:true,
  actors:[{id:'her',role:'kaoruko',at:SET.seat,pose:{
   face:{wide:.9*w,look:[0,lerp(.9,0,w)],brow:[lerp(-.6,-1.9,w),lerp(-.6,-.5,w)],mouthShift:-2,mouth:0,full:1,crumb:true,blink:blink(t,3.3)},
   hands:[LOW_HAND,MOUTH_HAND],prop:'fork',propAt:MOUTH_HAND}}]};
}

function herSide(t:number):Shot{
 const again=ease(t,13.49,13.59),up=ease(t,13.98,14.95),aside=ease(t,15.0,15.14),hide=ease(t,15.28,15.78),swallow=ease(t,16.02,16.16);
 const right=p2(MOUTH_HAND,CHEEK[1],hide),startEye=push(LOW.eye,LOW.look,.5+Math.min(t,14.2)-CUT.herSide,.0024);
 const face:Face={wide:aside>.5?-1:.9*again,look:[.8*aside,.2*aside+.9*(1-again)],brow:[-.6-1.3*again-1.7*aside,-.6+.1*again+2.3*aside],
  mouthShift:-2*(1-swallow),mouth:-.55*aside,full:1-swallow,crumb:true,flush:ease(t,14.65,15.75),blink:blink(t,14.55,16.02)};
 return{id:'her-side',eye:v(startEye,HIGH.eye,up),look:v(LOW.look,HIGH.look,up),fov:lerp(LOW.fov,HIGH.fov,up),blur:lerp(9,4.5,up),
  warmth:lerp(.08,1,ease(t,13.75,14.6)),door:0,bell:0,meal:true,
  actors:[{id:'her',role:'kaoruko',at:SET.seat,pose:{face,tilt:.055*hide,hands:[p2(LOW_HAND,CHEEK[0],hide),right],
   elbows:[[lerp(-250,-330,hide),lerp(-760,-680,hide)],[lerp(250,330,hide),lerp(-760,-680,hide)]],
   ...(hide<.45?{prop:'fork' as const,propAt:right}:{})}}]};
}

/** He makes himself the height of the cake case. His eyes end where hers were: just over the top. */
function ruined(t:number):Shot{
 const k=ease(t,5.72,6.75),[x,,z]=SET.behindCase,look:V3=[x,1.22,z];
 return{id:'ruined',eye:push([-1.5,1.3,.42],look,t-CUT.ruined,.0026),look,fov:35,blur:8,warmth:.15,door:0,bell:0,meal:false,
  actors:[{id:'him',role:'rintaro',at:[x,-.45*k,z],pose:{hunch:.7*k,tilt:-.03*k,
   face:{blink:blink(t,5.95),wide:t>6.02?-1:0,look:[-.5,.3],brow:[-2.4*k,.7*k],mouth:-.2*k}}}]};
}

function returns(t:number):Shot{
 const look:V3=[DOOR,1.02,2.95],k=ease(t,7.85,8.8);
 return{id:'returns',eye:push([-1.3,1.43,.05],look,t-CUT.returns,.002),look,fov:37,blur:11,focus:[DOOR,1.1,3],warmth:.6,
  door:.62*ease(t,7.5,7.8),bell:swing(t,7.58),meal:false,actors:[
   {id:'him-back',role:'rintaro',at:[-1.645,-.24+.16*ease(t,8.1,8.8),.78],pose:{back:true}},
   {id:'her',role:'kaoruko',at:[DOOR,0,lerp(3.55,2.72,k)],pose:{face:{look:[.2,.2],brow:[-1.3,.1],mouth:.05,flush:.2,blink:blink(t,8.3)},
    hands:[[-164,-700],[164,-700]],prop:'box',propAt:[0,-680],
    feet:[[-108,-38*Math.max(0,Math.sin(k*Math.PI*3))*(1-k)],[108,-38*Math.max(0,-Math.sin(k*Math.PI*3))*(1-k)]]}}]};
}

function apology(t:number):Shot{
 const inhale=ease(t,9.2,9.65),his=ease(t,9.82,10.85)*.8,hers=ease(t,10.5,10.86),caught=ease(t,10.95,11.1);
 const look=v([.15,1.07,.7],[.17,.98,.7],ease(t,10.5,11.6)),lift=ease(t,10.5,10.9);
 return{id:t<10.6?'ready':'she-first',eye:push([.15,1.22,3.06],look,t-CUT.ready,.0012),look,fov:lerp(53.5,51.5,ease(t,10.5,11.7)),blur:5,warmth:.72,
  door:0,bell:0,meal:false,actors:[
   {id:'him',role:'rintaro',at:[-.15,.014*inhale*(1-his/.8),.7],pose:{bow:his,lean:.05*his,hunch:.3*(1-inhale),
    face:{wide:.8*caught,look:[.8,.55*caught],brow:[-1.5-.6*caught,.3-.5*caught],parted:caught>.5?.3:inhale*(1-ease(t,10,10.4))*.35,mouth:-.1,blink:blink(t,9.75,11.85)}}},
   {id:'her',role:'kaoruko',at:[.45,0,.7],pose:{bow:hers,lean:-.1*hers,
    face:{blink:hers>.35?1:blink(t,9.3),look:[-.6,0],brow:[-1.8,.2],mouth:-.1,flush:.3+.2*hers},
    hands:[[lerp(-164,-196,lift),lerp(-700,-570,lift)],[lerp(164,120,lift),lerp(-700,-570,lift)]],elbows:[[-300,-620],[300,-620]],
    prop:'box',propAt:[lerp(0,-40,lift),lerp(-680,-548,lift)]}}]};
}

function offer(t:number):Shot{
 const up=ease(t,16.65,17.45),look:V3=[.1,1.02,.35],hands:P[]=[[-164,lerp(-570,-760,up)],[164,lerp(-570,-760,up)]];
 return{id:'offer',eye:push([.1,1.42,2.55],look,t-CUT.offer,.0024),look,fov:41,blur:11,focus:[.1,1,.35],warmth:.88,door:0,bell:0,meal:false,actors:[
  {id:'him-back',role:'rintaro',at:[-.283,0,1.9],pose:{back:true,bow:.52-.2*ease(t,17.4,18)}},
  {id:'her',role:'kaoruko',at:[.1,0,.35],pose:{bow:.85*(1-up)+.08,
   face:{blink:up<.4?1:blink(t,17.75),look:[-.25,-.5],brow:[-1.7,.1],mouth:lerp(-.1,.35,up),flush:.35},
   hands:[hands[0],hands[1]],elbows:[[-300,-640],[300,-640]],prop:'box',propAt:[0,lerp(-548,-738,up)]}}]};
}

function sincere(t:number):Shot{
 // "never" is at 19.20. Her eyes get there first.
 const s=ease(t,19,19.28),look:V3=[.1,1.22,.35];
 return{id:'sincere',eye:push([.1,1.29,1.98],look,t-CUT.sincere,.0026),look,fov:38,blur:12,focus:[.1,1.22,.35],warmth:1,door:0,bell:0,meal:false,actors:[
  {id:'him-back',role:'rintaro',at:[-.284,-.26,1.3],pose:{back:true,bow:.22}},
  {id:'her',role:'kaoruko',at:[.1,0,.35],pose:{tilt:.03*s,
   face:{blink:blink(t,18.94),seen:s,look:[-.3*(1-s),-.2],brow:[lerp(-1.4,-.9,s),lerp(-.2,-.9,s)],mouth:lerp(.2,.5,s),flush:.22},
   hands:[[-164,-690],[164,-690]],prop:'box',propAt:[0,-670]}}]};
}

/** The hook's camera. It climbs to his eyes and the monster is a boy in an apron. */
function seen(t:number):Shot{
 const up=ease(t,19.98,20.7),s=ease(t,20.64,21.02),rel=ease(t,20.85,21.3);
 const look=v([.8,1.47,-.45],[.8,1.56,-.45],up),eye=push(v([.8,1.02,-2.05],[.8,1.55,-2.02],up),look,t-CUT.seen,.002);
 return{id:'seen',eye,look,fov:lerp(50,43,up),blur:10,focus:[.8,1.55,-.45],warmth:lerp(.02,1,ease(t,19.98,20.6)),door:0,bell:0,meal:false,box:true,actors:[
  {id:'her-back',role:'kaoruko',at:[1.178,-.12,-1.52],pose:{back:true}},
  {id:'him',role:'rintaro',at:SET.stand,pose:{shade:.8*(1-ease(t,19.98,20.6)),hunch:.6*(1-rel),
   face:{blink:blink(t,20.55),seen:s,look:[0,.35*(1-s)],brow:[-2.1*s,-.8+.2*s],parted:.28*ease(t,20.78,20.98),flush:.8*ease(t,20.9,21.4)}}}]};
}

/** What he is used to: backs, moving away. */
function street(t:number):Shot{
 const away=ease(t,21.7,23.2),look:V3=[.9,1.46,3.75];
 return{id:'used-to',eye:push([.9,1.5,7],look,t-CUT.street,.0022),look,fov:34,blur:12,focus:[.9,1.5,3.75],warmth:.02,door:0,bell:0,meal:false,actors:[
  {id:'him',role:'rintaro',at:[.9,0,3.75],pose:{outfit:'school',hunch:.3+.5*away,face:{wide:t>22.9?-1:0,look:[-.4,.3],brow:[-1.4*away,.2*away],mouth:-.12*away,blink:blink(t,22.78)}}},
  {id:'stranger-a',role:'rintaro',at:[lerp(.52,.17,away),-.12,5.65],pose:{back:true,outfit:'school',tilt:.05*away},stranger:{hair:'#5b5049',cloth:'#6c7074'}},
  {id:'stranger-b',role:'kaoruko',at:[lerp(1.3,1.66,away),.2,5.5],pose:{back:true,outfit:'school',tilt:-.05*away},stranger:{hair:'#625048',cloth:'#80746c'}}]};
}

/** Same face. The last word lands on it. */
function today(t:number):Shot{
 const k=t-CUT.today,look:V3=[.8,1.58,-.45],s=ease(k,.35,.8);
 return{id:'today',eye:push([.8,1.58,-1.95],look,k,.003),look,fov:41,blur:12,warmth:1,door:0,bell:0,meal:false,box:true,actors:[
  {id:'him',role:'rintaro',at:SET.stand,pose:{tilt:.025*s,face:{seen:1,brow:[-1.4,-.5],mouth:.4*s,parted:0,flush:.5,blink:blink(k,.2)}}}]};
}

export function shotAt(t:number):Shot{
 const C=CUT;
 if(t<C.flight0)return hookPOV(t);
 if(t<C.close0)return flight(t-C.flight0);
 if(t<C.notice)return hookClose(t);
 if(t<C.flight)return notices(t);
 if(t<C.ruined)return flight(t-C.flight);
 if(t<C.returns)return ruined(t);
 if(t<C.ready)return returns(t);
 if(t<C.rewind)return apology(t);
 // The rewind uses the film itself, run backwards. No tape symbols or scanlines.
 if(t<C.frozen){const u=(t-C.rewind)/(C.frozen-C.rewind);return{...flight(lerp(.9,0,u*u)),id:'rewind-flight'};}
 if(t<C.herSide){const u=(t-C.frozen)/(C.herSide-C.frozen);return{...notices(lerp(4.18,3.2,u)),id:'rewind-table'};}
 if(t<C.offer)return herSide(t);
 if(t<C.sincere)return offer(t);
 if(t<C.seen)return sincere(t);
 if(t<C.street)return seen(t);
 if(t<C.today)return street(t);
 return today(t);
}
