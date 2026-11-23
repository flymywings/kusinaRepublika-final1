import { clamp01, smooth } from '../upstream/templates/bridge/story';

export type V3 = [number, number, number];

export interface CameraState {
  pos: V3;
  look: V3;
  fov: number;
}

export interface LightingState {
  sunPos: V3;
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
}

export interface StoryBeat {
  frame: number;
  camera: CameraState;
  lighting: LightingState;
  activeScene: 'bank' | 'vault' | 'street';
  car: {
    pos: V3;
    rot: V3;
    visible: boolean;
  };
  billionaire: {
    pos: V3;
    rotY: number;
    action: 'keys' | 'pennies' | 'smirk' | 'stand';
    visible: boolean;
  };
  banker: {
    pos: V3;
    rotY: number;
    action: 'take_keys' | 'confused' | 'hold_pennies';
    visible: boolean;
  };
  guard: {
    pos: V3;
    rotY: number;
    visible: boolean;
  };
  liftY: number;
}

// Symmetric smootherstep ease
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV3 = (a: V3, b: V3, t: number): V3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export function getStoryState(f: number): StoryBeat {
  // ---------------- BEAT 1: THE HOOK (Frames 0 - 138) ----------------
  // Audio: "A billionaire borrowed ONE dollar and handed the bank the keys to his Ferrari."
  if (f < 138) {
    const tGlide = glide(Math.max(0, (f - 20) / 45)); // glide from close keys to wide lobby
    const camPos = lerpV3([0.25, 1.25, 2.7], [0.0, 1.75, 4.8], tGlide);
    const camLook = lerpV3([0.0, 1.05, 1.8], [0.0, 0.95, 0.5], tGlide);

    return {
      frame: f,
      activeScene: 'bank',
      camera: { pos: camPos, look: camLook, fov: 42 },
      lighting: {
        sunPos: [6, 8, 5],
        sunColor: '#fff7ed', // Warm morning sunlight
        sunIntensity: 1.5,
        ambientColor: '#f1f5f9',
        ambientIntensity: 0.65,
      },
      car: {
        pos: [-2.2, 0, -1.5],
        rot: [0, 0.35, 0], // Parked elegantly inside grand lobby
        visible: true,
      },
      billionaire: {
        pos: [0.35, 0, 2.45],
        rotY: -Math.PI / 12,
        action: 'keys',
        visible: true,
      },
      banker: {
        pos: [0.0, 0, 1.0],
        rotY: 0,
        action: 'take_keys',
        visible: true,
      },
      guard: {
        pos: [-3.8, 0, -1.2],
        rotY: Math.PI / 4,
        visible: true,
      },
      liftY: 0,
    };
  }

  // ---------------- BEAT 2: THE VAULT DESCENT (Frames 138 - 380) ----------------
  // Audio: "He walked into a Manhattan bank, requested a one-dollar loan, and watched guards drive his half-million-dollar supercar into their underground vault."
  if (f < 380) {
    const tDescent = clamp01((f - 180) / 160); // lift moves down
    const liftY = lerp(0, -5.5, glide(tDescent));

    const camT = clamp01((f - 150) / 80);
    const camPos = lerpV3([0, 1.8, 5.0], [0, -3.5, 6.2], glide(camT));
    const camLook = lerpV3([0, 0.8, 0], [0, -4.5, 0], glide(camT));

    return {
      frame: f,
      activeScene: 'vault',
      camera: { pos: camPos, look: camLook, fov: 45 },
      lighting: {
        sunPos: [0, 10, 0],
        sunColor: '#38bdf8', // Cool fluorescent security blue
        sunIntensity: 1.1,
        ambientColor: '#1e293b',
        ambientIntensity: 0.5,
      },
      car: {
        pos: [0, -6.5 + liftY + 0.1, 0],
        rot: [0, 0, 0],
        visible: true,
      },
      billionaire: {
        pos: [2.5, -6.5 + 5.5, 3.5], // Watching from walkway
        rotY: -Math.PI / 4,
        action: 'stand',
        visible: true,
      },
      banker: {
        pos: [0, 0, 0],
        rotY: 0,
        action: 'take_keys',
        visible: false,
      },
      guard: {
        pos: [2.2, -6.5 + liftY, 0],
        rotY: -Math.PI / 2,
        visible: true,
      },
      liftY,
    };
  }

  // ---------------- BEAT 3: THE RETURN & 2 CENTS (Frames 380 - 530) ----------------
  // Audio: "Two weeks later, he returned, paid back the dollar, and gave the teller two cents in interest."
  if (f < 530) {
    const tGlide = glide(clamp01((f - 380) / 30));
    const camPos = lerpV3([0.8, 1.4, 3.2], [0.6, 1.35, 2.9], tGlide);
    const camLook: V3 = [0.15, 1.08, 1.8];

    return {
      frame: f,
      activeScene: 'bank',
      camera: { pos: camPos, look: camLook, fov: 38 },
      lighting: {
        sunPos: [5, 8, 5],
        sunColor: '#fef08a',
        sunIntensity: 1.4,
        ambientColor: '#f8fafc',
        ambientIntensity: 0.7,
      },
      car: {
        pos: [-2.2, 0, -1.5],
        rot: [0, 0.35, 0],
        visible: true,
      },
      billionaire: {
        pos: [0.35, 0, 2.45],
        rotY: -Math.PI / 10,
        action: 'pennies',
        visible: true,
      },
      banker: {
        pos: [0.0, 0, 1.0],
        rotY: 0,
        action: 'hold_pennies',
        visible: true,
      },
      guard: {
        pos: [-3.8, 0, -1.2],
        rotY: Math.PI / 4,
        visible: false,
      },
      liftY: 0,
    };
  }

  // ---------------- BEAT 4: THE CONFUSED QUESTION (Frames 530 - 640) ----------------
  // Audio: "The banker asked why a wealthy man needed a one-dollar loan."
  if (f < 640) {
    // Focus tight on bewildered Banker
    return {
      frame: f,
      activeScene: 'bank',
      camera: { pos: [0.15, 1.35, 2.35], look: [0.0, 1.28, 1.0], fov: 34 },
      lighting: {
        sunPos: [4, 7, 4],
        sunColor: '#fef08a',
        sunIntensity: 1.4,
        ambientColor: '#f8fafc',
        ambientIntensity: 0.7,
      },
      car: {
        pos: [-2.2, 0, -1.5],
        rot: [0, 0.35, 0],
        visible: true,
      },
      billionaire: {
        pos: [0.35, 0, 2.45],
        rotY: -Math.PI / 10,
        action: 'stand',
        visible: true,
      },
      banker: {
        pos: [0.0, 0, 1.0],
        rotY: 0,
        action: 'confused',
        visible: true,
      },
      guard: {
        pos: [-3.8, 0, -1.2],
        rotY: 0,
        visible: false,
      },
      liftY: 0,
    };
  }

  // ---------------- BEAT 5: THE PUNCHLINE & ESCAPE (Frames 640 - 830) ----------------
  // Audio: "The billionaire smiled: where else in Manhattan can you park a Ferrari for two weeks for two cents?"
  if (f < 685) {
    // Close-up on Billionaire's deadpan smirk
    return {
      frame: f,
      activeScene: 'bank',
      camera: { pos: [0.25, 1.35, 2.9], look: [0.32, 1.30, 2.45], fov: 32 },
      lighting: {
        sunPos: [5, 6, 4],
        sunColor: '#fb923c', // Warm golden hour
        sunIntensity: 1.6,
        ambientColor: '#f8fafc',
        ambientIntensity: 0.7,
      },
      car: {
        pos: [-2.2, 0, -1.5],
        rot: [0, 0.35, 0],
        visible: true,
      },
      billionaire: {
        pos: [0.32, 0, 2.45],
        rotY: Math.PI / 16,
        action: 'smirk',
        visible: true,
      },
      banker: {
        pos: [0.0, 0, 1.0],
        rotY: 0,
        action: 'confused',
        visible: true,
      },
      guard: {
        pos: [-3.8, 0, -1.2],
        rotY: 0,
        visible: false,
      },
      liftY: 0,
    };
  }

  // Final street drive-off (Frames 685 - 830)
  const tDrive = Math.max(0, (f - 685) / 145);
  const carZ = lerp(12, -28, tDrive * 1.3);

  return {
    frame: f,
    activeScene: 'street',
    camera: { pos: [0, 2.2, -2], look: [0, 1.2, -22], fov: 46 },
    lighting: {
      sunPos: [0, 5, -50], // Sunset horizon directly ahead
      sunColor: '#ea580c', // Fiery orange Manhattan sunset
      sunIntensity: 2.0,
      ambientColor: '#fdba74',
      ambientIntensity: 0.6,
    },
    car: {
      pos: [0, 0, carZ],
      rot: [0, Math.PI, 0], // Driving away toward horizon
      visible: true,
    },
    billionaire: {
      pos: [0, 0, 0],
      rotY: 0,
      action: 'stand',
      visible: false,
    },
    banker: {
      pos: [-2.8, 0, 2.0], // Standing on sidewalk holding two pennies
      rotY: -Math.PI / 4,
      action: 'hold_pennies',
      visible: true,
    },
    guard: {
      pos: [0, 0, 0],
      rotY: 0,
      visible: false,
    },
    liftY: 0,
  };
}
