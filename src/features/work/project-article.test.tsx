import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProjectArticle } from './project-article';

import type { Project } from '@/content';

const full: Project = {
  id: 'inventory',
  name: 'Inventory',
  summary: 'Summary',
  status: 'in-progress',
  variant: 'full',
  meta: [{ term: 'Role', detail: 'Full Stack Developer' }],
  proposition: 'One platform.',
  description: 'What it covers.',
  decisions: [{ lead: 'Stock moves.', text: 'Every movement is one transaction.' }],
};

const small: Project = {
  id: 'your-guide',
  name: 'Your Guide',
  summary: 'Summary',
  status: 'in-progress',
  variant: 'small',
  meta: [{ term: 'Type', detail: 'Personal project' }],
  proposition: 'A study app.',
};

describe('ProjectArticle', () => {
  it('renders the full variant with facts, description and decisions', () => {
    render(<ProjectArticle project={full} decisionsLabel="Decisions" />);

    expect(screen.getByRole('article', { name: 'Inventory' })).toHaveAttribute('id', 'inventory');
    expect(screen.getByRole('term')).toHaveTextContent('Role');
    expect(screen.getByText('What it covers.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Stock moves. Every movement is one transaction.',
    );
  });

  it('renders the small variant with only the name, proposition and facts', () => {
    render(<ProjectArticle project={small} decisionsLabel="Decisions" />);

    expect(screen.getByRole('article', { name: 'Your Guide' })).toBeInTheDocument();
    expect(screen.getByText('A study app.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });
});
