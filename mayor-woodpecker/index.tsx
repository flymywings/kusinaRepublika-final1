import React, { useEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { AbsoluteFill, Composition, getInputProps, registerRoot, useCurrentFrame } from 'remotion';
import { Color, HalfFloatType, PerspectiveCamera, Vector3 } from 'three';
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { InkPass, NOINK } from '../bridge-recreation/ink';
import { GradeEffect, GRADES, type GradeParams } from '../bridge-recreation/grade';
import { LensBlur } from '../bridge-recreation/lensblur';
import { CHAR, TONE } from '../upstream/templates/bridge/shade';
import { World } from './World';
import { Performance } from './Performance';
import { CAPTIONS } from './captions';
import { DISSOLVE, FPS, FRAMES, PECK, SUNSET, limit, tween, viewAt } from './story';

const COOL: GradeParams = { ...GRADES.day, ky: [0, .066, .20, .48, .75, .91, 1], sat: [.96, 1.05, 1.04], tintS: [.085, -.016], tintM: [.045, -.01], tintH: [.003, .008], vig: [.11, .45] };
const SUN: GradeParams = { ...GRADES.golden, tintS: [.065, -.027], tintM: [.023, .015], tintH: [-.042, .042], vig: [.10, .49] };

function Stage({ frame, sunset }: { frame: number; sunset: boolean }) {
  const { camera, scene, gl, size } = useThree();
  const look = viewAt(frame);
  const cam = camera as PerspectiveCamera;
  const coolness = sunset ? 0 : tween(frame, 598, 642);
  const post = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 2, frameBufferType: HalfFloatType });
    const ink = new InkPass(scene, cam);
    const lens = new LensBlur({ maxCoC: 17, nearScale: 1.08 });
    const grade = new GradeEffect(GRADES.day, .53);
    const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: .32, luminanceThreshold: 1.12, luminanceSmoothing: .22, mipmapBlur: true, levels: 5 });
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

  const key = sunset ? new Color('#ffd087') : new Color('#ffdfab').lerp(new Color('#c4ddff'), coolness);
  const fill = sunset ? new Color('#b2bae3') : new Color('#d5e1ef').lerp(new Color('#9fc6f8'), coolness);
  const sky = sunset ? '#b6a5d2' : '#92c5e2';
  const fog = sunset ? '#c1a0ac' : '#a2c7df';

  useFrame(() => {
    CHAR.uCharTint.value.set(1.04, .97, .91).lerp(new Vector3(.89, .97, 1.12), coolness * .67);
    CHAR.uCharShade.value = .93;
    CHAR.uGrad.value = .035;
    CHAR.uBodyGrad.value = .075;
    TONE.uLitCol.value.set(1.56, 1.42, 1.22).lerp(new Vector3(1.29, 1.47, 1.69), coolness);
    TONE.uShadeCol.value.set(.61, .58, .72).lerp(new Vector3(.38, .48, .74), coolness);
    TONE.uShadeLift.value.set(.024, .025, .04);
    TONE.uBounce.value.set(sunset ? .04 : 0, sunset ? .025 : 0, 0);
    TONE.uSat.value = 1.04;
    post.grade.set(sunset ? SUN : GRADES.golden, COOL, coolness);
    post.composer.render();
  }, 1);

  return <>
    <color attach="background" args={[sky]} />
    <fog attach="fog" args={[fog, 13, 37]} />
    <hemisphereLight args={[fill, '#967e76', sunset ? 1.05 : 1.12 - .10 * coolness]} />
    <directionalLight color={key} intensity={sunset ? 2.25 : 2.38} position={sunset ? [-7, 4, -17] : [-5, 9, 5]} castShadow
      shadow-mapSize={[1536, 1536]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10}
      shadow-camera-bottom={-10} shadow-camera-far={35} shadow-bias={-.00015} shadow-normalBias={.018} />
    <directionalLight color={sunset ? '#ffdfbe' : '#bfdaee'} intensity={sunset ? .76 : .38} position={[3, 4, 7]} />
    {sunset && <mesh position={[-13.35, 6.36, -30]} onUpdate={(mesh) => mesh.layers.set(NOINK)}>
      <sphereGeometry args={[.58, 24, 16]} />
      <meshBasicMaterial color={new Color(3.25, 1.82, .82)} fog={false} />
    </mesh>}
    <World frame={frame} sunset={sunset ? 1 : 0} chipMissing={frame >= PECK} />
    <Performance frame={frame} sunset={sunset} />
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
