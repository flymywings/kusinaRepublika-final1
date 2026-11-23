// Cards 2-4 (chunk A, f149-833): street, the shop, the stare, the door, the next morning, the box, the question.
// Everything is a pure function of the frame number. Shot frames and word frames come from the shot list and the voice words, never typed in here.
import {SET,type V3} from './consts';
import film from '../../../production-pipeline-proposal/film-shots.json';
import words from '../../../production-pipeline-proposal/voice/johnny-take-02/words-v4.json';
import {resolveShots,wordFrame} from '../../../pipeline/film-time.mjs';
import {EVE,MORN,STREET,HIM_REAL,HIS_HEAD_Y,HER_AT,HER_EYES,CAM_A,CAM_TABLE,TICKS,streetAt,cardHand,herEve,forkHand,ease,clamp,lerp,v3,key,blink,breathe,toward,lookOf,type Actor,type Shot,type Layer,type Cam,type Sun} from './story';
import type {Face,P} from '../cast/b-hands/rig';

const SH=Object.fromEntries((resolveShots(film as any,words as any) as any[]).map(s=>[s.id,s])) as Record<string,{f0:number;f1:number;n:number}>;
export const A={a2A:SH['2A'],a2B:SH['2B'],a2D:SH['2D'],a3A:SH['3A'],a3C:SH['3C'],a3D:SH['3D'],a3E:SH['3E'],a4A:SH['4A'],a4C:SH['4C'],a4E:SH['4E']};
export const CHUNK_A_RANGE=[A.a2A.f0,A.a4E.f1] as const;
const wf=(l:number,w:string,n=1)=>wordFrame(words as any,l,w,n);
const fTall=wf(3,'tall,'),fPierced=wf(3,'pierced'),fInt=wf(3,'intimidating'),fRun=wf(3,'run'),fMount=wf(5,'mountain'),fStaring=wf(5,'staring.');
const fBack=wf(8,"back,"),fApol=wf(8,'apologizing'),fInsist=wf(8,'insisting'),fWait=wf(10,'Wait,'),fScared=wf(11,'scared');

const COOL:Sun={...EVE,mood:{lit:[1.28,1.22,1.12],shade:[.5,.5,.56],lift:[.05,.05,.07],tint:[.96,.95,.95],fill:.9}};
function sunMix(a:Sun,b:Sun,t:number):Sun{
 const m=(x:V3,y:V3):V3=>[lerp(x[0],y[0],t),lerp(x[1],y[1],t),lerp(x[2],y[2],t)],A_=a.mood!,B=b.mood!;
 return {...b,i:lerp(a.i,b.i,t),mood:{lit:m(A_.lit,B.lit),shade:m(A_.shade,B.shade),lift:m(A_.lift,B.lift),tint:m(A_.tint,B.tint),fill:lerp(A_.fill,B.fill,t)}};
}
const STREET_M:Sun={...STREET,mood:{lit:[1.7,1.38,.96],shade:[.6,.52,.5],lift:[.05,.045,.05],tint:[1,.92,.8],fill:.9}};

function mk(id:string,c:{eye:V3;look:V3;fov:number},actors:Actor[],focus:V3,blur:number,sun:Sun,warmth:number,extra:Partial<Shot>={}):Shot{
 return {id,eye:c.eye,look:c.look,fov:c.fov,blur,focus,warmth,sun,actors,door:0,bell:0,meal:true,...extra};
}
const camOf=(c:Cam)=>({eye:c.eye,look:lookOf(c),fov:c.fov});
const lerpCam=(a:Cam,b:Cam,t:number):Cam=>({eye:v3(a.eye,b.eye,t),pitch:lerp(a.pitch,b.pitch,t),fov:lerp(a.fov,b.fov,t)});

