import type { Hero } from '@/content';

type HeroCopyProps = Pick<Hero, 'title' | 'lede' | 'cta'>;

/** The headline, the one-line introduction and the call to action over the stage. */
export function HeroCopy({ title, lede, cta }: HeroCopyProps) {
  return (
    <div
      id="top"
      className="hero-reveal px-5 pt-7 pb-12 tablet:absolute tablet:top-[196px] tablet:inset-gutter-left tablet:w-[min(520px,40%)] tablet:p-0"
    >
      <h1 className="font-serif text-hero font-medium">{title}</h1>
      <p className="mt-[22px] max-w-[30em] font-serif text-[19px] leading-[1.55] text-muted">
        {lede}
      </p>
      <a
        href={cta.href}
        className="group mt-[30px] inline-flex h-12 items-center gap-2.5 rounded-md bg-accent px-5 text-[15px] font-medium text-[#0d1217] shadow-[0_8px_24px_-12px_rgb(76_155_234/0.9)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#6cb0f2] hover:shadow-[0_12px_28px_-12px_rgb(76_155_234/1)] active:translate-y-px motion-reduce:transition-none"
      >
        {cta.label}
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
        >
          →
        </span>
      </a>
    </div>
  );
}
