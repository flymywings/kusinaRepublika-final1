import React, { useEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { AbsoluteFill, Composition, getInputProps, registerRoot, useCurrentFrame } from 'remotion';
import { AdditiveBlending, BackSide, Color, HalfFloatType, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { InkPass, NOINK } from '../bridge-recreation/ink';
import { GradeEffect, GRADES, type GradeParams } from '../bridge-recreation/grade';
import { LensBlur } from '../bridge-recreation/lensblur';
import { CHAR, TONE, untone } from '../upstream/templates/bridge/shade';
import { MarketWorld, World } from './World';
import { MarketPerformance, Performance } from './Performance';
import { CAPTIONS } from './captions';
import { DISSOLVE, FPS, FRAMES, PECK, ROOF_VIEW, SHOP_VIEW, SUNSET, inMarket, limit, tween, viewAt } from './story';

const COOL: GradeParams = { ...GRADES.day, ky: [0, .07, .19, .46, .74, .92, 1], sat: [1.06, 1.07, 1.04], tintS: [.11, -.024], tintM: [.047, -.018], tintH: [.006, .006], vig: [.13, .48] };
const SUN: GradeParams = { ...GRADES.golden, tintS: [.10, -.038], tintM: [.018, .023], tintH: [-.053, .054], vig: [.11, .47] };

function Sky({ sunset, center }: { sunset: boolean; center: number }) {
  const uniforms = useMemo(() => ({
    horizon: { value: untone(sunset ? '#ffcd83' : '#c0dcec') },
    high: { value: untone(sunset ? '#8e6bb2' : '#4497d3') },
  }), [sunset]);
  return <mesh position-x={center} renderOrder={-1000} onUpdate={(mesh) => mesh.layers.set(NOINK)}>
    <sphereGeometry args={[77, 36, 24]} />
    <shaderMaterial side={BackSide} depthWrite={false} uniforms={uniforms}
      vertexShader={'varying vec3 ray; void main(){ ray=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }'}
      fragmentShader={'varying vec3 ray; uniform vec3 horizon; uniform vec3 high; void main(){ float t=smoothstep(-.035,.50,normalize(ray).y); gl_FragColor=vec4(mix(horizon,high,t),1.); }'} />
  </mesh>;
}

function Stage({ frame, sunset }: { frame: number; sunset: boolean }) {
  const { camera, scene, gl, size } = useThree();
  const look = viewAt(frame);
  const cam = camera as PerspectiveCamera;
  const market = inMarket(frame);
  const center = market ? 30 : 0;
  const doorway = frame >= SHOP_VIEW && frame < ROOF_VIEW;
  const coolness = sunset ? 0 : Math.max(doorway ? .48 : 0, tween(frame, 575, 623));
  const bounty = frame < 172;
  const lightTarget = useMemo(() => new Object3D(), []);
  lightTarget.position.set(center, 0, 0);
  const post = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 2, frameBufferType: HalfFloatType });
    const ink = new InkPass(scene, cam);
    const lens = new LensBlur({ maxCoC: 23, nearScale: 1.10 });
    const grade = new GradeEffect(GRADES.day, .53);
    const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: .54, luminanceThreshold: 1.07, luminanceSmoothing: .21, mipmapBlur: true, levels: 5 });
    composer.addPass(new RenderPass(scene, cam));
    composer.addPass(ink);
    composer.addPass(new EffectPass(cam, lens.pre));
    composer.addPass(new EffectPass(cam, lens.main));
    composer.addPass(new EffectPass(cam, bloom, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade));
    return { composer, lens, grade };
  }, [cam, gl, scene]);

  useEffect(() => () => post.composer.dispose(), [post]);
  useEffect(() => post.composer.setSize(size.width, size.height), [post, size.width, size.height]);
  cam.position.set(...look.position);
  cam.fov = look.fov;
  cam.updateProjectionMatrix();
  cam.layers.enable(NOINK);
  cam.lookAt(...look.look);
  cam.updateMatrixWorld();
  post.lens.focus = Math.max(.15, new Vector3(...look.focus).sub(cam.position).dot(cam.getWorldDirection(new Vector3())));
  post.lens.cInf = look.blur;

  const key = sunset ? new Color('#ffc379') : new Color(bounty ? '#ffe0a3' : '#fff0d0');
  const fill = sunset ? new Color('#b2bae3') : new Color('#d5e1ef').lerp(new Color('#9fc6f8'), coolness);
  const sky = sunset ? '#b291b8' : '#8fbedc';
  const fog = sunset ? '#e0b5a1' : '#accddd';

  useFrame(() => {
    CHAR.uCharTint.value.set(sunset ? 1.07 : 1.04, .97, sunset ? .87 : .92).lerp(new Vector3(.92, .99, 1.16), coolness * .70);
    CHAR.uCharShade.value = sunset ? .77 : .81;
    CHAR.uGrad.value = .075;
    CHAR.uBodyGrad.value = .13;
    CHAR.uSideTint.value.set(.82, .87, 1.05);
    if (sunset) {
      TONE.uLitCol.value.set(2.04, 1.32, .73);
      TONE.uShadeCol.value.set(.36, .42, .70);
    } else {
      TONE.uLitCol.value.set(bounty ? 1.70 : 1.60, 1.49, 1.20).lerp(new Vector3(1.10, 1.37, 1.68), coolness);
      TONE.uShadeCol.value.set(.48, .51, .71).lerp(new Vector3(.30, .42, .72), coolness);
    }
    TONE.uShadeLift.value.set(.015, .019, .033);
    TONE.uBounce.value.set(sunset ? .12 : .018, sunset ? .071 : .017, sunset ? .025 : .022);
    TONE.uSat.value = 1.12;
    post.grade.set(sunset ? SUN : GRADES.golden, COOL, coolness);
    post.composer.render();
  }, 1);

  return <>
    <color attach="background" args={[sky]} />
    <Sky sunset={sunset} center={center} />
    <fog attach="fog" args={[fog, 11, 38]} />
    <hemisphereLight args={[fill, '#80718b', sunset ? .69 : .72 - .08 * coolness]} />
    <primitive object={lightTarget} />
    <directionalLight color={key} intensity={sunset ? 2.95 : 2.64} target={lightTarget} position={sunset ? [11.7, 3.15, -15] : [center - 10, 8.5, 3.8]} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15}
      shadow-camera-bottom={-15} shadow-camera-far={52} shadow-bias={-.00012} shadow-normalBias={.017} />
    <directionalLight color={sunset ? '#ffdfbe' : '#bfdaee'} intensity={sunset ? .33 : .18} position={[3, 4, 7]} />
    {sunset && <group position={[35.8, 18.1, -46]}>
      <mesh onUpdate={(mesh) => mesh.layers.set(NOINK)}>
        <sphereGeometry args={[1.07, 32, 18]} />
        <meshBasicMaterial color={new Color(3.65, 1.82, .57)} fog={false} />
      </mesh>
      <mesh quaternion={cam.quaternion} onUpdate={(mesh) => mesh.layers.set(NOINK)}>
        <planeGeometry args={[8.5, 8.5]} />
        <shaderMaterial transparent blending={AdditiveBlending} depthWrite={false}
          vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
          fragmentShader="varying vec2 vUv; void main(){ float d=length(vUv-.5); float halo=exp(-8.*d)*(1.-smoothstep(.22,.49,d)); gl_FragColor=vec4(1.,.48,.12,halo*.37); }" />
      </mesh>
    </group>}
    {market ? <><MarketWorld frame={frame} /><MarketPerformance frame={frame} /></>
      : <><World frame={frame} sunset={sunset ? 1 : 0} chipMissing={frame >= PECK} /><Performance frame={frame} sunset={sunset} /></>}
  </>;
}

