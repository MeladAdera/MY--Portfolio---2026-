import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteFooter } from './site-footer';

const links = [
  { label: 'Email', href: 'mailto:dev@example.com' },
  { label: 'GitHub', href: 'https://github.com/example' },
];

function renderFooter() {
  return render(
    <SiteFooter
      name="Melad Adera"
      year={2026}
      place="Lattakia, Syria"
      timeZone="Asia/Damascus"
      clock=" · {time} ({zone})"
      next={{ kicker: 'Next', label: 'The work', href: '/work' }}
      links={links}
      navLabel="Contact"
    />,
  );
}

describe('SiteFooter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T11:05:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('leads on with the big link to the next page', () => {
    renderFooter();
    const next = screen.getByRole('link', { name: /The work/ });
    expect(next).toHaveAttribute('href', '/work');
    expect(next).toHaveTextContent(/^Next/);
  });

  it('closes with the copyright, the place with its local time, and the contact nav', () => {
    renderFooter();
    expect(
      screen.getByText(
        (_, el) => el?.textContent === '© 2026 Melad Adera · Lattakia, Syria · 14:05 (GMT+3)',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:dev@example.com',
    );
  });
});
