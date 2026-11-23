import React, {useMemo} from 'react';
import * as THREE from 'three';
import {NOINK} from '../bridge-recreation/ink';
import {coastHeight} from './CoastSet';
import {BAY_GLSL, BEACH_SLOPE, MAX_RETREAT, bayOffset, coastWaterLevel, shoreX} from './shore';

type Point = [number, number, number];
const seam = (z: number) => .61 * (z + 1.2) + .11 * Math.sin(z * 1.45);
const stratum = ['#263e49', '#48545b', '#977854', '#496174', '#c0a471'];
export const UNDERWATER_HAZE = '#388ca5';
const waterHaze = new THREE.Color(UNDERWATER_HAZE);
const coastBlend = (z: number) => THREE.MathUtils.smoothstep(z, 1.2, 5.4);
const beachBlend = (x: number, z: number) =>
  Math.max(coastBlend(z), 1 - THREE.MathUtils.smoothstep(x - bayOffset(z), -2.25, 2.8));
const beachHeight = coastHeight;

function seabed(x: number, z: number) {
  const sand = .09 * Math.sin(x * .8 + z * .7) + .06 * Math.sin(x * 2.1 - z * 1.5);
  const bank = .42 * Math.exp(-Math.pow((x + 5) / 3.9, 2));
  const offshore = -2.52 + sand + bank;
  return THREE.MathUtils.lerp(offshore, Math.max(offshore, beachHeight(x, z)), beachBlend(x, z));
}

const shelfRows = 62;
const shelfColumns = 33;
const shelfFront = 11;
const shelfRowStep = .7;
const shelfColumnStep = .78;

function shelfPoint(row: number, column: number, side: number): Point {
  const z = shelfFront - row * shelfRowStep;
  const distance = side * column * shelfColumnStep;
  const x = seam(z) + distance;
  return [x, seabed(x, z) - .09 * Math.exp(-Math.abs(distance) * 2.4), z];
}

function fishFootprintFloor(x: number, z: number, lift: number) {
  // Bound the whole rotating fish, including its tail, against both rendered shelves.
  const startRow = Math.max(0, Math.floor((shelfFront - z - .14) / shelfRowStep));
  const endRow = Math.min(shelfRows - 1, Math.floor((shelfFront - z + .14) / shelfRowStep));
  let floor = -Infinity;
  for (const side of [-1, 1]) {
    const rise = side === 1 ? lift : 0;
    const center = (x + .42 * rise) * side;
    for (let row = startRow; row <= endRow; row++) {
      const near = seam(shelfFront - row * shelfRowStep) * side;
      const far = seam(shelfFront - (row + 1) * shelfRowStep) * side;
      const startColumn = Math.max(0, Math.floor((center - .37 - Math.max(near, far)) / shelfColumnStep));
      const endColumn = Math.min(shelfColumns - 1, Math.floor((center + .37 - Math.min(near, far)) / shelfColumnStep));
      for (let column = startColumn; column <= endColumn + 1 && startColumn <= endColumn; column++) {
        // A triangle's height never exceeds its highest vertex.
        floor = Math.max(floor, shelfPoint(row, column, side)[1] + rise,
          shelfPoint(row + 1, column, side)[1] + rise);
      }
    }
  }
  return floor;
}

