import { blobPts, headBlob } from '../bridge-recreation/toon';

// The same seeded silhouette and landmarks are drawn on the actor card and on the gilt relief.
export const MAYOR_SEED = 23;
export const mayorHead = blobPts(0, 0, headBlob(MAYOR_SEED, 1, 0), 64).map(([x, y]) => [x, -y] as [number, number]);
export const mayorFace = {
  eyes: [[-31 / 118, -5 / 118], [31 / 118, -5 / 118]] as [number, number][],
  eyeRadius: [18 / 118, 11 / 118] as [number, number],
  browY: 40 / 118,
  smileY: -43 / 118,
};
export const mayorHairline: [number, number][] = [[-.87, .37], [-.82, .56], [-.66, .76], [-.31, .91], [.03, .92], [.40, .83], [.68, .68], [.86, .46], [.83, .48], [.59, .58], [.32, .62], [.08, .60], [-.22, .51], [-.50, .45], [-.70, .34]];
