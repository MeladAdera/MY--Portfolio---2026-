import { describe, expect, it } from 'vitest';

import {
  about,
  contact,
  email,
  experience,
  footerLinks,
  hero,
  mainNav,
  profileLinks,
  projects,
  site,
  skills,
  story,
  workPage,
} from './index';

/* Importing the modules already runs every schema; these are the cross-module invariants. */
describe('content', () => {
  it('has the three projects in page order with anchor-safe ids', () => {
    expect(projects.map((p) => p.id)).toEqual(['inventory', 'sportbooker', 'your-guide']);
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
  });

  it('marks only Your Guide as the small variant', () => {
    expect(projects.filter((p) => p.variant === 'small').map((p) => p.id)).toEqual(['your-guide']);
    for (const p of projects.filter((p) => p.variant === 'full')) {
      expect(p.description).toBeDefined();
      expect(p.decisions?.length).toBeGreaterThan(0);
    }
  });

  it('tells the story in six steps with one quote', () => {
    expect(story.steps).toHaveLength(6);
    const quotes = story.steps.flatMap((s) => s.paragraphs.filter((p) => p.variant === 'quote'));
    expect(quotes).toHaveLength(1);
  });

  it('keeps navigation internal and the mailto in sync with the email', () => {
    for (const link of mainNav) expect(link.href.startsWith('/')).toBe(true);
    expect(footerLinks[0]?.href).toBe(`mailto:${email}`);
    expect(footerLinks.slice(1)).toEqual(profileLinks);
  });

  it('carries the legacy page titles', () => {
    expect(site.title).toBe('Melad Adera — Full Stack Developer');
    expect(workPage.pageTitle).toBe('Work');
    expect(story.pageTitle).toBe('The climb');
  });

  it('has the facts, experience and skills the About section renders', () => {
    expect(about.facts).toHaveLength(3);
    expect(experience).toHaveLength(3);
    expect(skills).toHaveLength(6);
    expect(hero.cta.href).toBe('#about');
    expect(contact.resume.href).toMatch(/\.pdf$/);
  });
});
