// Cards 6-7 (chunk B, f1103-1645): the long look back, "everyone reads his face", today, the door, the mirror.
// Everything is a pure function of the frame number. Shot frames and word frames come from the shot list and the voice words.
import {SET,MIRROR,type V3} from './consts';
import film from '../../../production-pipeline-proposal/film-shots.json';
import words from '../../../production-pipeline-proposal/voice/johnny-take-02/words-v4.json';
import {resolveShots,wordFrame} from '../../../pipeline/film-time.mjs';
import {EVE,MORN,HER_AT,HER_EYES,CAM_A,ease,clamp,lerp,v3,key,blink,breathe,toward,lookOf,type Actor,type Shot,type Layer,type Cam,type Sun} from './story';
import {mk,camOf,lerpCam,sunMix,COOL,himShop,HIM_SHOP,herStare,stareCam,BX,HIM_TABLE,A as CA} from './chunkA';
import {R,WARM,herReveal,himBack,camF,RISE_TO,glassMask,HIS_SCALE,HIS_HEAD_Y} from './reveal';
import type {Face,P} from '../cast/b-hands/rig';

const SH=Object.fromEntries((resolveShots(film as any,words as any) as any[]).map(s=>[s.id,s])) as Record<string,{f0:number;f1:number;n:number}>;
export const B={b6A:SH['6A'],b6B:SH['6B'],b6C:SH['6C'],b7A:SH['7A'],b7C:SH['7C'],b7D:SH['7D'],b7F:SH['7F']};
export const CHUNK_B_RANGE=[B.b6A.f0,B.b7F.f1] as const;
const wf=(l:number,w:string,n=1)=>wordFrame(words as any,l,w,n);
const fEvery=wf(17,'EVERYONE'),fNever=wf(19,'never'),fScary=wf(19,'scary."'.replace('"','')),fRunning=wf(20,'running.'),fStays=wf(22,'stays.'),fIdea=wf(21,'idea');
const fTells=wf(18,'tells'),fQuote=wf(19,"I've");

// ---------------------------------------------------------------------------------------------------------------
// 6A: past his blurred shoulder. He has only just found her, and she is already looking. Colour and flush fade.
function herB(f:number,fade:number):Actor{
 const a=herReveal(R.F.f1-1);
 const face:Face={...(a.pose.face as Face),flush:lerp(.2,0,fade),seen:lerp(1,0,fade),wide:lerp(.35,.2,fade),parted:lerp(.5,0,fade)};
 return {...a,at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{...a.pose,face,hands:[[-270,-1030],[190,-985]],elbows:[[-330,-880],[200,-840]],bow:0,tilt:.006*breathe(f,34,.25)}};
}
function shot6A(f:number):Shot{
 const c=camF(R.F.f1-1),k=f-B.b6A.f0,fade=ease(k,4,B.b6A.n-4);
 // keep pulling, slower and slower, ending at rest
 const settle=1-ease(k,0,B.b6A.n);
 const eye:V3=[c.eye[0]+.05*(1-settle),c.eye[1]+.05*(1-settle),c.eye[2]+.42*(1-settle)]; // r6: a longer, slower pull
 const cam:Cam={eye,pitch:c.pitch,fov:c.fov};
 return mk('6A',camOf(cam),[herB(f,fade),himBack()],HER_EYES,12,sunMix(WARM,EVE,fade),lerp(.82,.82,fade),{meal:true});
}

// 6B: an earlier day, one plate. She watches him straighten a slice with great care, unaware. Over her blurred shoulder.
const herBack=(f:number):Actor=>({id:'her-back',role:'kaoruko',at:[-.72,-.2+.004*breathe(f),-.5],pose:{back:true,outfit:'school'}});
function shot6B(f:number):Shot{
 const k=f-B.b6B.f0,t=ease(k,0,B.b6B.n);
 const c:Cam={eye:[-.9+.14*t,1.32-.05*t,.25-.3*t],pitch:3-1.5*t,fov:lerp(41,35,t)}; // r6: pushes toward his hands
 const tongs=Math.sin(k*.35)*14*(1-ease(k,36,46));
 const him=himShop(f,{look:[0,1.2],wide:.1,brow:[-.5,-.2]});
 him.pose={...him.pose,hands:[[-150+tongs,-790],[170+tongs*.5,-790]],elbows:[[-250,-780],[280,-760]]};
 him.overlay=undefined;
 return mk('6B',camOf(c),[him,herBack(f)],[HIM_SHOP[0],1.5,HIM_SHOP[2]],13,PALE,.3,{meal:false});
}

