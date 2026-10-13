import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SocialIcon } from './social-icon';

describe('SocialIcon', () => {
  it('draws a decorative mark for each service', () => {
    for (const kind of ['email', 'linkedin', 'github'] as const) {
      const { container, unmount } = render(<SocialIcon kind={kind} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M/);
      unmount();
    }
  });
});
