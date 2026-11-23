import React,{useMemo,useRef,useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useFrame,useThree} from '@react-three/fiber';
import {Beat,Person,CARD_HEIGHT} from './contract';
import {Gem,MoneyBag} from './props';
import {Pen} from '../bridge-recreation/toon';
import {cardShade,CARD_K} from '../upstream/templates/bridge/cardshade';
import {NOINK} from '../bridge-recreation/ink';
import {castAt,handAnchors,GEM_SIZE,Pose,V3} from './acting';
import {drawPerson,P2} from './draw';
export function Actor({pose}:{pose:Pose}){
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
  const target=project(pose.gazeTarget),cy=975-2.5*222-111+pose.kneel*222*1.2;
  const directed=target?{...pose,gaze:[Math.max(-9,Math.min(9,(target[0]-300)/18)),Math.max(-6,Math.min(6,(target[1]-cy)/22))] as [number,number]}:pose;
  drawPerson(new Pen(ctx),directed,{left:project(pose.left),right:project(pose.right),feet:pose.feet?.map(p=>project(p)!) as [P2,P2]|undefined});resources.tex.needsUpdate=true;CARD_K.uPx.value=1;
 };
 useLayoutEffect(update,[pose,camera]);useFrame(update);
 return <group position={pose.pos}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.009,0]} scale={[.25*pose.scale,.07*pose.scale,1]} renderOrder={.5} onUpdate={o=>o.layers.set(NOINK)}><circleGeometry args={[1,32]}/><meshBasicMaterial color="#302b36" transparent opacity={.27} depthWrite={false}/></mesh>
  <mesh ref={ref} geometry={resources.geo} material={resources.mat} customDepthMaterial={resources.depth} scale={pose.scale} castShadow receiveShadow onUpdate={o=>o.layers.set(NOINK)}/>
 </group>;
}
function Grip({position,size}:{position:V3;size:number}){
 const {camera}=useThree(),g=useRef<THREE.Group>(null);
 useFrame(()=>{if(g.current)g.current.rotation.y=Math.atan2(camera.position.x-position[0],camera.position.z-position[2]);});
 return <group ref={g} position={position}>
  {[-1,1].map(s=><mesh key={s} position={[s*size*.72,size*(s<0?.45:-.05),size*.67]} scale={[size*.22,size*.38,size*.24]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial color="#241726"/></mesh>)}
 </group>;
}
export function Cast({frame,beat}:{frame:number;beat:Beat}){
 const poses=castAt(frame,beat),h=handAnchors(frame);
 const digger=poses.find(p=>p.id==='king'),digPhase=frame<710?Math.max(0,(frame-670)/13)%1:0;
 const merchantHand:V3=frame<=766?h.diamond:[.72+Math.min(1,(frame-766)/16)*.45,1.27,.08];
 const showGems=!['investigate','clue','empty'].includes(beat);
 const gripped=(p:V3)=>poses.some(a=>[a.left,a.right].some(t=>t&&t.every((n,i)=>Math.abs(n-p[i])<.0001)));
 return <group>
  {poses.map(p=><Actor key={p.id} pose={p}/>)}
  {(beat==='collect'||beat==='expert')&&frame>=348&&<group position={[h.diamond[0],h.diamond[1],h.diamond[2]+.07]}>
   <mesh onUpdate={o=>o.layers.set(NOINK)}><torusGeometry args={[.073,.008,7,32]}/><meshBasicMaterial color="#241726"/></mesh>
   <mesh><circleGeometry args={[.067,32]}/><meshBasicMaterial color="#b9ded6" transparent opacity={.10} depthWrite={false}/></mesh>
   <mesh position={[-.075,-.105,0]} rotation={[0,0,-.66]} onUpdate={o=>o.layers.set(NOINK)}><cylinderGeometry args={[.012,.012,.114,8]}/><meshBasicMaterial color="#241726"/></mesh>
  </group>}

  {beat==='clue'&&digger?.right&&<group position={digger.right} rotation={[.12*Math.sin(digPhase*Math.PI),0,-.18*Math.sin(digPhase*Math.PI)]}><mesh position={[0,-.16,0]}><cylinderGeometry args={[.018,.018,.32,8]}/><meshStandardMaterial color="#8d603b"/></mesh><mesh position={[0,-.38,0]} rotation={[.15,0,0]}><boxGeometry args={[.16,.20,.035]}/><meshStandardMaterial color="#7b8990" roughness={.72}/></mesh></group>}
  {showGems&&<><group position={h.diamond} rotation={[0,beat==='expert'&&frame>=365&&frame<384?Math.sin((frame-365)/19*Math.PI)*.45:0,0]}><Gem kind="diamond" size={GEM_SIZE.diamond}/></group><group position={h.ruby}><Gem kind="ruby" size={GEM_SIZE.ruby}/></group>{gripped(h.diamond)&&<Grip position={h.diamond} size={GEM_SIZE.diamond}/>} {gripped(h.ruby)&&<Grip position={h.ruby} size={GEM_SIZE.ruby}/>}</>}
  {(beat==='hook'||beat==='payout'||beat==='cashout'||beat==='payoff')&&<group position={[h.bag[0],h.bag[1]-.44*.85,h.bag[2]]}><MoneyBag size={.85}/></group>}
  {beat==='london'&&<group><mesh position={[1.02,1.30,.08]} rotation={[0,0,-1.3]}><capsuleGeometry args={[.07,.52,5,10]}/><meshStandardMaterial color="#45344d"/></mesh><mesh position={[merchantHand[0],merchantHand[1]-.055,merchantHand[2]-.005]}><sphereGeometry args={[.035,12,8]}/><meshBasicMaterial color="#f3d6b4"/></mesh></group>}
 </group>;
}
export function CastSheet({frame}:{frame:number}){
 const ids:Person[]=['arnold','slack','investorA','investorB','engineer','king'];
 return <group>{ids.map((id,i)=><Actor key={id} pose={{id,pos:[(i%3-1)*1.38,Math.floor(i/3)*2.3,0],scale:id==='arnold'?1.08:id==='slack'?.91:.98,mood:i<2?'sly':i===2?'eager':i===4?'approve':'calm',look:i%2?-1:1,lean:0,head:0,kneel:0,blink:0,bob:0,walk:0,view:'front',prop:id==='engineer'?'book':id==='king'?'lens':undefined}}/>)}</group>;
}
export {castAt,actorAt,handAnchors,GEM_SIZE} from './acting';


