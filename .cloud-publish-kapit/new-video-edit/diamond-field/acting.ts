import {Beat, Person, fieldHeight,GEM_EVENTS,TABLE_Y} from './contract';
// Supplied kit: anticipation for reaches, spring settling, idle and shaped blinks.
// @ts-ignore the supplied kit deliberately ships JavaScript.
import {M, idle, blinkAt} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
export type V3=[number,number,number];
export type Mood='sly'|'calm'|'eager'|'wow'|'approve'|'doubt'|'deflate'|'pleased';
export type Pose={id:Person;pos:V3;scale:number;mood:Mood;look:number;lean:number;head:number;kneel:number;blink:number;bob:number;walk:number;view:'front'|'side'|'rear';left?:V3;right?:V3;feet?:[V3,V3];prop?:'book'|'lens'|'pouch';};
export const GEM_SIZE={diamond:.055,ruby:.047};
const gemSeat=(kind:'diamond'|'ruby')=>TABLE_Y+GEM_SIZE[kind]*.90986425+.002;
export const ground=(x:number,z:number):V3=>[x,fieldHeight(x,z),z];
export const MAIN:V3=[0,fieldHeight(0,.5)+.055,.5];
export const RUBY:V3=[.74,fieldHeight(.74,-.55)+.047,-.55];
const cl=(n:number)=>Math.max(0,Math.min(1,n));
const s=(f:number,a:number,b:number)=>M.smooth(cl((f-a)/(b-a)));
const v=(a:V3,b:V3,t:number):V3=>a.map((n,i)=>n+(b[i]-n)*t) as V3;
export const handAnchors=(f:number)=>{
 let diamond:V3=MAIN,ruby:V3=RUBY,bag:V3=[.72,1.46,.05];
 if(f<122)diamond=v([-.12,.28,.50],MAIN,s(f,GEM_EVENTS.plantStart,GEM_EVENTS.plantRest));
 else if(f>=GEM_EVENTS.mainPick&&f<332)diamond=v(MAIN,[-.12,1.52,.5],s(f,GEM_EVENTS.mainPick,GEM_EVENTS.mainHeld));
 else if(f>=332&&f<405)diamond=v([-.12,1.52,.5],[.05,1.22,-.10],s(f,GEM_EVENTS.passStart,GEM_EVENTS.engineerHeld));
 else if(f>=405&&f<472)diamond=[.05,1.22,-.10];
 else if(f>=472&&f<776)diamond=[.28,gemSeat('diamond'),.12];
 if(f>=GEM_EVENTS.rubyPick&&f<332)ruby=v(RUBY,[.89,1.42,-.55],s(f,GEM_EVENTS.rubyPick,GEM_EVENTS.rubyHeld));
 else if(f>=332&&f<472)ruby=[.89,1.42,-.55];
 else if(f>=472&&f<776)ruby=[.50,gemSeat('ruby'),.1];
 if(f>=776&&f<876){diamond=v([.72,1.27,.08],[-.28,1.31,-.28],s(f,802,835));ruby=[.18,gemSeat('ruby'),.12];}
 if(f>=926){diamond=[.82,1.35,-.62];ruby=[.27,gemSeat('ruby'),.15];}
 if(f>=472&&f<588)bag=v([.72,1.46,.05],[-.62,1.46,-.40],s(f,477,534));
 if(f>=926)bag=[-.65,1.46,-.40];
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
  add('arnold',-.66,.5,{mood:'sly',look:1,kneel:1-s(f,82,112),lean:18*(1-s(f,72,108)),right:f<86?h.diamond:v(MAIN,[-.20,1.05,.5],s(f,86,115)),prop:'pouch'});
  add('slack',.95,-.10,{mood:f<72?'calm':'sly',look:-1,head:-6,lean:-4,left:[.63,1.10,-.10]});
 } else if(beat==='journey'){
  const distance=s(f,122,249)*2.3,travel=distance-2.3;
  const walking=(id:Person,x:number,z:number,o:Partial<Pose>)=>{
   const xx=x+travel,stride=.25,phase=distance/(2*stride),stop=s(f,246,264);
   const feet=[0,.5].map((off,i)=>{const c=(phase+off)%1,local=c<.5?stride*.5-2*stride*c:-stride*.5+stride*M.smooth((c-.5)*2),y=c<.5?0:Math.sin((c-.5)*Math.PI*2)*.12;const fx=xx+local*(1-stop)+(i?1:-1)*.12*stop;return [fx,fieldHeight(fx,z)+y*(1-stop),z] as V3;}) as [V3,V3];
   add(id,xx,z,{...o,walk:phase*(1-stop),feet});
  };
  walking('arnold',-1.22,-.78,{mood:'sly',look:1,view:'side'});
  walking('slack',1.12,-1.12,{mood:'sly',look:-1});
  walking('investorA',-.58,.5,{mood:'eager',look:1,view:'side',kneel:s(f,250,270)});
  walking('investorB',1.22,-.55,{mood:'doubt',look:-1});
  walking('engineer',.05,-1.3,{mood:'calm',prop:'book'});
 } else if(['diamond','ruby','collect','expert'].includes(beat)){
  const reach=M.anticip(cl((f-270)/8),.08),reaction=M.spring(Math.max(0,f-291)/30,2.6,7);
  add('investorA',-.58,.5,{mood:f<291?'eager':'wow',kneel:1-s(f,282,303),lean:f<279?10*reach:-5*reaction,right:f<GEM_EVENTS.mainPick?v([-.20,.53,.5],MAIN,cl(reach)):f<366?h.diamond:v([-.12,1.52,.5],[-.23,1.28,.5],s(f,366,392)),look:1});
  add('investorB',1.22,-.55,{mood:f<323?'doubt':'eager',kneel:s(f,296,308)*(1-s(f,315,337)),lean:-4,left:f<296?[.88,1.05,-.55]:f<GEM_EVENTS.rubyPick?v([.88,1.05,-.55],RUBY,s(f,296,GEM_EVENTS.rubyPick)):h.ruby,look:-1});
  add('arnold',-1.55,-1.55,{mood:'sly',look:1,head:4});
  add('slack',1.50,-1.55,{mood:'sly',look:-1,left:[1.1,1.0,-1.55]});
  add('engineer',.05,-.55,{mood:f>=426?'approve':'calm',look:0,prop:f>=398?'lens':'book',left:f>=398?[-.02,1.29,.10]:[-.22,.90,-.55],right:f>=366?h.diamond:[.41,1.05,-.55],head:f>=426?8+9*Math.sin(Math.min(1,(f-426)/18)*Math.PI):8,lean:f>=426?-3:2});
 } else if(beat==='payout'||beat==='payoff'){
  const end=beat==='payoff',down=s(f,925,954);
  add('arnold',-.83,-.90,{mood:end?'pleased':f>532?'pleased':'sly',look:1,right:f>=503?h.bag:v([-.43,1.27,-.4],h.bag,s(f,486,503)),left:[-1.06,1.08,-.90],lean:-3});
  add('slack',.10,-.90,{mood:end?'pleased':'sly',look:-1,prop:'pouch',head:6,left:[-.12,1.12,-.90]});
  add('investorA',.92,-.90,{mood:end?'deflate':'eager',look:-1,right:end?h.diamond:f<=518?h.bag:v(h.bag,[1.35,1.13,-.90],s(f,518,537)),head:end?14*down:0,lean:end?8*down:0});
  add('investorB',1.65,-1.15,{mood:end?'deflate':'calm',look:-1,lean:end?-8*down:0,head:end?-12*down:0});
 } else if(beat==='investigate'||beat==='clue'||beat==='empty'){
  add('king',-.28,.62,{mood:f<635?'doubt':'calm',kneel:s(f,603,638),lean:15*s(f,603,638),look:1,right:f<674?v([-.15,1.05,.50],MAIN,s(f,609,644)):v(MAIN,[.48,.09,.70],s(f,686,718)),left:[-.52,.38,.62],prop:'lens'});
  if(beat!=='empty')add('engineer',1.15,-1.5,{mood:'doubt',look:-1,prop:'book',head:8});
 } else if(beat==='london'){
  add('arnold',-.65,-.9,{mood:'sly',look:1,right:f<802?v([-.2,1.12,-.3],[.72,1.27,.08],s(f,788,802)):h.diamond,prop:'pouch'});
  add('slack',.65,-.9,{mood:'pleased',look:-1,left:[.35,1.14,-.5]});
 }
 return list;
}
export const actorAt=(f:number,beat:Beat,id:Person)=>castAt(f,beat).find(p=>p.id===id);
