import { z } from 'zod';

import { socialLinkSchema } from './schemas';

export const email = 'dev.melad.adera@gmail.com';

const links = z.array(socialLinkSchema);

export const linkedIn = socialLinkSchema.parse({
  label: 'LinkedIn',
  href: 'https://www.linkedin.com/in/melad-adera',
});

/** LinkedIn and GitHub: the profiles under the contact section. */
export const profileLinks = links.parse([
  linkedIn,
  { label: 'GitHub', href: 'https://github.com/MeladAdera' },
]);

/** Email first, then the profiles: the footer nav on every page. */
export const footerLinks = links.parse([
  { label: 'Email', href: `mailto:${email}` },
  ...profileLinks,
]);
