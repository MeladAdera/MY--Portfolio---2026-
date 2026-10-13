
/* ---------- the worktable, the system board and the sequence ---------- */
const LOOP = 24;
const TABLE = { top: 0.86, x0: -0.58, x1: 0.52, z0: -0.40, z1: 0.26, th: 0.045 };
const BOARD = { cx: -0.10, cz: -0.02, w: 0.52, d: 0.48, h: 0.012 };
const BTOP = TABLE.top + BOARD.h;
const MH = { base: 0.008, gap: 0.002, body: 0.024 };
const MTOP = MH.base + MH.gap + MH.body;
const PLAT_H = 0.012;
const RAIL = { w: 0.0065, h: 0.005 };

/* modules: centre (x, z) on the board, footprint (w along x, d along z), y0 = base height */
const MODS = {
  ifc: { c: [-0.10, 0.155], fp: [0.30, 0.075], y0: BTOP },
  s1: { c: [-0.26, 0.0], fp: [0.12, 0.08], y0: BTOP },
  s2: { c: [-0.10, 0.0], fp: [0.12, 0.08], y0: BTOP },
  s3: { c: [0.06, 0.0], fp: [0.12, 0.08], y0: BTOP },
  db: { c: [-0.10, -0.175], fp: [0.34, 0.085], y0: BTOP + PLAT_H }
};
/* dependency links as polylines on the board, from the upstream module to the downstream one */
const LINKS = {
  'ifc-s1': [[-0.20, 0.1175], [-0.20, 0.08], [-0.26, 0.08], [-0.26, 0.04]],
  'ifc-s2': [[-0.10, 0.1175], [-0.10, 0.04]],
  'ifc-s3': [[0.0, 0.1175], [0.0, 0.08], [0.06, 0.08], [0.06, 0.04]],
  's1-db': [[-0.26, -0.04], [-0.26, -0.09], [-0.20, -0.09], [-0.20, -0.1325]],
  's2-db': [[-0.10, -0.04], [-0.10, -0.1325]],
  's3-db': [[0.06, -0.04], [0.06, -0.09], [0.0, -0.09], [0.0, -0.1325]]
};
const NEW_LINKS = ['ifc-s2', 's2-db'];
/* the trunk: from the data module off the board, down the table and across the floor into the server rack */
const RACK_ROW_Z = 2.35;
const TRUNK = [
  [-0.27, BTOP + PLAT_H + 0.004, -0.175], [-0.36, BTOP + 0.004, -0.175], [TABLE.x0 + 0.02, TABLE.top + 0.004, -0.175],
  [TABLE.x0 - 0.01, TABLE.top - 0.02, -0.175], [TABLE.x0 - 0.01, 0.006, -0.175], [-1.55, 0.006, -0.175],
  [-1.55, 0.006, RACK_ROW_Z - 0.48], [-1.55, 0.25, RACK_ROW_Z - 0.46]
];
const TRAY = { x: 0.31, z: 0.07, w: 0.19, d: 0.15, h: 0.008 };
const COMP = { w: MODS.s2.fp[0], d: MODS.s2.fp[1], h: MTOP };
const SLOT = { x: MODS.s2.c[0], z: MODS.s2.c[1], y: BTOP + MTOP / 2 };
const TRAY_POS = { x: TRAY.x, z: TRAY.z, y: TABLE.top + TRAY.h + MTOP / 2 };

const S0 = [0.02, 0.925, 0.50];
const FEET_S = [{ pos: [-0.08, 0, 0.565], yaw: 0.08 }, { pos: [0.12, 0, 0.555], yaw: -0.08 }];

/* time marks of one loop (seconds) */
const TM = {
  reach: 0.7, grip: 2.1, lifted: 3.3, examEnd: 6.4, above: 7.6, lowerStart: 8.2, seated: 9.6, released: 10.2,
  hsOut: 10.4, hsDb: 11.0, hsBack: 11.9, hsDone: 13.1, press: 13.4, force: 13.8, pressEnd: 14.6,
  themeUp: [13.2, 16.4], reveal: [14.0, 19.6], trunk: [15.2, 17.2], themeDown: [21.8, 23.2], dip: [22.3, 23.2, 24.0]
};

