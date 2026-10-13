'use client';

import { useClipboard, type CopyStatus } from '@/hooks/use-clipboard';

type CopyEmailButtonProps = {
  text: string;
  labels: Record<CopyStatus, string>;
  messages: Record<Exclude<CopyStatus, 'idle'>, string>;
};

/** Copies the email address and tells screen readers what happened through a live region. */
export function CopyEmailButton({ text, labels, messages }: CopyEmailButtonProps) {
  const { status, copy } = useClipboard();
  const message = status === 'idle' ? '' : messages[status];

  return (
    <>
      <button
        type="button"
        onClick={() => void copy(text)}
        className="min-h-11 cursor-pointer px-1 text-[15px] text-muted underline decoration-line underline-offset-[0.3em] hover:text-fg hover:decoration-faint"
      >
        {labels[status]}
      </button>
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}
