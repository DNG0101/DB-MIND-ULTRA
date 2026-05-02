# DB-MIND ULTRA — PostgreSQL Migration Intelligence Platform

**Version:** 3.0 ENTERPRISE  
**Guarantee:** Zero Data Loss · Full Referential Integrity · Deterministic Output

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        MONOREPO (pnpm)                           │
│                                                                  │
│  artifacts/                  lib/                               │
│  ├── db-mind/               ├── api-client-react/               │
│  │   React + Vite UI        │   Generated React Query hooks     │
│  │   (Port: dynamic)        ├── api-zod/                        │
│  │                          │   Generated Zod validators        │
│  └── api-server/            ├── api-spec/                       │
│      Express REST API       │   OpenAPI + orval codegen config  │
│      (Port: 8080)           └── db/                             │
│                                 Drizzle ORM + migrations        │
│                                                                  │
│  PostgreSQL (DATABASE_URL)                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Frontend — `artifacts/db-mind/`

Built with **React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui**.  
Routing via **wouter**. State via React Context + TanStack Query.

```
src/
├── pages/
│   ├── upload.tsx          # Landing page — dual SQL file upload zones
│   └── session.tsx         # Main migration workspace
│
├── components/
│   ├── UploadZone.tsx      # Drag-drop file zone (amber=legacy, cyan=target)
│   ├── TableCard.tsx       # Expandable table with columns + data preview
│   ├── ColumnDiffRow.tsx   # Field-level diff comparison row
│   ├── MappingCanvas.tsx   # SVG drag-and-drop column mapping interface
│   ├── ValidationReport.tsx# Phase-by-phase validation result cards
│   ├── SqlOutput.tsx       # Syntax-highlighted generated SQL output
│   └── StatusBadge.tsx     # PENDING/UPLOADING/PARSING/READY/ERROR badges
│
├── context/
│   └── MigrationContext.tsx # Global migration state + actions
│
├── lib/                     # ALL CLIENT-SIDE ENGINES (run in browser)
│   ├── sqlParser.ts         # Streaming SQL tokenizer + CREATE TABLE parser
│   ├── diffEngine.ts        # Table/column diff with similarity scoring
│   ├── mappingEngine.ts     # Auto-mapping with confidence scores
│   ├── validationEngine.ts  # 4-phase validation pipeline
│   └── commandHistory.ts    # Undo/redo command stack (Ctrl+Z / Ctrl+Y)
│
└── App.tsx                  # Router — / and /session/:id
```

#### Client-Side Engine Data Flow

```
SQL File (browser)
      │
      ▼
sqlParser.ts          Tokenizes → classifies → parses CREATE TABLE / INSERT / COPY
      │               Outputs: SchemaGraph { tables, totalTables, totalRows, parseWarnings }
      ▼
diffEngine.ts         Legacy SchemaGraph + Target SchemaGraph
      │               → DiffReport { tableDiffs, summary }
      ▼
mappingEngine.ts      DiffReport + both SchemaGraphs
      │               → MappingConfig { tableMappings[{ sourceTable, targetTable,
      │                                  columnMappings[{ sourceColumn, targetColumn,
      │                                                   transformExpression }] }] }
      ▼
validationEngine.ts   MappingConfig + Target SchemaGraph
      │               → ValidationReport { passed, warnings[], errors[] }
      ▼
/api/sessions/:id/export   → Generated migration SQL
```

---

### 2. Backend API — `artifacts/api-server/`

Built with **Express + TypeScript + Drizzle ORM**.

```
src/
├── routes/
│   ├── health.ts      # GET  /api/healthz
│   └── sessions.ts    # CRUD /api/sessions + POST /api/sessions/:id/export
├── app.ts             # Express setup (CORS, JSON, pino logging)
└── index.ts           # Server entry point
```

