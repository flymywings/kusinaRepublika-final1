// Rules check for the test stills, computed from the same story data the render uses (no pixels guessed).
// node rules.mjs <frames,comma,separated>  ->  prints JSON. Bundled by rules.mjs with esbuild.
import {project,WF,type Shot} from './story';
import {layersAt} from './timeline';
import {SET} from './consts';
import captions from './captions.json';

const W=1080,H=1920;
export interface Box {u0:number;u1:number;v0:number;v1:number}
const pitchOf=(s:Shot)=>Math.atan2(s.eye[1]-s.look[1],Math.hypot(s.eye[0]-s.look[0],s.eye[2]-s.look[2]))*180/Math.PI;
function boxOf(s:Shot,c:[number,number,number],hw:number,top:number,bot:number):Box{
 const p=pitchOf(s),pts=[[c[0]-hw,c[1]+top],[c[0]+hw,c[1]+top],[c[0]-hw,c[1]-bot],[c[0]+hw,c[1]-bot]].map(([x,y])=>project(s.eye,p,s.fov,[x,y,c[2]]));
 return {u0:Math.min(...pts.map(q=>q.u)),u1:Math.max(...pts.map(q=>q.u)),v0:Math.min(...pts.map(q=>q.v)),v1:Math.max(...pts.map(q=>q.v))};
}
/** Head boxes include the hair: her crown is 55 u above the eye line, his 66 u (u = head half width / 50). */
export function faces(s:Shot):{id:string;box:Box}[]{
 const out:{id:string;box:Box}[]=[];
 for(const a of s.actors){
  if(a.pose.back)continue;
  if(a.role==='kaoruko'){const u=.245/50,hc=1.048+(a.at[1]-SET.seat[1]);out.push({id:'her',box:boxOf(s,[a.at[0],hc,a.at[2]],58*u,55*u,.226+.01)});}
  else{const sc=a.glass?.scale??1,u=.28/50*sc,head=a.at[1]+1.639*sc;out.push({id:a.glass?'his reflection':'his real face',box:boxOf(s,[a.at[0],head,a.at[2]],60*u,66*u,.259*sc+.01)});}
 
 }
 return out;
}
export function captionBox(frame:number):{word:string;box:Box}|undefined{
 const c=captions.find(x=>frame>=x.from&&frame<x.to);if(!c)return;
 const w=c.word.length*72*.6+40,h=72*1.2+16;
 return {word:c.word,box:{u0:.5-w/2/W,u1:.5+w/2/W,v0:.7-h/2/H,v1:.7+h/2/H}};
}
const hit=(a:Box,b:Box)=>a.u0<b.u1&&b.u0<a.u1&&a.v0<b.v1&&b.v0<a.v1;

