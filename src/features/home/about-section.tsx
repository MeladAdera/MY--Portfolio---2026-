import { Container } from '@/components/container';
import { DefinitionList } from '@/components/definition-list';

import { ExperienceList } from './experience-list';
import { SkillsList } from './skills-list';

import type { About, Experience, SkillGroup } from '@/content';

type AboutSectionProps = {
  about: About;
  experience: readonly Experience[];
  skills: readonly SkillGroup[];
};

/**
 * "Who am I": an editorial spread. Intro beside the facts, then experience beside skills.
 * One column below the desktop breakpoint.
 */
export function AboutSection({ about, experience, skills }: AboutSectionProps) {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-y-16 pt-16 pb-20 desktop:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] desktop:gap-x-[clamp(48px,8vw,120px)] desktop:gap-y-24 desktop:pt-26 desktop:pb-30">
        <div>
          <h2 id="about-title" className="max-w-[15em] font-serif text-about font-medium">
            {about.heading}
          </h2>
          <p className="mt-7 max-w-[34em] font-serif text-[17px] leading-[1.65] text-muted desktop:text-[19px]">
            {about.summary}
          </p>
        </div>
        <DefinitionList
          rows={about.facts}
          className="mt-2 grid content-start gap-6"
          termClassName="text-label text-faint"
          detailClassName="mt-1 text-[16px] leading-[1.5]"
        />
        <ExperienceList label={about.experienceLabel} items={experience} />
        <SkillsList label={about.skillsLabel} groups={skills} />
      </Container>
    </section>
  );
}
