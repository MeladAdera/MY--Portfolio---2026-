import type { Experience } from '@/content';

type ExperienceListProps = { label: string; items: readonly Experience[] };

/** The experience entries: period, title and a one-line description each. */
export function ExperienceList({ label, items }: ExperienceListProps) {
  return (
    <div>
      <h3 className="font-serif text-[22px] leading-[1.2] font-medium">{label}</h3>
      <ol className="mt-7 grid gap-9">
        {items.map((item) => (
          <li key={item.title}>
            <p className="text-label text-faint tabular-nums">{item.period}</p>
            <p className="mt-[6px] font-serif text-[21px] leading-[1.3] font-medium">
              {item.title}
            </p>
            <p className="mt-[6px] max-w-[36em] font-serif text-[16px] leading-[1.6] text-muted">
              {item.line}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
