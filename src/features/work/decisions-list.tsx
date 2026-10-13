import { cn } from '@/lib/cn';

import type { Decision } from '@/content';

type DecisionsListProps = { decisions: readonly Decision[]; className?: string };

/** The design decisions of a project: an italic lead followed by the explanation. */
export function DecisionsList({ decisions, className }: DecisionsListProps) {
  return (
    <ul className={cn('mt-[14px] grid gap-5', className)}>
      {decisions.map((decision) => (
        <li
          key={decision.lead}
          className="font-serif text-[17px] leading-[1.7] text-muted tablet:text-[18px]"
        >
          <em className="text-fg italic">{decision.lead}</em> {decision.text}
        </li>
      ))}
    </ul>
  );
}
