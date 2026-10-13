import { Container } from '@/components/container';
import { cn } from '@/lib/cn';

import { DecisionsList } from './decisions-list';
import { ProjectMetaList } from './project-meta';

import type { Project } from '@/content';

type ProjectArticleProps = { project: Project; decisionsLabel: string };

/**
 * One project. Desktop: a narrow facts column beside a reading column. Below that the
 * reading column dissolves (display: contents) so its parts can be reordered around the
 * facts: name, proposition, facts, description, decisions.
 */
export function ProjectArticle({ project, decisionsLabel }: ProjectArticleProps) {
  const headingId = `${project.id}-title`;
  const small = project.variant === 'small';

  return (
    <Container
      as="article"
      id={project.id}
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col pt-22 desktop:grid desktop:grid-cols-[minmax(0,250px)_minmax(0,1fr)] desktop:gap-x-[clamp(40px,7vw,104px)]',
        small ? 'tablet:pt-28' : 'tablet:pt-32',
      )}
    >
      <ProjectMetaList rows={project.meta} compact={small} />
      <div className="contents desktop:col-start-2 desktop:row-start-1 desktop:block desktop:max-w-[680px]">
        <h2 id={headingId} className="order-1 font-serif text-project font-medium">
          {project.name}
        </h2>
        <p className="order-2 mt-4 font-serif text-[20px] leading-[1.45] text-body tablet:text-[22px]">
          {project.proposition}
        </p>
        {project.description && (
          <p className="order-4 mt-[22px] font-serif text-[17px] leading-[1.7] text-muted tablet:text-[18px]">
            {project.description}
          </p>
        )}
        {project.decisions && (
          <>
            <h3 className="order-5 mt-12 text-label font-normal text-faint">{decisionsLabel}</h3>
            <DecisionsList decisions={project.decisions} className="order-6" />
          </>
        )}
      </div>
    </Container>
  );
}
