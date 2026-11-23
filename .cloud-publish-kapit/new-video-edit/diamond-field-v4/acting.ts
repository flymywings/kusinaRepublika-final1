import {Beat, Person, fieldHeight,GEM_EVENTS,TABLE_Y} from './contract';
// Supplied kit: anticipation for reaches, spring settling, idle and shaped blinks.
// @ts-ignore the supplied kit deliberately ships JavaScript.
import {M, idle, blinkAt} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
export type V3=[number,number,number];
export type Mood='sly'|'calm'|'eager'|'wow'|'approve'|'doubt'|'deflate'|'pleased'|'inspect';
export type Pose={id:Person;pos:V3;scale:number;mood:Mood;look:number;gaze?:[number,number];gazeTarget?:V3;lean:number;head:number;kneel:number;blink:number;bob:number;walk:number;view:'front'|'side'|'rear';left?:V3;right?:V3;feet?:[V3,V3];prop?:'book'|'lens'|'pouch';};
export const GEM_SIZE={diamond:.055,ruby:.047};
const gemSeat=(kind:'diamond'|'ruby')=>TABLE_Y+GEM_SIZE[kind]*.90986425+.002;
export const ground=(x:number,z:number):V3=>[x,fieldHeight(x,z),z];
export const MAIN:V3=[0,fieldHeight(0,.5)+.055,.5];
export const RUBY:V3=[.74,fieldHeight(.74,-.55)+.047,-.55];
const cl=(n:number)=>Math.max(0,Math.min(1,n));
const s=(f:number,a:number,b:number)=>M.smooth(cl((f-a)/(b-a)));
const v=(a:V3,b:V3,t:number):V3=>a.map((n,i)=>n+(b[i]-n)*t) as V3;
export const handAnchors=(f:number)=>{
 let diamond:V3=f<137?[.60,1.58,-.62]:v(MAIN,[-.02,1.52,.5],s(f,225,255)),ruby:V3=f<137?[.5,gemSeat('ruby'),.1]:RUBY,bag:V3=[.72,1.46,-.4];
 if(f<137){const t=s(f,0,34);bag=v([.65-1.27*t,1.46+Math.sin(t*Math.PI)*.10,-.4],[-.62,1.26,-.88],s(f,34,48));}
 if(f>=340&&f<425)diamond=v([-.02,1.52,.5],[.50,1.42,-.40],s(f,340,365));
 if(f>=365&&f<384){const u=Math.sin((f-365)/19*Math.PI);diamond=[diamond[0]+.018*u,diamond[1]+.025*u,diamond[2]];}
 if(f>=425)diamond=[.28,gemSeat('diamond'),.12];
 if(f>=285&&f<425)ruby=v(RUBY,[.89,1.42,-.55],s(f,285,313));
 if(f>=425)ruby=[.5,gemSeat('ruby'),.1];
 if(f>=740&&f<815){diamond=v([.72,1.27,.08],[-.28,1.31,-.28],s(f,766,796));ruby=[.18,gemSeat('ruby'),.12];}
 if(f>=810&&f<858){diamond=v([-.28,.75,.5],MAIN,s(f,818,833));ruby=RUBY;}
 if(f>=890){diamond=[.70,1.50,-.70];ruby=[.5,gemSeat('ruby'),.1];}
 if(f>=425&&f<554){bag=v([.72,1.46,-.4],[-.62,1.46,-.4],s(f,451,478));bag=v(bag,[-.62,1.26,-.88],s(f,478,493));const exit=s(f,510,550);bag=[bag[0]-2.8*exit,bag[1],bag[2]-.55*exit];}
 if(f>=890){const e=.6*s(f,890,923);bag=[-.65-2.8*e,1.46,-.4-.55*e];}
 return {diamond,ruby,bag};
};
export function castAt(f:number,beat:Beat):Pose[]{
 const list:Pose[]=[];
 const add=(id:Person,x:number,z:number,o:Partial<Pose>={})=>{
  const i=['arnold','slack','investorA','investorB','engineer','king'].indexOf(id)+1;
  const indoor=['hook','payout','cashout','payoff','london'].includes(beat);
  list.push({id,pos:[x,indoor?0:fieldHeight(x,z),z],scale:id==='arnold'?1.08:id==='slack'?.91:id==='investorA'?.98:1,mood:'calm',look:0,lean:0,head:0,kneel:0,blink:blinkAt(f,i),bob:0,walk:0,view:'front',...o});
 };
 const h=handAnchors(f);
 if(beat==='hook'){
  const secured=s(f,34,54);
  add('arnold',-.83,-.9,{mood:f<34?'inspect':f<54?'sly':'pleased',look:f<34?1:-1,gazeTarget:f<34?h.bag:[-1.55,1.36,-1.25],right:f>=10?h.bag:v([-.43,1.27,-.4],h.bag,s(f,0,10)),left:[-1.06,1.08,-.9],view:f>=43&&f<78?'side':'front',head:-7*secured,lean:-4*secured});
  add('slack',-1.55,-1.25,{mood:f<48?'inspect':'pleased',look:1,gazeTarget:[-.83,1.6,-.9],left:[-1.77,1.12,-1.25],prop:'pouch',head:4*s(f,48,65)});
  add('investorA',.92,-.9,{mood:f<70?'eager':'inspect',look:-1,gaze:f<70?[-7,5]:[-5,-3],right:h.diamond,left:f<=24?h.bag:v(h.bag,[.7,1.12,-.75],s(f,24,43)),view:f>=72?'side':'front',lean:3*(1-s(f,24,45)),head:-5*s(f,78,100)});
 } else if(['journey','diamond','ruby','collect','expert'].includes(beat)){
  const crouch=.85*s(f,192,215)*(1-s(f,225,255)),exam=beat==='expert';
  const released=s(f,365,371),relief=s(f,400,414);
  const reaching=f<206?[.05,.90,.5] as V3:f<225?v([.05,.90,.5],MAIN,s(f,206,225)):h.diamond;
  add('investorA',-.4,.5,{mood:f>=412?'eager':f>=400?'wow':exam?'doubt':f>=255&&f<314?'wow':'inspect',look:1,gazeTarget:exam?[.05,1.5,-.55]:h.diamond,kneel:crouch,right:f<=365?reaching:v(h.diamond,[-.11,1.08,.5],released),left:[-.71,1.03-.7*crouch,.5],lean:11*crouch+(exam?7-13*relief:0),head:exam?-4+8*relief:6*crouch,view:f>=340&&f<400?'rear':'side'});
  add('arnold',-1.4,-2.4,{mood:f>=400?'pleased':'calm',look:1,gazeTarget:exam?[.05,1.5,-.55]:h.diamond,head:1,view:'side'});
  add('slack',.9,-1.2,{mood:f>=408?'pleased':'calm',look:-1,gazeTarget:exam?[.05,1.5,-.55]:h.diamond,head:-2,view:'side'});
  const arrival=s(f,143,207);
  add('investorB',3.9-2.68*arrival,-.55,{mood:f>=313?'eager':'inspect',look:-1,gazeTarget:exam?[.05,1.5,-.55]:h.ruby,kneel:s(f,276,285)*(1-s(f,297,317)),left:f<276?[.88+2.68*(1-arrival),1.05,-.55]:f<285?v([.88,1.05,-.55],RUBY,s(f,276,285)):h.ruby,walk:arrival>0&&arrival<1?(f-143)/22:0,view:'side'});
  add('engineer',-3.7+3.75*arrival,-.55,{mood:f>=384?'approve':'inspect',look:0,gazeTarget:h.diamond,prop:f>=348?undefined:'book',left:f>=348?[h.diamond[0]-.11,h.diamond[1]-.15,h.diamond[2]+.07]:[-.22-3.75*(1-arrival),.9,-.55],right:f>=340?h.diamond:[.41-3.75*(1-arrival),1.05,-.55],head:f>=382?6+17*Math.sin(Math.min(1,(f-382)/18)*Math.PI):11-5*s(f,365,380),lean:exam?7:0,walk:arrival>0&&arrival<1?(f-143)/22:0});
 } else if(['payout','cashout','payoff'].includes(beat)){
  const end=beat==='payoff',exit=beat==='cashout'?s(f,510,550):end?.6*s(f,890,923):0,down=s(f,890,915);
  add('arnold',-.83-2.8*exit,-.9-.55*exit,{mood:end?'pleased':f>=500?'pleased':f>=478?'sly':'inspect',look:f>=478?-1:1,gazeTarget:f<478?h.bag:[-1.55,1.36,-1.25],head:f>=478?-7*s(f,478,493):0,lean:f>=478?-4*s(f,478,493):2,right:end||f>=451?h.bag:v([-.43,1.27,-.4],h.bag,s(f,430,451)),left:[-1.06-2.8*exit,1.08,-.9-.55*exit],walk:exit>0&&exit<1?(f-510)/19:0,view:exit>0?'side':'front'});
  add('slack',-1.55-2.8*exit,-1.25-.55*exit,{mood:end?'pleased':f>=486?'pleased':'inspect',look:exit>0?-1:1,gazeTarget:[-.83-2.8*exit,1.6,-.9-.55*exit],prop:'pouch',head:2,left:[-1.77-2.8*exit,1.12,-1.25-.55*exit],walk:exit>0&&exit<1?(f-510)/19:0,view:exit>0?'side':'front'});
  add('investorA',.92,-.9,{mood:end?(f<920?'doubt':'deflate'):f<478?'eager':'inspect',look:-1,gazeTarget:end&&f>=914?h.diamond:h.bag,left:end?v([.7,1.1,-.8],[-.45,1.4,-.4],s(f,890,904)*(1-s(f,912,930))):undefined,right:end?h.diamond:f<=478?h.bag:v(h.bag,[1.35,1.13,-.9],s(f,478,497)),head:end?12*down:0,lean:end?5*down:0});
  add('investorB',1.65,-1.15,{mood:end?'deflate':'calm',look:-1,gaze:[-5,3],head:end?-9*down:0});
 } else if(['investigate','clue','empty'].includes(beat)){
  const empty=beat==='empty',phase=f<710?Math.max(0,(f-670)/13)%1:0;
  const shallow:V3=f<614?v([.18,.1,.6],[.61,.1,.4],s(f,598,614)):v([.61,.1,.4],[.18,.1,.6],s(f,614,637));
  const working:V3=f<710?[.02,.25-.27*Math.sin(Math.PI*phase),.5+.08*Math.sin(Math.PI*phase)]:v([.02,.25,.5],[-.72,.58,.7],s(f,710,724));
  if(!empty)add('king',-.95,.7,{mood:f<596||f>=710?'doubt':'inspect',look:1,gazeTarget:f<670?shallow:[.1,-.55,.5],view:'side',kneel:.7,lean:13,head:12,right:f<670?v([-.62,1.05,.7],shallow,s(f,568,607)):working,left:[-.71,.5,.72],prop:f<670?'lens':undefined});
  if(!empty)add('engineer',1.2,-1.5,{mood:'doubt',look:-1,gazeTarget:[.1,-.55,.5],view:'side',prop:'book',head:8});
 } else if(beat==='london'){
  add('arnold',-.65,-.9,{mood:'inspect',look:1,gazeTarget:h.diamond,view:'side',right:f<766?v([-.2,1.12,-.3],[.72,1.27,.08],s(f,746,766)):h.diamond,left:[-.97,1.12,-.82],prop:'pouch',head:3});
  add('slack',.65,-.9,{mood:'calm',look:-1,left:[.35,1.14,-.5]});
 } else if(beat==='plant'){
  add('arnold',-.66,.5,{mood:'inspect',look:1,gazeTarget:h.diamond,view:'side',kneel:.95,lean:13,right:f<=833?h.diamond:v(MAIN,[-.20,.65,.5],s(f,833,840)),left:[-1,.75,.5],prop:'pouch'});
  add('slack',.95,-.1,{mood:'calm',look:-1,gaze:[-5,5],head:4});
 }
 return list;
}
export const actorAt=(f:number,beat:Beat,id:Person)=>castAt(f,beat).find(p=>p.id===id);
