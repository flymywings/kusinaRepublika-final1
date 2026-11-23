import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useFrame,useThree} from '@react-three/fiber';
import {AbsoluteFill,Audio,Composition,getInputProps,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {BlendFunction,BloomEffect,EffectComposer,EffectPass,RenderPass,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from '../bridge-recreation/ink';
import {LensBlur} from '../bridge-recreation/lensblur';
import {GradeEffect,GRADES} from '../bridge-recreation/grade';
import {LIGHTS} from '../upstream/templates/bridge/lights';
import {CHAR} from '../upstream/templates/bridge/shade';
import {glide} from '../upstream/templates/bridge/story';
import {coastBeat,DIVE_FRAME,SURFACE_FRAME,FULL_FRAMES,OPENING_FRAMES} from './story';
import {CoastSet,CoastStructures} from './CoastSet';
import {CoastBangka,WaterBoat} from './WaterBoat';
import {CoastActor} from './CoastActor';
import {Underwater,UNDERWATER_HAZE} from './Underwater';
import {VillageExtras} from './VillageExtras';
import {CAPTIONS} from './captions';

const WIDTH=1080;
const HEIGHT=1920;


function MotionArrow({color, direction, position, progress, camera, size=.76}: {
  color: string; direction: number; position: [number,number,number]; progress: number; camera: THREE.Camera; size?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    [[128,20],[223,117],[165,117],[165,228],[91,228],[91,117],[33,117]].forEach(([x,y],i) => {
      if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 11;
    ctx.strokeStyle = '#111111';
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [color]);
  useEffect(() => () => texture.dispose(), [texture]);
  const scale = .65 + .35*Math.min(1,progress*6) + .12*Math.sin(progress*Math.PI);
  return <group position={position} quaternion={camera.quaternion} scale={scale*size}>
    <mesh rotation-z={direction} renderOrder={5} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <planeGeometry args={[1.85,1.85]}/>
      <meshBasicMaterial map={texture} transparent opacity={Math.min(1,progress*12,(1-progress)*12)} depthWrite={false}/>
    </mesh>
  </group>;
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
    return {pipeline,ink,lens};
  },[camera,gl,scene]);
  useEffect(()=>()=>effects.pipeline.dispose(),[effects]);
  useEffect(()=>effects.pipeline.setSize(size.width,size.height),[effects,size.width,size.height]);

  const {shot,view,actor,retreat,lift,disturbance}=coastBeat(frame);
  const arrows=getInputProps().arrows !== false;
  effects.ink.set(underwater
    ? {fadeNear:9,fadeFar:21,color:'#112f40',creaseScale:.54,angleLo:45,angleHi:62}
    : {fadeNear:150,fadeFar:450,color:'#030303',creaseScale:.8,angleLo:35,angleHi:50});
  camera.position.set(...view.position);
  const perspective=camera as THREE.PerspectiveCamera;
  perspective.fov=view.fov;
  perspective.updateProjectionMatrix();
  camera.layers.enable(NOINK);
  camera.lookAt(...view.look);
  camera.rotateZ(view.roll);
  camera.updateMatrixWorld();
  effects.lens.focus=Math.max(.3,new THREE.Vector3(...view.focus)
    .sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())));
  effects.lens.cInf=view.blur;

  const day=LIGHTS.day;
  CHAR.uCharTint.value.set(...day.charTint);
  CHAR.uCharShade.value=day.charShade;
  CHAR.uGrad.value=day.charGrad;
  CHAR.uBodyGrad.value=day.bodyGrad;
  CHAR.uSideTint.value.set(...day.sideTint);
  useFrame(()=>effects.pipeline.render(),1);

  const surfaceLight=THREE.MathUtils.smoothstep(view.position[1]+.5*retreat,-.14,.24);
  if(underwater) return <>
    <color attach="background" args={[UNDERWATER_HAZE]}/>
    <fogExp2 attach="fog" args={[UNDERWATER_HAZE,.083-.05*surfaceLight]}/>
    <hemisphereLight args={[new THREE.Color('#b9ecff').lerp(new THREE.Color(day.sky),surfaceLight),
      new THREE.Color('#244a5f').lerp(new THREE.Color('#a19baa'),surfaceLight),1.46-.29*surfaceLight]}/>
    <directionalLight color="#d0f5ff" intensity={2.15*(1-surfaceLight)} position={[-5,7,5]}/>
    <directionalLight color={day.sunCol} intensity={2.6*surfaceLight} position={[-4,12,-18]}/>
    <Underwater frame={frame} lift={lift} disturbance={disturbance} drawdown={retreat/2.95}/>
    <CoastBangka frame={frame} retreat={retreat}/>
    <CoastStructures/>
    <VillageExtras frame={frame}/>
    <CoastActor frame={frame} position={actor}/>
    {arrows && frame >= 239 && frame < 267 && <MotionArrow color="#ffc043" direction={0} size={.40}
      position={[1.45-.42*lift,-1.75+lift,1.02]} progress={(frame-239)/28} camera={camera}/>}
    {arrows && frame >= 270 && frame < 324 && <MotionArrow color="#99edf4" direction={Math.PI/2} size={.48}
      position={[disturbance+.8,.21,-.2]} progress={(frame-270)/54} camera={camera}/>}
  </>;
  return <>
    <color attach="background" args={['#b7d4e7']}/>
    <fog attach="fog" args={['#b7d4e7',shot===5 || shot===2 ? 24 : 15,shot===5 ? 65 : 53]}/>
    <hemisphereLight args={[day.sky,'#a19baa',1.17]}/>
    <directionalLight castShadow position={[-4,12,-18]} color={day.sunCol} intensity={2.6}
      shadow-mapSize={[2048,2048]} shadow-camera-left={-19} shadow-camera-right={19}
      shadow-camera-top={19} shadow-camera-bottom={-19} shadow-camera-far={52}
      shadow-bias={day.bias} shadow-normalBias={day.normalBias}/>
    <mesh position={[-8,18,-44]} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <sphereGeometry args={[1.33,24,16]}/>
      <meshBasicMaterial color={new THREE.Color(3.8,2.7,1.35)} toneMapped={false} fog={false}/>
    </mesh>
    <mesh position={[-8,18,-44.4]} renderOrder={-2} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <planeGeometry args={[13,13]}/>
      <shaderMaterial transparent depthWrite={false}
        vertexShader="varying vec2 point; void main(){point=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
        fragmentShader="varying vec2 point; void main(){float d=length(point-.5);float halo=pow(max(0.,1.-d*2.),3.5);gl_FragColor=vec4(1.,.84,.55,halo*.55);}"/>
    </mesh>
    <CoastSet inklessLayer={NOINK} retreat={retreat} frame={frame}/>
    <WaterBoat frame={frame} retreat={retreat}/>
    <VillageExtras frame={frame}/>
    <CoastActor frame={frame} position={actor}/>
  </>;
}

