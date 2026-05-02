import { SchemaGraph } from "./sqlParser";

export type MappingConfig = {
  tableMappings: TableMapping[];
};

export type TableMapping = {
  sourceTable: string;
  targetTable: string;
  confidence: number;
  method: "auto" | "manual";
  columnMappings: ColumnMapping[];
};

export type ColumnMapping = {
  sourceColumn: string;
  targetColumn: string;
  transformExpression?: string;
  confidence: number;
};

export function autoMap(legacy: SchemaGraph, target: SchemaGraph): MappingConfig {
  const config: MappingConfig = { tableMappings: [] };
  
  for (const [name, legacyTable] of legacy.tables.entries()) {
    if (target.tables.has(name)) {
      config.tableMappings.push({
        sourceTable: name,
        targetTable: name,
        confidence: 1.0,
        method: "auto",
        columnMappings: [] // Todo fill
      });
    }
  }
  
  return config;
}
