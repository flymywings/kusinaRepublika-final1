import {CatmullRomCurve3, Vector3} from 'three';
import {BIRD_SEAT, MARKET_START, PLAZA_RETURN, limit, point, tween, type Point} from './story';

type RouteKey = readonly [frame: number, position: Point];

function route(keys: RouteKey[]) {
  const curve = new CatmullRomCurve3(keys.map(([, p]) => new Vector3(...p)), false, 'centripetal');
  return (frame: number) => {
    const index = Math.max(0, Math.min(keys.length - 2, keys.findLastIndex(([start]) => start <= frame)));
    const t = limit((frame - keys[index][0]) / (keys[index + 1][0] - keys[index][0]));
    const u = (index + t) / (keys.length - 1);
    const position = curve.getPoint(u);
    const direction = curve.getTangent(u);
    return {position: position.toArray() as Point, yaw: Math.atan2(direction.x, direction.z), rise: direction.y};
  };
}

export function face(from: Point, to: Point) {
  return Math.atan2(to[0] - from[0], to[2] - from[2]);
}

export function turn(a: number, b: number, t: number) {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * t;
}

export const approach = route([[229, [3.0, 4.0, .58]], [237, [1.77, 3.66, .72]], [247, BIRD_SEAT]]);
export const flight = route([[269, BIRD_SEAT], [288, [1.76, 3.77, .86]], [320, [.75, 2.95, 2.23]],
  [339, [1.75, 2.43, 1.10]], [358, [4.65, 2.18, .48]], [365, [5.70, 2.30, .42]]]);
export const returnFlight = route([[PLAZA_RETURN, [3.40, 4.55, -2.60]],
  [513, [1.05, 3.65, .28]], [518, BIRD_SEAT]]);
export const marketFlight = route([[MARKET_START, [25.85, 2.17, .42]], [380, [27.9, 2.18, .35]],
  [397, [30.1, 2.28, .33]], [417, [32.3, 2.65, .25]], [438, [34.7, 3.08, .24]],
  [459, [36.8, 3.75, .24]], [472, [36.7, 4.83, .30]], [478, [35.7, 5.18, .35]],
  [491, [32.4, 5.25, .24]], [505, [27.9, 4.88, .29]]]);
const streetRun = route([[MARKET_START, [25.05, 0, .30]], [386, [27.35, 0, .29]], [417, [30.85, 0, .24]],
  [431, [33.10, 0, .28]], [463, [38.45, 0, .27]], [478, [40, 0, .33]]]);

export function marketGuardAt(frame: number, index: number) {
  const {position} = streetRun(frame);
  position[0] -= index * 1.40;
  position[2] += index * .79;
  return {position, yaw: Math.PI / 2, stride: .98, step: (frame - MARKET_START) * .64 + index * 1.8};
}

export function marketWitnessAt(frame: number) {
  const advance = tween(frame, 430, 456);
  return {position: point([31.75, .012, -2.40], [31.98, .012, -1.91], advance),
    yaw: .34, stride: .54 * tween(frame, 430, 437) * (1 - tween(frame, 449, 456)),
    lookUp: tween(frame, 447, 469)};
}

const guardPaths = [
  route([[316, [-2.15, 0, 1.24]], [337, [-1.73, 0, 1.36]], [349, [-1.57, 0, 1.65]],
    [356, [-1.30, 0, 1.86]], [370, [-.31, 0, 1.91]], [387, [1.28, 0, 1.60]], [412, [3.15, 0, -.28]],
    [441, [3.34, 0, -2.63]], [462, [3.25, 0, -3.90]], [476, [3.28, 0, -4.02]]]),
  route([[324, [-2.82, 0, 1.05]], [350, [-1.97, 0, 1.13]], [361, [-1.71, 0, 1.37]],
    [365, [-1.59, 0, 1.57]], [369, [-1.42, 0, 1.77]], [378, [-.53, 0, 1.90]], [396, [1.47, 0, 1.55]], [425, [3.62, 0, -.63]],
    [449, [3.72, 0, -2.26]], [470, [3.70, 0, -3.30]], [484, [3.72, 0, -3.37]]]),
];

