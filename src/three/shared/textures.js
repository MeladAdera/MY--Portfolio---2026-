import * as THREE from 'three';

import { clamp, mulberry32 } from './math';

/* ---------- procedural surfaces ---------- */
export function tileNoise(size, octaves, rnd, base) {
  const out = new Float32Array(size * size);
  let amp = 1,
    total = 0;
  for (let o = 0; o < octaves; o++) {
    const n = base << o;
    const lat = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) lat[i] = rnd();
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * n,
        y0 = Math.floor(fy),
        ty = fy - y0,
        sy = ty * ty * (3 - 2 * ty),
        y1 = (y0 + 1) % n;
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * n,
          x0 = Math.floor(fx),
          tx = fx - x0,
          sx = tx * tx * (3 - 2 * tx),
          x1 = (x0 + 1) % n;
        const a = lat[y0 * n + x0],
          b = lat[y0 * n + x1],
          c = lat[y1 * n + x0],
          d = lat[y1 * n + x1];
        out[y * size + x] +=
          amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
      }
    }
    total += amp;
    amp *= 0.55;
  }
  for (let j = 0; j < out.length; j++) out[j] /= total;
  return out;
}

export function surface(opts) {
  const size = opts.size,
    rnd = mulberry32(opts.seed);
  const noise = tileNoise(size, 6, rnd, opts.scale || 4);
  const fine = tileNoise(size, 2, rnd, 64);
  const col = document.createElement('canvas'),
    rough = document.createElement('canvas');
  col.width = col.height = rough.width = rough.height = size;
  const cg = col.getContext('2d'),
    rg = rough.getContext('2d');
  const cid = cg.createImageData(size, size),
    rid = rg.createImageData(size, size);
  const b = opts.color;
  for (let p = 0; p < size * size; p++) {
    const n =
      (noise[p] - 0.5) * opts.variation +
      (fine[p] - 0.5) * opts.variation * 0.5 +
      (rnd() - 0.5) * opts.grain;
    cid.data[p * 4] = clamp(b[0] * (1 + n), 0, 255);
    cid.data[p * 4 + 1] = clamp(b[1] * (1 + n), 0, 255);
    cid.data[p * 4 + 2] = clamp(b[2] * (1 + n * 0.95), 0, 255);
    cid.data[p * 4 + 3] = 255;
    const r = clamp(opts.roughness * 255 + (noise[p] - 0.5) * 60 + (rnd() - 0.5) * 30, 0, 255);
    rid.data[p * 4] = rid.data[p * 4 + 1] = rid.data[p * 4 + 2] = r;
    rid.data[p * 4 + 3] = 255;
  }
  cg.putImageData(cid, 0, 0);
  rg.putImageData(rid, 0, 0);
  for (let k = 0; k < (opts.pores || 0); k++) {
    const px = rnd() * size,
      py = rnd() * size,
      pr = 0.4 + rnd() * 1.4;
    cg.fillStyle = 'rgba(70,62,52,' + (0.08 + rnd() * 0.14).toFixed(3) + ')';
    cg.beginPath();
    cg.arc(px, py, pr, 0, Math.PI * 2);
    cg.fill();
  }
  if (opts.decorate) opts.decorate(cg, size, rnd);
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(rough);
  for (const t of [map, roughnessMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    t.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  return { map, roughnessMap };
}

export function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.5)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* a vertical or horizontal gradient as a texture (sky, terrace) */
export function gradientTexture(stops, w, h, vertical) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const gr = vertical ? g.createLinearGradient(0, 0, 0, h) : g.createLinearGradient(0, 0, w, 0);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
