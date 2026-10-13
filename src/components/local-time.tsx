'use client';

import { useLocalClock } from '@/hooks/use-local-clock';
import { fillTemplate } from '@/lib/template';

type LocalTimeProps = {
  timeZone: string;
  /** Sentence with `{time}` and `{zone}` placeholders. */
  template: string;
};

/** The live local time, rendered only on the client so server and client markup match. */
export function LocalTime({ timeZone, template }: LocalTimeProps) {
  const time = useLocalClock(timeZone);

  if (!time) return null;

  return (
    <span>{fillTemplate(template, { time: `${time.hour}:${time.minute}`, zone: time.zone })}</span>
  );
}
