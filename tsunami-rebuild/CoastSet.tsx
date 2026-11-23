import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {cloudHD, ctex, planksHD, roofHD} from '../upstream/templates/bridge/paint';
import {LOOK} from '../upstream/templates/bridge/lights';
import {twoTone, untone} from '../upstream/templates/bridge/shade';
import {BAY_GLSL, bayOffset, BEACH_SLOPE, SHORE_BASE, shoreX} from './shore';

const profile: [number, number][] = [
  [-48,7],[-22,5],[-12,3.2],[-9,2.7],[-6,1.7],[SHORE_BASE,0],[3,-5*BEACH_SLOPE],[10,-5],
];
const rises = [[-128,0],[-82,.3],[-63,1],[-48,2.8],[-35,3.3],[-27,2.65],[-20,1.5],[-13,.55],[-8,0],[32,0]];
const rowStart = -128;
const rowEnd = 32;
const rowStep = .5;
const terrainRows = Array.from({length:(rowEnd-rowStart)/rowStep+1}, (_,i) => {
  const z = rowStart+i*rowStep;
  const next = rises.findIndex(([edge]) => z < edge);
  const rise = next < 0 ? 0 : THREE.MathUtils.lerp(rises[next-1][1],rises[next][1],
    (z-rises[next-1][0])/(rises[next][0]-rises[next-1][0]));
  return [z,bayOffset(z),rise];
});

function hillVertex([x,y]: [number,number], rise: number) {
  return y + rise * (1 - THREE.MathUtils.smoothstep(x,-14,SHORE_BASE));
}

export function coastHeight(x: number, z = 5.3) {
  const rowCoordinate = (THREE.MathUtils.clamp(z,rowStart,rowEnd)-rowStart)/rowStep;
  const row = Math.min(terrainRows.length-2,Math.floor(rowCoordinate));
  const [,frontShift,frontRise] = terrainRows[row];
  const [,backShift,backRise] = terrainRows[row+1];
  const v = rowCoordinate-row;
  const localX = THREE.MathUtils.clamp(x-THREE.MathUtils.lerp(frontShift,backShift,v),
    profile[0][0],profile[profile.length-1][0]);
  const column = profile.findIndex(([profileX],i) => i>0 && localX<=profileX);
  const left = profile[column-1];
  const right = profile[column];
  const u = (localX-left[0])/(right[0]-left[0]);
  const a = hillVertex(left,frontRise), b = hillVertex(right,frontRise);
  const c = hillVertex(left,backRise), d = hillVertex(right,backRise);
  return u+v <= 1 ? a+(b-a)*u+(c-a)*v : d+(c-d)*(1-u)+(b-d)*(1-v);
}

