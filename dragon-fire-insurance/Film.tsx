import React,{useMemo,useLayoutEffect} from 'react';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame,getInputProps} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {EffectComposer,RenderPass,EffectPass,BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK,noInkFallback} from './lib/ink';
import {LensBlur} from './lib/lensblur';
import {GradeEffect,GRADES} from './lib/grade';
import {CHAR} from './lib/shade';
import {ctex} from './lib/paint';
import {Actor} from './Cast';
import {Village,StoryProps} from './World';
import {cameraAt,stateAt,performerFeetAt,CAPTIONS,ease} from './story';

function Sky(){
 const texture=useMemo(()=>ctex('dragon-sky',512,1024,g=>{const gr=g.createLinearGradient(0,0,0,1024);gr.addColorStop(0,'#7299bd');gr.addColorStop(.65,'#c6d7db');gr.addColorStop(1,'#f0d6ac');g.fillStyle=gr;g.fillRect(0,0,512,1024);}),[]);
 const cloud=useMemo(()=>ctex('dragon-cloud',512,256,g=>{g.fillStyle='#f1e9d4';for(const [x,y,r]of [[100,135,62],[180,90,80],[280,105,90],[385,145,60]]){g.beginPath();g.ellipse(x,y,r,r*.7,0,0,7);g.fill();}}),[]);
 return <group>
  <mesh position={[0,22,-66]} onUpdate={o=>o.layers.set(NOINK)}><planeGeometry args={[160,100]}/><meshBasicMaterial map={texture} depthWrite={false}/></mesh>
  {[-1,0,1].map((n,i)=><mesh key={i} position={[n*18-5,14+i*2,-51-i*3]} onUpdate={o=>o.layers.set(NOINK)}><planeGeometry args={[16,8]}/><meshBasicMaterial map={cloud} transparent depthWrite={false}/></mesh>)}
  <mesh position={[-17,18,-55]} onUpdate={o=>o.layers.set(NOINK)}><sphereGeometry args={[1.6,24,16]}/><meshBasicMaterial color={new THREE.Color(2.3,1.7,.95)}/></mesh>
 </group>;
}
function Stage({frame}:{frame:number}){
 const {camera,scene,gl,size}=useThree(),cam=camera as THREE.PerspectiveCamera;
 const view=cameraAt(frame),state=stateAt(frame),cold=state.night?1:ease(frame,550,632)*.6;
 cam.near=.04;cam.far=160;cam.position.set(...view.eye);cam.fov=view.fov;cam.lookAt(...view.look);cam.layers.enable(NOINK);cam.updateProjectionMatrix();cam.updateMatrixWorld();
 const post=useMemo(()=>{
  const composer=new EffectComposer(gl,{multisampling:2,frameBufferType:THREE.HalfFloatType});
  const ink=new InkPass(scene,cam,{widthNear:3.3,widthFar:2.3,creaseScale:.55,concaveGain:.35});
  const lens=new LensBlur({maxCoC:17,nearScale:.65});
  const bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.22,luminanceThreshold:1.2,luminanceSmoothing:.2,mipmapBlur:true,levels:5});
  const grade=new GradeEffect(GRADES.golden,.28);
  composer.addPass(new RenderPass(scene,cam));composer.addPass(ink);
  composer.addPass(new EffectPass(cam,lens.pre));composer.addPass(new EffectPass(cam,lens.main));
  composer.addPass(new EffectPass(cam,bloom,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade));
  return{composer,lens,grade};
 },[gl,scene,cam]);
 useLayoutEffect(()=>{post.composer.setSize(size.width,size.height)},[post,size]);
 useLayoutEffect(()=>()=>{post.composer.dispose();post.lens.dispose()},[post]);
 useFrame(()=>{
  const forward=new THREE.Vector3();cam.getWorldDirection(forward);
  post.lens.focus=Math.max(.2,new THREE.Vector3(...view.look).sub(cam.position).dot(forward));post.lens.cInf=view.blur;
  post.grade.set(GRADES.golden,GRADES.day,cold);
  CHAR.uCharTint.value.set(1.04-cold*.12,.99, .92+cold*.15);CHAR.uCharShade.value=.84;CHAR.uGrad.value=.045;CHAR.uBodyGrad.value=.1;
  noInkFallback(scene);post.composer.render();
 },1);
 return <>
  <color attach="background" args={['#cbd7d9']}/><fog attach="fog" args={[cold>.8?'#8597ae':'#c9d2d0',24,85]}/>
  <Sky/><hemisphereLight args={['#e1e8eb','#9d8679',1.25]}/><ambientLight intensity={.38}/>
  <directionalLight position={[-7,12,8]} color={cold>.4?'#d0dfff':'#ffdfaf'} intensity={cold>.8?1.2:2.15} castShadow
   shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-camera-near={.1} shadow-camera-far={45} shadow-normalBias={.014} shadow-bias={-.00008}
   onUpdate={l=>l.shadow.camera.layers.enable(NOINK)}/>
  <Village frame={frame}/><StoryProps frame={frame}/>
  <Actor pose={{...state.dragon,feet:performerFeetAt(frame,'dragon')}}/>
  {(!state.ending&&frame<555)&&<Actor pose={{...state.baker,feet:performerFeetAt(frame,'baker')}}/>}
  {state.ending&&<Actor pose={{...state.child,feet:performerFeetAt(frame,'child')}}/>}
 </>;
}
export function Film({from=0}:{from?:number}){
 const local=useCurrentFrame(),frame=from+local;
 const props=getInputProps() as {captions?:boolean;pixelRatio?:number};
 const caption=props.captions===false?undefined:CAPTIONS.find(c=>frame>=c.start&&frame<c.end);
 const pop=caption?1.04-.04*ease(frame,caption.start,caption.start+4):1;
 return <AbsoluteFill style={{background:'#c9d2d0'}}>
  <ThreeCanvas width={1080} height={1920} dpr={props.pixelRatio??1} shadows camera={{near:.04,far:160,fov:40}} gl={{antialias:false,alpha:false,preserveDrawingBuffer:true}}><Stage frame={frame}/></ThreeCanvas>
  <Audio src={staticFile('mix.wav')} startFrom={from}/>
  {caption&&<div style={{position:'absolute',top:'72%',left:'5%',width:'90%',textAlign:'center',fontFamily:'Arial Black, Arial, sans-serif',fontWeight:900,fontSize:76,lineHeight:1,color:'#fffdf4',WebkitTextStroke:'7px #241726',paintOrder:'stroke fill',textShadow:'0 4px 6px #24172677',transform:`scale(${pop})`}}>{caption.word}</div>}
 </AbsoluteFill>;
}
