// Style test: V8, A and B on one set, through the original skill's stack
// (twoTone + LIGHTS + cardShade, then ink -> lens pre -> lens main -> bloom -> tone -> grade).
import React,{useEffect,useLayoutEffect,useMemo} from 'react';
import * as THREE from 'three';
import {useFrame,useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill,Audio,Composition,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {EffectComposer,EffectPass,RenderPass,BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,NOINK} from '../../../../pipeline/kit/v1/look/ink';
import {LensBlur} from '../../../../pipeline/kit/v1/look/lensblur';
import {GradeEffect,GRADES} from '../../../../pipeline/kit/v1/look/grade';
import {TONE,CHAR,twoTone} from '../../../../pipeline/kit/v1/look/shade';
import {cardShade,CARD_K,blobMaterial} from '../../../../pipeline/kit/v1/look/cardshade';
import {ctex,rep} from '../../../../pipeline/kit/v1/look/paint';
import {LIGHTS} from '../../../../pipeline/kit/v1/look/lights';
import {drawCast,type Face,type Role,type Style} from './rig';
import {drawCharacter,type Mood} from '../v8/CharacterArt';

type V3=[number,number,number];
type Variant='v8'|Style;
type Shot='two'|'him'|'her'|'clip';
const noInk=(o:THREE.Object3D)=>o.layers.set(NOINK);
const L=LIGHTS.day;
// Interior: the report's shade target is about half of lit, so the outdoor day shade is lifted.
TONE.uLitCol.value.set(1.5,1.4,1.22);TONE.uShadeCol.value.set(.56,.47,.55);TONE.uShadeLift.value.set(...L.lift);
TONE.uLambert.value=L.lambert;TONE.uSideK.value=L.sideK;TONE.uTerm.value=L.term;TONE.uSat.value=1.08;
CHAR.uCharTint.value.set(1,.97,.96);CHAR.uCharShade.value=L.charShade;CHAR.uGrad.value=L.charGrad;CHAR.uBodyGrad.value=L.bodyGrad;CHAR.uSideTint.value.set(...L.sideTint);

const mats=new Map<string,THREE.Material>();
function mat(color:string,map?:THREE.Texture){
 const key=color+(map?.uuid??'');
 if(!mats.has(key))mats.set(key,twoTone(new THREE.MeshLambertMaterial({color,map:map??null})));
 return mats.get(key)!;
}
const box=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(1,1,1,28),ball=new THREE.SphereGeometry(1,16,12);
function Box({p,s,c='#ffffff',map,cast=true}:{p:V3;s:V3;c?:string;map?:THREE.Texture;cast?:boolean}){return <mesh geometry={box} material={mat(c,map)} position={p} scale={s} castShadow={cast} receiveShadow/>;}
function Cyl({p,r,h,c}:{p:V3;r:number;h:number;c:string}){return <mesh geometry={cyl} material={mat(c)} position={p} scale={[r,h,r]} castShadow receiveShadow/>;}
function Ball({p,r,c,sy=1}:{p:V3;r:number;c:string;sy?:number}){return <mesh geometry={ball} material={mat(c)} position={p} scale={[r,r*sy,r]} castShadow receiveShadow/>;}
function Cake({p,c,tiers=1}:{p:V3;c:string;tiers?:number}){
 return <group position={p}>
  <Cyl p={[0,.01,0]} r={.14} h={.02} c="#f4f0e4"/>
  {Array.from({length:tiers},(_,i)=><Cyl key={i} p={[0,.07+i*.1,0]} r={.115-i*.025} h={.1} c={i%2?'#f7dfc0':c}/>)}
  {[0,1,2,3,4].map(i=><Ball key={i} p={[.075*Math.cos(i*1.256)*(1-.2*(tiers-1)),.135+(tiers-1)*.1,.075*Math.sin(i*1.256)]} r={.026} c="#d8344c"/>)}
 </group>;
}
function World(){
 const t=useMemo(()=>({
  floor:rep(ctex('ff-floor',512,512,g=>{for(const [x,y] of [[0,0],[1,0],[0,1],[1,1]]){g.fillStyle=(x+y)%2?'#4f9e98':'#f1e3c8';g.fillRect(x*256,y*256,256,256);}g.strokeStyle='rgba(70,50,50,.25)';g.lineWidth=4;g.strokeRect(0,0,256,256);g.strokeRect(256,256,256,256);}),6,6),
  paper:rep(ctex('ff-wallpaper',512,512,(g,r)=>{g.fillStyle='#efb98f';g.fillRect(0,0,512,512);g.fillStyle='#eaae84';for(let x=0;x<512;x+=128)g.fillRect(x,0,64,512);g.fillStyle='rgba(255,236,210,.6)';for(let x=32;x<512;x+=128)for(let y=32;y<512;y+=128){g.beginPath();g.arc(x+r()*3,y,7,0,7);g.fill();}}),3,2),
  wood:rep(ctex('ff-wood',512,256,(g,r)=>{g.fillStyle='#b9713f';g.fillRect(0,0,512,256);for(let x=0;x<512;x+=64){g.fillStyle=r()>.5?'#c07844':'#b26b3a';g.fillRect(x,0,62,256);g.fillStyle='#8a4c2c';g.fillRect(x+61,0,3,256);}}),4,1),
  street:ctex('ff-street',768,900,(g,r)=>{
   const k=g.createLinearGradient(0,0,0,900);k.addColorStop(0,'#5f9fe6');k.addColorStop(1,'#cfe6f3');g.fillStyle=k;g.fillRect(0,0,768,900);
   ['#e58e6e','#f3e0bf','#8fb9b4','#d9a35c'].forEach((c,i)=>{const x=i*200-20,y=230+r()*150;g.fillStyle=c;g.fillRect(x,y,190,900-y);g.fillStyle='#8a5560';g.fillRect(x-6,y,202,22);g.fillStyle='#7180b8';for(let a=0;a<2;a++)for(let b=0;b<3;b++)g.fillRect(x+30+a*82,y+60+b*120,48,66);});
   g.fillStyle='#69a94a';for(const [x,y,s] of [[90,560,110],[170,630,80],[660,520,120]]){g.beginPath();g.arc(x,y,s,0,7);g.fill();}
   g.fillStyle='#b9aaa0';g.fillRect(0,800,768,100);
  }),
  sign:ctex('ff-sign',1024,256,g=>{g.fillStyle='#5b3040';g.fillRect(0,0,1024,256);g.strokeStyle='#e9c583';g.lineWidth=10;g.strokeRect(22,22,980,212);g.fillStyle='#ffe9c2';g.textAlign='center';g.font='700 108px Georgia,serif';g.fillText('TSUMUGI',512,128);g.font='600 46px Georgia,serif';g.fillText('P A T I S S E R I E',512,196);}),
 }),[]);
 const unlit=useMemo(()=>({street:new THREE.MeshBasicMaterial({map:t.street}),sign:new THREE.MeshBasicMaterial({map:t.sign,color:'#d8d0cc'}),lamp:new THREE.MeshBasicMaterial({color:new THREE.Color(3,2.3,1.4)})}),[t]);
 return <group>
  <Box p={[0,-.05,0]} s={[7,.1,7]} map={t.floor} cast={false}/>
  <Box p={[0,1.9,-2.05]} s={[7,3.8,.1]} map={t.paper} cast={false}/>
  <Box p={[0,.45,-1.975]} s={[7,.9,.05]} map={t.wood}/><Box p={[0,.93,-1.94]} s={[7,.07,.1]} c="#84452f"/>

  <mesh position={[-.98,1.77,-1.985]} material={unlit.street}><planeGeometry args={[1.12,1.35]}/></mesh>
  {[-1,0,1].map(i=><Box key={'m'+i} p={[-.98+i*.56,1.77,-1.94]} s={[i?.09:.05,1.45,.07]} c="#f6ead4"/>)}
  {[1.07,1.8,2.47].map(y=><Box key={y} p={[-.98,y,-1.94]} s={[1.28,y===1.8?.05:.1,.08]} c="#f6ead4"/>)}
  {[-1.67,-.29].map(x=><Box key={x} p={[x,1.85,-1.9]} s={[.2,1.5,.06]} c="#c9536b"/>)}

  {[1.5,1.95,2.4].map((y,j)=><group key={y}>
   <Box p={[.86,y,-1.8]} s={[1.3,.05,.3]} c="#8a4b30"/>
   {[0,1,2,3].map(i=>j===1
    ?<Box key={i} p={[.38+i*.32,y+.11,-1.8]} s={[.22,.17,.2]} c={['#f3d1d6','#9fc9bf','#f2e6c9','#e58e6e'][i]}/>
    :<group key={i}><Cyl p={[.38+i*.32,y+.11,-1.8]} r={.075} h={.17} c={['#e9b45e','#b85a4c','#d9cfe6','#8fb56a'][(i+j)%4]}/><Cyl p={[.38+i*.32,y+.21,-1.8]} r={.08} h={.035} c="#7a4330"/></group>)}
  </group>)}
  <mesh position={[.05,2.9,-1.97]} material={unlit.sign}><planeGeometry args={[1.36,.34]}/></mesh>

  <Box p={[.83,.34,-1.12]} s={[1.35,.68,.6]} c="#3f8f8a"/><Box p={[.83,.7,-1.12]} s={[1.43,.06,.68]} c="#f3e6cf"/>
  {[.16,1.5].map(x=><Box key={x} p={[x,.98,-.8]} s={[.045,.52,.045]} c="#c9a063"/>)}
  <Box p={[.83,1.25,-1.12]} s={[1.39,.04,.64]} c="#c9a063"/>
  <Box p={[.83,.97,-1.2]} s={[1.3,.03,.36]} c="#e6d2b5"/>
  {[.35,.67,.99,1.31].map((x,i)=><group key={x}><Cake p={[x,.73,-.96]} c={['#f0a0b0','#8b5540','#f6e7c8','#e7b25c'][i]} tiers={i%2+1}/><Cake p={[x,.985,-1.22]} c={['#8fbf8a','#f0a0b0','#e7b25c','#8b5540'][i]}/></group>)}

  <Cyl p={[-1.3,.22,-1.4]} r={.22} h={.44} c="#c9684c"/>
  {Array.from({length:11},(_,i)=><Ball key={i} p={[-1.3+.22*Math.cos(i*2.1),.6+i*.055,-1.4+.14*Math.sin(i*2.1)]} r={.16-i*.006} sy={1.3} c={i%2?'#5c9d4d':'#74b554'}/>)}

  <Cyl p={[.7,.49,1.72]} r={.3} h={.05} c="#c98450"/><Cyl p={[.7,.24,1.72]} r={.05} h={.46} c="#6b3d30"/>
  <Cake p={[.63,.515,1.74]} c="#f0a0b0"/>

  {[-.8,.92].map(x=><group key={x}>
   <Box p={[x,3.3,-.8]} s={[.02,1,.02]} c="#54343a" cast={false}/>
   <mesh position={[x,2.72,-.8]} material={mat('#3f8f8a')}><coneGeometry args={[.25,.22,28]}/></mesh>
   <mesh geometry={ball} material={unlit.lamp} position={[x,2.61,-.8]} scale={.09} onUpdate={noInk}/>
  </group>)}
 </group>;
}

const CARD={rintaro:{w:1.41,h:2.385},kaoruko:{w:1.235,h:1.86}};
interface Acting {face:Face;mood:Mood;tilt?:number;satchel?:boolean;hands?:[[number,number],[number,number]]}
function Person({variant,role,at,act}:{variant:Variant;role:Role;at:V3;act:Acting}){
 const {w,h}=CARD[role];
 const r=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=Math.round(w*1400);canvas.height=Math.round(h*1400);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const m=cardShade(new THREE.MeshLambertMaterial({map,alphaTest:.5}));m.alphaToCoverage=true;
  const b=document.createElement('canvas');b.width=b.height=128;const g=b.getContext('2d')!,k=g.createRadialGradient(64,64,0,64,64,64);
  g.fillStyle='#fff';g.fillRect(0,0,128,128);k.addColorStop(0,'#8c8088');k.addColorStop(.55,'#b7aeb2');k.addColorStop(1,'#fff');g.fillStyle=k;g.fillRect(0,0,128,128);
  return {canvas,map,m,geo:new THREE.PlaneGeometry(w,h).translate(0,h/2-.05,0),blob:blobMaterial(new THREE.CanvasTexture(b))};
 },[w,h]);
 const key=JSON.stringify([variant,act]);
 useLayoutEffect(()=>{
  const g=r.canvas.getContext('2d')!,k=r.canvas.width/w;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,r.canvas.width,r.canvas.height);
  const x=r.canvas.width/2,y=r.canvas.height-.05*k;
  if(variant==='v8'){g.setTransform(k,0,0,-k,x,y);drawCharacter(g,{role,mood:act.mood,frame:30});}
  else{g.setTransform(k/1000,0,0,k/1000,x,y);drawCast(g,{style:variant,role,face:act.face,tilt:act.tilt,hands:act.hands,satchel:act.satchel});}
  r.map.needsUpdate=true;
 },[key,r]);
 return <group position={at}>
  <mesh rotation-x={-Math.PI/2} position={[0,.012,0]} scale={[.72,.3,1]} material={r.blob} onUpdate={noInk}><planeGeometry/></mesh>
  <mesh geometry={r.geo} material={r.m} receiveShadow renderOrder={1} onUpdate={noInk}/>
 </group>;
}

