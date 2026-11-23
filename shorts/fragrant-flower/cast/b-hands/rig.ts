// Cast B, chosen by the user 2026-11-22, with the restraint pass they asked for in the same message.
// Emotion comes from small geometry, gesture and stillness. No sweat drops, hatching, gag mouths or googly eyes.
// Iris colour (face.seen) is for the turn only.
// Units: millimetres, y down, soles at y = 0. u = 1% of head width.
import {Pen,INK,blobPts,thickAngle,mul,mix,type Blob} from '../../../../pipeline/kit/v1/look/toon';

export type Role='rintaro'|'kaoruko';
export type P=[number,number];
export type Outfit='cafe'|'school';
export interface Face {
 /** -1 downcast, 0 rest, 1 startled */ wide?:number;
 /** iris colour, 0..1, only at the turn */ seen?:number;
 blink?:number; smileEyes?:boolean; look?:P;
 brow?:P;
 /** -1 pressed down .. 1 soft smile */ mouth?:number;
 parted?:number; mouthShift?:number;
 /** one cheek, gently full */ full?:number;
 flush?:number; crumb?:boolean;
}
export interface Pose {
 role:Role;outfit?:Outfit;face?:Face;
 tilt?:number;lean?:number;bow?:number;hunch?:number;
 hands?:[P,P];elbows?:[P,P];feet?:[P,P];
 prop?:'fork'|'box'|'tray'|'satchel';propAt?:P;
 hairFlow?:number;
 /** hand look: dot (cast B as approved), big (larger dot), thumb (dot plus thumb nub and a fingertip line), mitt (skin mitten with a thumb) */ handStyle?:'dot'|'big'|'thumb'|'mitt';
 /** foreground back of head, never a face */ back?:boolean;
 /** colours for an anonymous back */ hair?:string;cloth?:string;
 /** back-light, 0..1. The face goes into shade and stays a face. */ shade?:number;
}

const LIGHT=-2*Math.PI/3,THICK=thickAngle(LIGHT);
const CLOTH:[number,number,number]=[.68,.68,.74],SKIN_SHADE:[number,number,number]=[.95,.87,.86];
export const C={
 rintaro:{skin:'#f5dac0',hair:'#d5bd8c',hairDark:'#b99c6e',hairInk:'#62483a',coat:'#34353f',tee:'#d9d2c3',apron:'#4b4a50',iris:'#80603f',shoe:'#2c2930',bag:'#75523f'},
 kaoruko:{skin:'#f9e3d3',hair:'#3a3542',hairDark:'#2b2631',hairInk:'#1c1622',coat:'#b87c8b',blouse:'#eee8df',skirt:'#c49b96',belt:'#6a5046',iris:'#4a6885',shoe:'#6b4a3d',bag:'#75523f'},
};
export const BUILD={
 rintaro:{total:1860,a:280,b:259,legs:755,tw:192,seed:63,egg:-.14,top:1.74,bot:2.28,asym:.05,rot:-.012,raise:38},
 kaoruko:{total:1472,a:245,b:226,legs:565,tw:157,seed:71,egg:-.11,top:1.85,bot:2.2,asym:-.035,rot:.01,raise:22},
};
export function metrics(role:Role){
 const b=BUILD[role],hc=-(b.total-b.b)-b.raise,chin=hc+b.b;
 return {...b,u:b.a/50,hc,chin,torsoBot:-b.legs,torsoTop:chin+(role==='rintaro'?14:4)};
}
export function headDrop(role:Role,bow=0,hunch=0){const m=metrics(role);return (m.torsoBot-m.torsoTop)*.36*bow+150*bow+60*hunch;}