// Prop manifest: every distinct prop that can be in these shots, with a world position. `when` limits it to a layer.
type M={id:string;at:[number,number,number];when?:'eve'|'morn'|'street';from?:number};
const T=SET.table.top;
const MANIFEST:M[]=[
 {id:'fg cup and saucer',at:[.72,T+.04,-.62]},{id:'fg cake plate',at:[.97,T+.03,-.84]},{id:'fg fork',at:[1.06,T+.02,-.8]},{id:'fg salt',at:[.82,T+.035,-1.0]},{id:'fg pepper',at:[.86,T+.035,-1.0]},{id:'fg napkin',at:[.6,T+.01,-1.0]},{id:'fg menu card',at:[.64,T+.07,-.5]},{id:'booth plant',at:[.38,1.0,-2.97]},{id:'book stack',at:[1.28,.95,-2.95]},{id:'cushion left',at:[.42,.6,-2.64]},{id:'cushion right',at:[1.3,.6,-2.64]},{id:'jam jar',at:[.7,T+.04,-1.4]},{id:'sugar dish',at:[.98,T+.02,-1.35]},{id:'coaster and spoon',at:[.55,T+.01,-1.55]},{id:'reflected menu board',at:[.4,2.0,-3.1]},{id:'reflected shelf jars',at:[1.4,1.3,-3.1]},{id:'reflected window',at:[.4,1.4,-3.1]},{id:'framed mirror',at:[.88,1.57,-3.1]},{id:'display case',at:[-1.5,.8,-1.5]},{id:'cakes in case',at:[-1.5,.95,-1.5]},{id:'pendant lamp 1',at:[-1.5,2.6,-1.3]},{id:'pendant lamp 2',at:[1,2.6,-1.3]},{id:'door',at:[-1.2,1.1,3.2]},{id:'front window',at:[1.4,1.6,3.2]},{id:'second table',at:[2.35,.72,.9]},{id:'chair 1',at:[2.35,.4,1.4]},{id:'chair 2',at:[2.35,.4,.4]},{id:'plant right',at:[2.75,.6,-2.7]},{id:'plant back',at:[-.35,.3,-2.85]},{id:'wall shelves',at:[-1.55,1.9,-2.97]},{id:'menu board',at:[2.85,2.3,-3.1]},{id:'kitchen wall panel',at:[0,.46,-3.1]},{id:'rug',at:[.8,.01,-1.7]},{id:'bag under table',at:[.3,.12,-1.2]},
 {id:'near plate with slice',at:[.5,T+.03,-.85]},{id:'near cup',at:[1.13,T+.03,-.72]},{id:'near plate with fork',at:[1.05,T+.015,-1.05]},{id:'small frame',at:[1.8,1.3,-3.09]},{id:'wall print',at:[1.78,1.8,-3.09]},{id:'cup shelf',at:[1.72,1.55,-3.02]},{id:'teapot',at:[1.16,T+.08,-1.72]},{id:'spoon jar',at:[.27,T+.05,-1.82]},{id:'butter dish',at:[.27,T+.02,-1.62]},{id:'wall clock',at:[1.95,2.0,-3.07]},{id:'bud vase',at:[.5,T+.1,-1.3]},{id:'wall sconce',at:[1.9,1.6,-3.0]},{id:'booth backs',at:[.95,.66,-3]},
 {id:'long table',at:[.8,T,-1.0]},{id:'teacup',at:[.34,T+.03,-1.93]},{id:'saucer',at:[.34,T+.005,-1.93]},{id:'sugar pot',at:[1.27,T+.04,-1.95]},
 {id:'napkin holder',at:[.33,T+.05,-1.55]},{id:'menu stand',at:[1.26,T+.06,-1.52]},{id:'salt',at:[.38,T+.03,-1.74]},{id:'pepper',at:[.42,T+.03,-1.74]},
 {id:'foreground cup and saucer',at:[1.2,T+.03,-.35]},{id:'folded napkin',at:[.42,T+.01,-.3]},{id:'cutlery',at:[.48,T+.02,-.78]},
 // floor items (rug, bag, shoes, basket, umbrella stand) sit under the long table and are not counted: the table top hides them

 ...[[.8,-1.73],[.97,-1.71],[1.13,-1.78],[1.08,-1.5],[.78,-1.38],[.93,-1.3]].map(([x,z],i):M=>({id:'plate stack '+(i+1),at:[x,T+.1,z],when:'eve'})),
 ...[[.8,-1.73],[.97,-1.71],[1.08,-1.5],[.93,-1.3]].map(([x,z],i):M=>({id:'cake slice '+(i+1),at:[x,T+.2,z],when:'eve'})),
 {id:'water glass',at:[1.2,T+.05,-1.3],when:'eve'},{id:'fork',at:[.42,1.0,-2.45],when:'eve'},
 {id:'coin 1',at:[.6,T,-1.8],when:'morn',from:WF.buy},{id:'coin 2',at:[.67,T,-1.77],when:'morn',from:103},{id:'slice box',at:[.9,T+.04,-1.9],when:'morn',from:96},
 {id:'small ball cup',at:[1.16,T+.1,-1.8],when:'morn'},
 // street (shot 2A)
 ...([['cafe awning',[1.4,2.65,3.6]],['cafe sign Wennavi Corsel',[1.4,2.86,3.3]],['cafe window',[1.4,1.6,3.2]],['cafe door',[-1.2,1.1,3.2]],['hanging sign Fumbrel',[-1.2,2.6,3.7]],
  ['sign board Oskarel',[2.05,.45,4.3]],['bike 1',[-.7,.4,3.95]],['bike 2',[-1.15,.4,3.9]],['bike 3',[1.95,.4,5.2]],['lamp post',[2.6,1.3,5.6]],['bench',[-.4,.45,5.3]],['bin',[2.4,.4,4.1]],
  ['bollard 1',[.15,.36,5.6]],['bollard 2',[1.85,.36,5.6]],['crate',[-.35,.3,5.4]],['hanging basket 1',[.55,2.2,3.6]],['hanging basket 2',[1.45,2.2,3.6]],['board Dallowt',[.35,.4,4.05]],['bike 4',[1.6,.4,3.9]],['window box',[1.1,.8,3.48]],['milk churn',[1.78,.3,4.55]],['bunting',[.9,2.3,3.5]],['small sign Fumbrel',[1.95,1.2,3.4]],['bucket and brush',[-.1,.2,4.55]],['pot plant 5',[.05,.3,4.9]],['pot plant 6',[1.95,.3,4.95]],['pot',[1.55,.1,4.5]],['step box',[.3,.1,4.35]],['wall lantern',[.12,2.1,3.4]],['hanging basket',[1.95,2.2,3.6]],['notice board',[.55,1.0,3.36]],['drainpipe',[2.75,1.6,3.38]],['flower stand',[2.15,.4,4.7]],['mailbox',[-.65,.6,4.8]],['street sign pole',[2.4,1.5,6]],['milk crates',[-.9,.3,5.6]],['scooter',[1.7,.4,5.9]],['second table inside',[2.35,.72,.9]],['chairs inside',[2.35,.4,1.4]],['plant inside',[2.75,.6,-2.7]],['outdoor table',[4.2,.36,6.2]],
  ['planter 1',[-2.15,.4,3.65]],['planter 2',[2.95,.4,3.7]],['planter 3',[.2,.3,3.7]],['planter 4',[2.5,.3,3.75]],['left shop Tarvonel Hosk',[-6.1,2.25,3.4]],['right shop Quillby Nerrow',[6.1,2.25,3.4]],
  ['left awning',[-6.1,2.45,3.6]],['right awning',[6.1,2.45,3.6]],['pendant lamp inside',[1.0,2.6,-1.3]],['menu board inside',[2.85,2.3,-3.1]],['cake case inside',[-1.5,.8,-1.5]],['back building',[0,5,-5]]] as [string,number[]][])
  .map(([id,at])=>({id,at:at as [number,number,number],when:'street' as const})),
];
export function props(s:Shot,phase:'eve'|'morn'|'street',frame:number){
 const p=pitchOf(s),list=MANIFEST.filter(m=>((!m.when&&phase!=='street')||m.when===phase)&&(m.from===undefined||frame>=m.from));
 const inFrame=list.filter(m=>{const q=project(s.eye,p,s.fov,m.at);return q.d>0&&q.u>-.03&&q.u<1.03&&q.v>-.03&&q.v<1.03;});
 return {count:inFrame.length,ids:inFrame.map(m=>m.id)};
}
export function check(frame:number){
 const layers=layersAt(frame),top=layers.length>1&&layers[1].opacity<.5?layers[0]:layers[layers.length-1],s=top.shot;
 const phase=s.id==='2A'?'street':s.id==='1B'?'morn':'eve';
 const f=faces(s),cap=captionBox(frame);let pr=props(s,phase as any,frame);
 if(layers.length>1){const o=layers.map(l=>props(l.shot,l.shot.id==='2A'?'street':l.shot.id==='1B'?'morn':'eve',frame));const ids=[...new Set(o.flatMap(x=>x.ids))];pr={count:ids.length,ids};}
 // during the dissolve both layers are on screen: count props of the evening layer too
 const faceChecks=f.map(x=>({id:x.id,box:x.box,inside:x.box.u0>=0&&x.box.u1<=1&&x.box.v0>=0&&x.box.v1<=1,above70:x.box.v1<=.7}));
 return {frame,shot:s.id,faces:faceChecks,caption:cap?{word:cap.word,overlapsFace:f.some(x=>hit(x.box,cap.box)),box:cap.box}:null,props:pr,
  words:cap?.word.split(' ').length??0,
  pitch:pitchOf(s)};
}


