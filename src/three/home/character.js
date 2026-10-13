import * as THREE from 'three';

import { lerp } from '../shared/math';
import { createRig } from '../shared/rig';

/* body dimensions of the builder */
const dim = {
  hipHalf: 0.096,
  thigh: 0.44,
  shin: 0.42,
  ankle: 0.08,
  waist: 0.1,
  shoulderUp: 0.395,
  shoulderHalf: 0.186,
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
    const line = front >= 0 ? lerp(0.12, 0.6, Math.pow(front, 1.4)) : lerp(0.12, -0.52, -front);
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
    a.setXYZ(i, x * 0.0815, y * 0.111 + 0.007 + Math.max(0, y) * 0.006, z * 0.1 + 0.005);
  }
  g.computeVertexNormals();
  return g;
}

/* [s, halfWidth, halfDepth, zOffset] along the upper arm */
const upperArmProfile = [
  [0, 0.05, 0.054, 0],
  [0.18, 0.052, 0.055, -0.002],
  [0.45, 0.05, 0.053, -0.006],
  [0.75, 0.046, 0.047, -0.002],
  [1, 0.043, 0.043, 0],
];

export const rig = createRig({ dim, hairGeo, upperArmProfile });
