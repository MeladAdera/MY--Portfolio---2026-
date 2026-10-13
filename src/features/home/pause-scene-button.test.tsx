import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PauseSceneButton } from './pause-scene-button';

const labels = { pause: 'Pause scene', play: 'Play scene' };

describe('PauseSceneButton', () => {
  it('shows the pause label and is not pressed while playing', () => {
    render(<PauseSceneButton paused={false} onToggle={() => {}} labels={labels} />);

    expect(screen.getByRole('button', { name: 'Pause scene' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows the play label and is pressed while paused, and calls onToggle on click', async () => {
    const onToggle = vi.fn();
    render(<PauseSceneButton paused onToggle={onToggle} labels={labels} />);

    const button = screen.getByRole('button', { name: 'Play scene' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
