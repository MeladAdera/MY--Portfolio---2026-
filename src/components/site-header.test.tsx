import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteHeader } from './site-header';

const links = [
  { label: 'Work', href: '/work' },
  { label: 'Story', href: '/story' },
  { label: 'Contact', href: '/work#contact' },
];

function renderHeader(currentPath: string) {
  return render(
    <SiteHeader name="Melad Adera" links={links} navLabel="Main" currentPath={currentPath} />,
  );
}

describe('SiteHeader', () => {
  it('marks only the link matching the current path as current', () => {
    renderHeader('/work');

    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Story' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveAttribute('aria-current');
  });

  it('mutes the other links only when one of them is current', () => {
    const { unmount } = renderHeader('/work');
    expect(screen.getByRole('link', { name: 'Story' })).toHaveClass('text-muted');
    unmount();

    renderHeader('/');
    expect(screen.getByRole('link', { name: 'Story' })).not.toHaveClass('text-muted');
    expect(screen.queryByRole('link', { current: 'page' })).toBeNull();
  });

  it('links the name to the home page inside a labelled nav', () => {
    renderHeader('/');

    expect(screen.getByRole('link', { name: 'Melad Adera' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });
});
