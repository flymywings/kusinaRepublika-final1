import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useVideoConfig } from 'remotion';
import { cardShade, blobMaterial, CARD_K } from '../upstream/templates/bridge/cardshade';
import { Pen, blobPts, headBlob, thickAngle, INK, SKIN, shade, fxContact } from '../upstream/templates/bridge/toon';
import { Pose } from './timeline';

// 1000 design units = ~2.37 m. The drawn figure spans ~761 units (head 214 .. feet 975), i.e. ~1.80 m, so the
// card keeps a little transparent head room above the hair without shrinking the cast.
export const SU = 0.00237;

const rad = (d: number) => (d * Math.PI) / 180;

// palettes
const BILLIONAIRE = { suit: '#232a36', suitDark: '#171d27', shirt: '#f7f4ee', tie: '#d9a63c', hair: '#241b18', shoe: '#0d0f14' };
const BANKER = { vest: '#12695f', vestDark: '#0a4a43', shirt: '#fbf8f1', tie: '#d9b45a', hair: '#4a3327', shoe: '#1a1d24' };
const GUARD = { cloth: '#1c3c6e', clothDark: '#132a4f', belt: '#0c0e12', cap: '#1c3c6e' };

function legs(p: Pen, cx: number, hip: number, ankle: number, color: string, shoe: string, spread = 26, swing = 0) {
  p.stroke([[cx - spread, hip], [cx - spread - swing * 8, ankle - 14], [cx - spread - swing * 12, ankle]], 44, color);
  p.stroke([[cx + spread, hip], [cx + spread + swing * 8, ankle - 14], [cx + spread + swing * 12, ankle]], 44, color);
  p.poly([[cx - spread - 40, ankle - 8], [cx - spread + 22, ankle - 8], [cx - spread + 18, ankle + 16], [cx - spread - 42, ankle + 16]], shoe, 3.5);
  p.poly([[cx + spread - 22, ankle - 8], [cx + spread + 40, ankle - 8], [cx + spread + 42, ankle + 16], [cx + spread - 18, ankle + 16]], shoe, 3.5);
}

function head(p: Pen, x: number, y: number, a: number, seed: number, facing: number, skin = SKIN) {
  const blob = headBlob(seed, a, facing);
  const pts = blobPts(x, y, blob);
  p.shadedFill(pts, skin, shade(skin, 0.86), rad(-118), a);
  return { pts, blob };
}

function shades(p: Pen, x: number, y: number) {
  p.poly([[x - 44, y - 15], [x - 6, y - 15], [x - 10, y + 20], [x - 40, y + 18]], '#0f1116', 3.5);
  p.poly([[x + 6, y - 15], [x + 44, y - 15], [x + 40, y + 18], [x + 10, y + 20]], '#0f1116', 3.5);
  p.stroke([[x - 6, y - 10], [x + 6, y - 10]], 3.5, '#c9a24a');
  p.stroke([[x - 44, y - 12], [x - 52, y - 14]], 3, '#0f1116');
  p.stroke([[x + 44, y - 12], [x + 52, y - 14]], 3, '#0f1116');
}

function spectacles(p: Pen, x: number, y: number) {
  p.ell(x - 23, y, 16, 16, null, 3.5);
  p.ell(x + 23, y, 16, 16, null, 3.5);
  p.stroke([[x - 7, y], [x + 7, y]], 3, INK);
  p.stroke([[x - 39, y - 2], [x - 50, y - 4]], 3, INK);
  p.stroke([[x + 39, y - 2], [x + 50, y - 4]], 3, INK);
}

// ---------------------------------------------------------------- billionaire

