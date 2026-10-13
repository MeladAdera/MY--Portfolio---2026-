import * as THREE from 'three';

import { clamp, lerp, smoother } from '../shared/math';
import { createRig } from '../shared/rig';

/* body dimensions of the climber: slightly narrower shoulders than the builder */
const dim = {
  hipHalf: 0.096,
  thigh: 0.44,
  shin: 0.42,
  ankle: 0.08,
  waist: 0.1,
  shoulderUp: 0.376,
  shoulderHalf: 0.18,
  neckUp: 0.445,
  upperArm: 0.29,
  forearm: 0.26,
  wristToGrip: 0.072,
};

/* Hair: a shell slightly larger than the skull, kept only above a hairline that sits on the forehead,
   above the ears at the sides and low at the nape. */
function hairGeo() {
  const g = new THREE.SphereGeometry(1, 56, 40);
  const a = g.attributes.position;
  for (let i = 0; i < a.count; i++) {
    let x = a.getX(i),
      y = a.getY(i),
      z = a.getZ(i);
    const front = Math.cos(Math.atan2(x, -z));
    const line =
      front >= 0 ? lerp(0.1, 0.6, Math.pow(front, 1.4)) : lerp(0.1, -0.44, Math.pow(-front, 0.8));
    if (y < line) {
      /* slide the point up the sphere onto the hairline, so the edge is a smooth curve */
      const h = Math.hypot(x, z),
        hl = Math.sqrt(Math.max(0, 1 - line * line));
      if (h > 1e-6) {
        x *= hl / h;
        z *= hl / h;
      }
      y = line;
    }
    /* thickness fades to nothing at the hairline, so short hair blends into the skull instead of sitting on it like a cap */
    const thick = smoother(clamp((y - line) / 0.4, 0, 1));
    const g0 = 1.015,
      g1 = 1.075;
    const k = lerp(g0, g1, thick);
    a.setXYZ(i, x * 0.0755 * k, y * 0.1065 * k + 0.002 * thick, z * (z > 0 ? 0.0985 : 0.094) * k);
  }
  g.computeVertexNormals();
  return g;
}

/* [s, halfWidth, halfDepth, zOffset] along the upper arm */
const upperArmProfile = [
  [0, 0.044, 0.05, 0],
  [0.18, 0.05, 0.053, -0.002],
  [0.45, 0.05, 0.053, -0.006],
  [0.75, 0.046, 0.047, -0.002],
  [1, 0.043, 0.043, 0],
];

export const rig = createRig({ dim, hairGeo, upperArmProfile });