// ---------------------------------------------------------------------------------------------------------------
// Rintaro on the street (cards 2A, 2B). Hands in pockets; one goes to the bag strap on "pierced".
const POCKETS:[P,P]=[[-196,-850],[196,-850]];
const STRAP:P=[196,-1010];
function himStreet(f:number,at:V3,walk=0,extra:Partial<Actor['pose']>={}):Actor{
 const step=Math.sin(walk*.42),lift=Math.max(0,step),lift2=Math.max(0,-step);
 const strap=ease(f,fPierced-4,fPierced+4);
 const h1:P=[lerp(POCKETS[1][0],STRAP[0],strap),lerp(POCKETS[1][1],STRAP[1],strap)];
 return {id:'him',role:'rintaro',at:[at[0],at[1]+.004*breathe(f,40,.1)+(walk?.012*Math.abs(step):0),at[2]],pose:{outfit:'school',tilt:-.004*breathe(f,40,.1)+(walk?.012*step:0),
  face:{look:[-.4,walk?.9:0],blink:blink(f,[fTall+8,fRun+20]),brow:[0,0]},hands:[POCKETS[0],h1],elbows:[[-330,-1040],[lerp(330,300,strap),lerp(-1040,-1130,strap)]],
  feet:walk?[[-22*1,-60*lift],[22,-60*lift2]]:undefined,...extra},
  overlay:f>=fPierced&&f<fPierced+7?{glint:[-286,-1600]}:undefined};
}
function cam2A(f:number):Cam{
 const s0=streetAt(A.a2A.f0),e0=s0.eye,e1:V3=[HIM_REAL[0]+.08,1.2,HIM_REAL[2]+3.5];
 const u=.9*ease(f,A.a2A.f0,fTall+22)+.1*ease(f,fTall+10,A.a2A.f1);
 return {eye:v3(e0,e1,u),pitch:lerp(0,2,u),fov:lerp(s0.fov,40,u)};
}
function shot2A(f:number):Shot{
 const c=cam2A(f);
 return mk('2A',camOf(c),[himStreet(f,HIM_REAL)],[HIM_REAL[0],HIS_HEAD_Y,HIM_REAL[2]],13,STREET_M,.6,{meal:false});
}

// 2B: two blurred backs flank him, stiffen on "intimidating", streak out on "run". One drops a satchel and a hand snatches it back.
const fDrop=fRun+4,fSnatch=fRun+9,fGo=fRun+11;
function backs(f:number):Actor[]{
 const z=5.0,stiff=ease(f,fInt,fInt+6),k=f-A.a2B.f0;
 const walkIn=1-ease(f,A.a2B.f0,fInt); // they approach, then stop
 const goA=ease(f,fGo,fGo+8),goB=ease(f,fRun,fRun+8);
 const xa=HIM_REAL[0]-.46-.35*walkIn-1.9*goA*goA,xb=HIM_REAL[0]+.66+.4*walkIn+2.1*goB*goB;
 const ground:P=[-190,-70];
 const dropT=ease(f,fDrop,fDrop+4),snT=ease(f,fSnatch,fSnatch+3);
 const hold:P=[-190,-620];
 const satchelAt:P=f<fDrop?hold:f<fSnatch+4?[hold[0],lerp(hold[1],ground[1]+100,dropT)]:hold;
 const handPos:P=f<fSnatch?hold:f<fSnatch+4?[lerp(hold[0],ground[0],snT),lerp(hold[1],ground[1],snT)]:[lerp(ground[0],hold[0],ease(f,fSnatch+4,fSnatch+9)),lerp(ground[1],hold[1],ease(f,fSnatch+4,fSnatch+9))];
 void k;
 return [
  {id:'back-a',role:'rintaro',at:[xa,0,z],stranger:{hair:'#4b3b36',cloth:'#5b6a7c'},pose:{back:true,outfit:'cafe',hunch:.15*stiff,hands:[handPos,[190,-640]],prop:'satchel',propAt:satchelAt}},
  {id:'back-b',role:'kaoruko',at:[xb,0,z-.1],stranger:{hair:'#2c2a33',cloth:'#9a7a74'},pose:{back:true,outfit:'cafe',hunch:.12*stiff}},
 ];
}
function shot2B(f:number):Shot{
 const k=f-A.a2B.f0,stop=ease(f,fRun+14,fRun+28);
 const z=lerp(HIM_REAL[2],HIM_REAL[2]-.85,ease(f,A.a2B.f0,fRun+14));
 const walk=f<fRun+14?k:0;
 const eye:V3=[HIM_REAL[0]+.02,1.32,7.5-.5*ease(f,A.a2B.f0,A.a2B.f1)],c:Cam={eye,pitch:2,fov:40};
 const roll=.07*(1-ease(f,fRun,fRun+14));
 const breath=ease(f,fRun+20,fRun+30)*(1-ease(f,fRun+30,fRun+44));
 const him=himStreet(f,[HIM_REAL[0],0,z],walk,{bow:.0,lean:-.02*breath,hunch:.0});
 him.pose.face={...him.pose.face,look:[-.4,lerp(.9,0,stop)],mouth:.0,parted:breath*1.2};
 return mk('2B',camOf(c),[him,...backs(f)],[HIM_REAL[0],HIS_HEAD_Y,z],14,sunMix(STREET_M,{...STREET_M,mood:{...STREET_M.mood!,tint:[.96,.95,.95],lit:[1.4,1.3,1.1]}},ease(f,A.a2B.f0,A.a2B.f1)),.5,{meal:false,roll});
}

