/* Hair: a shell slightly larger than the skull, kept only above a hairline that sits on the forehead,
   above the ears at the sides and low at the nape. */
function hairGeo() {
  const g = new THREE.SphereGeometry(1, 56, 40);
  const a = g.attributes.position;
  for (let i = 0; i < a.count; i++) {
    let x = a.getX(i), y = a.getY(i), z = a.getZ(i);
    const front = Math.cos(Math.atan2(x, -z));
    const line = front >= 0 ? lerp(0.12, 0.6, Math.pow(front, 1.4)) : lerp(0.12, -0.52, -front);
    if (y < line) {
      /* slide the point up the sphere onto the hairline, so the edge is a smooth curve */
      const h = Math.hypot(x, z), hl = Math.sqrt(Math.max(0, 1 - line * line));
      if (h > 1e-6) { x *= hl / h; z *= hl / h; }
      y = line;
    }
    a.setXYZ(i, x * 0.0815, y * 0.111 + 0.007 + Math.max(0, y) * 0.006, z * 0.1 + 0.005);
  }
  g.computeVertexNormals();
  return g;
}

function buildCharacter(m) {
  const root = new THREE.Group();
  const mesh = (geo, mat, parent) => {
    const o = new THREE.Mesh(geo, mat);
    o.castShadow = true; o.receiveShadow = true;
    (parent || root).add(o);
    return o;
  };
  const c = {};
  /* sweater body: waist to collar. Local -z is the chest (forward). */
  const torsoRings = [
    [-0.14, 0.18, 0.134, 0.004, 2.3],
    [-0.125, 0.183, 0.137, 0.004, 2.3],
    [-0.11, 0.178, 0.132, 0.003, 2.3],
    [-0.08, 0.17, 0.124, 0.001, 2.3],
    [-0.04, 0.160, 0.115, 0.0, 2.3],
    [0.03, 0.158, 0.113, -0.002, 2.3],
    [0.10, 0.165, 0.118, -0.006, 2.4],
    [0.17, 0.176, 0.126, -0.011, 2.5],
    [0.24, 0.187, 0.132, -0.015, 2.5],
    [0.295, 0.2, 0.131, -0.013, 2.5],
    [0.34, 0.21, 0.124, -0.007, 2.6],
    [0.372, 0.205, 0.112, 0.0, 2.5],
    [0.398, 0.176, 0.096, 0.006, 2.3],
    [0.418, 0.126, 0.076, 0.008, 2.2],
    [0.434, 0.084, 0.06, 0.007, 2.1],
    [0.448, 0.062, 0.052, 0.005, 2],
    [0.462, 0.057, 0.05, 0.004, 2]
  ];
  c.torso = mesh(ringLoft(torsoRings, 40, true, false), m.shirt);
  /* shirt collar: two flat points lying on the upper chest either side of the opening */
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.lineTo(s * 0.036, 0.004); sh.lineTo(s * 0.02, -0.05); sh.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false });
    const pt = mesh(geo, m.shirt, c.torso);
    pt.position.set(s * 0.008, 0.448, -0.06); pt.rotation.x = -0.5; pt.castShadow = false;
  }
  /* trousers seat and hips. Local +z is the back. */
  c.pelvis = mesh(ringLoft(PELVIS_RINGS, 40, true, true), m.pants);
  c.collar = mesh(new THREE.TorusGeometry(0.055, 0.009, 10, 32), m.shirt);
  c.upper = [0, 1].map(() => mesh(limbGeo(DIM.upperArm, [[0, 0.05, 0.054, 0], [0.18, 0.052, 0.055, -0.002], [0.45, 0.05, 0.053, -0.006], [0.75, 0.046, 0.047, -0.002], [1, 0.043, 0.043, 0]]), m.shirt));
  c.fore = [0, 1].map(() => mesh(limbGeo(DIM.forearm, [[0, 0.045, 0.045, 0], [0.22, 0.047, 0.045, 0], [0.55, 0.042, 0.038, 0], [0.88, 0.036, 0.031, 0], [1, 0.035, 0.03, 0]]), m.shirt));
  c.cuff = [0, 1].map(() => mesh(new THREE.TorusGeometry(0.034, 0.005, 8, 24), m.shirt));
  c.thigh = [0, 1].map(() => mesh(limbGeo(DIM.thigh, THIGH_PROF), m.pants));
  c.shin = [0, 1].map(() => mesh(limbGeo(DIM.shin, [[0, 0.062, 0.064, 0], [0.25, 0.061, 0.066, 0.005], [0.55, 0.056, 0.058, 0.002], [0.85, 0.054, 0.055, 0], [1, 0.058, 0.058, 0]]), m.pants));
  c.shin.forEach((sh) => {
    const back = mesh(foldArc(0.063, 0.035, Math.PI / 2, 1.9), m.pants, sh); back.castShadow = false;
    const b1 = mesh(foldArc(0.057, 0.36, -Math.PI / 2, 1.5), m.pants, sh); b1.castShadow = false;
    const b2 = mesh(foldArc(0.057, 0.39, -Math.PI / 2 + 0.4, 1.1), m.pants, sh); b2.castShadow = false;
  });
  c.thigh.forEach((th) => { const f = mesh(foldArc(0.07, 0.4, Math.PI / 2, 1.6), m.pants, th); f.castShadow = false; });
  c.neck = mesh(limbGeo(0.085, [[0, 0.05, 0.048, 0], [1, 0.044, 0.044, 0.004]], 20), m.skin);

  const head = new THREE.Group();
  root.add(head);
  const ell = (rx, ry, rz, pos, mat, rotX) => {
    const o = mesh(new THREE.SphereGeometry(1, 36, 24), mat, head);
    o.scale.set(rx, ry, rz); o.position.copy(pos); if (rotX) o.rotation.x = rotX;
    return o;
  };
  const skull = mesh(sculptedHead(), m.skin, head);
  ell(0.009, 0.026, 0.016, V(0.074, -0.004, 0.014), m.skin);
  ell(0.009, 0.026, 0.016, V(-0.074, -0.004, 0.014), m.skin);
  mesh(hairGeo(), m.hair, head);
  /* face: brows, eyes, nose and mouth placed on the skull surface by casting rays at it */
  skull.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const onFace = (x, y, geo, mat, sink, rz) => {
    ray.set(V(x, y, -0.3), V(0, 0, 1));
    const hit = ray.intersectObject(skull, false)[0];
    if (!hit) throw new Error('face feature missed the head at ' + x + ',' + y);
    const n = hit.face.normal.clone().transformDirection(skull.matrixWorld);
    const o = mesh(geo, mat, head);
    o.position.copy(hit.point).addScaledVector(n, -sink);
    o.quaternion.setFromUnitVectors(V(0, 0, -1), n);
    if (rz) o.rotateZ(rz);
    o.castShadow = false;
    return o;
  };
  const blob = (rx, ry, rz) => { const g = new THREE.SphereGeometry(1, 16, 10); g.scale(rx, ry, rz); return g; };
  for (const s of [-1, 1]) {
    onFace(s * 0.03, 0.031, blob(0.015, 0.0028, 0.003), m.feature, 0.0009, s * 0.12);
    onFace(s * 0.028, 0.0145, blob(0.0095, 0.0013, 0.0025), m.feature, 0.0006, s * 0.06);
    onFace(s * 0.027, 0.0108, blob(0.0032, 0.0032, 0.002), m.feature, 0.0009, 0);
    onFace(s * 0.007, -0.026, blob(0.0034, 0.0018, 0.0025), m.feature, 0.0008, 0);
  }
  onFace(0, -0.047, blob(0.017, 0.0021, 0.003), m.feature, 0.0008, 0);
  onFace(0, -0.056, blob(0.011, 0.0028, 0.004), m.skin, 0.001, 0);
  c.head = head;

  const hand = (side) => {
    const g = new THREE.Group(); root.add(g);
    const palm = mesh(bevelBox(0.078, 0.088, 0.027, 0.012), m.skin, g); palm.position.set(0, 0.05, 0);
    const spec = [[0.026, 0.04, 0.03], [0.0085, 0.044, 0.033], [-0.0085, 0.042, 0.031], [-0.025, 0.034, 0.026]];
    const fingers = spec.map((s) => {
      const f1 = new THREE.Group(); g.add(f1); f1.position.set(s[0] * side, 0.092, 0.002);
      const p1 = mesh(new THREE.CapsuleGeometry(0.0096, s[1], 4, 12), m.skin, f1); p1.position.y = s[1] / 2;
      const f2 = new THREE.Group(); f1.add(f2); f2.position.y = s[1];
      const p2 = mesh(new THREE.CapsuleGeometry(0.0086, s[2], 4, 12), m.skin, f2); p2.position.y = s[2] / 2;
      return [f1, f2];
    });
    const t1 = new THREE.Group(); g.add(t1); t1.position.set(0.04 * side, 0.03, 0.012); t1.rotation.set(0.5, 0, -0.62 * side);
    const q1 = mesh(new THREE.CapsuleGeometry(0.0108, 0.034, 4, 12), m.skin, t1); q1.position.y = 0.017;
    const t2 = new THREE.Group(); t1.add(t2); t2.position.y = 0.034;
    const q2 = mesh(new THREE.CapsuleGeometry(0.0096, 0.028, 4, 12), m.skin, t2); q2.position.y = 0.014;
    return { g, fingers, thumb: [t1, t2] };
  };
  c.hands = [hand(-1), hand(1)];

  const shoe = () => {
    const g = new THREE.Group(); root.add(g);
    const upper = mesh(bevelBox(0.094, 0.068, 0.25, 0.03), m.shoe, g); upper.position.set(0, -0.036, -0.064);
    const toe = mesh(new THREE.SphereGeometry(1, 24, 16), m.shoe, g); toe.scale.set(0.047, 0.033, 0.05); toe.position.set(0, -0.046, -0.168);
    const sole = mesh(bevelBox(0.1, 0.022, 0.27, 0.009), m.sole, g); sole.position.set(0, -0.071, -0.066);
    const hem = mesh(limbGeo(0.055, [[0, 0.066, 0.068, 0], [1, 0.061, 0.062, 0]], 22), m.pants, g); hem.position.set(0, 0.0, 0.0);
    return g;
  };
  c.feet = [shoe(), shoe()];
  c.root = root;
  return c;
}

