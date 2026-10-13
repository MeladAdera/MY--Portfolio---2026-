export type DefinitionRow = { term: string; detail: string };

type DefinitionListProps = {
  rows: readonly DefinitionRow[];
  className?: string;
  rowClassName?: string;
  termClassName?: string;
  detailClassName?: string;
};

/** A <dl> of term/detail pairs, each pair wrapped in a <div> so it can be laid out as a unit. */
export function DefinitionList({
  rows,
  className,
  rowClassName,
  termClassName,
  detailClassName,
}: DefinitionListProps) {
  return (
    <dl className={className}>
      {rows.map((row, index) => (
        <div key={`${row.term}-${index}`} className={rowClassName}>
          <dt className={termClassName}>{row.term}</dt>
          <dd className={detailClassName}>{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
