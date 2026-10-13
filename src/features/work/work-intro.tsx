import { Container } from '@/components/container';
import { Kicker } from '@/components/kicker';

type WorkIntroProps = { kicker: string; title: string; lede: string };

/** The page opening: kicker, title and lede. The project cards below are the index. */
export function WorkIntro({ kicker, title, lede }: WorkIntroProps) {
  return (
    <Container as="header" className="pt-12 pb-10 tablet:pt-22">
      <Kicker>{kicker}</Kicker>
      <h1 className="mt-[14px] max-w-[14em] font-serif text-work-title font-medium">{title}</h1>
      <p className="mt-6 max-w-[32em] font-serif text-[18px] leading-[1.6] text-muted tablet:text-[20px]">
        {lede}
      </p>
    </Container>
  );
}
