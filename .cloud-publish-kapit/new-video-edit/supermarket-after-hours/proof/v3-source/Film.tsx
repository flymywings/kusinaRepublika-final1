import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {useThree,useFrame} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {EffectComposer,EffectPass,RenderPass,BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from './lib/ink';
import {LensBlur} from './lib/lensblur';
import {GradeEffect,GRADES} from './lib/grade';
import {CHAR} from './lib/shade';
import {Person} from './ReferenceCast';
import {World,StoryProps} from './World';
import {stateAt,viewAt,ease} from './story';
import captions from './captions.json';

function Stage({frame}:{frame:number}){
 const {camera,gl,scene,size}=useThree(),cam=camera as THREE.PerspectiveCamera;
 const view=viewAt(frame),state=stateAt(frame);
 const post=useMemo(()=>{const composer=new EffectComposer(gl,{multisampling:2,frameBufferType:THREE.HalfFloatType});const ink=new InkPass(scene,cam),lens=new LensBlur({maxCoC:23,nearScale:1.1}),grade=new GradeEffect(GRADES.day,.35);const bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.25,luminanceThreshold:1.2,luminanceSmoothing:.2,mipmapBlur:true,levels:4});composer.addPass(new RenderPass(scene,cam));composer.addPass(ink);composer.addPass(new EffectPass(cam,lens.pre));composer.addPass(new EffectPass(cam,lens.main));composer.addPass(new EffectPass(cam,bloom,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade));return{composer,lens,grade}},[cam,gl,scene]);
 useEffect(()=>()=>post.composer.dispose(),[post]);
 useEffect(()=>post.composer.setSize(size.width,size.height),[post,size.width,size.height]);
 cam.position.set(...view.eye);cam.fov=view.fov;cam.updateProjectionMatrix();cam.layers.enable(NOINK);cam.lookAt(...view.look);cam.updateMatrixWorld();
 post.lens.focus=new THREE.Vector3(...view.focus).sub(cam.position).dot(cam.getWorldDirection(new THREE.Vector3()));post.lens.cInf=view.blur;
 useFrame(()=>{CHAR.uCharTint.value.set(state.memory?1.05:1.00,state.memory?1.00:1.01,state.memory?.94:1.07);CHAR.uCharShade.value=.86;CHAR.uGrad.value=.045;CHAR.uBodyGrad.value=.09;CHAR.uSideTint.value.set(.89,.94,1.04);post.composer.render()},1);
 return <>
  <color attach="background" args={['#1a2d45']}/><fog attach="fog" args={['#253d54',17,42]}/>
  <hemisphereLight args={['#c9dbec','#525161',.90]}/>
  <directionalLight position={[10,8,2]} intensity={1.4} color="#d4deef" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={28} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-far={60} shadow-bias={-.00015}/>
  <directionalLight position={[7,3,-8]} intensity={.45} color="#f4d3ac"/>
  <World frame={frame}/><StoryProps frame={frame} flatCastAccessories/>
  {state.showSasaki&&<Person {...state.sasaki} shadowDirection={[-1,-1]}/>}
  {state.showTayama&&<Person {...state.tayama} shadowDirection={[-1,-1]}/>}
  {state.showYamada&&<Person {...state.yamada} shadowDirection={[-1,-1]}/>}
  {state.showStaff&&<Person {...state.staff} shadowDirection={[-1,-1]}/>}
 </>;
}
export function Film({captions:showCaptions=true,pixelRatio=.5,audio=true}:{captions?:boolean;pixelRatio?:number;audio?:boolean}){
 const f=useCurrentFrame(),caption=showCaptions?captions.find(c=>f>=c.start&&f<c.end):undefined;
 const opacity=f>=1580?1-ease(f,1580,1590):1;
 return <AbsoluteFill style={{backgroundColor:'#17283e'}}>
  <AbsoluteFill style={{opacity}}><ThreeCanvas width={1080} height={1920} dpr={pixelRatio} shadows camera={{fov:40,near:.10,far:90}} gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}}><Stage frame={f}/></ThreeCanvas></AbsoluteFill>
  {audio&&<Audio src={staticFile('mix.wav')}/>}
  {caption&&<div style={{position:'absolute',top:'73%',left:'50%',transform:`translate(-50%,-50%) scale(${1+.035*(1-ease(f,caption.start,caption.start+3))})`,fontFamily:'Arial,sans-serif',fontWeight:900,fontSize:76,lineHeight:1.1,color:'#fff',WebkitTextStroke:'7px #201a27',paintOrder:'stroke fill',whiteSpace:'nowrap',textShadow:'0 3px 4px #0007',opacity}}>{caption.word}</div>}
 </AbsoluteFill>;
}
