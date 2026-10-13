import { cn } from '@/lib/cn';

import type { StoryStep as StoryStepContent } from '@/content';

type StoryStepProps = {
  /** 1-based position in the climb. */
  index: number;
  /** The word before the number, "Step". */
  label: string;
  step: StoryStepContent;
};

/**
 * One stop of the climb: its number, heading and paragraphs. All six sit on the same spot;
 * the scene fades the right one in and out through inline styles.
 */
export function StoryStep({ index, label, step }: StoryStepProps) {
  return (
    <li data-step className="invisible absolute top-0 left-0 w-full opacity-0">
      <div className="tablet:-translate-y-1/2">
        <p className="flex step-dash items-center gap-3 font-sans text-[13px] tracking-[0.01em] text-muted">
          {label} {index}
        </p>
        <h2 className="mt-3 font-serif text-[25px] leading-[1.08] font-medium tracking-[-0.015em] text-fg tablet:text-step">
          {step.heading}
        </h2>
        <div className="mt-3 tablet:mt-[18px]">
          {step.paragraphs.map((paragraph, j) => (
            <p
              key={j}
              data-paragraph
              className={cn(
                'mb-[0.6em] font-serif leading-[1.62] tablet:mb-[0.72em]',
                paragraph.variant === 'quote'
                  ? 'text-[18px] leading-[1.3] font-medium text-fg tablet:text-[22px]'
                  : 'text-[15px] text-body tablet:text-[18px]',
              )}
            >
              {paragraph.text}
            </p>
          ))}
        </div>
      </div>
    </li>
  );
}
