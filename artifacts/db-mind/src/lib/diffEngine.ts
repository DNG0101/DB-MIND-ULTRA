import { SchemaGraph } from "./sqlParser";

export type DiffReport = {
  summary: { tablesAdded: number; tablesRemoved: number; tablesModified: number; tablesRenamed: number; tablesIdentical: number };
  tableDiffs: Map<string, TableDiff>;
};

export type TableDiffState = "ADDED" | "REMOVED" | "MODIFIED" | "RENAMED" | "IDENTICAL";
export type ColumnDiffState = "ADDED" | "REMOVED" | "MODIFIED" | "RENAMED" | "IDENTICAL";

export type TableDiff = {
  legacyTable?: string;
  targetTable?: string;
  state: TableDiffState;
  columnDiffs: ColumnDiff[];
};

export type ColumnDiff = {
  column: string;
  state: ColumnDiffState;
  legacyColumn?: string;
  targetColumn?: string;
  changes: string[];
};

export function computeDiff(legacy: SchemaGraph, target: SchemaGraph): DiffReport {
  const report: DiffReport = {
    summary: { tablesAdded: 0, tablesRemoved: 0, tablesModified: 0, tablesRenamed: 0, tablesIdentical: 0 },
    tableDiffs: new Map(),
  };

  for (const [legacyName, _legacyTable] of legacy.tables.entries()) {
    if (target.tables.has(legacyName)) {
      report.tableDiffs.set(legacyName, {
        legacyTable: legacyName,
        targetTable: legacyName,
        state: "IDENTICAL",
        columnDiffs: [],
      });
      report.summary.tablesIdentical++;
    } else {
      report.tableDiffs.set(legacyName, {
        legacyTable: legacyName,
        state: "REMOVED",
        columnDiffs: [],
      });
      report.summary.tablesRemoved++;
    }
  }

  for (const [targetName, _targetTable] of target.tables.entries()) {
    if (!legacy.tables.has(targetName)) {
      report.tableDiffs.set(targetName, {
        targetTable: targetName,
        state: "ADDED",
        columnDiffs: [],
      });
      report.summary.tablesAdded++;
    }
  }

  return report;
}
