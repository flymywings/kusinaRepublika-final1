import React, { useRef } from 'react';
import * as THREE from 'three';
import { LightingState } from './story';

export function Lighting({ lighting }: { lighting: LightingState }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Ambient Base Light */}
      <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />

      {/* Main Directional Sun Light */}
      <directionalLight
        ref={dirLightRef}
        position={lighting.sunPos}
        color={lighting.sunColor}
        intensity={lighting.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />

      {/* Subtle Blue/Cyan Fill to mimic window sky reflections */}
      <directionalLight position={[-6, 4, 2]} color="#93c5fd" intensity={0.3} />
    </>
  );
}
