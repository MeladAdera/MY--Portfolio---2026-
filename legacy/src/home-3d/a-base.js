/* Builder v3 — Connected Systems. Real-time homepage scene for Melad Adera.
   Bundled with three.js into one IIFE that exposes window.MeladBuilderV3.mount(canvas, options). */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ---------- math helpers ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const ramp = (t, t0, t1) => smoother(clamp((t - t0) / (t1 - t0), 0, 1));
const lerp = (a, b, k) => a + (b - a) * k;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const vlerp = (a, b, k) => V(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
const UP = V(0, 1, 0);

/* Hermite track through [time, value] keys. Zero tangent at holds and extrema, so nothing overshoots. */
function track(keys) {
  const n = keys.length;
  const isArr = Array.isArray(keys[0][1]);
  const dim = isArr ? keys[0][1].length : 1;
  const val = (i, d) => (isArr ? keys[i][1][d] : keys[i][1]);
  const tan = keys.map((k, i) => {
    const out = [];
    for (let d = 0; d < dim; d++) {
      if (i === 0 || i === n - 1) { out.push(0); continue; }
      const p0 = val(i - 1, d), p1 = val(i, d), p2 = val(i + 1, d);
      if ((p1 - p0) * (p2 - p1) <= 0) { out.push(0); continue; }
      const m = (p2 - p0) / (keys[i + 1][0] - keys[i - 1][0]);
      const lim = 3 * Math.min(Math.abs(p1 - p0) / (keys[i][0] - keys[i - 1][0]), Math.abs(p2 - p1) / (keys[i + 1][0] - keys[i][0]));
      out.push(Math.sign(m) * Math.min(Math.abs(m), lim));
    }
    return out;
  });
  return (t) => {
    if (t <= keys[0][0]) return isArr ? keys[0][1].slice() : keys[0][1];
    if (t >= keys[n - 1][0]) return isArr ? keys[n - 1][1].slice() : keys[n - 1][1];
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const t0 = keys[i][0], h = keys[i + 1][0] - t0, u = (t - t0) / h;
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const res = [];
    for (let d = 0; d < dim; d++) res.push(h00 * val(i, d) + h10 * h * tan[i][d] + h01 * val(i + 1, d) + h11 * h * tan[i + 1][d]);
    return isArr ? res : res[0];
  };
}

/* ---------- procedural surfaces ---------- */
function tileNoise(size, octaves, rnd, base) {
  const out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const n = base << o;
    const lat = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) lat[i] = rnd();
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * n, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = (y0 + 1) % n;
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * n, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % n;
        const a = lat[y0 * n + x0], b = lat[y0 * n + x1], c = lat[y1 * n + x0], d = lat[y1 * n + x1];
        out[y * size + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
      }
    }
    total += amp; amp *= 0.55;
  }
  for (let j = 0; j < out.length; j++) out[j] /= total;
  return out;
}

function surface(opts) {
  const size = opts.size, rnd = mulberry32(opts.seed);
  const noise = tileNoise(size, 6, rnd, opts.scale || 4);
  const fine = tileNoise(size, 2, rnd, 64);
  const col = document.createElement('canvas'), rough = document.createElement('canvas');
  col.width = col.height = rough.width = rough.height = size;
  const cg = col.getContext('2d'), rg = rough.getContext('2d');
  const cid = cg.createImageData(size, size), rid = rg.createImageData(size, size);
  const b = opts.color;
  for (let p = 0; p < size * size; p++) {
    const n = (noise[p] - 0.5) * opts.variation + (fine[p] - 0.5) * opts.variation * 0.5 + (rnd() - 0.5) * opts.grain;
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
    const px = rnd() * size, py = rnd() * size, pr = 0.4 + rnd() * 1.4;
    cg.fillStyle = 'rgba(70,62,52,' + (0.08 + rnd() * 0.14).toFixed(3) + ')';
    cg.beginPath(); cg.arc(px, py, pr, 0, Math.PI * 2); cg.fill();
  }
  if (opts.decorate) opts.decorate(cg, size, rnd);
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(rough);
  for (const t of [map, roughnessMap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(opts.repeat[0], opts.repeat[1]); }
  return { map, roughnessMap };
}

function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.5)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- geometry ---------- */
function bevelBox(w, h, d, b) {
  const hw = w / 2 - b, hh = h / 2 - b;
  const s = new THREE.Shape();
  s.moveTo(-hw, -hh); s.lineTo(hw, -hh); s.lineTo(hw, hh); s.lineTo(-hw, hh); s.lineTo(-hw, -hh);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, steps: 1, curveSegments: 1 });
  g.translate(0, 0, -(d - 2 * b) / 2);
  return g;
}
function lathe(profile, segs, zScale) {
  const g = new THREE.LatheGeometry(profile.map((p) => new THREE.Vector2(p[0], p[1])), segs);
  g.scale(1, 1, zScale);
  g.computeVertexNormals();
  return g;
}

/* ---------- character (v2: sculpted surfaces, jointed hands) ---------- */
const DIM = {
  hipHalf: 0.096, thigh: 0.44, shin: 0.42, ankle: 0.08,
  waist: 0.10, shoulderUp: 0.395, shoulderHalf: 0.186, neckUp: 0.445,
  upperArm: 0.29, forearm: 0.26, wristToGrip: 0.072
};

