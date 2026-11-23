import {Beat, Person, fieldHeight,GEM_EVENTS,TABLE_Y} from './contract';
// Supplied kit: anticipation for reaches, spring settling, idle and shaped blinks.
// @ts-ignore the supplied kit deliberately ships JavaScript.
import {M, idle, blinkAt} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
export type V3=[number,number,number];
export type Mood='sly'|'calm'|'eager'|'wow'|'approve'|'doubt'|'deflate'|'pleased'|'inspect';
export type Pose={id:Person;pos:V3;scale:number;mood:Mood;look:number;gaze?:[number,number];lean:number;head:number;kneel:number;blink:number;bob:number;walk:number;view:'front'|'side'|'rear';left?:V3;right?:V3;feet?:[V3,V3];prop?:'book'|'lens'|'pouch';};
export const GEM_SIZE={diamond:.055,ruby:.047};
const gemSeat=(kind:'diamond'|'ruby')=>TABLE_Y+GEM_SIZE[kind]*.90986425+.002;
export const ground=(x:number,z:number):V3=>[x,fieldHeight(x,z),z];
export const MAIN:V3=[0,fieldHeight(0,.5)+.055,.5];
export const RUBY:V3=[.74,fieldHeight(.74,-.55)+.047,-.55];
const cl=(n:number)=>Math.max(0,Math.min(1,n));
const s=(f:number,a:number,b:number)=>M.smooth(cl((f-a)/(b-a)));
const v=(a:V3,b:V3,t:number):V3=>a.map((n,i)=>n+(b[i]-n)*t) as V3;
export const handAnchors=(f:number)=>{
 let diamond:V3=v(MAIN,[-.02,1.52,.5],s(f,0,39)),ruby:V3=RUBY,bag:V3=[.72,1.46,-.4];
 if(f>=340&&f<425)diamond=v([-.02,1.52,.5],[.05,1.32,-.1],s(f,340,365));
 if(f>=425)diamond=[.28,gemSeat('diamond'),.12];
 if(f>=285&&f<425)ruby=v(RUBY,[.89,1.42,-.55],s(f,285,313));
 if(f>=425)ruby=[.5,gemSeat('ruby'),.1];
 if(f>=740&&f<815){diamond=v([.72,1.27,.08],[-.28,1.31,-.28],s(f,766,796));ruby=[.18,gemSeat('ruby'),.12];}
 if(f>=815&&f<840){diamond=v([-.28,1.31,-.28],MAIN,s(f,818,833));ruby=RUBY;}
 if(f>=890){diamond=[.82,1.35,-.62];ruby=[.5,gemSeat('ruby'),.1];}
 if(f>=425&&f<554){bag=v([.72,1.46,-.4],[-.62,1.46,-.4],s(f,451,478));const exit=s(f,510,550);bag=[bag[0]-2.8*exit,bag[1],bag[2]-.55*exit];}
 if(f>=890)bag=[-.65,1.46,-.4];
 return {diamond,ruby,bag};
};
export function castAt(f:number,beat:Beat):Pose[]{
 const list:Pose[]=[];
 const add=(id:Person,x:number,z:number,o:Partial<Pose>={})=>{
  const i=['arnold','slack','investorA','investorB','engineer','king'].indexOf(id)+1;
  const indoor=['payout','cashout','payoff','london'].includes(beat);
  list.push({id,pos:[x,indoor?0:fieldHeight(x,z),z],scale:id==='arnold'?1.08:id==='slack'?.91:id==='investorA'?.98:1,mood:'calm',look:0,lean:0,head:0,kneel:0,blink:blinkAt(f,i),bob:0,walk:0,view:'front',...o});
 };
 const h=handAnchors(f);
 if(['hook','journey','diamond','ruby','collect','expert'].includes(beat)){
  const stand=s(f,0,39),pass=s(f,340,365),exam=beat==='expert';
  add('investorA',-.4,.5,{mood:exam&&f>=392?'eager':'inspect',look:1,gaze:[5,-4+9*(1-stand)],kneel:.85*(1-stand),right:f<=365?h.diamond:v(h.diamond,[-.11,1.08,.5],s(f,365,383)),left:[-.71,1.03,.5],lean:6*(1-stand),head:5*(1-stand)-2*s(f,64,85)});
  add('arnold',-1.4,-2.4,{mood:'calm',look:1,gaze:[5,3],head:1});
  add('slack',.9,-1.2,{mood:'calm',look:-1,gaze:[-5,3],head:-2});
  // Both additional observers approach from outside the initial tight framing.
  const arrival=s(f,143,207);
  add('investorB',3.9-2.68*arrival,-.55,{mood:f>=313?'eager':'inspect',look:-1,gaze:[-6,4],kneel:s(f,276,285)*(1-s(f,297,317)),left:f<276?[.88+2.68*(1-arrival),1.05,-.55]:f<285?v([.88,1.05,-.55],RUBY,s(f,276,285)):h.ruby,walk:arrival>0&&arrival<1?(f-143)/22:0});
  add('engineer',-3.7+3.75*arrival,-.55,{mood:f>=392?'approve':'inspect',look:0,gaze:[0,exam?5:2],prop:exam?'lens':'book',left:exam?[-.02,1.40,-.08]:[-.22-3.75*(1-arrival),.9,-.55],right:f>=340?h.diamond:[.41-3.75*(1-arrival),1.05,-.55],head:exam?7-10*s(f,390,408):3,lean:exam?3:0,walk:arrival>0&&arrival<1?(f-143)/22:0});
 } else if(['payout','cashout','payoff'].includes(beat)){
  const end=beat==='payoff',exit=beat==='cashout'?s(f,510,550):0,down=s(f,890,915);
  add('arnold',-.83-2.8*exit,-.9-.55*exit,{mood:end?'pleased':'calm',look:1,right:end||f>=451?h.bag:v([-.43,1.27,-.4],h.bag,s(f,430,451)),left:[-1.06-2.8*exit,1.08,-.9-.55*exit],walk:exit>0&&exit<1?(f-510)/19:0,view:exit>0?'side':'front'});
  add('slack',.1-2.8*exit,-1.1-.55*exit,{mood:end?'pleased':'calm',look:-1,prop:'pouch',head:2,left:[-.12-2.8*exit,1.12,-1.1-.55*exit],walk:exit>0&&exit<1?(f-510)/19:0,view:exit>0?'side':'front'});
  add('investorA',.92,-.9,{mood:end?'deflate':'eager',look:-1,gaze:[-5,3],right:end?h.diamond:f<=478?h.bag:v(h.bag,[1.35,1.13,-.9],s(f,478,497)),head:end?12*down:0,lean:end?5*down:0});
  add('investorB',1.65,-1.15,{mood:end?'deflate':'calm',look:-1,gaze:[-5,3],head:end?-9*down:0});
 } else if(['investigate','clue','empty'].includes(beat)){
  const dig=s(f,670,702),empty=beat==='empty',pause=s(f,704,710);
  const shallow:V3=[0,.10,.5],deep:V3=[.16,-.68,.62];
  const working=v(shallow,deep,dig);
  if(!empty)add('king',-.95,.7,{mood:f>=710?'doubt':'inspect',look:1,gaze:[6,7],kneel:.7,lean:13,head:12,right:f<670?v([-.62,1.05,.7],shallow,s(f,568,607)):working,left:[-.71,.5,.72],prop:f<670?'lens':undefined});
  if(!empty)add('engineer',1.2,-1.5,{mood:'doubt',look:-1,gaze:[-5,6],prop:'book',head:8});
 } else if(beat==='london'){
  add('arnold',-.65,-.9,{mood:'inspect',look:1,gaze:[5,4],right:f<766?v([-.2,1.12,-.3],[.72,1.27,.08],s(f,746,766)):h.diamond,left:[-.97,1.12,-.82],prop:'pouch',head:3});
  add('slack',.65,-.9,{mood:'calm',look:-1,left:[.35,1.14,-.5]});
 } else if(beat==='plant'){
  add('arnold',-.66,.5,{mood:'inspect',look:1,gaze:[5,7],kneel:s(f,815,819),lean:13*s(f,815,819),right:f<=833?h.diamond:v(MAIN,[-.20,.65,.5],s(f,833,840)),left:[-1,.75,.5],prop:'pouch'});
  add('slack',.95,-.1,{mood:'calm',look:-1,gaze:[-5,5],head:4});
 }
 return list;
}
export const actorAt=(f:number,beat:Beat,id:Person)=>castAt(f,beat).find(p=>p.id===id);
