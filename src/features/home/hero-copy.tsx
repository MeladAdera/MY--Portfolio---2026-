import type { Hero } from '@/content';

type HeroCopyProps = Pick<Hero, 'title' | 'lede' | 'cta'>;

/** The headline, the one-line introduction and the call to action over the stage. */
export function HeroCopy({ title, lede, cta }: HeroCopyProps) {
  return (
    <div
      id="top"
      className="px-5 pt-7 pb-12 tablet:absolute tablet:top-[196px] tablet:inset-gutter-left tablet:w-[min(520px,40%)] tablet:p-0"
    >
      <h1 className="font-serif text-hero font-medium">{title}</h1>
      <p className="mt-[22px] max-w-[30em] font-serif text-[19px] leading-[1.55] text-muted">
        {lede}
      </p>
      <a
        href={cta.href}
        className="mt-[30px] inline-flex h-12 items-center bg-btn px-6 text-[15px] font-medium text-btn-fg"
      >
        {cta.label}
      </a>
    </div>
  );
}