export function drawBillionaire(p: Pen, pose: Pose) {
  const cx = 300;
  const ankle = 975;
  const hip = 642;
  const shoulder = 418;
  const thick = thickAngle(rad(-118));

  if (pose === 'walk') {
    legs(p, cx, hip, ankle, BILLIONAIRE.suitDark, BILLIONAIRE.shoe, 28, 1);
  } else {
    legs(p, cx, hip, ankle, BILLIONAIRE.suitDark, BILLIONAIRE.shoe);
  }

  const torso = blobPts(cx, 532, {
    a: 88, b: 116, nTop: 2.05, nBot: 2.35, egg: -0.07, asym: 0.02, rot: 0, noise: 0.005, seed: 41,
  });
  p.gradFill(torso, BILLIONAIRE.suit, shade(BILLIONAIRE.suit, 0.62), rad(-118));
  p.inkRing(torso, 8, thick);

  // shirt V + tie
  p.poly([[cx - 20, shoulder - 6], [cx + 20, shoulder - 6], [cx, shoulder + 40]], BILLIONAIRE.shirt, 3);
  p.poly([[cx - 7, shoulder + 18], [cx + 7, shoulder + 18], [cx + 5, shoulder + 96], [cx - 5, shoulder + 96]], BILLIONAIRE.tie, 3);
  // lapels
  p.stroke([[cx - 20, shoulder - 4], [cx - 44, shoulder + 86], [cx - 26, shoulder + 120]], 5, shade(BILLIONAIRE.suit, 1.3));
  p.stroke([[cx + 20, shoulder - 4], [cx + 44, shoulder + 86], [cx + 26, shoulder + 120]], 5, shade(BILLIONAIRE.suit, 1.3));

  const arm = (pts: [number, number][]) => {
    p.stroke(pts, 26, BILLIONAIRE.suit);
    p.stroke(pts, 26, BILLIONAIRE.suit);
  };

  // left arm is always relaxed
  p.stroke([[cx - 68, shoulder + 26], [cx - 84, shoulder + 108], [cx - 68, shoulder + 178]], 42, BILLIONAIRE.suit);
  p.dot(cx - 68, shoulder + 184, 18, '#f6cfae');

  const handR = { x: cx + 150, y: shoulder + 112 };
  if (pose === 'handoff') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 108, shoulder + 66], [handR.x, handR.y]], 42, BILLIONAIRE.suit);
    p.dot(handR.x, handR.y, 19, '#f6cfae');
    // one-dollar bill
    p.poly([[handR.x - 6, handR.y - 44], [handR.x + 62, handR.y - 52], [handR.x + 66, handR.y - 22], [handR.x - 2, handR.y - 14]], '#1c7a45', 3.5);
    p.poly([[handR.x, handR.y - 40], [handR.x + 56, handR.y - 46], [handR.x + 59, handR.y - 27], [handR.x + 3, handR.y - 21]], null, 2);
    p.ell(handR.x + 16, handR.y - 33, 8, 9, '#0f5732', 0);
    p.ell(handR.x + 16, handR.y - 35, 4, 4.5, '#8fd3a8', 0);
    p.stroke([[handR.x + 40, handR.y - 44], [handR.x + 40, handR.y - 23]], 5, '#0e4f2c');
    p.stroke([[handR.x + 34, handR.y - 37], [handR.x + 40, handR.y - 43]], 3.5, '#0e4f2c');
    p.stroke([[handR.x + 35, handR.y - 23], [handR.x + 45, handR.y - 23]], 3.5, '#0e4f2c');
    // gold key fob
    const kx = handR.x + 14;
    const ky = handR.y + 16;
    p.arc(kx + 6, ky - 6, 10, 10, 200, 520, 3, '#cfd4dd');
    p.poly([[kx + 6, ky + 2], [kx + 34, ky - 2], [kx + 32, ky + 34], [kx + 4, ky + 38]], '#e0b23c', 3.5);
    p.dot(kx + 19, ky + 18, 5, '#2a1c10');
  } else if (pose === 'take') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 104, shoulder + 78], [cx + 132, shoulder + 96]], 42, BILLIONAIRE.suit);
    p.ell(cx + 140, shoulder + 98, 16, 11, '#f6cfae', 3.5);
  } else if (pose === 'pay') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 106, shoulder + 70], [cx + 146, shoulder + 82]], 42, BILLIONAIRE.suit);
    p.dot(cx + 148, shoulder + 84, 19, '#f6cfae');
    p.poly([[cx + 128, shoulder + 52], [cx + 184, shoulder + 44], [cx + 190, shoulder + 78], [cx + 134, shoulder + 86]], '#1c7a45', 3);
    p.dot(cx + 158, shoulder + 66, 6, '#7fd8a2');
  } else if (pose === 'drop') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 108, shoulder + 78], [cx + 118, shoulder + 120]], 42, BILLIONAIRE.suit);
    p.dot(cx + 118, shoulder + 124, 19, '#f6cfae');
    // two cents, dropped into the open hand at counter height
    p.ell(cx + 102, shoulder + 120, 16, 10, '#993d16', 2.5);
    p.ell(cx + 101, shoulder + 118, 12, 7, '#cf7430', 0);
    p.ell(cx + 138, shoulder + 126, 16, 10, '#993d16', 2.5);
    p.ell(cx + 137, shoulder + 124, 12, 7, '#d98036', 0);
  } else if (pose === 'smirk') {
    // hand up to the shades
    p.stroke([[cx + 66, shoulder + 26], [cx + 96, shoulder - 24], [cx + 44, shoulder - 96]], 42, BILLIONAIRE.suit);
    p.dot(cx + 42, shoulder - 102, 18, '#f6cfae');
  } else if (pose === 'walk') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 96, shoulder + 96], [cx + 72, shoulder + 150]], 42, BILLIONAIRE.suit);
    p.stroke([[cx - 68, shoulder + 26], [cx - 92, shoulder + 96], [cx - 60, shoulder + 150]], 42, BILLIONAIRE.suit);
  } else {
    p.stroke([[cx + 66, shoulder + 26], [cx + 84, shoulder + 108], [cx + 68, shoulder + 178]], 42, BILLIONAIRE.suit);
    p.dot(cx + 68, shoulder + 184, 18, '#f6cfae');
  }

  // head
  const facing = 1;
  const hx = cx + 8;
  const hy = shoulder - 104;
  const { pts } = head(p, hx, hy, 100, 41, facing, '#f6cfae');
  p.clip(pts, () => {
    p.poly([[hx - 112, hy - 46], [hx + 112, hy - 46], [hx + 112, hy - 132], [hx - 112, hy - 132]], BILLIONAIRE.hair, 0);
    p.poly([[hx - 112, hy + 14], [hx - 74, hy + 6], [hx - 80, hy - 60]], BILLIONAIRE.hair, 0);
  });
  p.inkRing(pts, 7, thick);
  shades(p, hx, hy - 4);
  if (pose === 'smirk') {
    p.arc(hx + 4, hy + 40, 20, 13, 12, 158, 5, INK);
  } else if (pose === 'handoff' || pose === 'pay') {
    p.stroke([[hx - 16, hy + 40], [hx + 18, hy + 38]], 5, INK);
  } else {
    p.stroke([[hx - 14, hy + 40], [hx + 16, hy + 40]], 5, INK);
  }
}

