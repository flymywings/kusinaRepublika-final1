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
export const SHOP_HINGE: Point = [1.56, .042, -5.76];
export const shopDoorYaw = (frame: number) => -1.48 * tween(frame, 417, 435);

export function shopDoorHandle(frame: number): Point {
  const yaw = shopDoorYaw(frame);
  return [SHOP_HINGE[0] + .87 * Math.cos(yaw) - .067 * Math.sin(yaw), SHOP_HINGE[1] + .93,
    SHOP_HINGE[2] - .87 * Math.sin(yaw) - .067 * Math.cos(yaw)];
}

type View = { position: Point; look: Point; focus: Point; fov: number; blur: number };
type CameraKey = readonly [frame: number, position: Point, look: Point, fov: number, blur: number, focus?: Point];

// Each array covers one setup. A change of angle starts on a cue after the previous action reads.
const CAMERA: CameraKey[][] = [
  // The tabletop makes the bounty legible. A short slide then opens the sightline to the square.
  [[0, [-2.36, 2.66, 5.12], [-3.02, 1.39, 2.04], 47, 11, [-3.12, 1.16, 2.04]],
   [66, [-2.36, 2.66, 5.12], [-3.02, 1.39, 2.04], 47, 11, [-3.12, 1.16, 2.04]],
   [106, [-2.65, 2.66, 7.35], [-1.66, 1.83, .82], 53, 5],
   [109, [-2.65, 2.66, 7.35], [-1.66, 1.83, .82], 53, 5]],
  [[110, [-4.68, 2.23, 4.94], [-4.18, 1.25, 1.91], 53, 9, [-4.26, 1.32, 2.03]],
   [132, [-4.68, 2.22, 4.91], [-4.18, 1.25, 1.91], 53, 9, [-4.26, 1.32, 2.03]],
   [163, [-4.27, 2.19, 4.79], [-3.72, 1.37, 1.95], 51, 8, DESK_POUCH],
   [171, [-4.27, 2.19, 4.79], [-3.72, 1.37, 1.95], 51, 8, DESK_POUCH]],
  [[172, [-3.35, 1.47, 5.73], [0, 2.31, .04], 42, 5],
   [228, [-3.10, 1.57, 5.18], [0, 2.44, .06], 42, 6]],
  [[229, [2.70, 3.44, 4.16], [.36, 3.37, .29], 39, 11],
   [289, [2.55, 3.47, 3.97], [.36, 3.37, .29], 39, 11]],
  [[290, [-.49, 1.96, 4.63], [-1.20, 1.32, 1.40], 47, 9, [-.98, 1.40, 1.52]],
   [326, [-.50, 1.94, 4.64], [-1.20, 1.34, 1.40], 47, 8],
   [361, [-.48, 1.82, 4.95], [-.83, 1.40, 1.39], 51, 5]],
  // Street-level diagonal. Both guards leave the steps toward the visible shop, rather than circling the plinth.
  [[362, [-1.65, 1.46, 5.55], [-.22, 1.68, 1.05], 53, 4],
   [386, [.01, 1.49, 5.35], [1.40, 1.90, .83], 51, 5],
   [417, [2.28, 1.74, 3.78], [2.95, 1.94, -.88], 51, 6]],
  // The shout gets an answer at the shop. Leave room above the witness's gaze.
  [[418, [.48, 1.73, -2.47], [2.02, 1.12, -5.67], 43, 11, [2.16, 1.18, -5.60]],
   [439, [.54, 1.73, -2.50], [2.10, 1.18, -5.57], 43, 11],
   [460, [.67, 1.76, -2.63], [2.20, 1.36, -5.00], 43, 10],
   [477, [.67, 1.78, -2.31], [2.26, 1.49, -4.58], 46, 9]],
  // The witness looks up. The bird reverses screen direction in the elevated return.
  [[478, [5.65, 4.75, 1.39], [2.23, 3.97, -3.15], 47, 7],
   [495, [4.31, 4.64, 2.79], [1.55, 4.02, -1.47], 47, 8],
   [506, [3.30, 4.08, 3.75], [1.02, 3.80, -.25], 46, 9],
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
  [[753, [-2.72, 1.86, 5.24], [.06, 2.51, .01], 44, 6],
   [770, [-2.72, 1.86, 5.24], [.06, 2.51, .01], 44, 6],
   [793, [-.97, 2.16, 5.25], [-.14, 1.39, 1.21], 47, 7],
   [832, [-.93, 2.14, 5.14], [-.13, 1.41, 1.21], 46, 8],
   [869, [-2.31, 3.48, 4.65], [.01, 3.90, .04], 40, 12],
   [887, [-2.31, 3.48, 4.49], [.01, 3.91, .04], 39, 12]],
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
