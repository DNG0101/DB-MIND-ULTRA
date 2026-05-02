import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("new"),
  legacySchema: text("legacy_schema", { mode: "json" }).$type<
    Record<string, unknown>
  >(),
  targetSchema: text("target_schema", { mode: "json" }).$type<
    Record<string, unknown>
  >(),
  mappingConfig: text("mapping_config", { mode: "json" }).$type<
    Record<string, unknown>
  >(),
  validationReport: text("validation_report", { mode: "json" }).$type<
    Record<string, unknown>
  >(),
  commandHistory: text("command_history", { mode: "json" })
    .$type<unknown[]>()
    .notNull()
    .default(sql`('[]')`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
