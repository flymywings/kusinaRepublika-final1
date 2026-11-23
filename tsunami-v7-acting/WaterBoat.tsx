import React, {useEffect, useMemo} from "react";
import * as THREE from "three";
import {Bangka} from "../tsunami/bangka";
import {waterFar, waterNear} from "../upstream/templates/bridge/paint";
import {LFB, untone} from "../upstream/templates/bridge/shade";
import {NOINK} from "../upstream/templates/bridge/ink";

const SHORE_X = -2;
const SEA_WIDTH = 240;
const SEA_DEPTH = 320;
const SEA_LEVEL = 0;
const BEACH_SLOPE = .5;
const BOAT_X = -.55;
const BOAT_Z = 4.75;
const BOAT_YAW = -.56;
const FLOAT_HEIGHT = .197;

// Keep the keel and the two bamboo floats on the slope as the water drops.
const supports = Array.from({length: 17}, (_, index) => {
  const along = index / 8 - 1;
  return [
    [1.54 * along, -.325 + .58 * Math.abs(along) ** 3, 0],
    [1.095 * along, -.246, -.83],
    [1.095 * along, -.246, .83],
  ];
}).flat();

function settleHeight(tilt: number, grounded: number, frame: number, shoreX: number, level: number) {
  const bob = (1 - grounded) * Math.sin(frame * .13);
  const roll = .04 * bob - .07 * grounded;
  const rollCos = Math.cos(roll);
  const rollSin = Math.sin(roll);
  const yawCos = Math.cos(BOAT_YAW);
  const yawSin = Math.sin(BOAT_YAW);
  const tiltCos = Math.cos(tilt);
  const tiltSin = Math.sin(tilt);

  let height = -Infinity;
  for (const [x, y, z] of supports) {
    const localX = yawCos * (x * rollCos - y * rollSin) + yawSin * z;
    const localY = x * rollSin + y * rollCos + .035 * bob;
    const worldX = BOAT_X + localX * tiltCos - localY * tiltSin;
    const relativeY = localX * tiltSin + localY * tiltCos;
    const sand = -BEACH_SLOPE * (worldX - SHORE_X);
    const waterSupport = grounded * THREE.MathUtils.smoothstep(worldX - shoreX, 0, .2);
    // Keep the seaward float buoyant until the water clears it. The shoreward
    // float can settle first without tipping the visible bow through the surface.
    const support = THREE.MathUtils.lerp(sand, Math.max(sand, level - .065), waterSupport);
    height = Math.max(height, support - relativeY);
  }
  return height;
}

// Masks follow the bridge river shader: red is crest, green is trough, blue is glint.
const WATER_DECL = `
#include <common>
varying vec3 vCoastWater;
uniform sampler2D nearMarks, farMarks;
uniform vec3 shallowWater, deepWater, horizonWater, crestColor, troughColor, glintColor;
uniform float seaTime, shoreX, boatContact;

float fishShape(vec2 p, float beat) {
  float body = 1. - smoothstep(.86, 1., length(p / vec2(.18, .059)));
  float tailWidth = clamp((-.12 - p.x) * .63, 0., .075);
  float tail = (1. - smoothstep(tailWidth-.01, tailWidth+.01,
    abs(p.y - tailWidth*.55*sin(beat)))) * smoothstep(-.258,-.241,p.x) * (1.-step(-.103,p.x));
  return max(body,tail);
}
`;

