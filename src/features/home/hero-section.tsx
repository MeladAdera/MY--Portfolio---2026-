import { SiteHeader, type SiteLink } from '@/components/site-header';

import { HeroCopy } from './hero-copy';
import { HeroStage } from './hero-stage';

import type { Hero } from '@/content';

type HeroSectionProps = {
  hero: Hero;
  siteName: string;
  links: readonly SiteLink[];
  navLabel: string;
};

/**
 * The opening screen: the scene fills it, the header sits over the top edge and the copy
 * over the left. 860px tall on tablets and up; on phones the stage and the copy stack.
 */
export function HeroSection({ hero, siteName, links, navLabel }: HeroSectionProps) {
  return (
    <section className="relative bg-bg tablet:h-[860px] tablet:overflow-hidden">
      <HeroStage caption={hero.sceneCaption} pauseLabels={hero.ui} />
      <SiteHeader
        name={siteName}
        links={links}
        navLabel={navLabel}
        currentPath="/"
        placement="overlay"
      />
      <HeroCopy title={hero.title} lede={hero.lede} cta={hero.cta} />
    </section>
  );
}
