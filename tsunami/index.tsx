import React, {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree, useFrame} from '@react-three/fiber';
import {EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode} from 'postprocessing';

import {AbsoluteFill, Audio, Composition, registerRoot, staticFile, useCurrentFrame, getInputProps, interpolate} from 'remotion';
import {InkPass, NOINK} from './ink';
import {LensBlur} from './lensblur';
import {Pen, bodyFront, PARENT} from '../upstream/templates/bridge/toon';
import {GradeEffect, GRADES} from '../upstream/templates/bridge/grade';
import {grassHD, cloudHD, planksHD, roofHD} from '../upstream/templates/bridge/paint';
import {Bangka} from './bangka';
import {FaultModel} from './fault-model';
import {coastMaterial, seaMaterial} from './surfaces';
import {cameraAt, disturbanceAt, FAULT, foregroundAt, frames, personAt, shotAt, track} from './story';

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

function terrain(points: number[][]) {
  const shape = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2(x,y)));
  return new THREE.ExtrudeGeometry(shape, {depth: 48, bevelEnabled: false});
}

function MotionArrow({color, direction, position, progress, camera}: {
  color: string; direction: number; position: [number,number,number]; progress: number; camera: THREE.Camera;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    [[128,20],[223,117],[165,117],[165,228],[91,228],[91,117],[33,117]].forEach(([x,y],i) => {
      if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 11;
    ctx.strokeStyle = '#111111';
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [color]);
  useEffect(() => () => texture.dispose(), [texture]);
  const scale = .65 + .35*Math.min(1,progress*6) + .12*Math.sin(progress*Math.PI);
  return <group position={position} quaternion={camera.quaternion} scale={scale*.76}>
    <mesh rotation-z={direction} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <planeGeometry args={[1.85,1.85]}/>
      <meshBasicMaterial map={texture} transparent opacity={Math.min(1,progress*12,(1-progress)*12)} depthWrite={false}/>
    </mesh>
  </group>;
}

function Scene() {
  const f = useCurrentFrame();
  const {scene, camera, gl, size} = useThree();
  const ink = useMemo(() => new InkPass(scene, camera as THREE.PerspectiveCamera), [scene, camera]);
  const tone = useMemo(() => new ToneMappingEffect({mode: ToneMappingMode.NEUTRAL}), []);
  const grade = useMemo(() => new GradeEffect(GRADES.day, .48), []);
  const lens = useMemo(() => new LensBlur({maxCoC: 5}), []);
  const composer = useMemo(() => {
    const pipeline = new EffectComposer(gl);
    pipeline.addPass(new RenderPass(scene, camera));
    pipeline.addPass(ink);
    pipeline.addPass(new EffectPass(camera, lens.pre));
    pipeline.addPass(new EffectPass(camera, lens.main, tone, grade));
    pipeline.setSize(size.width, size.height);
    return pipeline;
  }, [gl, scene, camera, ink, lens, tone, grade, size.width, size.height]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => {
    if (getInputProps().ink === false) gl.render(scene, camera);
    else composer.render();
  }, 1);
  const land = useMemo(() => terrain([[-65,-12],[-65,8],[-24,6],[-15,3],[-9,3],[-6,1.7],[-2,0],[3,-2.5],[3,-12]]), []);
  const bed = useMemo(() => terrain([[3,-12],[3,-2.5],[13,-3.6],[36,-6],[110,-8],[110,-12]]), []);
  const water = useMemo(() => new THREE.PlaneGeometry(112, 48, 80, 20).rotateX(-Math.PI/2), []);
  const sand = useMemo(() => coastMaterial("sand"), []);
  const rock = useMemo(() => coastMaterial("rock"), []);
  useEffect(() => () => {sand.material.dispose(); rock.material.dispose();}, [sand, rock]);
  const sea = useMemo(seaMaterial, []);
  useEffect(() => () => sea.material.dispose(), [sea]);
  sea.time.value = f/30;
  const retreat = track(f, [0,0,0,0,2.4,2.4,2.4]);
  const lift = interpolate(f,[FAULT.start,FAULT.end],[0,1.15],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  sand.shore.value = -2+retreat;
  const seaLevel = -.5*retreat;
  const grounded = Math.min(1, retreat/.78);
  sea.contact.value = 1-grounded;
  const wave = interpolate(f,[257,400,527],[3,1,-.5],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const vertices = water.attributes.position;
  if (!water.hasAttribute('color')) {
    water.setAttribute('color',new THREE.BufferAttribute(new Float32Array(vertices.count*3),3));
  }
  const colors = water.attributes.color;
  const shallow = new THREE.Color('#71bbb3');
  const deep = new THREE.Color('#246f9b');
  const tint = new THREE.Color();
  for (let i = 0; i < vertices.count; i++) {
    const u = (i % 81) / 80;
    const x = u*u * (112-retreat) - 2 + retreat;
    const dip = -.35 * Math.exp(-Math.pow((x-wave)/1.6,2));
    const swell = lift*.65*Math.exp(-Math.pow((x-wave)/1.45,2));
    tint.copy(shallow).lerp(deep,1-Math.exp(-(x+2-retreat)/5));
    colors.setXYZ(i,tint.r,tint.g,tint.b);
    vertices.setXYZ(i, x, seaLevel + (dip+swell) * Math.min(1,(x+2-retreat)), -28 + Math.floor(i/81)*2.4);
  }
  vertices.needsUpdate = true;
  colors.needsUpdate = true;
  water.computeVertexNormals();
  const [personX,personY] = personAt(f);
  const cutaway = shotAt(f) === 2;
  const shot = cameraAt(f);
  const target = new THREE.Vector3(...shot.look);
  camera.position.set(...shot.position);
  camera.layers.enable(NOINK);
  const perspective = camera as THREE.PerspectiveCamera;
  perspective.fov = shot.fov;
  perspective.updateProjectionMatrix();
  camera.lookAt(target);
  camera.rotateZ(shot.roll);
  camera.updateMatrixWorld();
  lens.focus = new THREE.Vector3(...shot.focus).sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3()));
  lens.cInf = cutaway ? 0 : shot.blur*.42;
  const card = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 1000;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return {canvas, texture};
  }, []);
  const context = card.canvas.getContext('2d')!;
  context.clearRect(0, 0, 600, 1000);
  bodyFront(new Pen(context), {...PARENT, jacket:'#ef7744'}, {
    mode: f > 555 ? 'stroll' : 'stand', phase: (-3-personX)/1.08, facing: f > 552 ? -1 : f > 547 ? 0 : 1,
    look: f < 82 ? .65 : 0,
    headTilt: f < 82 ? .035*Math.sin(f*.075) : 0,
    expr: f >= 539 && f < 552 ? 'shock' : f >= 552 && f < 590 ? 'nervous' : 'neutral',
  });
  card.texture.needsUpdate = true;
  if (cutaway) {
    const rise = lift*.76;
    const travel = disturbanceAt(f);
    return <>
      <color attach="background" args={['#bddde3']}/>
      <hemisphereLight args={['#dbf4ff','#6d4e67',1.5]}/>
      <directionalLight color="#ffedd1" intensity={2.6} position={[-4,7,5]}/>
      <FaultModel lift={rise} disturbance={travel}/>
      {f >= 225 && f < 301 && getInputProps().arrows !== false && <MotionArrow color="#ffc043" direction={0}
        position={[1.6,-1.13+rise,1.7]} progress={(f-225)/76} camera={camera}/>}
      {f >= 254 && f < 347 && getInputProps().arrows !== false && <MotionArrow color="#99edf4" direction={Math.PI/2}
        position={[travel+.55,1.18,1.55]} progress={(f-254)/93} camera={camera}/>}
    </>;
  }
  return <>
    <color attach="background" args={['#a3d8ef']}/>
    <fog attach="fog" args={['#b4dce8',19,60]}/>
    {[[9,-20,6,2.8],[15,-24,7,4.2],[22,-27,8,3.4],[34,-28,9,4.6]].map(([ix,iz,sx,sy],i) =>
      <mesh key={ix} position={[ix,-1.1,iz]} scale={[sx,sy,3.2]} onUpdate={mesh => mesh.layers.set(NOINK)}>
        <sphereGeometry args={[1,22,12]}/><meshStandardMaterial color={i%2 ? '#588b77' : '#6b9c86'}/>
      </mesh>
    )}
    {[[-15,3,-16,8,2.6],[-8,1.9,-18,7,2.5],[-2,1.0,-21,8,2.25],[5,.25,-26,9,2.05]].map(([x,y,z,width,height],i)=>
      <mesh key={x} position={[x,y,z]} scale={[width,height,4.8]} onUpdate={mesh=>mesh.layers.set(NOINK)}>
        <sphereGeometry args={[1,19,10]}/><meshStandardMaterial color={i%2 ? '#739888' : '#578576'}/>
      </mesh>
    )}
    <hemisphereLight args={["#d6ecff","#77738f",.8]}/>
    <directionalLight castShadow position={[-8,9,3]} color="#fff0d2" intensity={2.35} shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={18} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-far={65} shadow-normalBias={.035}/>
    {[[-9.8,3,3.8,1],[-6.2,1.8,1.4,1.02],[-4.2,.95,.65,.81],[-2.8,.34,.65,.62],[-7,2.13,-2.9,.90],[-10.4,3,-1.8,1.02],[-12.4,3,1.0,1.1],[-15.4,3.13,-4,1.18],[-8.1,2.61,-6,1.08],[-5.1,1.32,-4.3,.83]].map(([hx,hy,hz,scale],i) => (
    <group key={i} position={[hx,hy,hz]} scale={scale}>
      {[-1,1].flatMap(x => [-1,1].map(z => <mesh key={x+','+z} position={[x*.65,.48,z*.48]}>
        <boxGeometry args={[.11,.96,.11]}/><meshStandardMaterial color="#7a4b32" map={planksHD()}/>
      </mesh>))}
      <mesh castShadow position-y={1.35}><boxGeometry args={[1.7,1.02,1.22]}/><meshStandardMaterial color={i%2 ? "#eb9e63" : "#ffd58c"} map={planksHD()}/></mesh>
      <mesh position={[.28,1.35,.62]}><boxGeometry args={[.53,.55,.035]}/><meshStandardMaterial color="#426469"/></mesh>
      <mesh castShadow position={[0,1.96,0]} rotation-y={Math.PI/4}>
        <coneGeometry args={[1.36,.66,4]}/><meshStandardMaterial color="#bc7541" map={roofHD('#bc7541')}/>
      </mesh>
    </group>
    ))}
    <mesh receiveShadow geometry={land} position-z={-28}><primitive object={sand.material} attach="material"/></mesh>
    <mesh geometry={bed} position={[0,lift,-28]}><primitive object={rock.material} attach="material"/></mesh>
    <mesh geometry={water} frustumCulled={false}>
      <primitive object={sea.material} attach="material"/>
    </mesh>
    <mesh position={[personX,personY+.015,5.3]} rotation={[-Math.PI/2,0,-.39]} scale={[.25,.16,1]} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <circleGeometry args={[1,24]}/><meshBasicMaterial color="#4b435f" transparent opacity={.30} depthWrite={false}/>
    </mesh>
    <mesh onUpdate={mesh => mesh.layers.set(NOINK)} position={[personX,personY+.83,5.3]} quaternion={camera.quaternion}>
      <planeGeometry args={[1.02,1.7]}/>
      <meshBasicMaterial map={card.texture} alphaTest={.45} side={THREE.DoubleSide}/>
    </mesh>
    <mesh position={[-12,3.02,3.5]} rotation-x={-Math.PI/2}>
      <planeGeometry args={[6,7]}/><meshStandardMaterial color="#8abe55" map={grassHD()}/>
    </mesh>
    {[-5.5,-4.7,-3.9].map((px,i) => <group key={px} position={[px,(-2-px)*.425,6.65]}>
      <mesh position-y={.43} rotation-z={i%2 ? .08 : -.08}>
        <cylinderGeometry args={[.075,.11,.86,7]}/><meshStandardMaterial color="#8e5e3c" map={planksHD()}/>
      </mesh>
    </group>)}
    <mesh position={[-4.7,1.48,6.65]} rotation-z={-.39}>
      <cylinderGeometry args={[.023,.023,1.76,6]}/><meshStandardMaterial color="#b58b58"/>
    </mesh>
    {Array.from({length:14},(_,i) => {
      const px = -3.25-i*.43;
      const py = px < -6 ? 1.7+(-6-px)*.43 : (-2-px)*.425;
      return <mesh key={i} position={[px,py+.025,5.25+.12*Math.sin(i*.8)]} rotation-z={-.4}>
        <sphereGeometry args={[1,9,5]}/><meshStandardMaterial color={i%2 ? "#c69d70" : "#dab48b"}/>
      </mesh>;
    }).map((node,i) => React.cloneElement(node,{scale:[.19,.04,.34+i%2*.08]}))}
    {Array.from({length:12},(_,i) => {
      const x = -3.65-i*.38;
      const y = (-2-x)*.425;
      return <mesh key={i} position={[x,y+.055,5.3]}>
        <boxGeometry args={[.39,.14,1.05]}/>
        <meshStandardMaterial color="#b98a57" map={planksHD()}/>
      </mesh>;
    })}
    {[-4.1,-5.25,-6.4,-7.55].map(x => <mesh key={x} position={[x,(-2-x)*.425+.35,5.9]}>
      <cylinderGeometry args={[.045,.06,.7,7]}/>
      <meshStandardMaterial color="#8e6240" map={planksHD()}/>
    </mesh>)}
    {foregroundAt(f).uphillRail && <mesh position={[-5.82,2.2,5.9]} rotation-z={-1.17}>
      <cylinderGeometry args={[.028,.028,3.75,7]}/>
      <meshStandardMaterial color="#bb9566"/>
    </mesh>}
    {[[-3.9,.97,2.4],[-5.3,1.46,2.9],[-6.4,1.93,.8]].map(([gx,gy,gz],i) =>
      <group key={i} position={[gx,gy,gz]}>
        <mesh position={[0,.17,0]} rotation-y={i*.35}>
          <boxGeometry args={[.55,.34,.45]}/><meshStandardMaterial color="#9c713d" map={planksHD()}/>
        </mesh>
        <mesh position={[.38,.11,.15]} rotation-x={Math.PI/2}>
          <torusGeometry args={[.16,.04,7,24]}/><meshStandardMaterial color="#c4a473"/>
        </mesh>
      </group>
    )}
    <group position={[-2.75,.26,3.6]}>
      <mesh position-y={.36}>
        <cylinderGeometry args={[.09,.12,.9,8]}/><meshStandardMaterial color="#805532" map={planksHD()}/>
      </mesh>
      {[.49,.55,.61].map(y => <mesh key={y} position-y={y} rotation-x={Math.PI/2}>
        <torusGeometry args={[.108,.022,6,18]}/><meshStandardMaterial color="#c2a06c"/>
      </mesh>)}
      <mesh position={[-.38,.09,-.26]}>
        <boxGeometry args={[.62,.16,.63]}/><meshStandardMaterial color="#97744e" map={planksHD()}/>
      </mesh>
    </group>
    {grounded > 0 && <mesh position={[-.59,-.68,4.75]} rotation={[-Math.PI/2,0,-.45]} scale={[1.22,.44,1]} onUpdate={mesh => mesh.layers.set(NOINK)}>
      <circleGeometry args={[1,28]}/><meshBasicMaterial color="#493326" transparent opacity={grounded*.24} depthWrite={false}/>
    </mesh>}
    <Bangka height={.16-.38*grounded} grounded={grounded} frame={f} seaLevel={seaLevel}/>
    {Array.from({length:54},(_,i) => {
      const z = -27+i*.87;
      const wash = .04 + .045*Math.sin(i*1.67+f*.09);
      return <mesh key={i} position={[-2+retreat+wash,seaLevel+.025,z]}
        scale={[.035+wash*.45,.018,.46]} onUpdate={mesh => mesh.layers.set(NOINK)}>
        <sphereGeometry args={[1,7,4]}/><meshBasicMaterial color={i%3 ? '#defff5' : '#a9e9df'}/>
      </mesh>;
    })}

    {[-19,-10,-2,8,18,29].map((cx,i) => <mesh key={cx} onUpdate={mesh => mesh.layers.set(NOINK)} position={[cx,5.6+(i%3)*1.7,-13-(i%2)*7]}>
      <planeGeometry args={[8+i%3*2,4+i%3]}/>
      <meshBasicMaterial map={cloudHD(i+1)} transparent depthWrite={false}/>
    </mesh>)}
    {[[-13.7,5.2],[-10.8,7],[-7.5,5.6],[-5.45,4.65],[-3.1,-1.8],[-11,-6.45],[-14,-1.2],[-18.65,-5.3],[-19,1.4],[-8.9,.85]].map(([px,pz]) => {
      const py = px < -15 ? 3+(-15-px)/3 : px < -9 ? 3 : px < -6 ? 3+(px+9)*(-1.3/3) : (-2-px)*.425;
      return <group key={px} position={[px,py,pz]}>
        <mesh position-y={1} rotation-z={-.16}><cylinderGeometry args={[.09,.15,2,7]}/><meshStandardMaterial color="#93613b"/></mesh>
        {Array.from({length:7},(_,j) => <group key={j} position={[.16,2,0]} rotation-y={j*Math.PI*2/7}>
          <mesh position-x={.55} rotation-z={-.22} scale={[.8,.085,.23]}><sphereGeometry args={[1,9,5]}/><meshStandardMaterial color={j%2 ? '#3e9e55' : '#6bb949'}/></mesh>
        </group>)}
      </group>;
    })}
  </>;
}
function Tsunami() {
  return <AbsoluteFill>
    <Audio src={staticFile('narration.mp3')}/>
    <ThreeCanvas shadows width={VIDEO_WIDTH} height={VIDEO_HEIGHT} camera={{fov:36,near:.2,far:80}} gl={{stencil:false,preserveDrawingBuffer:true}}>
      <Scene/>
    </ThreeCanvas>
  </AbsoluteFill>;
}
registerRoot(() => <Composition id="Tsunami3D" component={Tsunami} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} fps={30} durationInFrames={frames}/>);



































