import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { clamp, UP, V } from './math';
import { basisQuat, bodyFrameFor, shoulderOfFor, solveIK } from './rig';

/*
 * A humanoid glTF model (Mixamo or Ready Player Me skeleton) driven by the same pose data as
 * the procedural figure. The animation never changes: it still produces a body frame, hand
 * targets, foot targets and a look point; this rig turns those into bone rotations.
 *
 * Every bone is set by "orient": two directions known in the bone's rest pose (its own
 * length direction and a reference such as the back of the limb) are rotated onto two
 * desired world directions. Limb lengths come from the model, so the IK solver works with the
 * model's own proportions. The model is scaled so its legs reach as far as the figure's.
 */
const strip = (name) => name.replace(/^mixamorig[:_]?/i, '');
const SPINE = [
  ['Hips', 0.2, 0],
  ['Spine', 0.45, 0.25],
  ['Spine1', 0.75, 0.6],
  ['Spine2', 1, 1],
];
const SIDES = [
  { prefix: 'Left', side: -1 },
  { prefix: 'Right', side: 1 },
];
const FINGERS = ['Index', 'Middle', 'Ring', 'Pinky'];
const FINGER_CURL = [0.7, 0.95, 0.8];
const THUMB_CURL = [0.15, 0.45, 0.5];

export async function loadSkinnedRig(url, base, opts) {
  const gltf = await new GLTFLoader().loadAsync(url);
  return createSkinnedRig(gltf.scene, base, opts);
}

