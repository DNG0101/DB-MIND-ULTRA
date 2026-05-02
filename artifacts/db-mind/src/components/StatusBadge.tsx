import { cn } from "@/lib/utils";

type Props = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className }: Props) {
  const getColors = () => {
    switch (status.toUpperCase()) {
      case "ADDED": return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "REMOVED": return "bg-chart-4/10 text-chart-4 border-chart-4/20";
      case "MODIFIED": return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "RENAMED": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      case "MAPPED": return "bg-chart-5/10 text-chart-5 border-chart-5/20";
      case "IDENTICAL": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase border font-bold tracking-tight", getColors(), className)}>
      {status}
    </span>
  );
}
