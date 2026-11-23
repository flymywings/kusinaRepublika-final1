import React, {useLayoutEffect, useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {EffectComposer, EffectPass, RenderPass} from 'postprocessing';
import * as THREE from 'three';
import {Actor} from '../diamond-field-v5/Cast';
import type {Pose} from '../diamond-field-v5/acting';
import {InkPass, NOINK} from '../bridge-recreation/ink';
import {LensBlur} from '../bridge-recreation/lensblur';
import timing from './timing.json';
import story from './story.json';

type Vec = [number, number, number];
type Angle = {eye: Vec; target: Vec; fov: number};
type Scene = 'hook'|'puddle'|'reveal'|'setup'|'entrance';
const ease = (f: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((f - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const mix = THREE.MathUtils.lerp;
const point = (a: Vec, b: Vec, t: number): Vec => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const plateY = 1.04;
const anchor = .49;
const lift = .245;
const shelfBottom = 1.4615;
const contactY = plateY + .043;
const caseLock: Vec = [-1.235,.94,.16];
const keyClick = 8;
const hoodOpens = 25;
const caseHinge: Vec = [.15,.856,-.68];
const caseRimRadius = .68;
const caseWidth = 2.04;
const caseAngle = -1.48;
const glassVertex = `
  varying vec3 viewNormal;
  varying vec3 viewPoint;
  varying vec2 surfaceUV;
  void main() {
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    viewPoint = p.xyz;
    viewNormal = normalMatrix * normal;
    surfaceUV = uv;
    gl_Position = projectionMatrix * p;
  }
`;
const glassFragment = `
  varying vec3 viewNormal;
  varying vec3 viewPoint;
  varying vec2 surfaceUV;
  uniform vec3 glassTint;
  uniform vec3 ink;
  void main() {
    float facing = abs(dot(normalize(viewNormal), normalize(-viewPoint)));
    float contour = 1.0 - smoothstep(0.17, 0.34, facing);
    float inside = gl_FrontFacing ? 0.0 : 1.0;
    float stripe = 1.0 - smoothstep(0.014, 0.028, abs(surfaceUV.x - (0.92 - 0.09 * surfaceUV.y)));
    float stripeHeight = smoothstep(0.24, 0.31, surfaceUV.y) * (1.0 - smoothstep(0.74, 0.83, surfaceUV.y));
    float shine = stripe * stripeHeight * (1.0 - contour);
    vec3 surface = mix(glassTint, vec3(0.91, 0.98, 1.0), shine);
    float opacity = mix(0.16 + 0.055 * inside + 0.25 * shine, 0.98, contour);
    gl_FragColor = vec4(mix(surface, ink, contour), opacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function DisplayCase({open}: {open: number}) {
  const glass = useMemo(()=>new THREE.LatheGeometry([
    new THREE.Vector2(.61,0),new THREE.Vector2(.61,.30),new THREE.Vector2(.59,.45),
    new THREE.Vector2(.51,.59),new THREE.Vector2(.39,.69),new THREE.Vector2(.21,.75),
    new THREE.Vector2(0,.77),
  ],64),[]);
  const glassColors=useMemo(()=>({
    glassTint:{value:new THREE.Color('#a6d9e6')},
    ink:{value:new THREE.Color('#151219')},
  }),[]);
  return <group position={[caseHinge[0],0,0]} scale={[caseWidth,1,1]}>
    <mesh position={[0,.84,0]} rotation-x={Math.PI/2} castShadow receiveShadow>
      <torusGeometry args={[caseRimRadius,.025,8,64]}/>
      <meshPhongMaterial color="#765032" shininess={37}/>
    </mesh>
    <Box p={[0,.853,-.69]} size={[.12,.065,.13]} color="#845b36" shiny/>
    <Box p={[(caseLock[0]+.026-caseHinge[0])/caseWidth,.888,caseLock[2]]} size={[.047,.14,.11]} color="#996632" shiny/>
    <group position={[0,caseHinge[1],caseHinge[2]]} rotation-x={caseAngle*open}>
      <group position={[0,0,caseRimRadius]}>
        <mesh geometry={glass} scale={[caseRimRadius/.61,1.15,caseRimRadius/.61]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
          <shaderMaterial vertexShader={glassVertex} fragmentShader={glassFragment} uniforms={glassColors}
            side={THREE.DoubleSide} transparent depthWrite={false}/>
        </mesh>
        <mesh rotation-x={Math.PI/2} castShadow>
          <torusGeometry args={[caseRimRadius,.018,8,64]}/>
          <meshPhongMaterial color="#b48652" shininess={52}/>
        </mesh>
        <mesh position={[0,.90,0]} scale={[.57,1,1]} castShadow>
          <sphereGeometry args={[.044,16,10]}/>
          <meshPhongMaterial color="#b48652" shininess={56}/>
        </mesh>
      </group>
    </group>
  </group>;
}

function IcePouch({position}: {position: Vec}) {
  return <group position={position}>
    <mesh position={[0,-.195,0]} scale={[1,1,.94]} castShadow>
      <cylinderGeometry args={[.243,.210,.39,20,1,true]}/>
      <meshPhongMaterial color="#74503d" side={THREE.DoubleSide}/>
    </mesh>
    <mesh rotation-x={Math.PI/2} scale={[1,.94,1]}>
      <torusGeometry args={[.241,.016,7,24]}/>
      <meshPhongMaterial color="#b58a5a"/>
    </mesh>
    <Disc p={[0,-.375,0]} radius={.207} depth={.035} color="#4a322b"/>
  </group>;
}

function CaseKey({frame}: {frame: number}) {
  return <group position={caseLock} rotation-x={ease(frame,keyClick-3,keyClick+2)*1.45}>
    <mesh position={[-.065,0,0]} rotation-z={Math.PI/2}>
      <cylinderGeometry args={[.012,.012,.14,10]}/>
      <meshStandardMaterial color="#cfa35b" metalness={.35} roughness={.5}/>
    </mesh>
    <mesh position={[-.14,0,0]} rotation-y={Math.PI/2}>
      <torusGeometry args={[.043,.009,6,20]}/>
      <meshStandardMaterial color="#e3b566" metalness={.35} roughness={.5}/>
    </mesh>
  </group>;
}

function StoryActor({pose}: {pose: Pose}) {
  return <Actor pose={{...pose,noseMark:false}}/>;
}

function Guards({frame, arrival, revised, entryFrame}: {
  frame: number; arrival?: number; revised?: boolean; entryFrame?: number;
}) {
  const stop = timing.guardBrakes;
  const plate = timing.guardNoticesPlate;
  const clue = timing.guardNoticesPuddle;
  const run = ease(frame,-6,stop);
  const brake = ease(frame,stop-4,stop+1)*(1-ease(frame,stop+1,plate+3));
  const recoil = ease(frame,plate,plate+4)*(1-ease(frame,plate+5,clue+4));
  const peer = ease(frame,clue,clue+13);
  const plateTarget: Vec = [-.43,1.29,0];
  const puddleTarget: Vec = [.38,.82,.33];
  const leadAtCounter=mix(1.45,revised ? .40 : -.06,run);
  const leadArrival=entryFrame===undefined ? 0 : ease(entryFrame,story.entranceRing+2,story.guardClose);
  const partnerArrival=entryFrame===undefined ? 0 : ease(entryFrame,story.entranceRing+12,story.guardClose+5);
  const leadX=entryFrame!==undefined ? mix(3.35,leadAtCounter,ease(leadArrival,.38,1))
    : arrival===undefined ? leadAtCounter : mix(2.84,leadAtCounter,arrival);
  const leadZ=entryFrame===undefined ? -1.34 : mix(-3.72,-1.34,leadArrival);
  const lead: Pose = {
    id:'investorA', pos:[leadX,0,leadZ], scale:1.13, view:entryFrame===undefined?'front':'side',
    mood:frame<plate?'inspect':frame<clue?'wow':'concern',
    look:-.71+.99*peer, gazeTarget:point(plateTarget,puddleTarget,peer),
    lean:-11*(1-run)+10*brake+7*recoil-8*peer,
    head:-8*recoil+15*peer, kneel:.13*brake+.22*peer, blink:0,
    bob:.04*brake-.025*recoil, walk:entryFrame!==undefined ? leadArrival*3.25
      : arrival===undefined ? frame<stop?(frame+3)/13:0 : arrival*2.15,
    left:entryFrame===undefined ? [leadX-.31-.20*recoil,1.16+.25*recoil,leadZ+.10] : undefined,
    right:entryFrame===undefined ? [leadX+.26+.15*recoil,1.09+.23*recoil,leadZ+.14] : undefined,
  };
  const follow = ease(frame,4,26);
  const notice = ease(frame,26,39);
  const partnerStart=mix(3.58,1.22,ease(ease(story.guardClose,story.entranceRing+12,story.guardClose+5),.54,1));
  const partnerX=entryFrame!==undefined ? mix(3.58,1.22,ease(partnerArrival,.54,1))
    : revised ? mix(partnerStart,-.91,follow) : arrival===undefined ? mix(-1.62,-.91,follow) : mix(-2.79,-1.62,arrival);
  const partnerZ=entryFrame!==undefined ? mix(-3.98,-1.90,partnerArrival) : revised ? -1.90 : -1.80;
  const partner: Pose = {
    id:'king', pos:[partnerX,0,partnerZ], scale:1.02, view:'side',
    mood:frame<27?'inspect':'doubt', look:revised ? mix(-.85,.84,follow) : .84,
    gazeTarget:point([leadX,1.52,-1.34],puddleTarget,notice),
    lean:9*(1-follow)+5*notice, head:8*notice, kneel:.10*notice, blink:0,
    bob:0, walk:entryFrame!==undefined ? partnerArrival*3.1
      : arrival===undefined ? frame>4&&frame<26?(frame-4)/15:0 : arrival*1.8,
  };
  return <>
    {(entryFrame===undefined || entryFrame>=story.entranceRing+11) && <StoryActor pose={partner}/>}
    {(entryFrame===undefined || entryFrame>=story.entranceRing+2) && <StoryActor pose={lead}/>}
  </>;
}

function paintedGrain() {
  const canvas = document.createElement('canvas');
  canvas.width=512;
  canvas.height=128;
  const g=canvas.getContext('2d')!;
  g.fillStyle='#e9dfd8';
  g.fillRect(0,0,512,128);
  for(let row=0;row<60;row++) {
    const y=row*2.2;
    g.strokeStyle=row%5===0 ? '#a19792' : '#d2c6c1';
    g.lineWidth=row%5===0 ? 1.4 : .72;
    g.beginPath();
    g.moveTo(0,y);
    g.bezierCurveTo(145,y+5*Math.sin(row*.7),335,y+7*Math.cos(row*.4),512,y);
    g.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}

function Box({p, size, color, shiny = false, outline = true, grain}: {
  p: Vec; size: Vec; color: string; shiny?: boolean; outline?: boolean; grain?: THREE.Texture;
}) {
  const geometry = useMemo(() => new THREE.BoxGeometry(...size), [size[0], size[1], size[2]]);
  return <group position={p}>
    <mesh geometry={geometry} castShadow receiveShadow onUpdate={mesh=>mesh.layers.set(outline?0:NOINK)}>
      <meshPhongMaterial color={color} map={grain} specular={shiny ? '#f3bb80' : '#241725'} shininess={shiny ? 46 : 12} />
    </mesh>
  </group>;
}

function Disc({p, radius, depth, color}: {p: Vec; radius: number; depth: number; color: string}) {
  return <mesh position={p} castShadow receiveShadow>
    <cylinderGeometry args={[radius, radius, depth, 48]}/>
    <meshPhongMaterial color={color} specular="#d19e7a" shininess={29}/>
  </mesh>;
}

function Diamond({p, frame}: {p: Vec; frame: number}) {
  const shape = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, -.247), new THREE.Vector2(.271, -.021),
    new THREE.Vector2(.267, .022), new THREE.Vector2(.149, .143), new THREE.Vector2(0, .143),
  ], 8), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(shape, 15), [shape]);
  return <group position={p} rotation-y={.30 + .20 * ease(frame, 10, 42)}>
    <mesh geometry={shape} castShadow>
      <meshPhongMaterial color="#82d7eb" emissive="#153e59" specular="#ffffff" shininess={110} flatShading/>
    </mesh>
    <lineSegments geometry={edges}><lineBasicMaterial color="#264660" transparent opacity={.66}/></lineSegments>
    <mesh position={[-.093, .101, .159]}>
      <sphereGeometry args={[.018, 8, 6]}/><meshBasicMaterial color="#fff6d9"/>
    </mesh>
  </group>;
}

function Grip({p}: {p: Vec}) {
  return <group position={p}>
    <mesh position={[.018,.038,.005]} rotation-z={-.27} scale={[.103,.030,.029]} castShadow>
      <sphereGeometry args={[1,18,8]}/><meshPhongMaterial color="#514155"/>
    </mesh>
    <mesh position={[.019,-.044,-.009]} rotation-z={.27} scale={[.096,.028,.029]} castShadow>
      <sphereGeometry args={[1,18,8]}/><meshPhongMaterial color="#38293e"/>
    </mesh>
  </group>;
}

function Counter({shallow}: {shallow?: boolean}) {
  const grain=useMemo(paintedGrain,[]);
  useLayoutEffect(()=>()=>grain.dispose(),[grain]);
  return <>
    <Box p={[0,.33,shallow ? .21 : 0]} size={[4.7,.64,shallow?1.84:2.26]} color="#674333" grain={grain}/>
    <Box p={[0,.665,shallow ? .245 : 0]} size={[4.98,.145,shallow?2.01:2.5]} color="#a67650" grain={grain}/>
    <Box p={[0,.739,shallow ? .245 : 0]} size={[4.95,.037,shallow?1.97:2.46]} color="#b9875d" grain={grain}/>
    <Box p={[0,.33,1.142]} size={[4.6,.053,.034]} color="#b17e4c"/>
    {[-1.54,0,1.54].map(x=><group key={x}>
      <Box p={[x,.34,1.146]} size={[1.37,.43,.034]} color="#936146" grain={grain}/>
      <Box p={[x,.34,1.166]} size={[1.24,.316,.021]} color="#754a38" grain={grain}/>
      <Box p={[x,.47,1.186]} size={[.26,.038,.045]} color="#d0a86d" shiny/>
    </group>)}
    <Box p={[0,.763,-.035]} size={[2.86,.022,1.21]} color="#562c42"/>
    <Box p={[0,.777,.571]} size={[2.86,.013,.032]} color="#c78d69"/>
    <Box p={[0,.777,-.639]} size={[2.86,.013,.032]} color="#c78d69"/>
  </>;
}

const tint = (warm: string, cold: string, t: number) => new THREE.Color(warm).lerp(new THREE.Color(cold),t);

const streetHouses = [
  [-3.60,-4.65,1.02,2.02],[-2.24,-5.30,1.15,2.19],[-.98,-4.72,1.03,1.93],
  [.28,-5.59,1.20,2.12],[1.54,-4.53,1.05,1.87],[2.90,-5.47,1.24,2.15],
  [4.37,-4.83,1.24,2.03],
] as const;

function StreetHouse({x,z,width,eaves,wall,roof,light}: {
  x: number; z: number; width: number; eaves: number;
  wall: THREE.Color; roof: THREE.Color; light: THREE.Color;
}) {
  const depth=.66;
  const base=1.04;
  const roofShape=useMemo(()=>new THREE.Shape([
    new THREE.Vector2(-width*.54,0),new THREE.Vector2(width*.54,0),new THREE.Vector2(0,.28),
  ]),[width]);
  const shadedWall=wall.clone().multiplyScalar(.77);
  return <group position={[x,0,z]} rotation-y={x*.035}>
    <mesh position={[0,(base+eaves)/2,0]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <boxGeometry args={[width,eaves-base,depth]}/>
      {[shadedWall,shadedWall,wall,shadedWall,wall,shadedWall].map((color,index)=>
        <meshBasicMaterial key={index} attach={'material-'+index} color={color}/>)}
    </mesh>
    <mesh position={[0,eaves,-depth/2-.05]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <extrudeGeometry args={[roofShape,{depth:depth+.10,bevelEnabled:false}]}/>
      <meshBasicMaterial attach="material-0" color={roof}/>
      <meshBasicMaterial attach="material-1" color={roof.clone().multiplyScalar(.79)}/>
    </mesh>
    {[-.27,0,.27].map(offset=><mesh key={offset} position={[width*offset,eaves-.21,depth/2+.007]}
      onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <planeGeometry args={[.106,.153]}/>
      <meshBasicMaterial color={light}/>
    </mesh>)}
  </group>;
}

function WindowView({cold, daylight, frame}: {cold: number; daylight: boolean; frame: number}) {
  const skyTop=daylight?'#9cc5e2':tint('#de957d','#6b91cc',cold);
  const skyBottom=daylight?'#e4f2f4':tint('#ffe0a1','#abc1e2',cold);
  const wall=daylight?new THREE.Color('#c2b1a2'):tint('#bb957b','#788aa8',cold);
  const roof=daylight?new THREE.Color('#ab7770'):tint('#a37870','#616f91',cold);
  const light=daylight?new THREE.Color('#9a9e9f'):tint('#f1ca8c','#d0bd9d',cold);
  return <>
    <mesh position={[0,3,-12]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <planeGeometry args={[28,12]}/>
      <shaderMaterial uniforms={{top:{value:new THREE.Color(skyTop)},bottom:{value:new THREE.Color(skyBottom)}}}
        vertexShader={`
          varying vec2 skyUV;
          void main() {
            skyUV=uv;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          }`}
        fragmentShader={`
          varying vec2 skyUV;
          uniform vec3 top;
          uniform vec3 bottom;
          void main() {
            gl_FragColor=vec4(mix(bottom,top,smoothstep(.39,.70,skyUV.y)),1.0);
            #include <colorspace_fragment>
          }`}/>
    </mesh>
    {[[-4.5,1.24,-9.9,4.1,1.15],[.75,1.12,-8.6,4.9,1.29],[5.2,1.30,-9.1,3.1,1.06]].map(([x,y,z,sx,sy])=>
      <mesh key={x} position={[x,y,z]} scale={[sx,sy,1.12]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
        <sphereGeometry args={[1,26,14]}/>
        <meshBasicMaterial color={daylight?'#a8b8ad':tint('#c79e80','#819ab7',cold)} />
      </mesh>)}
    <mesh position={[0,1.06,-8.1]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
      <planeGeometry args={[20,2.1]}/>
      <meshBasicMaterial color={daylight?'#b4b4a1':tint('#ba967a','#7c92ae',cold)}/>
    </mesh>
    {streetHouses.map(([x,z,width,eaves])=><StreetHouse key={x} x={x} z={z} width={width} eaves={eaves}
      wall={wall} roof={roof} light={light}/>)}
    {[[-5.1,3.45,-7.7,.52],[-2.5,3.33,-8.5,.69],[-.55,3.15,-6.25,.45],[2.03,3.56,-7.1,.62],[4.64,3.30,-8.2,.51]]
      .map(([start,y,z,width],index)=>
        <mesh key={start} position={[start+frame*(.0039+index*.00055),y,z]} scale={[width,.073,.21]}
          onUpdate={mesh=>mesh.layers.set(NOINK)}>
          <sphereGeometry args={[1,22,10]}/>
          <meshBasicMaterial color={daylight?'#fffdf1':tint('#fff3c7','#b7cce5',cold)}/>
        </mesh>)}
  </>;
}

function GuardHall() {
  return <group position={[0,0,-.22]}>
    <Box p={[0,-.06,-1.36]} size={[1.61,.12,2.78]} color="#655b65"/>
    <Box p={[0,2.59,-1.36]} size={[1.61,.13,2.78]} color="#393548"/>
    {[-.79,.79].map(x=><group key={x}>
      <Box p={[x,1.30,-1.36]} size={[.11,2.60,2.78]} color="#5e5970"/>
      <Box p={[x*.93,.25,-1.36]} size={[.068,.42,2.78]} color="#454359"/>
      <Box p={[x*.93,.48,-1.36]} size={[.080,.047,2.78]} color="#9b7969"/>
    </group>)}
    {Array.from({length:5},(_,row)=>[-.35,.35].map((x,column)=>
      <Box key={`${row}-${column}`} p={[x,.006,-.27-row*.53]} size={[.67,.011,.50]}
        color={(row+column)%2?'#8a7473':'#756e79'} outline={false}/>))}
    <Box p={[0,1.28,-2.77]} size={[1.61,2.56,.13]} color="#575062"/>
    <Box p={[.18,1.16,-2.67]} size={[1.03,2.29,.11]} color="#94755e"/>
    <Box p={[.18,1.10,-2.59]} size={[.81,2.13,.075]} color="#624f57"/>
    <Box p={[-.06,1.10,-2.53]} size={[.08,.036,.055]} color="#d5b276"/>
    <Box p={[-.69,1.86,-1.72]} size={[.10,.26,.15]} color="#8b6a48"/>
    <mesh position={[-.61,1.88,-1.72]}>
      <sphereGeometry args={[.08,12,8]}/>
      <meshBasicMaterial color="#ffdc91"/>
    </mesh>
    <pointLight position={[-.48,1.9,-1.62]} color="#ffbd76" intensity={5} distance={3.1}/>
  </group>;
}

function Shop({cold, revised, door, daylight, frame}: {
  cold: number; revised?: boolean; door: number; daylight: boolean; frame: number;
}) {
  const plaster=tint(revised?'#c28e74':'#77545b',revised?'#8d9abb':'#4f5471',cold).getStyle();
  return <>
    <color attach="background" args={[tint('#4a3238','#232b41',cold)]}/>
    <Box p={[0,revised?-.10:-.17,0]} size={[16,.2,13]} color={tint('#715047','#414c5d',cold).getStyle()} outline={false}/>
    {revised ? <>
      <WindowView cold={cold} daylight={daylight} frame={frame}/>
      <Box p={[-4.2575,2,-3]} size={[6.485,5,.22]} color={plaster} outline={false}/>
      <Box p={[1.99,2,-3]} size={[1.55,5,.22]} color={plaster} outline={false}/>
      <Box p={[5.8575,2,-3]} size={[3.285,5,.22]} color={plaster} outline={false}/>
      <Box p={[3.44,3.50,-3]} size={[1.35,2,.22]} color={plaster} outline={false}/>
      <Box p={[.10,.6225,-3]} size={[2.23,2.245,.22]} color={plaster} outline={false}/>
      <Box p={[.10,3.9275,-3]} size={[2.23,1.145,.22]} color={plaster} outline={false}/>
    </> : <Box p={[0,2,-3]} size={[15,5,.22]} color={plaster} outline={false}/>}
    {(revised ? [[-2.13,9.74],[5.60,2.8]] : [[0,14]]).map(([x,width])=><group key={x}>
      <Box p={[x,.65,-2.84]} size={[width,1.22,.14]} color={tint(revised?'#74515a':'#4e3549',revised?'#4a5d83':'#292e4a',cold).getStyle()} outline={false}/>
      <Box p={[x,1.26,-2.75]} size={[width,.07,.16]} color="#705264"/>
    </group>)}
    {(revised?[-4.25,-2.9,4.25]:[-4.25,-2.9,2.9,4.25]).map(x=><Box key={x} p={[x,1.1,-2.73]} size={[.11,2.2,.12]} color="#513b4b"/>)}
    <group position={[.1,0,-2.7]}>
      {revised ? <>
        {[-1.17,1.17].map(x=><Box key={x} p={[x,2.55,-.052]} size={[.13,1.85,.45]} color="#574353"/>)}
        {[1.68,3.42].map(y=><Box key={y} p={[0,y,-.052]} size={[2.23,.13,.45]} color="#574353"/>)}
      </> : <>
        <Box p={[0,2.55,0]} size={[2.45,1.83,.11]} color="#2b293e"/>
        <Box p={[0,2.55,.073]} size={[2.23,1.61,.036]} color={tint('#875e55','#547891',cold).getStyle()}/>
      </>}
      {[-.73,0,.73].map(x=><Box key={x} p={[x,2.55,.12]} size={[.058,1.6,.045]} color="#70525e"/>)}
      <Box p={[0,2.52,.12]} size={[2.23,.067,.047]} color="#70525e"/>
      <Box p={[0,1.7,.16]} size={[2.65,.079,.32]} color="#916c63"/>
    </group>
    <group position={[revised?-5:0,0,0]}>
      <Box p={[2.38,1.58,-1.62]} size={[1.05,1.44,.47]} color="#533b49"/>
      {[1.13,1.59,2.04].map(y=><Box key={y} p={[2.39,y,-1.34]} size={[1.01,.067,.17]} color="#9a705e"/>)}
      {[[-.32,1.23],[.29,1.7],[-.17,2.15]].map(([x,y])=><Box key={y} p={[2.39+x,y,-1.385]} size={[.29,.16,.12]} color={y>1.5 ? '#77617a' : '#93624c'}/>)}
    </group>
    {revised && <group position={[3.44,0,-2.69]}>
      <GuardHall/>
      {[-.72,.72].map(x=><Box key={x} p={[x,1.27,0]} size={[.112,2.60,.15]} color="#b38963"/>)}
      <Box p={[0,2.56,0]} size={[1.57,.14,.15]} color="#b38963"/>
      <Box p={[0,.016,.11]} size={[1.48,.07,.34]} color="#9a775f"/>
      <group position={[.62,0,.03]} rotation-y={1.32*door}>
        <Box p={[-.62,1.24,0]} size={[1.24,2.41,.084]} color="#694652"/>
        {[.58,1.78].map(y=><Box key={y} p={[-.62,y,.051]} size={[.91,.85,.035]} color="#966050"/>)}
        <Box p={[-1.07,1.10,.088]} size={[.12,.04,.052]} color="#caa471" shiny/>
      </group>
    </group>}
    <Counter shallow={revised}/>
  </>;
}

function Spring({rise}: {rise: number}) {
  const geometry = useMemo(() => {
    const points = Array.from({length:97}, (_,i) => {
      const a = i / 96;
      return new THREE.Vector3(.096*Math.cos(a*12*Math.PI), a, .096*Math.sin(a*12*Math.PI));
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, .019, 6, false);
  }, []);
  return <mesh position={[-.43,.805,0]} scale-y={plateY-.83+rise} geometry={geometry} castShadow>
    <meshPhongMaterial color="#d18c53" specular="#ffdb9f" shininess={47}/>
  </mesh>;
}

function Bell({ring}: {ring: number}) {
  const swing = ring < 0 ? 0 : Math.sin(ring*.57)*.24*Math.exp(-ring/23);
  const geometry = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(.239,0),new THREE.Vector2(.258,.02),new THREE.Vector2(.225,.048),
    new THREE.Vector2(.181,.127),new THREE.Vector2(.15,.26),new THREE.Vector2(.089,.335),new THREE.Vector2(0,.36),
  ],32),[]);
  return <group position={[1.12,.774,-.105]}>
    <Disc p={[0,.036,0]} radius={.32} depth={.072} color="#60404b"/>
    <Disc p={[0,.092,0]} radius={.28} depth={.052} color="#a7744b"/>
    <Box p={[.251,.113,.016]} size={[.124,.058,.134]} color="#78523e" shiny/>
    <Box p={[.251,.329,.016]} size={[.088,.43,.100]} color="#b38454" shiny/>
    <Box p={[.129,.551,.016]} size={[.331,.063,.110]} color="#c79460" shiny/>
    <group position={[0,.515,0]} rotation-z={swing}>
      <Box p={[0,.024,.016]} size={[.091,.083,.077]} color="#916342" shiny/>
      <mesh position={[0,-.355,0]} geometry={geometry} castShadow>
        <meshPhongMaterial color="#dcaa59" specular="#e9c286" shininess={44} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0,-.38,.018]} castShadow>
        <sphereGeometry args={[.049,14,8]}/><meshPhongMaterial color="#a2704e"/>
      </mesh>
    </group>
    <mesh position={[0,.544,.08]} scale={[1,1,.45]} castShadow>
      <sphereGeometry args={[.034,14,8]}/><meshPhongMaterial color="#6c4937"/>
    </mesh>
  </group>;
}

function Puddle({size, rippleAge}: {size: number; rippleAge: number}) {
  const shape=useMemo(()=>{
    const outline=[[-.34,-.07],[-.24,-.17],[-.03,-.17],[.10,-.13],[.24,-.17],[.34,-.07],
      [.27,.018],[.19,.05],[.21,.12],[.08,.17],[-.04,.13],[-.15,.18],[-.29,.11]];
    const points=new THREE.CatmullRomCurve3(outline.map(([x,y])=>new THREE.Vector3(x,y,0)),true).getPoints(64);
    return new THREE.Shape(points.map(({x,y})=>new THREE.Vector2(x,y)));
  },[]);
  return <mesh position={[.49,.785,.31]} rotation-x={-Math.PI/2} scale={size}
    onUpdate={mesh=>mesh.layers.set(NOINK)}>
    <shapeGeometry args={[shape]}/>
    <shaderMaterial transparent depthWrite={false} uniforms={{rippleAge:{value:rippleAge}}}
      vertexShader={`
        varying vec2 spot;
        void main() {
          spot = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`}
      fragmentShader={`
        varying vec2 spot;
        uniform float rippleAge;
        void main() {
          float radius = length(spot * vec2(1.0, 1.36));
          float highlight = exp(-48.0 * abs(spot.y - 0.035 + spot.x * 0.25))
            * (1.0 - smoothstep(0.07, 0.29, abs(spot.x + 0.04)));
          float ring = (1.0 - smoothstep(0.003, 0.014, abs(radius - 0.24 * rippleAge)))
            * (1.0 - smoothstep(0.14, 0.87, rippleAge));
          vec3 color = mix(vec3(.027,.078,.113), vec3(.59,.84,.91), clamp(highlight*.57 + ring*.44,0.0,1.0));
          gl_FragColor = vec4(color, .68 + highlight*.19);
          #include <colorspace_fragment>
        }`}/>
  </mesh>;
}

function Display({frame, scene, revised}: {frame: number; scene: Scene; revised?: boolean}) {
  const hook = scene==='hook';
  const puddle = scene==='puddle';
  const setup = scene==='setup';
  const entrance = scene==='entrance';
  const openingHook=hook && revised;
  const caseOpen=hook ? ease(frame,keyClick+1,hoodOpens) : setup ? ease(frame,story.setup+9,story.setup+42) : 1;
  const arrival = ease(frame,story.entranceRing+4,story.guardClose+2);
  const demoRaise = ease(frame,story.demoRelease,story.demoRing+1);
  const opened = puddle || entrance ? 1 : setup ? demoRaise : hook ? 0 : ease(frame,timing.plateReleases,timing.plateReleases+6);
  const rise = lift * opened;
  const insert = ease(frame,78,timing.iceContacts);
  const withdraw = ease(frame,timing.iceContacts+3,135);
  const moveGem = ease(frame,hook ? openingHook ? hoodOpens+1 : timing.hookLiftStart : timing.revealLiftStart,
    hook ? openingHook ? 47 : 42 : timing.revealDiamondClears+12);
  const gemPath = setup
    ? point([-.43,plateY+.283,0],[-.76,1.91,.08],ease(frame,story.demoLift+19,story.demoRing+4))
    : hook
    ? point([-.43,plateY+.283,0],[-1.20,1.53,.075],moveGem)
    : point([-.43,plateY+.283,0],[-1.56,1.82,.05],moveGem);
  if (hook) gemPath[0] -= .68 * ease(frame,openingHook?43:32,openingHook?63:58);
  const iceHeight = shelfBottom-contactY;
  const iceWidth = .28*mix(1,.15,ease(frame,190,timing.plateReleases));
  const iceSeat: Vec=[anchor,contactY+iceHeight/2,0];
  const pouch: Vec=[-1.51,1.18,-.32];
  const carryingPouch=scene==='reveal' && revised && frame<208;
  const icePath=useMemo(()=>new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.51,1.18-(shelfBottom-contactY)/2-.016,-.32),
    new THREE.Vector3(-1.51,1.32,-.32),
    new THREE.Vector3(-1.34,1.53,-.40),
    new THREE.Vector3(.19,1.54,-.43),
    new THREE.Vector3(anchor,contactY+(shelfBottom-contactY)/2,-.40),
    new THREE.Vector3(anchor,contactY+(shelfBottom-contactY)/2,0),
  ]),[]);
  const travel=mapFrame(frame,[[79,0],[85,.20],[93,.40],[102,.64],[106,.82],[110,1]]);
  const iceAt = revised && scene==='reveal' ? icePath.getPoint(travel).toArray() as Vec
    : point([-.05,contactY+.23,.28],iceSeat,hook ? 1 : insert);
  const showIce = hook || scene==='reveal' && frame>=(revised?68:72) && frame<timing.plateReleases;
  const reach = hook ? openingHook ? ease(frame,hoodOpens-3,hoodOpens+1) : ease(frame,0,11) : ease(frame,139,153);
  const wrist = point([-.84,1.17,-.06],[-.63,1.31,.10],reach);
  const hand: Vec = moveGem > 0 ? [gemPath[0]-.20,gemPath[1]-.005,gemPath[2]+.10] : wrist;
  const gemVisible = setup || hook || scene==='reveal' && frame<timing.revealDiamondClears+13;
  const fittingIce = scene==='reveal' && showIce && frame<135;
  const stealing = hook || scene==='reveal' && frame>=139 && frame<timing.revealDiamondClears+13;
  const retreat = hook ? ease(frame,openingHook?43:30,68) : ease(frame,169,211);
  const pouchOnScreen: Vec=[pouch[0]-1.30*retreat,pouch[1]-.12*retreat,pouch[2]-.64*retreat];
  const approach = hook ? 1 : ease(frame,69,86);
  const placingIce=!!revised && scene==='reveal' && frame<139;
  const stepAcross=placingIce ? ease(frame,88,109)*(1-ease(frame,116,138)) : 0;
  const thiefPosition: Vec = revised
    ? [-1.54-.13*(1-approach)-1.30*retreat-(carryingPouch ? .17 : 0)+1.66*stepAcross,0,
      (placingIce ? -.88 : -.55)-.64*retreat]
    : [-.73-.19*(1-approach)-1.56*retreat,0,-1.34+.08*retreat];
  const cubeGrip: Vec = [iceAt[0]-.14,iceAt[1]+.085,iceAt[2]+.052];
  const restHand: Vec=[thiefPosition[0]+.30,1.06,thiefPosition[2]+.10];
  const iceHand=placingIce
    ? frame<79 ? point(restHand,cubeGrip,ease(frame,71,79))
      : point(cubeGrip,restHand,ease(frame,112,124))
    : [cubeGrip[0]-.69*withdraw,cubeGrip[1]-.22*withdraw,cubeGrip[2]] as Vec;
  const listen = hook ? ease(frame,18,24)*(1-ease(frame,33,42)) : 0;
  const thiefHand = fittingIce ? iceHand : stealing && (!openingHook || frame>=hoodOpens) ? hand : undefined;
  const rimGrip: Vec=[caseHinge[0]-caseRimRadius*caseWidth,caseHinge[1]-caseRimRadius*Math.sin(caseAngle*caseOpen),caseHinge[2]+caseRimRadius*Math.cos(caseAngle*caseOpen)];
  const keyHand: Vec | undefined = openingHook && frame<=hoodOpens
    ? point([caseLock[0]-.14,caseLock[1],caseLock[2]],rimGrip,ease(frame,keyClick,keyClick+5))
    : carryingPouch && (frame<90 || frame>=138) ? [pouchOnScreen[0]-.21,pouchOnScreen[1]-.045,pouchOnScreen[2]] : undefined;
  const thief: Pose = {
    id:'slack', pos:thiefPosition, scale:1.10, view:'side',
    mood:moveGem>.35 && listen<.4?'sly':'inspect', look:1-1.8*retreat,
    gazeTarget:point(thiefHand ?? keyHand ?? gemPath,[1.14,1.14,0],listen),
    lean:10*(1-retreat)-7*retreat+6*stepAcross, head:5*listen, kneel:.04+.06*stepAcross,
    blink:0, bob:0, walk:stepAcross>0 && stepAcross<1 ? frame/12 : retreat>0 && retreat<1 ? frame/14 : 0,
    right:thiefHand,
    left:keyHand,
  };
  const dripStart=frame>=timing.finalDrip ? timing.finalDrip : frame>=205 ? 205 : 190;
  const dripProgress=(frame-dripStart)/8;
  const puddleSize=puddle || entrance ? 1 : mix(.12,1,ease(frame,190,timing.plateReleases+4));
  const demoHand = point([-1.14,1.18,-1.24],[gemPath[0]-.16,gemPath[1]-.02,.10],ease(frame,story.demoLift-5,story.demoLift+15));
  const jeweler: Pose = {
    id:'engineer', pos:[-.97,0,-1.32], scale:1.15, view:'front',
    mood:frame<story.demoRing?'inspect':'pleased', look:.65, gazeTarget:gemPath,
    lean:9-6*demoRaise, head:4+4*demoRaise, kneel:.03, blink:0,bob:0,walk:0,
    right:demoHand,
    left:revised && frame<story.setup+42 ? rimGrip : undefined,
  };
  const ring = setup ? frame-story.demoRing : entrance ? frame-story.entranceRing : scene==='reveal' ? frame-timing.bellSounds : -1;
  const hammerRebound = .08*ease(ring,0,5);
  return <>
    {puddle && <Guards frame={frame} revised={revised}/>}
    {entrance && <Guards frame={0} revised={revised} arrival={arrival} entryFrame={revised?frame:undefined}/>}
    {setup && <StoryActor pose={jeweler}/>}
    {(hook || scene==='reveal' && frame<208) && <StoryActor pose={thief}/>}
    <Disc p={[-.43,.803,0]} radius={.54} depth={.06} color="#3c263a"/>
    <Disc p={[-.43,.835,0]} radius={.502} depth={.038} color="#926258"/>
    <Spring rise={rise}/>
    <Disc p={[-.43,.927+rise/2,0]} radius={.053} depth={.21+rise} color="#ad7753"/>
    <Disc p={[-.43,plateY+rise,0]} radius={.565} depth={.079} color="#ab754c"/>
    <Disc p={[-.43,plateY+.043+rise,0]} radius={.494} depth={.017} color="#883e52"/>
    <Box p={[.274,plateY+rise,0]} size={[.68,.083,.235]} color="#c38a56" shiny/>
    <Box p={[.81,.81,-.045]} size={[.29,.087,.37]} color="#81516a"/>
    <Box p={[.797,1.151,-.022]} size={[.126,.71,.158]} color="#b57a4e" shiny/>
    <Box p={[.636,1.536,-.022]} size={[.47,.09,.205]} color="#d6a46c" shiny/>
    <Box p={[.507,1.475,-.014]} size={[.235,.027,.2]} color="#8d583e"/>
    <Box p={[.12,.974,-.105]} size={[.08,.37,.10]} color="#936441" shiny/>
    <group position={[.12,1.16,-.105]} rotation-z={mix(.22,-.23,opened)+hammerRebound}>
      <Box p={[.111,0,0]} size={[1.322,.038,.064]} color="#d1a36b" shiny/>
      <mesh position={[.772,0,0]} castShadow>
        <sphereGeometry args={[.057,14,8]}/><meshPhongMaterial color="#bd874c"/>
      </mesh>
    </group>
    <Bell ring={ring}/>
    {revised && <DisplayCase open={caseOpen}/>}
    {carryingPouch && <IcePouch position={pouchOnScreen}/>}
    {openingHook && frame<=keyClick+3 && <CaseKey frame={frame}/>}
    {(puddle || entrance || (scene==='reveal' && frame>=190)) &&
      <Puddle size={puddleSize} rippleAge={puddle || entrance ? 1 : Math.max(0,frame-dripStart-8)/15}/>}
    {showIce && <group position={iceAt}>
      <Box p={[0,0,0]} size={[iceWidth,iceHeight,.244*iceWidth/.28]} color="#9cd4f1" shiny/>
      <Box p={[-iceWidth*.22,0,.122*iceWidth/.28]} size={[iceWidth*.088,iceHeight*.70,.008]} color="#f1ffff" outline={false}/>
    </group>}
    {fittingIce && frame>=79 && frame<122 && <Grip p={iceHand}/>}
    {gemVisible && <Diamond p={gemPath} frame={frame}/>}
    {setup && frame>=story.demoLift+15 && <Grip p={demoHand}/>}
    {stealing && (hook ? frame>=(openingHook?hoodOpens:8) : frame>=150) && <Grip p={hand}/>}
    {scene==='reveal' && dripProgress>=0 && dripProgress<=1 && <mesh position={[anchor,mix(1.07,.816,dripProgress*dripProgress),.32]} scale={[.025,.04,.025]}>
      <sphereGeometry args={[1,12,8]}/><meshPhongMaterial color="#c7eced" emissive="#285978"/>
    </mesh>}
  </>;
}

function Camera({angle}: {angle: Angle}) {
  const camera = useThree(s=>s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...angle.eye);
    camera.lookAt(...angle.target);
    camera.fov = angle.fov;
    camera.layers.enable(NOINK);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  },[camera,angle]);
  return null;
}

function WorldInk({focus, revised}: {focus: Vec; revised?: boolean}) {
  const {camera,scene,gl,size}=useThree();
  const {composer,lens}=useMemo(()=>{
    const pipeline=new EffectComposer(gl,{multisampling:0});
    pipeline.addPass(new RenderPass(scene,camera));
    pipeline.addPass(new InkPass(scene,camera as THREE.PerspectiveCamera,revised ? {
      widthNear:3.65,widthFar:2.25,creaseScale:.48,concaveGain:.36,depthLo:.014,
    } : {}));
    const blur=revised ? new LensBlur({maxCoC:8,nearScale:.55}) : undefined;
    if (blur) {
      pipeline.addPass(new EffectPass(camera,blur.pre));
      pipeline.addPass(new EffectPass(camera,blur.main));
    }
    return {composer:pipeline,lens:blur};
  },[camera,scene,gl,revised]);
  useLayoutEffect(()=>()=>composer.dispose(),[composer]);
  useLayoutEffect(()=>composer.setSize(size.width,size.height),[composer,size.width,size.height]);
  const focalPoint=useMemo(()=>new THREE.Vector3(),[]);
  const forward=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(()=>{
    if (lens) {
      lens.focus=Math.max(.15,focalPoint.set(...focus).sub(camera.position).dot(camera.getWorldDirection(forward)));
      lens.cInf=12;
    }
    composer.render();
  },1);
  return null;
}

function View({frame, scene, alpha=1, cameraOverride, coldOverride, revised}: {
  frame: number; scene: Scene; alpha?: number; cameraOverride?: Angle; coldOverride?: number; revised?: boolean;
}) {
  const exteriorFrame=useCurrentFrame();
  const hook = scene==='hook';
  const puddle = scene==='puddle';
  const bell = scene==='reveal' && frame>=timing.bellCut;
  const hookMove = ease(frame,timing.hookCameraStarts,timing.hookCameraSettles);
  const clueMove = ease(frame,timing.guardCameraStarts,timing.guardCameraSettles);
  const drift = ease(frame,timing.revealDriftStarts,timing.plateReleases);
  const closeMove = ease(frame,timing.revealPushStarts,timing.revealPushSettles);
  const bellMove = ease(frame,timing.bellCut,timing.revealFrames-5);
  const angle: Angle = cameraOverride ?? (hook ? {
    eye:point([-1.44,1.90,3.78],[-1.03,1.77,3.21],hookMove),
    target:point([-.57,1.39,-.03],[-.40,1.19,0],hookMove),fov:mix(36,33,hookMove),
  } : puddle ? {
    eye:point([.81,2.02,3.68],[1.26,2.48,2.64],clueMove),
    target:point([.03,1.35,-.10],[.37,.884,.28],clueMove),fov:mix(36,32,clueMove),
  } : bell ? {
    eye:point([1.81,1.66,2.66],[1.69,1.62,2.45],bellMove),
    target:point([1.18,1.09,-.03],[1.19,1.10,-.04],bellMove),fov:31,
  } : {
    eye:[.43-.20*drift+.02*closeMove,1.78-.16*drift-.12*closeMove,5.03-.61*drift-1.31*closeMove],
    target:[-.09+.12*drift+.35*closeMove,1.37-.08*drift-.18*closeMove,.015*closeMove],
    fov:38-4*drift,
  });
  const daylight=!!revised && scene==='setup';
  const cold = coldOverride ?? (puddle || scene==='entrance' ? 1 : scene==='reveal' ? ease(frame,183,210) : 0);
  return <AbsoluteFill style={{opacity:alpha}}>
    <ThreeCanvas width={1080} height={1920} shadows camera={{near:.06,far:45}}>
      <Camera angle={angle}/>
      <WorldInk focus={angle.target} revised={revised}/>
      <hemisphereLight args={[tint('#fff1da','#c1d6ff',cold),tint('#785557','#50648d',cold),revised?1.66:mix(1.2,1.05,cold)]}/>
      <directionalLight position={daylight?[-3.8,6,2.7]:[-2.7,4.8,2.7]}
        color={daylight?'#fff4de':tint('#ffcf91','#bde5ff',cold)} intensity={revised?mix(2.65,2.3,cold):mix(1.92,1.47,cold)}
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-4}
        shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-normalBias={.023}/>
      <pointLight position={[2.18,2.7,1.3]} color={tint('#fff1c2','#92a9ff',cold)} intensity={mix(8,5,cold)}/>
      {puddle && <pointLight position={[-.30,2.35,-.38]} color="#d2e9ff" intensity={2.7}/>}
      <Shop cold={cold} revised={revised} daylight={daylight} frame={exteriorFrame}
        door={scene==='entrance'?ease(frame,story.entranceRing-5,story.entranceRing+13):scene==='puddle'?1:0}/>
      <Display frame={frame} scene={scene} revised={revised}/>
    </ThreeCanvas>
  </AbsoluteFill>;
}

function Hook() {
  return <View frame={useCurrentFrame()} scene="hook"/>;
}

function Reveal() {
  const frame=useCurrentFrame();
  const alpha=THREE.MathUtils.clamp((frame-timing.blendStart+1)/timing.blendFrames,0,1);
  return <AbsoluteFill style={{backgroundColor:'#232b41'}}>
    {alpha<1 && <View key="clue" frame={frame} scene="puddle"/>}
    {alpha>0 && <View key="reveal" frame={frame} scene="reveal" alpha={alpha}/>}
  </AbsoluteFill>;
}

function dolly(from: Angle, to: Angle, progress: number): Angle {
  return {eye:point(from.eye,to.eye,progress),target:point(from.target,to.target,progress),fov:mix(from.fov,to.fov,progress)};
}

function mapFrame(frame: number, keys: [number,number][]) {
  for (let index=1;index<keys.length;index++) {
    const [end,value]=keys[index];
    if (frame<=end) {
      const [start,previous]=keys[index-1];
      return mix(previous,value,THREE.MathUtils.clamp((frame-start)/(end-start),0,1));
    }
  }
  return keys[keys.length-1][1];
}

function FullShot({shot,frame,alpha}: {shot: number; frame: number; alpha?: number}) {
  if (shot===0) {
    const local=mapFrame(frame,[[0,0],[50,50],[story.setup-1,68]]);
    const hookMove=ease(local,timing.hookCameraStarts,timing.hookCameraSettles);
    const follow=dolly(
      {eye:[-1.44,1.90,3.78],target:[-.57,1.39,-.03],fov:36},
      {eye:[-1.03,1.77,3.21],target:[-.40,1.19,0],fov:33},
      hookMove,
    );
    const angle=dolly(follow,{eye:[-.51,1.86,3.34],target:[.23,1.20,0],fov:34},ease(frame,story.setup-23,story.setup));
    return <View scene="hook" frame={local} cameraOverride={angle} alpha={alpha}/>;
  }
  if (shot===1) {
    const angle=dolly(
      {eye:[-.94,2.06,4.87],target:[-.18,1.33,-.18],fov:42},
      {eye:[.18,1.88,4.58],target:[.28,1.21,-.03],fov:48},
      ease(frame,story.demoLift-11,story.demoLift+18),
    );
    return <View scene="setup" frame={frame} cameraOverride={angle} coldOverride={.12} alpha={alpha}/>;
  }
  if (shot===2) {
    const angle=dolly(
      {eye:[3.55,2.26,5.12],target:[1.04,1.32,-1.16],fov:48},
      {eye:[1.53,2.15,4.42],target:[.22,1.35,-.63],fov:43},
      ease(frame,story.entranceRing+1,story.guardClose-5),
    );
    return <View scene="entrance" frame={frame} cameraOverride={angle} alpha={alpha}/>;
  }
  if (shot===3) {
    const local=mapFrame(frame,[
      [story.guardClose,0],[story.guardClose+18,18],[story.guardPlate,21],
      [story.guardPlate+10,28],[story.guardPuddle,29],[story.guardPuddle+29,58],[story.flashback+8,64],
    ]);
    return <View scene="puddle" frame={local} alpha={alpha}/>;
  }
  if (shot===4) {
    const local=mapFrame(frame,[[story.flashback,68],[story.iceContact,110],[story.escape,135],[story.escape+8,138]]);
    const angle=dolly(
      {eye:[1.45,2.10,4.20],target:[-.02,1.34,-.06],fov:43},
      {eye:[1.34,1.88,3.21],target:[.20,1.27,-.02],fov:36},
      ease(frame,story.iceContact-28,story.iceContact-5),
    );
    return <View scene="reveal" frame={local} cameraOverride={angle} alpha={alpha}/>;
  }
  if (shot===5) {
    const local=mapFrame(frame,[[story.escape,139],[story.diamondLift,153],[story.thiefLeaves,181],[story.melt,193],[story.melt+7,197]]);
    const angle=dolly(
      {eye:[-.77,1.98,4.62],target:[-.16,1.40,-.24],fov:42},
      {eye:[-1.26,2.05,4.34],target:[-.47,1.46,-.26],fov:39},
      ease(frame,story.thiefLeaves-26,story.thiefLeaves-3),
    );
    return <View scene="reveal" frame={local} cameraOverride={angle} alpha={alpha}/>;
  }
  const local=mapFrame(frame,[
    [story.melt,193],[story.finalDrip,219],[story.plateRelease,227],[story.bellHit,232],
    [story.bellClose,236],[story.frames-1,301],
  ]);
  if (shot===7) return <View scene="reveal" frame={local} alpha={alpha}/>;
  const angle=dolly(
    {eye:[.55,2.10,4.05],target:[.26,1.18,.04],fov:43},
    {eye:[.53,1.84,4.08],target:[.36,1.12,.06],fov:49},
    ease(frame,story.melt+4,story.melt+27),
  );
  return <View scene="reveal" frame={local} cameraOverride={angle} alpha={alpha}/>;
}

const SHOT_STARTS=[0,story.setup,story.entrance,story.guardClose,story.flashback,story.escape,story.melt,story.bellClose];
const BLENDS=[0,7,7,6,9,6,7,0];
export const ACTION_STARTS=[0,story.setup,story.demoLift,story.entrance,story.guardClose,story.flashback,story.escape,story.melt,story.bellClose];
const ACTION_BLENDS=[0,7,5,5,0,9,6,6,0];
const ARRIVAL_END: Angle={eye:[2.23,2.02,3.94],target:[1.20,1.29,-1.13],fov:44};

function FinishedEdit({frame, revised=false}: {frame: number; revised?: boolean}) {
  const starts=revised?ACTION_STARTS:SHOT_STARTS;
  const shot=starts.findLastIndex(start=>frame>=start);
  const blend=(revised?ACTION_BLENDS:BLENDS)[shot];
  const opacity=blend ? Math.min(1,(frame-starts[shot]+1)/blend) : 1;
  const Shot=revised?RevisedShot:FullShot;
  const caption=story.captions.find(([start,end])=>frame>=Number(start) && frame<Number(end));
  return <AbsoluteFill style={{backgroundColor:'#29223a'}}>
    {opacity<1 && <Shot key={shot-1} shot={shot-1} frame={frame}/>}
    <Shot key={shot} shot={shot} frame={frame} alpha={opacity}/>
    {caption && <div style={{
      position:'absolute',top:'69%',width:'100%',textAlign:'center',color:'#fff',
      fontFamily:'Arial, sans-serif',fontWeight:900,fontSize:86,
      WebkitTextStroke:'9px #17141b',paintOrder:'stroke fill',
      transform:`scale(${mix(.94,1,ease(frame,Number(caption[0]),Number(caption[0])+3))})`,
    }}>{caption[2]}</div>}
  </AbsoluteFill>;
}

function RevisedShot({shot,frame,alpha}: {shot: number; frame: number; alpha?: number}) {
  if (shot===0) {
    const local=mapFrame(frame,[[0,0],[50,50],[story.setup-1,68]]);
    const follow=dolly(
      {eye:[-2.12,1.72,3.83],target:[-.86,1.34,-.04],fov:39},
      {eye:[-1.25,1.76,2.65],target:[-.70,1.30,-.03],fov:37},
      ease(frame,5,44),
    );
    const ice=dolly(follow,
      {eye:[.27,1.80,3.03],target:[.43,1.21,-.01],fov:32},
      ease(frame,46,87),
    );
    return <View revised scene="hook" frame={local} cameraOverride={ice} alpha={alpha}/>;
  }
  if (shot===1) {
    const angle=dolly(
      {eye:[-1.75,2.03,4.28],target:[-.69,1.40,-.42],fov:43},
      {eye:[-.58,1.78,3.58],target:[-.55,1.28,-.03],fov:37},
      ease(frame,story.setup+3,story.setup+60),
    );
    return <View revised scene="setup" frame={frame} cameraOverride={angle} coldOverride={.09} alpha={alpha}/>;
  }
  if (shot===2) {
    const angle=dolly(
      {eye:[-.15,1.52,2.61],target:[-.36,1.14,.02],fov:37},
      {eye:[.75,1.63,4.09],target:[.40,1.08,.01],fov:49},
      ease(frame,story.demoLift+9,story.demoRing+7),
    );
    return <View revised scene="setup" frame={frame} cameraOverride={angle} coldOverride={.09} alpha={alpha}/>;
  }
  if (shot===3) {
    const entry=dolly(
      {eye:[4.43,2.02,3.90],target:[3.40,1.29,-1.42],fov:40},
      {eye:[4.10,1.86,2.20],target:[3.44,1.26,-2.13],fov:38},
      ease(frame,story.entrance,story.entranceRing+4),
    );
    const angle=dolly(
      entry,ARRIVAL_END,
      ease(frame,story.entranceRing+5,story.guardClose-1),
    );
    return <View revised scene="entrance" frame={frame} cameraOverride={angle} alpha={alpha}/>;
  }
  if (shot===4) {
    const local=mapFrame(frame,[
      [story.guardClose,0],[story.guardClose+17,17],[story.guardPlate,21],
      [story.guardPlate+13,28],[story.guardPuddle,29],[story.guardPuddle+29,58],[story.flashback+8,64],
    ]);
    const reaction=dolly(
      ARRIVAL_END,
      {eye:[.88,1.83,3.01],target:[.28,1.44,-.69],fov:33},
      ease(frame,story.guardClose,story.guardPlate+4),
    );
    const partner=dolly(reaction,
      {eye:[.35,1.94,3.15],target:[-.10,1.40,-.65],fov:36},
      ease(frame,story.guardPlate+7,story.guardPuddle-3),
    );
    const clue=dolly(partner,
      {eye:[1.29,2.39,2.48],target:[.39,.83,.28],fov:30},
      ease(frame,story.guardPuddle+1,story.guardPuddle+28),
    );
    return <View revised scene="puddle" frame={local} cameraOverride={clue} alpha={alpha}/>;
  }
  if (shot===5) {
    const local=mapFrame(frame,[[story.flashback,68],[story.iceContact,110],[story.escape,135],[story.escape+8,138]]);
    const insert=dolly(
      {eye:[-1.69,2.12,3.23],target:[-1.40,1.27,.23],fov:39},
      {eye:[.99,1.63,2.62],target:[.36,1.26,.02],fov:35},
      ease(frame,story.flashback+28,story.iceContact-1),
    );
    const angle=dolly(insert,
      {eye:[.42,1.69,2.78],target:[.10,1.30,.02],fov:35},
      ease(frame,story.iceContact+4,story.escape-1),
    );
    return <View revised scene="reveal" frame={local} cameraOverride={angle} alpha={alpha}/>;
  }
  if (shot===6) {
    const local=mapFrame(frame,[[story.escape,139],[story.diamondLift,153],[story.thiefLeaves,181],[story.melt,193],[story.melt+7,197]]);
    const angle=dolly(
      {eye:[-.53,1.78,3.73],target:[-.14,1.32,-.15],fov:42},
      {eye:[-1.83,1.78,3.73],target:[-1.44,1.32,-.15],fov:42},
      ease(frame,story.diamondLift+2,story.melt-1),
    );
    return <View revised scene="reveal" frame={local} cameraOverride={angle} alpha={alpha}/>;
  }
  const local=mapFrame(frame,[
    [story.melt,193],[story.finalDrip,219],[story.plateRelease,227],[story.bellHit,232],
    [story.bellClose,236],[story.frames-1,301],
  ]);
  if (shot===8) {
    const payoff=dolly(
      {eye:[1.56,1.82,3.31],target:[1.12,1.10,-.05],fov:39},
      {eye:[1.38,1.51,1.94],target:[1.16,1.10,-.05],fov:35},
      ease(frame,story.bellClose,story.frames-3),
    );
    return <View revised scene="reveal" frame={local} cameraOverride={payoff} alpha={alpha}/>;
  }
  const reveal=dolly(
    {eye:[.83,1.68,2.43],target:[.43,1.12,.07],fov:36},
    {eye:[1.16,1.76,4.35],target:[.36,1.10,.02],fov:49},
    ease(frame,story.melt+3,story.plateRelease-2),
  );
  return <View revised scene="reveal" frame={local} cameraOverride={reveal} alpha={alpha}/>;
}

function Full() {
  return <FinishedEdit frame={useCurrentFrame()}/>;
}

function ActionCut() {
  return <FinishedEdit frame={useCurrentFrame()} revised/>;
}

function RevisionHook() {
  return <FinishedEdit frame={useCurrentFrame()} revised/>;
}

function RevisionPayoff() {
  return <FinishedEdit frame={story.melt+useCurrentFrame()} revised/>;
}

registerRoot(() => <>
  <Composition id="Hook" component={Hook} width={1080} height={1920} fps={timing.fps} durationInFrames={timing.hookFrames}/>
  <Composition id="Reveal" component={Reveal} width={1080} height={1920} fps={timing.fps} durationInFrames={timing.revealFrames}/>
  <Composition id="Full" component={Full} width={1080} height={1920} fps={timing.fps} durationInFrames={story.frames}/>
  <Composition id="ActionCut" component={ActionCut} width={1080} height={1920} fps={timing.fps} durationInFrames={story.frames}/>
  <Composition id="RevisionHook" component={RevisionHook} width={1080} height={1920} fps={timing.fps} durationInFrames={story.setup-2}/>
  <Composition id="RevisionPayoff" component={RevisionPayoff} width={1080} height={1920} fps={timing.fps} durationInFrames={story.frames-story.melt}/>
</>);
