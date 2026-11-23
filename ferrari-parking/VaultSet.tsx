import React, { useMemo } from 'react';
import * as THREE from 'three';

export function VaultSet({ liftY = 0 }: { liftY?: number }) {
  const steelWall = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1e293b', // Dark industrial steel
      roughness: 0.5,
      metalness: 0.6,
    });
  }, []);

  const concreteFloor = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  const yellowHazard = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#eab308', // Caution yellow
      roughness: 0.4,
      metalness: 0.2,
    });
  }, []);

  const blackStripe = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#09090b',
      roughness: 0.5,
      metalness: 0.1,
    });
  }, []);

  const goldBar = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#fbbf24', // Pure gold bullion
      roughness: 0.18,
      metalness: 0.92,
    });
  }, []);

  const vaultDoorSteel = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.35,
      metalness: 0.75,
    });
  }, []);

  return (
    <group position={[0, -6.5, 0]}>
      {/* Vault Subterranean Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={concreteFloor} receiveShadow>
        <planeGeometry args={[20, 24]} />
      </mesh>

      {/* Vault Perimeter Steel Walls */}
      <mesh position={[0, 4.5, -8]} material={steelWall} receiveShadow>
        <planeGeometry args={[20, 9]} />
      </mesh>
      <mesh position={[-9.5, 4.5, 0]} rotation={[0, Math.PI / 2, 0]} material={steelWall}>
        <planeGeometry args={[20, 9]} />
      </mesh>
      <mesh position={[9.5, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} material={steelWall}>
        <planeGeometry args={[20, 9]} />
      </mesh>

      {/* Hydraulic Car Lift Platform (y moves with liftY) */}
      <group position={[0, liftY, 0]}>
        {/* Metal Checkerplate Deck */}
        <mesh position={[0, 0.1, 0]} material={steelWall} receiveShadow>
          <boxGeometry args={[3.2, 0.2, 5.8]} />
        </mesh>
        {/* Yellow & Black Hazard Stripes on Border */}
        {[-1.6, 1.6].map((hx, i) => (
          <mesh key={i} position={[hx, 0.12, 0]} material={yellowHazard}>
            <boxGeometry args={[0.15, 0.22, 5.8]} />
          </mesh>
        ))}
        {[-2.9, 2.9].map((hz, i) => (
          <mesh key={i} position={[0, 0.12, hz]} material={blackStripe}>
            <boxGeometry args={[3.2, 0.22, 0.15]} />
          </mesh>
        ))}
      </group>

      {/* Massive Circular Bank Vault Door on Back Wall */}
      <group position={[0, 3.5, -7.9]}>
        {/* Outer Circular Steel Bezel */}
        <mesh material={vaultDoorSteel}>
          <cylinderGeometry args={[2.5, 2.5, 0.35, 32]} />
        </mesh>
        {/* Door Locking Spokes / Wheel */}
        <mesh position={[0, 0, 0.25]} material={vaultDoorSteel}>
          <torusGeometry args={[0.9, 0.12, 16, 32]} />
        </mesh>
        {/* Locking Bolt Spokes */}
        {[0, 45, 90, 135].map((deg, i) => (
          <mesh key={i} rotation={[0, 0, (deg * Math.PI) / 180]} position={[0, 0, 0.25]} material={vaultDoorSteel}>
            <boxGeometry args={[2.2, 0.15, 0.15]} />
          </mesh>
        ))}
      </group>

      {/* Vault Shelves with Gold Bullion Bars on Left & Right */}
      {[-6.5, 6.5].map((sx, sideIdx) => (
        <group key={sideIdx} position={[sx, 0, 0]}>
          {/* Steel Shelving Racks */}
          <mesh position={[0, 2.2, 0]} material={steelWall}>
            <boxGeometry args={[2.2, 4.4, 6.0]} />
          </mesh>
          {/* Stacks of Gold Bars */}
          {[1.0, 2.2, 3.4].map((tierY, tIdx) => (
            <group key={tIdx} position={[sideIdx === 0 ? 0.8 : -0.8, tierY, 0]}>
              {[-1.5, -0.5, 0.5, 1.5].map((bz, bIdx) => (
                <mesh key={bIdx} position={[0, 0, bz]} material={goldBar} castShadow>
                  <boxGeometry args={[0.8, 0.3, 0.6]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
