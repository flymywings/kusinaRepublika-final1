import React, { useMemo } from 'react';
import * as THREE from 'three';
import { twoTone } from '../upstream/templates/bridge/shade';

import { NOINK } from '../bridge-recreation/ink';

// deterministic little prng for painted textures
const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function painted(w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!, mulberry(7));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
const glow = (r: number, g: number, b: number) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// ---------------------------------------------------------------- marble

function useMarble() {
  return useMemo(
    () =>
      painted(512, 512, (g, r) => {
        g.fillStyle = '#efe8db';
        g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 256; i++) {
          g.fillStyle = `rgba(${200 + r() * 30},${190 + r() * 25},${172 + r() * 22},0.10)`;
          g.fillRect(r() * 512, r() * 512, 24 + r() * 80, 10 + r() * 40);
        }
        g.strokeStyle = 'rgba(150,138,118,0.30)';
        for (let i = 0; i < 7; i++) {
          g.beginPath();
          let x = r() * 512;
          let y = 0;
          g.lineWidth = 0.8 + r() * 1.6;
          g.moveTo(x, y);
          while (y < 512) {
            x += (r() - 0.5) * 46;
            y += 18 + r() * 30;
            g.lineTo(x, y);
          }
          g.stroke();
        }
      }),
    []
  );
}

