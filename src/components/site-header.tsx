import Link from 'next/link';

import { cn } from '@/lib/cn';

import { Container } from './container';

export type SiteLink = { label: string; href: string };

export type HeaderPlacement = 'static' | 'overlay' | 'fixed';

type SiteHeaderProps = {
  name: string;
  links: readonly SiteLink[];
  navLabel: string;
  /** The page's own path. The link whose href equals it is marked current. */
  currentPath: string;
  /** static: in flow. overlay: on top of the hero. fixed: pinned while scrolling. */
  placement?: HeaderPlacement;
};

const placementClass: Record<HeaderPlacement, string> = {
  static: 'relative',
  overlay: 'absolute inset-x-0 top-0 z-10',
  fixed: 'fixed inset-x-0 top-0 z-10',
};

export function SiteHeader({
  name,
  links,
  navLabel,
  currentPath,
  placement = 'static',
}: SiteHeaderProps) {
  /* On pages with a current link the other links step back; on Home all links are equal. */
  const hasCurrent = links.some((link) => link.href === currentPath);

  return (
    <header className={placementClass[placement]}>
      <Container className="flex flex-wrap items-center justify-between gap-x-6 py-4 tablet:py-6">
        <Link
          href="/"
          className="py-[10px] font-serif text-[17px] font-semibold tracking-[-0.01em]"
        >
          {name}
        </Link>
        <nav aria-label={navLabel} className="flex flex-wrap gap-x-6 text-[15px]">
          {links.map((link) => {
            const isCurrent = link.href === currentPath;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'py-3',
                  isCurrent && 'border-b border-accent',
                  hasCurrent && !isCurrent && 'text-muted',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
