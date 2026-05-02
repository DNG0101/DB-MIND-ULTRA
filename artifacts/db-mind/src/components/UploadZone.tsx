import { useState, useCallback } from "react";
import { UploadCloud, Database, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  title: string;
  color: "amber" | "cyan";
  onFileSelect: (f: File) => void;
  selectedFile: File | null;
  isParsing: boolean;
};

export function UploadZone({ title, color, onFileSelect, selectedFile, isParsing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".sql")) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const colorClass = color === "amber" ? "text-chart-1 border-chart-1" : "text-chart-2 border-chart-2";
  const bgHoverClass = color === "amber" ? "hover:bg-chart-1/5" : "hover:bg-chart-2/5";
  const dragClass = isDragging ? (color === "amber" ? "bg-chart-1/10 border-chart-1 border-dashed" : "bg-chart-2/10 border-chart-2 border-dashed") : "border-transparent";

  return (
    <div 
      className={cn("flex-1 flex flex-col items-center justify-center p-8 transition-colors", dragClass)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="max-w-md w-full text-center">
        <h2 className={cn("font-mono text-xl font-bold mb-8 tracking-tight", colorClass)}>
          {title}
        </h2>
        
        <label className={cn("cursor-pointer block border border-border rounded-lg p-12 transition-all bg-card/50", bgHoverClass)}>
          <input type="file" className="hidden" accept=".sql" onChange={e => {
            if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
          }} />
          
          <div className="flex flex-col items-center gap-4">
            {isParsing ? (
              <Loader2 className={cn("w-12 h-12 animate-spin", colorClass)} />
            ) : selectedFile ? (
              <Database className={cn("w-12 h-12", colorClass)} />
            ) : (
              <UploadCloud className="w-12 h-12 text-muted-foreground" />
            )}
            
            <div className="font-mono text-sm text-muted-foreground">
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-foreground">{selectedFile.name}</div>
                  <div>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              ) : (
                <>DRAG & DROP OR CLICK TO BROWSE</>
              )}
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
