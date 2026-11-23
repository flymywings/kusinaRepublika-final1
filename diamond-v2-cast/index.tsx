import React,{useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useFrame,useThree} from '@react-three/fiber';
import {AbsoluteFill,Audio,Composition,getInputProps,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {BlendFunction,BloomEffect,EffectComposer,EffectPass,RenderPass,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from '../bridge-recreation/ink';
import {LensBlur} from '../bridge-recreation/lensblur';
import {GradeEffect,GRADES} from '../bridge-recreation/grade';
import {CHAR,TONE} from '../upstream/templates/bridge/shade';
import {LIGHTS} from '../upstream/templates/bridge/lights';
import {M} from '../cartoon-short-kit/cartoon-short-kit/engine/motion.js';
import {FRAMES,CAMERA_NEAR,CAMERA_FAR} from './contract';
import {viewAt,directionAt} from './story';
import {World} from './World';
import {Cast,CastSheet} from './Cast';
import {CAPTIONS} from './captions';

function Stage({sheet=false}:{sheet?:boolean}){
 const frame=useCurrentFrame(),{camera,scene,gl,size}=useThree();
 const {scene:place,beat,cool}=directionAt(frame);
 const view=sheet?{position:[0,3.1,11] as [number,number,number],look:[0,1.3,0] as [number,number,number],focus:[0,1.3,0] as [number,number,number],fov:47,blur:0,roll:0}:viewAt(frame);
 const effects=useMemo(()=>{
  const ink=new InkPass(scene,camera as THREE.PerspectiveCamera),lens=new LensBlur({maxCoC:16,nearScale:1.1});
  const grade=new GradeEffect(GRADES.day,.38),bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.42,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:true,levels:5});
  const pipeline=new EffectComposer(gl,{multisampling:4,frameBufferType:THREE.HalfFloatType});
  pipeline.addPass(new RenderPass(scene,camera));pipeline.addPass(ink);
  pipeline.addPass(new EffectPass(camera,lens.pre));pipeline.addPass(new EffectPass(camera,lens.main));
  pipeline.addPass(new EffectPass(camera,bloom,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade));
  return {pipeline,ink,lens,grade,bloom};
 },[camera,scene,gl]);
 useEffect(()=>()=>effects.pipeline.dispose(),[effects]);
 useEffect(()=>effects.pipeline.setSize(size.width,size.height),[effects,size.width,size.height]);
 camera.position.set(...view.position);const perspective=camera as THREE.PerspectiveCamera;
 perspective.fov=view.fov;perspective.near=CAMERA_NEAR;perspective.far=CAMERA_FAR;perspective.updateProjectionMatrix();
 camera.layers.enable(NOINK);camera.lookAt(...view.look);camera.rotateZ(view.roll);camera.updateMatrixWorld();
 effects.lens.focus=Math.max(.15,new THREE.Vector3(...view.focus).sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())));
 effects.lens.cInf=view.blur;
 const key=cool?'#d2e7fc':'#ffe0ad';
 useFrame(()=>{
  CHAR.uCharTint.value.set(...LIGHTS.day.charTint).lerp(new THREE.Vector3(.93,.98,1.04),cool?.6:0);
  CHAR.uCharShade.value=.91;CHAR.uGrad.value=.045;CHAR.uBodyGrad.value=.09;
  CHAR.uSideTint.value.set(.83,.85,1.03);
  TONE.uLitCol.value.set(...(cool?[1.48,1.53,1.72]:[1.7,1.53,1.27]) as [number,number,number]);
  TONE.uShadeCol.value.set(.49,.48,.68);TONE.uShadeLift.value.set(.025,.025,.045);TONE.uSat.value=1.08;
  effects.grade.set(GRADES.day,GRADES.golden,cool?0:.28);effects.grade.amount=.37;
  effects.pipeline.render();
 },1);
 return <>
  <color attach="background" args={[place==='field'?'#b7d4df':'#50414a']}/>
  <fog attach="fog" args={[place==='field'?'#c8d5d8':'#716267',place==='field'?24:20,place==='field'?115:75]}/>
  <hemisphereLight args={[cool?'#b9d5ed':'#cfdeeb','#8f7969',1.05]}/>
  <directionalLight color={key} intensity={2.5} position={[-5,9,7]} castShadow
   shadow-mapSize={[2048,2048]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={13} shadow-camera-bottom={-13} shadow-camera-far={60} shadow-bias={-.0002} shadow-normalBias={.025}/>
  <directionalLight color="#a5b9e7" intensity={.38} position={[4,3,-5]}/>
  {place!=='field'&&<pointLight position={[-2.4,3,-2]} color="#ffbc77" intensity={10} distance={10} decay={2}/>}
  {sheet?<CastSheet frame={frame}/>:<><World frame={frame} beat={beat}/><Cast frame={frame} beat={beat}/></>}
 </>;
}
function DiamondShort({sheet=false}:{sheet?:boolean}){
 const frame=useCurrentFrame(),{flash,scene}=directionAt(frame),props=getInputProps();
 const caption=props.captions===false||sheet?undefined:CAPTIONS.find(([a,b])=>frame>=a&&frame<b);
 const pop=caption?1+.045*(1-M.smooth((frame-caption[0])/3)):1;
 return <AbsoluteFill style={{backgroundColor:'#c5dbe5'}}>
  <ThreeCanvas width={1080} height={1920} shadows camera={{fov:48,near:CAMERA_NEAR,far:CAMERA_FAR}} gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}}><Stage sheet={sheet}/></ThreeCanvas>
  {!sheet&&<Audio src={staticFile('narration.mp3')}/>}
  {!sheet&&flash>0&&<AbsoluteFill style={{background:'#fff1d4',opacity:flash}}/>}
  {!sheet&&scene==='london'&&<div style={{position:'absolute',top:'12%',left:0,right:0,textAlign:'center',color:'#fff3d9',fontFamily:'Arial',fontWeight:900,fontSize:34,letterSpacing:4,WebkitTextStroke:'3px #342a29',paintOrder:'stroke fill'}}>LONDON · EARLIER</div>}
  {caption&&<div style={{position:'absolute',top:'67%',left:'50%',transform:`translate(-50%,-50%) scale(${pop})`,color:'#fff',fontFamily:'Arial',fontWeight:900,fontSize:72,lineHeight:1,WebkitTextStroke:'9px #17141b',paintOrder:'stroke fill',whiteSpace:'nowrap'}}>{caption[2]}</div>}
 </AbsoluteFill>;
}
registerRoot(()=><><Composition id="DiamondShort" component={DiamondShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920}/><Composition id="DiamondCast" component={DiamondShort} defaultProps={{sheet:true}} durationInFrames={90} fps={30} width={1080} height={1920}/></>);
