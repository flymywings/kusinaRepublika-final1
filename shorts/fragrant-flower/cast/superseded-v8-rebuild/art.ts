// V8 REBUILD (not the recovered original). Base: fragrant-flower/CharacterArt.tsx v2.
// Changes are the ones visible in Draft 1, which was rendered from approved V8: tapered necks, Rintaro's even head
// line and clean hair, Kaoruko's parted fringe and almond eyes, cafe clothes. Awaiting the user's approval.
// Frontal only. Units are metres, y up, soles at y=0. Shots may pose the rig but cannot change its proportions.
import {Pen,blobPts,headBlob,mul,thickAngle} from '../../../pipeline/kit/v1/look/toon';

export type Role='rintaro'|'kaoruko';
export type P=[number,number];
export type Outfit='school'|'cafe';
export type Eyes='lidded'|'almond'|'round'|'happy'|'closed'|'soft';
export type Mouth='flat'|'smile'|'small'|'slant'|'worried'|'o'|'full';
export interface Face {eyes?:Eyes;mouth?:Mouth;look?:P;brow?:number;tilt?:number;cheeks?:number;blush?:number;sweat?:boolean;cream?:boolean}
export interface Pose {
 role:Role;outfit?:Outfit;face?:Face;
 hands?:[P,P];elbows?:[P,P];feet?:[P,P];
 bow?:number;lean?:number;hunch?:number;
 prop?:'satchel'|'fork'|'tray'|'box'|'boxOpen';propAt?:P;
 menace?:number;hairFlow?:number;
}
export const RIG={
 rintaro:{height:190,hc:1.63,hw:.235,hh:.221,shoulder:1.34,hip:.80,collar:1.395,shoulderX:.174,neck:[.040,.064],armW:.030},
 kaoruko:{height:148,hc:1.25,hw:.215,hh:.203,shoulder:1.02,hip:.68,collar:1.082,shoulderX:.155,neck:[.034,.056],armW:.034},
} as const;
export const COLOR={
 rintaro:{skin:'#f5dac0',neck:'#edc7a3',hair:'#d9bf89',coat:'#303137',shirt:'#f5f2e9',shoe:'#25272d',metal:'#bfc5cd',button:'#ccb065',tee:'#e9e3d2',apron:'#55545b'},
 kaoruko:{skin:'#f9e3d3',neck:'#f0c7ad',hair:'#34303e',coat:'#b97d8e',shirt:'#f5f0ed',shoe:'#62443c',iris:'#6288ad',button:'#534651',pink:'#d9aaa2',belt:'#6e5248'},
} as const;
export const INK='#2c1d2b';
const LIGHT=-2.1;
const HEADS={rintaro:blobPts(0,0,headBlob(63,118,0),72),kaoruko:blobPts(0,0,headBlob(71,118,0),72)};
type G=CanvasRenderingContext2D;
export function shape(g:G,fill:string,path:()=>void,w=.012,ink=INK){g.beginPath();path();g.closePath();g.fillStyle=fill;g.fill();if(w){g.strokeStyle=ink;g.lineWidth=w;g.stroke();}}
export function line(g:G,c:string,w:number,pts:P[]){g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
export function curve(g:G,c:string,w:number,a:P,b:P,d:P){g.beginPath();g.moveTo(...a);g.quadraticCurveTo(...b,...d);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
export function dot(g:G,c:string,x:number,y:number,rx:number,ry=rx,w=0){shape(g,c,()=>g.ellipse(x,y,rx,ry,0,0,Math.PI*2),w);}
const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));

