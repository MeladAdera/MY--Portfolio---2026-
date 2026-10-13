import { z } from 'zod';

import { socialLinkSchema } from './schemas';

export const email = 'dev.melad.adera@gmail.com';

const links = z.array(socialLinkSchema);

/** LinkedIn and GitHub: shown in the Contact section next to the email address. */
export const profileLinks = links.parse([
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/melad-adera' },
  { label: 'GitHub', href: 'https://github.com/MeladAdera' },
]);

/** Email first, then the profiles: the footer nav on Home and Story. */
export const footerLinks = links.parse([
  { label: 'Email', href: `mailto:${email}` },
  ...profileLinks,
]);
