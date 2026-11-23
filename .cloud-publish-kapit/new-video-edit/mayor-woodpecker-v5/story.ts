import { glide } from '../upstream/templates/bridge/story';

export type Point = [number, number, number];
export const FPS = 30;
export const FRAMES = 888;
export const SUNSET = 762;
export const DISSOLVE = 8;
export const ARCH_VIEW = 342;
export const MARKET_START = 362;
export const SHOP_VIEW = 418;
export const ROOF_VIEW = 478;
export const PLAZA_RETURN = 506;
export const inMarket = (frame: number) => frame >= MARKET_START && frame < PLAZA_RETURN;

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
   [341, [-.48, 1.91, 4.72], [-1.03, 1.37, 1.39], 48, 8]],
  [[ARCH_VIEW, [1.28, 1.72, 5.65], [3.28, 1.73, .60], 53, 9, [3.20, 2.30, .55]],
   [361, [2.68, 1.65, 5.04], [4.64, 1.78, .55], 53, 9]],
  // Track at boot height past the foreground stalls on the other side of the arch.
  [[MARKET_START, [25.20, .77, 5.66], [25.40, 1.22, .25], 56, 15, [25.1, 1, .30]],
   [386, [25.92, .80, 5.74], [27.15, 1.24, .20], 54, 16, [27.1, 1, .30]],
   [417, [29.30, .87, 5.64], [31.12, 1.37, .20], 54, 16, [30.85, 1.1, .30]]],
  [[SHOP_VIEW, [34.04, 1.65, -3.82], [31.78, 1.25, -1.98], 54, 14, [31.75, 1.35, -2.40]],
   [439, [33.87, 1.67, -3.75], [31.78, 1.31, -1.98], 52, 15, [31.79, 1.37, -2.27]],
   [477, [33.65, 1.75, -3.61], [31.99, 1.48, -1.83], 49, 16, [31.98, 1.42, -1.91]]],
  [[ROOF_VIEW, [35.0, 4.88, 5.3], [35.72, 4.78, .10], 47, 11, [35.70, 5.18, .35]],
   [491, [32.65, 4.80, 5.2], [32.36, 4.74, .15], 47, 11],
   [505, [28.3, 4.67, 4.85], [28.20, 4.43, .24], 47, 11]],
  [[PLAZA_RETURN, [4.95, 4.70, 3.84], [3.20, 4.31, -2.25], 46, 9, [3.4, 4.55, -2.60]],
   [513, [3.25, 3.95, 4.24], [1.02, 3.80, -.25], 44, 9],
   [522, [2.46, 3.55, 4.04], [.42, 3.38, .32], 41, 10],
   [536, [2.46, 3.55, 4.04], [.42, 3.38, .32], 41, 10],
   [558, [2.62, 1.58, 3.76], [1.03, .22, .88], 43, 9, CHIP_FLOOR],
   [574, [2.61, 1.54, 3.71], [1.05, .24, .89], 43, 9, CHIP_FLOOR]],
  [[575, [2.32, 2.02, 3.31], [1.13, 1.07, 1.00], 39, 10, [1.04, 1.05, 1.02]],
   [593, [2.23, 2.01, 3.10], [1.10, 1.42, 1.09], 38, 12, CHIP_HAND],
   [622, [2.13, 1.98, 2.89], [1.08, 1.48, 1.09], 33, 16, CHIP_HAND],
   [647, [2.10, 1.97, 2.82], [1.08, 1.48, 1.09], 33, 16, CHIP_HAND]],
  [[648, [.91, 2.28, 5.60], [.06, 1.43, 1.17], 48, 7],
   [698, [.76, 2.23, 5.31], [.02, 1.40, 1.18], 45, 8],
   [729, [.51, 2.14, 4.56], [-.29, 1.33, 1.39], 43, 10]],
  [[730, [-.03, 2.05, 3.87], [-.64, 1.37, 1.28], 40, 11],
   [752, [-.02, 2.04, 3.78], [-.62, 1.38, 1.27], 40, 11]],
  // Incoming and outgoing layers use the same camera during the eight-frame time jump.
  [[753, [-4.4, 1.62, 8.10], [.05, 1.91, .35], 44, 6, [0, 1.2, 1.25]],
   [785, [-4.4, 1.62, 8.10], [.05, 1.91, .35], 44, 6, [0, 1.2, 1.25]],
   [803, [-.96, 2.15, 5.43], [-.14, 1.39, 1.21], 49, 8],
   [832, [-.91, 2.14, 5.30], [-.13, 1.41, 1.21], 49, 8],
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