// 6C: her face in the hook's frame-0 framing, cool. Then her whole face becomes his whole face, eyes aligned. Blurred backs close in on both sides.
const HIM_FRAME0:V3=[HER_AT[0],HER_EYES[1]-1.607-.0375,HER_AT[2]]; // his eye line on her eye line
const PALE:Sun={...MORN,mood:{lit:[1.52,1.52,1.56],shade:[.64,.66,.74],lift:[.06,.06,.09],tint:[.94,.97,1.03],fill:.97}};
const COLD:Sun={...COOL,mood:{lit:[1.1,1.12,1.14],shade:[.42,.46,.56],lift:[.04,.05,.08],tint:[.92,.94,1],fill:.9}};
function shot6C(f:number):Shot{
 const k=f-B.b6C.f0,q=ease(f,fEvery-2,fEvery+4);
 const cam=stareCam(k+8);
 const punch=1-.006*ease(f,fEvery,fEvery+4);
 const eye=toward(cam.eye,HER_EYES,punch);
 const roll=.07*Math.sin(Math.PI*ease(f,fEvery,fEvery+12));
 const her=herStare(f,22);
 her.pose={...her.pose,face:{...(her.pose.face as Face),look:[.5,-.5],wide:.9}};
 const him:Actor={id:'him-frame0',role:'rintaro',at:[HIM_FRAME0[0],HIM_FRAME0[1]+.004*breathe(f,40,.1),HIM_FRAME0[2]],pose:{outfit:'school',tilt:-.004*breathe(f,40,.1),
  face:{look:[-.1,0],wide:.1,blink:blink(f,[fEvery+14]),brow:[-.2,0]},hands:[[-196,-850],[196,-850]],elbows:[[-330,-1040],[330,-1040]]}};
 const close=ease(f,fEvery-2,fEvery+16);
 const backs:Actor[]=[
  {id:'back-l',role:'rintaro',at:[eye[0]-.62+.08*close,0,eye[2]-1.35],stranger:{hair:'#4b3b36',cloth:'#5b6a7c'},pose:{back:true,outfit:'cafe'}},
  {id:'back-r',role:'kaoruko',at:[eye[0]+.62-.08*close,0,eye[2]-1.4],stranger:{hair:'#2c2a33',cloth:'#9a7a74'},pose:{back:true,outfit:'cafe'}},
 ];
 const sun=sunMix(COOL,COLD,ease(f,fEvery-8,B.b6C.f1));
 const zf=f<fEvery?lerp(CAM_A.fov,33,ease(f,fEvery-8,fEvery-1)):lerp(33,CAM_A.fov,ease(f,fEvery,fEvery+9));
 return mk('6C',{eye,look:lookOf({eye,pitch:CAM_A.pitch,fov:CAM_A.fov}),fov:zf},[...(q<.5?[her]:[him]),...(f>=fEvery-6?backs:[])],HER_EYES,15,sun,.7,{meal:true,roll});
}
// ---------------------------------------------------------------------------------------------------------------
// 7A-7D: today, at the table.
const BOX_END=BX(.6,-1.9);
function herToday(f:number):Actor{
 const t0=B.b7A.f0,off=ease(f,t0+4,t0+14);
 const speak=f>=fQuote&&f<fScary+14?(Math.sin(f*1.1)>.1?.9:.2):0;
 const breath=ease(f,fScary+10,fScary+22)*(1-ease(f,fScary+22,fScary+36));
 const face:Face={wide:key(f,[[t0,0],[t0+14,-.1],[fNever,.05]]),look:[key(f,[[t0,-.3],[t0+14,.1]]),key(f,[[t0,.9],[t0+10,.9],[t0+18,-.2]])],brow:[-1,-.3],mouth:.2,parted:speak*.8+breath*.8,blink:blink(f,[t0+28,fNever+30,fScary+30]),crumb:false,full:1};
 const hand:P=[lerp(-330,-250,off),lerp(-780,-1000,off)];
 return {id:'her',role:'kaoruko',at:HER_AT,pose:{outfit:'school',face,tilt:.006*breathe(f,34,.25),bow:.03*breath,hands:[hand,[190,-960]],elbows:[[-300,-900],[260,-840]]}};
}
function himToday(f:number,o:{look?:P;wide?:number;brow?:P}={}):Actor{
 return {id:'him',role:'rintaro',at:[HIM_TABLE[0],HIM_TABLE[1]+.004*breathe(f,40,.1),HIM_TABLE[2]],pose:{outfit:'cafe',tilt:-.004*breathe(f,40,.1),
  face:{look:o.look??[.1,-.2],wide:o.wide??.5,brow:o.brow??[2,1.6],blink:blink(f,[B.b7A.f0+40,fRunning+30]),mouth:0},hands:[[-196,-850],[330,-950]],elbows:[[-330,-1040],[300,-900]]}};
}
const WIDE_T:Cam={eye:[.3,1.66,.75],pitch:12,fov:46};
const CLOSE_HER:Cam={eye:[.7,1.5,-.35],pitch:12,fov:38};
function shot7A(f:number):Shot{
 const k=f-B.b7A.f0,glide=ease(f,B.b7A.f0+10,fNever+8);
 let c=lerpCam(WIDE_T,CLOSE_HER,glide);
 const punch=1-.006*ease(f,fNever,fNever+4)*(1-ease(f,fNever+4,fNever+14));
 const eye=toward(c.eye,HER_EYES,punch);
 c={...c,eye:toward(eye,HER_EYES,Math.pow(1-.0026,Math.max(0,f-fNever-8)))}; // r6: keeps pushing toward her while she speaks
 const sun=sunMix(MORN,WARM,ease(f,B.b7A.f0,B.b7A.f1));
 return mk('7A',{eye:c.eye,look:lookOf(c),fov:c.fov},[himToday(f),herToday(f)],v3([.2,1.6,-1.85],HER_EYES,glide),12,sun,lerp(.42,.8,ease(f,B.b7A.f0,B.b7A.f1)),{meal:false,slice:{p:BOX_END,turn:.08}});
}
function shot7C(f:number):Shot{
 const k=f-B.b7C.f0,tight:Cam={eye:[-.05,1.6,.5],pitch:9,fov:40};
 const glance=ease(k,10,18)*(1-ease(k,30,38));
 const eye:V3=[tight.eye[0]+.004*k-.12*(ease(k,8,18)*(1-ease(k,30,40))),tight.eye[1],tight.eye[2]-.0015*k-.004*k]; // r6: the camera follows his glance to the door and back
 const him=himToday(f,{look:[lerp(.1,1.6,glance),lerp(-.2,.3,glance)],wide:.6,brow:[lerp(2,1,glance),lerp(1.6,.8,glance)]});
 him.pose={...him.pose,tilt:-.004*breathe(f,40,.1)+.03*glance};
 return mk('7C',{eye,look:lookOf({...tight,eye}),fov:tight.fov},[him,herToday(f)],[HIM_TABLE[0],1.62,HIM_TABLE[2]],lerp(12,14,glance),WARM,.8,{meal:false,slice:{p:BOX_END,turn:.08}});
}
/** 7D: he steps aside to clear her way out on "running". The bell does not ring. Then his hand goes to the cloth, the box, nowhere. */
function shot7D(f:number):Shot{
 const k=f-B.b7D.f0,aside=ease(f,fRunning-2,fRunning+14);
 const eye=v3([-.5,1.0,-1.2],[-.48,1.0,-1.35],ease(k,0,B.b7D.n));
 const c:Cam={eye,pitch:0,fov:42};
 const x=lerp(-.75,-.1,aside),stepL=Math.sin(aside*Math.PI);
 const look:V3=[lerp(-.5,x,.6),1.0,3.0]; // r6: the camera pans with him as he steps aside
 const hand=ease(f,fRunning+30,fRunning+46),box=ease(f,fRunning+54,fRunning+66),none=ease(f,fRunning+74,fRunning+88);
 let h:P=[-190,-860];
 h=[lerp(-190,-110,hand),lerp(-860,-960,hand)];
 h=[lerp(h[0],200,box),lerp(h[1],-780,box)];
 h=[lerp(h[0],230,none),lerp(h[1],-540,none)];
 const him:Actor={id:'him',role:'rintaro',at:[x,.01*stepL,2.2],pose:{outfit:'cafe',tilt:-.004*breathe(f,40,.1),face:{look:[lerp(-.9,.3,aside),lerp(.2,.7,ease(f,fRunning+30,fRunning+60))],wide:lerp(.4,.95,ease(f,fRunning-6,fRunning+2))*(1-.5*ease(f,fRunning+20,fRunning+34)),brow:[lerp(1,4,ease(f,fRunning-6,fRunning+2))-3*ease(f,fRunning+24,fRunning+40),lerp(.6,3,ease(f,fRunning-6,fRunning+2))-2.4*ease(f,fRunning+24,fRunning+40)],blink:blink(f,[fRunning+22,fRunning+70])},hunch:.12*ease(f,fRunning+74,fRunning+88),lean:-.06*ease(f,fRunning-8,fRunning)*(1-ease(f,fRunning,fRunning+8)),
  hands:[h,[196,-850]],elbows:[[-330,-960],[300,-860]],feet:stepL>0?[[-22,-45*stepL],[22,0]]:undefined},overlay:{cloth:[h[0],h[1]]}};
 return mk('7D',{eye:c.eye,look,fov:c.fov},[him],[x,1.5,2.2],11,WARM,.8,{meal:false,door:0,bell:0});
}

