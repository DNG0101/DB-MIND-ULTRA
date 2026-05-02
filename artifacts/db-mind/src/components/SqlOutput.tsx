import { useGenerateExport } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { useState } from "react";

export function SqlOutput({ sessionId }: { sessionId: string }) {
  const [sql, setSql] = useState("");
  const generateExport = useGenerateExport({
    mutation: {
      onSuccess: (res) => {
        setSql(res.sql);
      }
    }
  });

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-bold">OUTPUT SQL</h2>
        <Button 
          onClick={() => generateExport.mutate({ id: sessionId })}
          disabled={generateExport.isPending}
          className="font-mono text-xs"
        >
          {generateExport.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          GENERATE EXPORT
        </Button>
      </div>
      
      <div className="flex-1 border border-border bg-black/50 rounded overflow-hidden flex flex-col">
        {sql ? (
          <pre className="p-4 font-mono text-xs text-chart-2 overflow-auto flex-1">
            {sql}
          </pre>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
            Click Generate Export to view SQL.
          </div>
        )}
      </div>
    </div>
  );
}