const mayorDesk: Point = [-3.67, 0, 1.30];
const mayorCounter: Point = [-3.94, 0, 1.30];
const mayorSteps: Point = [-1.16, 0, 1.27];
const mayorStatue: Point = [-.78, 0, 1.19];
const mayorToSteps = route([[164, mayorDesk], [180, [-3.22, 0, .47]], [200, [-1.66, 0, .48]],
  [212, [-1.32, 0, 1.12]], [224, mayorSteps]]);

export const recipient: Point = [.46, 0, 1.85];
const waitAt: Point = [2.21, 0, 1.54];
const witnessApproach = route([[101, [-5.16, 0, 2.01]], [121, [-4.74, 0, 2.08]]]);
const witnessExit = route([[149, [-4.74, 0, 2.08]], [163, [-4.91, 0, 1.74]], [184, [-5.23, 0, .74]], [218, [-6.26, 0, .53]]]);
const witnessReturn = route([[506, [2.18, 0, -2.57]], [550, [2.26, 0, -.85]], [611, waitAt]]);

export function mayorAt(frame: number) {
  if (frame < 155) {
    const lean = tween(frame, 104, 121) * (1 - tween(frame, 139, 155));
    return point(mayorDesk, mayorCounter, lean);
  }
  if (frame < 290) return mayorToSteps(frame).position;
  return point(mayorSteps, mayorStatue, tween(frame, 447, 494));
}

export function guardAt(frame: number, index: number) {
  const track = guardPaths[index](frame);
  const giveMayorRoom = tween(frame, 320, 341);
  track.position[0] -= .58 * giveMayorRoom;
  track.position[2] -= .53 * giveMayorRoom;
  const start = index === 0 ? 349 : 358;
  const turnStart = index === 0 ? 461 : 470;
  const glance = turn(track.yaw, face(track.position, BIRD_SEAT), tween(frame, turnStart, turnStart + 29));
  const look = turn(face(track.position, mayorAt(frame)), glance, tween(frame, start - 10, start + 9));
  const stride = Math.min(1, .52 * tween(frame, start - 35, start - 22)
    + .64 * tween(frame, start - 3, start + 12)) * (1 - tween(frame, turnStart - 5, turnStart + 10));
  const step = (frame - start) * .53;
  return {position: track.position, yaw: look, stride, step};
}

export function witnessAt(frame: number) {
  if (frame < 149) {
    return {position: witnessApproach(frame).position, visible: true, yaw: .98,
      stride: .63 * tween(frame, 99, 106) * (1 - tween(frame, 115, 123))};
  }
  if (frame < 229) {
    return {...witnessExit(frame), visible: true,
      stride: .71 * tween(frame, 149, 157) * (1 - tween(frame, 210, 219))};
  }
  if (frame <= 648) {
    const track = witnessReturn(frame);
    const arrival = tween(frame, 603, 612);
    return {position: track.position, visible: frame >= 587, yaw: turn(track.yaw, -.67, arrival),
      stride: .58 * (1 - tween(frame, 601, 611))};
  }
  const enter = tween(frame, 647, 655) * (1 - tween(frame, 664, 676));
  const readChip = tween(frame, 667, 676) * (1 - tween(frame, 680, 693));
  return {position: point(waitAt, recipient, tween(frame, 648, 674)), visible: true,
    yaw: turn(-.67 - .68 * enter, .74, readChip),
    stride: .85 * tween(frame, 648, 654) * (1 - tween(frame, 666, 675))};
}

export function carpenterAt(frame: number) {
  if (frame < 701) return point([1.86, 0, -2.70], [1.66, 0, .63], tween(frame, 488, 559));
  return point([1.66, 0, .63], [2.86, 0, -.64], tween(frame, 701, 748));
}

export function bakerAt(frame: number) {
  return point([-2.9, 0, -5.53], [-2.45, 0, -3.15], tween(frame, 422, 462));
}

export function neighbourAt(frame: number) {
  return point([2.96, 0, -5.57], [2.71, 0, -4.38], tween(frame, 456, 506));
}
