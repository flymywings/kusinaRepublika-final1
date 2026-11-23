// Cast redesign study. V8 stays locked in ../v8 until the user replaces it.
//   'rick'  = the measured construction in upstream/references/reports/characters.md, followed closely.
//   'ours'  = the same fundamentals, plus our signature: hair that breaks the bean, cel bands, coloured hair ink,
//             and eyes that only show colour when a character truly sees someone.
// Units are millimetres, y down, soles at y = 0. u = 1% of head width, as in the report.
import {Pen,INK,blobPts,thickAngle,mul,mix,type Blob} from '../../../../pipeline/kit/v1/look/toon';

export type Style='rick'|'ours';
export type Role='rintaro'|'kaoruko';
type P=[number,number];
export type Eyes='lid'|'dot'|'shock'|'happy'|'shut';
export type Mouth='dash'|'smirk'|'smile'|'wave'|'o'|'O'|'teeth'|'full'|'laugh';
export interface Face {eyes?:Eyes;open?:number;blink?:number;look?:number;brow?:[number,number];mouth?:Mouth;blush?:number;cheeks?:number;sweat?:boolean;cream?:boolean}
export interface Pose {style:Style;role:Role;face?:Face;tilt?:number;hands?:[P,P];satchel?:boolean}

const LIGHT=-2*Math.PI/3,THICK=thickAngle(LIGHT);
const CLOTH:[number,number,number]=[.64,.66,.74],SKIN_SHADE:[number,number,number]=[.96,.86,.84];
// Skin and costume colours are V8's. The user rejected a skin change.
export const C={
 rintaro:{skin:'#f5dac0',hair:'#d9bf89',hairDark:'#b8905c',hairLight:'#f4e4b4',hairInk:'#6b4632',coat:'#34353f',iris:'#8a6038',shoe:'#2a2730'},
 kaoruko:{skin:'#f9e3d3',hair:'#3a3446',hairDark:'#27212f',hairLight:'#8d7aa8',hairInk:'#191322',coat:'#bd7b8d',iris:'#4f86c6',shoe:'#6b4436'},
};
export const BUILD={
 rintaro:{total:1860,a:282,b:261,legs:755,tw:196,seed:63,egg:-.14,top:1.72,bot:2.3,asym:.06,rot:-.012},
 kaoruko:{total:1472,a:247,b:228,legs:565,tw:160,seed:71,egg:-.10,top:1.85,bot:2.25,asym:-.035,rot:.01},
};
export function metrics(style:Style,role:Role){
 const b=BUILD[role],hh=2*b.b,u=b.a/50,ours=style==='ours';
 const hc=-(b.total-b.b)-(ours?(role==='rintaro'?38:22):0),chin=hc+b.b;
 return {...b,hh,u,hc,chin,torsoBot:-b.legs,torsoTop:ours?chin+(role==='rintaro'?14:4):chin-.25*hh};
}

