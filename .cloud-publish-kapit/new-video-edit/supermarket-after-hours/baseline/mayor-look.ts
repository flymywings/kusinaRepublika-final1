import { blobPts, headBlob } from '../lib/toon';

// The same seeded silhouette and landmarks are drawn on the actor card and on the gilt relief.
export const MAYOR_SEED = 23;
export const mayorHead = blobPts(0, 0, headBlob(MAYOR_SEED, 1, 0), 64).map(([x, y]) => [x, -y] as [number, number]);
export const mayorFace = {
  eyes: [[-31 / 118, -5 / 118], [31 / 118, -5 / 118]] as [number, number][],
  eyeRadius: [18 / 118, 11 / 118] as [number, number],
  browY: 40 / 118,
  smileY: -43 / 118,
};
export const mayorHairline: [number, number][] = [
  ...mayorHead.filter(([, y]) => y >= .42),
  [.79, .47], [.62, .51], [.43, .51], [.24, .49], [.04, .47],
  [-.18, .49], [-.39, .50], [-.56, .48], [-.69, .41], [-.78, .38],
];
