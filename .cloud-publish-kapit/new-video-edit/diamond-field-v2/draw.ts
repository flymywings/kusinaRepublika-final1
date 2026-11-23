import {Pen,INK,blobPts,headBlob,mul,mix,thickAngle} from '../bridge-recreation/toon';
import {Person} from './contract';
import {Pose} from './acting';
export type P2=[number,number];
export const DESIGNS:Record<Person,{coat:string;skin:string;hat:string;hair:string;seed:number;stout?:boolean;slim?:boolean}>={
 arnold:{coat:'#ad5736',skin:'#ffe2c2',hat:'#a08258',hair:'#644632',seed:12},
 slack:{coat:'#728047',skin:'#f5c9a0',hat:'#72734e',hair:'#42352c',seed:7},
 investorA:{coat:'#324e73',skin:'#ffe7cb',hat:'#2f3447',hair:'#513a32',seed:23,stout:true},
 investorB:{coat:'#863d52',skin:'#f5d9bf',hat:'#4f3445',hair:'#45302d',seed:18,slim:true},
 engineer:{coat:'#b69767',skin:'#f9ddba',hat:'#bfa777',hair:'#7d6d58',seed:9},
 king:{coat:'#58778a',skin:'#fbe7ce',hat:'#657d88',hair:'#594c42',seed:31,slim:true},
};
const curve=(a:P2,k:P2,b:P2)=>Array.from({length:19},(_,i):P2=>{let t=i/18,q=1-t;return[q*q*a[0]+2*q*t*k[0]+t*t*b[0],q*q*a[1]+2*q*t*k[1]+t*t*b[1]]});
export function drawPerson(p:Pen,pose:Pose,hands:{left?:P2;right?:P2;feet?:[P2,P2]}={}){
 const d=DESIGNS[pose.id],HH=222,W=236,cx=300,sole=975,light=-2.1;
 const side=pose.view==='side',rear=pose.view==='rear',face=pose.look;
 const a=d.stout?112:d.slim?80:94,aw=side?a*.75:a;
 const k=pose.kneel,step=pose.walk?Math.sin(pose.walk*Math.PI*2):0;
 const hipY=sole-1.4*HH+k*HH*1.2+Math.abs(step)*12+pose.bob*HH;
 const chin=hipY-1.1*HH,cy=chin-HH/2,lean=pose.lean*Math.PI/180;
 const tp=blobPts(cx,hipY-.55*HH,{a:aw,b:.60*HH,nTop:2.05,nBot:2.55,egg:.13,asym:.04*face,rot:0,noise:.005,seed:d.seed});
 const transform=(pt:P2):P2=>[cx+(pt[0]-cx)*Math.cos(lean)-(pt[1]-hipY)*Math.sin(lean),hipY+(pt[0]-cx)*Math.sin(lean)+(pt[1]-hipY)*Math.cos(lean)];
 // Soles stay grounded while folded knees lower the pelvis.
 for(const s of [-1,1]){
  const foot:P2=hands.feet?.[s<0?0:1]||(k>.1?[cx+s*(58+26*k),sole-8]:[cx+s*54+step*s*28,sole-8-Math.max(0,step*s)*25]);
  const knee:P2=[cx+s*(40+54*k),hipY+(sole-hipY)*.55];
  p.stroke(curve([cx+s*36,hipY-15],knee,foot),13.6,mix(d.coat,INK,.72));
  p.stroke([[foot[0]-s*6,foot[1]],[foot[0]+s*27,foot[1]]],18,INK);
 }
 const shoulders=[transform([cx-aw*.83,chin+25]),transform([cx+aw*.83,chin+25])];
 const ends:P2[]=[hands.left||transform([cx-aw-25,hipY-25]),hands.right||transform([cx+aw+25,hipY-25])];
 p.rot=[lean,cx,hipY];p.gradFill(tp,d.coat,mul(d.coat,[.64,.66,.74]),light);p.inkRing(tp,12,thickAngle(light));
 p.clip(tp,()=>{
  p.poly([[cx-28,chin-10],[cx+27,chin-10],[cx+17,hipY-45],[cx-17,hipY-45]],pose.id==='arnold'?'#d5b77e':'#eee4cf',0);
  p.poly([[cx-62,chin-5],[cx-12,chin+68],[cx-39,chin+97],[cx+5,hipY-32]],mul(d.coat,[.77,.79,.87]),3);
  if(pose.id==='investorA'||pose.id==='investorB')p.poly([[cx-12,chin+36],[cx+12,chin+36],[cx+7,chin+58],[cx+17,chin+106],[cx,chin+124],[cx-10,chin+62]],'#403041',2);
  if(pose.id==='arnold'||pose.id==='slack'){p.poly([[cx+25,hipY-86],[cx+68,hipY-82],[cx+61,hipY-41],[cx+25,hipY-45]],mul(d.coat,[.81,.80,.80]),3);p.stroke([[cx+32,hipY-74],[cx+54,hipY-53]],3,'#c3a57a');}
  for(let i=0;i<3;i++)p.dot(cx+25,chin+100+i*43,4,'#c7ad75');
  if(rear)p.stroke([[cx,chin+10],[cx,hipY-15]],3,mul(d.coat,[.7,.7,.8]));
 });p.rot=null;
 for(let i=0;i<2;i++){
  const sh=shoulders[i],e=ends[i],sx=i===0?-1:1;
  p.stroke(curve(sh,[(sh[0]+e[0])*.5+sx*30,(sh[1]+e[1])*.5+25],e),12.3,mix(d.coat,INK,.55));p.dot(e[0],e[1],13);
 }
 if(pose.prop==='book'){
  const [x,y]=ends[0];p.poly([[x-34,y-48],[x+34,y-43],[x+29,y+39],[x-37,y+32]],'#e4d4a8',7);p.stroke([[x-26,y-40],[x-30,y+27]],4,'#87755b');for(let n=0;n<3;n++)p.stroke([[x-15,y-24+n*16],[x+20,y-21+n*16]],3,'#8c805f');p.dot(x,y+24,11);
 }
 if(pose.prop==='pouch'){
  const [x,y]=ends[0];p.ell(x,y+43,37,45,'#a58a51',7);p.stroke([[x-18,y+7],[x+18,y+7]],8);p.arc(x,y-1,17,13,180,360,5);p.dot(x,y,12);
 }
 const pivot=transform([cx,chin]),ha=(pose.lean+pose.head)*Math.PI/180;
 p.rot=[ha,cx,chin,pivot[0]-cx,pivot[1]-chin];
 const H=headBlob(d.seed,side?105:118,face),hp=blobPts(cx,cy,H);
 p.shadedFill(hp,d.skin,mul(d.skin,[.96,.86,.84]),light,H.a);p.inkRing(hp,12,thickAngle(light));
 p.arc(cx,cy-55,H.a*.89,H.b*.52,182,350,23,d.hair);
 const brimY=cy-H.b*.51;
 if(pose.id==='arnold'){
  p.poly([[cx-91,brimY],[cx-79,brimY-92],[cx-15,brimY-80],[cx+16,brimY-98],[cx+70,brimY-78],[cx+87,brimY+1]],d.hat,9);
  p.ell(cx+10,brimY+3,151,18,d.hat,9);p.stroke([[cx-78,brimY-18],[cx+78,brimY-16]],12,'#695039');p.stroke([[cx+43,brimY-73],[cx+53,brimY-58],[cx+66,brimY-68]],4,'#d7bf90');
 }else if(pose.id==='investorA'||pose.id==='investorB'){
  const tall=pose.id==='investorB'?110:80;
  p.poly([[cx-83,brimY],[cx-70,brimY-tall],[cx+62,brimY-tall+4],[cx+80,brimY]],d.hat,9);p.stroke([[cx-77,brimY-15],[cx+77,brimY-15]],12,pose.id==='investorB'?'#ab7471':'#77728b');p.ell(cx,brimY+1,115,15,d.hat,8);
 }else{
  p.ell(cx,brimY-18,93,47,d.hat,9);p.ell(cx+12*face,brimY+12,pose.id==='slack'?109:133,15,d.hat,8);p.stroke([[cx-77,brimY-1],[cx+76,brimY]],10,pose.id==='king'?'#394c5b':'#79745a');
 }
 if(!rear){
  const fx=cx+face*(side?41:18),ey=cy+4,b=pose.blink,m=pose.mood;
  for(const q of [-1,1]){
   const ex=fx+q*(side?24:31),look=face*4;
   if(b>.8)p.stroke([[ex-15,ey],[ex+15,ey]],8);
   else if(m==='inspect'){p.ell(ex,ey+1,18,17,'#fffaf0',5);p.dot(ex+(pose.gaze?.[0]??face*5),ey+(pose.gaze?.[1]??0),7);}
   else if(m==='eager'){p.ell(ex,ey+1,18,18,'#fffaf0',5);p.dot(ex+look,ey+2,7);}
   else if(m==='wow'){p.ell(ex,ey,24,25,'#fffaf0',6);p.dot(ex+look,ey+3,7);}
   else if(m==='pleased'||m==='approve')p.arc(ex,ey+8,17,12,205,335,7);
   else {p.ell(ex+look,ey+5,15,b?4:11,INK,0,0,180);p.stroke([[ex-18,ey],[ex+18,ey]],8);}
   const browY=ey-44+(m==='deflate'?q*7:m==='doubt'?q*10:m==='wow'?-12:0);
   p.stroke([[ex-18,browY+(m==='sly'?-q*3:0)],[ex+17,browY+q*5]],9);
  }
  if(pose.id==='investorA')for(const q of [-1,1])p.ell(fx+q*19,cy+35,26,9,'#513a32',0,0,360,q*-12);
  if(pose.id==='king')p.stroke([[fx-18,cy+56],[fx+20,cy+51]],7,'#594c42');
  else if(m==='wow')p.ell(fx,cy+50,18,24,'#5a1e28',7);
  else if(m==='eager'||m==='pleased'){p.ell(fx,cy+44,27,17,'#5a1e28',5,0,180);p.stroke([[fx-22,cy+47],[fx+22,cy+47]],6,'#fff8ed');}
  else if(m==='inspect')p.stroke([[fx-13,cy+49],[fx+13,cy+47]],6);
  else if(m==='deflate')p.arc(fx,cy+64,22,12,205,335,7);
  else if(pose.id==='engineer'&&pose.prop==='lens'&&m==='calm')p.stroke([[fx-10,cy+48],[fx+13,cy+50]],7);
  else p.arc(fx+3,cy+43,22,10,10,155,7);
  if(side)p.stroke([[cx+face*98,cy+15],[cx+face*110,cy+25],[cx+face*99,cy+28]],5);
 }p.rot=null;
 // A held lens is in front of the face, not erased by the head fill.
 if(pose.prop==='lens'){
  const [x,y]=ends[0];p.stroke([[x,y],[x+15,y-26]],11);p.ell(x+31,y-52,30,32,'#c6dfdb77',7);p.arc(x+31,y-52,21,23,210,280,4,'#ffffffaa');p.dot(x,y,12);
 }
}


