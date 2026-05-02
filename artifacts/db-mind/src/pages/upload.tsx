import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { UploadZone } from "@/components/UploadZone";
import { useMigrationContext } from "@/context/MigrationContext";
import { useCreateSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { parseLegacyFile, parseTargetFile, isParsingLegacy, isParsingTarget } = useMigrationContext();
  const [legacyFile, setLegacyFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);

  const createSession = useCreateSession({
    mutation: {
      onSuccess: (session) => {
        localStorage.setItem("dbmind_draft_session", session.id);
        setLocation(`/session/${session.id}`);
      }
    }
  });

  const handleStart = () => {
    if (!legacyFile || !targetFile) return;
    createSession.mutate({ data: { name: `Migration ${new Date().toISOString().split("T")[0]}` } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-14 border-b border-border flex items-center px-6 justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg tracking-tight">DB-MIND ULTRA</span>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-sm border border-primary/20">
            3.0 ENTERPRISE
          </span>
        </div>
        <Button 
          onClick={handleStart} 
          disabled={!legacyFile || !targetFile || createSession.isPending}
          className="font-mono text-xs h-8"
        >
          {createSession.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          NEW MIGRATION SESSION
        </Button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <UploadZone
          title="LEGACY DATABASE DUMP (.sql)"
          color="amber"
          onFileSelect={(f) => {
            setLegacyFile(f);
            parseLegacyFile(f);
          }}
          selectedFile={legacyFile}
          isParsing={isParsingLegacy}
        />
        
        <div className="w-px bg-border shrink-0" />
        
        <UploadZone
          title="TARGET SCHEMA DUMP (.sql)"
          color="cyan"
          onFileSelect={(f) => {
            setTargetFile(f);
            parseTargetFile(f);
          }}
          selectedFile={targetFile}
          isParsing={isParsingTarget}
        />
      </main>
    </div>
  );
}
