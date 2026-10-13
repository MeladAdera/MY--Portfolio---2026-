import { cn } from '@/lib/cn';

import { Container } from './container';
import { LocalTime } from './local-time';

import type { SiteLink } from './site-header';

type SiteFooterProps = {
  name: string;
  year: number;
  /** "Lattakia, Syria". */
  place: string;
  timeZone: string;
  /** Follows the place; `{time}` and `{zone}` are filled by the live clock. */
  clock: string;
  /** The big link that leads on from this page. */
  next: { kicker: string; label: string; href: string };
  links: readonly SiteLink[];
  navLabel: string;
  id?: string;
  className?: string;
};

/**
 * The end of every page: one big link to the next thing, then a line with the copyright, the
 * place with its local time, and the contact links.
 */
export function SiteFooter({
  name,
  year,
  place,
  timeZone,
  clock,
  next,
  links,
  navLabel,
  id,
  className,
}: SiteFooterProps) {
  return (
    <footer id={id} className={cn('mt-auto border-t border-line', className)}>
      <Container>
        <a href={next.href} className="group block pt-16 pb-14">
          <span className="block text-label text-faint">{next.kicker}</span>
          <span className="mt-[10px] block font-serif text-[clamp(30px,4vw,54px)] leading-[1.06] font-medium tracking-[-0.025em]">
            {next.label}
            <span
              aria-hidden="true"
              className="ml-[0.3em] inline-block text-accent transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none"
            >
              →
            </span>
          </span>
        </a>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-[18px] pb-9">
          <span className="text-[13px] text-faint">
            © {year} {name} · {place}
            <LocalTime timeZone={timeZone} template={clock} />
          </span>
          <nav aria-label={navLabel} className="flex flex-wrap gap-x-6 text-[15px]">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="py-3 underline">
                {link.label}
              </a>
            ))}
          </nav>
        </Container>
      </div>
    </footer>
  );
}
