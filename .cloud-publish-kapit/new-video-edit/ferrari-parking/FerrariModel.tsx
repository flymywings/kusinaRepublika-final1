import React, { useMemo } from 'react';
import * as THREE from 'three';
import { NOINK } from '../upstream/templates/bridge/ink';

export interface CarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function FerrariModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CarProps) {
  // Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#dc2626', // Rosso Corsa Red
      roughness: 0.25,
      metalness: 0.35,
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#09090b',
      roughness: 0.1,
      metalness: 0.85,
    });
  }, []);

  const trimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#18181b', // Matte dark carbon
      roughness: 0.7,
      metalness: 0.2,
    });
  }, []);

  const wheelMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e2e8f0', // Silver 5-spoke
      roughness: 0.3,
      metalness: 0.7,
    });
  }, []);

  const lightMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#fef08a' }); // Headlight LED
  }, []);

  const tailMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#ef4444' }); // Tail lights
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Contact Shadow on ground */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 4.4]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Main Lower Chassis / Underbody */}
      <mesh position={[0, 0.25, 0]} material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.28, 4.0]} />
      </mesh>

      {/* Aerodynamic Tapered Hood */}
      <mesh position={[0, 0.38, 0.95]} rotation={[-0.12, 0, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[1.7, 0.2, 1.8]} />
      </mesh>

      {/* Front Nose Cone & Splitter */}
      <mesh position={[0, 0.22, 2.05]} material={trimMaterial} castShadow>
        <boxGeometry args={[1.72, 0.12, 0.4]} />
      </mesh>

      {/* Cockpit / Cabin Roof */}
      <mesh position={[0, 0.65, -0.3]} material={glassMaterial} castShadow>
        <boxGeometry args={[1.35, 0.45, 1.7]} />
      </mesh>

      {/* Rear Engine Deck & Diffuser */}
      <mesh position={[0, 0.45, -1.25]} rotation={[0.08, 0, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[1.72, 0.28, 1.7]} />
      </mesh>

      {/* Rear Wing / Spoiler */}
      <mesh position={[0, 0.72, -1.95]} material={bodyMaterial} castShadow>
        <boxGeometry args={[1.65, 0.06, 0.35]} />
      </mesh>
      {/* Spoiler Struts */}
      <mesh position={[-0.55, 0.58, -1.9]} material={trimMaterial}>
        <boxGeometry args={[0.08, 0.25, 0.15]} />
      </mesh>
      <mesh position={[0.55, 0.58, -1.9]} material={trimMaterial}>
        <boxGeometry args={[0.08, 0.25, 0.15]} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.62, 0.42, 1.82]} rotation={[-0.15, -0.2, 0]} material={lightMaterial}>
        <boxGeometry args={[0.32, 0.08, 0.4]} />
      </mesh>
      <mesh position={[0.62, 0.42, 1.82]} rotation={[-0.15, 0.2, 0]} material={lightMaterial}>
        <boxGeometry args={[0.32, 0.08, 0.4]} />
      </mesh>

      {/* Twin Tail Lights */}
      <mesh position={[-0.58, 0.44, -2.01]} material={tailMaterial}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
      </mesh>
      <mesh position={[0.58, 0.44, -2.01]} material={tailMaterial}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
      </mesh>

      {/* 4 Wheels (Front-Left, Front-Right, Rear-Left, Rear-Right) */}
      {[
        [-0.88, 0.28, 1.25], // FL
        [0.88, 0.28, 1.25],  // FR
        [-0.88, 0.30, -1.2], // RL
        [0.88, 0.30, -1.2],  // RR
      ].map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]}>
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={wheelMaterial} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.25, 24]} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={rimMaterial}>
            <cylinderGeometry args={[0.2, 0.2, 0.26, 12]} />
          </mesh>
          {/* Yellow Hub Center */}
          <mesh position={[wx > 0 ? 0.14 : -0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