export function createSkinnedRig(model, base, opts) {
  opts = opts || {};
  const bones = {};
  const meshes = [];
  const hidden = new Set(opts.hide || []);
  const skeletons = new Set();
  model.traverse((o) => {
    if (o.isBone) bones[strip(o.name)] = o;
    if (o.isSkinnedMesh) {
      /* parts such as headwear can be left out by name */
      if (hidden.has(o.name)) {
        o.visible = false;
        return;
      }
      o.frustumCulled = false;
      meshes.push(o);
      skeletons.add(o.skeleton);
    }
  });
  /* The renderer recomputes and re-uploads the bone matrices on every render call, and a
     frame of this scene is several passes. The pose only changes once per frame, so the
     skeleton is updated once and the passes share it. */
  let posed = true;
  for (const sk of skeletons) {
    const update = sk.update.bind(sk);
    sk.update = () => {
      if (!posed) return;
      posed = false;
      update();
    };
  }
  const need = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'];
  for (const { prefix } of SIDES)
    need.push(
      ...['Shoulder', 'Arm', 'ForeArm', 'Hand', 'UpLeg', 'Leg', 'Foot'].map((n) => prefix + n),
    );
  for (const n of need) if (!bones[n]) throw new Error('skinned rig: missing bone ' + n);

  const root = new THREE.Group();
  root.add(model);
  const wp = (b) => b.getWorldPosition(new THREE.Vector3());
  /* scale: the figure's legs reach thigh + shin + ankle from the hip joint to the floor */
  root.updateMatrixWorld(true);
  const reach = base.dim.thigh + base.dim.shin + base.dim.ankle;
  const scale = (opts.scale || 1) * (reach / wp(bones.LeftUpLeg).y);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  /* rest pose, in world units after scaling */
  const rest = {};
  for (const [n, b] of Object.entries(bones))
    rest[n] = {
      p: wp(b),
      q: b.getWorldQuaternion(new THREE.Quaternion()),
      lq: b.quaternion.clone(),
    };

  /* the animation's targets (where the shoulders are, how far a hanging arm reaches, where
     the hand grips) follow this body's measurements, so the motion fits it */
  const hipsY = rest.Hips.p.y;
  const grip = bones.LeftHandMiddle1
    ? rest.LeftHandMiddle1.p.distanceTo(rest.LeftHand.p)
    : base.dim.wristToGrip;
  const dim = {
    ...base.dim,
    upperArm: rest.LeftArm.p.distanceTo(rest.LeftForeArm.p),
    forearm: rest.LeftForeArm.p.distanceTo(rest.LeftHand.p),
    thigh: rest.LeftUpLeg.p.distanceTo(rest.LeftLeg.p),
    shin: rest.LeftLeg.p.distanceTo(rest.LeftFoot.p),
    ankle: rest.LeftFoot.p.y,
    hipHalf: Math.abs(rest.LeftUpLeg.p.x - rest.Hips.p.x),
    shoulderUp: rest.LeftArm.p.y - hipsY - base.dim.waist,
    shoulderHalf: Math.abs(rest.LeftArm.p.x - rest.Hips.p.x),
    neckUp: rest.Neck.p.y - hipsY - base.dim.waist,
    wristToGrip: grip,
  };
  const bodyFrame = bodyFrameFor(dim);
  const shoulderOf = shoulderOfFor(dim);
  const restLocal = (n, worldDir) =>
    worldDir.clone().applyQuaternion(rest[n].q.clone().invert()).normalize();
  const childDir = (n, c) => restLocal(n, rest[c].p.clone().sub(rest[n].p));
  const len = (a, b) => rest[a].p.distanceTo(rest[b].p);
  const FWD = V(0, 0, 1),
    BACK = V(0, 0, -1);

  /* each bone's rest basis (inverse), so a pose is one quaternion product per bone */
  const defs = {};
  const define = (n, a, b) => {
    const y = a.clone().normalize();
    const z = b.clone().addScaledVector(y, -b.dot(y)).normalize();
    defs[n] = { bone: bones[n], invRest: basisQuat(y.clone().cross(z).normalize(), y, z).invert() };
  };
  define('Hips', childDir('Hips', 'Spine'), restLocal('Hips', FWD));
  define('Spine', childDir('Spine', 'Spine1'), restLocal('Spine', FWD));
  define('Spine1', childDir('Spine1', 'Spine2'), restLocal('Spine1', FWD));
  define('Spine2', childDir('Spine2', 'Neck'), restLocal('Spine2', FWD));
  define('Neck', childDir('Neck', 'Head'), restLocal('Neck', FWD));
  define(
    'Head',
    bones.HeadTop_End ? childDir('Head', 'HeadTop_End') : restLocal('Head', UP),
    restLocal('Head', FWD),
  );

  const limbs = SIDES.map(({ prefix, side }) => {
    const n = (s) => prefix + s;
    /* the palm faces the side of the hand the thumb bends toward */
    const hand = rest[n('Hand')].p;
    const middle = bones[n('HandMiddle1')] || bones[n('HandIndex1')];
    const fingerDir = middle ? rest[strip(middle.name)].p.clone().sub(hand).normalize() : null;
    const index = bones[n('HandIndex1')],
      pinky = bones[n('HandPinky1')],
      thumb = bones[n('HandThumb2')] || bones[n('HandThumb1')];
    let palm;
    if (fingerDir && index && pinky && thumb) {
      const across = rest[strip(pinky.name)].p.clone().sub(rest[strip(index.name)].p);
      palm = fingerDir.clone().cross(across).normalize();
      const thumbOff = rest[strip(thumb.name)].p.clone().sub(hand);
      if (thumbOff.dot(palm) < 0) palm.negate();
    } else palm = V(0, -1, 0);
    if (opts.flipPalms) palm.negate();
    const fDir = fingerDir || rest[n('Hand')].p.clone().sub(rest[n('ForeArm')].p).normalize();

    define(n('Arm'), childDir(n('Arm'), n('ForeArm')), restLocal(n('Arm'), BACK));
    define(
      n('ForeArm'),
      childDir(n('ForeArm'), n('Hand')),
      restLocal(n('ForeArm'), palm.clone().negate()),
    );
    define(n('Hand'), restLocal(n('Hand'), fDir), restLocal(n('Hand'), palm));
    define(n('UpLeg'), childDir(n('UpLeg'), n('Leg')), restLocal(n('UpLeg'), BACK));
    define(n('Leg'), childDir(n('Leg'), n('Foot')), restLocal(n('Leg'), BACK));
    define(n('Foot'), restLocal(n('Foot'), FWD), restLocal(n('Foot'), UP));

    /* finger bones curl about the axis across the hand, toward the palm */
    const curlAxis = fDir.clone().cross(palm).normalize();
    const fingers = [];
    for (const f of FINGERS)
      for (let k = 1; k <= 3; k++) {
        const b = bones[n(`Hand${f}${k}`)];
        if (b)
          fingers.push({
            bone: b,
            axis: restLocal(strip(b.name), curlAxis),
            amount: FINGER_CURL[k - 1],
          });
      }
    const t1 = bones[n('HandThumb1')],
      t2 = bones[n('HandThumb2')];
    if (t1 && t2) {
      const tDir = rest[strip(t2.name)].p.clone().sub(rest[strip(t1.name)].p).normalize();
      const tAxis = tDir.clone().cross(palm).normalize();
      for (let k = 1; k <= 3; k++) {
        const b = bones[n(`HandThumb${k}`)];
        if (b)
          fingers.push({
            bone: b,
            axis: restLocal(strip(b.name), tAxis),
            amount: THUMB_CURL[k - 1],
          });
      }
    }
    return {
      side,
      arm: n('Arm'),
      fore: n('ForeArm'),
      hand: n('Hand'),
      upLeg: n('UpLeg'),
      leg: n('Leg'),
      foot: n('Foot'),
      upper: len(n('Arm'), n('ForeArm')),
      forearm: len(n('ForeArm'), n('Hand')),
      thigh: len(n('UpLeg'), n('Leg')),
      shin: len(n('Leg'), n('Foot')),
      ankle: rest[n('Foot')].p.y,
      fingers,
    };
  });

  const tmpQ = new THREE.Quaternion(),
    axisQ = new THREE.Quaternion();
  /* rotate a bone so its rest directions a (length) and b (reference) point along world A and B */
  function orient(n, A, B) {
    const d = defs[n];
    const y = A.clone().normalize();
    const z = B.clone().addScaledVector(y, -B.dot(y)).normalize();
    const world = basisQuat(y.clone().cross(z).normalize(), y, z).multiply(d.invRest);
    d.bone.parent.getWorldQuaternion(tmpQ);
    d.bone.quaternion.copy(tmpQ.invert().multiply(world));
  }

  function buildCharacter() {
    for (const o of meshes) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
    return { root, meshes };
  }

  function poseCharacter(c, p) {
    const B = bodyFrame(p.P, p.yaw, p.bend, p.twist);
    const hips = bones.Hips;
    hips.parent.updateWorldMatrix(true, false);
    hips.position.copy(
      hips.parent.worldToLocal(B.P.clone().addScaledVector(UP, opts.hipsLift || 0)),
    );
    /* the bend and the twist are spread along the spine */
    for (const [n, fb, ft] of SPINE) {
      const bend = p.bend * fb,
        twist = p.twist * ft;
      const ut = UP.clone().multiplyScalar(Math.cos(bend)).addScaledVector(B.f, Math.sin(bend));
      const fwd = B.f.clone().multiplyScalar(Math.cos(bend)).addScaledVector(UP, -Math.sin(bend));
      if (twist) fwd.applyQuaternion(axisQ.setFromAxisAngle(ut, twist));
      orient(n, ut, fwd);
    }
    /* head: the same look solve as the procedural figure */
    const torsoQ = basisQuat(B.rt, B.ut, B.ft.clone().negate());
    const neckBase = B.O.clone().addScaledVector(B.ut, dim.neckUp);
    const pivot = neckBase.clone().addScaledVector(B.ut, 0.042);
    const d = V(p.look[0], p.look[1], p.look[2]).sub(pivot).normalize();
    const dx = d.dot(B.rt),
      dy = d.dot(B.ut),
      dz = -d.dot(B.ft);
    const yaw = clamp(Math.atan2(-dx, -dz), -1.05, 1.05);
    const pitch = clamp(Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)), -0.8, 0.45);
    const headQ = torsoQ
      .clone()
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * 0.85, yaw, 0, 'YXZ')));
    const neckQ = torsoQ.clone().slerp(headQ, 0.5);
    orient('Neck', UP.clone().applyQuaternion(neckQ), V(0, 0, -1).applyQuaternion(neckQ));
    orient('Head', UP.clone().applyQuaternion(headQ), V(0, 0, -1).applyQuaternion(headQ));

    const info = { armShort: -1, legShort: -1 };
    limbs.forEach((L, s) => {
      const hd = p.hands[s];
      const sh = wp(bones[L.arm]);
      const pole = sh
        .clone()
        .addScaledVector(B.ft, -0.45)
        .addScaledVector(B.rt, L.side * 0.32)
        .addScaledVector(UP, -0.35);
      const ik = solveIK(sh, hd.wrist, L.upper, L.forearm, pole);
      info.armShort = Math.max(info.armShort, ik.short);
      orient(L.arm, ik.mid.clone().sub(sh), B.ft.clone().negate());
      orient(L.fore, ik.end.clone().sub(ik.mid), hd.palm.clone().negate());
      orient(L.hand, hd.fingers, hd.palm);
      const curl = hd.curl == null ? 0.45 : hd.curl;
      for (const f of L.fingers)
        f.bone.quaternion
          .copy(rest[strip(f.bone.name)].lq)
          .multiply(axisQ.setFromAxisAngle(f.axis, curl * f.amount));

      const ft = p.feet[s];
      const hip = wp(bones[L.upLeg]);
      const ffwd = V(-Math.sin(ft.yaw), 0, -Math.cos(ft.yaw));
      const ankle = V(ft.pos[0], ft.pos[1] + L.ankle, ft.pos[2]);
      const kpole = hip
        .clone()
        .addScaledVector(ffwd, 0.6)
        .addScaledVector(B.r, L.side * 0.14)
        .addScaledVector(UP, -0.2);
      const lk = solveIK(hip, ankle, L.thigh, L.shin, kpole);
      info.legShort = Math.max(info.legShort, lk.short);
      const legBack = ffwd.clone().negate();
      orient(L.upLeg, lk.mid.clone().sub(hip), legBack);
      orient(L.leg, lk.end.clone().sub(lk.mid), legBack);
      const th = ft.pitch || 0;
      orient(
        L.foot,
        ffwd.clone().multiplyScalar(Math.cos(th)).addScaledVector(UP, Math.sin(th)),
        UP.clone().multiplyScalar(Math.cos(th)).addScaledVector(ffwd, -Math.sin(th)),
      );
    });
    posed = true;
    return { info, B };
  }

  return { dim, buildCharacter, poseCharacter, bodyFrame, shoulderOf, bones, meshes, scale };
}