#### REST API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/sessions` | Create migration session |
| GET | `/api/sessions/:id` | Load session |
| PUT | `/api/sessions/:id` | Save session state (schema, mapping, history) |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/sessions/:id/export` | Generate migration SQL |

---

### 3. Database — `lib/db/`

**PostgreSQL** via **Drizzle ORM**.

```sql
CREATE TABLE sessions (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  status          TEXT DEFAULT 'new',       -- new|uploading|parsing|ready|mapped|validated|exported
  legacy_schema   JSONB,                    -- Parsed SchemaGraph
  target_schema   JSONB,                    -- Parsed SchemaGraph
  mapping_config  JSONB,                    -- MappingConfig
  validation_report JSONB,                  -- ValidationReport
  command_history JSONB DEFAULT '[]',       -- Undo/redo history
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### 4. API Contract — `lib/api-spec/`

Contract-first approach using **OpenAPI 3.1 + orval** codegen:

```
lib/api-spec/openapi.yaml
      │
      ▼ pnpm --filter @workspace/api-spec run codegen
      │
      ├── lib/api-client-react/src/generated/api.ts
      │   React Query hooks: useCreateSession, useGetSession,
      │   useUpdateSession, useDeleteSession, useGenerateExport
      │
      └── lib/api-zod/src/generated/api.ts
          Zod validators: CreateSessionBody, UpdateSessionBody,
          GetSessionResponse, GenerateExportResponse, ...
```

---

## Data Types

```typescript
// Core schema representation (client-side)
interface SchemaGraph {
  tables: Map<string, TableNode>;
  totalTables: number;
  totalRows: number;
  parseWarnings: string[];
}

interface TableNode {
  qualifiedName: string;          // "public.users"
  schema: string;
  name: string;
  columns: ColumnNode[];
  primaryKey: string[];
  foreignKeys: ForeignKey[];
  uniqueConstraints: string[][];
  checkConstraints: string[];
  rowCount: number;
  previewRows: Record<string, unknown>[];
}

// Diff system
interface DiffReport {
  summary: { tablesAdded, tablesRemoved, tablesModified, tablesRenamed, tablesIdentical };
  tableDiffs: Map<string, TableDiff>;
}

// Mapping system
interface MappingConfig {
  tableMappings: TableMapping[];
}

interface TableMapping {
  sourceTable: string;
  targetTable: string;
  confidence: number;           // 0.0 – 1.0
  method: "auto" | "manual";
  columnMappings: ColumnMapping[];
}
```

---

## Diff Color System

| State | Color | Badge | Meaning |
|-------|-------|-------|---------|
| ADDED | `#22C55E` green | NEW | In target, absent in legacy |
| REMOVED | `#EF4444` red | DEL | In legacy, absent in target |
| MODIFIED | `#EAB308` yellow | MOD | Exists in both, structure differs |
| RENAMED | `#3B82F6` blue | REN | High similarity, name differs |
| IDENTICAL | `#6B7280` gray | OK | No differences |
| MAPPED | `#A855F7` purple | MAP | Manually linked |

---

## Migration Workspace Tabs

```
[DIFF] [MAPPING] [VALIDATE] [TRANSFORM] [OUTPUT]
```

| Tab | Function |
|-----|----------|
| DIFF | Side-by-side table/column comparison with diff badges |
| MAPPING | Drag-and-drop column mapping with SVG connection lines |
| VALIDATE | 4-phase validation: schema → data → consistency → edge cases |
| TRANSFORM | Preview INSERT/SELECT statements per table mapping |
| OUTPUT | Generated migration SQL with download button |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last mapping change |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Focus table search |
| `Ctrl+D` | Toggle diff view |
| `Ctrl+M` | Focus mapping panel |
| `Ctrl+Shift+E` | Open output/export panel |
| `Ctrl+Shift+V` | Run validation |
| `Escape` | Close active panel |

---

## System Guarantees

1. **Zero Data Loss** — Every mapped row appears in the output SQL
2. **Referential Integrity** — FK validation before export is permitted  
3. **Determinism** — Identical inputs → byte-for-byte identical SQL output  
4. **Original Immutability** — Uploaded files are never modified  
5. **Recoverability** — All mapping actions are undoable (last 50 operations)  
6. **Graceful Degradation** — No unhandled exceptions; every failure is user-actionable

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (set `DATABASE_URL` env var)

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
SESSION_SECRET=your-secret-key
```

### Install & Run
```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Run codegen (regenerate API hooks from OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen

# Start API server (development)
pnpm --filter @workspace/api-server run dev

# Start frontend (development)
pnpm --filter @workspace/db-mind run dev
```

### Regenerate API Client After Schema Changes
```bash
# Edit lib/api-spec/openapi.yaml, then:
pnpm --filter @workspace/api-spec run codegen
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | wouter |
| State / Data fetching | TanStack Query (React Query v5) |
| API client | orval-generated hooks |
| Backend | Express, TypeScript, pino (structured logging) |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL |
| API Spec | OpenAPI 3.1 |
| Validation | Zod |
| Package Manager | pnpm workspaces (monorepo) |
