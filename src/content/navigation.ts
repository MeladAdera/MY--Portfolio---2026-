import { z } from 'zod';

import { navLinkSchema } from './schemas';

export const mainNav = z.array(navLinkSchema).parse([
  { label: 'Work', href: '/work' },
  { label: 'Story', href: '/story' },
  { label: 'Contact', href: '/work#contact' },
]);

export const navLabels = { main: 'Main', contact: 'Contact' } as const;
