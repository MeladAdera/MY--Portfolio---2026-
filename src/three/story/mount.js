/* Story — The Climb. The real-time scene of the story page, driven by scroll progress. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { rig } from './character';
import { CLIMB, ST, STAIRS, STAND_Y, surfaceAt } from './stairs';
import { bevelBox } from '../shared/geometry';
import { clamp, lerp, ramp, smoother, UP, V } from '../shared/math';
import { gradientTexture, surface } from '../shared/textures';

const { buildCharacter, poseCharacter, bodyFrame, shoulderOf } = rig;

export function mount(canvas, options) {
  options = options || {};
  const small = () => (canvas.clientWidth || 1) < 760;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: !!options.preserveDrawingBuffer,
  });
  const pr = Math.min(
    window.devicePixelRatio || 1,
    options.maxPixelRatio || (small() ? 1.5 : 1.75),
  );
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const BG = new THREE.Color('#0D1217');
  const scene = new THREE.Scene();
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG.clone(), 0.04);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.06;
  pm.dispose();

  const W = ST.W,
    END = STAIRS.end,
    TOP = STAIRS.top;
  const wallTex = surface({
    size: 1024,
    seed: 41,
    color: [84, 88, 94],
    variation: 0.2,
    grain: 0.05,
    roughness: 0.92,
    pores: 1400,
    scale: 4,
    repeat: [7, 3.4],
    decorate: (g, size) => {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = 'rgba(16,18,22,0.32)';
        g.fillRect(0, Math.round((i * size) / 8), size, 2);
      }
      g.fillStyle = 'rgba(10,12,15,0.5)';
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          g.beginPath();
          g.arc(((i + 0.5) * size) / 4, ((j + 0.5) * size) / 4, 3, 0, Math.PI * 2);
          g.fill();
        }
    },
  });
  const stoneTex = surface({
    size: 512,
    seed: 43,
    color: [96, 100, 106],
    variation: 0.12,
    grain: 0.04,
    roughness: 0.78,
    pores: 260,
    scale: 3,
    repeat: [2.4, 0.5],
  });
  const floorTex = surface({
    size: 1024,
    seed: 47,
    color: [58, 62, 68],
    variation: 0.12,
    grain: 0.03,
    roughness: 0.62,
    pores: 200,
    scale: 4,
    repeat: [9, 9],
    decorate: (g, size) => {
      g.fillStyle = 'rgba(12,14,17,0.4)';
      g.fillRect(0, 0, size, 2);
      g.fillRect(0, 0, 2, size);
    },
  });

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const fabric = (color, sheen) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.93,
      sheen,
      sheenColor: '#8C96A0',
      sheenRoughness: 0.75,
      side: THREE.DoubleSide,
    });
  const phys = {
    wall: std({ map: wallTex.map, roughnessMap: wallTex.roughnessMap, roughness: 1 }),
    stone: std({ map: stoneTex.map, roughnessMap: stoneTex.roughnessMap, roughness: 1 }),
    floor: std({ map: floorTex.map, roughnessMap: floorTex.roughnessMap, roughness: 1 }),
    dark: std({ color: '#15191E', roughness: 0.95 }),
    rail: std({ color: '#2B2F34', roughness: 0.45, metalness: 0.6 }),
    shirt: fabric('#4A525B', 0.5),
    pants: fabric('#23262A', 0.3),
    skin: std({ color: '#B39985', roughness: 0.72 }),
    hair: std({ color: '#191716', roughness: 0.85, side: THREE.DoubleSide }),
    shoe: std({ color: '#1B1C1E', roughness: 0.55 }),
    sole: std({ color: '#3A3836', roughness: 0.9 }),
    feature: std({ color: '#3A2E27', roughness: 0.8 }),
  };
  const mesh = (geo, mat, x, y, z, shadow) => {
    const o = new THREE.Mesh(geo, mat);
    o.position.set(x, y, z);
    o.castShadow = shadow !== false;
    o.receiveShadow = true;
    scene.add(o);
    return o;
  };

  /* the stair mass: every tread and landing is a solid block down to the floor, so the open side reads as one stepped body */
  for (const p of STAIRS.parts) {
    const d = p.s1 - p.s0;
    mesh(
      bevelBox(W, p.h, d + 0.002, p.kind === 'tread' ? 0.006 : 0.004),
      phys.stone,
      0,
      p.h / 2,
      -(p.s0 + p.s1) / 2,
    );
  }
  /* hall floor, wall on the left of the stair, end wall with the opening, a far wall on the right, ceiling */
  const floor = mesh(new THREE.PlaneGeometry(40, 60), phys.floor, 4, 0, -END / 2, false);
  floor.rotation.x = -Math.PI / 2;
  const WALL_H = 12.5;
  mesh(
    new THREE.BoxGeometry(0.5, WALL_H, END + 14),
    phys.wall,
    -W / 2 - 0.25,
    WALL_H / 2,
    -END / 2 + 4.5,
  );
  const OPEN = { w: 2.3, h: 3.7 };
  const endZ = -END - 0.3;
  mesh(new THREE.BoxGeometry(0.6, WALL_H, 0.6), phys.wall, -W / 2 - 0.2, WALL_H / 2, endZ);
  mesh(
    new THREE.BoxGeometry(W / 2 - OPEN.w / 2 + 0.2, WALL_H, 0.6),
    phys.wall,
    -(OPEN.w / 2 + (W / 2 - OPEN.w / 2 + 0.2) / 2),
    WALL_H / 2,
    endZ,
  );
  mesh(new THREE.BoxGeometry(10, WALL_H, 0.6), phys.wall, OPEN.w / 2 + 5, WALL_H / 2, endZ);
  mesh(
    new THREE.BoxGeometry(OPEN.w, WALL_H - TOP - OPEN.h, 0.6),
    phys.wall,
    0,
    TOP + OPEN.h + (WALL_H - TOP - OPEN.h) / 2,
    endZ,
  );
  mesh(
    new THREE.BoxGeometry(0.5, WALL_H, END + 14),
    phys.dark,
    9.5,
    WALL_H / 2,
    -END / 2 + 4.5,
    false,
  );
  const ceil = mesh(new THREE.PlaneGeometry(40, 60), phys.dark, 4, WALL_H, -END / 2, false);
  ceil.rotation.x = Math.PI / 2;

  /* beyond the opening: a pale terrace and an overcast sky, nothing more */
  const skyMat = new THREE.MeshBasicMaterial({
    map: gradientTexture(
      [
        [0, '#C9D1D9'],
        [0.6, '#AEB8C2'],
        [0.78, '#9AA4AE'],
        [0.8, '#4B5259'],
        [1, '#3E444A'],
      ],
      4,
      256,
      true,
    ),
    fog: false,
    toneMapped: true,
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), skyMat);
  sky.position.set(0, TOP + 6, endZ - 9);
  scene.add(sky);
  const terrace = mesh(
    new THREE.PlaneGeometry(14, 9),
    std({ color: '#8E959C', roughness: 0.9 }),
    0,
    TOP - 0.002,
    endZ - 4.6,
    false,
  );
  terrace.rotation.x = -Math.PI / 2;

  /* a slim handrail along the wall, following each flight and landing */
  const railPts = [];
  for (const p of STAIRS.parts) {
    if (p.kind === 'tread' && p.k > 1) continue;
    if (p.kind === 'tread') railPts.push(V(-W / 2 + 0.07, 0.9 + p.h - ST.R, -p.s0));
    else {
      railPts.push(V(-W / 2 + 0.07, 0.9 + p.h, -p.s0));
      railPts.push(V(-W / 2 + 0.07, 0.9 + p.h, -p.s1));
    }
  }
  for (let i = 1; i < railPts.length; i++) {
    const a = railPts[i - 1],
      b = railPts[i];
    const L = a.distanceTo(b);
    const r = mesh(new THREE.CylinderGeometry(0.021, 0.021, L, 12), phys.rail, 0, 0, 0);
    r.position.copy(a).add(b).multiplyScalar(0.5);
    r.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  }
  for (let s = 0.6; s < END - 0.3; s += 1.4) {
    const y = 0.9 + surfaceAt(s) - 0.08;
    mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), phys.rail, -W / 2 + 0.03, y + 0.04, -s);
  }

  /* lights: daylight enters through the opening and falls down the stair; it strengthens as he climbs */
  const hemi = new THREE.HemisphereLight(0x2b3540, 0x07090c, 0.1);
  /* soft daylight from high windows on the near side: it shapes the treads, the wall and the person */
  const win = new THREE.DirectionalLight(0xdce2e8, 1);
  const WIN_DIR = V(1.0, 1.55, 0.3).normalize();
  win.castShadow = true;
  win.shadow.mapSize.set(2048, 2048);
  Object.assign(win.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 30 });
  win.shadow.bias = -0.0003;
  win.shadow.normalBias = 0.03;
  win.shadow.radius = 3;
  /* light through the opening, falling softly onto the upper flight */
  const day = new THREE.SpotLight(0xe2e8ee, 20, 0, 0.85, 1.0, 1.1);
  day.position.set(0.3, TOP + 3.4, endZ - 1.0);
  day.target.position.set(0.2, TOP - 2.5, endZ + 9);
  scene.add(hemi, win, win.target, day, day.target);

  const hero = buildCharacter(phys);
  hero.root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(hero.root);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }),
  );
  composer.addPass(new RenderPass(scene, camera));
  let gtao = null;
  if (options.ao !== false && !small()) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({
      radius: 0.35,
      distanceExponent: 1.4,
      thickness: 1.2,
      scale: 1.0,
      samples: 16,
    });
    gtao.updatePdMaterial({
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 5,
      rings: 2,
      samples: 16,
    });
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.6, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---- the body at time t ---- */
  const stepAt = (foot, t) => {
    let cur = null;
    for (const st of CLIMB.steps) {
      if (st.foot !== foot) continue;
      if (st.t0 <= t) cur = st;
      else break;
    }
    return cur;
  };
  const pauseWeight = (t) => {
    for (const p of CLIMB.pauses) {
      if (t >= p.t0 - 0.05 && t <= p.t1 + 0.05) {
        const last = p === CLIMB.pauses[CLIMB.pauses.length - 1];
        const first = p.t0 <= 0;
        return (first ? 1 : ramp(t, p.t0, p.t0 + 0.7)) * (last ? 1 : 1 - ramp(t, p.t1 - 0.5, p.t1));
      }
    }
    return 0;
  };
  function footPose(foot, t) {
    const st = stepAt(foot, t);
    const side = foot === 0 ? -1 : 1;
    const x = CLIMB.footX(foot);
    const base = { yaw: -side * 0.06, pitch: 0 };
    if (!st) {
      const f = CLIMB.steps[0].from;
      return { pos: [x, f.h, -f.s], ...base, swing: 0 };
    }
    if (t >= st.t1) return { pos: [x, st.to.h, -st.to.s], ...base, swing: 0 };
    const k = clamp((t - st.t0) / (st.t1 - st.t0), 0, 1);
    /* lift first: rise above the highest edge on the way (the toe reaches 0.2 m ahead of the ankle), then carry forward and set down */
    let obstacle = st.to.h;
    for (let q = st.from.s; q <= st.to.s + 0.2; q += 0.02)
      obstacle = Math.max(obstacle, surfaceAt(q));
    const flat = obstacle <= Math.max(st.from.h, st.to.h) + 1e-6 && st.from.h === st.to.h;
    const peak = obstacle + (flat ? 0.03 : 0.045);
    const e = flat ? smoother(k) : smoother(clamp((k - 0.12) / 0.88, 0, 1));
    const y =
      k < 0.42
        ? lerp(st.from.h, peak, 1 - Math.pow(1 - k / 0.42, 2))
        : lerp(peak, st.to.h, smoother((k - 0.42) / 0.58));
    const s = lerp(st.from.s, st.to.s, e);
    return {
      pos: [x, y, -s],
      yaw: base.yaw,
      pitch: 0.15 * Math.sin(Math.PI * k),
      swing: Math.sin(Math.PI * k) * (foot === 1 ? -1 : 1),
    };
  }
  function restHands(B, swing) {
    return [-1, 1].map((side) => {
      const sh = shoulderOf(B, side);
      const wrist = sh
        .clone()
        .addScaledVector(UP, -0.54)
        .addScaledVector(B.r, side * 0.035)
        .addScaledVector(B.f, 0.03 + side * swing * 0.06);
      return {
        wrist,
        fingers: V(0, -1, 0).addScaledVector(B.f, 0.1).normalize(),
        palm: B.r.clone().multiplyScalar(-side),
        curl: 0.42,
      };
    });
  }
  const smoothP = (t) => {
    const a = V(0, 0, 0);
    for (let j = 0; j < 7; j++) a.add(V(...CLIMB.P(Math.max(0, t - j * 0.22))));
    return a.multiplyScalar(1 / 7);
  };
  const climbOf = (y) => clamp((y - STAND_Y - 0.32) / (TOP - 0.32), 0, 1);

  const stats = { maxLegShort: -1, maxArmShort: -1, minClear: 9, minClearT: 0 };
  const toeL = V(0, -0.082, -0.19),
    heelL = V(0, -0.082, 0.065);
  let light = 0;
  function evaluate(t) {
    const P = CLIMB.P(t);
    const fl = footPose(0, t),
      fr = footPose(1, t);
    const swing = fl.swing + fr.swing;
    const w = pauseWeight(t);
    P[0] += (fr.swing ? 1 : fl.swing ? -1 : 0) * -0.018 * Math.abs(swing);
    const sP = -P[2];
    const sloped = (s) => (surfaceAt(s + 0.35) !== surfaceAt(s - 0.35) ? 1 : 0);
    const slope = (sloped(sP - 0.4) + sloped(sP) + sloped(sP + 0.4)) / 3;
    /* what he does with his gaze at each stop: look up the stair, glance aside, look down at the next step, or out of the opening */
    const pz = CLIMB.pauses.find((p) => t >= p.t0 - 0.05 && t <= p.t1 + 0.05);
    const u = pz ? clamp((t - pz.t0) / (pz.t1 - pz.t0), 0, 1) : 0;
    const upT = [0.12, Math.min(TOP + 2.4, P[1] + 2.6), -(sP + 5.0)];
    let gaze = upT,
      heavy = 0;
    if (pz && pz.look === 'out') gaze = [0.1, TOP + 1.55, -(END + 2.0)];
    if (pz && pz.look === 'aside') {
      const a = ramp(u, 0.06, 0.18) * (1 - ramp(u, 0.4, 0.54));
      gaze = upT.map((v, i) => lerp(v, [-1.6, P[1] + 0.7, -(sP - 0.5)][i], a));
    }
    if (pz && pz.look === 'down') {
      const a = 1 - ramp(u, 0.32, 0.52);
      gaze = upT.map((v, i) => lerp(v, [ST.walkX, surfaceAt(sP + 0.75) + 0.05, -(sP + 0.8)][i], a));
    }
    if (pz && pz.look === 'heavy') {
      const a = 1 - ramp(u, 0.3, 0.6);
      gaze = upT.map((v, i) =>
        lerp(v, [ST.walkX - 0.1, surfaceAt(sP + 1.3) + 0.25, -(sP + 1.5)][i], a),
      );
      heavy = 0.07 * a;
    }
    const bend = lerp(lerp(0.05, 0.1, slope), 0.025 + heavy, w) + 0.012 * Math.sin(t * 1.1) * w;
    const twist = 0.03 * swing * (1 - w);
    const B = bodyFrame(P, 0, bend, twist);
    const ahead = [ST.walkX - 0.12, surfaceAt(sP + 2.6) + 1.12, -(sP + 2.8)];
    const look = ahead.map((v, i) => lerp(v, gaze[i], w));
    look[0] += Math.sin(t * 0.7) * 0.02 * w;
    look[1] += Math.sin(t * 0.43) * 0.02 * w;
    const hands = restHands(B, swing * (1 - w));
    const { info } = poseCharacter(hero, {
      P,
      yaw: 0,
      bend,
      twist,
      look,
      hands,
      feet: [fl, fr],
      time: t,
    });
    stats.maxLegShort = Math.max(stats.maxLegShort, info.legShort);
    stats.maxArmShort = Math.max(stats.maxArmShort, info.armShort);
    if (options.collectStats) {
      hero.root.updateMatrixWorld(true);
      for (const [i, f] of [fl, fr].entries()) {
        if (!f.swing) continue;
        for (const pt of [toeL, heelL]) {
          const q = pt.clone().applyMatrix4(hero.feet[i].matrixWorld);
          const c = q.y - surfaceAt(-q.z);
          if (c < stats.minClear) {
            stats.minClear = c;
            stats.minClearT = +t.toFixed(2);
          }
          if (c < -0.005)
            (stats.clips = stats.clips || []).push([
              +t.toFixed(2),
              pt === toeL ? 'toe' : 'heel',
              +c.toFixed(3),
              +(-q.z).toFixed(3),
            ]);
        }
      }
    }
    const Pc = smoothP(t);
    light = smoother(climbOf(Pc.y));
    return Pc;
  }

  const size = { w: 0, h: 0 };
  function frameCamera(Pc) {
    const aspect = size.w / size.h;
    /* tall or square canvases (phone panel 0.9–1.2, tablets upright) get the centred framing; wide ones get the text-column framing */
    const portrait = aspect < 1.25;
    const L = light;
    const off = portrait ? V(1.5, 1.55, 5.4) : V(2.0, 1.15, 4.7);
    off.multiplyScalar(1 + 0.14 * L);
    const look = portrait ? V(-0.25, 0.35, -3.2) : V(-0.45, 1.35, -4.0);
    camera.fov = portrait ? 48 : 36;
    camera.aspect = aspect;
    camera.position.copy(Pc).add(off);
    camera.lookAt(Pc.clone().add(look));
    /* desktop: the image is shifted so the person and his path sit right of the text column */
    if (!portrait && !options.cam)
      camera.setViewOffset(size.w, size.h, -0.17 * size.w, 0, size.w, size.h);
    else camera.clearViewOffset();
    if (options.cam) {
      camera.position.set(options.cam[0], options.cam[1], options.cam[2]);
      camera.lookAt(options.cam[3], options.cam[4], options.cam[5]);
    }
    camera.updateProjectionMatrix();
  }
  function resize() {
    const w = canvas.clientWidth || 1,
      h = canvas.clientHeight || 1;
    if (w === size.w && h === size.h) return;
    size.w = w;
    size.h = h;
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    bloom.resolution.set(Math.round((w * pr) / 2), Math.round((h * pr) / 2));
  }
  function renderAt(t) {
    resize();
    const Pc = evaluate(t);
    frameCamera(Pc);
    const L = light;
    hemi.intensity = lerp(0.12, 0.32, L);
    win.intensity = lerp(0.55, 2.3, L);
    win.target.position.copy(Pc);
    win.position.copy(Pc).addScaledVector(WIN_DIR, 14);
    day.intensity = lerp(10, 46, L);
    skyMat.color.setScalar(lerp(0.42, 0.95, L));
    scene.fog.density = lerp(0.05, 0.03, L);
    renderer.toneMappingExposure = lerp(0.95, 1.08, L);
    composer.render();
    if (options.onFrame) options.onFrame(frameState(t));
  }

  /* ---- scroll mapping: walking advances one unit per second, pauses hold the reader longer ---- */
  const DWELL = 0.7;
  const segs = [];
  {
    let t = 0;
    for (const p of CLIMB.pauses) {
      if (p.t0 > t) segs.push({ t0: t, t1: p.t0, w: 1 });
      segs.push({ t0: p.t0, t1: p.t1, w: DWELL });
      t = p.t1;
    }
    let u = 0;
    for (const s of segs) {
      s.u0 = u;
      u += (s.t1 - s.t0) * s.w;
      s.u1 = u;
    }
    for (const s of segs) {
      s.p0 = s.u0 / u;
      s.p1 = s.u1 / u;
    }
  }
  const TOTAL = CLIMB.pauses[CLIMB.pauses.length - 1].t1;
  function timeAtProgress(p) {
    p = clamp(p, 0, 1);
    for (const s of segs)
      if (p <= s.p1) return lerp(s.t0, s.t1, (p - s.p0) / Math.max(1e-9, s.p1 - s.p0));
    return TOTAL;
  }
  function progressAtTime(t) {
    t = clamp(t, 0, TOTAL);
    for (const s of segs)
      if (t <= s.t1) return lerp(s.p0, s.p1, (t - s.t0) / Math.max(1e-9, s.t1 - s.t0));
    return 1;
  }
  const inPause = (t) => CLIMB.pauses.find((p) => t >= p.t0 && t <= p.t1);
  /* the figure never stops mid-stride: a target between steps moves on to the next place he can stand */
  function snap(t, dir) {
    if (inPause(t)) return t;
    const rests = CLIMB.holds
      .concat(
        CLIMB.pauses.map((p) => p.t0),
        CLIMB.pauses.map((p) => p.t1),
      )
      .sort((a, b) => a - b);
    if (dir >= 0) {
      for (const r of rests) if (r >= t - 1e-6) return r;
      return TOTAL;
    }
    for (let i = rests.length - 1; i >= 0; i--) if (rests[i] <= t + 1e-6) return rests[i];
    return 0;
  }
  function fragOpacity(t) {
    return CLIMB.pauses.map((p, i) => {
      const last = i === CLIMB.pauses.length - 1;
      const inn = i === 0 ? 1 : ramp(t, p.t0 + 0.2, p.t0 + 1.2);
      const out = last ? 1 : 1 - ramp(t, p.t1 - 1.0, p.t1);
      return t < p.t0 - 0.01 || (!last && t > p.t1) ? 0 : inn * out;
    });
  }
  /* local: how far through each stop the story is (-1 before it, 2 after it) — the page uses it to reveal paragraphs */
  const localOf = (t) =>
    CLIMB.pauses.map((p) => (t < p.t0 ? -1 : t > p.t1 ? 2 : (t - p.t0) / (p.t1 - p.t0)));
  function frameState(t) {
    return {
      t,
      progress: progressAtTime(t),
      frags: fragOpacity(t),
      local: localOf(t),
      light,
      body: CLIMB.P(t),
    };
  }

  /* ---- playhead ---- */
  const reduce =
    options.reduced ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let rawTarget = 0,
    target = 0,
    play = 0,
    lastDir = 1,
    running = true,
    raf = 0,
    last = performance.now();
  function setProgress(p) {
    const tt = timeAtProgress(p);
    if (reduce) {
      /* no walking: show the still composition of the nearest narrative pause */
      let k = 0;
      CLIMB.pauses.forEach((q, i) => {
        if (q.t0 - 0.01 <= tt + 2.0) k = i;
      });
      const q = CLIMB.pauses[k];
      play = target = Math.min(q.t1 - 0.7, q.t0 + 1.4);
      if (k === CLIMB.pauses.length - 1) play = target = q.t0 + 1.6;
      return;
    }
    if (tt !== rawTarget) lastDir = tt > rawTarget ? 1 : -1;
    rawTarget = tt;
    target = snap(rawTarget, lastDir);
  }
  /* move the playhead toward the target: natural pace when close; a longer jump catches up faster but stays continuous */
  function advance(dt) {
    if (reduce) return;
    const d = target - play;
    const v = Math.min(10, (d > 0 ? 1.0 : 2.0) * (1 + Math.abs(d) / 3));
    play = Math.abs(d) <= v * dt ? target : play + Math.sign(d) * v * dt;
  }
  /* draw only when the story moved or the canvas changed size; a figure at rest costs nothing */
  let drawn = -1;
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    advance(dt);
    if (
      play !== drawn ||
      (canvas.clientWidth || 1) !== size.w ||
      (canvas.clientHeight || 1) !== size.h
    ) {
      renderAt(play);
      drawn = play;
    }
    raf = requestAnimationFrame(loop);
  }
  if (options.manual) renderAt(options.time || 0);
  else {
    setProgress(options.progress || 0);
    play = target;
    raf = requestAnimationFrame(loop);
  }

  return {
    renderAt,
    evaluate,
    advance,
    stats,
    climb: CLIMB,
    setProgress,
    timeAtProgress,
    progressAtTime,
    total: TOTAL,
    pauses: CLIMB.pauses,
    state: () => frameState(play),
    reduced: () => !!reduce,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      composer.dispose();
      renderer.dispose();
    },
  };
}
