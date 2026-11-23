import * as THREE from 'three';

/** Create deterministic, small-scale procedural surface maps. Call from useMemo. */
export function makeScuffedMap(base: string, seed = 1, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  let state = (seed >>> 0) || 1;
  const next = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  for (let i = 0; i < 520; i++) {
    const alpha = .025 + next() * .10;
    ctx.fillStyle = next() > .5 ? `rgba(255,244,220,${alpha})` : `rgba(19,25,33,${alpha})`;
    const w = .5 + next() * 4.5;
    const h = .5 + next() * 1.8;
    ctx.fillRect(next() * size, next() * size, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function makeLabelMap(title: string, accent: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#f4e9cc'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = accent; ctx.fillRect(0, 0, size, 49);
  ctx.fillStyle = '#fff7df'; ctx.fillRect(18, 69, size - 36, 9);
  ctx.fillStyle = '#d8cdb4'; ctx.fillRect(18, 91, size - 36, 5);
  ctx.fillStyle = '#332d32';
  ctx.font = 'bold 29px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.slice(0, 13).toUpperCase(), size / 2, 42, size - 20);
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.ellipse(size / 2, 171, 55, 43, -.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#382e31'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#f5e9c9'; ctx.fillRect(30, size - 42, size - 60, 5);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function surfaceMaterial(color: THREE.ColorRepresentation, roughness = .72, map?: THREE.Texture) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...(map ? { map } : {}) });
}
