import { DefinitionList } from '@/components/definition-list';
import { cn } from '@/lib/cn';

import type { ProjectMeta } from '@/content';

type ProjectMetaListProps = {
  rows: readonly ProjectMeta[];
  /** The small variant keeps every row in the two-column grid on phones. */
  compact?: boolean;
};

/**
 * The facts column of a project. Sticky beside the text on desktop; on narrower screens
 * it becomes a two-column grid that sits between the proposition and the description.
 */
export function ProjectMetaList({ rows, compact = false }: ProjectMetaListProps) {
  return (
    <DefinitionList
      rows={rows}
      className={cn(
        'order-3 mt-7 grid grid-cols-2 gap-x-6 gap-y-4',
        !compact && 'max-desktop:[&>div:last-child]:col-span-full',
        'desktop:sticky desktop:top-8 desktop:col-start-1 desktop:row-start-1 desktop:mt-0 desktop:grid-cols-1 desktop:content-start desktop:gap-[18px] desktop:self-start desktop:pt-[14px]',
      )}
      termClassName="text-label text-faint"
      detailClassName="mt-[3px] text-[15px] leading-[1.5] text-fg"
    />
  );
}
