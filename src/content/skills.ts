import { z } from 'zod';

import { skillGroupSchema } from './schemas';

export const skills = z.array(skillGroupSchema).parse([
  { term: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'HTML/CSS'] },
  {
    term: 'Frontend',
    items: [
      'React',
      'Next.js (App and Pages Router)',
      'TanStack Query',
      'Zod',
      'Tailwind CSS',
      'Shadcn/UI',
      'Material-UI',
      'Framer Motion',
    ],
  },
  { term: 'Backend', items: ['Node.js', 'NestJS', 'Express.js', 'REST APIs'] },
  { term: 'Databases and caching', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { term: 'Testing', items: ['Jest', 'Cypress'] },
  { term: 'AI tools', items: ['Cursor', 'Claude Code'] },
]);
