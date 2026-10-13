import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalTime } from './local-time';

describe('LocalTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T11:05:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('renders the clock sentence for the zone', () => {
    render(<LocalTime timeZone="Asia/Damascus" template=". It’s {time} there now ({zone})." />);

    expect(screen.getByText('. It’s 14:05 there now (GMT+3).')).toBeInTheDocument();
  });
});