// 7F: the mirror framing. Her whole face in front, the mirror behind. In the mirror he edges half a step away, then on "stays" he stops, and stays.
function himMirrorB(f:number):Actor{
 const k=f-B.b7F.f0,edge=ease(f,B.b7F.f0+4,fStays-4);
 const out=ease(f,B.b7F.f1-30,B.b7F.f1-6);
 const face={look:[lerp(-1.3,0,out),lerp(.35,0,out)] as P,blink:blink(f,[B.b7F.f0+20,fStays+10]),brow:[0,0] as P,mouth:.4*ease(f,fStays+4,fStays+14)};
 const gone=ease(f,B.b7F.f1-16,B.b7F.f1-4),at:V3=[.86+.1*edge+.7*gone,1.5-1.639*HIS_SCALE+.004*breathe(f,40,.1)+.02*Math.abs(Math.sin((f-B.b7F.f1)*.55))*gone,MIRROR.card]; // r5: the rewind pulls him back out of the glass
 return {id:'him-mirror',role:'rintaro',at,pose:{face,shade:.1,tilt:-.004*breathe(f,40,.1)},glass:{scale:HIS_SCALE,mask:glassMask(at,HIS_SCALE),cool:.1,soft:0}};
}
function herSeat(f:number):Actor{
 const k=f-B.b7F.f0,back=ease(k,0,22);
 const c0=ease(f,B.b7F.f1-20,B.b7F.f1-1); // r5: her face returns to the hook's frame-0 state so the loop dissolve holds one face
 const face:Face={wide:lerp(-.05,.9,c0),look:[lerp(0,.5,c0),lerp(.1,-.5,c0)],brow:[lerp(-1,-3.4,c0),lerp(-.3,-.6,c0)],mouthShift:lerp(0,-2,c0),mouth:lerp(lerp(.2,.85,ease(f,fStays-6,fStays+8)),-.9,c0),flush:.35*ease(f,fStays,fStays+14)*(1-c0),blink:blink(f,[B.b7F.f0+14,fStays+8]),crumb:c0>.5,full:1};
 return {id:'her',role:'kaoruko',at:[HER_AT[0],HER_AT[1]+.004*breathe(f),HER_AT[2]],pose:{outfit:'school',face,lean:.08*(1-back),bow:.06*(1-back),tilt:.006*breathe(f,34,.25),hands:[[-300,-900],[190,-960]],elbows:[[-330,-880],[260,-840]]}};
}
function shot7F(f:number):Shot{
 const k=f-B.b7F.f0,t=ease(k,0,B.b7F.n);
 const eye=toward([RISE_TO.eye[0]+.12,RISE_TO.eye[1]+.04,RISE_TO.eye[2]+.25],HER_EYES,Math.pow(1-.0016,k));
 const e2:V3=v3(eye,toward(RISE_TO.eye,HER_EYES,Math.pow(1-.0016,k)),t);
 const c1:Cam={eye:e2,pitch:RISE_TO.pitch,fov:lerp(44,RISE_TO.fov,t)*(1-.06*ease(f,fStays-4,B.b7F.f1))},c=lerpCam(c1,CAM_A,ease(f,B.b7F.f1-20,B.b7F.f1-1)); // r5: the camera settles into hook frame 0's framing
 return mk('7F',camOf(c),[herSeat(f),himMirrorB(f)],HER_EYES,12,WARM,.82,{meal:true});
}

