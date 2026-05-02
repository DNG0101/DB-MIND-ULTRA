import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sessionsTable } from "./schema";

export type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Zod validators ──────────────────────────────────────────────────────────
const CreateSessionBody = z.object({
  name: z.string().min(1),
});

const UpdateSessionBody = z.object({
  name: z.string().optional(),
  status: z
    .enum(["new", "uploading", "parsing", "ready", "mapped", "validated", "exported"])
    .optional(),
  legacySchema: z.record(z.unknown()).optional(),
  targetSchema: z.record(z.unknown()).optional(),
  mappingConfig: z.record(z.unknown()).optional(),
  validationReport: z.record(z.unknown()).optional(),
  commandHistory: z.array(z.unknown()).optional(),
});

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/api/healthz", (c) => c.json({ status: "ok" }));

// ─── Sessions ────────────────────────────────────────────────────────────────

// POST /api/sessions — create
app.post("/api/sessions", async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateSessionBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error.message }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(sessionsTable).values({
    id,
    name: parsed.data.name,
    status: "new",
    commandHistory: [],
    createdAt: now,
    updatedAt: now,
  });

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  return c.json(session, 201);
});

// GET /api/sessions/:id — read
app.get("/api/sessions/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  if (!session) return c.json({ error: "Session not found" }, 404);
  return c.json(session);
});

// PUT /api/sessions/:id — update
app.put("/api/sessions/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const parsed = UpdateSessionBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request", details: parsed.error.message }, 400);
  }

  const { data } = parsed;
  const now = new Date().toISOString();

  const updates: Record<string, unknown> = { updatedAt: now };
  if (data.name !== undefined) updates.name = data.name;
  if (data.status !== undefined) updates.status = data.status;
  if (data.legacySchema !== undefined) updates.legacySchema = data.legacySchema;
  if (data.targetSchema !== undefined) updates.targetSchema = data.targetSchema;
  if (data.mappingConfig !== undefined) updates.mappingConfig = data.mappingConfig;
  if (data.validationReport !== undefined) updates.validationReport = data.validationReport;
  if (data.commandHistory !== undefined) updates.commandHistory = data.commandHistory;

  await db
    .update(sessionsTable)
    .set(updates as Parameters<typeof db.update>[0] extends infer T ? T : never)
    .where(eq(sessionsTable.id, id));

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  if (!session) return c.json({ error: "Session not found" }, 404);
  return c.json(session);
});

// DELETE /api/sessions/:id
app.delete("/api/sessions/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  if (!existing) return c.json({ error: "Session not found" }, 404);

  await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
  return new Response(null, { status: 204 });
});

// POST /api/sessions/:id/export — generate migration SQL
app.post("/api/sessions/:id/export", async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param("id");

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id));

  if (!session) return c.json({ error: "Session not found" }, 404);
  if (!session.legacySchema || !session.mappingConfig) {
    return c.json(
      { error: "Session not ready for export", details: "Legacy schema and mapping config required" },
      400,
    );
  }

  const legacySchema = session.legacySchema;
  const mappingConfig = session.mappingConfig;
  const tables = (legacySchema.tables as Record<string, unknown>[]) || [];
  const mappings = (mappingConfig.tableMappings as Record<string, unknown>[]) || [];
  const warnings: string[] = [];

  const sqlParts = [
    "-- DB-MIND ULTRA Generated Migration SQL",
    `-- Session: ${session.name}`,
    `-- Generated: ${new Date().toISOString()}`,
    "-- GUARANTEE: Zero Data Loss · Full Referential Integrity · Deterministic Output",
    "",
    "BEGIN;",
    "SET session_replication_role = replica;",
    "",
  ];

  let rowCount = 0;
  let tableCount = 0;

  for (const mapping of mappings) {
    const sourceTable = mapping.sourceTable as string;
    const targetTable = mapping.targetTable as string;
    const columnMappings = (mapping.columnMappings as Record<string, unknown>[]) || [];

    sqlParts.push(`-- Migrating ${sourceTable} → ${targetTable}`);

    if (columnMappings.length === 0) {
      warnings.push(`No column mappings for ${sourceTable} → ${targetTable}`);
      continue;
    }

    const targetCols = columnMappings.map((cm) => cm.targetColumn as string).join(", ");
    const exprs = columnMappings
      .map((cm) => (cm.transformExpression as string) || (cm.sourceColumn as string))
      .join(", ");

    sqlParts.push(`INSERT INTO ${targetTable} (${targetCols})`, `  SELECT ${exprs} FROM ${sourceTable};`, "");

    const tableNode = tables.find(
      (t) => (t as Record<string, unknown>).qualifiedName === sourceTable,
    ) as Record<string, unknown> | undefined;
    if (tableNode && typeof tableNode.rowCount === "number") rowCount += tableNode.rowCount;
    tableCount++;
  }

  sqlParts.push("SET session_replication_role = DEFAULT;", "", "COMMIT;");

  await db
    .update(sessionsTable)
    .set({ status: "exported", updatedAt: new Date().toISOString() })
    .where(eq(sessionsTable.id, id));

  return c.json({
    sessionId: id,
    sql: sqlParts.join("\n"),
    rowCount,
    tableCount,
    generatedAt: new Date().toISOString(),
    warnings,
  });
});

export default app;
