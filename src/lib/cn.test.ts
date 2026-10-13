import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('joins values and drops falsy ones', () => {
    expect(cn('a', false, undefined, null, 'c')).toBe('a c');
  });

  it('lets the later conflicting utility win', () => {
    expect(cn('px-5 py-2', 'px-8')).toBe('py-2 px-8');
  });

  it('keeps a custom font-size token next to a colour', () => {
    expect(cn('text-hero text-faint')).toBe('text-hero text-faint');
  });

  it('treats two custom font-size tokens as a conflict', () => {
    expect(cn('text-hero', 'text-about')).toBe('text-about');
  });
});