// ---------------------------------------------------------------- lobby
export function Lobby() {
  const marble = useMarble();
  marble.repeat.set(6, 6);

  const floorMat = useMemo(() => lam({ map: marble, color: '#f4eee2' }), [marble]);
  const wallMat = useMemo(() => lam({ color: '#e9dfcc' }), []);
  const wainscot = useMemo(() => lam({ color: '#cfc0a1' }), []);
  const stone = useMemo(() => lam({ color: '#ded3bd' }), []);
  const wood = useMemo(() => lam({ color: '#5b2f1b' }), []);
  const woodDark = useMemo(() => lam({ color: '#40200f' }), []);
  const brass = useMemo(() => lam({ color: '#c99a3f' }), []);
  const pane = useMemo(() => glow(1.9, 1.35, 0.78), []);
  const lamp = useMemo(() => glow(2.4, 1.75, 0.9), []);
  const sconce = useMemo(() => glow(2.6, 1.85, 0.95), []);
  const clockFace = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.45, 1.36, 1.16), toneMapped: false }),
    []
  );
  const inkMat = useMemo(() => lam({ color: '#141118' }), []);

  const columns: [number, number][] = [
    [-4.9, 3.2],
    [4.9, 3.2],
    [-4.9, -4.2],
    [4.9, -4.2],
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[34, 34]} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, 6.4, -9.5]} material={wallMat} receiveShadow>
        <planeGeometry args={[28, 13]} />
      </mesh>
      <mesh position={[0, 1.1, -9.46]} material={wainscot}>
        <planeGeometry args={[28, 2.2]} />
      </mesh>

      {/* arched windows + warm light */}
      {[-5.4, 0, 5.4].map((x, i) => (
        <group key={i} position={[x, 6.0, -9.42]}>
          <mesh material={pane} onUpdate={(m) => m.layers.set(NOINK)}>
            <planeGeometry args={[3.5, 5.2]} />
          </mesh>
          <mesh position={[0, 2.6, 0]} material={pane} onUpdate={(m) => m.layers.set(NOINK)}>
            <circleGeometry args={[1.75, 32, 0, Math.PI]} />
          </mesh>
          <mesh position={[0, 0, 0.03]} material={stone}>
            <boxGeometry args={[0.1, 5.2, 0.06]} />
          </mesh>
          <mesh position={[0, -1.3, 0.03]} material={stone}>
            <boxGeometry args={[3.5, 0.1, 0.06]} />
          </mesh>
          <mesh position={[0, 1.1, 0.03]} material={stone}>
            <boxGeometry args={[3.5, 0.1, 0.06]} />
          </mesh>
        </group>
      ))}

      {/* columns */}
      {columns.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.34, 0]} material={stone} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.68, 1.25]} />
          </mesh>
          <mesh position={[0, 4.6, 0]} material={stone} castShadow receiveShadow>
            <cylinderGeometry args={[0.46, 0.52, 8.6, 28]} />
          </mesh>
          <mesh position={[0, 8.95, 0]} material={stone}>
            <boxGeometry args={[1.2, 0.5, 1.2]} />
          </mesh>
        </group>
      ))}

      {/* wall clock */}
      <group position={[0.45, 3.85, -9.36]}>
        <mesh material={woodDark} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.86, 0.86, 0.12, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.07]} material={brass}>
          <torusGeometry args={[0.84, 0.055, 12, 40]} />
        </mesh>
        <mesh position={[0, 0, 0.075]} material={clockFace}>
          <circleGeometry args={[0.8, 40]} />
        </mesh>
        {Array.from({ length: 12 }, (_, k) => (
          <mesh
            key={k}
            position={[Math.sin((k * Math.PI) / 6) * 0.66, Math.cos((k * Math.PI) / 6) * 0.66, 0.09]}
            rotation={[0, 0, (-k * Math.PI) / 6]}
            material={brass}
          >
            <boxGeometry args={[0.035, k % 3 === 0 ? 0.15 : 0.09, 0.02]} />
          </mesh>
        ))}
        <group position={[0, 0, 0.11]} rotation={[0, 0, -0.55]}>
          <mesh position={[0, 0.22, 0]} material={inkMat}>
            <boxGeometry args={[0.045, 0.44, 0.02]} />
          </mesh>
        </group>
        <group position={[0, 0, 0.12]} rotation={[0, 0, 1.15]}>
          <mesh position={[0, 0.28, 0]} material={inkMat}>
            <boxGeometry args={[0.035, 0.56, 0.02]} />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.13]} material={brass}>
          <sphereGeometry args={[0.05, 12, 8]} />
        </mesh>
      </group>

      {/* gold cornice + sconces */}
      <mesh position={[0, 2.62, -9.42]} material={brass}>
        <boxGeometry args={[27, 0.09, 0.09]} />
      </mesh>
      <mesh position={[0, 2.9, -9.44]} material={wainscot}>
        <boxGeometry args={[27, 0.5, 0.06]} />
      </mesh>
      {[-3.4, 3.4].map((x, i) => (
        <group key={i} position={[x, 3.0, -9.35]}>
          <mesh material={brass}>
            <boxGeometry args={[0.1, 0.5, 0.1]} />
          </mesh>
          <mesh position={[0, -0.24, 0.1]} material={sconce} onUpdate={(m) => m.layers.set(NOINK)}>
            <sphereGeometry args={[0.16, 18, 12]} />
          </mesh>
          <mesh position={[0, 0.28, 0.05]} material={brass}>
            <coneGeometry args={[0.24, 0.2, 16, 1, true]} />
          </mesh>
        </group>
      ))}

      {/* counter */}
      <group position={[0, 0, 1.05]}>
        <mesh position={[0, 0.44, 0]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[5.8, 0.88, 1.15]} />
        </mesh>
        <mesh position={[0, 0.93, 0]} material={stone} castShadow receiveShadow>
          <boxGeometry args={[6.1, 0.1, 1.4]} />
        </mesh>
        <mesh position={[0, 0.2, 0.6]} material={woodDark}>
          <boxGeometry args={[5.8, 0.4, 0.04]} />
        </mesh>
        <mesh position={[0, 0.66, 0.585]} material={brass}>
          <boxGeometry args={[5.2, 0.05, 0.02]} />
        </mesh>
      </group>

      {/* pendant lamps */}
      {[-3.3, 3.3].map((x, i) => (
        <group key={i} position={[x, 0, 0.6]}>
          <mesh position={[0, 5.4, 0]} material={woodDark}>
            <cylinderGeometry args={[0.02, 0.02, 2.6, 8]} />
          </mesh>
          <mesh position={[0, 4.1, 0]} material={lamp} onUpdate={(m) => m.layers.set(NOINK)}>
            <sphereGeometry args={[0.16, 20, 14]} />
          </mesh>
          <mesh position={[0, 4.16, 0]} material={brass}>
            <coneGeometry args={[0.34, 0.24, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------- vault

export function Vault({ liftY, doorSpin }: { liftY: number; doorSpin: number }) {
  const steel = useMemo(() => lam({ color: '#4a5a70' }), []);
  const steelDark = useMemo(() => lam({ color: '#303d4c', side: THREE.DoubleSide }), []);
  const concrete = useMemo(() => lam({ color: '#5b6572' }), []);
  const apron = useMemo(() => lam({ color: '#3d4551' }), []);
  const hazard = useMemo(() => lam({ color: '#e0b020' }), []);
  const gold = useMemo(() => lam({ color: '#e8b93c', emissive: new THREE.Color(0.12, 0.08, 0.0) }), []);
  const pitLamp = useMemo(() => glow(0.55, 1.35, 2.1), []);
  const amber = useMemo(() => glow(2.2, 1.15, 0.35), []);

  return (
    <group>
      {/* floor around a lift shaft */}
      {[
        [0, 3.3, 6.6, 1.0],
        [0, -3.3, 6.6, 1.0],
        [4.65, 0, 2.7, 6.6],
        [-4.65, 0, 2.7, 6.6],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -0.08, z]} material={concrete} receiveShadow>
          <boxGeometry args={[w, 0.16, d]} />
        </mesh>
      ))}

      {/* back hall floor (behind the shaft, under the door and the racks) */}
      {[
        [0, -5.6, 6.6, 4.4],
        [4.65, -5.6, 2.7, 4.4],
        [-4.65, -5.6, 2.7, 4.4],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -0.08, z]} material={concrete} receiveShadow>
          <boxGeometry args={[w, 0.16, d]} />
        </mesh>
      ))}
      {/* shaft walls: the near and right walls face into the shaft, so from above we see the pit, not a grey slab */}
      {[
        [0, -3.5, -3.3, 6.6, 7, 0],
        [0, -3.5, 3.3, 6.6, 7, Math.PI],
        [-3.0, -3.5, 0, 7, 7, Math.PI / 2],
        [3.0, -3.5, 0, 7, 7, -Math.PI / 2],
      ].map(([x, y, z, w, h, ry], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, ry, 0]} material={steelDark} receiveShadow>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}

      {/* foreground apron: kept dark so the empty near floor reads as shadow, not a lit plane */}
      <mesh position={[0, -0.08, 6.7]} material={apron} receiveShadow>
        <boxGeometry args={[6.6, 0.16, 5.8]} />
      </mesh>

      {/* pit strip lights */}
      {[-1.1, -2.6, -4.2].map((y, i) => (
        <group key={i}>
          <mesh position={[-3.02, y, 0]} rotation={[0, Math.PI / 2, 0]} material={pitLamp}>
            <planeGeometry args={[5.6, 0.16]} />
          </mesh>
          <mesh position={[3.02, y, 0]} rotation={[0, -Math.PI / 2, 0]} material={pitLamp}>
            <planeGeometry args={[5.6, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* shaft floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6.94, 0]} material={steelDark}>
        <planeGeometry args={[6.2, 6.6]} />
      </mesh>

      {/* corner guide rails */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}-${sz}`} position={[sx * 2.94, -3.45, sz * 3.1]} material={steel}>
            <boxGeometry args={[0.14, 6.9, 0.14]} />
          </mesh>
        ))
      )}

      {/* hydraulic ram under the deck */}
      <mesh position={[0, (liftY - 6.9) / 2, 0]} material={steel}>
        <cylinderGeometry args={[0.36, 0.44, Math.max(0.2, liftY + 6.9), 18]} />
      </mesh>
      <mesh position={[0, -6.8, 0]} material={steelDark}>
        <cylinderGeometry args={[0.85, 0.95, 0.3, 20]} />
      </mesh>

      {/* back wall + the door */}
      <mesh position={[0, 5, -8]} material={steel} receiveShadow>
        <planeGeometry args={[26, 14]} />
      </mesh>
      <group position={[0, 2.9, -7.7]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
          <cylinderGeometry args={[2.75, 2.75, 0.5, 40]} />
        </mesh>
        <mesh position={[0, 0, -0.2]} material={steelDark}>
          <torusGeometry args={[3.05, 0.2, 16, 40]} />
        </mesh>
        <group position={[0, 0.05, 0.36]} rotation={[0, 0, -doorSpin * Math.PI * 0.75]}>
          <mesh material={steelDark}>
            <torusGeometry args={[0.95, 0.13, 14, 32]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} material={steelDark}>
              <boxGeometry args={[2.4, 0.16, 0.16]} />
            </mesh>
          ))}
          <mesh material={brassSmall}>
            <sphereGeometry args={[0.18, 18, 12]} />
          </mesh>
        </group>
      </group>

      {/* gold racks */}
      {[-6.4, 6.4].map((x, side) => (
        <group key={side} position={[x, 0, -1.0]}>
          <mesh position={[0, 1.9, 0]} material={steelDark}>
            <boxGeometry args={[2.2, 3.8, 6.4]} />
          </mesh>
          {[0.9, 2.0, 3.1].map((y, i) => (
            <group key={i} position={[side === 0 ? 0.9 : -0.9, y, 0]}>
              {[-1.9, -0.9, 0.1, 1.1, 2.1].map((z, j) => (
                <mesh key={j} position={[0, 0, z]} material={gold} castShadow>
                  <boxGeometry args={[0.85, 0.3, 0.66]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* catwalk where the owner watches (kept high so the door shot is unobstructed) */}
      <mesh position={[0, 4.9, -6.6]} material={steelDark} castShadow>
        <boxGeometry args={[11, 0.18, 1.5]} />
      </mesh>
      {[-4.4, -1.5, 1.5, 4.4].map((x, i) => (
        <mesh key={i} position={[x, 5.55, -6.0]} material={steelDark}>
          <boxGeometry args={[0.09, 1.1, 0.09]} />
        </mesh>
      ))}
      <mesh position={[0, 6.15, -6.0]} material={steelDark}>
        <boxGeometry args={[11, 0.09, 0.09]} />
      </mesh>

      {/* work lamps */}
      {[-4.6, 4.6].map((x, i) => (
        <mesh key={i} position={[x, 4.6, -5]} material={amber}>
          <boxGeometry args={[0.7, 0.12, 0.3]} />
        </mesh>
      ))}

      {/* lift: two runners under the wheels so the car reads against the dark shaft, plus end beams.
          Runners run along x, matching the car's side-on park in the vault. */}
      <group position={[0, liftY, 0]}>
        {[-0.94, 0.94].map((z, i) => (
          <mesh key={`run${i}`} position={[0, 0.1, z]} material={steel} castShadow receiveShadow>
            <boxGeometry args={[6.2, 0.16, 0.46]} />
          </mesh>
        ))}
        {[-2.72, 2.72].map((x, i) => (
          <mesh key={`end${i}`} position={[x, 0.1, 0]} material={steel} castShadow receiveShadow>
            <boxGeometry args={[0.36, 0.16, 2.34]} />
          </mesh>
        ))}
        {[-1.2, 1.2].map((z, i) => (
          <mesh key={`hz${i}`} position={[0, 0.19, z]} material={hazard}>
            <boxGeometry args={[6.2, 0.03, 0.1]} />
          </mesh>
        ))}
        {[-3.1, 3.1].map((x, i) => (
          <mesh key={`hz2${i}`} position={[x, 0.19, 0]} material={hazard}>
            <boxGeometry args={[0.1, 0.03, 2.5]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const brassSmall = new THREE.MeshLambertMaterial({ color: '#c99a3f' });

// ---------------------------------------------------------------- street

export function Street() {
  const asphalt = useMemo(() => lam({ color: '#2b303c' }), []);
  const walk = useMemo(() => lam({ color: '#8f96a3' }), []);
  const line = useMemo(() => lam({ color: '#e3c457', emissive: new THREE.Color(0.06, 0.05, 0.0) }), []);
  const stoneA = useMemo(() => lam({ color: '#4a4456' }), []);
  const stoneB = useMemo(() => lam({ color: '#575064' }), []);
  const stoneC = useMemo(() => lam({ color: '#5f4d5a' }), []);
  const trim = useMemo(() => lam({ color: '#6d6272' }), []);
  const win = useMemo(() => glow(2.2, 1.25, 0.5), []);
  const winCool = useMemo(() => glow(0.9, 1.25, 2.1), []);
  const shop = useMemo(() => glow(2.6, 1.6, 0.7), []);

  const blocks = useMemo(() => {
    const r = mulberry(19);
    const out: { x: number; z: number; w: number; d: number; h: number; tone: number }[] = [];
    for (let side = 0; side < 2; side++) {
      for (let row = 0; row < 6; row++) {
        const h = 10 + Math.round(r() * 18);
        out.push({
          x: side === 0 ? -10.55 : 10.55,
          z: 4 - row * 11,
          w: 8.1,
          d: 10,
          h,
          tone: (side + row) % 3,
        });
      }
    }
    return out;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -32]} material={asphalt} receiveShadow>
        <planeGeometry args={[8.8, 136]} />
      </mesh>
      {[-5.4, 5.4].map((x, i) => (
        <mesh key={i} position={[x, 0.11, -32]} material={walk} receiveShadow>
          <boxGeometry args={[2.2, 0.22, 136]} />
        </mesh>
      ))}
      {[-4.35, 4.35].map((x, i) => (
        <mesh key={i} position={[x, 0.13, -32]} material={trim}>
          <boxGeometry args={[0.16, 0.26, 136]} />
        </mesh>
      ))}
      {Array.from({ length: 17 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 8 - i * 8]} material={line}>
          <planeGeometry args={[0.24, 4.2]} />
        </mesh>
      ))}

      {blocks.map((b, i) => {
        const inner = b.x < 0 ? b.w / 2 : -b.w / 2;
        const out = b.x < 0 ? 1 : -1;
        const body = b.tone === 0 ? stoneA : b.tone === 1 ? stoneB : stoneC;
        const floors: number[] = [];
        for (let y = 5.6; y < b.h - 1; y += 3.1) floors.push(y);
        return (
          <group key={i} position={[b.x, 0, b.z]}>
            <mesh position={[0, b.h / 2, 0]} material={body} castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
            </mesh>

            {/* stone base + cornice */}
            <mesh position={[inner + out * 0.07, 2.1, 0]} material={b.tone ? stoneA : stoneB} receiveShadow>
              <boxGeometry args={[0.14, 4.2, b.d]} />
            </mesh>
            <mesh position={[inner + out * 0.12, 4.35, 0]} material={trim} castShadow>
              <boxGeometry args={[0.34, 0.34, b.d + 0.5]} />
            </mesh>

            {/* floor bands + pilasters */}
            {[8, 12, 16, 20].filter((y) => y < b.h - 0.5).map((y, k) => (
              <mesh key={`band${k}`} position={[inner + out * 0.05, y, 0]} material={trim}>
                <boxGeometry args={[0.2, 0.16, b.d + 0.3]} />
              </mesh>
            ))}
            {[-3.1, 0, 3.1].map((z, k) => (
              <mesh key={`pil${k}`} position={[inner + out * 0.16, b.h / 2 + 1.6, z]} material={trim} castShadow>
                <boxGeometry args={[0.42, b.h - 3.2, 0.62]} />
              </mesh>
            ))}

            {/* windows, seen obliquely from the street */}
            {floors.map((y, fy) =>
              [-2.9, 0, 2.9].map((z, fz) => {
                const lit = (i * 7 + fy * 3 + fz) % 5 !== 0;
                if (!lit) return null;
                const warm = (i + fy + fz) % 4 !== 0;
                return (
                  <mesh
                    key={`w${fy}-${fz}`}
                    position={[inner + out * 0.03, y, z]}
                    material={warm ? win : winCool}
                    onUpdate={(m) => m.layers.set(NOINK)}
                  >
                    <boxGeometry args={[0.06, 1.5, 1.3]} />
                  </mesh>
                );
              })
            )}

            {/* shopfronts at street level */}
            {[-2.6, 0.2, 3.0].map((z, k) => (
              <mesh
                key={`shop${k}`}
                position={[inner + out * 0.04, 1.9, z]}
                material={shop}
                onUpdate={(m) => m.layers.set(NOINK)}
              >
                <boxGeometry args={[0.05, 2.5, 2.1]} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* distant skyline silhouette */}
      {[-46, -31, -16, 16, 31, 46].map((x, i) => (
        <mesh key={i} position={[x, 8 + (i % 3) * 6, -86]} material={stoneA}>
          <boxGeometry args={[12, 16 + (i % 3) * 13, 9]} />
        </mesh>
      ))}

      {/* sun */}
      <mesh position={[0, 6.4, -92]} onUpdate={(m) => m.layers.set(NOINK)}>
        <circleGeometry args={[8.4, 48]} />
        <meshBasicMaterial color={new THREE.Color(4.4, 1.75, 0.55)} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------- sky

export function Sky({ palette }: { palette: [string, string, string, string] }) {
  const uniforms = useMemo(
    () => ({
      high: { value: new THREE.Color(palette[0]) },
      mid: { value: new THREE.Color(palette[1]) },
      low: { value: new THREE.Color(palette[2]) },
    }),
    [palette]
  );
  return (
    <mesh position={[0, 8, -30]} renderOrder={-1000}>
      <sphereGeometry args={[150, 32, 20]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={'varying vec3 ray; void main(){ ray = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }'}
        fragmentShader={
          'varying vec3 ray; uniform vec3 high; uniform vec3 mid; uniform vec3 low;' +
          'void main(){ float y = normalize(ray).y;' +
          ' vec3 c = mix(low, mid, smoothstep(-0.02, 0.18, y));' +
          ' c = mix(c, high, smoothstep(0.12, 0.55, y));' +
          ' gl_FragColor = vec4(c, 1.0); }'
        }
      />
    </mesh>
  );
}