// ---------------------------------------------------------------------------------------------------------------
// The shop. Him in his apron behind the case (2D, 3A, 3E), her at the booth eating (2D, 3A).
const HIM_SHOP:V3=[SET.behindCase[0]+.55,SET.behindCase[1],SET.behindCase[2]];
function himShop(f:number,o:{wipe?:number;look?:P;sink?:number;set?:number;brow?:P;wide?:number}={}):Actor{
 const wipe=o.wipe??0,sink=o.sink??0;
 const w=Math.sin(f*.5)*40*wipe,set=o.set??0;
 return {id:'him',role:'rintaro',at:[HIM_SHOP[0],HIM_SHOP[1]-.43*sink+.004*breathe(f,40,.1),HIM_SHOP[2]],pose:{
  outfit:'cafe',tilt:-.004*breathe(f,40,.1),bow:.25*sink,
  face:{look:o.look??[.2,0],wide:o.wide??.25,brow:o.brow??[-.8,-.3],blink:blink(f,[A.a2D.f0+30,A.a3A.f0+60,A.a3E.f0+30]),mouth:0},
  hands:set>0?[[-170,lerp(-980,-640,set)],[170,lerp(-980,-640,set)]]:[[-150+w,-720],[170,-820]],elbows:set>0?[[-260,-800],[270,-800]]:[[-250,-760],[280,-700]],
  prop:set>0&&set<1?'tray':undefined,propAt:[0,lerp(-980,-640,set)]},
  overlay:set>0?undefined:{cloth:[-150+w,-720]}};
}
/** her at the booth, eating steadily, untroubled */
function herEat(f:number):Actor{
 const base=herEve(0),cyc=(f%40)/40,up=Math.sin(Math.min(1,cyc*1.6)*Math.PI)*(cyc<.62?1:0);
 const hand:P=[lerp(-250,-110,up),lerp(-880,-1150,up)];
 const face:Face={...(base.pose.face as Face),wide:0,look:[.1,1.5],brow:[-.5,-.4],mouth:.25,parted:.5*up*(1-up)*2+(cyc>.62&&cyc<.9?.4:0),blink:blink(f,[A.a2D.f0+14,A.a3A.f0+30,A.a3A.f0+80],true)};
 return {...base,pose:{...base.pose,face,lean:0,hunch:0,bow:.04*up,tilt:.006*breathe(f,34,.25),hands:[hand,[190,-900]],elbows:[[-330,-880],[260,-840]],prop:'fork',propAt:hand}};
}
const SHOP_WIDE:Cam={eye:[-.55,1.4,.95],pitch:6,fov:54};
function shot2D(f:number):Shot{
 const set=ease(f,A.a2D.f0+4,A.a2D.f0+16)*(1-ease(f,A.a2D.f0+18,A.a2D.f0+24));
 const t=ease(f,A.a2D.f0+14,A.a2D.f1);
 const c=lerpCam(SHOP_WIDE,CAM_TABLE,t);
 return mk('2D',camOf(c),[himShop(f,{set:ease(f,A.a2D.f0,A.a2D.f0+10)*(1-ease(f,A.a2D.f0+14,A.a2D.f0+22))*.9+set*0,look:[lerp(.2,.6,t),.3]}),herEat(f)],v3([HIM_SHOP[0],1.5,HIM_SHOP[2]],HER_EYES,t),lerp(10,14,t),EVE,.82);
}
// 3A: rise along the tower to her face, then glide across to him
const CAM_HIM:Cam={eye:[-.93,1.62,.2],pitch:5,fov:40};
const CAM_HER_RISE:Cam={eye:[.74,1.45,0],pitch:15,fov:40};
function shot3A(f:number):Shot{
 const rise=ease(f,A.a3A.f0,A.a3A.f0+48),glide=ease(f,A.a3A.f0+56,A.a3A.f0+88);
 let c=lerpCam(CAM_TABLE,CAM_HER_RISE,rise);
 c=lerpCam(c,CAM_HIM,glide);
 const stop=ease(f,A.a3A.f0+70,A.a3A.f0+78);
 const him=himShop(f,{wipe:1-stop,look:[lerp(.2,.9,stop),lerp(.3,-.3,stop)],brow:[lerp(-.8,-1.4,stop),-.3],wide:lerp(.25,.5,stop)});
 const focus=v3(HER_EYES,[HIM_SHOP[0],1.5,HIM_SHOP[2]],glide);
 return mk('3A',camOf(c),[him,herEat(f)],focus,lerp(14,12,glide),sunMix(EVE,COOL,.5*ease(f,A.a3A.f0+56,A.a3A.f1)),.82);
}
/** 3C: the hook's frame 0 framing and state, with the same fork ticks. Eyes lift and lock. */
function herStare(f:number,k:number,school=false):Actor{
 const base=herEve(0),lock=ease(k,2,14);
 const face:Face={...(base.pose.face as Face),look:[lerp(.1,.5,lock),lerp(1.4,-.5,lock)],wide:lerp(.4,.9,lock),brow:[lerp(-1,-3.4,lock),-.6],blink:blink(f,[A.a3C.f0+36])};
 return {...base,pose:{...base.pose,...(school?{outfit:'school' as const}:{}),face,hands:[forkHand(k),(base.pose.hands as [P,P])[1]]}};
}
const stareCam=(k:number):Cam=>({eye:toward(CAM_A.eye,HER_EYES,Math.pow(1-.0016,k)),pitch:CAM_A.pitch,fov:CAM_A.fov});
function shot3C(f:number):Shot{
 const k=f-A.a3C.f0;
 return mk('3C',camOf(stareCam(k)),[herStare(f,k)],HER_EYES,15,EVE,.82);
}

