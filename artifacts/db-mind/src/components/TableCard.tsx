import { ChevronRight, Table as TableIcon } from "lucide-react";
import { TableNode } from "../lib/sqlParser";

type Props = {
  table: TableNode;
  expanded: boolean;
  onToggle: () => void;
};

export function TableCard({ table, expanded, onToggle }: Props) {
  return (
    <div className="border border-border bg-card rounded overflow-hidden mb-2">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
          <TableIcon className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-bold">{table.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{table.columns.length} cols</span>
          <span className="font-mono text-xs text-muted-foreground">{table.rowCount} rows</span>
        </div>
      </button>
      
      {expanded && (
        <div className="p-2 border-t border-border bg-card/50">
          <div className="font-mono text-xs text-muted-foreground">Columns:</div>
          <ul className="mt-2 space-y-1">
            {table.columns.map(col => (
              <li key={col.name} className="flex items-center justify-between font-mono text-xs">
                <span>{col.name}</span>
                <span className="text-muted-foreground">{col.dataType.base}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
