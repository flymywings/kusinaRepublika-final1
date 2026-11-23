import React,{useMemo,useLayoutEffect} from 'react';
import {useThree,useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Pen,INK,blobPts,headBlob} from './lib/toon';
import {cardShade} from './lib/cardshade';
import {NOINK} from './lib/ink';
import {dragonHeadOutline,type P2,type V3,type Performer} from './story';

const curve=(a:P2,b:P2,c:P2):P2[]=>Array.from({length:16},(_,i)=>{const t=i/15,s=1-t;return[s*s*a[0]+2*s*t*b[0]+t*t*c[0],s*s*a[1]+2*s*t*b[1]+t*t*c[1]]});
export function drawDragon(p:Pen,a:Performer,h:{right:P2;left:P2;gaze:P2;feet?:[P2,P2]}){
 const green='#438b70',dark='#2d6757',light='#7bb184',panic=['panic','pain'].includes(a.mood);
 const run=a.walk?Math.sin(a.walk*Math.PI*2):0;
 p.ol=7;
 p.line(curve([565,761],[824,844],[920,694]),green,51);
 p.poly([[902,700],[939,646],[950,718]],'#e8c381',6);
 for(const s of [-1,1]){
  p.poly([[500+s*80,468],[500+s*251,335],[500+s*211,610],[500+s*128,647]],dark,8);
  p.poly([[500+s*93,471],[500+s*224,383],[500+s*190,573],[500+s*120,608]],'#c99683',5);
  p.stroke([[500+s*102,478],[500+s*193,558]],5,dark);
  const foot:P2=h.feet?.[s<0?0:1]??[500+s*87+run*s*38,961-Math.max(0,run*s)*32];
  p.line(curve([500+s*67,738],[500+s*104,855],foot),dark,39);
  p.ell(foot[0]+s*13,foot[1],65,18,green,7);
  for(let n=0;n<3;n++)p.poly([[foot[0]+s*(31+n*13),foot[1]-2],[foot[0]+s*(39+n*13),foot[1]+4],[foot[0]+s*(29+n*13),foot[1]+9]],'#eee0bb',3);
 }
 p.line([[500,345],[500,457]],green,93);
 const body=blobPts(500,592,{a:134,b:200,nTop:2,nBot:2.4,egg:.1,asym:0,rot:0,noise:.005,seed:81},48);
 p.gradFill(body,green,dark,-2);p.inkRing(body,8,1.3);
 p.ell(500,612,83,150,'#d9bd86',5);
 for(let y=510;y<742;y+=34)p.arc(500,y,75,14,0,180,3,'#a38f6b');
 p.poly([[390,438],[464,434],[500,536],[532,434],[609,448],[620,682],[534,714],[500,678],[464,715],[379,677]],'#673d54',7);
 p.poly([[441,437],[485,471],[500,514],[463,505]],'#e7cbaa',4);
 p.poly([[559,438],[518,472],[500,514],[539,506]],'#e7cbaa',4);
 for(let y=548;y<660;y+=32)p.dot(500,y,6,'#ddb45b');
 for(const [s,end] of [[-1,h.right],[1,h.left]] as [number,P2][]){
  const start:P2=[500+s*115,466],elbow:P2=[500+s*170,(466+end[1])*.5+24];
  p.line(curve(start,elbow,end),green,31);p.ell(end[0],end[1],23,18,green,5);
  for(let n=0;n<3;n++)p.stroke([[end[0]-10+n*9,end[1]-4],[end[0]-8+n*9,end[1]+7]],3,dark);
 }
 p.poly([[398,159],[389,86],[444,135]],'#ecd29b',7);
 p.poly([[557,136],[605,84],[602,164]],'#ecd29b',7);
 p.poly([[394,218],[361,178],[388,177]],dark,5);p.poly([[606,218],[641,182],[612,177]],dark,5);
 const head=dragonHeadOutline();p.shadedFill(head,light,dark,-2.1,130);p.inkRing(head,8,1.3);
 p.ell(500,294,95,52,'#7fa582',6);
 p.dot(464,287,5,dark);p.dot(535,287,5,dark);
 const dx=Math.max(-9,Math.min(9,(h.gaze[0]-500)/35)),dy=Math.max(-6,Math.min(7,(h.gaze[1]-246)/40));
 for(const s of [-1,1]){
  const x=500+s*43,y=225;
  if(a.blink>.7||a.mood==='sleep')p.arc(x,y+5,22,11,190,350,6);
  else{p.ell(x,y,24,panic?29:21,'#fff7da',6);p.dot(x+dx,y+dy,panic?8:9,INK);}
  const browY=panic?177:a.mood==='inspect'?190:184;
  p.stroke([[x-25,browY+(s<0&&a.mood==='smug'?11:0)],[x+23,browY+(s>0&&a.mood==='smug'?11:0)]],9,INK);
 }
 if(panic)p.ell(500,322,30,24,'#512635',6);
 else if(a.mood==='determined')p.stroke([[469,321],[532,321]],7);
 else if(a.mood==='inspect'||a.mood==='doubt')p.arc(500,335,29,11,205,335,6);
 else if(a.mood==='sleep')p.ell(500,320,12,8,'#512635',4);
 else p.arc(500,309,43,20,5,174,6);
 if(a.mood==='smug'||a.mood==='relief')p.poly([[518,325],[525,338],[531,321]],'#fff9e2',2);
}