function drawFace(g:G,p:Pen,role:Role,f:Face,bow:number){
 const girl=role==='kaoruko',eyes=f.eyes??(girl?'almond':'lidded'),mouth=f.mouth??(girl?'small':'flat');
 const [lx,ly]=f.look??[0,0],c=f.cheeks??0,b=f.blush??0;
 g.save();g.translate(0,bow*30);g.scale(1,1-bow*.16);
 if(b>0){
  for(const q of [-1,1]){
   g.save();g.translate(q*62,36);g.scale(1,.62);
   const r=30+16*c,k=g.createRadialGradient(0,0,2,0,0,r);k.addColorStop(0,`rgba(235,92,96,${.85*b})`);k.addColorStop(1,'rgba(235,92,96,0)');
   g.fillStyle=k;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fill();g.restore();
   if(b>.45)for(const i of [-1,0,1])p.stroke([[q*62+i*11-3,41],[q*62+i*11+4,28]],3,'#c9575f');
  }
 }
 for(const q of [-1,1]){
  const x=q*(girl?32:31),y=5;
  if(eyes==='closed')p.stroke([[x-16,y+2],[x+16,y+2]],7,INK);
  else if(eyes==='happy')p.arc(x,y+7,17,11,205,335,7,INK);
  else if(eyes==='round'){
   p.ell(x,y+1,24,24,'#fffaf3',5);
   const ex=x+lx*10,ey=y+1+ly*10;
   if(girl){p.dot(ex,ey,10,COLOR.kaoruko.iris);p.dot(ex,ey,4.8,INK);p.dot(ex-3,ey-4,2.4,'#fff');}
   else p.dot(ex,ey,6,INK);
  }else if(eyes==='almond'){
   g.save();g.translate(x,y+3);g.rotate(q*.07);
   const path=()=>{g.beginPath();g.moveTo(-20,1);g.bezierCurveTo(-11,-19,10,-18,20,0);g.bezierCurveTo(9,14,-11,14,-20,1);g.closePath();};
   path();g.fillStyle='#fffaf3';g.fill();g.save();g.clip();
   p.dot(lx*8,ly*6,10,COLOR.kaoruko.iris);p.dot(lx*8,ly*6,4.6,INK);p.dot(lx*8-3,ly*6-4,2.5,'#fff');g.restore();
   path();g.strokeStyle=INK;g.lineWidth=4;g.stroke();g.restore();
  }else if(eyes==='soft'){
   // Released lid: still Rintaro's eye, with a light in it.
   p.ell(x+lx*4,y+4,15,15,INK,0,0,180);p.dot(x+lx*4-4,y+9,3.6,'#fffaf3');p.arc(x,y+5,18,7,200,340,6,INK);
  }else{p.ell(x+lx*4,y+5,15,11,INK,0,0,180);p.stroke([[x-19,y],[x+18,y]],8,INK);}
  if(!girl){
   const by=(eyes==='round'?-51:-40)+(f.brow??0),t=(f.tilt??0)*q;
   p.poly([[x-19,by+1+t],[x-17,by-5+t],[x+17,by-2-t],[x+18,by+2-t]],INK,0);
  }
 }
 const my=44+c*9;
 if(mouth==='smile')p.arc(0,41,20,10,12,168,6,INK);
 else if(mouth==='small')p.arc(0,43,15,5,12,168,5,INK);
 else if(mouth==='slant')p.stroke([[-13,49],[12,46]],6,INK);
 else if(mouth==='worried')p.stroke([[-12,49],[0,46],[12,49]],5,INK);
 else if(mouth==='o')p.ell(0,49,8,10,INK,0);
 else if(mouth==='full'){
  p.stroke([[-11,my+4],[-6,my],[0,my+3],[6,my],[11,my+4]],5,INK);
  for(const q of [-1,1])p.arc(q*25,my+1,9,17,q<0?110:-70,q<0?250:70,4,INK);
 }else p.stroke([[-12,47],[13,47]],6,INK);
 if(f.cream){
  p.ell(20,my-11,11,8,'#fffdf4',2.5);p.ell(27,my-17,6,5,'#fffdf4',0);
  for(const [x,y] of [[-34,my+14],[-27,my+21],[-43,my+6],[38,my+17]])p.dot(x,y,3.4,'#b9773f');
 }
 g.restore();
 if(f.sweat){g.fillStyle='#8fd0ee';g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.moveTo(88,-46);g.bezierCurveTo(112,-8,68,-6,88,-46);g.fill();g.stroke();}
}

