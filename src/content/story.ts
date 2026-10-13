import { storySchema } from './schemas';

export const story = storySchema.parse({
  kicker: '02 — Story',
  pageTitle: 'The climb',
  description: 'How I became a software engineer, one step at a time.',
  title: 'The climb.',
  sectionLabel: 'The climb',
  sceneCaption:
    'A man climbs a long concrete staircase in a dark hall toward a tall opening filled with soft daylight. He stops six times on the way, on the steps and on the landings, to look up, glance aside or look down at the next step, then continues. The space grows lighter as he rises.',
  stepLabel: 'Step',
  ui: { hint: 'Scroll to climb', play: 'Play the climb', pause: 'Pause' },
  steps: [
    {
      heading: 'Where It All Began',
      paragraphs: [
        {
          text: 'My story began after three years of studying Computer Science in a hands-on academic environment, at the College of Computer, Control, and Automation Engineering.',
        },
      ],
    },
    {
      heading: 'Searching for Meaning',
      paragraphs: [
        { text: 'Throughout those years, I kept asking myself a question:' },
        { text: 'How could I create real value from everything I was learning?', variant: 'quote' },
        {
          text: 'I wasn’t just looking for knowledge. I wanted to put that knowledge into practice.',
        },
        { text: 'I wanted to grow, to improve, and to become the best version of myself.' },
      ],
    },
    {
      heading: 'A Turning Point',
      paragraphs: [
        {
          text: 'My curiosity, combined with advice from a friend in the same field, encouraged me to take a different path.',
        },
        { text: 'I decided to change the way I used my time and energy.' },
        {
          text: 'I wanted to move from being someone who wasted his potential to someone who was disciplined, curious, and committed to continuous learning.',
        },
      ],
    },
    {
      heading: 'My First Step',
      paragraphs: [
        { text: 'About two years ago, I took my first step toward becoming a software engineer.' },
        {
          text: 'I began studying technologies and systems, building projects, and learning from what I created.',
        },
        {
          text: 'I wanted to understand not only how things worked, but also why they worked that way.',
        },
        { text: 'And as technology continued to evolve, I tried to keep learning and adapting.' },
      ],
    },
    {
      heading: 'The Journey',
      paragraphs: [
        { text: 'The road wasn’t easy.' },
        { text: 'It was challenging, uncertain, and often unclear.' },
        {
          text: 'There were things I didn’t understand, problems I didn’t know how to solve, and moments when progress felt slower than I expected.',
        },
        { text: 'But every challenge taught me something.' },
        {
          text: 'Little by little, the journey helped me build discipline, develop a deeper curiosity, and become more committed to growth.',
        },
      ],
    },
    {
      heading: 'The Goal',
      paragraphs: [
        { text: 'My goal was never just to become a software engineer.' },
        {
          text: 'I wanted to become an engineer who understands the systems he builds, learns from his mistakes, and keeps improving his skills.',
        },
        {
          text: 'An engineer who doesn’t stop at what he already knows, but continues exploring what he can learn next.',
        },
        { text: 'And this journey is still going on.' },
        {
          text: 'I’m still learning, still building, and still working toward becoming the best version of myself as an engineer.',
        },
      ],
    },
  ],
});
