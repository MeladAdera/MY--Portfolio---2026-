import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CopyEmailButton } from './copy-email-button';

const labels = { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' };
const messages = { copied: 'Email address copied.', failed: 'Could not copy the email address.' };

/* user-event installs its own clipboard stub during setup, so the mock must come after it. */
function setup(writeText: (text: string) => Promise<void>) {
  const user = userEvent.setup();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  render(<CopyEmailButton text="dev@example.com" labels={labels} messages={messages} />);
  return user;
}

describe('CopyEmailButton', () => {
  it('copies the address and announces it in the live region', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = setup(writeText);

    expect(screen.getByRole('status')).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('dev@example.com');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Email address copied.');
  });

  it('shows the failure label when the clipboard is unavailable', async () => {
    const user = setup(vi.fn().mockRejectedValue(new Error('denied')));

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy the email address.');
  });
});
