import { useMemo, useSyncExternalStore } from 'react';

import { formatZonedTime, msUntilNextMinute, type ZonedTime } from '@/lib/time';

/* A tiny external store: the current minute, notifying subscribers just after each boundary. */
function subscribe(onChange: () => void) {
  let timer = 0;
  const tick = () => {
    onChange();
    timer = window.setTimeout(tick, msUntilNextMinute());
  };
  timer = window.setTimeout(tick, msUntilNextMinute());
  return () => window.clearTimeout(timer);
}

const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;

/**
 * The wall-clock time in `timeZone`, updated once a minute.
 * Null on the server and during hydration, so server and client markup match.
 */
export function useLocalClock(timeZone: string, locale = 'en-GB'): ZonedTime | null {
  const minute = useSyncExternalStore<number | null>(subscribe, getMinute, getServerMinute);

  return useMemo(
    () => (minute === null ? null : formatZonedTime(new Date(minute * 60_000), timeZone, locale)),
    [minute, timeZone, locale],
  );
}
