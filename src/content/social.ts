import { z } from 'zod';

import { socialLinkSchema } from './schemas';

export const email = 'dev.melad.adera@gmail.com';

export const linkedIn = socialLinkSchema.parse({
  label: 'LinkedIn',
  href: 'https://www.linkedin.com/in/melad-adera',
});

/** The profiles in the footer, in this order; each is shown as its mark. */
export const footerLinks = z
  .array(socialLinkSchema)
  .parse([
    { label: 'Instagram', href: 'https://www.instagram.com/melad.adera/' },
    { label: 'Facebook', href: 'https://www.facebook.com/melad.adera' },
    linkedIn,
    { label: 'GitHub', href: 'https://github.com/MeladAdera' },
  ]);
