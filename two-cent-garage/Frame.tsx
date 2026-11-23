import React, { useEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Color, HalfFloatType, Object3D, PerspectiveCamera, Vector3 } from 'three';
import {
  BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode,
} from 'postprocessing';
import { InkPass, NOINK, noInkFallback } from '../bridge-recreation/ink';
import { GradeEffect, GRADES, type GradeParams } from '../bridge-recreation/grade';
import { CHAR, TONE } from '../upstream/templates/bridge/shade';
import { Lobby, Sky, Street, Vault } from './Sets';
import { Car } from './Car';
import { Card, drawBanker, drawBillionaire, drawGuard } from './Cast';
import { camAt, lightAt, stageAt, type Stage as StageState, type Tone } from './timeline';
import { CAPTIONS } from './captions';

const SUNSET: GradeParams = {
  ...GRADES.golden,
  sat: [1.05, 1.18, 1.16],
  tintS: [0.06, -0.02], tintM: [0.03, -0.012], tintH: [-0.04, 0.035],
  vig: [0.19, 0.42],
};
const COOL: GradeParams = {
  ...GRADES.day,
  sat: [0.98, 1.02, 1.06],
  tintS: [-0.035, 0.012], tintM: [-0.012, 0.02], tintH: [0.004, 0.014],
  vig: [0.26, 0.5],
};

const SKY: Record<Tone, [string, string, string, string]> = {
  // high, mid, low, background
  warm: ['#8fb2cd', '#cfd8e0', '#efe6d6', '#cdbfa8'],
  cool: ['#0a1424', '#152238', '#243b55', '#0b1524'],
  sunset: ['#5c3f86', '#d1725c', '#ffc27d', '#e0a179'],
};

function Actors({ stage }: { stage: StageState }) {
  const { hero, banker, guardA, guardB } = stage;
  return (
    <>
      {hero.visible && (
        <Card draw={(p) => drawBillionaire(p, hero.pose)} drawKey={hero.pose} position={hero.pos} rotationY={hero.rotY} flip={hero.flip} />
      )}
      {banker.visible && (
        <Card draw={(p) => drawBanker(p, banker.pose)} drawKey={banker.pose} position={banker.pos} rotationY={banker.rotY} shadow="#2c3038" />
      )}
      {guardA.visible && <Card draw={(p) => drawGuard(p, guardA.pose)} drawKey={guardA.pose} position={guardA.pos} rotationY={guardA.rotY} shadow="#232a36" />}
      {guardB.visible && <Card draw={(p) => drawGuard(p, guardB.pose)} drawKey={guardB.pose} position={guardB.pos} rotationY={guardB.rotY} shadow="#232a36" />}
    </>
  );
}

