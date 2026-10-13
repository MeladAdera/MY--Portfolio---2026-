import { describe, expect, it } from 'vitest';

import { applyCssVars, clearCssVars } from './css-vars';

describe('css vars', () => {
  it('applies and clears inline custom properties', () => {
    const el = document.createElement('div');

    applyCssVars(el, { '--c-bg': '#111111', '--c-fg': '#eeeeee' });
    expect(el.style.getPropertyValue('--c-bg')).toBe('#111111');
    expect(el.style.getPropertyValue('--c-fg')).toBe('#eeeeee');

    clearCssVars(el, ['--c-bg']);
    expect(el.style.getPropertyValue('--c-bg')).toBe('');
    expect(el.style.getPropertyValue('--c-fg')).toBe('#eeeeee');
  });
});