function sandMap() {
  return ctex('coastSandPaint', 512, 512, (ctx, rand) => {
    ctx.fillStyle = '#e4c999';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1100; i++) {
      ctx.fillStyle = i % 3 ? '#ab845335' : '#fff0ca85';
      ctx.beginPath();
      ctx.ellipse(rand() * 512, rand() * 512, 1 + rand() * 2, .45 + rand(), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = i % 2 ? '#c2a06b26' : '#ffe9b94d';
      ctx.beginPath();
      ctx.ellipse(rand() * 512, rand() * 512, 15 + rand() * 40, 5 + rand() * 11, rand(), 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function groundGeometry() {
  const vertices: number[] = [], uv: number[] = [], indices: number[] = [];
  // Keep the working beach profile exact. The land behind the village
  // continues into one headland and recedes into the horizon.
  for (const [z, point, rise] of terrainRows) {
    for (const pointOnProfile of profile) {
      const [x] = pointOnProfile;
      vertices.push(x+point, hillVertex(pointOnProfile,rise),z);
      uv.push((x+point)/6,z/6);
    }
  }
  const width = profile.length;
  for (let row = 0; row < terrainRows.length - 1; row++) {
    for (let column = 0; column < width - 1; column++) {
      const a = row*width+column;
      indices.push(a,a+width,a+1,a+1,a+width,a+width+1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

const hutLayouts = [
  {x:-4.65,z:-.1,w:1.9,d:1.48,h:.94,lift:.95,body:'#d39862',trim:'#3e8076',roof:'#aa5d43',angle:.06},
  {x:-7.45,z:.6,w:2.05,d:1.6,h:1.08,lift:.88,body:'#eed1a0',trim:'#3c777b',roof:'#735f56',angle:-.16},
  {x:-9.72,z:-1.55,w:2.3,d:1.76,h:1.21,lift:.66,body:'#be875e',trim:'#648f84',roof:'#bc8249',angle:.16},
  {x:-5.4,z:-3.55,w:1.45,d:1.35,h:.85,lift:.67,body:'#cbb289',trim:'#556f60',roof:'#70604f',angle:-.10},
  {x:-8.1,z:-5.15,w:1.65,d:1.35,h:.9,lift:.54,body:'#d5ac6d',trim:'#658982',roof:'#a97860',angle:.16},
];

function CoastHut({layout}: {layout: typeof hutLayouts[number]}) {
  const {x,z,w,d,h,lift,body,trim,roof,angle} = layout;
  const peak = w * .30;
  const slope = Math.hypot(w / 2 + .15, peak);
  const pitch = Math.atan2(peak, w / 2 + .15);
  const timber = planksHD();
  const tiles = roofHD(roof);
  const stairX = w * .24;
  const stairTop = lift + .04;
  const stairStart = d / 2 + .24;
  const stairRun = Math.max(.82, stairTop * 1.27);
  const stairEnd = stairStart + stairRun;
  const base = coastHeight(x,z);
  const localGround = (u: number, v: number) => coastHeight(
    x+Math.cos(angle)*u+Math.sin(angle)*v,
    z-Math.sin(angle)*u+Math.cos(angle)*v,
  )-base;
  const stairGround = (localX: number) => localGround(localX,stairEnd);
  const stairFoot = stairGround(stairX);
  const stairCount = Math.max(3, Math.ceil((stairTop - stairFoot) / .17));
  const treadDepth = stairRun / stairCount;
  const gable = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2,0); shape.lineTo(w / 2,0); shape.lineTo(0,peak); shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [w,peak]);
  useEffect(() => () => gable.dispose(), [gable]);

  return <group position={[x,base,z]} rotation-y={angle}>
    {[-1,1].flatMap(side => [-1,1].map(back => {
      const u = side*w*.39, v = back*d*.36;
      const foot = localGround(u,v)-.12;
      return <mesh key={side+','+back} castShadow receiveShadow position={[u,(foot+lift)/2,v]}>
        <boxGeometry args={[.115,lift-foot,.13]}/>
        <meshStandardMaterial color="#83664b" map={timber}/>
      </mesh>;
    }))}
    <mesh castShadow receiveShadow position={[0,lift-.02,.08]}>
      <boxGeometry args={[w+.16,.12,d+.37]}/>
      <meshStandardMaterial color="#c9a572" map={timber}/>
    </mesh>
    <mesh castShadow receiveShadow position={[0,lift+h/2,0]}>
      <boxGeometry args={[w,h,d]}/>
      <meshStandardMaterial color={body} map={timber}/>
    </mesh>
    {[-1,1].map(side =>
      <mesh key={side} geometry={gable} receiveShadow position={[0,lift+h,side*d*.501]} rotation-y={side===1 ? 0 : Math.PI}>
        <meshStandardMaterial color={body} map={timber}/>
      </mesh>
    )}
    {[-1,1].map(side =>
      <mesh key={side} castShadow receiveShadow position={[side*(w/4+.065),lift+h+peak*.49+.025,0]} rotation-z={-side*pitch}>
        <boxGeometry args={[slope,.095,d+.36]}/>
        <meshStandardMaterial color="#d6b197" map={tiles}/>
      </mesh>
    )}
    <mesh castShadow position={[0,lift+h+peak+.048,0]}>
      <boxGeometry args={[.095,.1,d+.43]}/><meshStandardMaterial color={roof}/>
    </mesh>
    <mesh position={[-w*.22,lift+h*.53,d/2+.022]}>
      <boxGeometry args={[w*.25,h*.4,.05]}/><meshStandardMaterial color="#e6d8ae"/>
    </mesh>
    <mesh position={[-w*.22,lift+h*.53,d/2+.05]}>
      <boxGeometry args={[w*.195,h*.31,.025]}/><meshStandardMaterial color={trim}/>
    </mesh>
    <mesh position={[-w*.22,lift+h*.53,d/2+.069]}>
      <boxGeometry args={[.025,h*.31,.023]}/><meshStandardMaterial color="#d6c39e"/>
    </mesh>
    <mesh position={[w*.24,lift+h*.37,d/2+.02]}>
      <boxGeometry args={[w*.24,h*.75,.035]}/><meshStandardMaterial color="#735947" map={timber}/>
    </mesh>
    {[-.19,.19].map(side => {
      const foot = stairGround(stairX + side) - .045;
      const top = stairTop - .135;
      const drop = top - foot;
      return <mesh key={side} castShadow receiveShadow
        position={[stairX + side,(top+foot)/2,(stairStart+stairEnd)/2]}
        rotation-x={-Math.atan2(stairRun,drop)}>
        <boxGeometry args={[.08,Math.hypot(stairRun,drop)+.12,.15]}/>
        <meshStandardMaterial color="#856247" map={timber}/>
      </mesh>;
    })}
    {Array.from({length:stairCount}, (_,i) => {
      const top = THREE.MathUtils.lerp(stairTop,stairFoot,(i+1)/(stairCount+1));
      return <mesh key={i} castShadow receiveShadow position={[stairX,top-.037,stairStart+(i+.5)*treadDepth]}>
        <boxGeometry args={[.52,.074,treadDepth+.025]}/><meshStandardMaterial color="#c19a67" map={timber}/>
      </mesh>;
    })}
  </group>;
}

function Palm({x,z,scale=1,inklessLayer}: {x:number;z:number;scale?:number;inklessLayer?:number}) {
  const frond = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      0,0,0, .45,.14,-.15, .55,.25,0, .45,.14,.15,
      .96,.09,-.10, 1.13,.14,0, .96,.09,.10, 1.45,-.22,0,
    ],3));
    g.setIndex([0,1,2,0,2,3,1,4,5,1,5,2,2,5,6,2,6,3,4,7,5,5,7,6]);
    g.computeVertexNormals();
    return g;
  },[]);
  useEffect(() => () => frond.dispose(), [frond]);
  const far = inklessLayer !== undefined;
  const footY = coastHeight(x,z);
  return <group position={[x,footY-.02,z]} scale={scale}>
    <mesh castShadow={!far} receiveShadow={!far} position={[.16,1.24,0]} rotation-z={-.126}
      onUpdate={mesh => { if (far) mesh.layers.set(inklessLayer); }}>
      <cylinderGeometry args={[.065,.135,2.5,8]}/>
      <meshStandardMaterial map={planksHD()} color={far ? '#9a927c' : '#9d754e'}/>
    </mesh>
    {Array.from({length:7}, (_,i) =>
      <mesh key={i} geometry={frond} position={[.31,2.46,0]} rotation={[.09*Math.sin(i),i*Math.PI*2/7, .08*Math.cos(i*2)]}
        castShadow={!far} onUpdate={mesh => { if (far) mesh.layers.set(inklessLayer); }}>
        <meshStandardMaterial color={far ? '#71866b' : i%2 ? '#75a244' : '#3f7543'} side={THREE.DoubleSide}/>
      </mesh>
    )}
  </group>;
}

const distantHuts = [
  [-10.1,-15.3,1.65,.06],[-7.25,-17.35,1.4,-.13],
  [-13.6,-25.1,1.78,-.17],[-10.3,-28.7,1.55,.12],
];
const distantPalms = [
  [-11.6,-14.3,1.08],[-8.3,-18.9,.95],[-6.35,-16.3,.81],
  [-15.1,-26.1,1.13],[-12.05,-29.3,.93],[-9.2,-30.8,.88],
];

function HeadlandVillage({inklessLayer}: {inklessLayer:number}) {
  const gable = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-.58,0); shape.lineTo(.58,0); shape.lineTo(0,.43); shape.closePath();
    return new THREE.ExtrudeGeometry(shape,{depth:1.1,bevelEnabled:false}).translate(0,0,-.55);
  },[]);
  useEffect(() => () => gable.dispose(),[gable]);
  return <>
    {distantHuts.map(([x,z,size,turn],i) => <group key={x} position={[x,coastHeight(x,z),z]}
      scale={size} rotation-y={turn}>
      <mesh position={[0,.31,0]} onUpdate={mesh => mesh.layers.set(inklessLayer)}>
        <boxGeometry args={[1,.82,.92]}/>
        <meshStandardMaterial color={i%2 ? '#b8a998' : '#baaa90'} map={planksHD()}/>
      </mesh>
      <mesh position-y={.72} geometry={gable} onUpdate={mesh => mesh.layers.set(inklessLayer)}>
        <meshStandardMaterial color={i%2 ? '#97877b' : '#9c8174'}/>
      </mesh>
    </group>)}
    {distantPalms.map(([x,z,scale]) => <Palm key={x} x={x} z={z} scale={scale} inklessLayer={inklessLayer}/>)}
  </>;
}

