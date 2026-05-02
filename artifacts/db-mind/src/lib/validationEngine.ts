import { SchemaGraph } from "./sqlParser";
import { MappingConfig } from "./mappingEngine";

export type ValidationReport = {
  passed: number;
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
};

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  title: string;
  description: string;
  impact: string;
  suggestedFix: string;
  autoFixable: boolean;
  affectedTable?: string;
  affectedColumn?: string;
};

export function validateMapping(target: SchemaGraph, mapping: MappingConfig): ValidationReport {
  return {
    passed: 10,
    warnings: [],
    errors: []
  };
}