const WATER_COLOR = `
  vec3 viewRay = vCoastWater - cameraPosition;
  float distanceToLens = length(viewRay);
  float depression = asin(clamp(-viewRay.y / max(distanceToLens, .01), 0., 1.));
  vec2 world = vCoastWater.xz;
  float shoreDistance = world.x - shoreX;
  float shoal = exp(-shoreDistance * .55);
  vec3 water = mix(deepWater, shallowWater, shoal);
  float horizon = 1. - smoothstep(.015, .29, depression);
  water = mix(water, horizonWater, horizon * .9);

  // Let broad painted tones show through the sparse, two-scale linework.
  vec2 boat = mat2(.8473,-.5312,.5312,.8473) * (world - vec2(-.55,4.75));
  float hullNeighborhood = (1. - smoothstep(1.35, 1.9, abs(boat.x)))
    * (1. - smoothstep(.94, 1.22, abs(boat.y)));
  float marksAwayFromHull = 1. - .77 * hullNeighborhood;
  float drift = seaTime * .16;
  vec2 flow = world + vec2(drift, -drift * .24);
  vec2 smallUv = vec2(flow.x * 1.15 + flow.y * .18, flow.y * .76) / 4.4;
  vec2 largeUv = (flow + vec2(-.55 * drift, .3 * drift)) / 18. + .37;
  vec3 marks = mix(texture2D(nearMarks, smallUv).rgb, texture2D(farMarks, largeUv).rgb,
                   smoothstep(11., 38., distanceToLens));
  float tonePatch = sin(world.x * 1.7 + world.y * .84 + seaTime * .47)
                * sin(world.y * 1.48 - world.x * .62);
  water *= 1. + tonePatch * .065;
  water = mix(water, troughColor, marks.g * .27 * marksAwayFromHull);
  water = mix(water, crestColor, marks.r * .31 * marksAwayFromHull);
  water = mix(water, glintColor, marks.b * (.20 + .24 * horizon) * marksAwayFromHull);

  // Briefly see fish through the shallows. They travel faster than the receding edge
  // and fade as they reach deeper water. The shoreline clips the entire effect.
  float retreat = shoreX + 2.;
  if (retreat > .17 && retreat < 2.42 && shoreDistance < 1.25 && world.y > 6.0 && world.y < 7.35) {
    float driftOut = smoothstep(.17,2.42,retreat);
    float visible = smoothstep(.17,.43,retreat) * (1.-smoothstep(1.58,2.42,retreat));
    float beat = seaTime * 15.;
    vec2 first = vec2(shoreDistance - (.33+.54*driftOut), world.y - (6.46+.12*driftOut));
    vec2 second = vec2(shoreDistance - (.32+.38*driftOut), world.y - (6.92+.13*driftOut));
    second *= 1.25;
    float silhouettes = max(fishShape(first,beat),fishShape(second,beat+1.9)*.83);
    float flank = 1. - smoothstep(.8,1.,length((first-vec2(.026,.014))/vec2(.105,.022)));
    water = mix(water,troughColor,visible*silhouettes*.75);
    water = mix(water,crestColor,visible*flank*.48);
  }

  // Inverse of the bangka's yaw. These lines follow its waterline and both floats.
  float lengthFraction = boat.x / 1.58;
  float hullWidth = .31 * sqrt(max(0., 1. - lengthFraction * lengthFraction));
  float hullEdge = abs(boat.y) - hullWidth;
  float floatEdge = abs(abs(boat.y) - .83) - .055;
  float hullShade = exp(-pow(max(hullEdge, 0.) / .17, 2.)) * (1. - smoothstep(1.1, 1.58, abs(boat.x)));
  float floatShade = exp(-pow(max(floatEdge, 0.) / .13, 2.)) * (1. - smoothstep(.91, 1.18, abs(boat.x)));
  water = mix(water, troughColor, boatContact * (.33 * hullShade + .22 * floatShade));
  float breakup = smoothstep(-.65,.50,sin(boat.x * 7. + seaTime * 1.7));
  float floatRim = (1. - smoothstep(.008,.042,abs(floatEdge - .016))) * (1. - smoothstep(.82,1.11,abs(boat.x)));
  water = mix(water, glintColor, boatContact * floatRim * breakup * .36);

  // Broken, narrow lap line rather than a continuous bright border.
  float rockBank = 1. - smoothstep(.2,1.3,abs(world.y - 6.15));
  float shoreWave = .064 + .02 * sin(world.y * 2.1 + seaTime * 1.4) * (1. - rockBank);
  float shoreLine = 1. - smoothstep(.018,.105,abs(shoreDistance - shoreWave));
  float shoreBreak = .38 + .62*smoothstep(-.4,.55,sin(world.y * 5.5 + seaTime * 1.95));
  water = mix(water, crestColor, shoreLine * mix(shoreBreak,.96,rockBank) * .72 * (1.-horizon*.58));
  diffuseColor.rgb = water;
`;

