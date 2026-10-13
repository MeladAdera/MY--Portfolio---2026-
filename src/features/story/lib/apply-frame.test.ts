import { describe, expect, it } from 'vitest';

import { applyFrame, collectTargets } from './apply-frame';

function stage() {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-intro></div>
    <ol>
      <li data-step><p data-paragraph></p></li>
      <li data-step><p data-paragraph></p><p data-paragraph></p></li>
    </ol>
    <div data-fill></div>
    <p data-hint></p>`;
  return root;
}

const frame = {
  t: 3,
  progress: 0.5,
  frags: [1, 0.5],
  local: [2, 0.1],
  light: 0,
  body: [0, 0, 0],
};

describe('collectTargets', () => {
  it('finds the intro, the hint, the fill and every step with its paragraphs', () => {
    const t = collectTargets(stage());
    expect(t?.intro).not.toBeNull();
    expect(t?.hint).not.toBeNull();
    expect(t?.fill).not.toBeNull();
    expect(t?.steps.map((s) => s.paragraphs.length)).toEqual([1, 2]);
    expect(collectTargets(null)).toBeNull();
  });
});

describe('applyFrame', () => {
  it('writes opacity, lift and visibility per step and reveals paragraphs through the stop', () => {
    const root = stage();
    const t = collectTargets(root)!;
    applyFrame(t, frame, false);
    const [first, second] = t.steps;
    /* jsdom normalises numeric style values, so they are compared as numbers */
    expect(Number(first?.el.style.opacity)).toBe(1);
    expect(first?.el.style.visibility).toBe('visible');
    expect(Number(second?.el.style.opacity)).toBe(0.5);
    expect(second?.el.style.transform).toBe('translateY(5.0px)');
    expect(second?.paragraphs.map((p) => Number(p.style.opacity))).toEqual([1, 0.15]);
    expect(Number(t.intro?.style.opacity)).toBe(0);
    expect(Number(t.hint?.style.opacity)).toBe(0);
    expect(parseFloat(t.fill?.style.height ?? '')).toBe(50);
  });

  it('keeps every paragraph visible under reduced motion', () => {
    const t = collectTargets(stage())!;
    applyFrame(t, frame, true);
    expect(t.steps[1]?.paragraphs.map((p) => Number(p.style.opacity))).toEqual([1, 1]);
  });
});