function legs(g:G,role:Role,feet?:[P,P]){
 const girl=role==='kaoruko',d=COLOR[role],r=RIG[role];
 [-1,1].forEach((q,i)=>{
  const x=q*(girl?.085:.105),a:P=feet?.[i]??[q*(girl?.094:.125),0],knee:P=[feet?(x+a[0])/2+q*.012:x+q*.012,.36+a[1]*.5];
  curve(g,INK,girl?.045:.047,[x,r.hip],knee,[a[0],a[1]+.067]);
  if(girl)curve(g,'#4e4249',.032,[x,.46],[feet?(x+a[0])/2:x,.26+a[1]*.5],[a[0],a[1]+.069]);
  g.save();g.translate(a[0],a[1]);
  shape(g,d.shoe,()=>{g.moveTo(-.035,.076);g.quadraticCurveTo(0,.086,.035,.067);g.lineTo(.044,.019);g.lineTo(-.049,.005);g.quadraticCurveTo(-.065,.017,-.035,.076)},.010);
  if(girl)line(g,'#947062',.006,[[-.029,.050],[.029,.054]]);
  g.restore();
 });
}
function neck(g:G,role:Role){
 const r=RIG[role],[top,base]=r.neck,y0=r.hc-r.hh+.03,y1=r.collar;
 shape(g,COLOR[role].neck,()=>{g.moveTo(-top,y0);g.quadraticCurveTo(-top+.002,y1+.03,-base,y1-.006);g.quadraticCurveTo(-base*.35,y1-.03,0,y1-.046);g.quadraticCurveTo(base*.35,y1-.03,base,y1-.006);g.quadraticCurveTo(top-.002,y1+.03,top,y0)},.006);
}
function boyBody(g:G,outfit:Outfit){
 const d=COLOR.rintaro;
 const body=(fill:string)=>shape(g,fill,()=>{g.moveTo(-.064,1.395);g.bezierCurveTo(-.18,1.37,-.215,1.25,-.213,1.01);g.quadraticCurveTo(-.23,.76,-.16,.75);g.lineTo(-.045,.82);g.lineTo(.045,.82);g.lineTo(.17,.75);g.quadraticCurveTo(.23,.78,.213,1.01);g.bezierCurveTo(.215,1.25,.18,1.37,.064,1.395)},.014);
 if(outfit==='cafe'){
  body(d.tee);neck(g,'rintaro');
  for(const q of [-1,1]){curve(g,d.apron,.024,[q*.10,1.365],[q*.135,1.27],[q*.112,1.14]);}
  shape(g,d.apron,()=>{g.moveTo(-.117,1.16);g.lineTo(.117,1.16);g.lineTo(.128,.99);g.lineTo(.178,.69);g.quadraticCurveTo(0,.655,-.178,.69);g.lineTo(-.128,.99)},.011);
  shape(g,'#4a4950',()=>g.roundRect(-.077,.83,.154,.10,.015),.006);
  line(g,'#6d6b74',.005,[[-.128,.99],[.128,.99]]);
  return;
 }
 body(d.coat);
 shape(g,d.shirt,()=>{g.moveTo(-.067,1.39);g.lineTo(.070,1.39);g.lineTo(.072,.78);g.lineTo(.004,.80);g.lineTo(-.067,.78)},.006);
 neck(g,'rintaro');
 line(g,'#bfbcb5',.005,[[.008,1.31],[.012,.84]]);
 for(const q of [-1,1])shape(g,d.coat,()=>{g.moveTo(q*.035,1.40);g.lineTo(q*.070,1.435);g.lineTo(q*.111,1.389);g.lineTo(q*.090,1.31);g.lineTo(q*.074,.86);g.lineTo(q*.048,.83);g.lineTo(q*.058,1.33)},.008);
 for(const y of [1.302,1.18,1.055,.93,.815])dot(g,d.button,-.083,y,.010,.012,.002);
 line(g,'#181b23',.007,[[.112,1.17],[.185,1.17]]);
 curve(g,'#33272b',.033,[-.177,1.366],[-.219,1.19],[-.211,.983]);
 curve(g,'#85634c',.021,[-.177,1.366],[-.219,1.19],[-.211,.983]);
}
function girlBody(g:G,outfit:Outfit){
 const d=COLOR.kaoruko;
 const top=(fill:string)=>shape(g,fill,()=>{g.moveTo(-.061,1.077);g.bezierCurveTo(-.19,1.06,-.18,.91,-.168,.75);g.quadraticCurveTo(0,.67,.168,.75);g.bezierCurveTo(.18,.91,.19,1.06,.061,1.077)},.013);
 const skirt=(fill:string)=>shape(g,fill,()=>{g.moveTo(-.135,.75);g.lineTo(.135,.75);g.lineTo(.231,.427);g.quadraticCurveTo(0,.36,-.231,.427)},.012);
 if(outfit==='cafe'){
  top(d.shirt);neck(g,'kaoruko');
  for(const q of [-1,1])curve(g,d.pink,.027,[q*.100,1.05],[q*.128,.90],[q*.072,.758]);
  skirt(d.pink);
  shape(g,d.belt,()=>g.roundRect(-.139,.728,.278,.044,.008),.008);
  shape(g,'#c9a35c',()=>g.roundRect(-.029,.726,.058,.048,.008),.006);
  dot(g,d.belt,0,.75,.014,.011);
  return;
 }
 top(d.coat);skirt(d.coat);
 for(const x of [-.15,-.075,0,.075,.15])line(g,'#9e6678',.006,[[x*.65,.71],[x,.416]]);
 curve(g,'#654451',.009,[-.215,.445],[0,.39],[.215,.445]);
 neck(g,'kaoruko');
 shape(g,d.shirt,()=>{g.moveTo(-.062,1.092);g.lineTo(-.205,1.019);g.lineTo(0,.882);g.lineTo(.205,1.019);g.lineTo(.062,1.092);g.quadraticCurveTo(.04,1.03,0,.994);g.quadraticCurveTo(-.04,1.03,-.062,1.092)},.008);
 line(g,'#65606a',.005,[[-.183,1.014],[0,.902],[.183,1.014]]);
 for(const q of [-1,1])shape(g,'#38303b',()=>{g.moveTo(0,.886);g.quadraticCurveTo(q*.078,.899,q*.068,.846);g.quadraticCurveTo(q*.025,.843,0,.886)},.004);
 line(g,'#38303b',.012,[[0,.885],[-.020,.819]]);line(g,'#38303b',.012,[[0,.885],[.029,.829]]);
 for(const x of [-.118,.118])dot(g,d.button,x,.959,.007);
}
function girlBackHair(g:G,flow:number){
 shape(g,COLOR.kaoruko.hair,()=>{
  g.moveTo(-.224,1.32);
  g.bezierCurveTo(-.31,1.18,-.25,1.06,-.302-flow*.2,.93);
  g.bezierCurveTo(-.38-flow*.3,.77+flow*.2,-.25-flow*.3,.75+flow*.2,-.31-flow*.32,.61+flow*.32);
  g.quadraticCurveTo(-.34-flow*.3,.53+flow*.36,-.255-flow*.2,.56+flow*.3);
  g.quadraticCurveTo(-.19,.52+flow*.2,-.16,.59+flow*.1);g.quadraticCurveTo(0,.49+flow*.1,.18,.56+flow*.1);
  g.quadraticCurveTo(.29+flow*.2,.50+flow*.3,.32+flow*.32,.58+flow*.34);
  g.quadraticCurveTo(.25+flow*.3,.55+flow*.3,.285+flow*.25,.70+flow*.22);
  g.bezierCurveTo(.37+flow*.2,.88,.265,.95,.285,1.08);g.quadraticCurveTo(.28,1.27,.224,1.34);g.quadraticCurveTo(0,1.48,-.224,1.32);
 },.012);
 for(const q of [-1,1])curve(g,'#514958',.007,[q*.20,1.28],[q*(.32+flow*.1),.86],[q*(.22+flow*.2),.60+flow*.25]);
}
// [valley, tip] pairs from screen right to left. The long gap left of centre is the V8 part.
const FRINGE:[P,P][]=[[[.180,1.356],[.186,1.287]],[[.150,1.338],[.128,1.277]],[[.104,1.328],[.074,1.279]],[[.053,1.326],[.013,1.272]],[[.004,1.320],[-.041,1.287]],[[-.036,1.336],[-.073,1.304]],[[-.068,1.368],[-.124,1.295]],[[-.124,1.345],[-.165,1.284]],[[-.172,1.338],[-.197,1.275]]];
function girlFrontHair(g:G){
 const d=COLOR.kaoruko;
 shape(g,d.hair,()=>{
  g.moveTo(-.233,1.245);g.bezierCurveTo(-.268,1.405,-.142,1.474,0,1.474);g.bezierCurveTo(.145,1.474,.266,1.405,.233,1.245);
  let last:P=[.233,1.245];
  for(const [v,t] of FRINGE){
   g.quadraticCurveTo((last[0]+v[0])/2+.004,v[1]-.032,...v);
   g.quadraticCurveTo(v[0]+.004,(v[1]+t[1])/2-.006,...t);last=t;
  }
  g.quadraticCurveTo(-.205,1.30,-.233,1.245);
 },.009);
 curve(g,'#1f1d27',.011,[-.137,1.413],[0,1.478],[.137,1.413]);
 for(const [x,end] of [[-.125,1.318],[-.085,1.345],[-.02,1.325],[.03,1.318],[.085,1.312],[.135,1.31]])curve(g,'#4c4557',.003,[x*.35-.02,1.43],[x*.9,1.385],[x,end]);
 for(const q of [-1,1]){
  shape(g,d.hair,()=>{g.moveTo(q*.185,1.351);g.quadraticCurveTo(q*.27,1.195,q*.205,1.041);g.quadraticCurveTo(q*.165,.98,q*.147,1.012);g.quadraticCurveTo(q*.222,1.14,q*.167,1.30)},.007);
  curve(g,'#554c60',.005,[q*.204,1.32],[q*.231,1.16],[q*.166,1.033]);
 }
}
function boyHair(g:G){
 const d=COLOR.rintaro,hc=RIG.rintaro.hc;
 shape(g,d.hair,()=>{g.moveTo(-.239,hc+.015);g.lineTo(-.265,1.77);g.lineTo(-.218,1.756);g.lineTo(-.279,1.813);g.lineTo(-.194,1.797);g.lineTo(-.226,1.857);g.lineTo(-.144,1.824);g.lineTo(-.154,1.884);g.lineTo(-.070,1.848);g.lineTo(-.025,1.894);g.lineTo(-.024,1.849);g.lineTo(.069,1.891);g.lineTo(.051,1.848);g.lineTo(.169,1.871);g.lineTo(.129,1.824);g.lineTo(.251,1.833);g.lineTo(.199,1.781);g.lineTo(.264,1.776);g.lineTo(.234,hc+.012);g.lineTo(.195,hc+.113);g.quadraticCurveTo(.06,hc+.17,-.065,hc+.152);g.quadraticCurveTo(-.18,hc+.148,-.204,hc+.085)},.010);
 for(const q of [-1,1]){dot(g,d.metal,q*.245,hc-.047,.006,.006,.002);g.beginPath();g.ellipse(q*.246,hc-.071,.012,.018,0,0,Math.PI*2);g.strokeStyle=d.metal;g.lineWidth=.006;g.stroke();}
}
export function cakeSlice(g:G,x:number,y:number,s=1){
 g.save();g.translate(x,y);g.scale(s,s);
 shape(g,'#e8b56c',()=>g.roundRect(-.07,0,.14,.085,.008),.007);
 line(g,'#d8677c',.018,[[-.064,.04],[.064,.04]]);
 shape(g,'#fff6e6',()=>g.roundRect(-.074,.078,.148,.03,.014),.007);
 dot(g,'#d8344c',0,.128,.027,.027,.006);
 g.restore();
}
function drawProp(g:G,kind:NonNullable<Pose['prop']>,at:P){
 g.save();g.translate(at[0],at[1]);
 if(kind==='satchel'){
  line(g,INK,.013,[[-.061,.083],[-.055,.112],[.055,.112],[.061,.083]]);
  shape(g,'#754e46',()=>g.roundRect(-.18,-.129,.36,.212,.016),.011);
  shape(g,'#80594e',()=>g.roundRect(-.18,-.013,.362,.098,.012),.008);
  for(const x of [-.119,.119])line(g,'#523c39',.018,[[x,.021],[x,-.096]]);
  shape(g,'#b7b7bc',()=>g.rect(-.018,-.03,.036,.029),.003);
 }else if(kind==='fork'){
  g.rotate(.45);line(g,INK,.020,[[0,-.03],[0,.11]]);line(g,'#cfd5db',.010,[[0,-.03],[0,.11]]);
  for(const x of [-.018,0,.018])line(g,'#cfd5db',.008,[[x,.105],[x,.155]]);
  shape(g,'#fff1dc',()=>g.roundRect(-.026,.13,.052,.04,.01),.006);
 }else if(kind==='tray'){
  shape(g,'#b9bfc3',()=>g.roundRect(-.22,-.012,.44,.032,.014),.009);cakeSlice(g,-.07,.02,.8);cakeSlice(g,.09,.02,.8);
 }else{
  const w=.15,h=.15;
  shape(g,'#f8eee0',()=>g.roundRect(-w,0,2*w,h,.012),.011);
  if(kind==='boxOpen'){
   shape(g,'#ecdcc8',()=>{g.moveTo(-w,h);g.lineTo(w,h);g.lineTo(w*.9,h+.15);g.lineTo(-w*.9,h+.15)},.009);
   cakeSlice(g,-.06,h-.035,.85);cakeSlice(g,.07,h-.035,.85);
   shape(g,'#f8eee0',()=>g.rect(-w,0,2*w,h-.035),.011);
   line(g,'#d8677c',.022,[[-w,h*.36],[w,h*.36]]);
  }else{
   line(g,'#d8677c',.028,[[0,0],[0,h]]);line(g,'#d8677c',.022,[[-w,h*.5],[w,h*.5]]);
   for(const q of [-1,1])shape(g,'#e58a9c',()=>{g.moveTo(0,h);g.quadraticCurveTo(q*.09,h+.085,q*.085,h+.005);g.quadraticCurveTo(q*.04,h-.01,0,h)},.007);
  }
 }
 g.restore();
}

