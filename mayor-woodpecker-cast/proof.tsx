import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Person, Woodpecker} from './Cast';
import {NOINK} from '../bridge-recreation/ink';

function TestStage() {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  camera.position.set(0, 2.55, 8.9);
  camera.lookAt(0, 1.15, 0);
  camera.layers.enable(NOINK);
  return <>
    <color attach="background" args={['#e4caba']}/>
    <hemisphereLight args={['#f4e7cf','#8e869f',1.4]}/>
    <directionalLight color="#ffe6be" intensity={2} position={[-4,6,5]}/>
    <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[80,80]}/><meshStandardMaterial color="#bfa68c"/></mesh>
    {frame < 30 ? <>
      <Person role="mayor" position={[-1.35,0,-.8]} yaw={frame/32} expression={frame < 15 ? 'proud' : 'worried'} hand={[-.87,1.13,-.47]} chain={frame < 24} frame={frame}/>
      <mesh position={[-.87,1.13,-.47]}><sphereGeometry args={[.074,14,10]}/><meshStandardMaterial color="#d49545"/></mesh>
      <Person role="guard" position={[0,0,-.8]} yaw={1.55} expression="alert" step={frame*.4} stride={.75} frame={frame}/>
      <Person role="carpenter" position={[1.28,0,-.8]} yaw={2.62} expression="focused" frame={frame}
        crouch={Math.min(1, frame / 22)} tilt={-.23 * Math.min(1, frame / 22)}
        hand={[1.08,.90 - .85 * Math.min(1, frame / 22),-.66]}/>
    </> : <>
      <Person role="baker" position={[-1.15,0,-.8]} yaw={.4} expression="amused" frame={frame}/>
      <Person role="villager" position={[.97,0,-.8]} yaw={-.44} expression="neutral" frame={frame} variant={1}/>
    </>}
    <mesh position={[.10,.31,1.55]}><cylinderGeometry args={[.31,.35,.62,14]}/><meshStandardMaterial color="#9e745f"/></mesh>
    <Woodpecker position={[.10,.62,1.55]} yaw={1.33} wing={Math.sin(frame*.16)**6*.7} peck={frame > 16 ? 1 : 0}/>
  </>;
}

function Proof() {
  return <ThreeCanvas width={1080} height={1920} camera={{fov:43,near:.03,far:120}}><TestStage/></ThreeCanvas>;
}

registerRoot(()=><Composition id="CastProof" component={Proof} durationInFrames={60} fps={30} width={1080} height={1920}/>);
