/* Builder v3 — Connected Systems. The real-time home page scene. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { rig } from './character';
import { DrawShader, NormalIdMaterial } from './draw-shader';
import {
  BOARD,
  BTOP,
  COMP,
  EFFECT_END,
  LINKS,
  LOOP,
  MH,
  MODS,
  MTOP,
  NEW_LINKS,
  PACKETS,
  PLAT_H,
  RACK_ROW_Z,
  RAIL,
  SLOT,
  TABLE,
  TM,
  TRAY,
  TRAY_POS,
  TRUNK,
  buildCycle,
  feetAt,
  polyAt,
} from './sequence';
import { bevelBox } from '../shared/geometry';
import { clamp, lerp, ramp, smoother, UP, V, vlerp } from '../shared/math';
import { basisQuat } from '../shared/rig';
import { loadSkinnedRig } from '../shared/skinned-rig';
import { blobTexture, surface } from '../shared/textures';

/* ---------- mount ---------- */
const col = (h) => new THREE.Color(h);

function doorTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#39414A';
  g.fillRect(0, 0, 128, 512);
  g.fillStyle = '#2A3037';
  g.fillRect(6, 6, 116, 500);
  /* server units: a light lip and a darker vented face each */
  for (let y = 14; y < 500; y += 22) {
    g.fillStyle = '#46505A';
    g.fillRect(10, y, 108, 2);
    g.fillStyle = 'rgba(12,14,17,0.6)';
    for (let x = 14; x < 92; x += 5) g.fillRect(x, y + 6, 3, 9);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function mount(canvas, options) {
  options = options || {};
  /* the body the animation is aimed at; a loaded model replaces these with its own measurements */
  let { bodyFrame, shoulderOf, dim: DIM } = rig;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: !!options.preserveDrawingBuffer,
  });
  /* Rendering is fragment-bound, so the device pixel ratio is capped at 1 by default; the
     pencil compositor scales its line widths with `pr`, so the drawing stays proportional. */
  const pr = Math.min(window.devicePixelRatio || 1, options.maxPixelRatio || 1);
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const LIGHT_BG = col('#EEEAE3'),
    DARK_BG = col('#10151B'),
    PAPER_FOG = col('#F1EEE8');
  const scene = new THREE.Scene();
  scene.background = LIGHT_BG.clone();
  scene.fog = new THREE.Fog(LIGHT_BG.clone(), 3.7, 5.0);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.3;
  pm.dispose();

  const floorTex = surface({
    size: 512,
    seed: 3,
    color: [222, 217, 208],
    variation: 0.05,
    grain: 0.03,
    roughness: 0.88,
    pores: 0,
    scale: 4,
    repeat: [50, 50],
    decorate: (g, size) => {
      g.fillStyle = 'rgba(80,76,70,0.22)';
      g.fillRect(0, 0, size, 2);
      g.fillRect(0, 0, 2, size);
    },
  });
  const tableTex = surface({
    size: 512,
    seed: 11,
    color: [230, 226, 218],
    variation: 0.05,
    grain: 0.02,
    roughness: 0.78,
    pores: 80,
    scale: 3,
    repeat: [1.4, 1],
  });
  const boardTex = surface({
    size: 512,
    seed: 21,
    color: [216, 210, 200],
    variation: 0.03,
    grain: 0.02,
    roughness: 0.85,
    pores: 0,
    scale: 4,
    repeat: [1, 1],
    decorate: (g, size) => {
      g.fillStyle = 'rgba(90,84,76,0.16)';
      for (let i = 0; i <= 16; i++) {
        const p = Math.round((i * size) / 16);
        g.fillRect(p, 0, 1, size);
        g.fillRect(0, p, size, 1);
      }
    },
  });

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phys = {
    floor: std({ map: floorTex.map, roughnessMap: floorTex.roughnessMap, roughness: 1 }),
    table: std({ map: tableTex.map, roughnessMap: tableTex.roughnessMap, roughness: 1 }),
    board: std({ map: boardTex.map, roughness: 0.85 }),
    plat: std({ color: '#E2DDD4', roughness: 0.8 }),
    body: std({ color: '#F3F0EA', roughness: 0.5 }),
    base: std({ color: '#3B3834', roughness: 0.55, metalness: 0.2 }),
    port: std({ color: '#2C2926', roughness: 0.6 }),
    tray: std({ color: '#E7E2D9', roughness: 0.7 }),
    rack: std({ color: '#2C333B', roughness: 0.42, metalness: 0.45 }),
    door: std({ map: doorTexture(), roughness: 0.55, metalness: 0.3 }),
    tracks: std({ color: '#2A2F35', roughness: 0.6, metalness: 0.3 }),
    shirt: std({ color: '#8E8A84', roughness: 1, side: THREE.DoubleSide }),
    pants: std({ color: '#5E5A55', roughness: 1, side: THREE.DoubleSide }),
    skin: std({ color: '#CDBDAE', roughness: 0.8 }),
    hair: std({ color: '#3A3530', roughness: 0.9, side: THREE.DoubleSide }),
    shoe: std({ color: '#4A4743', roughness: 0.9 }),
    sole: std({ color: '#C9C4BB', roughness: 0.9 }),
    feature: std({ color: '#3A3530', roughness: 0.9 }),
  };
  const toneOf = (hex) => std({ color: hex, roughness: 1, side: THREE.DoubleSide });
  const LIGHTTONE = toneOf('#ECE8E1');
  const tone = {
    shirt: toneOf('#D2CEC7'),
    pants: toneOf('#AEAAA3'),
    skin: toneOf('#E8DFD4'),
    hair: toneOf('#A39C92'),
    shoe: toneOf('#7E7A73'),
    sole: toneOf('#DEDAD2'),
    feature: toneOf('#4E4943'),
  };
  /* colours that move from the warm light stage to the deep dark stage */
  const themed = [
    [phys.floor, '#FFFFFF', '#3C434B'],
    [phys.table, '#FFFFFF', '#4E5660'],
    [phys.board, '#FFFFFF', '#3A4148'],
    [phys.plat, '#E2DDD4', '#343B43'],
    [phys.body, '#F3F0EA', '#6A737D'],
    [phys.tray, '#E7E2D9', '#444C55'],
  ].map(([m, a, b]) => ({ m, a: col(a), b: col(b) }));

  /* lights */
  const hemi = new THREE.HemisphereLight(0xf2f0ec, 0xc2b9ab, 0.62);
  const sun = new THREE.DirectionalLight(0xffeeda, 4.6);
  sun.position.set(2.2, 5.6, 2.6);
  sun.target.position.set(0, 0.8, 0.2);
  sun.castShadow = true;
  const shadowMapSize = options.shadowMapSize || 2048;
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  Object.assign(sun.shadow.camera, {
    left: -1.8,
    right: 1.8,
    top: 1.8,
    bottom: -1.8,
    near: 1,
    far: 12,
  });
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.02;
  const key = new THREE.SpotLight(0xdde8f4, 0, 6, 0.6, 0.85, 1.2);
  key.position.set(0.25, 3.0, -0.55);
  key.target.position.set(-0.05, 0.86, 0.05);
  scene.add(hemi, sun, sun.target, key, key.target);
  const HEMI_SKY = [col('#F2F0EC'), col('#8FA3B8')],
    HEMI_GND = [col('#C2B9AB'), col('#1A1F25')],
    SUN_COL = [col('#FFEEDA'), col('#C9D8EA')];
  function applyLights(k) {
    hemi.intensity = lerp(0.62, 0.22, k);
    hemi.color.copy(HEMI_SKY[0]).lerp(HEMI_SKY[1], k);
    hemi.groundColor.copy(HEMI_GND[0]).lerp(HEMI_GND[1], k);
    sun.intensity = lerp(4.6, 0.9, k);
    sun.color.copy(SUN_COL[0]).lerp(SUN_COL[1], k);
    key.intensity = 26 * k;
    scene.environmentIntensity = lerp(0.3, 0.14, k);
  }

  const registry = [];
  const register = (o, key, isFigure, custom) => {
    registry.push({
      o,
      phys: (custom && custom.phys) || phys[key] || o.material,
      tone: (custom && custom.tone) || tone[key] || LIGHTTONE,
      norm: NormalIdMaterial(isFigure ? 1 : 0),
    });
    if (custom && custom.phys) o.material = custom.phys;
    else if (phys[key]) o.material = phys[key];
  };
  const add = (o, key, shadow) => {
    o.castShadow = shadow !== false;
    o.receiveShadow = true;
    scene.add(o);
    register(o, key);
    return o;
  };

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60));
  floor.rotation.x = -Math.PI / 2;
  add(floor, 'floor', false);

  /* worktable: a stone top on two slim panel legs */
  const TW = TABLE.x1 - TABLE.x0,
    TD = TABLE.z1 - TABLE.z0,
    TX = (TABLE.x0 + TABLE.x1) / 2,
    TZ = (TABLE.z0 + TABLE.z1) / 2;
  const top = add(new THREE.Mesh(bevelBox(TW, TABLE.th, TD, 0.008)), 'table');
  top.position.set(TX, TABLE.top - TABLE.th / 2, TZ);
  for (const x of [TABLE.x0 + 0.07, TABLE.x1 - 0.07]) {
    const leg = add(
      new THREE.Mesh(bevelBox(0.036, TABLE.top - TABLE.th, TD - 0.12, 0.006)),
      'table',
    );
    leg.position.set(x, (TABLE.top - TABLE.th) / 2, TZ);
  }
  const board = add(new THREE.Mesh(bevelBox(BOARD.w, BOARD.h, BOARD.d, 0.004)), 'board');
  board.position.set(BOARD.cx, TABLE.top + BOARD.h / 2, BOARD.cz);
  const plat = add(new THREE.Mesh(bevelBox(0.42, PLAT_H, 0.13, 0.003)), 'plat');
  plat.position.set(MODS.db.c[0], BTOP + PLAT_H / 2, MODS.db.c[1]);

  /* a module: dark interface layer, light body, interface sockets front and back, a status line facing the room */
  const statusMats = {};
  function module(name, fp) {
    const g = new THREE.Group();
    const part = (geo, key, y) => {
      const o = new THREE.Mesh(geo);
      o.position.y = y;
      o.castShadow = true;
      o.receiveShadow = true;
      g.add(o);
      register(o, key);
      return o;
    };
    part(bevelBox(fp[0] - 0.012, MH.base, fp[1] - 0.012, 0.002), 'base', MH.base / 2);
    part(bevelBox(fp[0], MH.body, fp[1], 0.006), 'body', MH.base + MH.gap + MH.body / 2);
    for (const s of [-1, 1]) {
      const sock = part(
        new THREE.BoxGeometry(0.026, 0.009, 0.003),
        'port',
        MH.base + MH.gap + 0.006,
      );
      sock.position.z = s * (fp[1] / 2 + 0.0008);
    }
    const sm = std({ color: '#B5ADA1', roughness: 0.4, emissive: '#4C9BEA', emissiveIntensity: 0 });
    statusMats[name] = sm;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(fp[0] * 0.46, 0.0022, 0.006), sm);
    bar.position.set(0, MTOP + 0.0011, -fp[1] / 2 + 0.012);
    g.add(bar);
    register(bar, null);
    scene.add(g);
    return g;
  }
  for (const n of ['ifc', 's1', 's3', 'db']) {
    const m = MODS[n];
    module(n, m.fp).position.set(m.c[0], m.y0, m.c[1]);
  }
  const comp = module('s2', MODS.s2.fp);
  /* the component's own interface underneath, seen when he turns it over */
  for (const s of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.002, 0.044), phys.port);
    pad.position.set(s * 0.03, -0.001, 0);
    comp.add(pad);
    register(pad, 'port');
  }

  /* links: thin raised rails with port pads at both ends; one material each so they can light up */
  const BLUE = col('#4C9BEA');
  const linkMats = {},
    linkPts = {};
  const railY = BTOP + RAIL.h / 2;
  function rail(pts, mat, w, h) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1],
        b = pts[i];
      const L = a.distanceTo(b);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, L + w, h), mat);
      seg.position.copy(a).add(b).multiplyScalar(0.5);
      /* local y runs along the segment, local z is the rail's height (world up when the segment is level) */
      const y = b.clone().sub(a).normalize();
      const z = UP.clone().addScaledVector(y, -UP.dot(y));
      if (z.lengthSq() < 1e-6) z.set(1, 0, 0);
      z.normalize();
      seg.quaternion.copy(basisQuat(y.clone().cross(z).normalize(), y, z));
      seg.castShadow = false;
      seg.receiveShadow = true;
      scene.add(seg);
      register(seg, null);
    }
  }
  for (const [k, pts2] of Object.entries(LINKS)) {
    const m = std({ color: '#5C5750', roughness: 0.55, emissive: BLUE, emissiveIntensity: 0 });
    linkMats[k] = m;
    const pts = pts2.map((p) => V(p[0], railY, p[1]));
    linkPts[k] = pts.map((p) => p.clone().setY(railY + RAIL.h / 2 + 0.002));
    rail(pts, m, RAIL.w, RAIL.h);
    for (const p of [pts[0], pts[pts.length - 1]]) {
      const pad = add(new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.0016, 0.016)), 'port', false);
      pad.position.set(p.x, BTOP + 0.0008, p.z);
    }
  }
  const trunkMat = std({ color: '#3A3631', roughness: 0.55, emissive: BLUE, emissiveIntensity: 0 });
  const trunkPts = TRUNK.map((p) => V(p[0], p[1], p[2]));
  rail(trunkPts, trunkMat, 0.009, 0.006);

  /* parts tray on the right of the table */
  const tray = add(new THREE.Mesh(bevelBox(TRAY.w, TRAY.h, TRAY.d, 0.003)), 'tray');
  tray.position.set(TRAY.x, TABLE.top + TRAY.h / 2, TRAY.z);
  for (const [w, d, x, z] of [
    [TRAY.w, 0.008, 0, TRAY.d / 2 - 0.004],
    [TRAY.w, 0.008, 0, -TRAY.d / 2 + 0.004],
    [0.008, TRAY.d, TRAY.w / 2 - 0.004, 0],
    [0.008, TRAY.d, -TRAY.w / 2 + 0.004, 0],
  ]) {
    const rim = add(new THREE.Mesh(bevelBox(w, 0.012, d, 0.002)), 'tray');
    rim.position.set(TRAY.x + x, TABLE.top + TRAY.h + 0.006, TRAY.z + z);
  }

  /* signal packets */
  const packetMat = std({
    color: '#1F5FB0',
    emissive: col('#2F86F0'),
    emissiveIntensity: 1.4,
    roughness: 0.4,
  });
  const haloTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d'),
      gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const halos = [];
  const withHalo = (p, size) => {
    const h = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: haloTex,
        color: '#5AA2F0',
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
        fog: false,
      }),
    );
    h.scale.setScalar(size);
    p.add(h);
    halos.push(h);
  };
  const packets = [];
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.0062, 0.026, 4, 10), packetMat);
    withHalo(p, 0.075);
    p.visible = false;
    scene.add(p);
    register(p, null);
    packets.push(p);
  }
  const trunkPacket = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.05, 4, 10), packetMat);
  withHalo(trunkPacket, 0.16);
  trunkPacket.visible = false;
  scene.add(trunkPacket);
  register(trunkPacket, null);

  /* the server room: rows of racks hidden in the warm haze until the system is connected */
  const rackGeo = bevelBox(0.6, 2.0, 0.9, 0.012);
  const doorGeo = new THREE.PlaneGeometry(0.54, 1.9);
  const ledSpots = [];
  const roomObjs = [];
  function rackRow(x0, z0, dx, dz, n, yaw, answerIndex) {
    for (let i = 0; i < n; i++) {
      const x = x0 + dx * i,
        z = z0 + dz * i;
      const r = new THREE.Mesh(rackGeo);
      r.position.set(x, 1.0, z);
      r.rotation.y = yaw;
      add(r, 'rack');
      roomObjs.push(r);
      const d = new THREE.Mesh(doorGeo);
      const fwd = V(Math.sin(yaw), 0, Math.cos(yaw));
      d.position.set(x + fwd.x * 0.452, 1.0, z + fwd.z * 0.452);
      d.rotation.y = yaw;
      add(d, 'door', false);
      roomObjs.push(d);
      const side = V(Math.cos(yaw), 0, -Math.sin(yaw));
      for (let j = 0; j < 9; j++) {
        const y = 0.28 + j * 0.19 + ((i * 7 + j * 3) % 5) * 0.012;
        const p = V(x, y, z)
          .addScaledVector(fwd, 0.455)
          .addScaledVector(side, 0.2 - ((i + j) % 3) * 0.035);
        ledSpots.push({
          p,
          yaw,
          phase: (i * 1.7 + j * 2.3) % 6.28,
          rate: 0.25 + ((i * 3 + j) % 5) * 0.08,
          answer: i === answerIndex,
        });
      }
    }
  }
  rackRow(-3.4, RACK_ROW_Z, 0.62, 0, 10, Math.PI, 3);
  rackRow(-3.35, 0.3, 0, 0.62, 3, Math.PI / 2, -1);
  rackRow(-3.4, RACK_ROW_Z + 2.4, 0.62, 0, 11, Math.PI, -1);
  for (const [x, z, L, rot] of [
    [-0.6, RACK_ROW_Z, 6.4, 0],
    [-3.35, 0.95, 2.0, Math.PI / 2],
    [-0.3, RACK_ROW_Z + 2.4, 7.0, 0],
  ]) {
    const tr = add(new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, 0.3)), 'tracks', false);
    tr.position.set(x, 2.32, z);
    tr.rotation.y = rot;
    roomObjs.push(tr);
  }
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
  const leds = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.016, 0.007, 0.004),
    ledMat,
    ledSpots.length,
  );
  const tmpM = new THREE.Matrix4(),
    tmpQ = new THREE.Quaternion(),
    tmpC = new THREE.Color();
  ledSpots.forEach((s, i) => {
    tmpQ.setFromAxisAngle(UP, s.yaw);
    tmpM.compose(s.p, tmpQ, V(1, 1, 1));
    leds.setMatrixAt(i, tmpM);
    leds.setColorAt(i, tmpC.setRGB(0, 0, 0));
  });
  scene.add(leds);
  register(leds, null);
  roomObjs.push(leds);
  const aisle = [V(-1.0, 3.3, RACK_ROW_Z - 1.15), V(-2.5, 3.3, 0.9)].map((p) => {
    const l = new THREE.PointLight(0xbfd4ec, 0, 8, 1.4);
    l.position.copy(p);
    scene.add(l);
    return l;
  });

  /* soft contact shadows */
  const blobTex = blobTexture();
  const blobs = [];
  const blob = (w, d, x, z, op) => {
    const b = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({
        map: blobTex,
        transparent: true,
        depthWrite: false,
        opacity: op,
        fog: false,
      }),
    );
    b.rotation.x = -Math.PI / 2;
    b.position.set(x, 0.002, z);
    scene.add(b);
    blobs.push(b);
    return b;
  };
  blob(TW + 0.5, TD + 0.5, TX, TZ, 0.42);
  const footBlobs = [blob(0.2, 0.36, 0, 0, 0.45), blob(0.2, 0.36, 0, 0, 0.45)];

  /* the figure: the procedural rig, or a humanoid model driven by the same animation. Either
     way the compositor draws it; its physical body only casts shadows and occludes, never adds
     colour. Nothing is rendered until the figure is in the scene. */
  let figure = rig,
    hero = null;
  const placeFigure = (f, built, mats) => {
    figure = f;
    ({ bodyFrame, shoulderOf, dim: DIM } = f);
    hero = built;
    scene.add(hero.root);
    for (const [o, key, custom] of mats) register(o, key, true, custom);
  };
  let figureReady;
  if (options.figureUrl) {
    figureReady = loadSkinnedRig(options.figureUrl, rig, {
      scale: options.figureScale,
      flipPalms: options.flipPalms,
      hide: options.figureHide,
    }).then((f) => {
      if (disposed) return;
      const built = f.buildCharacter();
      const mats = built.meshes.map((o) => {
        const src = o.material;
        const physM = src.clone();
        physM.colorWrite = false;
        /* the drawing's shading comes from the model's own colours, lifted toward the paper */
        const lift = options.figureToneLift || 3.2;
        const toneM = std({
          map: src.map || null,
          color: src.map ? new THREE.Color(lift, lift, lift) : src.color,
          roughness: 1,
          alphaTest: src.alphaTest,
          side: THREE.DoubleSide,
        });
        return [o, null, { phys: physM, tone: toneM }];
      });
      placeFigure(f, built, mats);
    });
  } else {
    const built = rig.buildCharacter(phys);
    for (const k of ['shirt', 'pants', 'skin', 'hair', 'shoe', 'sole', 'feature'])
      phys[k].colorWrite = false;
    const keyOf = new Map([
      [phys.shirt, 'shirt'],
      [phys.pants, 'pants'],
      [phys.skin, 'skin'],
      [phys.hair, 'hair'],
      [phys.shoe, 'shoe'],
      [phys.sole, 'sole'],
      [phys.feature, 'feature'],
    ]);
    const mats = [];
    built.root.traverse((o) => {
      if (o.isMesh) mats.push([o, keyOf.get(o.material)]);
    });
    placeFigure(rig, built, mats);
    figureReady = Promise.resolve();
  }

  const cyc = buildCycle();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);

  /* passes */
  /* the tone pass only feeds the compositor's edge and hatch detection, so it is not multisampled by default */
  const toneRT = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: options.toneSamples == null ? 0 : options.toneSamples,
  });
  const normRT = new THREE.WebGLRenderTarget(1, 1);
  normRT.depthTexture = new THREE.DepthTexture(1, 1);
  normRT.texture.minFilter = normRT.texture.magFilter = THREE.NearestFilter;
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }),
  );
  composer.renderToScreen = false;
  composer.addPass(new RenderPass(scene, camera));
  if (options.ao !== false) {
    const aoSamples = options.aoSamples || 8;
    const gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({
      radius: 0.3,
      distanceExponent: 1.4,
      thickness: 1.2,
      scale: 1.0,
      samples: aoSamples,
    });
    gtao.updatePdMaterial({
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 5,
      rings: 2,
      samples: aoSamples,
    });
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0, 0.5, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const draw = new THREE.ShaderMaterial(DrawShader);
  draw.uniforms = THREE.UniformsUtils.clone(DrawShader.uniforms);
  draw.uniforms.tTone.value = toneRT.texture;
  draw.uniforms.tNorm.value = normRT.texture;
  draw.uniforms.tDepth.value = normRT.depthTexture;
  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), draw));

  function applyPass(kind) {
    for (const r of registry) r.o.material = r[kind];
    for (const b of blobs) b.visible = kind !== 'norm';
    for (const h of halos) h.visible = kind === 'phys';
    const room = kind === 'phys' && theme > 0.22;
    for (const o of roomObjs) o.visible = room;
  }

  /* ---- timing curves of one loop ---- */
  const themeAt = (t) =>
    t < TM.themeDown[0]
      ? ramp(t, TM.themeUp[0], TM.themeUp[1])
      : 1 - ramp(t, TM.themeDown[0], TM.themeDown[1]);
  const revealAt = (t) => (t >= TM.dip[1] ? 0 : ramp(t, TM.reveal[0], TM.reveal[1]));
  const dipAt = (t) =>
    t < TM.dip[1] ? ramp(t, TM.dip[0], TM.dip[1]) : 1 - ramp(t, TM.dip[1], TM.dip[2]);

  /* ---- the component's path ---- */
  const frameOf = (pos, yaw, pitch) => ({
    pos,
    q: new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch || 0, yaw, 0, 'YXZ')),
  });
  const trayFrame = () => frameOf(V(TRAY_POS.x, TRAY_POS.y, TRAY_POS.z), 0);
  function carryAt(t) {
    const P = cyc.P(t),
      psi = cyc.yaw(t);
    const f = V(-Math.sin(psi), 0, -Math.cos(psi));
    const ex = ramp(t, TM.lifted, TM.lifted + 0.7) * (1 - ramp(t, TM.examEnd - 0.6, TM.examEnd));
    return V(P[0], P[1], P[2])
      .addScaledVector(f, 0.31 - 0.04 * ex)
      .addScaledVector(UP, 0.19 + 0.07 * ex);
  }
  function bodyOffset(t, point) {
    const B = bodyFrame(cyc.P(t), cyc.yaw(t), cyc.bend(t), cyc.twist(t));
    const mid = shoulderOf(B, -1).add(shoulderOf(B, 1)).multiplyScalar(0.5);
    const d = point.clone().sub(mid);
    return [d.dot(B.ft), d.dot(B.ut), d.dot(B.rt)];
  }
  const slotFrame = (t) =>
    frameOf(V(SLOT.x + cyc.adjX(t), SLOT.y + cyc.lowerY(t), SLOT.z + cyc.adjZ(t)), cyc.adjYaw(t));
  function compFrame(t, B) {
    if (t >= TM.dip[1] || t < TM.grip) return trayFrame();
    const psi = cyc.yaw(t);
    if (t < TM.lifted) {
      const k = ramp(t, TM.grip, TM.lifted);
      const a = bodyOffset(TM.grip, trayFrame().pos),
        b = bodyOffset(TM.lifted, carryAt(TM.lifted));
      const mid = shoulderOf(B, -1).add(shoulderOf(B, 1)).multiplyScalar(0.5);
      const o = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
      return frameOf(
        mid.addScaledVector(B.ft, o[0]).addScaledVector(B.ut, o[1]).addScaledVector(B.rt, o[2]),
        lerp(0, psi, k),
      );
    }
    if (t < TM.examEnd) return frameOf(carryAt(t), psi + cyc.exYaw(t), cyc.exPitch(t));
    if (t < TM.above) {
      const k = ramp(t, TM.examEnd, TM.above);
      const s = slotFrame(TM.above);
      const f = frameOf(carryAt(t), psi);
      return { pos: f.pos.clone().lerp(s.pos, k), q: f.q.clone().slerp(s.q, k) };
    }
    return slotFrame(t);
  }

  /* ---- hands ---- */
  function gripHands(frame, B) {
    const axis = V(1, 0, 0).applyQuaternion(frame.q);
    if (axis.dot(B.r) < 0) axis.negate();
    const half = COMP.w / 2 + 0.011;
    return [-1, 1].map((side) => {
      const grip = frame.pos
        .clone()
        .addScaledVector(axis, side * half)
        .addScaledVector(UP, -0.004);
      const palm = axis.clone().multiplyScalar(-side);
      const fingers = B.f.clone().multiplyScalar(0.5).addScaledVector(UP, -0.86);
      fingers.addScaledVector(palm, -fingers.dot(palm)).normalize();
      return {
        wrist: grip.clone().addScaledVector(fingers, -DIM.wristToGrip),
        fingers,
        palm,
        curl: 0.3,
      };
    });
  }
  function leanHands(B) {
    return [
      [TABLE.x0 + 0.17, -1],
      [0.22, 1],
    ].map(([x]) => {
      const fingers = B.f.clone().multiplyScalar(0.92).addScaledVector(UP, -0.38).normalize();
      const grip = V(x, TABLE.top + 0.012, TABLE.z1 - 0.05);
      return {
        wrist: grip
          .clone()
          .addScaledVector(fingers, -DIM.wristToGrip * 0.9)
          .addScaledVector(UP, 0.018),
        fingers,
        palm: V(0, -1, 0),
        curl: 0.12,
      };
    });
  }
  function pressHands(B, force, lean) {
    const fingers = B.f.clone().multiplyScalar(0.62).addScaledVector(UP, -0.78).normalize();
    const tip = V(SLOT.x + 0.02, BTOP + MTOP + 0.012 - 0.003 * force, SLOT.z + 0.01);
    return [
      lean[0],
      {
        wrist: tip.clone().addScaledVector(fingers, -DIM.wristToGrip),
        fingers,
        palm: V(0, -1, 0).addScaledVector(B.f, 0.25).normalize(),
        curl: 0.18,
      },
    ];
  }
  function restHands(B, swing) {
    return [-1, 1].map((side) => {
      const sh = shoulderOf(B, side);
      const wrist = sh
        .clone()
        .addScaledVector(UP, -(DIM.upperArm + DIM.forearm) * 0.964)
        .addScaledVector(B.r, side * 0.03)
        .addScaledVector(B.f, 0.035 + side * swing * 0.05);
      return {
        wrist,
        fingers: V(0, -1, 0).addScaledVector(B.f, 0.12).normalize(),
        palm: B.r.clone().multiplyScalar(-side),
        curl: 0.5,
      };
    });
  }
  function blendHands(a, b, w, outward) {
    return a.map((ha, i) => {
      const hb = b[i];
      const arc = Math.sin(Math.PI * w);
      return {
        wrist: vlerp(ha.wrist, hb.wrist, w)
          .addScaledVector(hb.palm, -arc * outward)
          .addScaledVector(UP, arc * 0.025),
        fingers: vlerp(ha.fingers, hb.fingers, w).normalize(),
        palm: vlerp(ha.palm, hb.palm, w).normalize(),
        curl: lerp(ha.curl, hb.curl, w),
      };
    });
  }

  /* ---- signals ---- */
  const RAIL_LIT = col('#46505C'),
    RAIL_OFF = col('#5C5750'),
    RAIL_DARK = col('#20262D'),
    STATUS_ON = col('#9DB9D4'),
    STATUS_OFF = col('#B5ADA1');
  function packetPos(pk, t) {
    const k = smoother(clamp((t - pk.t0) / (pk.t1 - pk.t0), 0, 1));
    const pts = pk.link === 'trunk' ? trunkPts : linkPts[pk.link];
    return polyAt(pts, pk.dir > 0 ? k : 1 - k);
  }
  function signals(t, k) {
    const reset = t >= TM.dip[1];
    let n = 0;
    let focus = null;
    const flash = {};
    for (const pk of PACKETS) {
      if (reset || t < pk.t0 || t > pk.t1) continue;
      const p = packets[n++];
      const pos = packetPos(pk, t),
        ahead = packetPos(pk, Math.min(pk.t1, t + 0.02));
      p.visible = true;
      p.position.copy(pos);
      const dir = ahead.clone().sub(pos);
      if (dir.lengthSq() > 1e-10) p.quaternion.setFromUnitVectors(UP, dir.normalize());
      if (!focus) focus = pos;
      flash[pk.link] = 1;
    }
    for (let i = n; i < packets.length; i++) packets[i].visible = false;
    const newLit = (key) => {
      if (reset || t < TM.hsBack) return 0;
      return key === 's2-db'
        ? ramp(t, TM.hsBack, TM.hsBack + 0.55)
        : ramp(t, TM.hsBack + 0.6, TM.hsBack + 1.15);
    };
    for (const [key, m] of Object.entries(linkMats)) {
      const lit = NEW_LINKS.includes(key) ? newLit(key) : 1;
      m.emissiveIntensity = lit * lerp(0.45, 1.5, k) + (flash[key] || 0) * 0.9;
      m.color.copy(lit > 0.5 ? RAIL_LIT : RAIL_OFF).lerp(RAIL_DARK, k);
    }
    const s2on = reset ? 0 : ramp(t, TM.hsDone - 0.1, TM.hsDone + 0.25);
    const dbFlash = Math.max(0, Math.sin(Math.PI * clamp((t - (TM.hsDb + 0.5)) / 0.5, 0, 1)));
    const wave = Math.max(0, Math.sin(Math.PI * clamp((t - 14.1) / 1.4, 0, 1)));
    for (const [name, m] of Object.entries(statusMats)) {
      const on = name === 's2' ? s2on : 1;
      m.emissiveIntensity =
        on * lerp(0.5, 1.6, k) +
        (name === 'db' ? dbFlash * 1.4 : 0) +
        (reset ? 0 : wave * 1.2 * on);
      m.color.copy(on > 0.5 ? STATUS_ON : STATUS_OFF);
    }
    /* the trunk carries the signal out into the room once it is dark enough to see */
    trunkMat.emissiveIntensity = k * 0.9;
    const tk = (t - TM.trunk[0]) / (TM.trunk[1] - TM.trunk[0]);
    trunkPacket.visible = !reset && tk > 0 && tk < 1;
    if (trunkPacket.visible) {
      const pos = polyAt(trunkPts, smoother(tk)),
        ahead = polyAt(trunkPts, smoother(Math.min(1, tk + 0.01)));
      trunkPacket.position.copy(pos);
      const d = ahead.sub(pos);
      if (d.lengthSq() > 1e-10) trunkPacket.quaternion.setFromUnitVectors(UP, d.normalize());
    }
    const answer = reset
      ? 0
      : Math.max(0, Math.sin(Math.PI * clamp((t - TM.trunk[1]) / 1.2, 0, 1)));
    ledSpots.forEach((s, i) => {
      const tw = 0.75 + 0.25 * Math.sin(t * s.rate * 6.283 + s.phase);
      const b = k * (0.55 * tw + (s.answer ? answer * 2.2 : 0));
      leds.setColorAt(i, tmpC.setRGB(0.32 * b, 0.62 * b, 1.0 * b));
    });
    leds.instanceColor.needsUpdate = true;
    for (const l of aisle) l.intensity = 7 * k * k;
    return focus;
  }

  const stats = { maxArmShort: -1, maxLegShort: -1, worst: null };
  let theme = 0,
    reveal = 0,
    dip = 0;
  function evaluate(g) {
    const t = ((g % LOOP) + LOOP) % LOOP;
    theme = themeAt(t);
    reveal = revealAt(t);
    dip = dipAt(t);
    const P = cyc.P(t),
      psi = cyc.yaw(t),
      bend = cyc.bend(t) + 0.025 * cyc.force(t),
      twist = cyc.twist(t);
    const B = bodyFrame(P, psi, bend, twist);
    const feet = feetAt(cyc, t);
    let swing = 0;
    for (const st of cyc.steps)
      if (t > st.t0 && t < st.t1)
        swing = Math.sin((Math.PI * (t - st.t0)) / (st.t1 - st.t0)) * (st.foot === 0 ? 1 : -1);
    const frame = compFrame(t, B);
    comp.position.copy(frame.pos).addScaledVector(V(0, 1, 0).applyQuaternion(frame.q), -MTOP / 2);
    comp.quaternion.copy(frame.q);
    const hold = cyc.hold(t),
      lean = cyc.lean(t),
      press = cyc.press(t);
    let hands = restHands(B, swing * 0.5);
    if (hold > 0) hands = blendHands(hands, gripHands(frame, B), hold, 0.05);
    const lh = leanHands(B);
    if (lean > 0) hands = blendHands(hands, lh, lean, 0.03);
    if (press > 0) hands = blendHands(hands, pressHands(B, cyc.force(t), lh), press, 0);
    const focus = signals(t, theme);
    const look = V(...cyc.look(t));
    look.lerp(frame.pos, cyc.lookComp(t));
    look.lerp(focus || V(SLOT.x, BTOP, SLOT.z), cyc.lookSig(t));
    look.lerp(V(...cyc.room), cyc.lookRoom(t));
    look.x += Math.sin(g * 0.7) * 0.01;
    look.y += Math.sin(g * 0.53) * 0.008;
    const { info } = figure.poseCharacter(hero, {
      P,
      yaw: psi,
      bend,
      twist,
      look: look.toArray(),
      hands,
      feet,
      time: g,
    });
    if ((hold > 0.99 || press > 0.99 || lean > 0.99) && info.armShort > stats.maxArmShort) {
      stats.maxArmShort = info.armShort;
      stats.worst = { t: +t.toFixed(2) };
    }
    stats.maxLegShort = Math.max(stats.maxLegShort, info.legShort);
    feet.forEach((ft, i) => {
      footBlobs[i].position.set(ft.pos[0], 0.002, ft.pos[2] + 0.06 * Math.cos(ft.yaw));
      footBlobs[i].rotation.z = ft.yaw;
      footBlobs[i].material.opacity =
        (0.42 - 0.3 * theme) * (1 - clamp(ft.pos[1] / 0.04, 0, 1) * 0.6);
    });
    for (const th of themed) th.m.color.copy(th.a).lerp(th.b, theme);
  }

  const size = { w: 0, h: 0 };
  function frameCamera(g) {
    const aspect = size.w / size.h;
    const portrait = aspect < 0.95;
    const near = portrait
      ? { target: V(-0.02, 1.02, 0.14), az: 2.44, el: 0.34, dist: 3.5, fov: 36, shift: 0 }
      : {
          target: V(0.0, 1.04, 0.12),
          az: 2.42,
          el: 0.3,
          dist: 3.35,
          fov: 30,
          shift: options.shift == null ? -0.2 : options.shift,
        };
    const far = portrait
      ? { target: V(-0.45, 1.1, 0.55), az: 2.3, el: 0.26, dist: 8.4, fov: 40, shift: 0 }
      : {
          target: V(-0.55, 1.18, 0.7),
          az: 2.28,
          el: 0.22,
          dist: 7.6,
          fov: 34,
          shift: options.shift == null ? -0.16 : options.shift,
        };
    const r = options.cam ? 0 : reveal;
    const cfg = {
      target: near.target.clone().lerp(far.target, r),
      az: lerp(near.az, far.az, r),
      el: lerp(near.el, far.el, r),
      dist: lerp(near.dist, far.dist, r),
      fov: lerp(near.fov, far.fov, r),
      shift: lerp(near.shift, far.shift, r),
    };
    if (options.cam)
      Object.assign(cfg, {
        target: V(options.cam[0], options.cam[1], options.cam[2]),
        dist: options.cam[3],
        fov: options.cam[4],
        az: options.cam[5] == null ? cfg.az : options.cam[5],
        el: options.cam[6] == null ? cfg.el : options.cam[6],
        shift: 0,
      });
    const drift = Math.sin((g / LOOP) * Math.PI * 2);
    const az = cfg.az + drift * 0.02,
      el = cfg.el + drift * 0.006;
    camera.fov = cfg.fov;
    camera.aspect = aspect;
    camera.position.set(
      cfg.target.x + cfg.dist * Math.sin(az) * Math.cos(el),
      cfg.target.y + cfg.dist * Math.sin(el),
      cfg.target.z + cfg.dist * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(cfg.target);
    if (cfg.shift) camera.setViewOffset(size.w, size.h, cfg.shift * size.w, 0, size.w, size.h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function resize() {
    const w = canvas.clientWidth || 1,
      h = canvas.clientHeight || 1;
    if (w === size.w && h === size.h) return;
    size.w = w;
    size.h = h;
    renderer.setSize(w, h, false);
    const W = Math.round(w * pr),
      H = Math.round(h * pr);
    toneRT.setSize(W, H);
    normRT.setSize(W, H);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    bloom.resolution.set(Math.round(W / 2), Math.round(H / 2));
    draw.uniforms.res.value.set(W, H);
    draw.uniforms.lw.value = pr;
  }
  const bg = new THREE.Color();
  let lastTheme = -1;
  function renderAt(g) {
    if (!hero) return;
    resize();
    evaluate(g);
    frameCamera(g);
    bg.copy(LIGHT_BG).lerp(DARK_BG, theme);
    renderer.shadowMap.needsUpdate = true;
    /* physical pass, lit for the current stage */
    applyLights(theme);
    scene.background = bg;
    scene.fog.color.copy(bg);
    const clear = theme * theme;
    scene.fog.near = lerp(3.7, 9, clear);
    scene.fog.far = lerp(5.0, 30, clear);
    bloom.strength = 0.6 * theme;
    applyPass('phys');
    composer.render();
    draw.uniforms.tPhys.value = composer.readBuffer.texture;
    /* the drawn figure's shading always uses the calm daylight rig */
    applyLights(0);
    applyPass('tone');
    scene.fog.color.copy(PAPER_FOG);
    scene.background = PAPER_FOG;
    renderer.setRenderTarget(toneRT);
    renderer.render(scene, camera);
    applyPass('norm');
    const fog = scene.fog;
    scene.background = null;
    scene.fog = null;
    renderer.setClearColor(0x8080ff, 0);
    renderer.setRenderTarget(normRT);
    renderer.clear();
    renderer.render(scene, camera);
    scene.fog = fog;
    scene.background = bg;
    renderer.setRenderTarget(null);
    draw.uniforms.near.value = camera.near;
    draw.uniforms.far.value = camera.far;
    draw.uniforms.dip.value = dip;
    draw.uniforms.theme.value = theme;
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(quadScene, quadCam);
    renderer.autoClear = true;
    applyPass('phys');
    drawnClock = g;
    emitTheme();
    if (options.onFrame) options.onFrame(g);
  }
  /* the page follows the scene's light through this callback, drawn or not */
  function emitTheme() {
    if (!warming && options.onTheme && Math.abs(theme - lastTheme) > 0.002) {
      lastTheme = theme;
      options.onTheme(theme);
    }
  }

  /* ---- warm-up: compile every material for every pass before the first frame, so nothing
     stalls later when the signal packets (10.4 s) or the server room (15 s) first appear ---- */
  let disposed = false;
  let warming = false;
  async function warmUp() {
    warming = true;
    await figureReady;
    if (disposed) return;
    for (const kind of ['phys', 'tone', 'norm']) {
      applyPass(kind);
      await renderer.compileAsync(scene, camera);
    }
    /* post-processing programs, geometry buffers and textures only exist once something has
       been drawn with them: draw the finished state and then the opening state, silently */
    renderAt(endTime);
    renderAt(options.start || 0);
    warming = false;
  }

  /* ---- one-shot playback: run the effect to its end, leave the last frame, stop the loop ---- */
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const endTime = options.endTime == null ? EFFECT_END : options.endTime;
  const frameInterval = 1000 / (options.fps || 30);
  let running = false,
    complete = false,
    warmed = false,
    autoStart = !options.paused,
    raf = 0,
    clock = options.start || 0,
    last = 0,
    lastFrame = -Infinity,
    visible = true,
    drawnClock = -1;
  /* While the canvas is scrolled out of view the effect still advances and the page still
     darkens on time, but nothing is drawn: drawing into a canvas the compositor is not showing
     stalls the main thread. The current frame is drawn when the canvas comes back. */
  const observer =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible && !running && drawnClock !== clock) renderAt(clock);
        })
      : null;
  if (observer) observer.observe(canvas);
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function finish() {
    stop();
    complete = true;
    if (options.onComplete) options.onComplete();
  }
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    /* pace the work: until the next frame is due this tick does nothing, no GL calls at all */
    if (now - lastFrame < frameInterval - 1) return;
    /* the effect keeps to wall-clock time even when frames are slow; the cap only guards
       against a jump after the tab was hidden */
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    lastFrame = now;
    clock = Math.min(endTime, clock + dt);
    if (visible) renderAt(clock);
    else {
      evaluate(clock);
      emitTheme();
    }
    if (clock >= endTime) finish();
  }
  function play() {
    if (complete || reduce) return;
    /* before the warm-up has finished, play and pause only record the intent */
    if (!warmed) {
      autoStart = true;
      return;
    }
    if (running) return;
    running = true;
    last = performance.now();
    lastFrame = -Infinity;
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    autoStart = false;
    stop();
  }
  function replay() {
    if (reduce) return;
    stop();
    clock = 0;
    complete = false;
    play();
  }
  /* a stopped scene must still fit its canvas: redraw the current frame once when it resizes */
  const onResize = () => {
    if (running) return;
    if (canvas.clientWidth !== size.w || canvas.clientHeight !== size.h) renderAt(clock);
  };
  window.addEventListener('resize', onResize);

  if (options.manual) {
    clock = options.time || 0;
    figureReady.then(() => {
      if (!disposed) renderAt(clock);
    });
  } else
    warmUp().then(() => {
      if (disposed) return;
      warmed = true;
      if (reduce) {
        /* no motion: the finished composition, drawn once */
        clock = endTime;
        renderAt(clock);
        finish();
      } else if (autoStart) play();
      else renderAt(clock);
    });

  return {
    renderAt,
    stats,
    loopLength: LOOP,
    endTime,
    theme: () => theme,
    play,
    pause,
    replay,
    isRunning: () => running || (!warmed && autoStart && !complete && !reduce),
    isComplete: () => complete,
    reduced: () => reduce,
    dispose() {
      disposed = true;
      stop();
      if (observer) observer.disconnect();
      window.removeEventListener('resize', onResize);
      composer.dispose();
      toneRT.dispose();
      normRT.dispose();
      renderer.dispose();
    },
  };
}
