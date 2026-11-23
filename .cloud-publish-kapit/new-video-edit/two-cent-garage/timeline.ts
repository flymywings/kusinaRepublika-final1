// Two-cent garage — story, camera and lighting timeline.
// Every value is a pure function of the frame number so the render is deterministic.
//
// Narration cues (1.1x alignment, 30 fps):
//   0-155    a billionaire borrowed one dollar and handed the bank the keys to his Ferrari
//   155-384  he walked into a Manhattan bank, requested a one-dollar loan, and watched guards drive
//            his half-million-dollar supercar into their underground vault
//   384-537  two weeks later, he returned, paid back the dollar, and gave the teller two cents in interest
//   537-639  the banker asked why a wealthy man needed a one-dollar loan
//   639-681  the billionaire smiled
//   681-830  where else in Manhattan can you park a Ferrari for two weeks for two cents

import { clamp01 } from '../upstream/templates/bridge/story';

export type V3 = [number, number, number];
export const FPS = 30;
export const TOTAL = 830;

export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export type Cam = { pos: V3; look: V3; fov: number };

type Key = { f: number; dur?: number; cam: Cam };
const K = (f: number, pos: V3, look: V3, fov: number, dur?: number): Key => ({ f, dur, cam: { pos, look, fov } });

// Hard cuts are keys without `dur`; glides end exactly on their key frame.
const KEYS: Key[] = [
  // --- the loan: hook on the bill + key fob, pull out to the counter, pan to the car on "Ferrari." ---
  // The bill and fob sit at roughly (0.9, 1.06, 2.53), so the hook aims at them, not at the card's centre.
  K(0, [1.06, 1.21, 3.66], [0.89, 1.05, 2.53], 32),
  K(44, [0.9, 1.86, 6.4], [0.62, 1.05, 1.2], 46, 44),
  K(116, [0.95, 1.85, 6.28], [0.64, 1.05, 1.2], 46, 70),
  // --- CUT on "Ferrari.": the supercar parked in the lobby, low hero angle, slow push in ---
  K(120, [-7.79, 0.55, 11.2], [-6.05, 0.9, 5.15], 42),
  K(155, [-7.55, 0.5, 10.75], [-6.05, 0.92, 5.15], 41, 35),
  // --- CUT: the underground vault, the car on the lift between the guards ---
  K(155, [0.6, 4.7, 14.5], [0, 0.5, -0.8], 42),
  K(250, [0.62, 4.6, 14.1], [0, 0.35, -0.8], 42, 95),
  // --- CUT: the locking wheel spins, sealing the vault ---
  K(330, [0, 3.6, -0.6], [0, 2.95, -7.34], 40),
  K(384, [0, 3.35, -1.0], [0, 2.95, -7.34], 38.5, 40),
  // --- CUT: two weeks later, paying the dollar back (aligned to the scene switch at 384) ---
  K(384, [0.2, 1.62, 6.0], [0.05, 1.2, 1.3], 46),
  K(500, [0.18, 1.6, 5.75], [0.03, 1.18, 1.3], 44, 114),
  K(537, [0.16, 1.59, 5.62], [0.02, 1.17, 1.3], 43, 37),
  // --- CUT: the banker, medium close ---
  K(539, [-0.15, 1.56, 3.25], [-0.48, 1.5, -0.2], 27),
  K(639, [-0.1, 1.56, 3.05], [-0.48, 1.51, -0.2], 26, 100),
  // --- CUT: the billionaire, close ---
  K(641, [1.35, 1.62, 5.55], [1.3, 1.66, 2.6], 27),
  K(681, [1.33, 1.62, 5.3], [1.3, 1.67, 2.6], 26, 40),
  // --- CUT: Manhattan at sunset, the car pulls away ---
  K(681, [-1.5, 1.7, 5.6], [0.3, 1.25, -12], 48),
  K(745, [-1.2, 1.78, 5.9], [0.2, 1.3, -14], 47, 64),
  // --- CUT: two cents, in the sunset. Head room kept so the tilt to the face does not crop it. ---
  K(745, [1.02, 1.1, 7.75], [0.88, 1.18, 5.1], 33),
  K(805, [1.02, 1.12, 7.68], [0.88, 1.23, 5.1], 32, 60),
  K(830, [1.0, 1.34, 7.5], [0.88, 1.55, 5.1], 31, 25),
];

