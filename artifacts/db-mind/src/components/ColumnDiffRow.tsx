import { ColumnDiff } from "../lib/diffEngine";
import { StatusBadge } from "./StatusBadge";

type Props = {
  diff: ColumnDiff;
};

export function ColumnDiffRow({ diff }: Props) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-border last:border-0 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <StatusBadge status={diff.state} />
        <span className="font-mono text-sm">{diff.column}</span>
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        {diff.changes.join(", ")}
      </div>
    </div>
  );
}
