import { describe, expect, it } from 'vitest';

import { socialKind } from './social';

describe('socialKind', () => {
  it('recognises mail, LinkedIn and GitHub links', () => {
    expect(socialKind('mailto:dev@example.com')).toBe('email');
    expect(socialKind('https://www.linkedin.com/in/melad-adera')).toBe('linkedin');
    expect(socialKind('https://github.com/MeladAdera')).toBe('github');
  });

  it('returns null for anything else, including things that are not URLs', () => {
    expect(socialKind('https://example.com/linkedin.com')).toBeNull();
    expect(socialKind('/work#contact')).toBeNull();
    expect(socialKind('not a url')).toBeNull();
  });
});
