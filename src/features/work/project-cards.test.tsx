import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { projects } from '@/content';

import { ProjectCards } from './project-cards';

describe('ProjectCards', () => {
  it('is the page index: one link per project, to its case', () => {
    render(<ProjectCards projects={projects} label="Projects on this page" />);
    const nav = screen.getByRole('navigation', { name: 'Projects on this page' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#inventory',
      '#sportbooker',
      '#your-guide',
    ]);
  });

  it('shows each project as a diagram with a text alternative, the name and up to three facts', () => {
    render(<ProjectCards projects={projects} label="Projects on this page" />);
    const inventory = screen.getByRole('link', { name: /Inventory Distribution/ });
    expect(within(inventory).getByRole('img')).toHaveAccessibleName(/One warehouse feeding/);
    const terms = within(inventory)
      .getAllByRole('term')
      .map((term) => term.textContent);
    expect(terms).toEqual(['Role', 'Period', 'Status']);
    expect(terms).not.toContain('Built with');
  });

  it('lays the personal project across both columns', () => {
    render(<ProjectCards projects={projects} label="Projects on this page" />);
    const item = screen.getByRole('link', { name: /Your Guide/ }).closest('li');
    expect(item).toHaveClass('tablet:col-span-2');
  });
});
