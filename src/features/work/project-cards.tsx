import { Container } from '@/components/container';
import { DefinitionList } from '@/components/definition-list';
import { cn } from '@/lib/cn';

import { projectDiagrams } from './diagrams';

import type { Project } from '@/content';

type ProjectCardsProps = { projects: readonly Project[]; label: string };

/** The facts shown on a card: the first three rows, without the long "Built with" list. */
const cardFacts = (project: Project) =>
  project.meta.filter((row) => row.term !== 'Built with').slice(0, 3);

/**
 * The page's index: one card per project with a thin-line diagram of the system it is, the
 * name, one line and three facts. The whole card links to the project's case below.
 */
export function ProjectCards({ projects, label }: ProjectCardsProps) {
  return (
    <Container as="nav" aria-label={label}>
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 tablet:grid-cols-2 tablet:gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} wide={project.variant === 'small'} />
        ))}
      </ul>
    </Container>
  );
}

type ProjectCardProps = { project: Project; wide: boolean };

/** `wide` lays the card across both columns with the diagram beside the text. */
function ProjectCard({ project, wide }: ProjectCardProps) {
  const Diagram = projectDiagrams[project.id];

  return (
    <li className={cn('min-w-0', wide && 'tablet:col-span-2')}>
      <a
        href={`#${project.id}`}
        className={cn(
          'flex h-full flex-col border border-line bg-surface p-[22px] transition-colors duration-200 hover:border-accent motion-reduce:transition-none tablet:p-7',
          wide && 'tablet:flex-row tablet:items-center tablet:gap-9',
        )}
      >
        {Diagram && (
          <Diagram
            caption={project.diagram ?? project.summary}
            className={cn(wide && 'tablet:w-[300px] tablet:flex-none')}
          />
        )}
        <div className="min-w-0">
          <span
            className={cn(
              'block font-serif text-[clamp(24px,2.4vw,30px)] leading-[1.15] font-medium tracking-[-0.015em]',
              !wide && 'mt-[18px]',
            )}
          >
            {project.name}
          </span>
          <span className="mt-2 block max-w-[28em] font-serif text-[17px] leading-[1.55] text-muted">
            {project.summary}
          </span>
          <DefinitionList
            rows={cardFacts(project)}
            className="mt-[22px] grid grid-cols-3 gap-x-6 gap-y-4 border-t border-line pt-[18px]"
            termClassName="text-label text-faint"
            detailClassName="mt-[3px] text-[15px] leading-[1.5] text-fg"
          />
        </div>
      </a>
    </li>
  );
}
