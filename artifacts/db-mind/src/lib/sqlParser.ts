export type SchemaGraph = {
  tables: Map<string, TableNode>;
  totalTables: number;
  totalRows: number;
  parseWarnings: string[];
};

export type TableNode = {
  qualifiedName: string;
  schema: string;
  name: string;
  columns: ColumnNode[];
  primaryKey?: string[];
  foreignKeys: ForeignKey[];
  uniqueConstraints: string[][];
  checkConstraints: string[];
  rowCount: number;
  previewRows: any[];
};

export type ColumnNode = {
  name: string;
  dataType: { base: string; precision?: number; scale?: number };
  isNullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
};

export type ForeignKey = {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: string;
  onUpdate?: string;
};

export function parseSql(sqlText: string): SchemaGraph {
  // A simplified placeholder implementation
  const graph: SchemaGraph = {
    tables: new Map(),
    totalTables: 0,
    totalRows: 0,
    parseWarnings: [],
  };

  const statements = sqlText.split(/;(?=(?:[^']*'[^']*')*[^']*$)/g).map((s) => s.trim()).filter((s) => s.length > 0);

  for (const stmt of statements) {
    if (stmt.toUpperCase().startsWith("CREATE TABLE")) {
      const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_".]+)/i);
      if (match) {
        let rawName = match[1].replace(/"/g, "");
        let schema = "public";
        let name = rawName;
        if (rawName.includes(".")) {
          const parts = rawName.split(".");
          schema = parts[0];
          name = parts[1];
        }
        const qualifiedName = `${schema}.${name}`;
        graph.tables.set(qualifiedName, {
          qualifiedName,
          schema,
          name,
          columns: [],
          foreignKeys: [],
          uniqueConstraints: [],
          checkConstraints: [],
          rowCount: 0,
          previewRows: [],
        });
      } else {
        graph.parseWarnings.push("Could not parse table name: " + stmt.substring(0, 50));
      }
    }
  }

  graph.totalTables = graph.tables.size;
  return graph;
}
