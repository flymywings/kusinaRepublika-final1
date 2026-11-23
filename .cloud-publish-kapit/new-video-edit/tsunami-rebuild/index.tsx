import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useFrame,useThree} from '@react-three/fiber';
import {AbsoluteFill,Audio,Composition,getInputProps,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {BlendFunction,BloomEffect,EffectComposer,EffectPass,RenderPass,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from '../bridge-recreation/ink';
import {LensBlur} from '../bridge-recreation/lensblur';
import {GradeEffect,GRADES} from '../bridge-recreation/grade';
import {LIGHTS,LOOK} from '../upstream/templates/bridge/lights';
import {CHAR,TONE} from '../upstream/templates/bridge/shade';
import {glide} from '../upstream/templates/bridge/story';
import {coastBeat,FULL_FRAMES,OPENING_FRAMES} from './story';
import {CoastSet,CoastStructures} from './CoastSet';
import {CoastBangka,StrandedFish,WaterBoat} from './WaterBoat';
import {CoastActor} from './CoastActor';
import {Underwater,UNDERWATER_HAZE} from './Underwater';
import {VillageExtras} from './VillageExtras';
import {CAPTIONS} from './captions';
import {coastWaterLevel,MAX_RETREAT,waterViewMix} from './shore';

const WIDTH=1080;
const HEIGHT=1920;

function MotionArrow({frame}: {frame:number}) {
  const lift = frame >= 239 && frame < 267;
  const ripple = frame >= 280 && frame < 324;
  if (!lift && !ripple) return null;

  const progress = lift ? (frame-239)/28 : (frame-280)/44;
  const travel = glide(progress);
  const left = lift ? 79-8*travel : 61-33*travel;
  const top = lift ? 51-18*travel : 34+6*travel;
  const opacity = Math.min(1,progress*8,(1-progress)*8);
  return <svg viewBox="0 0 256 256" aria-hidden="true" style={{
    position:'absolute',left:`${left}%`,top:`${top}%`,width:lift ? 174 : 160,
    transform:`translate(-50%,-50%) rotate(${lift ? 0 : -90}deg)`,opacity,
  }}>
    <path d="M128 20L223 117H165V228H91V117H33Z"
      fill={lift ? '#ffc043' : '#99edf4'} stroke="#111111" strokeWidth="11" strokeLinejoin="round"/>
  </svg>;
}

function CoastWorld({underwater}: {underwater:boolean}){
  const frame=useCurrentFrame();
  const {camera,scene,gl,size}=useThree();
  const effects=useMemo(()=>{
    const ink=new InkPass(scene,camera as THREE.PerspectiveCamera);
    const lens=new LensBlur({maxCoC:16,nearScale:1.12});
    const tone=new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL});
    const grade=new GradeEffect(GRADES.day,.43);
    const pipeline=new EffectComposer(gl,{multisampling:4,frameBufferType:THREE.HalfFloatType});
    pipeline.addPass(new RenderPass(scene,camera));
    pipeline.addPass(ink);
    pipeline.addPass(new EffectPass(camera,lens.pre));
    pipeline.addPass(new EffectPass(camera,lens.main));
    const bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.48,luminanceThreshold:1,luminanceSmoothing:.18,mipmapBlur:true,levels:5});
    pipeline.addPass(new EffectPass(camera,bloom,tone,grade));
    return {pipeline,ink,lens,grade,bloom};
  },[camera,gl,scene]);
  useEffect(()=>()=>effects.pipeline.dispose(),[effects]);
  useEffect(()=>effects.pipeline.setSize(size.width,size.height),[effects,size.width,size.height]);

  const {shot,view,actor,retreat,lift,disturbance}=coastBeat(frame);
  effects.ink.set(underwater
    ? {fadeNear:9,fadeFar:21,color:'#112f40',creaseScale:.54,angleLo:45,angleHi:62}
    : {fadeNear:150,fadeFar:450,color:'#030303',creaseScale:.8,angleLo:35,angleHi:50});
  camera.position.set(...view.position);
  const perspective=camera as THREE.PerspectiveCamera;
  perspective.fov=view.fov;
  // Both views must retain water within a few centimetres of the lens.
  perspective.near=.015;
  perspective.updateProjectionMatrix();
  camera.layers.enable(NOINK);
  camera.lookAt(...view.look);
  camera.rotateZ(view.roll);
  camera.updateMatrixWorld();
  effects.lens.focus=Math.max(.3,new THREE.Vector3(...view.focus)
    .sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())));
  effects.lens.cInf=view.blur;

  const day=LIGHTS.day;
  const golden=LIGHTS.golden;
  const afternoon=glide((frame-393)/39);
  const sunset=glide((frame-684)/62);
  const cool=glide((frame-122)/45)*(1-.92*afternoon);
  const skyWarm=afternoon*.25*(1-sunset)+sunset;
  const lerp=THREE.MathUtils.lerp;
  const sunsetRadius=2.55;
  const sunPosition: [number,number,number]=[
    lerp(lerp(-8,-3.2,afternoon),6,sunset),
    lerp(lerp(18,10.6,afternoon),coastWaterLevel(MAX_RETREAT)+2*sunsetRadius,sunset),
    lerp(-44,-94,sunset),
  ];
  const keyColor=new THREE.Color('#ffd9a7').lerp(new THREE.Color('#cfe7ff'),cool)
    .lerp(new THREE.Color('#ffd098'),.56*afternoon)
    .lerp(new THREE.Color(golden.sunCol),sunset);
  const horizon=new THREE.Color('#b7d4e7').lerp(new THREE.Color(LOOK.golden.sky.c[0]),skyWarm);
  useFrame(()=>{
    CHAR.uCharTint.value.set(...day.charTint).lerp(new THREE.Vector3(.90,.97,1.08),cool)
      .lerp(new THREE.Vector3(...golden.charTint),sunset);
    CHAR.uCharShade.value=lerp(day.charShade,golden.charShade,sunset);
    CHAR.uGrad.value=lerp(day.charGrad,golden.charGrad,sunset);
    CHAR.uBodyGrad.value=lerp(day.bodyGrad,golden.bodyGrad,sunset);
    CHAR.uSideTint.value.set(...day.sideTint).lerp(new THREE.Vector3(...golden.sideTint),sunset);
    TONE.uLitCol.value.set(1.64,1.47,1.22).lerp(new THREE.Vector3(1.39,1.47,1.66),cool)
      .lerp(new THREE.Vector3(1.76,1.43,1.12),afternoon*.65)
      .lerp(new THREE.Vector3(1.86,1.34,.84),sunset);
    TONE.uShadeCol.value.set(.60,.58,.83).lerp(new THREE.Vector3(.54,.57,.86),cool)
      .lerp(new THREE.Vector3(.46,.45,.69),sunset);
    TONE.uShadeLift.value.set(.015,.013,.020).lerp(new THREE.Vector3(.035,.025,.06),sunset);
    TONE.uSat.value=1.03+.05*sunset;
    effects.grade.set(GRADES.day,GRADES.golden,sunset);
    effects.grade.amount=.43+.06*sunset;
    effects.bloom.intensity=.45+.22*sunset;
    effects.pipeline.render();
  },1);

  const surfaceLight=THREE.MathUtils.smoothstep(view.position[1]-coastWaterLevel(retreat),-.14,.24);
  if(underwater) return <>
    <color attach="background" args={[UNDERWATER_HAZE]}/>
    <fogExp2 attach="fog" args={[UNDERWATER_HAZE,.083-.05*surfaceLight]}/>
    <hemisphereLight args={[new THREE.Color('#b9ecff').lerp(new THREE.Color(day.sky),surfaceLight),
      new THREE.Color('#244a5f').lerp(new THREE.Color('#a19baa'),surfaceLight),1.46-.29*surfaceLight]}/>
    <directionalLight color="#d0f5ff" intensity={2.15*(1-surfaceLight)} position={[-5,7,5]}/>
    <directionalLight color={keyColor} intensity={2.6*surfaceLight} position={[-4,lerp(12,7,afternoon),-18]}/>
    <Underwater frame={frame} lift={lift} disturbance={disturbance} drawdown={retreat/2.95}/>
    <CoastBangka frame={frame} retreat={retreat}/>
    <StrandedFish/>
    <CoastStructures/>
    <VillageExtras frame={frame}/>
    <CoastActor frame={frame} position={actor}/>
  </>;
  return <>
    <color attach="background" args={[horizon]}/>
    <fog attach="fog" args={[horizon,shot===5 || shot===2 ? 24 : 15,shot===5 ? 65 : 53]}/>
    <hemisphereLight args={[new THREE.Color(day.sky).lerp(new THREE.Color(golden.sky),skyWarm),'#a19baa',1.17]}/>
    <directionalLight castShadow position={[lerp(-4,1.25,sunset),lerp(lerp(12,7,afternoon),2.65,sunset),-18]} color={keyColor} intensity={lerp(2.6,3.9,sunset)}
      shadow-mapSize={[2048,2048]} shadow-camera-left={-19} shadow-camera-right={19}
      shadow-camera-top={19} shadow-camera-bottom={-19} shadow-camera-far={52}
      shadow-bias={day.bias} shadow-normalBias={day.normalBias}/>
    <mesh position={sunPosition} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <sphereGeometry args={[lerp(1.33,sunsetRadius,sunset),24,16]}/>
      <meshBasicMaterial color={new THREE.Color(3.8,2.7,1.35).lerp(new THREE.Color(5.3,2.85,1.06),sunset)} toneMapped={false} fog={false}/>
    </mesh>
    <mesh position={[sunPosition[0],sunPosition[1],sunPosition[2]-.4]} renderOrder={-2} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <planeGeometry args={[13+16*sunset,13+16*sunset]}/>
      <shaderMaterial transparent depthWrite={false}
        vertexShader="varying vec2 point; void main(){point=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
        fragmentShader="varying vec2 point; void main(){float d=length(point-.5);float halo=pow(max(0.,1.-d*2.),3.5);gl_FragColor=vec4(1.,.84,.55,halo*.55);}"/>
    </mesh>
    <CoastSet inklessLayer={NOINK} retreat={retreat} frame={frame} sunset={skyWarm}/>
    <WaterBoat frame={frame} retreat={retreat} sunset={sunset} sunPosition={sunPosition}/>
    <VillageExtras frame={frame}/>
    <CoastActor frame={frame} position={actor}/>
  </>;
}

