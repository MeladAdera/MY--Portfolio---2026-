import { Container } from '@/components/container';

import type { Project, ProjectStatus, WorkInProgress } from '@/content';

type WorkInProgressSectionProps = {
  copy: WorkInProgress;
  projects: readonly Project[];
  statusLabel: Record<ProjectStatus, string>;
};

/** The numbered list of current projects, read from the same array the Work page uses. */
export function WorkInProgressSection({ copy, projects, statusLabel }: WorkInProgressSectionProps) {
  return (
    <section id="work" aria-labelledby="work-title" className="border-t border-line bg-surface">
      <Container className="pt-24 pb-26">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 id="work-title" className="font-serif text-wip font-medium">
            {copy.title}
          </h2>
          <p className="font-sans text-kicker text-faint">{copy.aside}</p>
        </div>
        <ol className="mt-10 border-b border-line">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="flex flex-wrap items-baseline gap-x-7 gap-y-[6px] border-t border-line py-[22px]"
            >
              <span className="flex-[0_0_40px] font-sans text-label text-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="flex-[0_1_300px] font-serif text-[24px] leading-[1.2] font-medium">
                {project.name}
              </h3>
              <p className="flex-[1_1_320px] font-serif text-[17px] text-muted">
                {project.summary}
              </p>
              <span className="font-sans text-kicker text-faint">
                {statusLabel[project.status]}
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
