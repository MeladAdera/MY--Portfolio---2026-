import { describe, expect, it } from 'vitest';

import { socialKind } from './social';

describe('socialKind', () => {
  it('recognises mail and the four profile services', () => {
    expect(socialKind('mailto:dev@example.com')).toBe('email');
    expect(socialKind('https://www.instagram.com/melad.adera/')).toBe('instagram');
    expect(socialKind('https://www.facebook.com/melad.adera')).toBe('facebook');
    expect(socialKind('https://www.linkedin.com/in/melad-adera')).toBe('linkedin');
    expect(socialKind('https://github.com/MeladAdera')).toBe('github');
  });

  it('returns null for anything else, including things that are not URLs', () => {
    expect(socialKind('https://example.com/linkedin.com')).toBeNull();
    expect(socialKind('/work#contact')).toBeNull();
    expect(socialKind('not a url')).toBeNull();
  });
});