function Viewport({ frame, sunset, alpha = 1 }: { frame: number; sunset: boolean; alpha?: number }) {
  return <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: 45, near: .13, far: 92 }}
      gl={{ antialias: false, stencil: false, preserveDrawingBuffer: true }}>
      <Stage frame={frame} sunset={sunset} />
    </ThreeCanvas>
  </AbsoluteFill>;
}

function Short() {
  const frame = useCurrentFrame();
  const { captions = true, transitions = true } = getInputProps() as { captions?: boolean; transitions?: boolean };
  const dissolve = transitions && frame >= SUNSET && frame < SUNSET + DISSOLVE;
  const caption = captions && CAPTIONS.find(([start, end]) => frame >= start && frame < end);
  return <AbsoluteFill style={{ backgroundColor: '#92c5e2' }}>
    <Viewport frame={frame} sunset={!dissolve && frame >= SUNSET} />
    {dissolve && <Viewport frame={frame} sunset alpha={limit((frame - SUNSET + 1) / DISSOLVE)} />}
    {caption && <div style={{ position: 'absolute', top: '68%', left: '50%', transform: `translate(-50%,-50%) scale(${1 + .04 * (1 - tween(frame, caption[0], caption[0] + 3))})`,
      color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 70, lineHeight: 1, whiteSpace: 'nowrap',
      WebkitTextStroke: '8px #17141b', paintOrder: 'stroke fill' }}>{caption[2]}</div>}
  </AbsoluteFill>;
}

registerRoot(() => <Composition id="MayorWoodpecker" component={Short} durationInFrames={FRAMES} fps={FPS} width={1080} height={1920} />);
