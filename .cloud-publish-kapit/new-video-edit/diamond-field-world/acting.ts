import {Beat, Person, fieldHeight} from './contract';
// Supplied kit: anticipation for reaches, spring settling, idle and shaped blinks.
// @ts-ignore the supplied kit deliberately ships JavaScript.
import {M, idle, blinkAt} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
export type V3=[number,number,number];
export type Mood='sly'|'calm'|'eager'|'wow'|'approve'|'doubt'|'deflate'|'pleased';
export type Pose={id:Person;pos:V3;scale:number;mood:Mood;look:number;lean:number;head:number;kneel:number;blink:number;bob:number;walk:number;view:'front'|'side'|'rear';left?:V3;right?:V3;prop?:'book'|'lens'|'pouch';};
export const GEM_SIZE={diamond:.055,ruby:.047};
export const ground=(x:number,z:number):V3=>[x,fieldHeight(x,z),z];
export const MAIN:V3=[0,fieldHeight(0,.5)+.055,.5];
export const RUBY:V3=[.74,fieldHeight(.74,-.55)+.047,-.55];
const cl=(n:number)=>Math.max(0,Math.min(1,n));
const s=(f:number,a:number,b:number)=>M.smooth(cl((f-a)/(b-a)));
const v=(a:V3,b:V3,t:number):V3=>a.map((n,i)=>n+(b[i]-n)*t) as V3;
export const handAnchors=(f:number)=>{
 let diamond:V3=MAIN,ruby:V3=RUBY,bag:V3=[.72,1.30,.05];
 if(f<122)diamond=v([-.12,.28,.50],MAIN,s(f,0,18));
 else if(f>=282&&f<332)diamond=v(MAIN,[-.12,1.52,.5],s(f,282,298));
 else if(f>=332&&f<405)diamond=v([-.12,1.52,.5],[.35,1.40,-.55],s(f,366,390));
 else if(f>=405&&f<447)diamond=v([.35,1.40,-.55],[.36,1.57,-.55],s(f,405,418));
 else if(f>=447&&f<776)diamond=[.28,1.12,.12];
 if(f>=314&&f<332)ruby=v(RUBY,[.89,1.42,-.55],s(f,314,328));
 else if(f>=332&&f<447)ruby=[.89,1.42,-.55];
 else if(f>=447&&f<776)ruby=[.50,1.11,.1];
 if(f>=776&&f<876){diamond=v([.72,1.27,.08],[-.28,1.31,-.28],s(f,802,835));ruby=[.18,1.11,.12];}
 if(f>=916){diamond=[.82,1.35,-.62];ruby=[.27,1.11,.15];}
 if(f>=447&&f<588)bag=v([.72,1.30,.05],[-.62,1.30,-.40],s(f,477,534));
 if(f>=916)bag=[-.65,1.30,-.40];
 return {diamond,ruby,bag};
};
export function castAt(f:number,beat:Beat):Pose[]{
 const list:Pose[]=[];
 const add=(id:Person,x:number,z:number,o:Partial<Pose>={})=>{
  const i=['arnold','slack','investorA','investorB','engineer','king'].indexOf(id)+1,life=idle(f,i);
  const indoor=beat==='payout'||beat==='payoff'||beat==='london';
  list.push({id,pos:[x,indoor?0:fieldHeight(x,z),z],scale:id==='arnold'?1.08:id==='slack'?.91:id==='investorA'?.98:1,mood:'calm',look:0,lean:life.tilt*.35,head:life.headTilt*.5,kneel:0,blink:blinkAt(f,i),bob:life.bob,walk:0,view:'front',...o});
 };
 const h=handAnchors(f);
 if(beat==='plant'){
  add('arnold',-.66,.5,{mood:'sly',look:1,kneel:1-s(f,34,83),lean:18*(1-s(f,28,75)),right:f<34?h.diamond:v(MAIN,[-.20,1.05,.5],s(f,34,80)),prop:'pouch'});
  add('slack',.95,-.10,{mood:f<72?'calm':'sly',look:-1,head:-6,lean:-4,left:[.63,1.10,-.10]});
 } else if(beat==='journey'){
  const travel=s(f,122,244)*1.12-1.12,ph=(f-122)/24;
  add('arnold',-1.22+travel,-.78,{mood:'sly',look:1,view:'side',walk:ph});
  add('slack',1.12+travel,-1.12,{mood:'sly',look:-1,walk:ph+.2});
  add('investorA',-.5+travel,.5,{mood:'eager',look:1,walk:ph+.45,view:'side'});
  add('investorB',.95+travel,-.55,{mood:'doubt',look:-1,walk:ph+.7});
  add('engineer',.1+travel,-1.3,{mood:'calm',prop:'book',walk:ph+.5});
 } else if(['diamond','ruby','collect','expert'].includes(beat)){
  const reach=M.anticip(cl((f-270)/12),.08),reaction=M.spring(Math.max(0,f-291)/30,2.6,7);
  add('investorA',-.58,.5,{mood:f<291?'eager':'wow',kneel:1-s(f,284,303),lean:f<283?10*reach:-5*reaction,right:f<282?v([-.20,.53,.5],MAIN,cl(reach)):f<366?h.diamond:v([-.12,1.52,.5],[-.23,1.28,.5],s(f,366,392)),look:1});
  add('investorB',1.22,-.55,{mood:f<323?'doubt':'eager',kneel:s(f,303,314)*(1-s(f,315,337)),lean:-4,left:f<305?[.88,1.05,-.55]:f<314?v([.90,.40,-.55],RUBY,s(f,305,314)):h.ruby,look:-1});
  add('arnold',-1.55,-1.55,{mood:'sly',look:1,head:4});
  add('slack',1.50,-1.55,{mood:'sly',look:-1,left:[1.1,1.0,-1.55]});
  add('engineer',.05,-.55,{mood:f>=426?'approve':'calm',look:1,prop:f>=398?'lens':'book',left:f>=398?[.24,1.43,-.55]:[-.22,.90,-.55],right:f>=366?h.diamond:[.41,1.05,-.55],head:f>=426?-6:6,lean:f>=426?-3:2});
 } else if(beat==='payout'||beat==='payoff'){
  const end=beat==='payoff',down=s(f,925,954);
  add('arnold',-.83,-.90,{mood:end?'pleased':f>532?'pleased':'sly',look:1,right:f>=503?h.bag:[-.43,1.27,-.4],left:[-1.06,1.08,-.90],lean:-3});
  add('slack',.10,-.90,{mood:end?'pleased':'sly',look:-1,prop:'pouch',head:6,left:[-.12,1.12,-.90]});
  add('investorA',.92,-.90,{mood:end?'deflate':'eager',look:-1,right:end?h.diamond:f<=518?h.bag:[1.35,1.13,-.90],head:end?14*down:0,lean:end?8*down:0});
  add('investorB',1.65,-1.15,{mood:end?'deflate':'calm',look:-1,lean:end?-8*down:0,head:end?-12*down:0});
 } else if(beat==='investigate'||beat==='clue'||beat==='empty'){
  add('king',-.55,.50,{mood:f<635?'doubt':'calm',kneel:s(f,603,638),lean:15*s(f,603,638),look:1,right:f<674?v([-.15,1.05,.50],MAIN,s(f,609,644)):v(MAIN,[.62,.09,.40],s(f,686,718)),left:[-.67,.38,.50],prop:'lens'});
  if(beat!=='empty')add('engineer',1.15,-1.5,{mood:'doubt',look:-1,prop:'book',head:8});
 } else if(beat==='london'){
  add('arnold',-.65,-.9,{mood:'sly',look:1,right:f<820?v([-.2,1.12,-.3],[.45,1.27,.08],s(f,788,811)):h.diamond,prop:'pouch'});
  add('slack',.65,-.9,{mood:'pleased',look:-1,left:[.35,1.14,-.5]});
 }
 return list;
}
export const actorAt=(f:number,beat:Beat,id:Person)=>castAt(f,beat).find(p=>p.id===id);
