import { cn } from '@/lib/cn';

import { Container } from './container';

import type { SiteLink } from './site-header';

type WithLinks = { links: readonly SiteLink[]; navLabel: string };
type WithoutLinks = { links?: undefined; navLabel?: undefined };

type SiteFooterProps = {
  name: string;
  year: number;
  id?: string;
  className?: string;
} & (WithLinks | WithoutLinks);

/**
 * The page footer. With `links` it is the copyright line plus the contact nav
 * (Home and Story); without them it is the single line used on Work.
 */
export function SiteFooter({ name, year, id, className, links, navLabel }: SiteFooterProps) {
  const copyright = `© ${year} ${name}`;

  if (!links) {
    return (
      <footer id={id} className={cn('mt-auto', className)}>
        <Container>
          <p className="pt-6 pb-10 text-label text-faint">{copyright}</p>
        </Container>
      </footer>
    );
  }

  return (
    <footer id={id} className={cn('mt-auto border-t border-line', className)}>
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-6 pb-10">
        <span className="text-[12px] text-faint">{copyright}</span>
        <nav aria-label={navLabel} className="flex flex-wrap gap-x-6 text-[15px]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="py-3 underline">
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
