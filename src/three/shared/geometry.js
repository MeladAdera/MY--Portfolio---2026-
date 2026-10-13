import * as THREE from 'three';

import { clamp, lerp } from './math';

/* ---------- geometry ---------- */
export function bevelBox(w, h, d, b) {
  const hw = w / 2 - b,
    hh = h / 2 - b;
  const s = new THREE.Shape();
  s.moveTo(-hw, -hh);
  s.lineTo(hw, -hh);
  s.lineTo(hw, hh);
  s.lineTo(-hw, hh);
  s.lineTo(-hw, -hh);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d - 2 * b,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 1,
  });
  g.translate(0, 0, -(d - 2 * b) / 2);
  return g;
}

/* Stack of horizontal rings, bottom to top: [y, halfWidth, halfDepth, zOffset, power]. Power > 2 squares the section. */
export function ringLoft(rings, segs, capBottom, capTop) {
  const pos = [],
    idx = [],
    n = segs;
  for (const r of rings) {
    const p = r[4] || 2;
    for (let j = 0; j < n; j++) {
      const th = (j / n) * Math.PI * 2;
      const c = Math.cos(th),
        s = Math.sin(th);
      pos.push(
        Math.sign(c) * Math.pow(Math.abs(c), 2 / p) * r[1],
        r[0],
        Math.sign(s) * Math.pow(Math.abs(s), 2 / p) * r[2] + r[3],
      );
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j,
        b = i * n + ((j + 1) % n),
        c = (i + 1) * n + j,
        d = (i + 1) * n + ((j + 1) % n);
      idx.push(a, c, b, b, c, d);
    }
  }
  const cap = (ri, up) => {
    const r = rings[ri];
    const ci = pos.length / 3;
    pos.push(0, r[0], r[3]);
    for (let j = 0; j < n; j++) {
      const a = ri * n + j,
        b = ri * n + ((j + 1) % n);
      if (up) idx.push(ci, b, a);
      else idx.push(ci, a, b);
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
export function limbGeo(L, prof, segs) {
  const at = (s) => {
    let i = 0;
    while (i < prof.length - 2 && s > prof[i + 1][0]) i++;
    const a = prof[i],
      b = prof[i + 1],
      k = clamp((s - a[0]) / (b[0] - a[0]), 0, 1);
    return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
  };
  const rings = [];
  const r0 = at(0),
    r1 = at(1),
    N = 5;
  const R0 = (r0[0] + r0[1]) / 2,
    R1 = (r1[0] + r1[1]) / 2;
  for (let k = N; k >= 1; k--) {
    const a = (((k / N) * Math.PI) / 2) * 0.985;
    rings.push([-Math.sin(a) * R0 * 0.85, r0[0] * Math.cos(a), r0[1] * Math.cos(a), r0[2], 2]);
  }
  const body = 14;
  for (let i = 0; i <= body; i++) {
    const s = i / body,
      r = at(s);
    rings.push([s * L, r[0], r[1], r[2], 2]);
  }
  for (let k = 1; k <= N; k++) {
    const a = (((k / N) * Math.PI) / 2) * 0.985;
    rings.push([L + Math.sin(a) * R1 * 0.85, r1[0] * Math.cos(a), r1[1] * Math.cos(a), r1[2], 2]);
  }
  return ringLoft(rings, segs || 22, true, true);
}

/* skull, jaw, chin, brow and nose as one continuous surface (face toward -z) */
export function sculptedHead() {
  const g = new THREE.SphereGeometry(1, 56, 40);
  const a = g.attributes.position;
  const sm = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i),
      y = a.getY(i),
      z = a.getZ(i);
    const front = sm(-0.35, -0.95, z);
    let px = x * 0.075 * (1 - 0.26 * sm(0.05, -0.95, y));
    let py = y * 0.106;
    let pz = z * 0.094;
    if (z > 0) {
      pz *= 1.06;
      py += 0.008 * z;
    }
    pz -= 0.013 * sm(-0.15, -0.85, y) * Math.max(0, -z);
    pz -= 0.006 * Math.exp(-((y - 0.24) * (y - 0.24)) / 0.008) * front;
    pz -= 0.019 * Math.exp(-((x * x) / 0.01 + ((y + 0.06) * (y + 0.06)) / 0.035)) * front;
    pz += 0.006 * Math.exp(-((x * x) / 0.03 + ((y - 0.08) * (y - 0.08)) / 0.01)) * front;
    a.setXYZ(i, px, py, pz);
  }
  g.computeVertexNormals();
  return g;
}

/* a short fabric fold: an arc of a thin ring wrapped around a limb at local height y, centred on angle c */
export function foldArc(r, y, c, arc) {
  const g = new THREE.TorusGeometry(r, 0.0028, 6, 18, arc);
  g.rotateZ(-arc / 2);
  g.rotateX(Math.PI / 2);
  g.rotateY(-c);
  g.translate(0, y, 0);
  return g;
}

export const THIGH_PROF = [
  [0, 0.09, 0.092, 0.004],
  [0.2, 0.086, 0.09, 0.004],
  [0.5, 0.077, 0.08, 0.002],
  [0.82, 0.066, 0.067, 0],
  [1, 0.062, 0.064, 0],
];
export const PELVIS_RINGS = [
  [-0.14, 0.05, 0.05, 0.0, 2],
  [-0.13, 0.095, 0.075, 0.004, 2],
  [-0.1, 0.142, 0.103, 0.008, 2.2],
  [-0.06, 0.163, 0.116, 0.01, 2.3],
  [-0.01, 0.163, 0.114, 0.007, 2.3],
  [0.05, 0.157, 0.11, 0.003, 2.3],
  [0.1, 0.152, 0.106, 0.0, 2.3],
];