function makeSea() {
  const near = waterNear();
  const far = waterFar();
  for (const mask of [near, far]) {
    mask.colorSpace = THREE.NoColorSpace;
    mask.anisotropy = 8;
    mask.needsUpdate = true;
  }

  const palette = (hex: string) => ({value: untone(hex, new THREE.Color())});
  const seaTime = {value: 0};
  const shoreX = {value: SHORE_X};
  const boatContact = {value: 1};
  const uniforms = {
    nearMarks: {value: near}, farMarks: {value: far}, seaTime, shoreX, boatContact,
    shallowWater: palette("#459f99"), deepWater: palette("#246f9d"), horizonWater: palette("#a4d6e5"),
    crestColor: palette("#9ed9da"), troughColor: palette("#15546c"), glintColor: palette("#e7f7eb"),
  };

  const material = new THREE.MeshLambertMaterial({color: 0xffffff});
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCoastWater;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvCoastWater = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", WATER_DECL)
      .replace("#include <map_fragment>", WATER_COLOR)
      .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
      .replace("#include <lights_fragment_end>",
        "#include <lights_fragment_end>\nreflectedLight.directDiffuse = diffuseColor.rgb * mix(vec3(.58,.67,.77), vec3(1.), sunVis);\nreflectedLight.indirectDiffuse = vec3(0.);");
  };
  material.customProgramCacheKey = () => "coast-water-opening";
  return {material, seaTime, shoreX, boatContact};
}

function waterState(retreat: number) {
  const distance = THREE.MathUtils.clamp(retreat, 0, 3.1);
  const shoreX = SHORE_X + distance;
  const level = SEA_LEVEL - BEACH_SLOPE * distance;
  const grounded = THREE.MathUtils.smoothstep(distance, .09, 1.2);
  return {distance, shoreX, level, grounded};
}

export function CoastBangka({frame, retreat = 0}: {frame: number; retreat?: number}) {
  const {distance, shoreX, level, grounded} = waterState(retreat);
  const seat = THREE.MathUtils.smoothstep(distance, 2.12, 2.67);
  const settling = Math.sin(seat * 2 * Math.PI) * (1 - seat) * .04;
  const tilt = -Math.atan(BEACH_SLOPE) * THREE.MathUtils.smoothstep(distance, .88, 2.03) - settling;
  const floatingHeight = FLOAT_HEIGHT + level;
  const restHeight = settleHeight(tilt, grounded, frame, shoreX, level);
  const contactBlend = THREE.MathUtils.smoothstep(distance, 0, .08);
  const height = THREE.MathUtils.lerp(floatingHeight, Math.max(floatingHeight, restHeight), contactBlend);

  return <group position={[BOAT_X, height, BOAT_Z]} rotation-z={tilt}>
    <group position={[-BOAT_X, 0, -BOAT_Z]}>
      <Bangka frame={frame} height={0} grounded={grounded} seaLevel={(level - height) / Math.cos(tilt)}/>
    </group>
  </group>;
}

export function WaterBoat({frame, retreat = 0}: {frame: number; retreat?: number}) {
  const sea = useMemo(makeSea, []);
  useEffect(() => () => sea.material.dispose(), [sea]);
  const {shoreX, level, grounded} = waterState(retreat);
  sea.seaTime.value = frame / 30;
  sea.shoreX.value = shoreX;
  sea.boatContact.value = 1 - grounded;

  return <>
    <mesh position={[shoreX + SEA_WIDTH / 2, level, -38]} rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow material={sea.material} onUpdate={(mesh) => mesh.layers.set(NOINK)}>
      <planeGeometry args={[SEA_WIDTH, SEA_DEPTH]}/>
    </mesh>
    <CoastBangka frame={frame} retreat={retreat}/>
  </>;
}



