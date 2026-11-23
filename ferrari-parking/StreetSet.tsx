import React, { useMemo } from 'react';
import * as THREE from 'three';

export function StreetSet() {
  const asphalt = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.9,
      metalness: 0.05,
    });
  }, []);

  const sidewalk = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.7,
      metalness: 0.05,
    });
  }, []);

  const roadLine = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#facc15' }); // Yellow center lane
  }, []);

  const buildingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.3,
      metalness: 0.7,
    });
  }, []);

  const windowGold = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#fef08a' }); // Sunset reflecting windows
  }, []);

  return (
    <group position={[0, 0, -40]}>
      {/* Asphalt Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={asphalt} receiveShadow>
        <planeGeometry args={[12, 60]} />
      </mesh>

      {/* Yellow Center Dashes */}
      {[-20, -10, 0, 10, 20].map((dz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, dz]} material={roadLine}>
          <planeGeometry args={[0.3, 4.5]} />
        </mesh>
      ))}

      {/* Left & Right Sidewalks */}
      {[-7.5, 7.5].map((sx, i) => (
        <mesh key={i} position={[sx, 0.1, 0]} material={sidewalk} receiveShadow>
          <boxGeometry args={[3.0, 0.2, 60]} />
        </mesh>
      ))}

      {/* Skyscraper Facades Flanking Avenue */}
      {[-14, 14].map((bx, sideIdx) => (
        <group key={sideIdx} position={[bx, 0, 0]}>
          {[-18, 0, 18].map((bz, bIdx) => (
            <group key={bIdx} position={[0, 0, bz]}>
              <mesh position={[0, 15, 0]} material={buildingMaterial} castShadow>
                <boxGeometry args={[10, 30, 14]} />
              </mesh>
              {/* Reflective Window Grids */}
              {[6, 12, 18, 24].map((wy, wIdx) => (
                <mesh key={wIdx} position={[sideIdx === 0 ? 5.05 : -5.05, wy, 0]} material={windowGold}>
                  <boxGeometry args={[0.1, 1.8, 11]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