// ---------------------------------------------------------------- banker

export function drawBanker(p: Pen, pose: Pose) {
  const cx = 300;
  const ankle = 975;
  const hip = 648;
  const shoulder = 424;
  const thick = thickAngle(rad(-118));

  legs(p, cx, hip, ankle, '#3a4048', BANKER.shoe, 30);

  const torso = blobPts(cx, 540, {
    a: 104, b: 122, nTop: 2.2, nBot: 2.5, egg: 0.09, asym: -0.03, rot: 0, noise: 0.005, seed: 88,
  });
  p.gradFill(torso, BANKER.vest, shade(BANKER.vest, 0.6), rad(-118));
  p.inkRing(torso, 8, thick);

  p.poly([[cx - 20, shoulder - 8], [cx + 20, shoulder - 8], [cx, shoulder + 34]], BANKER.shirt, 3);
  p.stroke([[cx - 5, shoulder + 30], [cx + 5, shoulder + 30], [cx + 4, shoulder + 100], [cx - 4, shoulder + 100]], 12, BANKER.tie);
  p.dot(cx, shoulder + 56, 3.5, '#f4d98a');
  p.dot(cx, shoulder + 88, 3.5, '#f4d98a');

  if (pose === 'confused') {
    // scratching temple, other hand holding pennies
    p.stroke([[cx - 70, shoulder + 28], [cx - 104, shoulder + 24], [cx - 48, shoulder - 74]], 40, BANKER.vest);
    p.dot(cx - 46, shoulder - 80, 17, '#f2c39d');
    p.stroke([[cx + 70, shoulder + 28], [cx + 100, shoulder + 92], [cx + 84, shoulder + 140]], 40, BANKER.vest);
    p.dot(cx + 84, shoulder + 146, 18, '#f2c39d');
    p.ell(cx + 78, shoulder + 132, 10, 5, '#b56a2a', 2.5);
    p.ell(cx + 92, shoulder + 128, 10, 5, '#c9793a', 2.5);
  } else if (pose === 'hold') {
    // forearms up, presenting the two cents at chest height
    p.stroke([[cx - 70, shoulder + 28], [cx - 92, shoulder + 92], [cx - 52, shoulder + 70]], 40, BANKER.vest);
    p.stroke([[cx + 70, shoulder + 28], [cx + 92, shoulder + 92], [cx + 52, shoulder + 70]], 40, BANKER.vest);
    p.ell(cx - 44, shoulder + 78, 19, 12, '#f2c39d', 3);
    p.ell(cx + 44, shoulder + 78, 19, 12, '#f2c39d', 3);
    // two cents, catching the light
    p.ell(cx - 26, shoulder + 70, 26, 20, '#a9561e', 3.5);
    p.ell(cx - 28, shoulder + 67, 21, 15, '#d07a30', 0);
    p.ell(cx - 33, shoulder + 59, 8, 6, '#f2ab63', 0);
    p.ell(cx + 26, shoulder + 70, 26, 20, '#a9561e', 3.5);
    p.ell(cx + 24, shoulder + 67, 21, 15, '#d78033', 0);
    p.ell(cx + 17, shoulder + 59, 8, 6, '#f7b874', 0);
    // denomination marks: a 1 and a cent sign
    p.stroke([[cx - 33, shoulder + 65], [cx - 28, shoulder + 60]], 3.5, '#7a3712');
    p.stroke([[cx - 28, shoulder + 60], [cx - 28, shoulder + 77]], 3.5, '#7a3712');
    p.stroke([[cx - 34, shoulder + 77], [cx - 22, shoulder + 77]], 3.5, '#7a3712');
    p.arc(cx + 24, shoulder + 70, 8, 8, 40, 320, 3.5, '#7a3712');
    p.stroke([[cx + 27, shoulder + 58], [cx + 21, shoulder + 82]], 3, '#7a3712');
  } else if (pose === 'receive') {
    p.stroke([[cx - 70, shoulder + 28], [cx - 66, shoulder + 96], [cx - 34, shoulder + 112]], 40, BANKER.vest);
    p.stroke([[cx + 70, shoulder + 28], [cx + 66, shoulder + 96], [cx + 34, shoulder + 112]], 40, BANKER.vest);
    p.ell(cx - 30, shoulder + 114, 18, 11, '#f2c39d', 3);
    p.ell(cx + 30, shoulder + 114, 18, 11, '#f2c39d', 3);
    // one dollar bill + the key fob, now the bank's
    p.poly([[cx - 28, shoulder + 82], [cx + 34, shoulder + 78], [cx + 38, shoulder + 106], [cx - 24, shoulder + 110]], '#1c7a45', 3);
    p.stroke([[cx - 6, shoulder + 88], [cx - 4, shoulder + 102]], 5, '#0e4f2c');
    p.poly([[cx + 16, shoulder + 94], [cx + 40, shoulder + 92], [cx + 38, shoulder + 120], [cx + 14, shoulder + 122]], '#e0b23c', 3.5);
    p.arc(cx + 18, shoulder + 90, 9, 9, 200, 520, 3, '#cfd4dd');
  } else if (pose === 'lend') {
    p.stroke([[cx - 70, shoulder + 28], [cx - 92, shoulder + 84], [cx - 60, shoulder + 104]], 40, BANKER.vest);
    p.stroke([[cx + 70, shoulder + 28], [cx + 92, shoulder + 84], [cx + 62, shoulder + 104]], 40, BANKER.vest);
    p.dot(cx - 58, shoulder + 108, 17, '#f2c39d');
    p.dot(cx + 60, shoulder + 108, 17, '#f2c39d');
    p.poly([[cx - 40, shoulder + 84], [cx + 44, shoulder + 78], [cx + 48, shoulder + 106], [cx - 36, shoulder + 112]], '#1c7a45', 3);
    p.dot(cx + 4, shoulder + 94, 6, '#7fd8a2');
  } else {
    p.stroke([[cx - 70, shoulder + 28], [cx - 92, shoulder + 92], [cx - 66, shoulder + 122]], 40, BANKER.vest);
    p.stroke([[cx + 70, shoulder + 28], [cx + 92, shoulder + 92], [cx + 66, shoulder + 122]], 40, BANKER.vest);
    p.ell(cx - 60, shoulder + 128, 15, 10, '#f2c39d', 3);
    p.ell(cx + 60, shoulder + 128, 15, 10, '#f2c39d', 3);
  }

  const hx = cx - 4;
  const hy = shoulder - 106;
  const { pts } = head(p, hx, hy, 106, 88, -1, '#f2c39d');
  // receding hair: side tufts + a low crown strip
  p.clip(pts, () => {
    p.ell(hx - 80, hy - 4, 21, 40, BANKER.hair, 0);
    p.ell(hx + 80, hy - 4, 21, 40, BANKER.hair, 0);
    p.poly([[hx - 88, hy - 62], [hx + 88, hy - 68], [hx + 80, hy - 88], [hx - 80, hy - 84]], BANKER.hair, 0);
  });
  p.inkRing(pts, 7, thick);

  spectacles(p, hx, hy - 2);
  if (pose === 'confused') {
    p.arc(hx - 23, hy - 30, 14, 7, 200, 340, 4.5);
    p.arc(hx + 23, hy - 34, 16, 8, 200, 340, 4.5);
    p.dot(hx - 23, hy - 2, 4, INK);
    p.dot(hx + 23, hy - 2, 4, INK);
    p.ell(hx, hy + 44, 9, 12, '#5a1e28', 3);
  } else if (pose === 'hold') {
    p.arc(hx - 23, hy - 32, 12, 5, 200, 340, 3.5);
    p.arc(hx + 23, hy - 32, 12, 5, 200, 340, 3.5);
    p.dot(hx - 23, hy - 2, 4, INK);
    p.dot(hx + 23, hy - 2, 4, INK);
    p.stroke([[hx - 13, hy + 46], [hx + 13, hy + 44]], 4.5, INK);
    p.stroke([[hx - 13, hy + 46], [hx - 17, hy + 42]], 3, INK);
    p.stroke([[hx + 13, hy + 44], [hx + 17, hy + 40]], 3, INK);
  } else {
    p.dot(hx - 23, hy - 2, 4, INK);
    p.dot(hx + 23, hy - 2, 4, INK);
    p.stroke([[hx - 8, hy + 44], [hx + 14, hy + 42]], 4, INK);
  }
}

