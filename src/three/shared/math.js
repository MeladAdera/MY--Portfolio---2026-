import * as THREE from 'three';

/* ---------- math helpers ---------- */
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
export const ramp = (t, t0, t1) => smoother(clamp((t - t0) / (t1 - t0), 0, 1));
export const lerp = (a, b, k) => a + (b - a) * k;
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const vlerp = (a, b, k) => V(lerp(a.x, b.x, k), lerp(a.y, b.y, k), lerp(a.z, b.z, k));
export const UP = V(0, 1, 0);

/* Hermite track through [time, value] keys. Zero tangent at holds and extrema, so nothing overshoots. */
export function track(keys) {
  const n = keys.length;
  const isArr = Array.isArray(keys[0][1]);
  const dim = isArr ? keys[0][1].length : 1;
  const val = (i, d) => (isArr ? keys[i][1][d] : keys[i][1]);
  const tan = keys.map((k, i) => {
    const out = [];
    for (let d = 0; d < dim; d++) {
      if (i === 0 || i === n - 1) {
        out.push(0);
        continue;
      }
      const p0 = val(i - 1, d),
        p1 = val(i, d),
        p2 = val(i + 1, d);
      if ((p1 - p0) * (p2 - p1) <= 0) {
        out.push(0);
        continue;
      }
      const m = (p2 - p0) / (keys[i + 1][0] - keys[i - 1][0]);
      const lim =
        3 *
        Math.min(
          Math.abs(p1 - p0) / (keys[i][0] - keys[i - 1][0]),
          Math.abs(p2 - p1) / (keys[i + 1][0] - keys[i][0]),
        );
      out.push(Math.sign(m) * Math.min(Math.abs(m), lim));
    }
    return out;
  });
  return (t) => {
    if (t <= keys[0][0]) return isArr ? keys[0][1].slice() : keys[0][1];
    if (t >= keys[n - 1][0]) return isArr ? keys[n - 1][1].slice() : keys[n - 1][1];
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const t0 = keys[i][0],
      h = keys[i + 1][0] - t0,
      u = (t - t0) / h;
    const u2 = u * u,
      u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1,
      h10 = u3 - 2 * u2 + u,
      h01 = -2 * u3 + 3 * u2,
      h11 = u3 - u2;
    const res = [];
    for (let d = 0; d < dim; d++)
      res.push(
        h00 * val(i, d) + h10 * h * tan[i][d] + h01 * val(i + 1, d) + h11 * h * tan[i + 1][d],
      );
    return isArr ? res : res[0];
  };
}