// 3D: she turns in two frames, the camera whips to the door, which is already swinging with nobody in it.
const WHIP=[A.a3D.f0+3,A.a3D.f0+11] as const;
const DOOR_EYE:V3=[.1,1.35,1.2];
function shot3D(f:number):Shot{
 const k=f-A.a3D.f0,u=ease(f,WHIP[0],WHIP[1]);
 const eye0=stareCam(A.a3C.f1-A.a3C.f0-1).eye,eye=v3(eye0,DOOR_EYE,u);
 const a=Math.PI*u*(2-u)*0+Math.PI*ease(f,WHIP[0],WHIP[1]);
 const look:V3=[eye[0]+Math.sin(a)*10,eye[1]-Math.sin((1-u)*15*Math.PI/180+u*3*Math.PI/180)*10,eye[2]-Math.cos(a)*10];
 const turn=ease(k,0,3),gone=ease(k,2,5);
 const her=herStare(f,A.a3C.f1-A.a3C.f0,false);
 her.pose={...her.pose,tilt:-.28*turn,lean:.25*turn,hairFlow:1*turn,face:{...(her.pose.face as Face),look:[-1.6*turn+.5*(1-turn),.3],wide:.7}};
 her.at=[her.at[0]-.5*gone,her.at[1],her.at[2]];
 const doorK=Math.max(0,k-1),door=.9*Math.exp(-doorK*.055)*Math.cos(doorK*.22),bell=.55*Math.sin(doorK*.9)*Math.exp(-doorK*.07);
 const actors=u<.55?[her]:[];
 const cam=u>.7?{eye:v3(DOOR_EYE,[DOOR_EYE[0]-.03,DOOR_EYE[1]+.02,DOOR_EYE[2]-.06],ease(f,WHIP[1],A.a3D.f1)),look:[-.7,1.15,3.2] as V3,fov:44}:{eye,look,fov:lerp(40,44,u)};
 return mk('3D',cam,actors,[-1.1,1.1,3.2],12+30*Math.sin(Math.PI*u),sunMix(EVE,EVE,0),.82,{door:Math.max(0,door),bell,roll:.05*Math.sin(Math.PI*u)});
}

