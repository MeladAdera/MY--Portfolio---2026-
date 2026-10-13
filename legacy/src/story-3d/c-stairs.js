
/* ---------- the staircase ---------- */
/* Walking direction is -z; s is the distance travelled up the stair axis (z = -s). */
const ST = { R: 0.16, T: 0.34, W: 3.0, walkX: 0.32, half: 0.1 };
/* three flights; each ends on a landing (the last one is the top landing in front of the opening) */
const FLIGHTS = [{ n: 10, landing: 1.7 }, { n: 12, landing: 1.7 }, { n: 12, landing: 4.2 }];

function buildStairs() {
  const parts = [];
  let s = 0, h = 0;
  FLIGHTS.forEach((f, fi) => {
    for (let k = 1; k < f.n; k++) { h += ST.R; parts.push({ s0: s, s1: s + ST.T, h, kind: 'tread', flight: fi, k }); s += ST.T; }
    h += ST.R; parts.push({ s0: s, s1: s + f.landing, h, kind: 'landing', flight: fi }); s += f.landing;
  });
  return { parts, end: s, top: h };
}
const STAIRS = buildStairs();
function surfaceAt(s) {
  if (s < 0) return 0;
  for (const p of STAIRS.parts) if (s < p.s1) return p.h;
  return STAIRS.top;
}

/* ---------- the climb: footfalls, pauses and the body path ---------- */
const LEG = DIM.thigh + DIM.shin;
const STAND_Y = 0.925;

/* The six story stops: where he stops, how his feet stand, how long (reading time when the page plays itself)
   and what his gaze does while he is there. Spread so each stop is roughly one metre higher than the last. */
const PAUSES = [
  { at: 'start', dur: 7, look: 'up' },                                          /* 1 Where it all began — low on the first flight */
  { at: { flight: 0, landingStep: 2 }, together: true, dur: 13, look: 'up' },   /* 2 Searching for meaning — first landing */
  { at: { flight: 1, tread: 5 }, together: false, dur: 13, look: 'aside' },     /* 3 A turning point — on the stairs */
  { at: { flight: 1, landingStep: 3 }, together: true, dur: 15, look: 'down' }, /* 4 My first step — before the last flight */
  { at: { flight: 2, tread: 6 }, together: false, dur: 17, look: 'heavy' },     /* 5 The journey — halfway up the last flight */
  { at: { flight: 2, landingStep: 5 }, together: true, dur: 16, look: 'out' }   /* 6 The goal — before the opening */
];
const PACE = { tread: 0.98, landing: 0.84, together: 0.78, support: 0.12 };

function buildClimb() {
  const parts = STAIRS.parts;
  const footX = (f) => ST.walkX + (f === 0 ? -ST.half : ST.half);
  const ankleS = (p, off) => p.s0 + off;
  const steps = [];   /* {foot, from:{s,h}, to:{s,h}, t0, t1} */
  const pauses = [];  /* {t0, t1, frag} */
  const holds = [];   /* times where the pose is at rest (ends of footfalls) */
  const feet = [{ s: ankleS(parts[1], 0.11), h: parts[1].h }, { s: ankleS(parts[1], 0.11), h: parts[1].h }];
  let t = 0;
  let next = 1; /* right foot leads */
  let frag = 0;
  const addPause = (pz) => { pauses.push({ t0: t, t1: t + pz.dur, frag: frag++, look: pz.look }); t += pz.dur; };
  const move = (foot, s, h, dur) => {
    steps.push({ foot, from: { ...feet[foot] }, to: { s, h }, t0: t, t1: t + dur });
    feet[foot] = { s, h };
    t += dur;
    holds.push(t);
    t += PACE.support;
  };
  addPause(PAUSES[0]);
  t += 0.4;
  const matches = (pz, p, landingStep, idx) => pz.at !== 'start' && pz.at.flight === p.flight &&
    ((pz.at.tread != null && p.kind === 'tread' && pz.at.tread === p.k) || (pz.at.landingStep != null && p.kind === 'landing' && pz.at.landingStep === landingStep));
  for (let i = 2; i < parts.length; i++) {
    const p = parts[i];
    const targets = [];
    if (p.kind === 'tread') targets.push(ankleS(p, 0.11));
    else {
      let s = ankleS(p, 0.11);
      const last = i === parts.length - 1 ? p.s1 - 1.25 : p.s1 - 0.28;
      while (s <= last + 1e-6) { targets.push(s); s += 0.6; }
    }
    targets.forEach((s, j) => {
      move(next, s, p.h, p.kind === 'tread' ? PACE.tread : PACE.landing);
      const pz = PAUSES.find((q) => matches(q, p, j + 1));
      if (pz) {
        if (pz.together) { move(1 - next, s, p.h, PACE.together); next = 1 - next; }
        t += 0.2;
        addPause(pz);
        t += 0.4;
      }
      next = 1 - next;
    });
  }
  /* body keys: at rest the pelvis sits between the feet, as high as both legs allow */
  const bodyAt = (fl, fr) => {
    const sMid = (fl.s + fr.s) / 2 + (fl.h === fr.h ? 0.0 : 0.05);
    let y = (fl.h + fr.h) / 2 + STAND_Y - (fl.h === fr.h ? 0 : 0.02);
    for (const f of [fl, fr]) {
      const dh = Math.abs(sMid - f.s);
      const reach = Math.sqrt(Math.max(0, (0.95 * LEG) ** 2 - dh * dh));
      y = Math.min(y, f.h + DIM.ankle + 0.02 + reach);
    }
    return [ST.walkX, y, -sMid];
  };
  const P = [];
  const feetNow = [{ ...steps[0].from }, { ...steps[0].from }];
  P.push([0, bodyAt(feetNow[0], feetNow[1])]);
  for (const st of steps) {
    feetNow[st.foot] = st.to;
    P.push([st.t1, bodyAt(feetNow[0], feetNow[1])]);
  }
  /* hold the body still through each pause */
  for (const pz of pauses) {
    const before = P.filter((k) => k[0] <= pz.t0 + 1e-6).reduce((a, b) => (b[0] > a[0] ? b : a));
    P.push([pz.t1, before[1].slice()]);
  }
  P.sort((a, b) => a[0] - b[0]);
  return { steps, pauses, holds, P: track(P), end: t, footX };
}
const CLIMB = buildClimb();