function WorldCanvas({underwater}: {underwater:boolean}){
  return <ThreeCanvas width={WIDTH} height={HEIGHT} shadows
    camera={{fov:56,near:.2,far:140}} gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}}>
    <CoastWorld underwater={underwater}/>
  </ThreeCanvas>;
}

function CoastShort(){
  const frame=useCurrentFrame();
  const caption=getInputProps().captions===false ? undefined : CAPTIONS.find(([start,end])=>frame>=start && frame<end)?.[2];
  const waterMix=glide((frame-DIVE_FRAME+4)/8)*(1-glide((frame-SURFACE_FRAME+4)/8));
  return <AbsoluteFill>
    <Audio src={staticFile('narration.mp3')}/>
    {waterMix<1 && <WorldCanvas underwater={false}/>}
    {waterMix>0 && <AbsoluteFill style={{opacity:waterMix}}>
      <WorldCanvas underwater/>
    </AbsoluteFill>}
    {caption && <div style={{
      position:'absolute',top:'67%',left:'50%',transform:'translate(-50%,-50%)',
      color:'#fff',fontFamily:'Arial, sans-serif',fontWeight:900,fontSize:72,lineHeight:1,
      WebkitTextStroke:'7px #141219',paintOrder:'stroke fill',whiteSpace:'nowrap',
    }}>{caption}</div>}
  </AbsoluteFill>;
}

registerRoot(()=> <>
  <Composition id="CoastOpening" component={CoastShort}
    durationInFrames={OPENING_FRAMES} fps={30} width={WIDTH} height={HEIGHT}/>
  <Composition id="CoastShort" component={CoastShort}
    durationInFrames={FULL_FRAMES} fps={30} width={WIDTH} height={HEIGHT}/>
</>);




