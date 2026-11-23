import React,{useMemo,useRef,useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useFrame,useThree} from '@react-three/fiber';
import {Beat,Person,CARD_HEIGHT} from './contract';
import {Gem,MoneyBag} from './props';
import {Pen} from '../bridge-recreation/toon';
import {cardShade,CARD_K} from '../bridge-recreation/cardshade';
import {NOINK} from '../bridge-recreation/ink';
import {castAt,handAnchors,GEM_SIZE,Pose,V3} from './acting';
import {drawPerson,P2} from './draw';
function Actor({pose}:{pose:Pose}){
 const {camera}=useThree(),ref=useRef<THREE.Mesh>(null);
 const resources=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1500;
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  const mat=cardShade(new THREE.MeshLambertMaterial({map:tex,alphaTest:.45,side:THREE.DoubleSide}));
  const geo=new THREE.PlaneGeometry(CARD_HEIGHT*1.2,CARD_HEIGHT);geo.translate(0,CARD_HEIGHT*.475,0);
  const depth=new THREE.MeshDepthMaterial({map:tex,alphaTest:.45,depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
  return {canvas,tex,mat,geo,depth};
 },[]);
 useLayoutEffect(()=>()=>{resources.tex.dispose();resources.mat.dispose();resources.geo.dispose();resources.depth.dispose();},[resources]);
 const update=()=>{
  const mesh=ref.current;if(!mesh)return;
  const origin=new THREE.Vector3(...pose.pos),yaw=Math.atan2(camera.position.x-origin.x,camera.position.z-origin.z);
  mesh.rotation.y=yaw;
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),normal=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  // Ink hand/physical prop project to the same screen point, including oblique camera views.
  const project=(target:V3|undefined):P2|undefined=>{
   if(!target)return;
   const ray=new THREE.Vector3(...target).sub(camera.position),den=normal.dot(ray);
   const t=normal.dot(origin.clone().sub(camera.position))/(Math.abs(den)<1e-6?1e-6:den);
   const p=ray.multiplyScalar(t).add(camera.position).sub(origin),unit=CARD_HEIGHT/1000*pose.scale;
   return [300+p.dot(right)/unit,975-p.y/unit];
  };
  const ctx=resources.canvas.getContext('2d')!;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1800,1500);ctx.scale(1.5,1.5);ctx.translate(300,0);
  drawPerson(new Pen(ctx),pose,{left:project(pose.left),right:project(pose.right)});resources.tex.needsUpdate=true;CARD_K.uPx.value=1;
 };
 useLayoutEffect(update,[pose,camera]);useFrame(update);
 return <group position={pose.pos}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.009,0]} scale={[.25*pose.scale,.07*pose.scale,1]} renderOrder={.5} onUpdate={o=>o.layers.set(NOINK)}><circleGeometry args={[1,32]}/><meshBasicMaterial color="#302b36" transparent opacity={.27} depthWrite={false}/></mesh>
  <mesh ref={ref} geometry={resources.geo} material={resources.mat} customDepthMaterial={resources.depth} scale={pose.scale} castShadow receiveShadow onUpdate={o=>o.layers.set(NOINK)}/>
 </group>;
}
export function Cast({frame,beat}:{frame:number;beat:Beat}){
 const poses=castAt(frame,beat),h=handAnchors(frame);
 const showGems=!['investigate','clue','empty'].includes(beat);
 return <group>
  {poses.map(p=><Actor key={p.id} pose={p}/>)}
  {showGems&&<><group position={h.diamond}><Gem kind="diamond" size={GEM_SIZE.diamond}/></group><group position={h.ruby}><Gem kind="ruby" size={GEM_SIZE.ruby}/></group></>}
  {(beat==='payout'||beat==='payoff')&&<group position={[h.bag[0],h.bag[1]-.44*.85,h.bag[2]]}><MoneyBag size={.85}/></group>}
  {beat==='london'&&<group><mesh position={[.98,1.39,.08]} rotation={[0,0,.25]}><capsuleGeometry args={[.07,.52,5,10]}/><meshStandardMaterial color="#45344d"/></mesh><mesh position={[.72,1.27,.08]}><sphereGeometry args={[.09,12,8]}/><meshStandardMaterial color="#f3d6b4"/></mesh></group>}
 </group>;
}
export function CastSheet({frame}:{frame:number}){
 const ids:Person[]=['arnold','slack','investorA','investorB','engineer','king'];
 return <group>{ids.map((id,i)=><Actor key={id} pose={{id,pos:[(i%3-1)*1.38,0,-Math.floor(i/3)*1.4],scale:id==='arnold'?1.08:id==='slack'?.91:.98,mood:i<2?'sly':i===2?'eager':i===4?'approve':'calm',look:i%2?-1:1,lean:0,head:0,kneel:0,blink:0,bob:0,walk:0,view:'front',prop:id==='engineer'?'book':id==='king'?'lens':undefined}}/>)}</group>;
}
export {castAt,actorAt,handAnchors,GEM_SIZE} from './acting';