// 3E: he sinks behind the case until only his eyes and brow show. Cool, a slow push.
function shot3E(f:number):Shot{
 const sink=ease(f,A.a3E.f0+4,A.a3E.f0+30),k=f-A.a3E.f0;
 const c:Cam={eye:[HIM_SHOP[0]+.02,1.36,-.2-.12*ease(f,A.a3E.f0,A.a3E.f1)],pitch:4,fov:38};
 const him=himShop(f,{sink,look:[.9,.0],brow:[-3,-1],wide:.5});
 him.pose.face={...him.pose.face,blink:blink(f,[A.a3E.f0+46]),look:[lerp(.9,.3,ease(k,34,50)),.1]};
 return mk('3E',camOf(c),[him],[HIM_SHOP[0],1.3,HIM_SHOP[2]],12,COOL,.55);
}

// ---------------------------------------------------------------------------------------------------------------
// 4A: the next morning. She waits behind the door glass with the box in both hands, his arm pushes the door open, four weighted steps in.
const BOXP:P=[0,-760];
function herDoor(f:number):Actor{
 const w0=A.a4A.f0+20,steps=4,per=7,k=f-w0;
 const n=clamp(k/(steps*per),0,1),dist=ease(f,w0,w0+steps*per);
 const z=lerp(3.95,1.55,dist),x=lerp(-1.2,-.62,dist);
 const bob=k>=0&&k<steps*per?Math.abs(Math.sin(k/per*Math.PI))*.03:0;
 const bow=.32*ease(f,A.a4A.f0+46,A.a4A.f0+58)*(1-ease(f,fInsist-2,fInsist+8));
 const out=ease(f,fInsist,fInsist+10);
 const face:Face={wide:key(f,[[A.a4A.f0,-.1],[w0,0],[A.a4A.f0+46,-.6],[fInsist,.1]]),look:[0,key(f,[[A.a4A.f0,0],[A.a4A.f0+46,1.8],[fInsist,-.4]])],
  brow:[key(f,[[A.a4A.f0,-.6],[A.a4A.f0+46,-2.2],[fInsist,-1.4]]),-.4],mouth:key(f,[[A.a4A.f0,.1],[fInsist,.4]]),blink:blink(f,[A.a4A.f0+30,fApol+12]),crumb:false,full:1};
 const lift=n>0&&n<1?-60*Math.abs(Math.sin(k/per*Math.PI)):0;
 return {id:'her',role:'kaoruko',at:[x,bob,z],pose:{outfit:'school',face,bow,tilt:.006*breathe(f,34,.25),
  hands:[[-190+out*-40,-760-out*40],[190+out*40,-760-out*40]],elbows:[[-250,-690],[250,-690]],prop:'box',propAt:[0,lerp(-770,-900,out)+lift*0],
  feet:n>0&&n<1?[[-22,Math.max(0,Math.sin(k/per*Math.PI))*-50*(Math.floor(k/per)%2===0?1:0)],[22,Math.max(0,Math.sin(k/per*Math.PI))*-50*(Math.floor(k/per)%2===1?1:0)]]:undefined}};
}
function himDoor(f:number):Actor{
 const push=ease(f,A.a4A.f0+6,A.a4A.f0+20),raise=ease(f,fApol+8,fApol+14)*(1-ease(f,fApol+16,fApol+24));
 return {id:'him',role:'rintaro',at:[-.24,0,2.3],pose:{outfit:'cafe',tilt:-.004*breathe(f,40,.1),
  face:{look:[lerp(-.6,.5,ease(f,A.a4A.f0+20,A.a4A.f0+36)),.2],wide:.2,brow:[-.8,-.3],blink:blink(f,[A.a4A.f0+30,fApol+30])},
  hands:[[-196-170*push*(1-ease(f,A.a4A.f0+20,A.a4A.f0+30)),-850-150*push*(1-ease(f,A.a4A.f0+20,A.a4A.f0+30))-250*raise],[196,-850]],elbows:[[-330,-960],[300,-860]]}};
}
function shot4A(f:number):Shot{
 const glide=ease(f,A.a4A.f0+30,A.a4A.f0+62);
 const eye=v3([-.45,1.05,-.4],[-.4,1.28,-.55],glide),look=v3([-.6,1.0,3.0],[-.4,1.2,3.0],glide),fov=lerp(52,42,glide);
 const open=ease(f,A.a4A.f0+6,A.a4A.f0+20),doorV=.78*open*(1-.18*ease(f,A.a4A.f0+44,A.a4A.f1));
 const bell=.4*Math.sin((f-A.a4A.f0-8)*.8)*Math.exp(-(f-A.a4A.f0-8)*.08)*(f>A.a4A.f0+8?1:0);
 return mk('4A',{eye,look,fov},[himDoor(f),herDoor(f)],[-.8,1.3,2.0],lerp(12,11,glide),MORN,.42,{meal:false,door:doorV,bell});
}

