export type ZonedTime = { hour: string; minute: string; zone: string };

/** Hour, minute and short UTC offset of `date` in `timeZone`, for example 14, 05 and GMT+3. */
export function formatZonedTime(date: Date, timeZone: string, locale = 'en-GB'): ZonedTime {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return { hour: read('hour'), minute: read('minute'), zone: read('timeZoneName') };
}

/** Milliseconds until the next minute boundary, plus a small margin so a timer lands after it. */
export function msUntilNextMinute(now = Date.now(), marginMs = 50): number {
  return 60_000 - (now % 60_000) + marginMs;
}
