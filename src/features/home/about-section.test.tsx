import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { about, experience, skills } from '@/content';

import { AboutSection } from './about-section';

describe('AboutSection', () => {
  it('renders the heading, the facts, the experience and the skills', () => {
    render(<AboutSection about={about} experience={experience} skills={skills} />);

    expect(screen.getByRole('region', { name: about.heading })).toBeInTheDocument();
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual([
      'Studying',
      'Certification',
      'Speaks',
      ...skills.map((group) => group.term),
    ]);

    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('SportBooker, for Syria Sport')).toBeInTheDocument();
    expect(screen.getByText('TypeScript, JavaScript, SQL, HTML/CSS')).toBeInTheDocument();
  });
});
