import { cn } from '@/lib/cn';

import type { HTMLAttributes } from 'react';

type ContainerTag = 'div' | 'header' | 'footer' | 'main' | 'section' | 'article' | 'nav';

type ContainerProps = HTMLAttributes<HTMLElement> & {
  /** Which element to render. Defaults to a div. */
  as?: ContainerTag;
};

/** The 1200px column every section shares, with the 20px / 32px side gutters. */
export function Container({ as: Tag = 'div', className, ...props }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-site px-5 tablet:px-gutter', className)} {...props} />
  );
}