function buildCycle() {
  const Sr = [0.12, 0.905, 0.48];
  const Srb = [0.13, 0.885, 0.47];
  const Sc = [0.05, 0.92, 0.49];
  const Sa = [-0.035, 0.905, 0.468];
  const Sl = [-0.02, 0.905, 0.495];
  const Sp = [-0.075, 0.9, 0.475];
  const slotP = [SLOT.x, BTOP + 0.01, SLOT.z];
  const trayP = [TRAY_POS.x, TRAY_POS.y, TRAY_POS.z];
  const room = [-0.4, 1.55, -2.6];
  return {
    P: track([[0, S0], [0.7, S0], [1.4, Sr], [1.9, Srb], [2.3, Srb], [3.3, Sc], [6.2, Sc], [7.4, Sa], [9.6, Sa], [10.4, Sl], [13.2, Sl], [13.6, Sp], [14.6, Sp], [15.6, S0], [24, S0]]),
    yaw: track([[0, 0], [0.7, 0], [1.6, -0.22], [2.3, -0.22], [3.4, 0], [24, 0]]),
    bend: track([[0, 0.05], [0.7, 0.06], [1.9, 0.36], [2.3, 0.36], [3.3, 0.1], [6.4, 0.12], [7.6, 0.33], [8.2, 0.36], [9.6, 0.42], [10.4, 0.26], [13.2, 0.26], [13.8, 0.36], [14.2, 0.36], [14.8, 0.2], [16.0, 0.05], [24, 0.05]]),
    twist: track([[0, 0], [0.7, 0], [1.6, -0.12], [2.3, -0.12], [3.3, 0], [4.4, 0.06], [5.6, -0.04], [6.4, 0], [24, 0]]),
    look: track([[0, slotP], [0.6, slotP], [1.1, trayP], [2.3, trayP], [9.8, slotP], [10.2, slotP], [24, slotP]]),
    lookComp: track([[0, 0], [2.4, 0], [2.9, 1], [6.3, 1], [6.9, 0], [24, 0]]),
    lookSig: track([[0, 0], [10.2, 0], [10.5, 1], [13.0, 1], [13.3, 0], [24, 0]]),
    lookRoom: track([[0, 0], [15.6, 0], [17.0, 1], [20.8, 1], [22.0, 0], [24, 0]]),
    room,
    hold: track([[0, 0], [1.5, 0], [2.1, 1], [9.6, 1], [10.2, 0], [24, 0]]),
    lean: track([[0, 0], [9.9, 0], [10.6, 1], [14.6, 1], [15.4, 0], [24, 0]]),
    press: track([[0, 0], [13.2, 0], [13.6, 1], [14.2, 1], [14.6, 0], [24, 0]]),
    force: track([[0, 0], [13.7, 0], [13.85, 1], [14.0, 1], [14.15, 0], [24, 0]]),
    exYaw: track([[0, 0], [3.3, 0], [4.2, 0.42], [5.0, 0.42], [5.8, -0.18], [6.4, 0], [24, 0]]),
    exPitch: track([[0, 0], [3.3, 0], [4.1, -1.05], [4.9, -1.05], [5.6, -0.15], [6.4, 0], [24, 0]]),
    lowerY: track([[6.4, 0.12], [7.6, 0.07], [8.2, 0.065], [8.9, 0.025], [9.3, 0.006], [9.6, 0], [24, 0]]),
    adjX: track([[6.4, 0.02], [7.6, 0.012], [8.0, -0.004], [8.4, 0], [24, 0]]),
    adjZ: track([[6.4, -0.018], [7.6, -0.008], [8.05, 0.003], [8.5, 0], [24, 0]]),
    adjYaw: track([[6.4, 0.12], [7.6, 0.05], [8.0, -0.015], [8.5, 0], [24, 0]]),
    steps: [
      { foot: 1, t0: 0.6, t1: 1.25, to: [0.21, 0, 0.54], yaw: -0.2 },
      { foot: 1, t0: 3.0, t1: 3.65, to: [0.12, 0, 0.555], yaw: -0.08 }
    ]
  };
}

function feetAt(cyc, t) {
  const cur = FEET_S.map((f) => ({ pos: f.pos.slice(), yaw: f.yaw, pitch: 0 }));
  for (const st of cyc.steps) {
    if (t <= st.t0) continue;
    const fc = cur[st.foot];
    const k = clamp((t - st.t0) / (st.t1 - st.t0), 0, 1);
    const e = smoother(k);
    const from = fc.pos.slice(), fy = fc.yaw;
    fc.pos = [lerp(from[0], st.to[0], e), Math.sin(Math.PI * k) * 0.035, lerp(from[2], st.to[2], e)];
    fc.yaw = lerp(fy, st.yaw, e);
    fc.pitch = k < 1 ? Math.sin(Math.PI * k) * 0.12 : 0;
  }
  return cur;
}

/* polyline helpers for signals travelling along links */
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += pts[i].distanceTo(pts[i - 1]);
  return L;
}
function polyAt(pts, k) {
  let d = clamp(k, 0, 1) * polyLen(pts);
  for (let i = 1; i < pts.length; i++) {
    const L = pts[i].distanceTo(pts[i - 1]);
    if (d <= L) return pts[i - 1].clone().lerp(pts[i], L > 0 ? d / L : 0);
    d -= L;
  }
  return pts[pts.length - 1].clone();
}

/* Signal schedule. Each packet: link key, start, end, direction (+1 upstream → downstream). */
const PACKETS = [
  { link: 'ifc-s2', t0: TM.hsOut, t1: TM.hsOut + 0.55, dir: 1 },
  { link: 's2-db', t0: TM.hsDb, t1: TM.hsDb + 0.55, dir: 1 },
  { link: 's2-db', t0: TM.hsBack, t1: TM.hsBack + 0.55, dir: -1 },
  { link: 'ifc-s2', t0: TM.hsBack + 0.6, t1: TM.hsBack + 1.15, dir: -1 },
  /* after the press: one signal through the whole system */
  { link: 'ifc-s2', t0: 13.9, t1: 14.35, dir: -1 }, { link: 's2-db', t0: 13.9, t1: 14.35, dir: 1 },
  { link: 'ifc-s1', t0: 14.35, t1: 14.85, dir: 1 }, { link: 'ifc-s3', t0: 14.35, t1: 14.85, dir: 1 },
  { link: 's1-db', t0: 14.85, t1: 15.35, dir: 1 }, { link: 's3-db', t0: 14.85, t1: 15.35, dir: 1 }
];
