import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SceneControlButton } from './scene-control-button';

const labels = { pause: 'Pause scene', play: 'Play scene', replay: 'Replay scene' };

describe('SceneControlButton', () => {
  it('offers to pause while playing and is not pressed', () => {
    render(<SceneControlButton status="playing" onToggle={() => {}} labels={labels} />);

    expect(screen.getByRole('button', { name: 'Pause scene' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('offers to play while paused and is pressed', () => {
    render(<SceneControlButton status="paused" onToggle={() => {}} labels={labels} />);

    expect(screen.getByRole('button', { name: 'Play scene' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('offers to replay once complete, without a pressed state, and calls onToggle', async () => {
    const onToggle = vi.fn();
    render(<SceneControlButton status="complete" onToggle={onToggle} labels={labels} />);

    const button = screen.getByRole('button', { name: 'Replay scene' });
    expect(button).not.toHaveAttribute('aria-pressed');
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