function FishingLanding() {
  const z=-3.15, x=shoreX(z)-.12;
  const base=coastHeight(x,z)+.07;
  const postTop=.292;
  const timber=planksHD();
  return <group position={[x,base,z]}>
    {[-.66,.66].flatMap(localX => [-.53,.53].map(localZ => {
      // The offshore cutaway blends this side of the beach into a lower seabed.
      const embed=localX>0 ? .24 : .08;
      const postBottom=coastHeight(x+localX,z+localZ)-base-embed;
      return <mesh key={localX+','+localZ} position={[localX,(postTop+postBottom)/2,localZ]} castShadow receiveShadow>
        <cylinderGeometry args={[.061,.085,postTop-postBottom,7]}/>
        <meshStandardMaterial color="#815638" map={timber}/>
      </mesh>;
    }))}
    {Array.from({length:8},(_,i) =>
      <mesh key={i} position={[-.73+i*.205,.32,0]} castShadow receiveShadow>
        <boxGeometry args={[.193,.073,1.27]}/>
        <meshStandardMaterial color={i%3 ? '#b68c5b' : '#cba977'} map={timber}/>
      </mesh>
    )}
    <mesh position={[-.48,.47,-.27]} rotation-y={.21} castShadow receiveShadow>
      <boxGeometry args={[.38,.235,.36]}/>
      <meshStandardMaterial color="#829285" map={timber}/>
    </mesh>
    <mesh position={[-.39,.378,.3]} rotation-x={-Math.PI/2}>
      <torusGeometry args={[.16,.027,6,20]}/>
      <meshStandardMaterial color="#cda166"/>
    </mesh>
  </group>;
}

