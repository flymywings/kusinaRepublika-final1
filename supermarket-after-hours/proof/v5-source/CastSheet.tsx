import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { drawCastArt, Person } from './ReferenceCast';
import type { PersonProps } from './Cast';
import { World } from './World';
import { SERVICE } from './story';
import { NOINK } from './lib/ink';

const SW = 2400, SH = 2200;
const INK = '#25333b', MUTED = '#65737a', PAPER = '#f2eddf', CARD = '#fffdf6', RED = '#a64a50', RULE = '#d6d0bf';
type Cue = { role: PersonProps['role']; name: string; label: string; sub: string; expression: string };
const CAST: Cue[] = [
  { role: 'sasaki', name: 'SASAKI', label: '45  /  OFFICE WORKER', sub: 'Grey temples · burgundy tie · briefcase', expression: 'tired' },
  { role: 'yamada', name: 'YAMADA', label: 'WORK LOOK', sub: 'Red headscarf · apron · name badge', expression: 'soft' },
  { role: 'tayama', name: 'TAYAMA', label: 'CASUAL LOOK', sub: 'Low fringe · tied hair · gold hardware', expression: 'teasing' },
  { role: 'staff', name: 'STORE STAFF', label: 'SUPPORTING CASHIER', sub: 'Grey hair · store uniform', expression: 'neutral' },
];
const contact = (pose: PersonProps) => (p: [number, number, number]): [number, number] => {
  const scale = pose.scale ?? 1;
  return [(p[0] - pose.position[0]) / scale, (p[1] - pose.position[1]) / scale];
};
function poseFor(role: PersonProps['role'], expression: string, frame = 30): PersonProps {
  return { role, position: [0, 0, 0], yaw: 0, view: 'front', look: 1, expression: expression as PersonProps['expression'],
    frame, scale: 1, tilt: role === 'sasaki' ? .055 : 0, headTilt: role === 'sasaki' ? .025 : 0,
    softness: role === 'yamada' ? .8 : role === 'tayama' ? .15 : 0 };
}
function paintFigure(ctx: CanvasRenderingContext2D, x: number, baseline: number, pxPerMeter: number, role: PersonProps['role'], expression: string, frame = 30) {
  const pose = poseFor(role, expression, frame);
  ctx.save(); ctx.translate(x, baseline); ctx.scale(pxPerMeter, -pxPerMeter);
  drawCastArt(ctx, pose, contact(pose));
  ctx.restore();
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 18) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}
function CanvasSheet() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, SW, SH);
    // Header: concise identity and approval state.
    ctx.fillStyle = INK; ctx.font = '700 27px Arial, sans-serif'; ctx.fillText('SUPERMARKET AFTER HOURS', 112, 92);
    ctx.font = '500 17px Arial, sans-serif'; ctx.fillStyle = MUTED; ctx.fillText('CHARACTER DESIGN  /  FLAT 2D FIGURES IN A LAYERED 3D WORLD', 112, 128);
    ctx.textAlign = 'right'; ctx.fillStyle = RED; ctx.font = '700 18px Arial, sans-serif'; ctx.fillText('DESIGN PROPOSAL  •  NOT YET APPROVED', SW - 112, 91); ctx.textAlign = 'left';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(112, 157); ctx.lineTo(SW - 112, 157); ctx.stroke();

    const left = 112, gap = 18, cw = (SW - 224 - gap * 4) / 5;
    CAST.forEach((c, i) => {
      const x = left + i * (cw + gap);
      ctx.fillStyle = CARD; roundRect(ctx, x, 186, cw, 790, 18);
      ctx.fillStyle = i === 2 ? RED : MUTED; ctx.fillRect(x + 27, 215, 32, 4);
      ctx.fillStyle = INK; ctx.font = '700 24px Arial, sans-serif'; ctx.fillText(c.name, x + 27, 264);
      ctx.fillStyle = MUTED; ctx.font = '700 13px Arial, sans-serif'; ctx.fillText(c.label, x + 27, 291);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 18, 309, cw - 36, 565); ctx.clip();
      paintFigure(ctx, x + cw / 2, 864, 282, c.role, c.expression);
      ctx.restore();
      ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 27, 893); ctx.lineTo(x + cw - 27, 893); ctx.stroke();
      ctx.fillStyle = INK; ctx.font = '500 16px Arial, sans-serif'; ctx.fillText(c.sub, x + 27, 931);
      ctx.fillStyle = MUTED; ctx.font = '500 13px Arial, sans-serif'; ctx.fillText('FRONT  /  FULL FIGURE', x + 27, 955);
    });
    const refX = left + 4 * (cw + gap);
    ctx.fillStyle = CARD; roundRect(ctx, refX, 186, cw, 790, 18);
    ctx.fillStyle = RED; ctx.fillRect(refX + 27, 215, 32, 4);
    ctx.fillStyle = INK; ctx.font = '700 20px Arial, sans-serif'; ctx.fillText('TAYAMA', refX + 27, 264);
    ctx.fillStyle = MUTED; ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('IDENTITY REFERENCE', refX + 27, 291);
    ctx.save(); ctx.beginPath(); ctx.rect(refX + 18, 309, cw - 36, 565); ctx.clip();
    ctx.restore();

    ctx.fillStyle = INK; ctx.font = '700 18px Arial, sans-serif'; ctx.fillText('FACE & HAIR READ', 112, 1032);
    ctx.fillStyle = MUTED; ctx.font = '500 14px Arial, sans-serif'; ctx.fillText('Yamada and Tayama share the same underlying face; hair, outfit, piercings and expression distinguish them.', 112, 1060);
    CAST.forEach((c, i) => {
      const x = left + i * (cw + gap);
      ctx.fillStyle = CARD; roundRect(ctx, x, 1082, cw, 482, 18);
      ctx.fillStyle = RULE; ctx.fillRect(x + 26, 1110, cw - 52, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 15, 1108, cw - 30, 400); ctx.clip();
      paintFigure(ctx, x + cw / 2, 1770, 344, c.role, 'neutral');
      ctx.restore();
      ctx.fillStyle = INK; ctx.font = '700 14px Arial, sans-serif'; ctx.fillText(c.name, x + 27, 1534);
    });
    ctx.fillStyle = CARD; roundRect(ctx, refX, 1082, cw, 482, 18);
    ctx.save(); ctx.beginPath(); ctx.rect(refX + 15, 1108, cw - 30, 400); ctx.clip(); ctx.restore();
    ctx.fillStyle = INK; ctx.font = '700 14px Arial, sans-serif'; ctx.fillText('REFERENCE FACE & HAIR', refX + 27, 1534);

    ctx.fillStyle = INK; ctx.font = '700 18px Arial, sans-serif'; ctx.fillText('SASAKI  /  EXPRESSION RANGE', 112, 1634);
    ctx.fillStyle = MUTED; ctx.font = '500 14px Arial, sans-serif'; ctx.fillText('Small shifts in eyes, mouth and posture keep the salaryman restrained.', 112, 1662);
    const exps = [
      ['neutral', 'NEUTRAL'], ['soft', 'SOFT'], ['teasing', 'TEASING'], ['flustered', 'FLUSTERED'],
    ];
    const expGap = 24, expCW = (SW - 224 - expGap * 3) / 4;
    exps.forEach(([expression, name], i) => {
      const x = left + i * (expCW + expGap);
      ctx.fillStyle = CARD; roundRect(ctx, x, 1685, expCW, 357, 18);
      ctx.save(); ctx.beginPath(); ctx.rect(x + 8, 1690, expCW - 16, 290); ctx.clip();
      paintFigure(ctx, x + expCW / 2, 2395, 362, 'sasaki', expression, 30);
      ctx.restore();
      ctx.fillStyle = i === 2 ? RED : INK; ctx.font = '700 15px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(name, x + expCW / 2, 2018); ctx.textAlign = 'left';
    });

    // Source crop uses the original portrait proportion and aligns to the production figures' ground line.
    const handle = delayRender('Loading cast reference inset');
    const fullbody = new Image();
    const detail = new Image();
    let loaded = 0;
    const finish = () => { loaded++; if (loaded === 2) continueRender(handle); };
    fullbody.onload = () => {
      ctx.save(); ctx.beginPath(); ctx.rect(refX + 18, 309, cw - 36, 565); ctx.clip();
      const referenceH = 565, referenceW = referenceH * (395 / 1190), referenceX = refX + (cw - referenceW) / 2;
      ctx.drawImage(fullbody, 325, 220, 395, 1190, referenceX, 299, referenceW, referenceH); ctx.restore();
      finish();
    };
    detail.onload = () => {
      const faceH = 260, faceW = faceH * (387 / 305), faceX = refX + (cw - faceW) / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(refX + 15, 1108, cw - 30, 400); ctx.clip();
      ctx.drawImage(detail, 0, 0, 387, 305, faceX, 1150, faceW, faceH); ctx.restore();
      finish();
    };
    fullbody.onerror = finish; detail.onerror = finish;
    fullbody.src = staticFile('tayama-identity-fullbody.png');
    detail.src = staticFile('tayama-identity-detail.png');
  }, []);
  return <canvas ref={ref} width={SW} height={SH} style={{ width: '100%', height: '100%' }} />;
}

