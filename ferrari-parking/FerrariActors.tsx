import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { cardShade, blobMaterial } from '../upstream/templates/bridge/cardshade';
import { NOINK } from '../upstream/templates/bridge/ink';
import {
  Pen, blobPts, headBlob, thickAngle, INK, SKIN, shade, mix, fxContact,
} from '../upstream/templates/bridge/toon';

export const CARD_SCALE = 0.00216; // 1000 units = 2.16m

export function paintSurface(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas2D context not available');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, context, texture };
}

// ---------------- BILLIONAIRE DRAWING ----------------
export function drawBillionaire(
  pen: Pen,
  action: 'keys' | 'pennies' | 'smirk' | 'stand',
  facing = 1,
  light = -Math.PI / 3
) {
  const thick = thickAngle(light);
  const cx = 300;
  const ankle = 975;
  const hip = 630;
  const shoulder = 420;
  const unit = 2.36; // unit scale
  
  // Legs
  pen.stroke([[cx - 24, hip], [cx - 26, ankle - 15], [cx - 30, ankle]], 18, '#0f172a');
  pen.stroke([[cx + 24, hip], [cx + 26, ankle - 15], [cx + 30, ankle]], 18, '#0f172a');
  // Dress Shoes
  pen.poly([[cx - 48, ankle - 6], [cx - 8, ankle - 6], [cx - 14, ankle + 12], [cx - 46, ankle + 12]], '#09090b', 3);
  pen.poly([[cx + 8, ankle - 6], [cx + 48, ankle - 6], [cx + 46, ankle + 12], [cx + 14, ankle + 12]], '#09090b', 3);

  // Torso (Tailored suit jacket)
  const torso = blobPts(cx, shoulder + 105, {
    a: 84, b: 120, nTop: 2.1, nBot: 2.4, egg: -0.08, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: 42,
  });
  pen.gradFill(torso, '#1e293b', shade('#1e293b', 0.65), light);
  pen.inkRing(torso, 8, thick);

  // White collared shirt & gold tie
  pen.poly([[cx - 18, shoulder - 10], [cx + 18, shoulder - 10], [cx, shoulder + 35]], '#f8fafc', 3);
  pen.poly([[cx - 7, shoulder + 15], [cx + 7, shoulder + 15], [cx + 5, shoulder + 95], [cx - 5, shoulder + 95]], '#eab308', 3);

  // Arms & Props
  if (action === 'keys') {
    // Left arm resting
    pen.stroke([[cx - 65, shoulder + 15], [cx - 80, shoulder + 90], [cx - 72, shoulder + 160]], 15, '#1e293b');
    pen.dot(cx - 72, shoulder + 165, 11, '#e2e8f0');

    // Right arm extending forward holding keys & $1 bill
    const handX = cx + 125 * facing;
    const handY = shoulder + 100;
    pen.stroke([[cx + 65, shoulder + 15], [cx + 100, shoulder + 55], [handX, handY]], 15, '#1e293b');
    pen.dot(handX, handY, 12, '#f8fafc');

    // $1 dollar bill in hand
    pen.poly([[handX - 5, handY - 18], [handX + 38, handY - 26], [handX + 44, handY + 6], [handX + 2, handY + 12]], '#15803d', 3);
    pen.dot(handX + 20, handY - 8, 4, '#86efac'); // seal

    // Ferrari Gold Key Fob dangling
    const keyY = handY + 22;
    pen.poly([[handX + 15, keyY], [handX + 35, keyY - 4], [handX + 32, keyY + 25], [handX + 12, keyY + 28]], '#eab308', 3);
    pen.dot(handX + 24, keyY + 12, 4, '#1c1917'); // horse emblem dot
    pen.arc(handX + 16, keyY - 4, 7, 7, 0, 360, 2.5, '#d4d4d8'); // metal key ring
  } else if (action === 'pennies') {
    // Dropping pennies
    const handX = cx + 115 * facing;
    const handY = shoulder + 110;
    pen.stroke([[cx + 65, shoulder + 15], [cx + 95, shoulder + 65], [handX, handY]], 15, '#1e293b');
    pen.dot(handX, handY, 12, '#f8fafc');

    // Two copper pennies dropping
    pen.ell(handX + 10, handY + 25, 10, 6, '#b45309', 2.5); // penny 1
    pen.ell(handX + 25, handY + 45, 9, 6, '#d97706', 2.5); // penny 2
  } else {
    // Smirk / relaxed pose: hands in pockets or adjusting shades
    pen.stroke([[cx - 65, shoulder + 15], [cx - 85, shoulder + 80], [cx - 50, hip - 10]], 15, '#1e293b');
    if (action === 'smirk') {
      // Hand touching sunglasses
      pen.stroke([[cx + 65, shoulder + 15], [cx + 85, shoulder + 60], [cx + 45, shoulder - 75]], 15, '#1e293b');
      pen.dot(cx + 45, shoulder - 80, 11, '#f8fafc');
    } else {
      pen.stroke([[cx + 65, shoulder + 15], [cx + 85, shoulder + 80], [cx + 50, hip - 10]], 15, '#1e293b');
    }
  }

  // Head
  const headX = cx + 12 * facing;
  const headY = shoulder - 105;
  const head = headBlob(101, 105, facing);
  const headPts = blobPts(headX, headY, head);
  pen.shadedFill(headPts, SKIN, shade(SKIN, 0.88), light, head.a);

  // Slick dark hair
  pen.clip(headPts, () => {
    pen.poly([[headX - 110, headY - 40], [headX + 110, headY - 40], [headX + 110, headY - 120], [headX - 110, headY - 120]], '#18181b', 0);
  });
  pen.inkRing(headPts, 7, thick);

  // Aviator Sunglasses
  const glassY = headY - 8;
  pen.poly([[headX - 42, glassY - 14], [headX - 6, glassY - 14], [headX - 10, glassY + 22], [headX - 38, glassY + 20]], '#09090b', 3);
  pen.poly([[headX + 6, glassY - 14], [headX + 42, glassY - 14], [headX + 38, glassY + 20], [headX + 10, glassY + 22]], '#09090b', 3);
  pen.stroke([[headX - 6, glassY - 10], [headX + 6, glassY - 10]], 3.5, '#eab308'); // gold bridge

  // Mouth
  if (action === 'smirk') {
    // Satisfied grin/smirk
    pen.arc(headX + 8, headY + 36, 18, 12, 10, 160, 4.5, INK);
  } else {
    // Cool deadpan line
    pen.stroke([[headX - 14, headY + 38], [headX + 18, headY + 36]], 4.5, INK);
  }
}