// ---------------------------------------------------------------- guard

export function drawGuard(p: Pen, pose: Pose) {
  const cx = 300;
  const ankle = 975;
  const hip = 640;
  const shoulder = 416;
  const thick = thickAngle(rad(-118));

  legs(p, cx, hip, ankle, GUARD.clothDark, '#0b0d11', 28);
  const torso = blobPts(cx, 528, {
    a: 92, b: 112, nTop: 2.05, nBot: 2.35, egg: -0.04, asym: 0, rot: 0, noise: 0.004, seed: 55,
  });
  p.gradFill(torso, GUARD.cloth, shade(GUARD.cloth, 0.6), rad(-118));
  p.inkRing(torso, 8, thick);
  p.stroke([[cx - 62, hip + 6], [cx + 62, hip + 6]], 12, GUARD.belt);
  p.dot(cx + 26, shoulder + 54, 8, '#e8c45a');
  p.stroke([[cx - 60, shoulder + 4], [cx + 60, shoulder + 4]], 8, shade(GUARD.cloth, 1.25));

  if (pose === 'salute') {
    p.stroke([[cx + 66, shoulder + 26], [cx + 98, shoulder - 6], [cx + 40, shoulder - 74]], 40, GUARD.cloth);
    p.dot(cx + 38, shoulder - 82, 18, '#e9e4d8');
    p.stroke([[cx - 66, shoulder + 26], [cx - 74, shoulder + 104], [cx - 60, hip + 34]], 40, GUARD.cloth);
    p.dot(cx - 58, hip + 40, 18, '#e9e4d8');
  } else {
    p.stroke([[cx - 66, shoulder + 26], [cx - 76, shoulder + 104], [cx - 60, hip + 34]], 40, GUARD.cloth);
    p.stroke([[cx + 66, shoulder + 26], [cx + 76, shoulder + 104], [cx + 60, hip + 34]], 40, GUARD.cloth);
    p.dot(cx - 58, hip + 40, 18, '#e9e4d8');
    p.dot(cx + 58, hip + 40, 18, '#e9e4d8');
  }

  const hx = cx;
  const hy = shoulder - 108;
  const { pts } = head(p, hx, hy, 100, 55, 0, '#f0c39c');
  p.inkRing(pts, 7, thick);
  // peaked cap
  p.poly([[hx - 62, hy - 44], [hx + 62, hy - 44], [hx + 52, hy - 104], [hx - 52, hy - 104]], GUARD.cap, 4);
  p.stroke([[hx - 70, hy - 44], [hx + 70, hy - 44]], 9, '#0b0d11');
  p.dot(hx, hy - 72, 6, '#e8c45a');
  // stern face
  p.stroke([[hx - 26, hy - 10], [hx - 10, hy - 6]], 4.5, INK);
  p.stroke([[hx + 10, hy - 6], [hx + 26, hy - 10]], 4.5, INK);
  p.dot(hx - 20, hy + 2, 4, INK);
  p.dot(hx + 20, hy + 2, 4, INK);
  p.stroke([[hx - 12, hy + 40], [hx + 12, hy + 40]], 4.5, INK);
}

