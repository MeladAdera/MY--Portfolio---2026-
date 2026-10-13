import { aboutSchema, heroSchema } from './schemas';

export const hero = heroSchema.parse({
  teaser: ['Let me tell you ..', 'Who am I ..?', 'What can I build ?'],
  title: 'From ideas to working products.',
  lede: "I'm a Full Stack Developer building practical web applications and growing my approach to software engineering, one system at a time.",
  cta: { label: 'More about me', href: '#about' },
  ui: { pause: 'Pause scene', play: 'Play scene', replay: 'Replay scene' },
  sceneCaption:
    'A drawn engineer at a worktable picks up a small component, turns it over to check its interface, and installs it into a system board between an interface module and a data module. A blue signal travels to the data module and back. The light warm room then darkens and the camera pulls back to show rows of server racks around him.',
});

export const about = aboutSchema.parse({
  heading: 'I’m Melad, a Full Stack Developer from Lattakia, Syria.',
  summary:
    'I have more than two years of experience building modern web applications with React, Next.js, TypeScript, Node.js, NestJS and PostgreSQL. I work across frontend and backend, with a strong focus on maintainable architectures, REST APIs, authentication, database-driven applications and responsive interfaces. I enjoy solving complex problems, learning new technologies, and turning business requirements into reliable software.',
  facts: [
    {
      term: 'Studying',
      detail: 'B.Sc. Computer and Control Engineering, Lattakia University, since 2021',
    },
    { term: 'Certification', detail: 'Fundamentals of Database Engineering' },
    { term: 'Speaks', detail: 'Arabic (native), English (intermediate)' },
  ],
  experienceLabel: 'Experience',
  skillsLabel: 'Skills',
});
