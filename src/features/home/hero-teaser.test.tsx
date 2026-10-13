import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroTeaser } from './hero-teaser';

const lines = ['Who am I?', 'What can I build?'];

describe('HeroTeaser', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('types the questions out as decoration, with a caret on the line being typed', () => {
    const { container } = render(<HeroTeaser lines={lines} />);
    const teaser = container.querySelector('p');
    expect(teaser).toHaveAttribute('aria-hidden', 'true');
    expect(teaser).toHaveTextContent('');

    act(() => vi.advanceTimersByTime(900 + 60 * 9));
    expect(teaser).toHaveTextContent('Who am I?');
    expect(teaser).not.toHaveTextContent('What');

    act(() => vi.advanceTimersByTime(900 + 60 * 17 + 10));
    const rows = container.querySelectorAll('p > span');
    expect(rows[0]).toHaveTextContent('Who am I?');
    expect(rows[1]).toHaveTextContent('What can I build?');
    expect(rows[1]?.querySelector('.hero-caret')).not.toBeNull();
    expect(rows[0]?.querySelector('.hero-caret')).toBeNull();
  });
});