function Stage({ frame }: { frame: number }) {
  const { camera, scene, gl, size } = useThree();
  const cam = camera as PerspectiveCamera;
  const view = camAt(frame);
  const light = lightAt(frame);
  const stage = stageAt(frame);
  const sky = SKY[light.tone];

  const target = useMemo(() => new Object3D(), []);
  target.position.set(0, 0, 0);

  const post = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 2, frameBufferType: HalfFloatType });
    const ink = new InkPass(scene, cam);
    const grade = new GradeEffect(GRADES.golden, 0.62);
    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD, intensity: 0.46, luminanceThreshold: 1.04,
      luminanceSmoothing: 0.22, mipmapBlur: true, levels: 5,
    });
    composer.addPass(new RenderPass(scene, cam));
    composer.addPass(ink);
    composer.addPass(new EffectPass(cam, bloom, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade));
    return { composer, grade };
  }, [cam, gl, scene]);

  useEffect(() => () => post.composer.dispose(), [post]);
  useEffect(() => post.composer.setSize(size.width, size.height), [post, size.width, size.height]);

  cam.position.set(...view.pos);
  cam.fov = view.fov;
  cam.near = 0.12;
  cam.far = 220;
  cam.updateProjectionMatrix();
  cam.layers.enable(NOINK);
  cam.lookAt(...view.look);
  cam.updateMatrixWorld();

  useFrame(() => {
    CHAR.uCharTint.value.set(light.tone === 'cool' ? 0.82 : light.tone === 'sunset' ? 1.14 : 1.03,
      light.tone === 'cool' ? 0.94 : light.tone === 'sunset' ? 0.9 : 0.98,
      light.tone === 'cool' ? 1.14 : light.tone === 'sunset' ? 0.76 : 0.92);
    CHAR.uCharShade.value = light.tone === 'cool' ? 0.74 : 0.81;
    CHAR.uGrad.value = 0.075;
    CHAR.uBodyGrad.value = 0.14;
    CHAR.uSideTint.value.set(0.84, 0.88, 1.08);

    if (light.tone === 'cool') {
      TONE.uLitCol.value.set(1.05, 1.36, 1.78);
      TONE.uShadeCol.value.set(0.3, 0.38, 0.66);
      TONE.uBounce.value.set(0.02, 0.05, 0.08);
      TONE.uSat.value = 0.96;
    } else if (light.tone === 'sunset') {
      TONE.uLitCol.value.set(2.24, 1.34, 0.72);
      TONE.uShadeCol.value.set(0.42, 0.42, 0.68);
      TONE.uBounce.value.set(0.14, 0.07, 0.025);
      TONE.uSat.value = 1.14;
    } else {
      TONE.uLitCol.value.set(1.58, 1.46, 1.3);
      TONE.uShadeCol.value.set(0.58, 0.56, 0.86);
      TONE.uBounce.value.set(0.05, 0.03, 0.022);
      TONE.uSat.value = 1.1;
    }
    TONE.uShadeLift.value.set(0.014, 0.017, 0.028);

    post.grade.set(light.tone === 'cool' ? COOL : light.tone === 'sunset' ? SUNSET : GRADES.golden);
    noInkFallback(scene);
    post.composer.render();
  }, 1);

  return (
    <>
      <color attach="background" args={[sky[3]]} />
      <Sky palette={sky} />
      <fog attach="fog" args={[light.fogColor, light.fogNear, light.fogFar]} />
      <hemisphereLight args={[light.fillColor, '#6d5f52', light.ambI]} />
      <ambientLight color={light.ambColor} intensity={light.fillI} />
      <primitive object={target} />
      <directionalLight
        color={light.sunColor}
        intensity={light.sunI}
        position={light.sunPos}
        target={target}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-far={60}
        shadow-bias={-0.00012}
        shadow-normalBias={0.017}
      />

      {stage.scene === 'lobby' && <Lobby />}
      {stage.scene === 'vault' && <Vault liftY={stage.liftY} doorSpin={stage.doorSpin} />}
      {stage.scene === 'street' && <Street />}

      {stage.car.visible && <Car position={stage.car.pos} rotation={stage.car.rot} roll={stage.car.roll} />}
      <Actors stage={stage} />

      {/* warm practical bounce in the lobby, cold shafts in the vault */}
      {stage.scene === 'lobby' && <pointLight color="#ffd9a6" intensity={9} distance={14} position={[0, 3.4, 2.2]} />}
      {stage.scene === 'vault' && <pointLight color="#5fb6ff" intensity={16} distance={13} position={[0, -1.2, 0]} />}
    </>
  );
}

export function TwoCentFrame({ from = 0, captions = true }: { from?: number; captions?: boolean }) {
  const frame = useCurrentFrame() + from;
  const caption = captions ? CAPTIONS.find(([start, end]) => frame >= start && frame < end) : undefined;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0d12' }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        shadows
        camera={{ fov: 45, near: 0.12, far: 220 }}
        gl={{ antialias: false, stencil: false, preserveDrawingBuffer: true }}
      >
        <Stage frame={frame} />
      </ThreeCanvas>

      {caption && frame < 830 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '88%',
            transform: 'translate(-50%, -50%)',
            width: '86%',
            textAlign: 'center',
            color: '#fffdf6',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontWeight: 900,
            fontSize: 54,
            lineHeight: 1.08,
            letterSpacing: '-0.5px',
            WebkitTextStroke: '8px #171319',
            paintOrder: 'stroke fill',
            textShadow: '0 5px 18px rgba(0,0,0,0.45)',
          }}
        >
          {caption[2]}
        </div>
      )}

      {/* subtle letterbox vignette so the phone frame reads cinematic */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.18) 82%, rgba(0,0,0,0.42) 100%)',
        }}
      />
    </AbsoluteFill>
  );
}

export const frameAt = (f: number) => <TwoCentFrame from={f} />;
