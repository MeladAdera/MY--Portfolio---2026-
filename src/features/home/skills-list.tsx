import { DefinitionList } from '@/components/definition-list';

import type { SkillGroup } from '@/content';

type SkillsListProps = { label: string; groups: readonly SkillGroup[] };

/** Skill groups as a definition list; each group's items are joined into one line. */
export function SkillsList({ label, groups }: SkillsListProps) {
  const rows = groups.map((group) => ({ term: group.term, detail: group.items.join(', ') }));

  return (
    <div>
      <h3 className="font-serif text-[22px] leading-[1.2] font-medium">{label}</h3>
      <DefinitionList
        rows={rows}
        className="mt-7 grid gap-[22px]"
        termClassName="text-label text-faint"
        detailClassName="mt-1 text-[15px] leading-[1.55]"
      />
    </div>
  );
}