const shoreRocks = [
  [-1.46,6.15,.23,1.2],[-1.69,6.43,.12,-.7],[-1.41,6.53,.09,.4],[-1.13,6.07,.085,.8],
  [-2.82,3.84,.17,1.6],[-2.72,3.56,.09,-.4],[-2.99,3.65,.08,.1],
  [-3.21,-1.2,.24,.4],[-3.17,-.94,.11,1.9],[-3.42,-1.32,.12,-.2],
  [-1.56,-3.56,.28,-.3],[-2.12,5.92,.11,1.7],[-2.32,6.12,.12,.5],
  [-2.38,7.57,.19,.8],[-2.18,7.82,.10,-.4],[-2.56,7.62,.08,.4],
  [-6.53,9.92,.24,.4],[-6.67,10.17,.14,-.5],[-6.29,9.71,.08,-.8],
  [-3.98,12.15,.20,-.7],[-3.68,12.41,.10,.2],[-3.91,11.89,.075,.9],
];

const grassClumps = [
  [-6.87,8.87,1.02,.2],[-6.73,9.82,.82,2.2],[-7.00,10.04,1.25,1.2],
  [-6.37,10.49,.57,2.8],[-6.23,11.03,.42,-.7],
  [-4.20,12.18,.82,1.2],[-3.60,12.55,.52,-.9],[-3.52,12.73,.33,2.7],
];

