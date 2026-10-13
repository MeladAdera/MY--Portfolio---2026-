import { describe, expect, it } from 'vitest';

import { hexToRgb, luminance } from '@/lib/color';

import { blendPalette, PALETTE_VARS } from './palette-blend';

describe('blendPalette', () => {
  it('returns the light palette at k = 0', () => {
    expect(blendPalette(0)).toEqual({
      '--c-bg': '#eeeae3',
      '--c-surface': '#f5f2ec',
      '--c-line': '#dcd6cc',
      '--c-fg': '#16171a',
      '--c-muted': '#3f4146',
      '--c-faint': '#5e5a53',
      '--c-btn-bg': '#16171a',
      '--c-btn-fg': '#F2EFEA',
    });
  });

  it('returns the dark palette at k = 1', () => {
    expect(blendPalette(1)).toEqual({
      '--c-bg': '#10151b',
      '--c-surface': '#141a21',
      '--c-line': '#27303a',
      '--c-fg': '#e9edf1',
      '--c-muted': '#b3bdc7',
      '--c-faint': '#8f9aa5',
      '--c-btn-bg': '#e9edf1',
      '--c-btn-fg': '#10151B',
    });
  });

  it('darkens the background monotonically and flips the text colour exactly once', () => {
    let previous = Infinity;
    let flips = 0;
    let lastFg = blendPalette(0)['--c-fg'];
    for (let i = 0; i <= 100; i++) {
      const p = blendPalette(i / 100);
      const y = luminance(hexToRgb(p['--c-bg']));
      expect(y).toBeLessThanOrEqual(previous + 1e-9);
      previous = y;
      if (p['--c-fg'] !== lastFg) flips++;
      lastFg = p['--c-fg'];
      expect(p['--c-btn-bg']).toBe(p['--c-fg']);
    }
    expect(flips).toBe(1);
  });

  it('covers exactly the variables it declares', () => {
    expect(Object.keys(blendPalette(0.5)).sort()).toEqual([...PALETTE_VARS].sort());
  });
});
