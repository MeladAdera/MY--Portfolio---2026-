import { cn } from '@/lib/cn';
import { socialKind } from '@/lib/social';

import { Container } from './container';
import { LocalTime } from './local-time';
import { SocialIcon } from './social-icon';

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
          <nav aria-label={navLabel} className="-mr-3 flex flex-wrap items-center gap-x-1">
            {links.map((link) => {
              const kind = socialKind(link.href);
              /* a service with a mark shows the mark; anything else keeps its name */
              return kind ? (
                <a
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className="flex h-11 w-11 items-center justify-center text-muted transition-colors duration-200 hover:text-fg motion-reduce:transition-none"
                >
                  <SocialIcon kind={kind} className="h-5 w-5" />
                </a>
              ) : (
                <a key={link.href} href={link.href} className="px-3 py-3 text-[15px] underline">
                  {link.label}
                </a>
              );
            })}
          </nav>
        </Container>
      </div>
    </footer>
  );
}
