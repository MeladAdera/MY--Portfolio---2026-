type ProgressRailProps = {
  /** Positions of the stops along the rail, in percent. */
  ticks: readonly number[];
};

/** The thin vertical rail on the right of the stage: a tick per stop, a fill the scene grows. */
export function ProgressRail({ ticks }: ProgressRailProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute top-[22vh] inset-gutter-right bottom-[22vh] hidden w-px bg-line tablet:block"
    >
      <div data-fill className="absolute top-0 left-0 w-px bg-accent opacity-80" />
      {ticks.map((tick) => (
        <div
          key={tick}
          data-tick
          className="absolute -left-[3px] h-px w-[7px] bg-faint"
          style={{ top: `${tick.toFixed(2)}%` }}
        />
      ))}
    </div>
  );
}