function WorldCanvas({underwater}: {underwater:boolean}){
  return <ThreeCanvas width={WIDTH} height={HEIGHT} shadows
    camera={{fov:56,near:.015,far:140}} gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}}>
    <CoastWorld underwater={underwater}/>
  </ThreeCanvas>;
}

function CoastShort(){
  const frame=useCurrentFrame();
  const {view,retreat}=coastBeat(frame);
  const caption=getInputProps().captions===false ? undefined : CAPTIONS.find(([start,end])=>frame>=start && frame<end);
  const captionScale=caption ? 1+.045*(1-glide((frame-caption[0])/3)) : 1;
  const waterMix=waterViewMix(view.position[1],coastWaterLevel(retreat));
  return <AbsoluteFill>
    <Audio src={staticFile('narration.mp3')}/>
    {waterMix<1 && <WorldCanvas underwater={false}/>}
    {waterMix>0 && <AbsoluteFill style={{opacity:waterMix}}>
      <WorldCanvas underwater/>
    </AbsoluteFill>}
    {getInputProps().arrows!==false && <MotionArrow frame={frame}/>}
    {caption && <div style={{
      position:'absolute',top:'67%',left:'50%',transform:`translate(-50%,-50%) scale(${captionScale})`,
      color:'#fff',fontFamily:'Arial, sans-serif',fontWeight:900,fontSize:72,lineHeight:1,
      WebkitTextStroke:'9px #141219',paintOrder:'stroke fill',whiteSpace:'nowrap',
    }}>{caption[2]}</div>}
  </AbsoluteFill>;
}

registerRoot(()=> <>
  <Composition id="CoastOpening" component={CoastShort}
    durationInFrames={OPENING_FRAMES} fps={30} width={WIDTH} height={HEIGHT}/>
  <Composition id="CoastShort" component={CoastShort}
    durationInFrames={FULL_FRAMES} fps={30} width={WIDTH} height={HEIGHT}/>
</>);