// 4C: at yesterday's table. Box slides: she pushes it over, he pushes it back, she pushes it again and keeps her hand on it.
const HIM_TABLE:V3=[-.02,0,-1.85];
const BX=(x:number,z:number):V3=>[x,SET.table.top,z];
function boxP(f:number):V3{
 const t0=A.a4C.f0;
 const A1=BX(.88,-2.05),B1=BX(.42,-1.82),A2=BX(.8,-2.0);
 if(f<t0+12)return A1;
 if(f<t0+30)return v3(A1,B1,ease(f,t0+12,t0+30));
 if(f<t0+36)return B1;
 if(f<t0+52)return v3(B1,A2,ease(f,t0+36,t0+52));
 if(f<t0+58)return A2;
 return v3(A2,BX(.6,-1.9),ease(f,t0+58,t0+68));
}
function shot4C(f:number):Shot{
 const t0=A.a4C.f0,close=ease(f,fWait-26,fWait+2);
 const wide:Cam={eye:[.2,1.66,.75],pitch:12,fov:46},tight:Cam={eye:[.0,1.62,-.1],pitch:9,fov:40};
 const c=lerpCam(wide,tight,close);
 const punch=1-.006*ease(f,fWait,fWait+4);
 const eye=toward(c.eye,[.12,1.6,-1.5],punch);
 const b=boxP(f);
 const hv=(card:V3,w:V3,up:number)=>cardHand(c.eye,[w[0],w[1]+up,w[2]],card);
 const herCard:V3=HER_AT,himCard:V3=HIM_TABLE;
 // her hand: behind the box on each push; his: on the near side when he pushes back
 const win=(f0:number,f1:number)=>ease(f,f0-6,f0)*(1-ease(f,f1,f1+6));
 const hand=(who:'her'|'him'):P=>{
  const rest:P=who==='her'?[-330,-1000]:[330,-950];
  const q=who==='her'?hv(herCard,[b[0]+.085,b[1]+.056,b[2]-.07],.016):hv(himCard,[b[0]-.09,b[1]+.056,b[2]+.07],.016);
  const w=who==='her'?Math.max(win(t0+14,t0+30),ease(f,t0+46,t0+54)):win(t0+40,t0+52);
  return v3p(rest,q,w);
 };
 const her:Actor={id:'her',role:'kaoruko',at:HER_AT,pose:{outfit:'school',face:{wide:0,look:[-.3,.9],brow:[-1,-.3],mouth:.3,blink:blink(f,[t0+22,t0+60]),crumb:false,full:1},tilt:.006*breathe(f,34,.25),hands:[hand('her'),[190,-960]],elbows:[[-300,-900],[260,-840]]}};
 const wl=ease(f,fWait-6,fWait+2);
 const him:Actor={id:'him',role:'rintaro',at:[HIM_TABLE[0],HIM_TABLE[1]+.004*breathe(f,40,.1),HIM_TABLE[2]],pose:{outfit:'cafe',tilt:-.004*breathe(f,40,.1)-.01*wl,
  face:{look:[lerp(.5,.1,ease(f,t0+60,fWait-2)),lerp(.9,-.2,wl)],wide:lerp(.2,.6,wl),brow:[lerp(-.8,2.4,wl),lerp(-.3,1.8,wl)],blink:blink(f,[t0+24,t0+56]),mouth:0,parted:0},
  hands:[[-196,-850],hand('him')],elbows:[[-330,-1040],[300,-900]]}};
 return mk('4C',{eye,look:lookOf({...c,eye}),fov:c.fov},[him,her],v3([.5,1.5,-1.9],[HIM_TABLE[0],1.62,HIM_TABLE[2]],close),12,sunMix(MORN,COOL,.35*ease(f,fWait,A.a4C.f1)),.42,{meal:false,slice:{p:b,turn:.08}});
}
const v3p=(a:P,b:P,t:number):P=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];

