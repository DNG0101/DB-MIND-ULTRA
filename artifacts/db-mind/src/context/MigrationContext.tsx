import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { SchemaGraph } from "../lib/sqlParser";
import { DiffReport } from "../lib/diffEngine";
import { MappingConfig } from "../lib/mappingEngine";
import { ValidationReport } from "../lib/validationEngine";
import { CommandHistory, createEmptyHistory, Command } from "../lib/commandHistory";
import { Session } from "@workspace/api-client-react";

type Tab = "diff" | "mapping" | "validate" | "transform" | "output";

type MigrationContextType = {
  session: Session | null;
  setSession: (s: Session | null) => void;
  legacyGraph: SchemaGraph | null;
  targetGraph: SchemaGraph | null;
  diffReport: DiffReport | null;
  mappingConfig: MappingConfig | null;
  validationReport: ValidationReport | null;
  commandHistory: CommandHistory;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  selectedLegacyTable: string | null;
  selectedTargetTable: string | null;
  isParsingLegacy: boolean;
  isParsingTarget: boolean;
  parseProgressLegacy: number;
  parseProgressTarget: number;
  parseLegacyFile: (file: File) => Promise<void>;
  parseTargetFile: (file: File) => Promise<void>;
};

const MigrationContext = createContext<MigrationContextType | null>(null);

export function MigrationProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [legacyGraph, setLegacyGraph] = useState<SchemaGraph | null>(null);
  const [targetGraph, setTargetGraph] = useState<SchemaGraph | null>(null);
  const [diffReport, setDiffReport] = useState<DiffReport | null>(null);
  const [mappingConfig, setMappingConfig] = useState<MappingConfig | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandHistory>(createEmptyHistory());
  const [activeTab, setActiveTab] = useState<Tab>("diff");
  const [selectedLegacyTable, setSelectedLegacyTable] = useState<string | null>(null);
  const [selectedTargetTable, setSelectedTargetTable] = useState<string | null>(null);
  const [isParsingLegacy, setIsParsingLegacy] = useState(false);
  const [isParsingTarget, setIsParsingTarget] = useState(false);
  const [parseProgressLegacy, setParseProgressLegacy] = useState(0);
  const [parseProgressTarget, setParseProgressTarget] = useState(0);

  const parseLegacyFile = async (file: File) => {
    setIsParsingLegacy(true);
    setParseProgressLegacy(100);
    // placeholder implementation
    setIsParsingLegacy(false);
  };

  const parseTargetFile = async (file: File) => {
    setIsParsingTarget(true);
    setParseProgressTarget(100);
    // placeholder implementation
    setIsParsingTarget(false);
  };

  return (
    <MigrationContext.Provider
      value={{
        session,
        setSession,
        legacyGraph,
        targetGraph,
        diffReport,
        mappingConfig,
        validationReport,
        commandHistory,
        activeTab,
        setActiveTab,
        selectedLegacyTable,
        selectedTargetTable,
        isParsingLegacy,
        isParsingTarget,
        parseProgressLegacy,
        parseProgressTarget,
        parseLegacyFile,
        parseTargetFile,
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
}

export function useMigrationContext() {
  const ctx = useContext(MigrationContext);
  if (!ctx) throw new Error("useMigrationContext must be used within MigrationProvider");
  return ctx;
}
