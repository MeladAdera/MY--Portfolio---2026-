import { footerSchema } from './schemas';
import { email } from './social';

/* Every page ends with one big link to the next thing, then the line with the place and the time. */
export const footer = footerSchema.parse({
  nextLabel: 'Next',
  next: {
    '/': { label: 'The work', href: '/work' },
    '/work': { label: 'The story', href: '/story' },
    '/story': { label: 'Email me', href: `mailto:${email}` },
  },
  clock: ' · {time} ({zone})',
});
