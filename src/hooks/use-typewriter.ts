import { useEffect, useState } from 'react';

export type TypewriterTiming = {
  /** Delay before the first character. */
  startMs: number;
  /** Per character. */
  charMs: number;
  /** Pause after a line is complete, before the next line starts. */
  lineMs: number;
};

export const DEFAULT_TYPING: TypewriterTiming = { startMs: 900, charMs: 60, lineMs: 900 };

/**
 * Types `lines` out one character at a time, line after line, once. Returns what has been
 * typed so far (one string per line) and whether it is finished. Starts empty on the server
 * and on the first client render, so markup matches. Under reduced motion the full text
 * appears at once.
 */
export function useTypewriter(lines: readonly string[], timing: TypewriterTiming = DEFAULT_TYPING) {
  const [typed, setTyped] = useState<readonly string[]>(() => lines.map(() => ''));
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timer = 0;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      timer = window.setTimeout(() => {
        setTyped([...lines]);
        setDone(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    let line = 0;
    let char = 0;
    const step = () => {
      const at = line;
      const text = lines[at] ?? '';
      char += 1;
      const current = text.slice(0, char);
      /* the updater runs later, so it must not read `line`, which may have moved on */
      setTyped((prev) => prev.map((t, i) => (i === at ? current : t)));
      if (char < text.length) {
        timer = window.setTimeout(step, timing.charMs);
      } else if (line + 1 < lines.length) {
        line += 1;
        char = 0;
        timer = window.setTimeout(step, timing.lineMs);
      } else {
        setDone(true);
      }
    };
    timer = window.setTimeout(step, timing.startMs);
    return () => window.clearTimeout(timer);
  }, [lines, timing]);

  return { typed, done };
}
