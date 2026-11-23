import React, { useMemo } from 'react';
import * as THREE from 'three';

export function BankSet() {
  // Materials
  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f1f5f9', // Polished marble
      roughness: 0.2,
      metalness: 0.1,
    });
  }, []);

  const columnMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e2e8f0', // Neoclassical stone
      roughness: 0.6,
      metalness: 0.05,
    });
  }, []);

  const counterWood = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#451a03', // Rich mahogany
      roughness: 0.4,
      metalness: 0.1,
    });
  }, []);

  const marbleTop = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cbd5e1', // Cool grey marble
      roughness: 0.2,
      metalness: 0.15,
    });
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#d97706', // Warm brass
      roughness: 0.3,
      metalness: 0.8,
    });
  }, []);

  const windowGlass = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#fed7aa', // Morning sun glow through window
      transparent: true,
      opacity: 0.35,
    });
  }, []);

  return (
    <group>
      {/* Lobby Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMaterial} receiveShadow>
        <planeGeometry args={[24, 28]} />
      </mesh>

      {/* Back Wall with Grand Arched Windows */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Arched Window Glow Panes */}
      {[-4.5, 0, 4.5].map((wx, i) => (
        <group key={i} position={[wx, 5.2, -7.95]}>
          <mesh material={windowGlass}>
            <planeGeometry args={[3.2, 6.5]} />
          </mesh>
          {/* Window mullion grid */}
          <mesh position={[0, 0, 0.02]} material={columnMaterial}>
            <boxGeometry args={[0.08, 6.5, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.02]} material={columnMaterial}>
            <boxGeometry args={[3.2, 0.08, 0.04]} />
          </mesh>
        </group>
      ))}

      {/* 4 Grand Columns flanking lobby */}
      {[
        [-4.5, 2],
        [-4.5, -4],
        [4.5, 2],
        [4.5, -4],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          {/* Column Plinth Base */}
          <mesh position={[0, 0.35, 0]} material={columnMaterial} castShadow>
            <boxGeometry args={[1.2, 0.7, 1.2]} />
          </mesh>
          {/* Main Column Shaft */}
          <mesh position={[0, 4.5, 0]} material={columnMaterial} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.5, 8.0, 24]} />
          </mesh>
          {/* Capital Top */}
          <mesh position={[0, 8.7, 0]} material={columnMaterial}>
            <boxGeometry args={[1.2, 0.6, 1.2]} />
          </mesh>
        </group>
      ))}

      {/* Teller Counter (Billionaire stands on +Z side, Banker stands on -Z side) */}
      <group position={[0, 0, 1.8]}>
        {/* Mahogany Lower Base */}
        <mesh position={[0, 0.5, 0]} material={counterWood} castShadow receiveShadow>
          <boxGeometry args={[5.2, 1.0, 1.1]} />
        </mesh>
        {/* Polished Marble Transaction Slab (y = 1.05m) */}
        <mesh position={[0, 1.05, 0]} material={marbleTop} castShadow receiveShadow>
          <boxGeometry args={[5.5, 0.1, 1.3]} />
        </mesh>
        {/* Brass Security Grille / Divider */}
        <mesh position={[0, 1.35, 0]} material={brassMaterial}>
          <boxGeometry args={[5.0, 0.5, 0.06]} />
        </mesh>
        {/* Brass Transaction Window Arch cutout */}
        <mesh position={[0, 1.3, 0.05]} material={brassMaterial}>
          <boxGeometry args={[1.2, 0.4, 0.08]} />
        </mesh>
      </group>
    </group>
  );
}