// ---------------------------------------------------------------- card wrapper

export function Card({
  draw,
  drawKey = '',
  position,
  rotationY = 0,
  scale = 1,
  shadow = '#2a2f3a',
  flip = false,
}: {
  draw: (p: Pen) => void;
  drawKey?: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  shadow?: string;
  flip?: boolean;
}) {
  const { height } = useVideoConfig();
  const surface = useMemo(() => {
    const canvas = document.createElement('canvas');
    const RES = 3;
    canvas.width = 600 * RES;
    canvas.height = 1000 * RES;
    const context = canvas.getContext('2d')!;
    context.scale(RES, RES);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { context, texture };
  }, []);

  const blob = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    fxContact(new Pen(context), shadow);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [shadow]);

  const material = useMemo(() => {
    const m = cardShade(
      new THREE.MeshLambertMaterial({ map: surface.texture, alphaTest: 0.45, side: THREE.DoubleSide })
    );
    return m;
  }, [surface]);

  useLayoutEffect(() => {
    const ctx = surface.context;
    ctx.clearRect(0, 0, 600, 1000);
    draw(new Pen(ctx));
    surface.texture.needsUpdate = true;
    CARD_K.uPx.value = height / 1920;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawKey, surface, height]);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(600 * SU * scale, 1000 * SU * scale);
    g.translate(0, (975 - 500) * SU * scale, 0);
    return g;
  }, [scale]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group scale={[flip ? -1 : 1, 1, 1]}>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
          <planeGeometry args={[1.05 * scale, 0.62 * scale]} />
          <primitive object={blobMaterial(blob)} attach="material" />
        </mesh>
        <mesh geometry={geometry} material={material} renderOrder={2} receiveShadow />
      </group>
    </group>
  );
}
