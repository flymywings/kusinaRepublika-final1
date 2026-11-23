import { glide } from '../upstream/templates/bridge/story';

export type Point = [number, number, number];
export const FPS = 30;
export const FRAMES = 888;
export const SUNSET = 762;
export const DISSOLVE = 8;

export const limit = (t: number) => Math.max(0, Math.min(1, t));
export const tween = (frame: number, a: number, b: number) => glide((frame - a) / (b - a));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const point = (a: Point, b: Point, t: number): Point => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

export const DESK_POUCH: Point = [-3.35, 1.02, 2.08];
export const DESK_SKETCH: Point = [-2.64, 1.028, 2.14];
export const NOTCH: Point = [.32, 3.63, .30];
export const BIRD_SEAT: Point = [.74, 3.25, .30];
export const CHIP_FLOOR: Point = [1.06, .07, .88];
export const CHIP_HAND: Point = [1.05, 1.45, 1.11];
export const NEST: Point = [0, 3.89, 0];
export const CHAIN_SEAT: Point = [-.54, 1.23, .54];
export const PECK = 532;
export const CHIP_LAND = 557;

type View = { position: Point; look: Point; focus: Point; fov: number; blur: number };
type CameraKey = readonly [frame: number, position: Point, look: Point, fov: number, blur: number, focus?: Point];

// Each array covers one setup. A change of angle starts on a cue after the previous action reads.
const CAMERA: CameraKey[][] = [
  // The tabletop makes the bounty legible. A short slide then opens the sightline to the square.
  [[0, [-2.36, 2.66, 5.12], [-3.02, 1.39, 2.04], 47, 11, [-3.12, 1.16, 2.04]],
   [66, [-2.36, 2.66, 5.12], [-3.02, 1.39, 2.04], 47, 11, [-3.12, 1.16, 2.04]],
   [106, [-2.65, 2.66, 7.35], [-1.66, 1.83, .82], 53, 5],
   [109, [-2.65, 2.66, 7.35], [-1.66, 1.83, .82], 53, 5]],
  [[110, [-3.46, 2.30, 4.92], [-3.51, 1.26, 2.03], 49, 10],
   [148, [-3.46, 2.28, 4.86], [-3.48, 1.28, 2.03], 49, 10],
   [171, [-3.42, 2.43, 5.04], [-2.57, 1.90, 1.68], 52, 6]],
  [[172, [-3.35, 1.47, 5.73], [0, 2.31, .04], 42, 5],
   [228, [-3.10, 1.57, 5.18], [0, 2.44, .06], 42, 6]],
  [[229, [2.70, 3.44, 4.16], [.36, 3.37, .29], 39, 11],
   [289, [2.55, 3.47, 3.97], [.36, 3.37, .29], 39, 11]],
  [[290, [-3.08, 2.25, 4.73], [-3.20, 1.28, 1.86], 52, 8],
   [327, [-3.02, 2.20, 4.76], [-3.05, 1.31, 1.83], 52, 8],
   [361, [-2.48, 2.15, 4.90], [-2.37, 1.30, 1.62], 52, 6]],
  [[362, [-2.71, 2.56, 7.27], [-.81, 1.73, .95], 49, 2],
   [395, [-.74, 2.05, 6.22], [.49, 1.62, 1.37], 48, 4],
   [439, [1.34, 2.31, 6.64], [2.04, 1.81, .72], 49, 3],
   [468, [1.40, 2.44, 6.47], [1.95, 1.96, .46], 49, 3],
   [494, [1.44, 2.56, 6.23], [1.23, 2.17, .13], 47, 5],
   [522, [2.46, 3.55, 4.04], [.42, 3.38, .32], 41, 10],
   [536, [2.46, 3.55, 4.04], [.42, 3.38, .32], 41, 10],
   [558, [2.62, 1.58, 3.76], [1.03, .22, .88], 43, 9, CHIP_FLOOR],
   [574, [2.61, 1.54, 3.71], [1.05, .24, .89], 43, 9, CHIP_FLOOR]],
  [[575, [2.32, 2.02, 3.31], [1.13, 1.07, 1.00], 39, 10, [1.04, 1.05, 1.02]],
   [593, [2.23, 2.01, 3.10], [1.10, 1.42, 1.09], 38, 12, CHIP_HAND],
   [622, [2.13, 1.98, 2.89], [1.08, 1.48, 1.09], 33, 13, CHIP_HAND],
   [647, [2.10, 1.97, 2.82], [1.08, 1.48, 1.09], 33, 13, CHIP_HAND]],
  [[648, [.91, 2.28, 5.60], [.06, 1.43, 1.17], 48, 7],
   [698, [.76, 2.23, 5.31], [.02, 1.40, 1.18], 45, 8],
   [729, [.51, 2.14, 4.56], [-.29, 1.33, 1.39], 43, 10]],
  [[730, [-.03, 2.05, 3.87], [-.64, 1.37, 1.28], 40, 11],
   [752, [-.02, 2.04, 3.78], [-.62, 1.38, 1.27], 40, 11]],
  // Incoming and outgoing layers use the same camera during the eight-frame time jump.
  [[753, [2.18, 3.55, 4.86], [.05, 3.38, .02], 41, 8],
   [770, [2.18, 3.55, 4.86], [.05, 3.38, .02], 41, 8],
   [793, [1.60, 2.23, 5.18], [-.18, 1.36, 1.02], 46, 6],
   [832, [1.49, 2.21, 5.03], [-.17, 1.37, 1.03], 45, 7],
   [869, [1.63, 3.79, 4.36], [.02, 3.89, .03], 39, 12],
   [887, [1.53, 3.87, 4.17], [.02, 3.91, .04], 38, 12]],
];

export function viewAt(frame: number): View {
  const keys = CAMERA.findLast((track) => track[0][0] <= frame) ?? CAMERA[0];
  const index = keys.findLastIndex((key) => key[0] <= frame);
  const a = keys[Math.max(0, index)];
  const b = keys[index + 1] ?? a;
  const t = a === b ? 0 : tween(frame, a[0], b[0]);
  return { position: point(a[1], b[1], t), look: point(a[2], b[2], t), focus: point(a[5] ?? a[2], b[5] ?? b[2], t), fov: mix(a[3], b[3], t), blur: mix(a[4], b[4], t) };
}

export function chipAt(frame: number): { position: Point; rotation: Point } {
  if (frame < CHIP_LAND) {
    const t = limit((frame - PECK) / (CHIP_LAND - PECK));
    return { position: [mix(NOTCH[0], CHIP_FLOOR[0], t), mix(NOTCH[1], CHIP_FLOOR[1], t * t), mix(NOTCH[2], CHIP_FLOOR[2], t)], rotation: [.78 + 1.45 * t, .45 * t, .32 + 6.0 * t] };
  }
  if (frame < 579) return { position: CHIP_FLOOR, rotation: [1.45 * (1 - tween(frame, CHIP_LAND, CHIP_LAND + 5)), .45, 0] };
  const lift = tween(frame, 579, 598);
  return { position: point(CHIP_FLOOR, CHIP_HAND, lift), rotation: [mix(.3, -1.57, tween(frame, 600, 619)), .29, -.07] };
}

export const peckAt = (frame: number) =>
  Math.max(tween(frame, 247, 253) * (1 - tween(frame, 254, 264)), tween(frame, 521, PECK) * (1 - tween(frame, PECK + 1, PECK + 9)));