export function drawHuman(p:Pen,a:Performer,h:{right:P2;left:P2;gaze:P2;feet?:[P2,P2]}){
 const kid=a.kind==='child',skin=kid?'#f5d5b2':'#f2d0ad',shirt=kid?'#cc8246':'#638a8d';
 const run=a.walk?Math.sin(a.walk*Math.PI*2):0,hip=kid?740:726;
 p.ol=7;
 p.line([[500,365],[500,425]],skin,35);
 for(const s of [-1,1]){
  const foot:P2=h.feet?.[s<0?0:1]??[500+s*48+run*s*23,963-Math.max(0,run*s)*29];
  p.stroke(curve([500+s*38,hip],[500+s*48,859],foot),16,'#393348');
  p.stroke([[foot[0]-18,foot[1]],[foot[0]+25,foot[1]]],23,INK);
 }
 const body=blobPts(500,568,{a:94,b:169,nTop:2,nBot:2.5,egg:.05,asym:0,rot:0,noise:.004,seed:kid?61:33},42);
 p.gradFill(body,shirt,'#42616d',-2);p.inkRing(body,8,1.4);
 if(!kid){p.poly([[447,425],[551,425],[575,704],[425,704]],'#f7edcf',7);p.stroke([[448,435],[552,435]],4,'#cabfa7');p.poly([[454,558],[549,558],[545,630],[457,630]],'#e6d6b8',4);}
 for(const [s,end] of [[-1,h.left],[1,h.right]] as [number,P2][]){p.line(curve([500+s*82,457],[500+s*132,530],end),shirt,19);p.dot(end[0],end[1],18,skin);p.arc(end[0],end[1],18,16,0,350,4);}
 const head=blobPts(500,276,headBlob(kid?61:33,118),48);p.shadedFill(head,skin,'#d3ad92',-2,128);p.inkRing(head,8,1.3);
 if(kid){p.poly([[384,232],[391,174],[430,147],[498,163],[550,148],[603,196],[610,233],[567,211],[541,196],[505,213],[461,187],[427,215]],'#6b4538',7);}
 else{p.poly([[400,186],[397,143],[604,142],[599,191]],'#f6f0dc',6);p.ell(448,132,52,43,'#fff7df',6);p.ell(502,118,59,48,'#fff7df',6);p.ell(557,130,50,42,'#fff7df',6);p.poly([[398,161],[603,161],[600,192],[400,192]],'#eee3c6',5);}
 const dx=Math.max(-7,Math.min(7,(h.gaze[0]-500)/40)),dy=Math.max(-4,Math.min(5,(h.gaze[1]-276)/55));
 for(const s of [-1,1]){
  const x=500+s*34,y=270;
  if(a.blink>.7)p.stroke([[x-14,y],[x+14,y]],6);
  else{p.ell(x,y,18,19,'#fff9e7',4);p.dot(x+dx,y+dy,7);}
  p.stroke([[x-20,y-32+(a.mood==='annoyed'?s*8:0)],[x+19,y-34-(a.mood==='annoyed'?s*8:0)]],7);
 }
 if(a.mood==='annoyed'||a.mood==='firm')p.stroke([[477,326],[524,326]],6);
 else p.arc(500,313,29,15,10,170,6);
}

export function Actor({pose}:{pose:Performer}){
 const {camera}=useThree(),dragon=pose.kind==='dragon',height=dragon?3.5:pose.kind==='child'?1.75:2.2;
 const resources=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1500;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
  const material=cardShade(new THREE.MeshLambertMaterial({map:texture,alphaTest:.45,side:THREE.DoubleSide}));
  const geometry=new THREE.PlaneGeometry(height,height);geometry.translate(0,height*.475,0);
  const depth=new THREE.MeshDepthMaterial({map:texture,alphaTest:.45,side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking});
  return{canvas,texture,material,geometry,depth};
 },[height]);
 const yaw=Math.atan2(camera.position.x-pose.pos[0],camera.position.z-pose.pos[2]);
 const update=()=>{
  const origin=new THREE.Vector3(...pose.pos),normal=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const project=(v:V3):P2=>{const ray=new THREE.Vector3(...v).sub(camera.position),den=normal.dot(ray),t=normal.dot(origin.clone().sub(camera.position))/(Math.abs(den)<1e-6?1e-6:den);const p=ray.multiplyScalar(t).add(camera.position).sub(origin);return[500+p.dot(right)/(height/1000),975-p.y/(height/1000)]};
  const ctx=resources.canvas.getContext('2d')!;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1500,1500);ctx.scale(1.5,1.5);
  const pen=new Pen(ctx);const hands={right:project(pose.right),left:project(pose.left),gaze:project(pose.gaze),feet:pose.feet?.map(project) as [P2,P2]|undefined};
  if(dragon)drawDragon(pen,pose,hands);else drawHuman(pen,pose,hands);
  resources.texture.needsUpdate=true;
 };
 useLayoutEffect(update,[pose,camera,yaw]);useFrame(update);
 useLayoutEffect(()=>()=>{resources.texture.dispose();resources.material.dispose();resources.geometry.dispose();resources.depth.dispose()},[resources]);
 return <group position={pose.pos}>
  <mesh rotation-x={-Math.PI/2} position={[0,.015,0]} scale={[dragon?.7:.25,dragon?.32:.12,1]} onUpdate={o=>o.layers.set(NOINK)}><circleGeometry args={[1,32]}/><meshBasicMaterial color="#41364b" transparent opacity={.25} depthWrite={false}/></mesh>
  <mesh rotation-y={yaw} geometry={resources.geometry} material={resources.material} customDepthMaterial={resources.depth} castShadow receiveShadow onUpdate={o=>o.layers.set(NOINK)}/>
 </group>;
}
