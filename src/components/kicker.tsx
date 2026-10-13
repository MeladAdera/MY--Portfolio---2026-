import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

/** The small sans-serif line above a title, such as "01 — Work". */
export function Kicker({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('font-sans text-kicker text-faint', className)} {...props} />;
}
