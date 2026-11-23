import {glide} from '../upstream/templates/bridge/story';

export const SHORE_BASE = -2;
export const BEACH_SLOPE = .5;
export const MAX_RETREAT = 2.95;

export function bayOffset(z: number) {
  return 3.8 * Math.exp(-(((z + 31) / 15) ** 2))
    - 1.3 * Math.exp(-(((z + 8) / 7) ** 2))
    + .95 * Math.exp(-(((z - 12) / 5) ** 2));
}

export function shoreX(z: number, retreat = 0) {
  return SHORE_BASE + bayOffset(z) + retreat;
}

export function coastWaterLevel(retreat: number) {
  return -BEACH_SLOPE * retreat;
}

export function retreatAt(frame: number) {
  return .82 * glide((frame - 335) / 49) + 2.13 * glide((frame - 373) / 145);
}

export const BAY_GLSL = `
  float bayOffset(float z) {
    vec3 u = vec3((z+31.)/15.,(z+8.)/7.,(z-12.)/5.);
    return dot(exp(-u*u),vec3(3.8,-1.3,.95));
  }
  float bayShore(float z, float retreat) {
    return -2. + bayOffset(z) + retreat;
  }
`;
