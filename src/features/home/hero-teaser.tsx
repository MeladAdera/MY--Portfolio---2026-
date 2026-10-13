'use client';

import { useTypewriter } from '@/hooks/use-typewriter';

/**
 * The questions over the light room, typed out one after the other in the copy's place,
 * with a caret that blinks until the room darkens; the whole thing then fades out as the
 * copy fades in (styles/utilities.css). Decorative for assistive tech: the headline is the
 * real content. Only on tablets and up, where the copy sits over the scene.
 */
export function HeroTeaser({ lines }: { lines: readonly string[] }) {
  const { typed, done } = useTypewriter(lines);
  const lastTyped = Math.max(
    0,
    typed.findLastIndex((text) => text.length > 0),
  );

  return (
    <p
      aria-hidden="true"
      className="hero-teaser pointer-events-none absolute top-[196px] hidden max-w-[14em] font-serif text-[clamp(30px,3.4vw,46px)] leading-[1.15] font-medium tracking-[-0.02em] text-muted tablet:inset-gutter-left tablet:block"
    >
      {typed.map((text, i) => (
        <span key={lines[i]} className="block min-h-[1.15em]">
          {text}
          {i === lastTyped && (
            <span className={done ? 'hero-caret' : 'hero-caret hero-caret-still'} />
          )}
        </span>
      ))}
    </p>
  );
}
