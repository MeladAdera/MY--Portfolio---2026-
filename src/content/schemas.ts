import { z } from 'zod';

/*
 * Schemas for every piece of visitor-facing content. Each data module parses its own
 * export through one of these, so a typo in content fails `next build` instead of
 * reaching production. Objects are strict so an unknown key is an error too.
 */

const text = z.string().trim().min(1);

export const navLinkSchema = z.strictObject({
  label: text,
  href: z.string().regex(/^\/\S*$/, 'internal href must start with /'),
});

export const socialLinkSchema = z.strictObject({
  label: text,
  href: z.union([z.url(), z.string().regex(/^mailto:\S+@\S+$/, 'must be a mailto: address')]),
});

export const factSchema = z.strictObject({ term: text, detail: text });

export const siteSchema = z.strictObject({
  name: text,
  role: text,
  title: text,
  description: text,
  url: z.url(),
  locale: text,
  year: z.number().int().min(2000),
  location: z.strictObject({ city: text, country: text, timeZone: text }),
});

export const heroSchema = z.strictObject({
  title: text,
  lede: text,
  cta: navLinkSchema.extend({ href: z.string().regex(/^#\S+$/) }),
  sceneCaption: text,
  /** Labels of the scene control: pause while playing, play while paused, replay when done. */
  ui: z.strictObject({ pause: text, play: text, replay: text }),
});

export const aboutSchema = z.strictObject({
  heading: text,
  summary: text,
  facts: z.array(factSchema).min(1),
  experienceLabel: text,
  skillsLabel: text,
});

export const experienceSchema = z.strictObject({ period: text, title: text, line: text });

export const skillGroupSchema = z.strictObject({ term: text, items: z.array(text).min(1) });

export const projectStatusSchema = z.enum(['in-progress']);

export const projectMetaSchema = z.strictObject({
  term: z.enum(['Role', 'For', 'Period', 'Status', 'Built with', 'Type']),
  detail: text,
});

export const decisionSchema = z.strictObject({ lead: text, text });

export const projectSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z-]*$/, 'id is used as an anchor'),
  name: text,
  /** One line for the Home "Work in progress" list. */
  summary: text,
  status: projectStatusSchema,
  /** `small` renders name and proposition only (Your Guide). */
  variant: z.enum(['full', 'small']),
  meta: z.array(projectMetaSchema).min(1),
  proposition: text,
  description: text.optional(),
  decisions: z.array(decisionSchema).min(1).optional(),
});

export const workPageSchema = z.strictObject({
  kicker: text,
  pageTitle: text,
  description: text,
  title: text,
  lede: text,
  indexLabel: text,
  decisionsLabel: text,
});

export const workInProgressSchema = z.strictObject({ title: text, aside: text });

export const contactSchema = z.strictObject({
  label: text,
  pitch: text,
  copy: z.strictObject({ idle: text, copied: text, failed: text }),
  status: z.strictObject({ copied: text, failed: text }),
  /** Sentence after the place name; `{time}` and `{zone}` are filled by the live clock. */
  clock: text.refine((s) => s.includes('{time}') && s.includes('{zone}'), {
    message: 'must contain {time} and {zone}',
  }),
});

export const storyParagraphSchema = z.strictObject({
  text,
  variant: z.enum(['quote']).optional(),
});

export const storyStepSchema = z.strictObject({
  heading: text,
  paragraphs: z.array(storyParagraphSchema).min(1),
});

export const storySchema = z.strictObject({
  kicker: text,
  pageTitle: text,
  description: text,
  title: text,
  sectionLabel: text,
  sceneCaption: text,
  stepLabel: text,
  ui: z.strictObject({ hint: text, play: text, pause: text }),
  steps: z.array(storyStepSchema).length(6),
});

export type NavLink = z.infer<typeof navLinkSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type About = z.infer<typeof aboutSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectMeta = z.infer<typeof projectMetaSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type Project = z.infer<typeof projectSchema>;
export type WorkPage = z.infer<typeof workPageSchema>;
export type WorkInProgress = z.infer<typeof workInProgressSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type StoryParagraph = z.infer<typeof storyParagraphSchema>;
export type StoryStep = z.infer<typeof storyStepSchema>;
export type Story = z.infer<typeof storySchema>;
