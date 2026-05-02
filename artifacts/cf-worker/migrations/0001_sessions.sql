-- DB-MIND ULTRA — D1 (SQLite) Migration
-- Apply with: wrangler d1 migrations apply db-mind-ultra --remote

CREATE TABLE IF NOT EXISTS sessions (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'new',
  legacy_schema    TEXT,
  target_schema    TEXT,
  mapping_config   TEXT,
  validation_report TEXT,
  command_history  TEXT NOT NULL DEFAULT '[]',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions (created_at);
