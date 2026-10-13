/* Story page wiring: scroll position -> story progress; fragments, rail and hint follow the scene; Play scrolls for you. */
function startStory(opts) {
  const doc = document;
  const canvas = doc.querySelector('canvas[data-story]');
  const scroller = doc.querySelector('.st-scroll');
  const frags = Array.from(doc.querySelectorAll('[data-frags] .st-step'));
  const paras = frags.map((li) => Array.from(li.querySelectorAll('.st-body p')));
  const intro = doc.querySelector('[data-intro]');
  const hint = doc.querySelector('[data-hint]');
  const rail = doc.querySelector('[data-rail]');
  const fill = doc.querySelector('[data-fill]');
  const play = doc.querySelector('[data-play]');
  const root = doc.querySelector('.st-root');
  const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  const progressNow = () => {
    const r = scroller.getBoundingClientRect();
    const span = scroller.offsetHeight - window.innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  };
  let ctl = null;
  const onFrame = (s) => {
    const still = root.classList.contains('st-reduced');
    frags.forEach((li, i) => {
      const o = s.frags[i];
      li.style.opacity = o.toFixed(3);
      li.style.transform = 'translateY(' + ((1 - o) * 10).toFixed(1) + 'px)';
      li.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      /* paragraphs arrive one after another as the reader moves through the stop */
      const u = s.local[i];
      paras[i].forEach((p, j) => { p.style.opacity = still ? '1' : ramp(u, j * 0.085, j * 0.085 + 0.1).toFixed(3); });
    });
    const p = s.progress;
    intro.style.opacity = (1 - ramp(p, 0.015, 0.06)).toFixed(3);
    hint.style.opacity = (1 - ramp(p, 0.005, 0.03)).toFixed(3);
    fill.style.height = (p * 100).toFixed(2) + '%';
  };
  ctl = window.MeladStory.mount(canvas, Object.assign({ onFrame }, opts || {}));
  if (ctl.reduced()) root.classList.add('st-reduced');
  ctl.pauses.forEach((p) => {
    const t = doc.createElement('div');
    t.className = 'st-tick';
    t.style.top = (ctl.progressAtTime(p.t0) * 100).toFixed(2) + '%';
    rail.appendChild(t);
  });
  const sync = () => ctl.setProgress(progressNow());
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
  /* Play: scrolls the page at the story's own pace; any user scroll input stops it */
  let auto = 0, autoT = 0, lastNow = 0;
  const stopAuto = () => { if (!auto) return; cancelAnimationFrame(auto); auto = 0; play.textContent = 'Play the climb'; play.setAttribute('aria-pressed', 'false'); };
  const step = (now) => {
    const dt = Math.min(0.05, (now - lastNow) / 1000); lastNow = now;
    autoT = Math.min(ctl.total, autoT + dt);
    const span = scroller.offsetHeight - window.innerHeight;
    window.scrollTo(0, scroller.offsetTop + ctl.progressAtTime(autoT) * span);
    if (autoT >= ctl.total) { stopAuto(); return; }
    auto = requestAnimationFrame(step);
  };
  const onPlay = () => {
    if (auto) { stopAuto(); return; }
    if (ctl.reduced()) return;
    const p = progressNow();
    autoT = p >= 0.999 ? 0 : ctl.timeAtProgress(p);
    if (p >= 0.999) window.scrollTo(0, scroller.offsetTop);
    lastNow = performance.now();
    play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
    auto = requestAnimationFrame(step);
  };
  play.addEventListener('click', onPlay);
  for (const ev of ['wheel', 'touchstart', 'keydown']) window.addEventListener(ev, stopAuto, { passive: true });
  return {
    ctl,
    dispose() {
      stopAuto();
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      for (const ev of ['wheel', 'touchstart', 'keydown']) window.removeEventListener(ev, stopAuto);
      play.removeEventListener('click', onPlay);
      ctl.dispose();
    }
  };
}

startStory();
