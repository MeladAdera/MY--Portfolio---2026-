import { DiagramFrame, label, line, lineOn, wire, wireOn, type DiagramProps } from './diagram';

/** Three venues on their own subdomains share one platform, used by four kinds of people. */
export function SportBookerDiagram(props: DiagramProps) {
  return (
    <DiagramFrame viewBox="0 0 420 200" {...props}>
      <rect className={line} x="34" y="22" width="100" height="34" rx="2" />
      <text className={label} x="48" y="44">
        venue-a.
      </text>
      <rect className={line} x="160" y="22" width="100" height="34" rx="2" />
      <text className={label} x="174" y="44">
        venue-b.
      </text>
      <rect className={line} x="286" y="22" width="100" height="34" rx="2" />
      <text className={label} x="300" y="44">
        venue-c.
      </text>
      <path className={wire} d="M84 56 V92" />
      <path className={wireOn} d="M210 56 V92" />
      <path className={wire} d="M336 56 V92" />
      <rect className="fill-accent opacity-12" x="34" y="92" width="352" height="40" />
      <rect className={lineOn} x="34" y="92" width="352" height="40" rx="2" />
      <text className="fill-fg text-[11px]" x="50" y="117">
        One platform · bookings, schedules, facilities
      </text>
      <path className={wire} d="M84 132 V158" />
      <path className={wire} d="M168 132 V158" />
      <path className={wire} d="M252 132 V158" />
      <path className={wire} d="M336 132 V158" />
      <circle className={line} cx="84" cy="166" r="7" />
      <circle className={line} cx="168" cy="166" r="7" />
      <circle className={line} cx="252" cy="166" r="7" />
      <circle className={lineOn} cx="336" cy="166" r="7" />
      <text className={label} x="62" y="192">
        admin
      </text>
      <text className={label} x="142" y="192">
        operator
      </text>
      <text className={label} x="236" y="192">
        staff
      </text>
      <text className={label} x="318" y="192">
        player
      </text>
    </DiagramFrame>
  );
}