function BeachForeground({inklessLayer}: {inklessLayer:number}) {
  const grass = useMemo(() => {
    const vertices: number[] = [], colors: number[] = [];
    const shades = ['#676c41','#828154','#9c945f','#6f7548'].map(color => new THREE.Color(color));
    for (let i = 0; i < 19; i++) {
      const angle = i*2.4;
      const spread = (i%7)*.012;
      const dx = Math.cos(angle), dz = Math.sin(angle);
      const h = .24 + .07*Math.cos(i*1.73);
      const w = .013 + .006*Math.sin(i*.93);
      const tip = .11 + .05*Math.sin(i*1.67);
      const x = dx*spread, z = dz*spread;
      vertices.push(x-dz*w,0,z+dx*w, x+dz*w,0,z-dx*w, x+dx*tip,h,z+dz*tip);
      for (let k=0;k<3;k++) colors.push(...shades[(i+k)%shades.length].toArray());
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.computeVertexNormals();
    return geometry;
  },[]);
  useEffect(() => () => grass.dispose(), [grass]);
  const woodCenter = new THREE.Vector3(-3.61,coastHeight(-3.61,12.19)+.054,12.19);
  const woodDirection = new THREE.Vector3(.39,-.166,-.26).normalize();
  const woodRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),woodDirection);
  return <>
    {grassClumps.map(([x,z,size,turn]) =>
      <mesh key={`${x},${z}`} geometry={grass} position={[x,coastHeight(x,z)-.025,z]}
        rotation-y={turn} scale={size} receiveShadow onUpdate={mesh => mesh.layers.set(inklessLayer)}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={1}/>
      </mesh>
    )}
    <mesh position={woodCenter} quaternion={woodRotation} castShadow receiveShadow>
      <cylinderGeometry args={[.033,.068,.94,7]}/>
      <meshStandardMaterial color="#8f7758" map={planksHD()} flatShading/>
    </mesh>
  </>;
}

export function ShoreRocks() {
  return <>{shoreRocks.map(([x,z,size,turn],i) =>
      <mesh key={`${x},${z}`} position={[x,coastHeight(x,z)+size*.36,z]}
        scale={[size*1.23,size*.82,size]} rotation={[.12,turn,.18]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1,0]}/>
        <meshStandardMaterial color={['#807566','#a48c72','#c7a588'][i%3]} roughness={.96} flatShading/>
      </mesh>
    )}</>;
}

function BeachDetails({frame,inklessLayer}: {frame:number;inklessLayer:number}) {
  const crabX = -2.48 + .08 * Math.sin(frame*.077);
  const crabZ = 6.74 + .22 * Math.sin(frame*.045);
  const crabColor = '#b85039';
  return <>
    <BeachForeground inklessLayer={inklessLayer}/>
    <ShoreRocks/>
    <group position={[crabX,coastHeight(crabX,crabZ)+.071,crabZ]} rotation-y={.35} scale={.82}>
      <mesh scale={[.129,.072,.094]} castShadow>
        <dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={crabColor} flatShading/>
      </mesh>
      {[-1,1].map(side => <group key={side}>
        {[0,1,2].map(i => <group key={i} position={[side*.105,-.021,.04-i*.044]}
          rotation-y={side*(i*.26-.29+.26*Math.sin(frame*.37+i+side))}>
          <mesh position={[side*.046,-.012,0]} rotation-z={-side*.28}>
            <boxGeometry args={[.102,.017,.017]}/><meshStandardMaterial color="#873c2b"/>
          </mesh>
        </group>)}
        <mesh position={[side*.127,.026,.095]} rotation-y={side*.38} scale={[.064,.036,.051]} castShadow>
          <dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#cb6849" flatShading/>
        </mesh>
        <mesh position={[side*.05,.059,.068]}>
          <sphereGeometry args={[.014,6,4]}/><meshStandardMaterial color="#2c201b"/>
        </mesh>
      </group>)}
    </group>
  </>;
}

const daySky = LOOK.day.sky.c.map(color => untone(color));
const goldenSky = LOOK.golden.sky.c.map(color => untone(color));
const clouds = [[-23,9,-36,17],[-4,8.2,-32,12],[14,11,-37,18],[31,7,-39,15],[11,19,-40,18]];

