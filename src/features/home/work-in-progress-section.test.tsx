import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { projects, STATUS_LABEL, workInProgress } from '@/content';

import { WorkInProgressSection } from './work-in-progress-section';

describe('WorkInProgressSection', () => {
  it('lists the three projects numbered, with their summaries and status', () => {
    render(
      <WorkInProgressSection
        copy={workInProgress}
        projects={projects}
        statusLabel={STATUS_LABEL}
      />,
    );

    expect(screen.getByRole('region', { name: 'Work in progress.' })).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('01');
    expect(items[2]).toHaveTextContent('03');
    expect(items[0]).toHaveTextContent('Inventory Distribution');
    expect(screen.getAllByText('In progress')).toHaveLength(3);
  });
});
