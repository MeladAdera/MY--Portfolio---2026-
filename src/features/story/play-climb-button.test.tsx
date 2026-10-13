import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlayClimbButton } from './play-climb-button';

const labels = { play: 'Play the climb', pause: 'Pause' };

describe('PlayClimbButton', () => {
  it('offers to play, and reports pressed with the pause label while playing', async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <PlayClimbButton playing={false} onToggle={onToggle} labels={labels} />,
    );
    const button = screen.getByRole('button', { name: 'Play the climb' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<PlayClimbButton playing onToggle={onToggle} labels={labels} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');
  });
});
