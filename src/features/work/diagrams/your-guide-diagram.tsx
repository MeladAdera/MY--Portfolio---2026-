import { DiagramFrame, label, line, lineOn, type DiagramProps } from './diagram';

/** Tasks, time and study as three overlapping circles. */
export function YourGuideDiagram(props: DiagramProps) {
  return (
    <DiagramFrame viewBox="0 0 300 160" {...props}>
      <circle className={lineOn} cx="120" cy="66" r="46" />
      <circle className={line} cx="180" cy="66" r="46" />
      <circle className={line} cx="150" cy="106" r="46" />
      <text className={label} x="86" y="48">
        Tasks
      </text>
      <text className={label} x="186" y="48">
        Time
      </text>
      <text className={label} x="136" y="140">
        Study
      </text>
      <circle className="fill-accent" cx="150" cy="80" r="3" />
    </DiagramFrame>
  );
}