const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const quad=(a:P,k:P,b:P,n=14):P[]=>Array.from({length:n+1},(_,i)=>{const t=i/n,s=1-t;return[s*s*a[0]+2*s*t*k[0]+t*t*b[0],s*s*a[1]+2*s*t*k[1]+t*t*b[1]] as P;});
export const spline=(pts:P[],closed=true,n=8):P[]=>{
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
const locks=(pts:P[],bend:number,closed=true):P[]=>pts.flatMap((a,i)=>{
 if(!closed&&i===pts.length-1)return [a];
 const b=pts[(i+1)%pts.length],dx=b[0]-a[0],dy=b[1]-a[1];
 return Array.from({length:7},(_,k)=>{const t=k/7,o=4*t*(1-t)*bend;return[a[0]+dx*t-dy*o,a[1]+dy*t+dx*o] as P;});
});
function edge(p:Pen,pts:P[],w:number,col:string){p.path(pts,true);p.g.strokeStyle=col;p.g.lineWidth=w;p.g.lineJoin='round';p.g.stroke();}
function cel(p:Pen,pts:P[],base:string,dark:string,dx:number,dy:number){p.poly(pts,dark,0);p.clip(pts,()=>p.poly(pts.map(([x,y])=>[x+dx,y+dy] as P),base,0));}

function drawEyes(p:Pen,role:Role,f:Face,hc:number,u:number,skin:string){
 const girl=role==='kaoruko',wide=clamp(f.wide??0,-1,1),seen=clamp(f.seen??0),[lx,ly]=f.look??[0,0],blink=f.blink??0;
 for(const q of [-1,1]){
  const x=q*13*u,y=hc,ex=x+lx*2.6*u,ey=y+ly*1.8*u;
  if(blink>=1){p.stroke(quad([x-7.5*u,y+u],[x,y+2.6*u],[x+7.5*u,y+u]),3*u);continue;}
  if(f.smileEyes){p.arc(x,y+2.6*u,7*u,4.6*u,202,338,3*u);continue;}
  if(wide<-.3){
   // Downcast: the lid comes down and the eye slides away. Nothing else.
   const dip=(f.brow?.[0]??0)<-1?1:0;
   p.ell(ex+q*.8*u,y+2.3*u,3.5*u,3.6*u,INK,0,0,180);p.stroke(quad([x-q*6.6*u,y+(1-1.9*dip)*u],[x+q*u,y+2.2*u],[x+q*6.8*u,y+(1+2.8*dip)*u]),2.4*u);continue;
  }
  if(wide>.05){
   // Startle: the lid is gone and the ink eye is simply open. No white rings.
   const rx=lerp(4,girl?4.5:4.3,wide)*u,ry=lerp(5.2,girl?7.2:6,wide)*u*(blink?.4:1);
   p.ell(ex,ey+.5*u,rx,ry,INK,0);
   if(girl&&seen>.02){p.ell(ex,ey+1.2*u,rx*.9*seen,ry*.8*seen,mix(INK,'#6f9fd0',seen),0);p.ell(ex-1.5*u,ey-1.6*u,1.1*u*seen,1.3*u*seen,'#e6ebee',0);}
   p.stroke(quad([x-5.2*u,y-ry-.2*u],[x,y-ry-3.2*u],[x+5.2*u,y-ry-.2*u]),1.6*u);
   continue;
  }
  const open=blink?.4:1;
  if(girl){
   const rx=lerp(4,5.1,seen)*u,ry=lerp(5.8,6.7,seen)*u*open;
   p.ell(ex,ey+.6*u,rx,ry,INK,0);
   if(seen>.02){
    p.ell(ex,ey+1.4*u,rx*.9*seen,ry*.8*seen,mix(INK,'#6f9fd0',seen),0);
    p.ell(ex-1.5*u,ey-2*u,1.1*u*seen,1.3*u*seen,'#e6ebee',0);
   }
   p.stroke(quad([x-5.4*u,ey-ry*.66],[x,ey-ry*1.55],[x+5.6*u,ey-ry*.7]),1.9*u);
  }else{
   // His eye stays his. The lid lifts a little and the dark under it warms.
   const top=y-u-1.6*u*seen,ry=lerp(5.8,7.4,seen)*u*open;
   p.ell(ex,top+ly*u,6.8*u,ry,INK,0,0,180);
   if(seen>.02){
    p.ell(ex,top+2.1*u,4.6*u*seen,4.1*u*seen,mix(INK,C[role].iris,seen),0,0,180);
    p.ell(ex,top+2.1*u,1.9*u,1.9*u,INK,0,0,180);
    p.ell(ex-2.2*u,top+2.6*u,u*seen,u*seen,'#e9e2d6',0);
   }
   p.stroke(quad([x-8.4*u,y-u-.3*u*seen],[x,top-1.5*u*seen],[x+8.4*u,y-u-.3*u*seen]),3.4*u);
  }
 }
}
/** Hands. The ink dot stays the base of every style. Direction q: -1 left of the figure, +1 right; the thumb points toward the body centre and up. */
function drawHand(p:Pen,b:P,u:number,q:number,style:string,skin:string){
 if(style==='big'){p.dot(b[0],b[1],8*u);return;}
 if(style==='thumb'){
  p.dot(b[0],b[1],7*u);
  p.stroke([[b[0]-q*3*u,b[1]-4*u],[b[0]-q*7*u,b[1]-9*u]],4.6*u);
  p.stroke([[b[0]+q*1*u,b[1]-7.5*u],[b[0]+q*5.5*u,b[1]-5*u],[b[0]+q*7.5*u,b[1]+.5*u]],2.8*u);
  return;
 }
 if(style==='mitt'){
  p.ell(b[0]-q*5.5*u,b[1]-5*u,3.1*u,5*u,skin,1.7*u,0,360,q*.55);
  p.ell(b[0],b[1],7.6*u,6.6*u,skin,1.7*u);
  p.stroke([[b[0]+q*1*u,b[1]-5.4*u],[b[0]+q*4*u,b[1]-2*u],[b[0]+q*4.4*u,b[1]+2.5*u]],1.5*u);
  return;
 }
 p.dot(b[0],b[1],5.4*u);
}
function drawBrows(p:Pen,role:Role,f:Face,hc:number,u:number){
 const girl=role==='kaoruko',[inner,outer]=f.brow??(girl?[-1,-.9]:[0,-.8]),lift=Math.max(0,f.wide??0)*-1.8*u;
 const col=girl?'#3a2c40':C.rintaro.hairInk,a0=(girl?2.4:4)*u,b0=(girl?1.5:2.2)*u;
 for(const q of [-1,1]){
  const x=q*13*u,y=hc-(girl?11.6:17.5)*u+lift*(girl?.7:1),a:P=[x-q*7*u,y+inner*u],b:P=[x+q*7.5*u,y+outer*u];
  p.poly([[a[0],a[1]-a0/2],[b[0],b[1]-b0/2],[b[0],b[1]+b0/2],[a[0],a[1]+a0/2]],col,0);
  p.dot(a[0],a[1],a0/2,col);p.dot(b[0],b[1],b0/2,col);
 }
}
function drawMouth(p:Pen,role:Role,f:Face,hc:number,u:number){
 const x=(1+(f.mouthShift??0)*1.7)*u,y=hc+21*u,m=f.mouth??(role==='kaoruko'?.55:0),o=f.parted??0,w=(role==='kaoruko'?4.4:5.2)*u;
 if(o>.05){p.ell(x,y,lerp(3.4,2.7,o)*u,(.7+1.7*o)*u,'#5a2a30',1.7*u);return;}
 p.stroke(quad([x-w,y-m*1.1*u],[x,y+m*3.8*u],[x+w,y-m*1.1*u-.4*u]),2.5*u);
}

function girlBack(p:Pen,u:number,hc:number,flow:number,drop:number){
 const c=C.kaoruko,pts=spline(([[0,-51],[-42,-40],[-55,-6],[-56,22],[-63,40],[-67,39],[-63,52],[-57,62],[-62,88],[-72,108],[-75,110],[-70,126],[-60,134],[-64,147],[-36,147],[-12,153],[12,146],[36,154],[50,145],[66,147],[73,134],[64,126],[62,108],[68,86],[62,66],[56,52],[62,34],[56,12],[55,-12],[42,-40]] as P[]).map(([x,y])=>{
  const k=clamp((y-10)/135);
  return[(x+flow*k*(x>=0?1:.5)*38)*u,hc+(y-flow*k*36)*u+drop*(1-.82*k)] as P;
 }));
 cel(p,pts,c.hair,c.hairDark,-3.6*u,-2*u);
 p.clip(pts,()=>{for(const s of [[[-52,30],[-48,70],[-60,100],[-54,132]],[[51,40],[47,76],[58,104],[55,140]]] as P[][])p.stroke(spline(s.map(([x,y])=>[x*u,hc+y*u+drop*.4] as P),false),1.1*u,'#4b4356');});
 edge(p,pts,3*u,c.hairInk);
}
function girlFront(p:Pen,u:number,hc:number){
 const c=C.kaoruko,U=(q:P[])=>q.map(([x,y])=>[x*u,hc+y*u] as P);
 const crown:P[]=[[-49,0],[-54,-20],[-46,-40],[-27,-52],[0,-55],[27,-52],[46,-40],[54,-20],[49,0]];
 // Soft strands at different lengths, parted left of centre.
 const fringe:P[]=[[47,-3],[43,-20],[38,-10],[34,-21],[28,-13],[21,-25],[17,-16],[10,-27],[6,-15],[1,-25],[-5,-17],[-12,-36],[-17,-22],[-21,-15],[-25,-26],[-30,-14],[-35,-23],[-40,-9],[-44,-20],[-47,-3]];
 const pts=[...spline(U(crown),false),...locks(U(fringe),.12,false)];
 cel(p,pts,c.hair,c.hairDark,-2*u,-3*u);
 p.clip(pts,()=>{
  p.stroke(spline(U([[-33,-33],[-24,-37.5],[-15,-39.5]]),false),2.4*u,'#504759');
  p.stroke(spline(U([[4,-40],[16,-39],[27,-35]]),false),2.4*u,'#504759');
 });
 edge(p,pts,2.5*u,c.hairInk);
 p.stroke(spline(U([[-47,-30],[-30,-43.5],[0,-47.5],[30,-43.5],[47,-30]]),false),4.4*u,'#19131f');
 for(const q of [-1,1]){
  const lock=spline(U([[q*40,-30],[q*52,-8],[q*55,14],[q*59,26],[q*63,27],[q*58,34],[q*54,36],[q*53,50],[q*46,64],[q*45,56],[q*48,38],[q*47,10],[q*37,-18]]));
  cel(p,lock,c.hair,c.hairDark,-1.2*u,-1.4*u);edge(p,lock,2.2*u,c.hairInk);
 }
}
function boyHair(p:Pen,u:number,hc:number,back:boolean,dye?:string){
 const c=dye?{...C.rintaro,hair:dye,hairDark:mul(dye,[.78,.78,.8]),hairInk:'#211a1c'}:C.rintaro,U=(q:P[])=>q.map(([x,y])=>[x*u,hc+y*u] as P);
 // Short irregular clumps swept up and back.
 const top:P[]=[[-49,2],[-54,-12],[-51,-16],[-58,-27],[-50,-28],[-53,-39],[-46,-38],[-46,-50],[-38,-47],[-34,-58],[-27,-52],[-24,-57],[-19,-55],[-11,-66],[-7,-57],[-2,-60],[3,-57],[14,-66],[14,-57],[20,-58],[23,-54],[33,-58],[32,-50],[43,-50],[40,-43],[52,-39],[47,-32],[56,-26],[51,-19],[55,-13],[51,-8],[53,2]];
 const line:P[]=back
  ?[[50,16],[40,31],[24,35],[8,33],[-8,36],[-26,33],[-42,28],[-50,14]]
  :[[48,-8],[45,-19],[38,-25],[26,-27],[12,-27],[2,-29],[-10,-27],[-25,-28],[-38,-24],[-46,-12]];
 const pts=locks(U([...top,...line]),.05);
 cel(p,pts,c.hair,c.hairDark,-2.6*u,-3*u);
 p.clip(pts,()=>{for(const s of [[[-30,-30],[-31,-40],[-35,-47]],[[-8,-29],[-7,-43],[-11,-54]],[[16,-28],[19,-41],[27,-50]],[[38,-26],[42,-35],[48,-38]]] as P[][])p.stroke(spline(U(s),false),1.2*u,c.hairDark);});
 edge(p,pts,2.3*u,c.hairInk);
}

function boyBody(p:Pen,body:P[],outfit:Outfit,m:ReturnType<typeof metrics>,ty:(t:number)=>number){
 const c=C.rintaro,{u,tw,torsoTop,torsoBot}=m;
 if(outfit==='cafe'){
  p.gradFill(body,c.tee,mul(c.tee,CLOTH),LIGHT);
  p.clip(body,()=>{
   const apron:P[]=[[-96,ty(.3)],[96,ty(.3)],[104,ty(.52)],[tw+40,ty(.7)],[tw+40,torsoBot+30],[-tw-40,torsoBot+30],[-tw-40,ty(.7)],[-104,ty(.52)]];
   for(const q of [-1,1])p.stroke([[q*84,torsoTop-10],[q*92,ty(.14)],[q*84,ty(.31)]],3.6*u,c.apron);
   p.gradFill(apron,c.apron,mul(c.apron,CLOTH),LIGHT);edge(p,apron,1.5*u,INK);
   p.stroke([[-70,ty(.66)],[-66,ty(.8)],[66,ty(.8)],[70,ty(.66)]],1.3*u,'#2f2e34');
  });
  return;
 }
 p.gradFill(body,c.coat,mul(c.coat,CLOTH),LIGHT);
 p.clip(body,()=>{
  const shirt:P[]=[[-70,torsoTop-30],[72,torsoTop-30],[56,torsoBot+30],[-54,torsoBot+30]];
  p.gradFill(shirt,'#eeeae1','#b9b5be',LIGHT);edge(p,shirt,1.6*u,INK);
  for(const q of [-1,1])p.poly([[q*40,torsoTop-30],[q*105,torsoTop-30],[q*128,ty(.1)],[q*86,ty(.2)],[q*50,ty(.14)]],'#454550',1.6*u);
  for(let i=0;i<4;i++)p.ell(-92,ty(.3+i*.17),2.6*u,2.9*u,'#b99a55',u);
  p.stroke([[-tw*.5,torsoTop],[-tw*.82,ty(.4)],[-tw*.9,ty(.78)]],4.4*u,c.bag);
 });
}
function girlBody(p:Pen,body:P[],outfit:Outfit,m:ReturnType<typeof metrics>,ty:(t:number)=>number){
 const c=C.kaoruko,{u,tw}=m,cafe=outfit==='cafe',base=cafe?c.blouse:c.coat;
 p.gradFill(body,base,mul(base,cafe?[.8,.8,.85]:CLOTH),LIGHT);
 p.clip(body,()=>{
  if(cafe){
   for(const q of [-1,1])p.stroke(quad([q*92,ty(.05)],[q*118,ty(.45)],[q*80,ty(.8)]),3*u,'#c9a5a0');
   p.stroke(spline([[-tw,ty(.24)],[-tw*.5,ty(.3)],[0,ty(.27)],[tw*.5,ty(.31)],[tw,ty(.24)]],false),1.2*u,'#b5aaa4');
   return;
  }
  const collar:P[]=[[-tw*1.25,ty(.02)],[-tw*.92,ty(.2)],[0,ty(.5)],[tw*.92,ty(.2)],[tw*1.25,ty(.02)],[tw*.5,ty(-.1)],[-tw*.5,ty(-.1)]];
  p.gradFill(collar,'#eee9e5','#cdbfc2',LIGHT);edge(p,collar,1.6*u,INK);
  const k=ty(.53);
  for(const q of [-1,1])p.poly(spline([[0,k],[q*13*u,k-5*u],[q*15*u,k+3*u],[q*6*u,k+4*u]]),'#382c3b',1.1*u);
 });
}
function girlSkirt(p:Pen,outfit:Outfit,m:ReturnType<typeof metrics>,ty:(t:number)=>number,squash:(y:number)=>number){
 const c=C.kaoruko,w=m.tw,u=m.u,base=outfit==='cafe'?c.skirt:c.coat,top=squash(ty(.8));
 const pts=spline([[-w*.84,top],[0,top+8],[w*.84,top],[w*1.12,-470],[w*1.17,-408],[w*.4,-392],[-w*.4,-392],[-w*1.17,-408],[-w*1.12,-470]],true,6);
 p.gradFill(pts,base,mul(base,CLOTH),LIGHT);
 for(const x of [-.6,0,.6])p.stroke([[x*w*.8,top+50],[x*w,-408]],1.2*u,mul(base,[.8,.75,.78]));
 p.inkRing(pts,3.6*u,THICK);
 if(outfit==='cafe'){
  const belt:P[]=[[-w*.84,top-16],[w*.84,top-16],[w*.86,top+22],[-w*.86,top+22]];
  p.poly(belt,c.belt,1.6*u);p.poly([[-22,top-16],[22,top-16],[22,top+22],[-22,top+22]],'#a98a5a',1.2*u);
 }
}
function drawProp(p:Pen,kind:NonNullable<Pose['prop']>,[x,y]:P,u:number){
 if(kind==='fork'){
  p.stroke([[x+6,y+30],[x-30,y-118]],3.2*u);p.stroke([[x+6,y+30],[x-30,y-118]],1.6*u,'#b9bec2');
  for(const d of [-15,0,15])p.stroke([[x-28+d,y-118],[x-40+d,y-168]],1.3*u,'#b9bec2');
  p.poly([[x-66,y-196],[x-22,y-206],[x-12,y-166],[x-58,y-156]],'#e6d3b4',1.2*u);
 }else if(kind==='box'){
  // A plain bakery box tied with string.
  const b:P[]=[[x-150,y-140],[x+150,y-140],[x+156,y+16],[x-156,y+16]],lid:P[]=[[x-158,y-168],[x+158,y-168],[x+162,y-120],[x-162,y-120]];
  p.gradFill(b,'#d8c8b0','#a99680',LIGHT);edge(p,b,2*u,INK);
  p.gradFill(lid,'#e3d4bd','#b6a48c',LIGHT);edge(p,lid,1.8*u,INK);
  p.stroke([[x,y-168],[x,y+16]],1.1*u,'#8b5b50');p.stroke([[x,y-168],[x-34,y-190],[x-6,y-170],[x+30,y-192],[x,y-168]],u,'#8b5b50');
 }else if(kind==='tray'){
  p.poly([[x-230,y-16],[x+230,y-16],[x+214,y+16],[x-214,y+16]],'#8d8279',1.8*u);
  for(const [d,col] of [[-100,'#e9dcc5'],[80,'#6e4b3c']] as [number,string][]){p.poly([[x+d-64,y-16],[x+d+64,y-16],[x+d+60,y-86],[x+d-60,y-94]],col,1.6*u);p.dot(x+d,y-108,20,'#9c3a42');}
 }else{
  const b:P[]=[[x-182,y-100],[x+182,y-100],[x+188,y+100],[x-188,y+100]];
  p.gradFill(b,C.kaoruko.bag,'#4f3530',LIGHT);edge(p,b,2.4*u,INK);
 }
}

export function drawCast(g:CanvasRenderingContext2D,pose:Pose){
 const {role,outfit='cafe',face={},bow=0,hunch=0,lean=0,tilt=0,hairFlow=0,back=false,shade=0}=pose;
 const m=metrics(role),{u,hc,chin,torsoBot,torsoTop,tw}=m,c=C[role],girl=role==='kaoruko',p=new Pen(g);
 const drop=headDrop(role,bow,hunch),ky=1-.36*bow-60*hunch/(torsoBot-torsoTop);
 const squash=(y:number)=>torsoBot+(y-torsoBot)*ky,ty=(t:number)=>torsoTop+(torsoBot-torsoTop)*t;
 g.save();g.lineJoin='round';g.lineCap='round';

 const legCol=girl?'#4e3d45':mix(outfit==='cafe'?'#3a3940':C.rintaro.coat,INK,.55);
 [-1,1].forEach((q,i)=>{
  const f:P=pose.feet?.[i]??[q*22*u,0],h:P=[q*14*u,torsoBot-(girl?10:30)];
  p.stroke(quad(h,[(h[0]+f[0])/2+q*(1.5*u-f[1]*.16),(h[1]+f[1]-18)/2+f[1]*.1],[f[0],f[1]-18]),5.4*u,legCol);
  p.poly(spline([[f[0]-q*5*u,f[1]-8],[f[0]-q*4*u,f[1]-48],[f[0]+q*4*u,f[1]-46],[f[0]+q*15*u,f[1]-18],[f[0]+q*14*u,f[1]+2],[f[0]-q*3*u,f[1]+4]]),c.shoe,1.9*u);
 });

 g.translate(0,torsoBot);g.rotate(lean);g.translate(0,-torsoBot);
 if(girl&&!back)girlBack(p,u,hc,hairFlow,drop);

 const shoulder:(q:number)=>P=q=>[q*(tw*.78-16*hunch),squash(ty(.16))];
 const hand=(q:number,i:number):P=>pose.hands?.[i]??(girl?[q*(tw+30),-605+drop*.5]:[q*(tw+62)-q*28*hunch,-805]);
 const arms=[-1,1].map((q,i)=>{
  const a=shoulder(q),b=hand(q,i),k=pose.elbows?.[i]??[(a[0]+b[0])/2+q*(pose.hands?90:56),(a[1]+b[1])/2+(pose.hands?70:0)] as P;
  return {q,b,pts:quad(a,k,b)};
 });
 const front=!!pose.hands&&!back;
 const drawArms=(from=0)=>{for(const a of arms){
  const {b}=a,pts=a.pts.slice(from);
  p.stroke(pts,8.2*u,INK);
  if(outfit==='school')p.stroke(pts.slice(0,-1),5.2*u,girl?C.kaoruko.coat:'#41414b');
  else if(girl)p.stroke(pts.slice(0,-1),5.2*u,C.kaoruko.blouse);
  else{p.stroke(pts.slice(0,4),9.8*u,INK);p.stroke(pts.slice(0,4),7*u,C.rintaro.tee);}
  drawHand(p,b,u,a.q,pose.handStyle??'big',C[role].skin);
 }};
 const ruffles=()=>{
  if(!girl||outfit!=='cafe')return;
  for(const q of [-1,1]){
   const [x,y]=shoulder(q);
   p.poly(spline([[x-q*30,y-34],[x+q*46,y-26],[x+q*74,y+32],[x+q*52,y+50],[x+q*34,y+36],[x+q*12,y+58],[x-q*12,y+38],[x-q*34,y+44]]),C.kaoruko.blouse,1.6*u);
  }
 };
 if(!front)drawArms();

 const T:Blob={a:tw,b:(torsoBot-torsoTop)/2,nTop:2.2,nBot:2.6,egg:.12,asym:0,rot:0,noise:.006,seed:m.seed+7};
 const body=blobPts(0,(torsoBot+torsoTop)/2,T);
 g.save();g.translate(0,torsoBot);g.scale(1+.05*bow,ky);g.translate(0,-torsoBot);
 if(back){
  const base=pose.cloth??(girl?(outfit==='cafe'?C.kaoruko.blouse:C.kaoruko.coat):(outfit==='cafe'?C.rintaro.tee:C.rintaro.coat));
  p.gradFill(body,base,mul(base,CLOTH),LIGHT);
  if(!girl&&outfit==='cafe')p.clip(body,()=>{for(const q of [-1,1])p.stroke([[q*110,torsoTop],[-q*90,ty(.7)]],3.2*u,C.rintaro.apron);});
 }else if(girl)girlBody(p,body,outfit,m,ty);else boyBody(p,body,outfit,m,ty);
 p.inkRing(body,4.2*u,THICK);
 if(!back){
  const j=girl?38:50,k=girl?52:66,top=chin-45,y=torsoTop+(girl?50:56);
  p.poly([...quad([-j,top],[-j*.8,(top+y)/2],[-k,y]),...quad([-k,y],[0,y+52],[k,y]),...quad([k,y],[j*.8,(top+y)/2],[j,top])],mul(c.skin,[.95,.87,.82]),1.5*u);
 }
 g.restore();
 if(girl)girlSkirt(p,outfit,m,ty,squash);
 const held=()=>{if(pose.prop&&!back)drawProp(p,pose.prop,pose.propAt??[0,-620],u);};
 // A box is always carried in front: full arms, head, box, then only the wrists over its edge. No threshold.
 const carried=pose.prop==='box'&&!back;
 if(!carried)held();
 ruffles();

 // A cupped hand belongs in front of the jaw, so posed hands wait until the head is drawn.
 const high=front&&!carried&&bow===0&&Math.min(...arms.map(a=>a.b[1]))<chin+drop+10;
 if(front&&!high)drawArms();

 g.save();g.translate(0,drop);g.translate(0,chin);g.rotate(tilt);g.translate(0,-chin);
 const flush=clamp(face.flush??0);
 if(!girl&&!back)for(const q of [-1,1]){
  const pts=spline(([[q*44,-6],[q*53,-9],[q*58,0],[q*54,12],[q*46,14]] as P[]).map(([x,y])=>[x*u,hc+y*u] as P));
  // He blushes in his ears first.
  const es=mix(c.skin,'#d9777a',flush*.6);p.shadedFill(pts,es,mul(es,SKIN_SHADE),LIGHT,70);edge(p,pts,2.4*u,INK);
 }
 const H:Blob={a:m.a,b:m.b,nTop:m.top,nBot:m.bot,egg:m.egg,asym:m.asym,rot:m.rot,noise:.008,seed:m.seed},full=face.full??0;
 const head=blobPts(0,hc,H,96).map(([x,y])=>{const k=x>0?Math.exp(-((((y-hc)/u-21)/13)**2)):0;return[x*(1+.125*full*k),y] as P;});
 p.shadedFill(head,c.skin,mul(c.skin,SKIN_SHADE),LIGHT,m.a);
 if(flush>0&&!back)p.clip(head,()=>{
  for(const q of [-1,1]){
   g.save();g.translate(q*28*u,hc+14.5*u);g.scale(1,.55);
   const r=g.createRadialGradient(0,0,u,0,0,19*u),a=flush*(girl?.34:.16);
   r.addColorStop(0,`rgba(208,104,106,${a})`);r.addColorStop(.45,`rgba(208,104,106,${a*.7})`);r.addColorStop(1,'rgba(208,104,106,0)');
   g.fillStyle=r;g.fillRect(-19*u,-19*u,38*u,38*u);g.restore();
  }
 });
 if(girl)p.inkRing(head,4.3*u,THICK);else p.inkRing(head,2.3*u,THICK,0); // same weight as his hair outline, on request
 if(back){
  if(girl){
   const pts=spline(([[0,-56],[-44,-43],[-56,-6],[-60,40],[-66,100],[-62,146],[-20,152],[20,149],[64,146],[66,100],[60,40],[56,-6],[44,-43]] as P[]).map(([x,y])=>[x*u,hc+y*u] as P));
   cel(p,pts,pose.hair??C.kaoruko.hair,pose.hair?mul(pose.hair,[.78,.78,.8]):C.kaoruko.hairDark,-3*u,-3*u);edge(p,pts,2.8*u,C.kaoruko.hairInk);
  }else boyHair(p,u,hc,true,pose.hair);
 }else{
  if(girl)girlFront(p,u,hc);
  else{
   boyHair(p,u,hc,false);
   for(const q of [-1,1]){
    p.ell(q*54*u,hc+8*u,1.5*u,1.5*u,'#d6d9dd',.9*u);
    const ring=Array.from({length:21},(_,i)=>[q*54*u+2.7*u*Math.cos(i/20*Math.PI*2),hc+12.6*u+3.7*u*Math.sin(i/20*Math.PI*2)] as P);
    p.stroke(ring,2.1*u);p.stroke(ring,u,'#bfc5cc');
   }
  }
  drawBrows(p,role,face,hc,u);drawEyes(p,role,face,hc,u,c.skin);drawMouth(p,role,face,hc,u);
  if(face.crumb){p.ell(7.4*u,hc+24*u,1.6*u,1.2*u,'#a87848',0);p.ell(10.6*u,hc+27*u,.9*u,.8*u,'#a87848',0);}
 }
 g.restore();
 if(carried){held();drawArms(11);}
 if(high)drawArms();
 g.restore();

 if(shade>0){
  g.save();g.globalCompositeOperation='source-atop';
  g.fillStyle=`rgba(24,26,38,${.68*shade})`;g.fillRect(-1100,-2300,2200,2400);g.restore();
 }
}
