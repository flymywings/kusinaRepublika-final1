import { blobPts, headBlob } from '../bridge-recreation/toon';

// The same seeded silhouette and landmarks are drawn on the actor card and on the gilt relief.
export const MAYOR_SEED = 23;
export const mayorHead = blobPts(0, 0, headBlob(MAYOR_SEED, 1, 0), 64).map(([x, y]) => [x, -y] as [number, number]);
export const mayorFace = {
  eyes: [[-.29, .04], [.29, .04]] as [number, number][],
  eyeRadius: [.16, .135] as [number, number],
  browY: .39,
  moustacheY: -.245,
  smileY: -.47,
};
export const mayorHairline: [number, number][] = [[-.93, .18], [-.88, .51], [-.66, .77], [-.31, .91], [.03, .92], [.40, .83], [.68, .68], [.88, .42], [.92, .23], [.63, .39], [.36, .45], [.10, .47], [-.17, .36], [-.45, .30], [-.73, .16]];