const smooth=(pts:P[],closed=true,n=8):P[]=>{
 const out:P[]=[],L=pts.length,at=(i:number)=>closed?pts[(i+L)%L]:pts[Math.max(0,Math.min(L-1,i))];
 for(let i=0;i<(closed?L:L-1);i++){
  const a=at(i-1),b=at(i),c=at(i+1),d=at(i+2);
  for(let k=0;k<n;k++){
   const t=k/n,q=(j:0|1)=>.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(-a[j]+3*b[j]-3*c[j]+d[j])*t*t*t);
   out.push([q(0),q(1)]);
  }
 }
 if(!closed)out.push(pts[L-1]);
 return out;
};
/** Straight-ish spikes with a slight inward curve, so they read as tufts and not a saw. */
const tufts=(pts:P[],bend:number,closed=true):P[]=>pts.flatMap((a,i)=>{
 if(!closed&&i===pts.length-1)return [a];
 const b=pts[(i+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1],out:P[]=[];
 for(let k=0;k<6;k++){const t=k/6,o=4*t*(1-t)*bend;out.push([a[0]+dx*t-dy*o,a[1]+dy*t+dx*o]);}
 return out;
});
const quad=(a:P,k:P,b:P):P[]=>Array.from({length:13},(_,i)=>{const t=i/12,s=1-t;return[s*s*a[0]+2*s*t*k[0]+t*t*b[0],s*s*a[1]+2*s*t*k[1]+t*t*b[1]] as P;});
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

function outline(p:Pen,pts:P[],w:number,col:string){
 p.path(pts,true);p.g.strokeStyle=col;p.g.lineWidth=w;p.g.lineJoin='round';p.g.stroke();
}
/** One crisp cel step, toward the light. */
function cel(p:Pen,pts:P[],base:string,dark:string,dx:number,dy:number){
 p.poly(pts,dark,0);p.clip(pts,()=>p.poly(pts.map(([x,y])=>[x+dx,y+dy] as P),base,0));
}

function brows(p:Pen,style:Style,role:Role,f:Face,cx:number,hc:number,u:number){
 const [inner,outer]=f.brow??(role==='kaoruko'?[-.9,-.7]:[0,-1]),girl=role==='kaoruko',col=style==='ours'?(girl?'#4a3a58':C[role].hairInk):INK;
 const thick=(girl?3.1:5)*u,thin=(girl?1.8:2.5)*u,lift=f.eyes==='shock'?-3.2*u:0;
 for(const q of [-1,1]){
  const x=cx+q*13*u,y=hc-(girl?13:20)*u+lift*(girl?.35:1),a:P=[x-q*8.5*u,y+inner*u],b:P=[x+q*8*u,y+outer*u];
  p.poly([[a[0],a[1]-thick/2],[b[0],b[1]-thin/2],[b[0],b[1]+thin/2],[a[0],a[1]+thick/2]],col,0);
  p.dot(...a,thick/2,col);p.dot(...b,thin/2,col);
 }
}
function eyes(p:Pen,style:Style,role:Role,f:Face,cx:number,hc:number,u:number){
 const girl=role==='kaoruko',ours=style==='ours',kind=f.eyes??(girl?'dot':'lid'),open=ours?f.open??0:0,look=(f.look??0)*3*u,w=3.8*u;
 for(const q of [-1,1]){
  const x=cx+q*(kind==='shock'?12:13)*u,y=hc,blink=f.blink??0;
  if(blink>=1||kind==='shut'){p.stroke([[x-8.5*u,y],[x+8.5*u,y]],w);continue;}
  if(kind==='happy'){p.arc(x,y+3*u,8*u,6*u,200,340,w);continue;}
  if(kind==='shock'){
   p.ell(x,y,11*u,11*u,'#fff',2.6*u);
   if(ours&&open>0)p.dot(x+look,y+u,5.6*u,mix(INK,C[role].iris,open));
   p.dot(x+look-q*1.2*u,y+1.3*u,3*u);
  }else if(open>0){
   // The signature. An ink eye opens into colour, inside the same ink construction.
   const rx=lerp(girl?4.2:7,girl?8:7.8,open)*u,top=lerp(girl?5.5:1,girl?9:6.6,open)*u,bottom=lerp(5.5,girl?8.4:7.6,open)*u,pts:P[]=[];
   for(let i=0;i<32;i++){const t=i/32*Math.PI*2,s=Math.sin(t);pts.push([x+look+rx*Math.cos(t),y+(s<0?top:bottom)*s]);}
   p.poly(pts,INK,0);
   const inner=pts.map(([a,b])=>[x+look+(a-x-look)*.74,y+(b-y)*.76+.8*u*open] as P);
   const g=p.g.createLinearGradient(0,y-top,0,y+bottom);g.addColorStop(0,INK);g.addColorStop(.48,mix(INK,C[role].iris,open));g.addColorStop(1,mix(INK,mix(C[role].iris,'#ffffff',.38),open));
   p.path(inner,true);p.g.fillStyle=g;p.g.fill();
   p.dot(x+look,y+.5*u,2.5*u);
   p.ell(x+look-2.4*u,y-2.2*u,2.3*u*open,2.7*u*open,'#fff',0);
   p.stroke(quad([x-9*u,y-top*.4],[x,y-top*1.6-u],[x+9*u,y-top*.4]),w);
   if(girl)p.stroke([[x+q*8*u,y-top*.6],[x+q*11.5*u,y-top*.9-2*u]],2.2*u);
  }else if(kind==='dot'){
   p.ell(x+look,y,(ours?4.3:3.8)*u,(blink?2.2:ours?6:5.5)*u,INK,0);
   if(ours&&girl){p.stroke(quad([x-5.5*u,y-4.2*u],[x,y-8.8*u],[x+5.5*u,y-4.2*u]),2.2*u);p.stroke([[x+q*5*u,y-4.5*u],[x+q*8.3*u,y-7*u]],2*u);}
  }else{
   p.ell(x+look,y-u,7*u,(blink?2.6:6)*u,INK,0,0,180);p.stroke([[x-9*u,y-u],[x+9*u,y-u]],w);
  }
 }
}
function mouth(p:Pen,f:Face,cx:number,hc:number,u:number){
 const x=cx+1.5*u,y=hc+(20+3*(f.cheeks??0))*u,w=3.8*u,kind=f.mouth??'dash';
 if(kind==='smirk')p.arc(x+u,y-3*u,7*u,4*u,10,150,w);
 else if(kind==='smile')p.arc(x,y-3*u,8*u,4.5*u,20,160,w);
 else if(kind==='wave')p.stroke(Array.from({length:13},(_,i)=>[x-8*u+i*1.33*u,y+1.5*u*Math.sin(i*1.3)] as P),3*u);
 else if(kind==='o')p.ell(x,y+u,3.6*u,4.4*u,'#5a1e28',2.6*u);
 else if(kind==='O'){
  p.ell(x,y+3*u,8.5*u,10.5*u,'#5a1e28',3*u);p.ell(x+u,y+9*u,4.2*u,2.8*u,'#e86e78',0);
 }else if(kind==='teeth'){
  p.poly([[x-12*u,y-4*u],[x+12*u,y-4*u],[x+11*u,y+4*u],[x-11*u,y+4*u]],'#fff',3*u);
  for(const k of [-1,0,1])p.stroke([[x+k*6*u,y-4*u],[x+k*6*u,y+4*u]],1.5*u);
 }else if(kind==='laugh'){
  p.ell(x,y-2*u,12*u,10*u,'#5a1e28',0,0,180);p.ell(x+u,y+4.6*u,5.5*u,3*u,'#e86e78',0);p.ell(x,y-2*u,12*u,10*u,null,3*u,0,180);
 }else if(kind==='full'){
  p.stroke([[x-5*u,y+2*u],[x-2.5*u,y],[x,y+1.5*u],[x+2.5*u,y],[x+5*u,y+2*u]],2.8*u);
  for(const q of [-1,1])p.arc(x+q*11*u,y+u,4.5*u,8*u,q<0?115:-65,q<0?245:65,2.4*u);
 }else p.stroke([[x-5.5*u,y],[x+5.5*u,y-.8*u]],w);
}

function boyHair(p:Pen,style:Style,U:(q:P[])=>P[],head:P[],u:number){
 const c=C.rintaro;
 if(style==='rick'){
  // Reference rule: hair is a cap on the bean, plus one cue. His cue is the short swept crown.
  const pts=tufts(U([[-50,-2],[-54,-22],[-50,-27],[-54,-39],[-42,-40],[-39,-54],[-27,-49],[-20,-63],[-10,-53],[4,-65],[10,-52],[26,-60],[28,-47],[44,-50],[42,-37],[54,-34],[51,-22],[53,-4],[47,-15],[40,-27],[22,-30],[0,-30],[-22,-32],[-38,-26],[-46,-15]]),.06);
  p.shadedFill(pts,c.hair,mul(c.hair,[.8,.72,.66]),LIGHT,300,.4);outline(p,pts,4.4*u,INK);
  return;
 }
 const pts=tufts(U([[-49,2],[-56,-14],[-51,-17],[-60,-34],[-48,-32],[-53,-51],[-39,-44],[-36,-63],[-24,-50],[-16,-70],[-9,-53],[7,-72],[7,-55],[28,-69],[24,-52],[46,-60],[39,-44],[61,-43],[50,-30],[61,-23],[52,-15],[53,2],[48,-9],[45,-20],[37,-27],[22,-29],[8,-28],[1,-31],[-10,-29],[-26,-30],[-39,-25],[-46,-12]]),.07);
 cel(p,pts,c.hair,c.hairDark,-4*u,-5*u);
 p.clip(pts,()=>{
  for(const wedge of [[[-34,-28],[-33,-44],[-27,-31]],[[-8,-31],[-5,-53],[2,-30]],[[21,-30],[27,-47],[30,-28]],[[-55,-25],[-44,-30],[-46,-18]],[[46,-38],[40,-28],[47,-24]]] as P[][])p.poly(U(wedge),c.hairDark,0);
  for(const glint of [[[-33,-45],[-32,-56],[-27,-47]],[[-14,-51],[-12,-63],[-9,-52]],[[10,-53],[17,-64],[15,-53]]] as P[][])p.poly(U(glint),c.hairLight,0);
 });
 outline(p,pts,3*u,c.hairInk);
}
function girlBack(p:Pen,style:Style,U:(q:P[])=>P[],u:number){
 const c=C.kaoruko;
 if(style==='rick'){
  const pts=smooth(U([[0,-49],[-40,-38],[-54,0],[-58,50],[-60,100],[-63,140],[-40,151],[0,146],[40,151],[63,140],[60,100],[58,50],[54,0],[40,-38]]));
  p.gradFill(pts,c.hair,c.hairDark,LIGHT);outline(p,pts,4.2*u,INK);
  return;
 }
 // Asymmetric waves with flicks: she is readable from the silhouette alone.
 const pts=smooth(U([[0,-51],[-42,-40],[-56,-6],[-57,20],[-68,36],[-74,30],[-70,50],[-60,60],[-66,86],[-78,108],[-86,104],[-80,128],[-64,136],[-74,152],[-40,148],[-14,156],[12,146],[38,158],[54,146],[74,152],[82,134],[68,128],[66,108],[76,86],[68,64],[58,52],[70,32],[58,12],[56,-12],[42,-40]]));
 cel(p,pts,c.hair,c.hairDark,-5*u,-3*u);
 p.clip(pts,()=>{
  for(const s of [[[-56,40],[-52,70],[-66,100],[-58,130]],[[56,46],[50,76],[64,104],[60,140]],[[-70,112],[-78,122],[-70,134]]] as P[][])p.stroke(smooth(U(s),false),1.6*u,'#5b5070');
 });
 outline(p,pts,3.5*u,c.hairInk);
}
function girlFront(p:Pen,style:Style,U:(q:P[])=>P[],u:number){
 const c=C.kaoruko,ours=style==='ours';
 const crown:P[]=[[-49,0],[-54,-20],[-46,-40],[-27,-52],[0,-55],[27,-52],[46,-40],[54,-20],[49,0]];
 const fringe:P[]=ours
  ?[[47,-5],[42,-25],[34,-14],[26,-28],[17,-17],[7,-29],[-2,-18],[-12,-38],[-24,-17],[-32,-28],[-40,-13],[-45,-24],[-47,-5]]
  :[[46,-8],[41,-25],[32,-16],[20,-28],[9,-18],[-1,-28],[-9,-19],[-14,-36],[-25,-18],[-33,-27],[-41,-12],[-46,-24],[-47,-8]];
 const pts=[...smooth(U(crown),false),...tufts(U(fringe),ours?.15:.13,false)];
 const band=smooth(U([[-47,-30],[-30,-43.5],[0,-47.5],[30,-43.5],[47,-30]]),false);
 if(!ours){
  p.shadedFill(pts,c.hair,c.hairDark,LIGHT,280,.35);outline(p,pts,3.6*u,INK);
  p.stroke(band,4.6*u,'#17111e');
  for(const q of [-1,1]){
   const lock=smooth(U([[q*42,-28],[q*54,4],[q*56,38],[q*49,56],[q*45,42],[q*47,12],[q*37,-18]]));
   p.poly(lock,c.hair,3*u);
  }
  return;
 }
 cel(p,pts,c.hair,c.hairDark,-2.5*u,-4*u);
 // The purple shine band from the official art, reduced to one graphic shape.
 p.clip(pts,()=>{for(const [x,y,l,d] of [[-35,-33,6,-2],[-30,-35.5,9,-1.5],[-24,-38,6,-1],[2,-40,6,.5],[7,-40,9,1],[12,-39,5,1],[27,-35.5,7,2],[32,-33.5,4,2]]){const g=U(quad([x-d,y-2],[x+d*.3,y+l*.5],[x+d,y+l]));p.stroke(g,1.5*u,c.hairLight);}});
 outline(p,pts,3.1*u,c.hairInk);
 p.stroke(band,5.4*u,'#17111e');p.stroke(band.map(([x,y])=>[x,y-1.2*u] as P),1.1*u,'#655878');
 for(const q of [-1,1]){
  const d=q<0?0:4;
  const lock=smooth(U([[q*40,-30],[q*53,-8],[q*56,14],[q*(64+d),24],[q*(72+d),21],[q*(65+d),31],[q*55,33],[q*54,50],[q*46,66],[q*44,60],[q*47,40],[q*47,10],[q*37,-18]]));
  cel(p,lock,c.hair,c.hairDark,-1.6*u,-2*u);outline(p,lock,2.6*u,c.hairInk);
 }
}

export function drawCast(g:CanvasRenderingContext2D,pose:Pose){
 const {style,role,face={},tilt=0}=pose,m=metrics(style,role),{u,hc,chin,torsoBot,torsoTop}=m,c=C[role],girl=role==='kaoruko',ours=style==='ours';
 const p=new Pen(g),U=(q:P[]):P[]=>q.map(([x,y])=>[x*u,hc+y*u]);
 const T:Blob={a:m.tw,b:(torsoBot-torsoTop)/2,nTop:2.2,nBot:2.6,egg:.12,asym:0,rot:0,noise:.006,seed:m.seed+7};
 const body=blobPts(0,(torsoBot+torsoTop)/2,T),ty=(t:number)=>torsoTop+(torsoBot-torsoTop)*t;
 g.save();g.lineJoin='round';g.lineCap='round';
 if(girl)girlBack(p,style,U,u);
 if(!girl){
  const bag:P[]=[[-m.tw-58,ty(.4)],[-m.tw+34,ty(.4)],[-m.tw+30,ty(.92)],[-m.tw-62,ty(.9)]];
  p.gradFill(bag,'#85563f','#5c3a30',LIGHT);outline(p,bag,2.4*u,INK);
 }
 // Legs are single strokes, one curve, no knee.
 const legCol=girl?'#4e3d45':mix(c.coat,INK,.55),hip=torsoBot-(girl?10:30);
 for(const q of [-1,1]){
  const f:P=[q*22*u,-18];
  p.stroke(quad([q*14*u,hip],[q*20*u,(hip+f[1])/2],f),5.8*u,legCol);
  if(ours){
   p.poly(smooth([[f[0]-q*5*u,-8],[f[0]-q*4*u,-52],[f[0]+q*4*u,-50],[f[0]+q*16*u,-20],[f[0]+q*15*u,2],[f[0]-q*3*u,4]]),c.shoe,2.1*u);
   p.stroke([[f[0]-q*2*u,-9],[f[0]+q*14*u,-9]],1.2*u,girl?'#a67a62':'#77737b');
  }else p.stroke([[f[0]-q*3*u,-16],[f[0]+q*13*u,-14]],7.5*u,girl?c.shoe:INK);
 }
 const shoulderY=ty(ours?.16:.32),defHand=(q:number):P=>girl?(pose.satchel?[q*62,-520]:[q*(m.tw+42),-610]):[q*(m.tw+72),-800];
 const arms=[-1,1].map((q,i)=>{
  const a:P=[q*m.tw*.78,shoulderY],b=pose.hands?.[i]??defHand(q);
  return {q,b,pts:quad(a,[(a[0]+b[0])/2+q*(girl?62:58),(a[1]+b[1])/2],b)};
 });
 const front=!!pose.hands||!!pose.satchel;
 const drawArms=()=>{for(const {b,pts} of arms){
  if(ours){
   p.stroke(pts,9.4*u,INK);p.stroke(pts.slice(0,12),6*u,girl?c.coat:mix(c.coat,'#8a8798',.18));
   if(girl)p.stroke(pts.slice(10,12),7*u,'#f5f0ed');
  }else p.stroke(pts,5.2*u,mix(c.coat,INK,.5));
  p.dot(b[0],b[1],(ours?6.2:5.5)*u);
 }};
 if(!front)drawArms();

 p.gradFill(body,c.coat,mul(c.coat,CLOTH),LIGHT);
 p.clip(body,()=>{
  if(girl){
   p.stroke([[-m.tw*1.2,ty(.83)],[m.tw*1.2,ty(.83)]],3*u,'#58404c');
   const collar:P[]=[[-m.tw*1.25,ty(ours?.02:.25)],[-m.tw*.92,ty(ours?.2:.4)],[0,ty(ours?.5:.6)],[m.tw*.92,ty(ours?.2:.4)],[m.tw*1.25,ty(ours?.02:.25)],[m.tw*.5,ty(-.1)],[-m.tw*.5,ty(-.1)]];
   p.gradFill(collar,'#f7f2ef','#d9c8cc',LIGHT);outline(p,collar,1.8*u,INK);
   p.stroke([[-m.tw*.82,ty(ours?.17:.37)],[0,ty(ours?.44:.55)],[m.tw*.82,ty(ours?.17:.37)]],1.4*u,'#58404c');
   const k=ty(ours?.53:.63);
   for(const q of [-1,1])p.poly(smooth([[0,k],[q*15*u,k-6*u],[q*18*u,k+3*u],[q*7*u,k+5*u]]),'#382c3b',1.3*u);
   p.stroke([[0,k],[-4*u,k+16*u]],3*u,'#382c3b');p.stroke([[0,k],[5*u,k+13*u]],3*u,'#382c3b');
  }else{
   const shirt:P[]=[[-70,torsoTop-30],[72,torsoTop-30],[56,torsoBot+30],[-54,torsoBot+30]];
   p.gradFill(shirt,'#f5f2e9','#bdb9c4',LIGHT);outline(p,shirt,1.8*u,INK);
   p.stroke([[6,ty(.3)],[8,ty(.92)]],1.1*u,'#aaa5ad');
   for(const q of [-1,1]){
    const flap:P[]=[[q*40,torsoTop-30],[q*105,torsoTop-30],[q*128,ty(ours?.1:.28)],[q*86,ty(ours?.2:.38)],[q*50,ty(ours?.14:.3)]];
    p.poly(flap,mix(c.coat,'#8a8798',.22),1.8*u);
   }
   for(let i=0;i<4;i++)p.ell(-92,ty((ours?.3:.45)+i*(ours?.17:.145)),3*u,3.3*u,'#d8b552',1.2*u);
   p.stroke([[100,ty(.6)],[160,ty(.6)]],1.5*u,'#17151c');
   const strap:P[]=[[-m.tw*.5,torsoTop],[-m.tw*.82,ty(.4)],[-m.tw*.9,ty(.78)]];
   p.stroke(strap,6.4*u,INK);p.stroke(strap,4.2*u,'#85563f');
  }
 });
 if(ours)p.clip(body,()=>outline(p,body.map(([x,y])=>[x-9,y] as P),1.4*u,mix(c.coat,'#ffffff',.32)));
 p.inkRing(body,5*u,THICK);
 if(girl){
  const w=m.tw,skirt=smooth([[-w*.84,ty(.8)],[0,ty(.83)],[w*.84,ty(.8)],[w*1.12,-470],[w*1.16,-408],[w*.4,-392],[-w*.4,-392],[-w*1.16,-408],[-w*1.12,-470]],true,6);
  p.gradFill(skirt,c.coat,mul(c.coat,CLOTH),LIGHT);
  for(const x of [-.6,0,.6])p.stroke([[x*w*.8,ty(.88)],[x*w,-408]],1.5*u,'#8e5569');
  p.clip(skirt,()=>p.stroke(smooth([[-w*1.25,-433],[0,-418],[w*1.25,-433]],false),2.2*u,'#58404c'));
  p.inkRing(skirt,4.4*u,THICK);
 }
 if(ours){
  // A tapered neck, seated in the collar. The report has none; the user asked for this in V8.
  const j=girl?38:50,k=girl?52:66,top=chin-45,y=torsoTop+(girl?54:58);
  const neck=[...quad([-j,top],[-j*.8,(top+y)/2],[-k,y]),...quad([-k,y],[0,y+55],[k,y]),...quad([k,y],[j*.8,(top+y)/2],[j,top])];
  p.poly(neck,mul(c.skin,[.96,.88,.82]),1.7*u);
 }
 if(pose.satchel){
  const bag=tufts([[-172,-505],[172,-505],[184,-492],[188,-314],[176,-302],[-176,-302],[-188,-314],[-184,-492]],0);
  p.gradFill(bag,'#8a5547','#5c3834',LIGHT);p.stroke([[-178,-428],[0,-418],[178,-428]],1.8*u);
  for(const x of [-112,112])p.stroke([[x,-470],[x,-356]],3.6*u,'#573532');
  p.poly([[-22,-446],[22,-446],[22,-402],[-22,-402]],'#c5c5c9',1.5*u);p.inkRing(bag,4*u,THICK);
 }
 if(front)drawArms();

 g.save();g.translate(0,chin);g.rotate(tilt);g.translate(0,-chin);
 const ears=():void=>{for(const q of [-1,1]){
  const pts=smooth(U([[q*44,-6],[q*54,-9],[q*59,0],[q*55,12],[q*46,14]]));
  p.shadedFill(pts,c.skin,mul(c.skin,SKIN_SHADE),LIGHT,70);outline(p,pts,2.8*u,INK);
 }};
 if(!girl)ears();
 const H:Blob={a:m.a,b:m.b,nTop:m.top,nBot:m.bot,egg:m.egg,asym:m.asym,rot:m.rot,noise:.008,seed:m.seed};
 const cheek=face.cheeks??0;
 const head=blobPts(0,hc,H,96).map(([x,y])=>{const k=Math.exp(-((((y-hc)/u-20)/15)**2));return[x*(1+.21*cheek*k),y+cheek*2*u*k] as P;});
 // Reference behaviour: a strong emotion colours the whole head. Ours climbs from the cheeks, so it can build.
 const b=face.blush??0,skin=mix(c.skin,'#f07f74',ours?b*.16:b*.62);
 p.shadedFill(head,skin,mul(skin,SKIN_SHADE),LIGHT,m.a);
 if(ours&&b>0)p.clip(head,()=>{
  for(const q of [-1,1]){
   g.save();g.translate(q*29*u,hc+15*u);g.scale(1,.68);
   const r=g.createRadialGradient(0,0,u,0,0,25*u);r.addColorStop(0,`rgba(238,86,92,${.85*b})`);r.addColorStop(1,'rgba(238,86,92,0)');
   g.fillStyle=r;g.fillRect(-25*u,-25*u,50*u,50*u);g.restore();
   if(b>.3)for(const k of [-1,0,1])p.stroke([[q*28*u+k*4.4*u-1.5*u,hc+16*u],[q*28*u+k*4.4*u+1.5*u,hc+10.5*u]],1.4*u,'#bd4655');
  }
 });
 p.inkRing(head,5*u,THICK);
 if(girl)girlFront(p,style,U,u);else{
  boyHair(p,style,U,head,u);
  for(const q of [-1,1]){
   p.ell(q*55*u,hc+8*u,2.2*u,2.2*u,'#eef1f5',1.1*u);
   const ring=Array.from({length:25},(_,i)=>[q*55*u+3.8*u*Math.cos(i/24*Math.PI*2),hc+15*u+5.4*u*Math.sin(i/24*Math.PI*2)] as P);
   p.stroke(ring,2.9*u);p.stroke(ring,1.4*u,'#cdd3db');
  }
 }
 brows(p,style,role,face,0,hc,u);eyes(p,style,role,face,0,hc,u);mouth(p,{...face,mouth:face.mouth??(girl?'smile':'dash')},0,hc,u);
 if(face.cream){p.ell(9*u,hc+28*u,5*u,2.8*u,'#fffdf4',1.2*u);p.ell(12*u,hc+26*u,2.6*u,2.4*u,'#fffdf4',0);for(const [x,y] of [[-17,27],[-12,30],[20,30]])p.dot(x*u,hc+y*u,1.5*u,'#b9773f');}
 if(face.sweat)p.poly(smooth(U([[39,-27],[45,-15],[39,-9],[33,-15]])),'#8fd0ee',1.7*u);
 g.restore();
 g.restore();
}

export const STATES:Record<Role,[string,Face,number][]>={
 rintaro:[
  ['Guarded',{},0],
  ['Panic: "my fault"',{eyes:'shock',mouth:'O',brow:[-3,2],sweat:true},.04],
  ['Hurt',{eyes:'lid',mouth:'wave',brow:[-4,3],look:-.6},-.05],
  ['Seen',{open:1,brow:[-4,0],mouth:'o',blush:.45},.02],
  ['Lets himself smile',{eyes:'happy',mouth:'smile',brow:[-3,0],blush:.2},.05],
 ],
 kaoruko:[
  ['Attentive',{},0],
  ['Caught',{eyes:'shock',mouth:'full',cheeks:1,cream:true,brow:[-3,-1]},0],
  ['Mortified',{eyes:'shock',mouth:'full',cheeks:1,cream:true,blush:1,sweat:true,brow:[-5,2]},-.05],
  ['Sees him',{open:1,mouth:'smile',brow:[-1.4,-1.4],blush:.2},.04],
  ['Delighted',{eyes:'happy',mouth:'laugh',brow:[-3,-2],blush:.2},.06],
 ],
};