// 4E: her face in the hook's frame-0 framing, eyes widening on "scared". The warmth drains.
function shot4E(f:number):Shot{
 const k=f-A.a4E.f0,base=herStare(f,0,true),wide=ease(f,fScared-4,fScared+4);
 const face:Face={...(base.pose.face as Face),look:[.5,-.5],wide:lerp(.55,.95,wide),brow:[lerp(-2,-3.4,wide),-.6],blink:blink(f,[A.a4E.f0+14],true)};
 const her:Actor={...base,pose:{...base.pose,face,hands:[forkHand(k),(base.pose.hands as [P,P])[1]],prop:undefined}};
 const eye=toward(CAM_A.eye,HER_EYES,Math.pow(1-.0016,k)*lerp(1.2,1,ease(k,0,24)));
 return mk('4E',{eye,look:lookOf({eye,pitch:CAM_A.pitch,fov:CAM_A.fov}),fov:CAM_A.fov},[her],HER_EYES,15,sunMix(MORN,EVE,ease(f,A.a4E.f0,A.a4E.f1)),lerp(.42,.82,ease(f,A.a4E.f0,A.a4E.f1)),{meal:true});
}

// ---------------------------------------------------------------------------------------------------------------
const dissolve=(a:Shot,b:Shot,q:number):Layer[]=>[{shot:a,opacity:1},{shot:b,opacity:clamp(q)}];
export function chunkALayersAt(f:number):Layer[]{
 const D=6;
 if(f<A.a2B.f0)return [{shot:shot2A(f),opacity:1}];
 if(f<A.a2D.f0)return [{shot:shot2B(f),opacity:1}];
 if(f<A.a2D.f0+D)return dissolve(shot2B(A.a2D.f0-1),shot2D(f),(f-A.a2D.f0+1)/D);
 if(f<A.a3A.f0)return [{shot:shot2D(f),opacity:1}];
 if(f<A.a3C.f0)return [{shot:shot3A(f),opacity:1}];
 if(f<A.a3D.f0)return [{shot:shot3C(f),opacity:1}];
 if(f<A.a3E.f0)return [{shot:shot3D(f),opacity:1}];
 if(f<A.a4A.f0)return [{shot:shot3E(f),opacity:1}];
 if(f<A.a4A.f0+4)return dissolve(shot3E(A.a4A.f0-1),shot4A(f),(f-A.a4A.f0+1)/4);
 if(f<A.a4C.f0)return [{shot:shot4A(f),opacity:1}];
 if(f<A.a4E.f0)return [{shot:shot4C(f),opacity:1}];
 return [{shot:shot4E(f),opacity:1}];
}
