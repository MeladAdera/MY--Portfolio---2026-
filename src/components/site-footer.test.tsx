import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from './site-footer';

const links = [
  { label: 'Email', href: 'mailto:dev@example.com' },
  { label: 'GitHub', href: 'https://github.com/example' },
];

describe('SiteFooter', () => {
  it('renders the copyright with the contact nav when links are given', () => {
    render(<SiteFooter name="Melad Adera" year={2026} links={links} navLabel="Contact" />);

    expect(screen.getByText('© 2026 Melad Adera')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:dev@example.com',
    );
  });

  it('renders only the copyright line without links', () => {
    render(<SiteFooter name="Melad Adera" year={2026} />);

    expect(screen.getByText('© 2026 Melad Adera')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