function placeSegment(o, a, b) {
  o.position.copy(a).add(b).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
}
const basisQuat = (x, y, z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
/* Orients a limb mesh that starts at a and points at b; zHint is the direction its local +z should face. */
function placeLimb(o, a, b, zHint) {
  const y = b.clone().sub(a).normalize();
  const z = zHint.clone().addScaledVector(y, -zHint.dot(y)).normalize();
  const x = y.clone().cross(z).normalize();
  o.position.copy(a);
  o.quaternion.copy(basisQuat(x, y, z));
}
function solveIK(A, T, l1, l2, pole) {
  const d = T.clone().sub(A);
  const len = d.length();
  const dl = clamp(len, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const dir = d.normalize();
  const x = (l1 * l1 - l2 * l2 + dl * dl) / (2 * dl);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const b = pole.clone().sub(A);
  b.addScaledVector(dir, -b.dot(dir)).normalize();
  return { mid: A.clone().addScaledVector(dir, x).addScaledVector(b, h), end: A.clone().addScaledVector(dir, dl), short: len - (l1 + l2) };
}
function handFrame(fingers, palm) {
  const y = fingers.clone().normalize();
  const z = palm.clone().addScaledVector(y, -palm.dot(y)).normalize();
  const x = y.clone().cross(z).normalize();
  return basisQuat(x, y, z);
}

function bodyFrame(P, psi, bend, twist) {
  const f = V(-Math.sin(psi), 0, -Math.cos(psi));
  const r = V(Math.cos(psi), 0, -Math.sin(psi));
  const ut = UP.clone().multiplyScalar(Math.cos(bend)).addScaledVector(f, Math.sin(bend));
  const ft = f.clone().multiplyScalar(Math.cos(bend)).addScaledVector(UP, -Math.sin(bend));
  const rt = r.clone();
  if (twist) {
    const q = new THREE.Quaternion().setFromAxisAngle(ut, twist);
    ft.applyQuaternion(q); rt.applyQuaternion(q);
  }
  const O = V(P[0], P[1], P[2]).addScaledVector(UP, DIM.waist);
  return { f, r, ut, ft, rt, O, P: V(P[0], P[1], P[2]) };
}
function shoulderOf(B, side) {
  return B.O.clone().addScaledVector(B.ut, DIM.shoulderUp).addScaledVector(B.rt, side * DIM.shoulderHalf);
}

function poseCharacter(c, p) {
  const B = bodyFrame(p.P, p.yaw, p.bend, p.twist);
  c.pelvis.position.copy(B.P);
  c.pelvis.quaternion.copy(basisQuat(B.r, UP, B.f.clone().negate()));
  const torsoQ = basisQuat(B.rt, B.ut, B.ft.clone().negate());
  c.torso.position.copy(B.O);
  c.torso.quaternion.copy(torsoQ);
  const breath = 1 + 0.006 * Math.sin(p.time * 1.55);
  c.torso.scale.set(breath, 1, breath);

  const neckBase = B.O.clone().addScaledVector(B.ut, DIM.neckUp);
  c.collar.position.copy(neckBase).addScaledVector(B.ut, 0.012);
  c.collar.quaternion.copy(torsoQ).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2));

  const lookT = V(p.look[0], p.look[1], p.look[2]);
  const pivot = neckBase.clone().addScaledVector(B.ut, 0.042);
  const d = lookT.clone().sub(pivot).normalize();
  const dx = d.dot(B.rt), dy = d.dot(B.ut), dz = -d.dot(B.ft);
  const yaw = clamp(Math.atan2(-dx, -dz), -1.05, 1.05);
  const pitch = clamp(Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)), -0.8, 0.45);
  const headQ = torsoQ.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * 0.85, yaw, 0, 'YXZ')));
  const headUp = V(0, 1, 0).applyQuaternion(headQ);
  c.head.quaternion.copy(headQ);
  c.head.position.copy(pivot).addScaledVector(headUp, 0.084);
  placeLimb(c.neck, neckBase.clone().addScaledVector(B.ut, -0.03), pivot.clone().addScaledVector(headUp, 0.02), B.ft.clone().negate());

  const info = { armShort: -1, legShort: -1 };
  for (let s = 0; s < 2; s++) {
    const side = s === 0 ? -1 : 1;
    const sh = shoulderOf(B, side);
    const hd = p.hands[s];
    const pole = sh.clone().addScaledVector(B.ft, -0.45).addScaledVector(B.rt, side * 0.32).addScaledVector(UP, -0.35);
    const ik = solveIK(sh, hd.wrist, DIM.upperArm, DIM.forearm, pole);
    info.armShort = Math.max(info.armShort, ik.short);
    const back = B.ft.clone().negate();
    placeLimb(c.upper[s], sh, ik.mid, back);
    placeLimb(c.fore[s], ik.mid, ik.end, hd.palm.clone().negate());
    const fdir = ik.end.clone().sub(ik.mid).normalize();
    c.cuff[s].position.copy(ik.end).addScaledVector(fdir, -0.016);
    c.cuff[s].quaternion.copy(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), fdir));
    const H = c.hands[s];
    H.g.position.copy(ik.end);
    H.g.quaternion.copy(handFrame(hd.fingers, hd.palm));
    const curl = hd.curl == null ? 0.45 : hd.curl;
    H.fingers.forEach((fg, i) => { fg[0].rotation.x = curl * (0.62 + i * 0.05); fg[1].rotation.x = curl * 0.95; });
    H.thumb[1].rotation.x = curl * 0.5;
  }
  for (let l = 0; l < 2; l++) {
    const side = l === 0 ? -1 : 1;
    const hip = B.P.clone().addScaledVector(B.r, side * DIM.hipHalf).addScaledVector(UP, -0.02);
    const ft = p.feet[l];
    const ffwd = V(-Math.sin(ft.yaw), 0, -Math.cos(ft.yaw));
    const ankle = V(ft.pos[0], ft.pos[1] + DIM.ankle, ft.pos[2]);
    const kpole = hip.clone().addScaledVector(ffwd, 0.6).addScaledVector(B.r, side * 0.14).addScaledVector(UP, -0.2);
    const lk = solveIK(hip, ankle, DIM.thigh, DIM.shin, kpole);
    info.legShort = Math.max(info.legShort, lk.short);
    const legBack = ffwd.clone().negate();
    placeLimb(c.thigh[l], hip, lk.mid, legBack);
    placeLimb(c.shin[l], lk.mid, lk.end, legBack);
    c.feet[l].position.copy(lk.end);
    c.feet[l].rotation.set(ft.pitch || 0, ft.yaw, 0, 'YXZ');
  }
  return { info, B };
}