// ---------------- BANKER DRAWING ----------------
export function drawBanker(
  pen: Pen,
  action: 'take_keys' | 'confused' | 'hold_pennies',
  facing = -1,
  light = -Math.PI / 3
) {
  const thick = thickAngle(light);
  const cx = 300;
  const ankle = 975;
  const hip = 640;
  const shoulder = 430;

  // Legs & Shoes
  pen.stroke([[cx - 25, hip], [cx - 25, ankle]], 20, '#334155');
  pen.stroke([[cx + 25, hip], [cx + 25, ankle]], 20, '#334155');
  pen.poly([[cx - 50, ankle - 6], [cx - 8, ankle - 6], [cx - 10, ankle + 12], [cx - 48, ankle + 12]], '#1e293b', 3);
  pen.poly([[cx + 8, ankle - 6], [cx + 50, ankle - 6], [cx + 48, ankle + 12], [cx + 10, ankle + 12]], '#1e293b', 3);

  // Stout Torso (Banker vest)
  const torso = blobPts(cx, shoulder + 105, {
    a: 98, b: 125, nTop: 2.3, nBot: 2.5, egg: 0.1, asym: -0.04 * facing, rot: 0, noise: 0.006, seed: 88,
  });
  pen.gradFill(torso, '#0f766e', shade('#0f766e', 0.65), light); // green bankers vest
  pen.inkRing(torso, 8, thick);

  // White collared shirt & brass buttons
  pen.poly([[cx - 16, shoulder - 12], [cx + 16, shoulder - 12], [cx, shoulder + 30]], '#ffffff', 3);
  pen.stroke([[cx - 4, shoulder + 30], [cx + 4, shoulder + 30], [cx + 3, shoulder + 100], [cx - 3, shoulder + 100]], 5, '#854d0e'); // tie
  pen.dot(cx, shoulder + 55, 3.5, '#fde047');
  pen.dot(cx, shoulder + 85, 3.5, '#fde047');

  // Arms
  if (action === 'confused' || action === 'hold_pennies') {
    // One hand scratching temple, other holding pennies
    pen.stroke([[cx - 70, shoulder + 15], [cx - 95, shoulder + 20], [cx - 45, shoulder - 70]], 15, '#ffffff'); // scratch head
    pen.dot(cx - 45, shoulder - 75, 11, SKIN);

    const handX = cx + 80 * facing;
    const handY = shoulder + 90;
    pen.stroke([[cx + 70, shoulder + 15], [cx + 90, shoulder + 60], [handX, handY]], 15, '#ffffff');
    pen.dot(handX, handY, 12, SKIN);

    // Two pennies in palm
    pen.ell(handX + 4, handY - 6, 8, 5, '#b45309', 2);
    pen.ell(handX + 14, handY - 4, 8, 5, '#d97706', 2);
  } else {
    // Hands resting forward on counter
    pen.stroke([[cx - 70, shoulder + 15], [cx - 85, shoulder + 80], [cx - 60, shoulder + 130]], 15, '#ffffff');
    pen.dot(cx - 60, shoulder + 135, 11, SKIN);
    pen.stroke([[cx + 70, shoulder + 15], [cx + 85, shoulder + 80], [cx + 60, shoulder + 130]], 15, '#ffffff');
    pen.dot(cx + 60, shoulder + 135, 11, SKIN);
  }

  // Head
  const headX = cx + 10 * facing;
  const headY = shoulder - 105;
  const head = headBlob(202, 110, facing);
  const headPts = blobPts(headX, headY, head);
  pen.shadedFill(headPts, '#fed7aa', shade('#fed7aa', 0.88), light, head.a);
  pen.inkRing(headPts, 7, thick);

  // Round Spectacles
  const specY = headY - 5;
  pen.ell(headX - 22, specY, 15, 15, '#ffffff22', 3.5);
  pen.ell(headX + 22, specY, 15, 15, '#ffffff22', 3.5);
  pen.stroke([[headX - 7, specY], [headX + 7, specY]], 3, '#94a3b8');

  // Eyebrows & Eyes
  if (action === 'confused' || action === 'hold_pennies') {
    // Raised high bewildered brows
    pen.arc(headX - 22, specY - 20, 12, 6, 200, 340, 4);
    pen.arc(headX + 22, specY - 24, 14, 7, 200, 340, 4);
    // Shock dots
    pen.dot(headX - 22, specY, 4, INK);
    pen.dot(headX + 22, specY, 4, INK);
    // Open 'o' mouth
    pen.ell(headX, headY + 36, 7, 10, '#5a1e28', 3);
  } else {
    pen.dot(headX - 22, specY, 4, INK);
    pen.dot(headX + 22, specY, 4, INK);
    pen.stroke([[headX - 12, headY + 35], [headX + 12, headY + 35]], 3.5, INK);
  }
}

