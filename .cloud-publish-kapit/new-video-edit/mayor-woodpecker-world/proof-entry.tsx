import React from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {NOINK} from '../upstream/templates/bridge/ink';
import {World, Pouch, BirdSketch, Chip, Chain, Nest} from './World';

function Stage() {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  const views = [
    {position: [-3.7, 2.52, 3.96], look: [-3.18, 1.21, 2.12], fov: 43},
    {position: [4.4, 3.82, 9.7], look: [.6, 1.65, -.82], fov: 45},
    {position: [1.2, 3.74, 2.60], look: [.29, 3.45, .13], fov: 38},
    {position: [0, 1.78, 2.11], look: [0, 1.03, .98], fov: 37},
    {position: [.7, 3.85, 3.2], look: [.12, 3.47, .1], fov: 43},
  ];
  const view = views[frame];
  camera.position.set(view.position[0], view.position[1], view.position[2]);
  camera.lookAt(view.look[0], view.look[1], view.look[2]);
  if ('fov' in camera) { camera.fov = view.fov; camera.updateProjectionMatrix(); }
  camera.layers.enable(NOINK);
  const late = frame === 4 ? 1 : 0;
  return <>
    <color attach="background" args={[late ? '#ebae91' : '#a9c9da']}/>
    <fog attach="fog" args={[late ? '#d8b09f' : '#abc0d2', 13, 58]}/>
    <hemisphereLight args={['#e9eef6', '#b4a49a', 1.2]}/>
    <directionalLight color="#ffe0ad" position={[-6, 10, 5]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-13} shadow-camera-right={13} shadow-camera-top={13} shadow-camera-bottom={-13} shadow-normalBias={.02}/>
    <World frame={frame} sunset={late} chipMissing={frame >= 2}/>
    <Pouch position={[-3.42, 1.02, 2.17]} yaw={.2}/><BirdSketch position={[-2.82, 1.02, 2.17]} yaw={-.16}/>
    <Chip position={[0, 1.05, 1.0]} rotation={[Math.PI, 0, 0]}/>
    <Chain position={[.33, 1.23, .57]}/>{late > 0 && <Nest position={[0, 3.89, 0]}/>}
  </>;
}

function Proof() {
  return <ThreeCanvas width={1080} height={1920} shadows camera={{near: .08, far: 90}}><Stage/></ThreeCanvas>;
}

registerRoot(() => <Composition id="MayorWorldProof" component={Proof} durationInFrames={5} fps={30} width={1080} height={1920}/>);