function rockShelf(raised: boolean) {
  const points: number[] = [];
  const colors: number[] = [];
  const paintedSand = ['#7e9790', '#8fa08f', '#89988c'].map(hex => new THREE.Color(hex));
  const beachSand = new THREE.Color('#cba56a');

  function triangle(a: Point, b: Point, c: Point, color: THREE.Color) {
    points.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
  }

  const side = raised ? 1 : -1;
  const topPoint = (row: number, column: number) => shelfPoint(row, column, side);

  for (let row = 0; row < shelfRows; row++) {
    for (let column = 0; column < shelfColumns; column++) {
      const a = topPoint(row, column);
      const b = topPoint(row, column + 1);
      const c = topPoint(row + 1, column + 1);
      const d = topPoint(row + 1, column);
      const drift = .5 + .5 * Math.sin(row * .48 + column * .67);
      const grain = .5 + .5 * Math.sin(row * 13.91 + column * 17.32);
      const warmSand = beachBlend(a[0], a[2]) * (1 - THREE.MathUtils.smoothstep(a[0], .8, 3.2));
      const color = paintedSand[0].clone().lerp(paintedSand[1], drift)
        .lerp(paintedSand[2], grain * .43).lerp(beachSand, warmSand);
      const underside = color.clone().multiplyScalar(.99 + .021 * Math.sin(column + row));
      if (raised) {
        triangle(a, b, c, color);
        triangle(a, c, d, underside);
      } else {
        triangle(a, c, b, color);
        triangle(a, d, c, underside);
      }
    }

    const edge = (r: number, band: number): Point => {
      const top = topPoint(r, 0);
      const depth = (stratum.length - band) * .26;
      const layer = depth * (1 + .08 * Math.sin(r * .58 + band * .9));
      return [top[0] + depth * .42, top[1] - layer, top[2]];
    };

    for (let band = 0; band < stratum.length; band++) {
      const a = edge(row, band);
      const b = edge(row + 1, band);
      const c = edge(row + 1, band + 1);
      const d = edge(row, band + 1);
      const color = new THREE.Color(stratum[band]).multiplyScalar(.96 + .08 * Math.cos(row * 1.35));
      if (raised) {
        triangle(a, b, c, color);
        triangle(a, c, d, color);
      } else {
        triangle(a, c, b, color);
        triangle(a, d, c, color);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

const surfaceVertex = `
  uniform float time;
  uniform float lift;
  uniform float disturbance;
  uniform float approach;
  uniform float retreat;
  varying vec3 world;
  void main() {
    vec3 p = position;
    float x = p.x - .61 * (p.z + 1.2);
    float offset = (x - disturbance) / .93;
    float wake = (x - disturbance + 1.18) / .73;
    float crest = exp(-offset * offset);
    float trough = exp(-wake * wake);
    float shoal = max(approach, smoothstep(1.2, 5.4, p.z));
    p.y -= shoal * (.65 + retreat * ${BEACH_SLOPE.toFixed(3)});
    p.y += (.055 * sin(p.z * 2.1 + p.x * 1.7 + time * .075)
      + .032 * sin(p.x * 4. + p.z * 1.36 - time * .12)) * (1. - shoal * .78);
    p.y += lift * (crest * .84 - trough * .28) * (1. - shoal);
    world = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
  }
`;

const surfaceFragment = `
  uniform float time;
  uniform float lift;
  uniform float disturbance;
  uniform float approach;
  uniform float retreat;
  uniform vec3 hazeColor;
  varying vec3 world;
  ${BAY_GLSL}
  void main() {
    vec2 p = world.xz;
    float a = sin(p.x * 3.4 + p.y * 1.25 + .78*sin(p.y * 2.1 + time * .055) + time * .072);
    float b = sin(p.y * 2.6 - p.x * 1.3 + .75*sin(p.x * 2.3 - time * .052));
    float light = pow(max(0., 1. - abs(a * .65 + b * .35)), 7.);
    float x = p.x - .61 * (p.y + 1.2) - disturbance;
    float shoal = max(approach, smoothstep(1.2, 5.4, p.y));
    float front = exp(-x * x * 5.) * clamp(lift, 0., 1.) * (1. - shoal);
    float shoreDistance = p.x - bayShore(p.y, retreat);
    float rockBank = 1. - smoothstep(.2, 1.3, abs(p.y - 6.15));
    float edge = 1. - smoothstep(.018, .105, abs(shoreDistance - .064));
    float broken = .38 + .62*smoothstep(-.4, .55, sin(p.y * 5.5 + time * .065));
    float foam = edge * shoal * mix(broken, .96, rockBank);
    float haze = smoothstep(6., 27., length(cameraPosition - world));
    float above = smoothstep(world.y - .015, world.y + .3, cameraPosition.y);
    vec3 color = mix(vec3(.055, .35, .53), vec3(.29, .68, .82), .24 + light * .15 + front * .24);
    float crestLine = exp(-x*x*10.) * clamp(lift * 1.3, 0., 1.) * (1. - shoal);
    color = mix(color, vec3(.58,.91,.98), max(front * .54, crestLine * .93));
    color = mix(color, vec3(.79, .95, .92), foam * .85);
    vec3 ray = normalize(cameraPosition - world);
    float grazing = (1. - above) * (1. - smoothstep(.06,.38,abs(ray.y)));
    float opacity = .69 + above * shoal * .18 + grazing * shoal * .23 + light * .04 + front * .12 + foam * .12;
    float alpha = min(.99, opacity) * (1. - haze);
    if (alpha < .10) discard;
    float cover = mix(1., smoothstep(-.05, .02, shoreDistance), shoal);
    gl_FragColor = vec4(mix(color, hazeColor, haze), alpha * cover);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function WaterCeiling({frame, lift, disturbance, approach, retreat}: {
  frame: number; lift: number; disturbance: number; approach: number; retreat: number;
}) {
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(58, 54, 180, 48);
    plane.rotateX(-Math.PI / 2);
    plane.translate(0, .65, -10);
    return plane;
  }, []);
  const uniforms = useMemo(() => ({
    time: {value: 0}, lift: {value: 0}, disturbance: {value: 0},
    approach: {value: 0}, retreat: {value: 0}, hazeColor: {value: waterHaze},
  }), []);
  uniforms.time.value = frame;
  uniforms.lift.value = lift;
  uniforms.disturbance.value = disturbance;
  uniforms.approach.value = approach;
  uniforms.retreat.value = retreat;
  return <mesh geometry={geometry} frustumCulled={false} renderOrder={1} onUpdate={mesh => mesh.layers.set(NOINK)}>
    <shaderMaterial vertexShader={surfaceVertex} fragmentShader={surfaceFragment} uniforms={uniforms}
      transparent depthWrite side={THREE.DoubleSide}/>
  </mesh>;
}

const columnVertex = `
  varying vec3 sightline;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.);
    sightline = world.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const columnFragment = `
  uniform vec3 hazeColor;
  uniform float approach;
  uniform float retreat;
  varying vec3 sightline;
  float grain(vec2 p) {
    return fract(sin(dot(p, vec2(31.6, 71.9))) * 43587.2);
  }
  float cloudNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3. - 2. * f);
    return mix(mix(grain(cell), grain(cell + vec2(1., 0.)), f.x),
      mix(grain(cell + vec2(0., 1.)), grain(cell + vec2(1.)), f.x), f.y);
  }
  void main() {
    vec3 ray = normalize(sightline);
    float upperWater = smoothstep(-.025, .54, ray.y);
    float scatteredSun = pow(max(0., dot(ray, normalize(vec3(-.4, .5, -1.)))), 9.);
    vec3 blue = hazeColor + vec3(.026, .093, .119) * upperWater;
    blue += vec3(.045, .104, .127) * scatteredSun * upperWater;
    float shoal = max(approach, smoothstep(1.2, 5.4, cameraPosition.z));
    float level = mix(.65, -retreat * ${BEACH_SLOPE.toFixed(3)}, shoal);
    float aboveSurface = smoothstep(level - .03, level + .28, cameraPosition.y);
    if (aboveSurface > 0.) {
      vec3 sky = mix(vec3(.41, .66, .81), vec3(.094, .31, .61), smoothstep(-.02, .48, ray.y));
      vec2 p = ray.xz / (max(ray.y, 0.) + .32) * vec2(2.5, 3.1);
      float clouds = cloudNoise(p) * .62 + cloudNoise(p * 2.19) * .25 + cloudNoise(p * 5.1) * .13;
      float cloudMask = smoothstep(.49, .65, clouds) * smoothstep(.035, .16, ray.y);
      sky = mix(sky, vec3(.83, .9, .94), cloudMask * .77);
      blue = mix(blue, sky, aboveSurface * smoothstep(-.045, .025, ray.y));
    }
    gl_FragColor = vec4(blue, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function WaterColumn({approach, retreat}: {approach: number; retreat: number}) {
  const uniforms = useMemo(() => ({
    hazeColor: {value: waterHaze}, approach: {value: 0}, retreat: {value: 0},
  }), []);
  uniforms.approach.value = approach;
  uniforms.retreat.value = retreat;
  return <mesh renderOrder={-10} onUpdate={mesh => mesh.layers.set(NOINK)}>
    <sphereGeometry args={[55, 32, 16]}/>
    <shaderMaterial vertexShader={columnVertex} fragmentShader={columnFragment} uniforms={uniforms}
      depthWrite={false} side={THREE.BackSide}/>
  </mesh>;
}

const lightVertex = `
  varying vec2 beam;
  void main() {
    beam = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const lightFragment = `
  varying vec2 beam;
  uniform float time;
  uniform float seed;
  void main() {
    float width = mix(.48, .15, beam.y);
    float edge = abs(beam.x - .5 + .04 * sin(beam.y * 2. + time * .035 + seed));
    float sides = 1. - smoothstep(width * .22, width, edge);
    float height = smoothstep(.02, .24, beam.y) * (1. - smoothstep(.79, 1., beam.y));
    float ripple = .84 + .16 * sin(beam.x * 26. + beam.y * 9. + time * .075 + seed);
    gl_FragColor = vec4(.17, .54, .72, sides * height * ripple * .24);
  }
`;

const beamPositions: Point[] = [[-2.5, -.93, -.8], [-1.28, -.93, -3.6], [1.2, -.87, -6.2], [2.65, -1.06, -4.5], [-.3, -.89, -10.4]];

function WaterLight({frame}: {frame: number}) {
  const uniforms = useMemo(() => beamPositions.map((_, i) => ({time: {value: 0}, seed: {value: i * 1.73}})), []);
  uniforms.forEach(uniform => { uniform.time.value = frame; });
  return <>{beamPositions.map((position, i) => <mesh key={i} position={position} rotation-z={-.48 + i * .032}
    renderOrder={2} onUpdate={mesh => mesh.layers.set(NOINK)}>
    <planeGeometry args={[1.1 + i * .2, 3.5]}/>
    <shaderMaterial vertexShader={lightVertex} fragmentShader={lightFragment} uniforms={uniforms[i]}
      transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
  </mesh>)}</>;
}

function ShelfMaterial({frame, retreat}: {frame: number; retreat: number}) {
  const time = useMemo(() => ({value: 0}), []);
  const draw = useMemo(() => ({value: 0}), []);
  time.value = frame;
  draw.value = retreat;
  return <meshStandardMaterial vertexColors flatShading roughness={.95} side={THREE.DoubleSide}
    onBeforeCompile={shader => {
      shader.uniforms.causticTime = time;
      shader.uniforms.coastRetreat = draw;
      shader.vertexShader = `varying vec3 shelfWorld;\n${shader.vertexShader}`.replace('#include <worldpos_vertex>', `
        #include <worldpos_vertex>
        shelfWorld = (modelMatrix * vec4(transformed, 1.)).xyz;
      `);
      shader.fragmentShader = `varying vec3 shelfWorld; uniform float causticTime, coastRetreat;\n${BAY_GLSL}\n${shader.fragmentShader}`
        .replace('#include <color_fragment>', `
          #include <color_fragment>
          float beach = max(smoothstep(1.2, 5.4, shelfWorld.z),
            1. - smoothstep(-2.25, 2.8, shelfWorld.x - bayOffset(shelfWorld.z)));
          float waterline = shelfWorld.x - bayShore(shelfWorld.z, coastRetreat);
          float dry = beach * (1. - smoothstep(-.045, .03, waterline));
          float wetSand = dry * smoothstep(-.20, .09, shelfWorld.x - bayShore(shelfWorld.z, 0.));
          diffuseColor.rgb *= mix(vec3(1.), vec3(.67,.60,.47), wetSand);
          float waterLevel = -.5 * coastRetreat;
          float submergedView = 1. - smoothstep(waterLevel-.16,waterLevel+.23,cameraPosition.y);
          diffuseColor.rgb *= mix(vec3(1.),vec3(.61,.91,1.11),submergedView*beach*(1.-dry)*.72);
        `)
        .replace('#include <emissivemap_fragment>', `
          #include <emissivemap_fragment>
          vec2 sampleAt = shelfWorld.xz * 5.2;
          float rippleA = sin(sampleAt.x + sin(sampleAt.y * .86 + causticTime * .025));
          float rippleB = sin(sampleAt.y - sin(sampleAt.x * .72 - causticTime * .041));
          float caustic = pow(max(0., 1. - abs(rippleA * .63 + rippleB * .37)), 12.);
          float nearLight = 1. - smoothstep(2.5, 9., length(shelfWorld.xz + vec2(.7, 1.5)));
          totalEmissiveRadiance += vec3(.06, .16, .17) * caustic * nearLight * .55 * (1. - dry);
        `);
    }}/>
}

const rubble: Array<[number, number, number, string]> = [
  [-3.5, 3.5, .53, '#67747b'], [-2.85, 3.8, .22, '#859297'], [-4.35, 3.1, .37, '#647880'],
  [-2.7, -.1, .33, '#848b82'], [-2.1, -.55, .19, '#969d85'], [-3.3, -.45, .24, '#687f87'],
  [2.8, .2, .48, '#7c7469'], [2.4, .45, .25, '#96927d'], [1.1, -3.9, .37, '#6a8082'],
  [-4.6, -3.2, .52, '#697c7d'], [2.4, -3.2, .16, '#718889'], [4.1, -2, .61, '#697b7a'],
  [-.78, 2.1, .12, '#797f69'], [-.94, 2.36, .09, '#a59877'], [-3.6, -6.6, .67, '#596f78'],
  [1.3, -8.5, .7, '#496a75'], [-5.6, -.1, .43, '#596d79'], [3.9, 2.6, .26, '#758c83'],
  [-3.8, -12.3, 1.34, '#506c74'], [-2.7, -12.9, .81, '#596e70'], [1.4, -14.2, 1.2, '#536f76'],
  [3.1, -16.5, 1.58, '#436d7c'], [-5.5, -18.5, 1.5, '#577f86'], [-1.1, -22.5, 2.14, '#53707d'],
];

// Match the cluster in the surface shot so the moving waterline has a fixed reference.
const shoreRocks = [[-1.46,6.15,.23,1.2],[-1.69,6.43,.12,-.7],[-1.41,6.53,.09,.4],[-1.13,6.07,.085,.8]];
const shoreRockColors = ['#807566','#a48c72','#c7a588'];

function ShoreRocks({retreat}: {retreat: number}) {
  return <>{shoreRocks.map(([x,z,size,turn],i) =>
    <mesh key={x} position={[x,beachHeight(x,z)+size*.36,z]}
      scale={[size*1.23,size*.82,size]} rotation={[.12,turn,.18]}
      onUpdate={mesh => mesh.layers.set(NOINK)}>
      <dodecahedronGeometry args={[1,0]}/>
      <meshStandardMaterial color={new THREE.Color(shoreRockColors[i%3]).lerp(waterHaze,
        .26 * THREE.MathUtils.smoothstep(x - shoreX(z, retreat), -.03, .34))}
        roughness={.96} flatShading/>
    </mesh>
  )}</>;
}

function Grass({x, z, size, frame}: {x: number; z: number; size: number; frame: number}) {
  const blade = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-.05, 0);
    shape.quadraticCurveTo(-.18, .55, .12, 1.08);
    shape.quadraticCurveTo(.38, .71, .04, 0);
    return new THREE.ShapeGeometry(shape, 5);
  }, []);
  return <group position={[x, seabed(x, z) - .025, z]} scale={size}>
    {[-.46, -.21, 0, .32, .52].map((angle, i) => <mesh key={angle} geometry={blade}
      position={[(i - 2) * .055, 0, .025 * (i % 2)]} scale={[.92, .8 + .29 * Math.sin(i * 2.24), 1]}
      rotation={[.12 * Math.sin(i * 4), i * .8, angle + .11 * Math.sin(frame * .08 + x + i * .64)]}>
      <meshStandardMaterial color={i % 2 ? '#508d69' : '#286757'} side={THREE.DoubleSide} roughness={.91}/>
    </mesh>)}
  </group>;
}

const grass: Array<[number, number, number]> = [
  [-3.2, 2.6, .92], [-2.92, 2.52, .59], [-3.68, 2.15, .69], [-2.95, -.65, .63],
  [2.95, -.82, .75], [3.12, -.6, .49], [1.74, -3.6, .45], [3.95, -1.5, .85],
  [-5.8, -4.8, .83], [-4.8, -1.3, .64], [2.9, 3.7, .82], [-1.9, -6, .72],
];

function RockLife({raised, frame}: {raised: boolean; frame: number}) {
  return <>
    {rubble.filter(([x, z, size]) => (x > seam(z)) === raised && seabed(x, z) + size < -.1).map(([x, z, size, color]) =>
      <mesh key={`${x},${z}`} position={[x, seabed(x, z) + size * .14, z]} rotation={[x * .8, z * .7, .25]} scale={[size, size * .52, size * .79]}>
        <dodecahedronGeometry args={[1, 0]}/><meshStandardMaterial color={color} flatShading roughness={1}/>
      </mesh>)}
    {grass.filter(([x, z, size]) => (x > seam(z)) === raised && seabed(x, z) + size < -.15).map(([x, z, size]) =>
      <Grass key={x} x={x} z={z} size={size} frame={frame}/>)}
  </>;
}

function School({frame, lift, approach, retreat}: {frame: number; lift: number; approach: number; retreat: number}) {
  const colors = ['#e8b071', '#8fc9c1', '#cd9e66'];
  return <>{[0, 1, 2].map(school => <group key={school}>
    {Array.from({length: school === 1 ? 7 : 4}, (_, i) => {
      const direction = school === 1 ? -1 : 1;
      const z = [1.6, -3.4, -.85][school] - i * .35;
      const clearWave = school === 0 ? 3.6*THREE.MathUtils.smoothstep(frame,253,280) : 0;
      const x = [-3.4, 3.2, -4.8][school] + direction * ((frame - 155) * .019 + lift * .62 + i * .37) + retreat + clearWave;
      const waterLevel = THREE.MathUtils.lerp(.65, coastWaterLevel(retreat), Math.max(approach, coastBlend(z)));
      const floor = fishFootprintFloor(x, z, lift);
      const room = THREE.MathUtils.smoothstep(waterLevel - floor, .31, .59);
      if (room <= 0) return null;
      const swimHeight = [-.92, -.29, -1.58][school] + Math.sin(frame * .09 + i * 1.3) * .085 + i * .06;
      const y = THREE.MathUtils.clamp(swimHeight, floor + .15, waterLevel - .15);
      return <group key={i} position={[x, y, z]} rotation={[0, direction < 0 ? Math.PI : 0, Math.sin(frame * .1 + i) * .06]}
        scale={room * (1 + .15 * Math.sin(i * 2)) * (school === 1 ? .76 : 1)}>
        <mesh scale={[.23, .105, .06]}><icosahedronGeometry args={[1, 0]}/><meshStandardMaterial color={colors[school]} flatShading/></mesh>
        <mesh position={[-.2, 0, 0]} rotation={[0, Math.sin(frame * .32 + i) * .55, -Math.PI / 2]} scale={[1, 1, .37]}>
          <coneGeometry args={[.103, .16, 3]}/><meshStandardMaterial color={colors[school]} flatShading/>
        </mesh>
        <mesh position={[.1, .024, .048]} onUpdate={mesh => mesh.layers.set(NOINK)}><sphereGeometry args={[.016, 5, 4]}/><meshBasicMaterial color="#16323a"/></mesh>
      </group>;
    })}
  </group>)}</>;
}

function SuspendedSand({frame, lift, disturbance}: {frame: number; lift: number; disturbance: number}) {
  const geometry = useMemo(() => {
    const dust = new THREE.BufferGeometry();
    dust.setAttribute('position', new THREE.BufferAttribute(new Float32Array(180 * 3), 3).setUsage(THREE.DynamicDrawUsage));
    return dust;
  }, []);
  const points = geometry.getAttribute('position');
  for (let i = 0; i < points.count; i++) {
    const kickedUp = i >= 135;
    const spread = (Math.sin(i * 9.31) * .5 + .5);
    const z = kickedUp ? (Math.sin(i * 3.1) * 4 - 1.2) : 6.3 - (i * .712 % 19);
    const x = kickedUp ? seam(z) + Math.sin(i * 4.5) * (lift + .09) + disturbance * .26 : Math.sin(i * 3.66) * 10;
    const y = kickedUp ? -2.45 + lift * (spread * .9 + .2) : -2.2 + spread * 2.64;
    points.setXYZ(i, x + Math.sin(frame * .026 + i) * .13, y + Math.cos(frame * .06 + i) * .065, z);
  }
  points.needsUpdate = true;
  return <points geometry={geometry} frustumCulled={false} onUpdate={particles => particles.layers.set(NOINK)}>
    <pointsMaterial color="#afe1d7" size={.026} transparent opacity={.53} depthWrite={false}/>
  </points>;
}

export function Underwater({frame, lift, disturbance, drawdown = 0}: {
  frame: number; lift: number; disturbance: number; drawdown?: number;
}) {
  const [left, right] = useMemo(() => [rockShelf(false), rockShelf(true)], []);
  const approach = THREE.MathUtils.smoothstep(frame, 306, 350);
  const retreat = MAX_RETREAT * THREE.MathUtils.clamp(drawdown, 0, 1);
  return <>
    <WaterColumn approach={approach} retreat={retreat}/>
    <directionalLight position={[-6, 9, 4]} color="#a9e5f2" intensity={.68}/>
    <group>
      <mesh geometry={left}><ShelfMaterial frame={frame} retreat={retreat}/></mesh>
      <RockLife raised={false} frame={frame}/>
    </group>
    <group position={[-.42 * lift, lift, 0]}>
      <mesh geometry={right}><ShelfMaterial frame={frame} retreat={retreat}/></mesh>
      <RockLife raised frame={frame}/>
    </group>
    <ShoreRocks retreat={retreat}/>
    <School frame={frame} lift={lift} approach={approach} retreat={retreat}/>
    <SuspendedSand frame={frame} lift={lift} disturbance={disturbance}/>
    <WaterCeiling frame={frame} lift={lift} disturbance={disturbance} approach={approach} retreat={retreat}/>
    <WaterLight frame={frame}/>
  </>;
}
