import { siteSchema } from './schemas';

export const site = siteSchema.parse({
  name: 'Melad Adera',
  role: 'Full Stack Developer',
  title: 'Melad Adera — Full Stack Developer',
  description:
    'Melad Adera, Full Stack Developer in Lattakia, Syria. React, Next.js, TypeScript, Node.js, NestJS and PostgreSQL.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'en',
  year: 2026,
  location: { city: 'Lattakia', country: 'Syria', timeZone: 'Asia/Damascus' },
});