// ---------------- GUARD DRAWING ----------------
export function drawGuard(pen: Pen, light = -Math.PI / 3) {
  const thick = thickAngle(light);
  const cx = 300;
  const ankle = 975;
  const hip = 630;
  const shoulder = 415;

  pen.stroke([[cx - 24, hip], [cx - 24, ankle]], 19, '#1e3a8a');
  pen.stroke([[cx + 24, hip], [cx + 24, ankle]], 19, '#1e3a8a');
  pen.poly([[cx - 45, ankle - 6], [cx - 6, ankle - 6], [cx - 8, ankle + 12], [cx - 43, ankle + 12]], '#09090b', 3);
  pen.poly([[cx + 6, ankle - 6], [cx + 45, ankle - 6], [cx + 43, ankle + 12], [cx + 8, ankle + 12]], '#09090b', 3);

  const torso = blobPts(cx, shoulder + 105, {
    a: 88, b: 120, nTop: 2.1, nBot: 2.4, egg: -0.05, asym: 0, rot: 0, noise: 0.005, seed: 55,
  });
  pen.gradFill(torso, '#1e3a8a', shade('#1e3a8a', 0.65), light);
  pen.inkRing(torso, 8, thick);

  // Security badge & belt
  pen.dot(cx - 32, shoulder + 45, 7, '#facc15'); // gold shield badge
  pen.stroke([[cx - 55, hip + 8], [cx + 55, hip + 8]], 10, '#09090b'); // black duty belt

  // Stiff arms at attention
  pen.stroke([[cx - 70, shoulder + 15], [cx - 75, shoulder + 90], [cx - 60, hip + 30]], 16, '#1e3a8a');
  pen.stroke([[cx + 70, shoulder + 15], [cx + 75, shoulder + 90], [cx + 60, hip + 30]], 16, '#1e3a8a');

  // Head & Peaked Cap
  const headX = cx;
  const headY = shoulder - 105;
  const head = headBlob(303, 105, 0);
  const headPts = blobPts(headX, headY, head);
  pen.shadedFill(headPts, SKIN, shade(SKIN, 0.88), light, head.a);
  pen.inkRing(headPts, 7, thick);

  // Peaked cap
  pen.poly([[headX - 60, headY - 45], [headX + 60, headY - 45], [headX + 50, headY - 110], [headX - 50, headY - 110]], '#1e3a8a', 4);
  pen.stroke([[headX - 68, headY - 45], [headX + 68, headY - 45]], 8, '#09090b'); // black visor
  pen.dot(headX, headY - 75, 6, '#facc15'); // cap badge

  // Stern face
  pen.stroke([[headX - 25, headY - 8], [headX - 10, headY - 4]], 4, INK);
  pen.stroke([[headX + 10, headY - 4], [headX + 25, headY - 8]], 4, INK);
  pen.stroke([[headX - 12, headY + 36], [headX + 12, headY + 36]], 4, INK);
}

