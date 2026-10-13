import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StoryStep } from './story-step';

import type { StoryStep as StoryStepContent } from '@/content';

const step: StoryStepContent = {
  heading: 'Searching for Meaning',
  paragraphs: [
    { text: 'Throughout those years, I kept asking myself a question:' },
    { text: 'How could I create real value from everything I was learning?', variant: 'quote' },
  ],
};

describe('StoryStep', () => {
  it('renders the number, the heading and the paragraphs, with the quote set apart', () => {
    render(
      <ol>
        <StoryStep index={2} label="Step" step={step} />
      </ol>,
    );
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, hidden: true })).toHaveTextContent(
      'Searching for Meaning',
    );
    const quote = screen.getByText(/How could I create real value/);
    expect(quote).toHaveClass('font-medium');
    expect(screen.getByText(/Throughout those years/)).not.toHaveClass('font-medium');
  });

  it('starts hidden; the scene reveals it', () => {
    const { container } = render(
      <ol>
        <StoryStep index={1} label="Step" step={step} />
      </ol>,
    );
    expect(container.querySelector('[data-step]')).toHaveClass('invisible', 'opacity-0');
  });
});
