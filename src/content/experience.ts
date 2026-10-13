import { z } from 'zod';

import { experienceSchema } from './schemas';

export const experience = z.array(experienceSchema).parse([
  {
    period: 'May 2026 – present',
    title: 'Inventory Distribution System',
    line: 'Full Stack Developer. A multi-tenant platform connecting a central warehouse with many retail shops: distribution, sales, customer credit and analytics.',
  },
  {
    period: 'Jan – Apr 2026',
    title: 'SportBooker, for Syria Sport',
    line: 'Full Stack Developer. A multi-tenant sports booking platform for players, venue operators and administrators.',
  },
  {
    period: 'Jan – Sep 2025',
    title: 'Freelance, on Khamsat',
    line: 'Full Stack Developer. Custom web applications for clients across different business domains. Refactored legacy and AI-generated code into clean, maintainable architectures.',
  },
]);