// ---------------- REACT THREE FIBER CARD WRAPPERS ----------------
export function CharacterCardMesh({
  draw,
  position,
  rotationY = 0,
  scale = 1,
}: {
  draw: (pen: Pen) => void;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}) {
  const surface = useMemo(() => paintSurface(600, 1000), []);
  const contact = useMemo(() => {
    const s = paintSurface(128, 128);
    fxContact(new Pen(s.context), '#334155');
    s.texture.needsUpdate = true;
    return s;
  }, []);

  useEffect(() => {
    surface.context.clearRect(0, 0, 600, 1000);
    draw(new Pen(surface.context));
    surface.texture.needsUpdate = true;
  }, [draw, surface]);

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(600 * CARD_SCALE * scale, 1000 * CARD_SCALE * scale);
    g.translate(0, (975 - 500) * CARD_SCALE * scale, 0);
    return g;
  }, [scale]);

  const material = useMemo(() => {
    return cardShade(
      new THREE.MeshLambertMaterial({
        map: surface.texture,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
      })
    );
  }, [surface]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Contact Shadow Blob */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={0}
      >
        <planeGeometry args={[0.75 * scale, 0.45 * scale]} />
        <meshBasicMaterial
          map={contact.texture}
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>
      {/* 2D Toon Card */}
      <mesh
        geometry={geometry}
        material={material}
        renderOrder={1}
        receiveShadow
      />
    </group>
  );
}