// ---------------------------------------------------------------------------------------------------------------
const dissolve=(a:Shot,b:Shot,q:number):Layer[]=>[{shot:a,opacity:1},{shot:b,opacity:clamp(q)}];
export function chunkBLayersAt(f:number):Layer[]{
 const D=8;
 if(f<B.b6B.f0)return [{shot:shot6A(f),opacity:1}];
 if(f<B.b6B.f0+D)return dissolve(shot6A(B.b6B.f0-1),shot6B(f),(f-B.b6B.f0+1)/D);
 if(f<B.b6C.f0)return [{shot:shot6B(f),opacity:1}];
 if(f<B.b6C.f0+D)return dissolve(shot6B(B.b6C.f0-1),shot6C(f),(f-B.b6C.f0+1)/D);
 if(f<B.b7A.f0)return layers6CFinal(f);
 if(f<B.b7C.f0)return [{shot:shot7A(f),opacity:1}];
 if(f<B.b7D.f0)return [{shot:shot7C(f),opacity:1}];
 if(f<B.b7F.f0)return [{shot:shot7D(f),opacity:1}];
 return [{shot:shot7F(f),opacity:1}];
}
/** 6C after its opening dissolve: the framing holds while her face crossfades to his */
function layers6CFinal(f:number):Layer[]{
 const s=shot6C(f),q=ease(f,fEvery-2,fEvery+4);
 const herOnly=s.actors.filter(a=>a.id!=='him-frame0'),himOnly=s.actors.filter(a=>a.id!=='her');
 const herShot={...s,actors:herOnly.length?herOnly:s.actors};
 void himOnly;
 return f<fEvery?[{shot:herSceneAt6C(f),opacity:1}]:[{shot:himSceneAt6C(f),opacity:1}];
}
function herSceneAt6C(f:number):Shot{const s=shot6C(f);return {...s,actors:[herStare(f,22),...s.actors.filter(a=>a.id.startsWith('back'))]};}
function himSceneAt6C(f:number):Shot{
 const s=shot6C(f);
 const him:Actor={id:'him-frame0',role:'rintaro',at:[HIM_FRAME0[0],HIM_FRAME0[1]+.004*breathe(f,40,.1),HIM_FRAME0[2]],pose:{outfit:'school',tilt:-.004*breathe(f,40,.1),
  face:{look:[-.1,0],wide:.1,blink:blink(f,[fEvery+14]),brow:[-.2,0]},hands:[[-196,-850],[196,-850]],elbows:[[-330,-1040],[330,-1040]]}};
 return {...s,actors:[him,...s.actors.filter(a=>a.id.startsWith('back'))]};
}
