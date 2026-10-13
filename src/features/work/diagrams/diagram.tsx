import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export type DiagramProps = {
  /** What the drawing shows, for screen readers. */
  caption: string;
  className?: string;
};

/* The shared stroke vocabulary of the system diagrams: thin faint lines, one accent. */
export const line = 'fill-none stroke-faint [stroke-width:1]';
export const lineOn = 'fill-none stroke-accent [stroke-width:1]';
export const wire = 'fill-none stroke-faint opacity-70 [stroke-width:1]';
export const wireOn = 'fill-none stroke-accent [stroke-width:1]';
export const label = 'fill-faint text-[11px]';

type DiagramFrameProps = DiagramProps & { viewBox: string; children: ReactNode };

/** An SVG that scales with its card and reads as one image. */
export function DiagramFrame({ caption, className, viewBox, children }: DiagramFrameProps) {
  return (
    <svg
      role="img"
      aria-label={caption}
      viewBox={viewBox}
      className={cn('block h-auto w-full font-sans', className)}
    >
      {children}
    </svg>
  );
}
