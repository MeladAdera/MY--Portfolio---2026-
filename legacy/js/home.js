/* Home: the 3D builder scene, the page colours that follow its light and dark, and the pause button. */
function paint(root, k) {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const Y = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const mix = (a, b, w) => a.map((v, i) => v + (b[i] - v) * w);
  const css = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
  const P = {
    bg: ['#EEEAE3', '#10151B'], surface: ['#F5F2EC', '#141A21'], line: ['#DCD6CC', '#27303A'],
    fg: ['#16171A', '#E9EDF1'], muted: ['#3F4146', '#B3BDC7'], faint: ['#5E5A53', '#8F9AA5']
  };
  const bg = mix(hex(P.bg[0]), hex(P.bg[1]), k);
  const surface = mix(hex(P.surface[0]), hex(P.surface[1]), k);
  const yx = Math.sqrt((Y(hex(P.fg[0])) + 0.05) * (Y(hex(P.fg[1])) + 0.05)) - 0.05;
  const dark = (back) => (Y(back) >= yx ? 0 : 1);
  const strong = (back) => hex(P.fg[dark(back)]);
  const soft = (pair, back) => {
    const w = 1 - Math.min(1, Math.abs(Math.log((Y(back) + 0.05) / (yx + 0.05))) / 1.1);
    return mix(hex(pair[dark(back)]), strong(back), Math.max(0, w));
  };
  const fg = strong(bg);
  const s = root.style;
  s.setProperty('--bd-bg', css(bg));
  s.setProperty('--bd-bg-rgb', bg.map((v) => Math.round(v * 255)).join(','));
  s.setProperty('--bd-surface', css(surface));
  s.setProperty('--bd-line', css(mix(hex(P.line[0]), hex(P.line[1]), k)));
  s.setProperty('--bd-fg', css(fg));
  s.setProperty('--bd-muted', css(soft(P.muted, bg)));
  s.setProperty('--bd-faint', css(soft(P.faint, surface)));
  s.setProperty('--bd-btn-bg', css(fg));
  s.setProperty('--bd-btn-fg', dark(bg) ? '#10151B' : '#F2EFEA');
}

function startHome() {
  const canvas = document.querySelector('canvas[data-builder]');
  const pause = document.querySelector('[data-pause]');
  const ctl = window.MeladBuilderV3.mount(canvas, { onTheme: (k) => paint(document.documentElement, k) });
  let paused = false;
  pause.addEventListener('click', () => {
    paused = !paused;
    ctl.setPaused(paused);
    pause.textContent = paused ? 'Play scene' : 'Pause scene';
    pause.setAttribute('aria-pressed', String(paused));
  });
}

startHome();