/** How far a bow or hunch lowers the head centre. */
export function headDrop(role:Role,bow=0,hunch=0){const r=RIG[role];return (r.shoulder-r.hip)*.38*bow+.14*bow+.055*hunch;}

export function drawCharacter(g:G,pose:Pose){
 const {role,outfit='cafe',face={},bow=0,hunch=0,lean=0,hairFlow=0,menace=0}=pose;
 const r=RIG[role],d=COLOR[role],girl=role==='kaoruko',drop=headDrop(role,bow,hunch);
 g.save();g.lineJoin='round';g.lineCap='round';
 legs(g,role,pose.feet);
 g.translate(0,r.hip);g.rotate(-lean);g.translate(0,-r.hip);
 if(girl){g.save();g.translate(0,-drop*.6);girlBackHair(g,hairFlow);g.restore();}
 if(!girl&&outfit==='school'){shape(g,'#705346',()=>g.roundRect(-.256,.91,.105,.34,.018),.009);}
 // A frontal bow foreshortens the torso over the hips. Head size never changes.
 const ky=1-.38*bow-.055*hunch/(r.shoulder-r.hip);
 g.save();g.translate(0,r.hip);g.scale(1+.06*bow,ky);g.translate(0,-r.hip);
 if(girl)girlBody(g,outfit);else boyBody(g,outfit);
 g.restore();
 const sy=r.hip+(r.shoulder-r.hip)*ky;
 [-1,1].forEach((q,i)=>{
  const sx=q*(r.shoulderX-.014*hunch),hand:P=pose.hands?.[i]??(girl?[q*.055,.644]:[q*.286,.845]);
  const elbow:P=pose.elbows?.[i]??(pose.hands?[(sx+hand[0])/2+q*.075,(sy+hand[1])/2-.05]:girl?[q*.18,.73]:[q*.27,1.065]);
  curve(g,INK,r.armW,[sx,sy],elbow,hand);
  if(girl){
   curve(g,outfit==='school'?COLOR.kaoruko.coat:COLOR.kaoruko.shirt,.021,[sx,sy],elbow,hand);
   // Ruffled cuff at the shoulder, as in the official cafe still.
   if(outfit==='cafe')shape(g,COLOR.kaoruko.shirt,()=>{g.moveTo(sx-q*.03,sy+.02);g.quadraticCurveTo(sx+q*.06,sy+.03,sx+q*.065,sy-.045);g.quadraticCurveTo(sx+q*.04,sy-.028,sx+q*.025,sy-.062);g.quadraticCurveTo(sx,sy-.035,sx-q*.025,sy-.055)},.007);
  }else if(outfit==='cafe'){
   const m:P=[sx+(elbow[0]-sx)*.36,sy+(elbow[1]-sy)*.36];
   line(g,INK,.068,[[sx,sy],m]);line(g,COLOR.rintaro.tee,.052,[[sx,sy],m]);
  }
  if(!(girl&&pose.prop==='box'))dot(g,INK,hand[0],hand[1],.023);
 });
 if(pose.prop)drawProp(g,pose.prop,pose.propAt??[0,.544]);
 if(girl&&pose.prop==='box')for(const [x,y] of pose.hands??[])dot(g,INK,x,y,.023);

 g.save();g.translate(0,-drop);
 if(!girl)for(const q of [-1,1])dot(g,d.skin,q*.235,r.hc-.025,.030,.052,.007);
 g.save();g.translate(0,r.hc);g.scale(r.hw/118,-r.hh/118);
 const p=new Pen(g),c=clamp(face.cheeks??0);
 const points=c?HEADS[role].map(([x,y])=>{const k=Math.exp(-(((y-42)/40)**2));return[x*(1+.17*c*k),y+c*5*k] as P;}):HEADS[role];
 p.shadedFill(points,d.skin,mul(d.skin,[.96,.86,.84]),LIGHT,118);
 p.inkRing(points,girl?10.5:5.6,thickAngle(LIGHT),girl?.45:.86,INK);
 drawFace(g,p,role,face,bow);g.restore();
 if(girl)girlFrontHair(g);else boyHair(g);
 g.restore();
 g.restore();

 if(menace>0){
  // His imagined self: the same drawing, swallowed by back-light. Only the lids read.
  g.save();g.globalCompositeOperation='source-atop';
  const k=g.createLinearGradient(0,.6,0,1.95);k.addColorStop(0,`rgba(10,14,36,${.96*menace})`);k.addColorStop(1,`rgba(22,32,68,${.84*menace})`);
  g.fillStyle=k;g.fillRect(-1,-.2,2,2.4);g.restore();
  for(const q of [-1,1]){
   const x=q*31*r.hw/118,y=r.hc-drop-5*r.hh/118;
   shape(g,`rgba(206,232,255,${menace})`,()=>{g.moveTo(x-.034,y+.002);g.lineTo(x+.034,y+.002);g.quadraticCurveTo(x,y-.03,x-.034,y+.002)},0);
   line(g,`rgba(8,10,26,${menace})`,.015,[[x-.037,y+.004],[x+.037,y+.004]]);
   dot(g,`rgba(8,10,26,${menace})`,x,y-.006,.006);
  }
 }
}
