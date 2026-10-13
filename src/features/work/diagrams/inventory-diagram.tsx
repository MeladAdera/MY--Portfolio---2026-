import { DiagramFrame, label, line, lineOn, wire, wireOn, type DiagramProps } from './diagram';

/** One warehouse feeding three shops; the credit ledger runs beneath. */
export function InventoryDiagram(props: DiagramProps) {
  return (
    <DiagramFrame viewBox="0 0 420 200" {...props}>
      <rect className={lineOn} x="24" y="56" width="120" height="88" rx="2" />
      <text className={label} x="40" y="82">
        Warehouse
      </text>
      <text className="fill-muted text-[11px]" x="40" y="100">
        stock · orders
      </text>
      <path className={wireOn} d="M144 100 H210 V48 H276" />
      <path className={wire} d="M144 100 H276" />
      <path className={wire} d="M144 100 H210 V152 H276" />
      <circle className="fill-accent" cx="236" cy="48" r="3" />
      <rect className={line} x="276" y="30" width="118" height="36" rx="2" />
      <text className={label} x="290" y="53">
        Shop · sales
      </text>
      <rect className={line} x="276" y="82" width="118" height="36" rx="2" />
      <text className={label} x="290" y="105">
        Shop · sales
      </text>
      <rect className={line} x="276" y="134" width="118" height="36" rx="2" />
      <text className={label} x="290" y="157">
        Shop · offline, syncs
      </text>
      <path className={wire} d="M24 176 H394" strokeDasharray="2 4" />
      <text className={label} x="24" y="194">
        credit ledger, every movement in one transaction
      </text>
    </DiagramFrame>
  );
}
