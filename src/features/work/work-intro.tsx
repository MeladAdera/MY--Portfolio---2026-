import { Container } from '@/components/container';
import { Kicker } from '@/components/kicker';

import type { SiteLink } from '@/components/site-header';

type WorkIntroProps = {
  kicker: string;
  title: string;
  lede: string;
  index: readonly SiteLink[];
  indexLabel: string;
};

/** The page opening: kicker, title, lede and the in-page index of projects. */
export function WorkIntro({ kicker, title, lede, index, indexLabel }: WorkIntroProps) {
  return (
    <Container as="header" className="pt-12 pb-10 tablet:pt-22">
      <Kicker>{kicker}</Kicker>
      <h1 className="mt-[14px] max-w-[14em] font-serif text-work-title font-medium">{title}</h1>
      <p className="mt-6 max-w-[32em] font-serif text-[18px] leading-[1.6] text-muted tablet:text-[20px]">
        {lede}
      </p>
      <nav aria-label={indexLabel} className="mt-9 flex flex-wrap gap-x-7 gap-y-1 text-[15px]">
        {index.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="border-b border-transparent py-[10px] text-muted transition-colors duration-200 hover:border-accent hover:text-fg motion-reduce:transition-none"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </Container>
  );
}