/* Stack of horizontal rings, bottom to top: [y, halfWidth, halfDepth, zOffset, power]. Power > 2 squares the section. */
function ringLoft(rings, segs, capBottom, capTop) {
  const pos = [], idx = [], n = segs;
  for (const r of rings) {
    const p = r[4] || 2;
    for (let j = 0; j < n; j++) {
      const th = (j / n) * Math.PI * 2;
      const c = Math.cos(th), s = Math.sin(th);
      pos.push(Math.sign(c) * Math.pow(Math.abs(c), 2 / p) * r[1], r[0], Math.sign(s) * Math.pow(Math.abs(s), 2 / p) * r[2] + r[3]);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j, b = i * n + ((j + 1) % n), c = (i + 1) * n + j, d = (i + 1) * n + ((j + 1) % n);
      idx.push(a, c, b, b, c, d);
    }
  }
  const cap = (ri, up) => {
    const r = rings[ri];
    const ci = pos.length / 3;
    pos.push(0, r[0], r[3]);
    for (let j = 0; j < n; j++) {
      const a = ri * n + j, b = ri * n + ((j + 1) % n);
      if (up) idx.push(ci, b, a); else idx.push(ci, a, b);
    }
  };
  if (capBottom) cap(0, false);
  if (capTop) cap(rings.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* A limb along +Y from 0 to L. prof: [[s, halfWidth, halfDepth, zOffset]] with s in 0..1. Rounded ends. */
function limbGeo(L, prof, segs) {
  const at = (s) => {
    let i = 0;
    while (i < prof.length - 2 && s > prof[i + 1][0]) i++;
    const a = prof[i], b = prof[i + 1], k = clamp((s - a[0]) / (b[0] - a[0]), 0, 1);
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
  };
  const rings = [];
  const r0 = at(0), r1 = at(1), N = 5;
  const R0 = (r0[0] + r0[1]) / 2, R1 = (r1[0] + r1[1]) / 2;
  for (let k = N; k >= 1; k--) {
    const a = (k / N) * Math.PI / 2 * 0.985;
    rings.push([-Math.sin(a) * R0 * 0.85, r0[0] * Math.cos(a), r0[1] * Math.cos(a), r0[2], 2]);
  }
  const body = 14;
  for (let i = 0; i <= body; i++) {
    const s = i / body, r = at(s);
    rings.push([s * L, r[0], r[1], r[2], 2]);
  }
  for (let k = 1; k <= N; k++) {
    const a = (k / N) * Math.PI / 2 * 0.985;
    rings.push([L + Math.sin(a) * R1 * 0.85, r1[0] * Math.cos(a), r1[1] * Math.cos(a), r1[2], 2]);
  }
  return ringLoft(rings, segs || 22, true, true);
}

/* skull, jaw, chin, brow and nose as one continuous surface (face toward -z) */
function sculptedHead() {
  const g = new THREE.SphereGeometry(1, 56, 40);
  const a = g.attributes.position;
  const sm = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), y = a.getY(i), z = a.getZ(i);
    const front = sm(-0.35, -0.95, z);
    let px = x * 0.075 * (1 - 0.26 * sm(0.05, -0.95, y));
    let py = y * 0.106;
    let pz = z * 0.094;
    if (z > 0) { pz *= 1.06; py += 0.008 * z; }
    pz -= 0.013 * sm(-0.15, -0.85, y) * Math.max(0, -z);
    pz -= 0.006 * Math.exp(-((y - 0.24) * (y - 0.24)) / 0.008) * front;
    pz -= 0.019 * Math.exp(-(x * x / 0.01 + (y + 0.06) * (y + 0.06) / 0.035)) * front;
    pz += 0.006 * Math.exp(-(x * x / 0.03 + (y - 0.08) * (y - 0.08) / 0.01)) * front;
    a.setXYZ(i, px, py, pz);
  }
  g.computeVertexNormals();
  return g;
}

/* a short fabric fold: an arc of a thin ring wrapped around a limb at local height y, centred on angle c */
function foldArc(r, y, c, arc) {
  const g = new THREE.TorusGeometry(r, 0.0028, 6, 18, arc);
  g.rotateZ(-arc / 2);
  g.rotateX(Math.PI / 2);
  g.rotateY(-c);
  g.translate(0, y, 0);
  return g;
}

const THIGH_PROF = [[0, 0.09, 0.092, 0.004], [0.2, 0.086, 0.09, 0.004], [0.5, 0.077, 0.08, 0.002], [0.82, 0.066, 0.067, 0], [1, 0.062, 0.064, 0]];
const PELVIS_RINGS = [
  [-0.14, 0.05, 0.05, 0.0, 2],
  [-0.13, 0.095, 0.075, 0.004, 2],
  [-0.10, 0.142, 0.103, 0.008, 2.2],
  [-0.06, 0.163, 0.116, 0.01, 2.3],
  [-0.01, 0.163, 0.114, 0.007, 2.3],
  [0.05, 0.157, 0.11, 0.003, 2.3],
  [0.1, 0.152, 0.106, 0.0, 2.3]
];
