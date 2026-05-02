import { useEffect } from "react";
import { useParams } from "wouter";
import { useGetSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useMigrationContext } from "@/context/MigrationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Loader2 } from "lucide-react";
import { MappingCanvas } from "@/components/MappingCanvas";
import { ValidationReport } from "@/components/ValidationReport";
import { SqlOutput } from "@/components/SqlOutput";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { setSession, activeTab, setActiveTab } = useMigrationContext();

  const { data: session, isLoading } = useGetSession(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetSessionQueryKey(id || ""),
    }
  });

  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <header className="h-12 border-b border-border flex items-center px-4 justify-between bg-card shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-sm tracking-tight text-muted-foreground">SESSION: {session.id.substring(0,8)}</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {session.status.toUpperCase()}
          </span>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
          <TabsList className="h-full bg-transparent p-0 rounded-none border-l border-r border-border">
            {["diff", "mapping", "validate", "transform", "output"].map(t => (
              <TabsTrigger 
                key={t} 
                value={t}
                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50 data-[state=active]:text-foreground font-mono text-xs uppercase px-6"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">DRY RUN</span>
          {/* Toggle */}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={20} className="border-r border-border flex flex-col bg-sidebar">
            <div className="h-10 border-b border-border flex items-center px-3 justify-between bg-sidebar/50 shrink-0">
              <span className="font-mono text-xs text-chart-1 font-bold">LEGACY SCHEMA</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {/* Table List */}
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />
          
          <ResizablePanel defaultSize={70}>
            <div className="h-full w-full overflow-auto p-4">
              {activeTab === "diff" && (
                <div className="font-mono text-sm text-muted-foreground">Diff visualization goes here...</div>
              )}
              {activeTab === "mapping" && <MappingCanvas />}
              {activeTab === "validate" && <ValidationReport />}
              {activeTab === "output" && <SqlOutput sessionId={session.id} />}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
