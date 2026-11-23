// Hook B film. Same render stack as the pilot (ink -> lens -> bloom -> tone -> grade), new story, mirror and captions.
import React,{useEffect,useLayoutEffect,useMemo} from 'react';
import * as THREE from 'three';
import {useFrame,useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill,Audio,Composition,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {EffectComposer,EffectPass,RenderPass,BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from '../../../pipeline/kit/v1/look/ink';
import {LensBlur} from '../../../pipeline/kit/v1/look/lensblur';
import {GradeEffect,type GradeParams} from '../../../pipeline/kit/v1/look/grade';
import {TONE,CHAR} from '../../../pipeline/kit/v1/look/shade';
import {cardShade,CARD_K,blobMaterial} from '../../../pipeline/kit/v1/look/cardshade';
import {LIGHTS} from '../../../pipeline/kit/v1/look/lights';
import {Cafe,noInk,type V3} from './Cafe';
import {drawCast} from '../cast/b-hands/rig';
import type {Actor,Shot} from './story';
import {layersAt,fxAt} from './timeline';
import {CAPTIONS,FPS,TOTAL} from './timing';

// His reading (cool, flat) and the truth (light through the side windows).
const MOOD={
 cool:{lit:[.98,1.04,1.14],shade:[.27,.31,.38],lift:[.03,.04,.07],tint:[.91,.95,1.03],fill:.82},
 warm:{lit:[1.6,1.34,1.02],shade:[.45,.39,.39],lift:[.04,.035,.05],tint:[1,.96,.9],fill:.9},
} as const;
const GRADE_COOL:GradeParams={ky:[.13,.2,.3,.56,.79,.9,.94],sat:[1.12,1.14,1.16],tintS:[.014,-.004],tintM:[.006,-.003],tintH:[.004,-.002],vig:[.16,.45]};
const GRADE_WARM:GradeParams={ky:[.14,.22,.33,.595,.81,.91,.94],sat:[1.2,1.26,1.32],tintS:[-.004,.012],tintM:[-.004,.004],tintH:[-.003,.003],vig:[.12,.48]};
const mix3=(a:readonly number[],b:readonly number[],t:number):V3=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

const CARD={rintaro:{w:1.41,h:2.385},kaoruko:{w:1.235,h:1.86}};
function Person({actor,yaw,ppm}:{actor:Actor;yaw:number;ppm:number}){
 const {role,at,pose,stranger,glass,overlay}=actor,{w,h}=CARD[role];
 const r=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=Math.round(w*ppm);canvas.height=Math.round(h*ppm);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const m=cardShade(new THREE.MeshLambertMaterial({map,alphaTest:.5}));m.alphaToCoverage=true;
  const c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d')!,k=g.createRadialGradient(64,64,0,64,64,64);
  g.fillStyle='#fff';g.fillRect(0,0,128,128);k.addColorStop(0,'#7c747a');k.addColorStop(.55,'#b3abaf');k.addColorStop(1,'#fff');g.fillStyle=k;g.fillRect(0,0,128,128);
  const bt=new THREE.CanvasTexture(c);
  const tmp=document.createElement('canvas');tmp.width=canvas.width;tmp.height=canvas.height;
  return{canvas,tmp,map,m,bt,blob:blobMaterial(bt),geo:new THREE.PlaneGeometry(w,h).translate(0,h/2-.05,0)};
 },[w,h,ppm]);
 useEffect(()=>()=>{r.map.dispose();r.m.dispose();r.bt.dispose();r.blob.dispose();r.geo.dispose();},[r]);
 const key=JSON.stringify([role,pose,stranger,glass,overlay]);
 useLayoutEffect(()=>{
  const g=r.canvas.getContext('2d')!,k=r.canvas.width/w;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,r.canvas.width,r.canvas.height);
  g.setTransform(k/1000,0,0,k/1000,r.canvas.width/2,r.canvas.height-.05*k);
  drawCast(g,{...pose,role,...stranger});
  if(overlay?.coin){
   // a coin between finger and thumb, drawn in the hand
   const [x,y]=overlay.coin;g.save();g.fillStyle='#b39a5e';g.strokeStyle='#201a22';g.lineWidth=5;
   g.beginPath();g.ellipse(x+6,y-6,18,15,-.3,0,Math.PI*2);g.fill();g.stroke();g.restore();
  }
  if(overlay?.glint){const [x,y]=overlay.glint;g.save();g.fillStyle='#fffdf4';g.beginPath();g.ellipse(x,y,9,9,0,0,Math.PI*2);g.fill();g.restore();}
  if(overlay?.cloth){const [x,y]=overlay.cloth;g.save();g.fillStyle='#f4efe4';g.strokeStyle='#201a22';g.lineWidth=5;g.beginPath();g.moveTo(x-34,y-26);g.lineTo(x+30,y-34);g.lineTo(x+40,y+24);g.lineTo(x-26,y+34);g.closePath();g.fill();g.stroke();g.restore();}
  if(glass){
   const {mask,cool,soft}=glass;g.save();g.setTransform(1,0,0,1,0,0);
   if(soft>.2){const t=r.tmp.getContext('2d')!;t.setTransform(1,0,0,1,0,0);t.clearRect(0,0,r.tmp.width,r.tmp.height);t.drawImage(r.canvas,0,0);g.clearRect(0,0,r.canvas.width,r.canvas.height);g.filter=`blur(${soft}px)`;g.drawImage(r.tmp,0,0);g.filter='none';}
   g.restore();
   g.save();g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(34,52,76,${cool})`;g.fillRect(-1100,-2500,2200,2700);g.restore();
   // clip to the glass rectangle
   g.save();g.globalCompositeOperation='destination-in';g.fillStyle='#000';g.fillRect(mask.x0,mask.y0,mask.x1-mask.x0,mask.y1-mask.y0);g.restore();
  }
  r.map.needsUpdate=true;
 },[key,r]);
 const flip=!!glass,s=glass?.scale??1;
 return <group position={at}>
  {!glass&&at[1]>-.05&&at[1]<.1&&<mesh rotation-x={-Math.PI/2} position={[0,.012-at[1],0]} scale={[.66,.28,1]} material={r.blob} onUpdate={noInk}><planeGeometry/></mesh>}
  <mesh geometry={r.geo} material={r.m} scale={[flip?-s:s,s,s]} rotation-y={glass?0:yaw} receiveShadow renderOrder={1} onUpdate={noInk}/>
 </group>;
}

function Scene({shot:s,ppm}:{shot:Shot;ppm:number}){
 const {gl,scene,camera,size}=useThree(),cam=camera as THREE.PerspectiveCamera;
 const post=useMemo(()=>{
  const c=new EffectComposer(gl,{multisampling:4,frameBufferType:THREE.HalfFloatType}),lens=new LensBlur({maxCoC:24,nearScale:1.35}),grade=new GradeEffect(GRADE_WARM,1);
  const bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.5,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:true,levels:6,radius:.6});
  c.addPass(new RenderPass(scene,cam));
  c.addPass(new InkPass(scene,cam,{concaveGain:0,widthNear:3.4,widthFar:2.2,color:'#171013',strength:.9}));
  c.addPass(new EffectPass(cam,lens.pre));c.addPass(new EffectPass(cam,lens.main));
  c.addPass(new EffectPass(cam,bloom,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade));
  return{c,lens,grade};
 },[gl,scene,cam]);
 useEffect(()=>()=>post.c.dispose(),[post]);
 useLayoutEffect(()=>{post.c.setSize(size.width,size.height);},[post,size.width,size.height]);

 const k=s.warmth,m=(key:'lit'|'shade'|'lift'|'tint')=>s.sun.mood?s.sun.mood[key]:mix3(MOOD.cool[key],MOOD.warm[key],k);
 TONE.uLitCol.value.set(...m('lit'));TONE.uShadeCol.value.set(...m('shade'));TONE.uShadeLift.value.set(...m('lift'));
 TONE.uLambert.value=.3;TONE.uSideK.value=.86;TONE.uTerm.value=.16;TONE.uSat.value=1.05+.08*k;
 CHAR.uCharTint.value.set(...m('tint'));CHAR.uCharShade.value=s.sun.mood?s.sun.mood.fill:MOOD.cool.fill+(MOOD.warm.fill-MOOD.cool.fill)*k;
 CHAR.uGrad.value=LIGHTS.day.charGrad;CHAR.uBodyGrad.value=LIGHTS.day.bodyGrad;CHAR.uSideTint.value.set(...LIGHTS.day.sideTint);

 cam.position.set(...s.eye);cam.fov=s.fov;cam.layers.enable(NOINK);cam.updateProjectionMatrix();cam.lookAt(...s.look);cam.rotateZ(s.roll??0);cam.updateMatrixWorld();
 const dir=cam.getWorldDirection(new THREE.Vector3()),focus=new THREE.Vector3(...s.focus);
 post.lens.focus=Math.max(.3,focus.sub(cam.position).dot(dir));post.lens.cInf=s.blur;
 post.grade.set(GRADE_COOL,GRADE_WARM,k);
 useFrame(()=>{CARD_K.uPx.value=gl.domElement.height/1920;post.c.render();},1);
 const yaw=Math.atan2(-dir.x,-dir.z);
 return <>
  <color attach="background" args={['#b9b4ad']}/>
  <directionalLight position={s.sun.pos} intensity={s.sun.i} color={s.sun.color} castShadow shadow-mapSize={[4096,4096]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-far={22} shadow-bias={-.00035} shadow-normalBias={.014}/>
  <hemisphereLight args={[s.sun.hemi,'#6b5a4e',s.sun.hemiI??.5]}/>
  <Cafe door={s.door} bell={s.bell} meal={s.meal} box={s.box} slice={s.slice} coins={s.coins}/>
  {s.actors.map(a=><Person key={a.id+a.role} actor={a} yaw={yaw} ppm={ppm}/>)}
 </>;
}

function Film({captions=true,audio='',ppm=1300}:{captions?:boolean;audio?:string;ppm?:number}){
 const frame=useCurrentFrame(),t=frame/FPS;
 const word=captions?CAPTIONS.find(c=>frame>=c.from&&frame<c.to):undefined;
 const layers=layersAt(frame),fx=fxAt(frame);
 return <AbsoluteFill style={{background:'#2a2422'}}>
  {layers.map((l,i)=><div key={i} style={{position:'absolute',inset:0,opacity:l.opacity,filter:fx.tape?'grayscale('+(.8*fx.tape)+') contrast('+(1+.18*fx.tape)+') brightness('+(1-.1*fx.tape)+')':undefined,transform:fx.jit?'translateY('+fx.jit+'px)':undefined}}>
   <ThreeCanvas width={1080} height={1920} shadows gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}} camera={{fov:40,near:.08,far:60}}>
    <Scene shot={l.shot} ppm={ppm}/>
   </ThreeCanvas>
  </div>)}
  {fx.tape>0&&<div style={{position:'absolute',inset:0,opacity:.22*fx.tape,backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,.55) 0px,rgba(0,0,0,.55) 2px,rgba(0,0,0,0) 2px,rgba(0,0,0,0) 6px)',mixBlendMode:'multiply'}}/>}
  {fx.tearW>0&&<div style={{position:'absolute',left:0,right:0,top:(fx.tearY*100)+'%',height:(fx.tearW*100)+'%',background:'linear-gradient(90deg,rgba(255,255,255,.28),rgba(40,40,50,.35) 40%,rgba(255,255,255,.2))',mixBlendMode:'screen'}}/>}
  {audio&&<Audio src={staticFile(audio)}/>}
  {word&&<div style={{position:'absolute',top:'70%',left:'50%',transform:'translate(-50%,-50%)',font:'800 72px Arial,sans-serif',color:'#ffffff',WebkitTextStroke:'8px #1a1418',paintOrder:'stroke fill',whiteSpace:'nowrap'}}>{word.word}</div>}
 </AbsoluteFill>;
}
registerRoot(()=><Composition id="HookB" component={Film} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL} defaultProps={{captions:true,audio:'',ppm:1300}}/>);