/** camera movement between frame f and f+1 as a share of the distance to the look point (the user's gate: 0.15 % or more) */
export function drift(f:number){
 const a=layersAt(f).at(-1)!.shot,b=layersAt(f+1).at(-1)!.shot;
 const d=Math.hypot(a.eye[0]-a.focus[0],a.eye[1]-a.focus[1],a.eye[2]-a.focus[2]);
 return Math.hypot(a.eye[0]-b.eye[0],a.eye[1]-b.eye[1],a.eye[2]-b.eye[2])/d*100;
}

/** Box handoff (frames 99-148): where the box and the fingertips are on screen, and whether the box clears the caption band. */
export function boxCheck(frame:number){
 const layers=layersAt(frame),s=layers[layers.length-1].shot;if(!s.slice)return null;
 const p=pitchOf(s),b=s.slice.p,T=SET.table.top;
 const corners=[[-.1,-.0625],[.1,-.0625],[-.1,.0625],[.1,.0625]].flatMap(([dx,dz])=>[0,.13].map(dy=>project(s.eye,p,s.fov,[b[0]+dx,T+dy,b[2]+dz])));
 const bbox:Box={u0:Math.min(...corners.map(q=>q.u)),u1:Math.max(...corners.map(q=>q.u)),v0:Math.min(...corners.map(q=>q.v)),v1:Math.max(...corners.map(q=>q.v))};
 const her=s.actors.find(a=>a.id==='her')!,h=her.pose.hands![1];
 const dot=project(s.eye,p,s.fov,[her.at[0]+h[0]/1000,her.at[1]-h[1]/1000,her.at[2]]);
 const lip=project(s.eye,p,s.fov,[b[0]+.085,T+.056,b[2]-.058]);
 const rU=.026/(dot.d*Math.tan(s.fov*Math.PI/360)*2*(9/16));
 const cap=captionBox(frame);
 return {frame,box:bbox,dot:{u:+dot.u.toFixed(3),v:+dot.v.toFixed(3)},lip:{u:+lip.u.toFixed(3),v:+lip.v.toFixed(3)},
  dotToLipPx:+(Math.hypot((dot.u-lip.u)*720,(dot.v-lip.v)*1280)).toFixed(1),dotRadiusPx:+(rU*720).toFixed(1),
  clearOfCaption:cap?(bbox.v1<cap.box.v0||bbox.v0>cap.box.v1):true,captionBand:cap?[+cap.box.v0.toFixed(3),+cap.box.v1.toFixed(3)]:null};
}
