import { Kicker } from '@/components/kicker';

type StoryIntroProps = { kicker: string; title: string };

/** The kicker and the title over the stage; the scene fades them as the reader starts to scroll. */
export function StoryIntro({ kicker, title }: StoryIntroProps) {
  return (
    <div
      data-intro
      className="absolute top-[76px] right-5 left-5 tablet:top-[150px] tablet:right-auto tablet:inset-gutter-left tablet:w-[min(470px,36%)]"
    >
      <Kicker className="text-[13px]">{kicker}</Kicker>
      <h1 className="mt-[14px] font-serif text-[44px] leading-[0.98] font-medium tracking-[-0.03em] tablet:text-story-title">
        {title}
      </h1>
    </div>
  );
}