export function CoastSet({retreat=0, inklessLayer=3, frame=0, sunset=0}: {
  retreat?:number; inklessLayer?:number; frame?:number; sunset?:number;
}) {
  const terrain = useMemo(groundGeometry, []);
  const wet = useMemo(() => ({value:0}), []);
  const goldenMix = useMemo(() => ({value:0}), []);
  wet.value = retreat;
  goldenMix.value = THREE.MathUtils.clamp(sunset,0,1);
  const ground = useMemo(() => {
    const mat = twoTone(new THREE.MeshLambertMaterial({map:sandMap()}));
    const compile = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.exposedWidth = wet;
      shader.vertexShader = 'varying vec3 coastPoint;\n' + shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ncoastPoint = position;');
      shader.fragmentShader = `
        varying vec3 coastPoint;
        uniform float exposedWidth;
        ${BAY_GLSL}
        float trackDistance(vec2 point, vec2 start, vec2 end) {
          vec2 span = end - start;
          float along = clamp(dot(point - start,span)/dot(span,span),0.0,1.0);
          return length(point-start-along*span);
        }
      ` + shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec3 p = coastPoint;
        float oldWaterline = bayShore(p.z,0.);
        float newWaterline = bayShore(p.z,exposedWidth);
        float inland = oldWaterline-p.x;
        float scrub = smoothstep(6.5,22.0,-p.z + 2.0*sin(.58*p.x))
          * smoothstep(.45,2.9,inland + .45*sin(p.z*.64));
        float hillPatch = .5+.5*sin(.59*p.x+1.1*sin(.48*p.z));
        vec3 green = mix(vec3(.14,.225,.105),vec3(.27,.37,.175),hillPatch);
        diffuseColor.rgb = mix(diffuseColor.rgb, green, scrub);
        vec2 foot = p.xz + .09*vec2(sin(2.4*p.z),sin(1.9*p.x));
        float mainTrack = trackDistance(foot,vec2(bayShore(-7.1,0.)-.9,-7.1),vec2(-3.65,-4.0));
        mainTrack = min(mainTrack,trackDistance(foot,vec2(-3.65,-4.0),vec2(-3.5,2.6)));
        mainTrack = min(mainTrack,trackDistance(foot,vec2(-3.5,2.6),vec2(-4.2,5.25)));
        mainTrack = min(mainTrack,trackDistance(foot,vec2(-4.2,5.25),vec2(-13.7,5.2)));
        float spur = trackDistance(foot,vec2(-3.5,2.1),vec2(-4.06,2.10));
        spur = min(spur,trackDistance(foot,vec2(-7.35,5.25),vec2(-7.32,2.86)));
        spur = min(spur,trackDistance(foot,vec2(-7.32,2.86),vec2(-8.85,.35)));
        spur = min(spur,trackDistance(foot,vec2(-3.5,-2.0),vec2(-5.23,-1.70)));
        spur = min(spur,trackDistance(foot,vec2(-5.23,-1.70),vec2(-7.43,-3.50)));
        float path = max(1.0-smoothstep(.33,.68,mainTrack),.68*(1.0-smoothstep(.16,.43,spur)));
        path *= smoothstep(-13.9,-12.6,p.x);
        diffuseColor.rgb *= mix(vec3(1.0),vec3(.75,.63,.49),path*.87);
        float sandWet = smoothstep(oldWaterline-.16,oldWaterline+.18,p.x)
          * (1.0-smoothstep(newWaterline-.035,newWaterline+.12,p.x))
          * smoothstep(.025,.22,exposedWidth);
        float dampLip = 1.0-smoothstep(.045,.32,abs(p.x-newWaterline));
        float darkWet = max(sandWet,.55*dampLip);
        diffuseColor.rgb *= mix(vec3(1.),vec3(.58,.54,.47),darkWet);
      `);
    };
    mat.customProgramCacheKey = () => 'bridgeCoastBayV7';
    return mat;
  },[wet]);
  const sky = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      colors: {value:daySky.map(color => color.clone())},
      elevations: {value:new THREE.Vector4()},
    },
    vertexShader: 'varying vec3 worldRay; void main(){worldRay=(modelMatrix*vec4(position,1.0)).xyz-cameraPosition; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `
      varying vec3 worldRay;
      uniform vec3 colors[5];
      uniform vec4 elevations;
      void main() {
        float el = asin(clamp(normalize(worldRay).y,-1.,1.));
        vec3 color = mix(colors[0],colors[1],smoothstep(0.,elevations.x,el));
        color = mix(color,colors[2],smoothstep(elevations.x,elevations.y,el));
        color = mix(color,colors[3],smoothstep(elevations.y,elevations.z,el));
        color = mix(color,colors[4],smoothstep(elevations.z,elevations.w,el));
        gl_FragColor = vec4(color,1.);
      }
    `,
    side: THREE.BackSide, depthWrite:false, fog:false,
  }),[]);
  const warm = goldenMix.value;
  const elevation = (i:number) => THREE.MathUtils.degToRad(THREE.MathUtils.lerp(LOOK.day.sky.e[i],LOOK.golden.sky.e[i],warm));
  sky.uniforms.elevations.value.set(elevation(1),elevation(2),elevation(3),elevation(4));
  sky.uniforms.colors.value.forEach((color:THREE.Color,i:number) => color.copy(daySky[i]).lerp(goldenSky[i],warm));
  const cloudMaterials = useMemo(() => clouds.map((_,i) => {
    const day = cloudHD(i+1,LOOK.day.cloud);
    const golden = cloudHD(i+1,LOOK.golden.cloud);
    const material = new THREE.MeshBasicMaterial({map:day,transparent:true,depthWrite:false,fog:false});
    material.onBeforeCompile = shader => {
      shader.uniforms.goldenCloud = {value:golden};
      shader.uniforms.goldenMix = goldenMix;
      shader.fragmentShader = 'uniform sampler2D goldenCloud; uniform float goldenMix;\n'
        + shader.fragmentShader.replace('#include <map_fragment>',`
          #include <map_fragment>
          diffuseColor = mix(diffuseColor,texture2D(goldenCloud,vMapUv),goldenMix);
        `);
    };
    return material;
  }),[goldenMix]);
  useEffect(() => () => {
    terrain.dispose(); ground.dispose(); sky.dispose();
    cloudMaterials.forEach(material => material.dispose());
  }, [terrain,ground,sky,cloudMaterials]);

  return <group>
    <mesh material={sky} renderOrder={-10} frustumCulled={false} onUpdate={mesh => mesh.layers.set(inklessLayer)}>
      <sphereGeometry args={[58,40,20]}/>
    </mesh>
    <mesh geometry={terrain} material={ground} receiveShadow onUpdate={mesh => mesh.layers.set(inklessLayer)}/>
    {clouds.map(([x,y,z,width],i) =>
      <mesh key={x} position={[x,y,z]} material={cloudMaterials[i]} onUpdate={mesh => mesh.layers.set(inklessLayer)}>
        <planeGeometry args={[width,width/2]}/>
      </mesh>
    )}
    <BeachDetails frame={frame} inklessLayer={inklessLayer}/>
    <CoastStructures/>
    <HeadlandVillage inklessLayer={inklessLayer}/>
  </group>;
}

export function CoastStructures() {
  return <>
    {hutLayouts.map(layout => <CoastHut key={layout.x} layout={layout}/>)}
    <Palm x={-3.16} z={-1.96} scale={.86}/>
    <Palm x={-11.6} z={1.4} scale={1.14}/>
    <Palm x={-12.9} z={-5.4} scale={.9}/>
    <Palm x={-8.7} z={-8.8} scale={.72}/>
    <FishingLanding/>
    <group position={[-2.64,coastHeight(-2.64,2.15)-.03,2.15]}>
      <mesh castShadow receiveShadow position-y={.56}>
        <cylinderGeometry args={[.071,.11,1.2,9]}/>
        <meshStandardMaterial color="#947458" map={planksHD()}/>
      </mesh>
      {[.59,.64,.69].map(y =>
        <mesh key={y} position-y={y} rotation-x={Math.PI/2}>
          <torusGeometry args={[.095,.019,6,19]}/><meshStandardMaterial color="#cab083"/>
        </mesh>
      )}
    </group>
    {[[-4.15,1.9],[-4.9,1.95],[-7.2,2.35]].map(([x,z],i)=>
      <mesh key={x} position={[x,coastHeight(x,z)+.11,z]} rotation-y={.2+i*.3} castShadow receiveShadow>
        <boxGeometry args={[.41,.36,.32]}/><meshStandardMaterial color={i===1 ? '#86998a' : '#c5a170'} map={planksHD()}/>
      </mesh>
    )}
  </>;
}



