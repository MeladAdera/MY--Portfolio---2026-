import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'failed';

type UseClipboardOptions = {
  /** How long the copied / failed status stays before returning to idle. */
  resetAfterMs?: number;
};

/** Copies text with the Clipboard API and reports the outcome for a short while. */
export function useClipboard({ resetAfterMs = 2400 }: UseClipboardOptions = {}) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const resetTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
      } catch {
        setStatus('failed');
      }
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs);
    },
    [resetAfterMs],
  );

  return { status, copy };
}