export function camAt(f: number): Cam {
  let cur = KEYS[0].cam;
  for (let i = 1; i < KEYS.length; i++) {
    const k = KEYS[i];
    const start = k.f - (k.dur ?? 0);
    if (f < start) break;
    const t = k.dur ? glide((f - start) / k.dur) : 1;
    cur = {
      pos: lerpV3(cur.pos, k.cam.pos, t),
      look: lerpV3(cur.look, k.cam.look, t),
      fov: lerp(cur.fov, k.cam.fov, t),
    };
  }
  return cur;
}

// ---------------- lighting ----------------

export type Tone = 'warm' | 'cool' | 'sunset';

export interface Light {
  tone: Tone;
  sunPos: V3;
  sunColor: string;
  sunI: number;
  fillColor: string;
  fillI: number;
  ambColor: string;
  ambI: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export function lightAt(f: number): Light {
  if (f >= 681) {
    return {
      tone: 'sunset', sunPos: [0, 4.0, -60], sunColor: '#ff8a3c', sunI: 3.6,
      fillColor: '#7f8fd8', fillI: 0.35, ambColor: '#ffd9b0', ambI: 0.5,
      fogColor: '#e3a279', fogNear: 20, fogFar: 105,
    };
  }
  if (f >= 155 && f < 384) {
    return {
      tone: 'cool', sunPos: [-5, 8, 5], sunColor: '#9fd4ff', sunI: 2.7,
      fillColor: '#3b82f6', fillI: 0.32, ambColor: '#93c5fd', ambI: 0.42,
      fogColor: '#0d1626', fogNear: 12, fogFar: 46,
    };
  }
  if (f >= 639) {
    return {
      tone: 'warm', sunPos: [6, 7, 6], sunColor: '#ffd9a3', sunI: 3.1,
      fillColor: '#d9e3ff', fillI: 0.26, ambColor: '#ffeccd', ambI: 0.5,
      fogColor: '#e8dcc8', fogNear: 24, fogFar: 70,
    };
  }
  return {
    tone: 'warm', sunPos: [6, 9, 6], sunColor: '#ffe8c4', sunI: 3.0,
    fillColor: '#cfe3ff', fillI: 0.28, ambColor: '#fff3e0', ambI: 0.5,
    fogColor: '#e8dcc8', fogNear: 24, fogFar: 70,
  };
}

// ---------------- staging ----------------

export type Scene = 'lobby' | 'vault' | 'street';

export type Pose =
  | 'handoff' | 'take' | 'stand' | 'lend' | 'receive' | 'pay' | 'drop'
  | 'smirk' | 'hold' | 'confused' | 'walk' | 'watch' | 'guard' | 'salute';

export interface Performer {
  pos: V3;
  rotY: number;
  pose: Pose;
  visible: boolean;
  flip?: boolean;
}

export interface Stage {
  scene: Scene;
  liftY: number;
  doorSpin: number;
  car: { pos: V3; rot: V3; visible: boolean; roll: number };
  hero: Performer;
  banker: Performer;
  guardA: Performer;
  guardB: Performer;
}

const CAR_PARK: V3 = [-5.2, 0, 4.6];
const CAR_ROT: V3 = [0, 2.2, 0];
const HERO: V3 = [1.3, 0, 2.6];
// Two weeks later he steps up to the teller's window, so the banker stays in shot behind him.
const HERO_PAY: V3 = [0.55, 0, 2.5];
const BANKER: V3 = [-0.5, 0, -0.2];
const CAR_VAULT_ROT: V3 = [0, 1.48, 0];

const GUARD_A: Performer = { pos: [-3.4, 0, -2.9], rotY: 0.34, pose: 'guard', visible: true, flip: true };
const GUARD_B: Performer = { pos: [3.4, 0, -2.9], rotY: -0.34, pose: 'guard', visible: true };

export function stageAt(f: number): Stage {
  // ---------- the loan, at the counter ----------
  if (f < 155) {
    return {
      scene: 'lobby',
      liftY: 0,
      doorSpin: 0,
      car: { pos: CAR_PARK, rot: CAR_ROT, visible: true, roll: 0 },
      hero: { pos: HERO, rotY: -0.18, visible: true, flip: true, pose: f < 118 ? 'handoff' : 'take' },
      banker: { pos: BANKER, rotY: 0.14, visible: true, pose: f < 116 ? 'stand' : 'receive' },
      guardA: { ...GUARD_A, visible: false },
      guardB: { ...GUARD_B, visible: false },
    };
  }

  // ---------- the vault ----------
  if (f < 384) {
    const sink = glide((f - 210) / 112);
    const liftY = -2.7 * sink;
    return {
      scene: 'vault',
      liftY,
      doorSpin: f > 336 ? glide((f - 336) / 44) : 0,
      car: { pos: [0, liftY + 0.2, 0], rot: CAR_VAULT_ROT, visible: true, roll: 0 },
      hero: { pos: [0.6, 4.99, -6.35], rotY: 0, visible: false, pose: 'watch' },
      banker: { pos: [0, 0, 0], rotY: 0, visible: false, pose: 'stand' },
      guardA: { ...GUARD_A, pose: f < 300 ? 'salute' : 'guard' },
      guardB: GUARD_B,
    };
  }

  // ---------- two weeks later: pay, then the banker, then the smile ----------
  if (f < 681) {
    const bankerShot = f >= 539 && f < 641;
    const heroShot = f >= 641;
    return {
      scene: 'lobby',
      liftY: 0,
      doorSpin: 0,
      car: { pos: CAR_PARK, rot: CAR_ROT, visible: false, roll: 0 },
      hero: {
        pos: heroShot ? HERO : HERO_PAY, rotY: -0.18, visible: !bankerShot, flip: true,
        pose: heroShot ? 'smirk' : f < 430 ? 'stand' : f < 470 ? 'pay' : f < 512 ? 'drop' : 'stand',
      },
      banker: {
        pos: BANKER, rotY: 0.12, visible: !heroShot,
        pose: f < 512 ? 'stand' : f < 566 ? 'hold' : 'confused',
      },
      guardA: { ...GUARD_A, visible: false },
      guardB: { ...GUARD_B, visible: false },
    };
  }

  // ---------- Manhattan, sunset: the car pulls away ----------
  if (f < 745) {
    const drive = Math.pow(clamp01((f - 681) / 64), 1.5);
    const z = lerp(-1.2, -46, drive);
    return {
      scene: 'street',
      liftY: 0,
      doorSpin: 1,
      car: { pos: [0.9, 0, z], rot: [0, 0, 0], visible: true, roll: -(-1.2 - z) / 0.36 },
      hero: { pos: [0, 0, 0], rotY: 0, visible: false, pose: 'stand' },
      banker: { pos: [-3.6, 0, -11.0], rotY: 0.3, visible: false, pose: 'hold' },
      guardA: { ...GUARD_A, visible: false },
      guardB: { ...GUARD_B, visible: false },
    };
  }

  // ---------- the punchline: two cents ----------
  return {
    scene: 'street',
    liftY: 0,
    doorSpin: 1,
    car: { pos: [0.9, 0, -46], rot: [0, 0, 0], visible: false, roll: 0 },
    hero: { pos: [0, 0, 0], rotY: 0, visible: false, pose: 'stand' },
    banker: { pos: [0.88, 0, 5.1], rotY: 0.06, visible: true, pose: 'hold' },
    guardA: { ...GUARD_A, visible: false },
    guardB: { ...GUARD_B, visible: false },
  };
}