const ease=(f:number,a:number,b:number)=>{const x=Math.min(1,Math.max(0,(f-a)/(b-a)));return x*x*x*(x*(x*6-15)+10);};
const blink=(f:number,at:number)=>f>=at&&f<at+4?[.5,1,1,.5][f-at]:0;
const CUT=62;
function acting(shot:Shot,f:number):{him:Acting;her:Acting}{
 if(shot==='two')return{
  him:{face:{eyes:'shock',mouth:'o',brow:[-3,2],sweat:true},mood:'flustered',tilt:.05},
  her:{face:{eyes:'happy',mouth:'smile',blush:.3,brow:[-1.5,-1.2]},mood:'soft',tilt:-.05,satchel:true}};
 if(shot==='him')return{him:{face:{},mood:'neutral'},her:{face:{},mood:'neutral'}};
 if(shot==='her')return{him:{face:{},mood:'neutral'},her:{face:{eyes:'shock',mouth:'full',cheeks:1,cream:true,blush:1,sweat:true,brow:[-5,2]},mood:'flustered',tilt:-.04}};
 // "She tells him she's never found him scary." Her eyes open on "never", his only after the line has landed.
 const a=ease(f,29,38),b=ease(f,81,94),c=ease(f,90,110);
 return{
  her:{face:{blink:blink(f,25),open:a,brow:[-.9-.5*a,-.7-.7*a],mouth:'smile',blush:.18*a},mood:'neutral',tilt:.035*a},
  him:{face:{blink:blink(f,77),open:b,brow:[-4*b,-1+b],mouth:b>.5?'o':'dash',blush:.55*c},mood:f>=81?'soft':'neutral',tilt:.03*b}};
}
const HIM:V3=[-.31,0,0],HER:V3=[.34,0,.05];
function view(shot:Shot,f:number){
 const s=shot==='clip'?(f<CUT?'her':'him'):shot,t=shot==='clip'?(f<CUT?f:f-CUT):0,push=1-.0016*t;
 if(s==='two')return{eye:[.02,1.14,3.7] as V3,look:[.02,1.07,0] as V3,fov:40,blur:5,focus:3.7};
 if(s==='him')return{eye:[HIM[0],1.55,1.82*push] as V3,look:[HIM[0],1.55,0] as V3,fov:38,blur:12,focus:1.82*push};
 return{eye:[HER[0],1.2,.05+1.72*push] as V3,look:[HER[0],1.2,.05] as V3,fov:38,blur:12,focus:1.72*push};
}
function Scene({variant,shot,frame}:{variant:Variant;shot:Shot;frame:number}){
 const {gl,scene,camera,size}=useThree(),cam=camera as THREE.PerspectiveCamera;
 const post=useMemo(()=>{
  const c=new EffectComposer(gl,{multisampling:4,frameBufferType:THREE.HalfFloatType}),lens=new LensBlur({maxCoC:24,nearScale:1.2});
  const bloom=new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.5,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:true,levels:6,radius:.6});
  c.addPass(new RenderPass(scene,cam));
  c.addPass(new InkPass(scene,cam,{concaveGain:0,widthNear:4.2}));
  c.addPass(new EffectPass(cam,lens.pre));c.addPass(new EffectPass(cam,lens.main));
  c.addPass(new EffectPass(cam,bloom,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),new GradeEffect(GRADES.day,.42)));
  return {c,lens};
 },[gl,scene,cam]);
 useEffect(()=>()=>post.c.dispose(),[post]);
 useLayoutEffect(()=>{post.c.setSize(size.width,size.height);},[post,size.width,size.height]);
 const v=view(shot,frame),act=acting(shot,frame);
 cam.position.set(...v.eye);cam.fov=v.fov;cam.layers.enable(NOINK);cam.updateProjectionMatrix();cam.lookAt(...v.look);cam.updateMatrixWorld();
 post.lens.focus=v.focus;post.lens.cInf=v.blur;
 useFrame(()=>{CARD_K.uPx.value=gl.domElement.height/1920;post.c.render();},1);
 const solo=shot==='him'||(shot==='clip'&&frame>=CUT)?'him':shot==='two'?null:'her';
 return <>
  <color attach="background" args={['#6b4a50']}/>
  <directionalLight position={[2.8,3.6,3.4]} intensity={2.8} color={L.sunCol} castShadow shadow-mapSize={[3072,3072]} shadow-camera-left={-3.5} shadow-camera-right={3.5} shadow-camera-top={3.5} shadow-camera-bottom={-3.5} shadow-camera-far={14} shadow-bias={-.0004} shadow-normalBias={.012}/>
  <hemisphereLight args={[L.sky,L.ground,L.hemiI]}/>
  <World/>
  {solo!=='her'&&<Person variant={variant} role="rintaro" at={HIM} act={act.him}/>}
  {solo!=='him'&&<Person variant={variant} role="kaoruko" at={HER} act={act.her}/>}
 </>;
}
const WORDS:[number,string][]=[[0,'She'],[9,'tells'],[16,'him'],[26,"she's"],[32,'never'],[42,'found'],[52,'him'],[58,'scary.'],[70,'']];
function Film({variant,shot}:{variant:Variant;shot:Shot}){
 const f=useCurrentFrame(),word=shot==='clip'?WORDS.filter(([a])=>a<=f).at(-1)?.[1]:'';
 return <AbsoluteFill>
  <ThreeCanvas width={1080} height={1920} shadows gl={{antialias:false,stencil:false,preserveDrawingBuffer:true}} camera={{fov:40,near:.1,far:40}}>
   <Scene variant={variant} shot={shot} frame={f}/>
  </ThreeCanvas>
  {shot==='clip'&&<Audio src={staticFile('audio/darian-source.mp3')} startFrom={Math.round(30.24*30)} endAt={Math.round(32.6*30)} volume={2.3}/>}
  {!!word&&<div style={{position:'absolute',top:'82%',left:'50%',transform:'translate(-50%,-50%)',font:'900 76px Arial,sans-serif',color:'#fff',WebkitTextStroke:'8px #201a27',paintOrder:'stroke fill',whiteSpace:'nowrap'}}>{word}</div>}
 </AbsoluteFill>;
}
registerRoot(()=><Composition id="Style" component={Film} width={1080} height={1920} fps={30} durationInFrames={126} defaultProps={{variant:'ours' as Variant,shot:'two' as Shot}}/>);