function PlacementCamera() {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.layers.enable(NOINK);
    camera.position.set(8.75, 1.05, -.9);
    camera.lookAt(8.75, 1.05, -6.2);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}
function CastPlacement() {
  const sasaki: PersonProps = { role: 'sasaki', position: SERVICE.sasaki, yaw: 0, view: 'front', expression: 'soft', frame: 1480, scale: 1 };
  const tayama: PersonProps = { role: 'tayama', position: SERVICE.tayama, yaw: Math.PI, view: 'front', expression: 'soft', frame: 1480, scale: .91, softness: .45 };
  return <AbsoluteFill style={{ backgroundColor: '#17232b' }}>
    <ThreeCanvas width={900} height={500} shadows camera={{ position: [8.75, 1.05, -.9], fov: 30, near: .1, far: 100 }} gl={{ antialias: true }}>
      <PlacementCamera />
      <ambientLight color="#c6d4d4" intensity={1.25} />
      <directionalLight color="#ffe0b0" intensity={2.1} position={[3, 8, 2]} castShadow />
      <pointLight color="#ffd4a2" intensity={16} distance={9} position={[8.8, 2.5, -7.4]} />
      <World frame={1480} />
      <Person {...sasaki} />
      <Person {...tayama} />
    </ThreeCanvas>
  </AbsoluteFill>;
}

function TayamaIdentityCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 1400, H = 1500;
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = INK; ctx.font = '700 29px Arial, sans-serif'; ctx.fillText('TAYAMA  /  IDENTITY REVISION', 62, 72);
    ctx.fillStyle = MUTED; ctx.font = '500 16px Arial, sans-serif'; ctx.fillText('PRODUCTION DRAWING COMPARED WITH USER-PROVIDED CHARACTER REFERENCES', 62, 105);
    ctx.fillStyle = RED; ctx.font = '700 15px Arial, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('DESIGN PROPOSAL  •  NOT YET APPROVED', W - 62, 72); ctx.textAlign = 'left';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(62, 132); ctx.lineTo(W - 62, 132); ctx.stroke();
    const cards = [{x: 62, title: 'OUR PRODUCTION DRAWING'}, {x: 718, title: 'USER REFERENCE'}];
    cards.forEach(card => {
      ctx.fillStyle = CARD; roundRect(ctx, card.x, 156, 620, 1132, 20);
      ctx.fillStyle = INK; ctx.font = '700 17px Arial, sans-serif'; ctx.fillText(card.title, card.x + 26, 198);
      ctx.fillStyle = RED; ctx.fillRect(card.x + 26, 217, 38, 4);
      ctx.fillStyle = MUTED; ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('FULL FIGURE', card.x + 26, 246);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(card.x + 26, 986); ctx.lineTo(card.x + 594, 986); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.font = '700 13px Arial, sans-serif'; ctx.fillText('HEAD, HAIR & HARDWARE', card.x + 26, 1016);
    });
    paintFigure(ctx, 372, 944, 328, 'tayama', 'teasing', 30);
    ctx.save(); ctx.beginPath(); ctx.rect(89, 1017, 566, 271); ctx.clip();
    paintFigure(ctx, 372, 1710, 360, 'tayama', 'neutral', 30);
    ctx.restore();

    const cues = [
      'LOW FRINGE  /  LONG FRONT LOCKS', 'LOW TIE  /  PONYTAIL',
      'GOLD EAR CUFF  /  HANGING BARS', 'CROPPED JACKET  /  FITTED DRESS  /  CHOKER BUCKLE',
    ];
    cues.forEach((cue, i) => {
      const x = 62 + (i % 2) * 656, y = 1320 + Math.floor(i / 2) * 74;
      ctx.fillStyle = CARD; roundRect(ctx, x, y, 620, 58, 13);
      ctx.fillStyle = i === 2 ? RED : INK; ctx.font = '700 14px Arial, sans-serif'; ctx.fillText(cue, x + 20, y + 36);
    });

    const handle = delayRender('Loading Tayama identity reference images');
    const full = new Image(), detail = new Image();
    let loaded = 0;
    const finish = () => { loaded++; if (loaded === 2) continueRender(handle); };
    full.onload = () => {
      const crop = { x: 325, y: 220, w: 395, h: 1190 };
      const outH = 690, outW = outH * crop.w / crop.h, x = 1028 - outW / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(745, 256, 566, 718); ctx.clip();
      ctx.drawImage(full, crop.x, crop.y, crop.w, crop.h, x, 254, outW, outH); ctx.restore();
      finish();
    };
    detail.onload = () => {
      const crop = { x: 0, y: 0, w: 387, h: 305 };
      const outH = 250, outW = outH * crop.w / crop.h, x = 1028 - outW / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(745, 1025, 566, 245); ctx.clip();
      ctx.drawImage(detail, crop.x, crop.y, crop.w, crop.h, x, 1027, outW, outH); ctx.restore();
      finish();
    };
    full.onerror = finish; detail.onerror = finish;
    full.src = staticFile('tayama-identity-fullbody.png');
    detail.src = staticFile('tayama-identity-detail.png');
  }, []);
  return <canvas ref={ref} width={1400} height={1500} style={{ width: '100%', height: '100%' }} />;
}
function TayamaIdentity() { return <AbsoluteFill><TayamaIdentityCanvas /></AbsoluteFill>; }

function CastSheet() { return <AbsoluteFill><CanvasSheet /></AbsoluteFill>; }
registerRoot(() => <>
  <Composition id="CastSheet" component={CastSheet} width={SW} height={SH} fps={30} durationInFrames={1} />
  <Composition id="CastPlacement" component={CastPlacement} width={900} height={500} fps={30} durationInFrames={1} />
  <Composition id="TayamaIdentity" component={TayamaIdentity} width={1400} height={1500} fps={30} durationInFrames={1} />
</>);
