import type Database from "better-sqlite3";

export interface Migration {
  id: number;
  description: string;
  up: (db: Database.Database) => void;
}

interface TableInfoRow {
  name: string;
}

function assertSafeIdentifier(identifier: string, kind: "table" | "column"): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe ${kind} identifier: ${identifier}`);
  }
}

function safeIdentifier(identifier: string, kind: "table" | "column"): string {
  assertSafeIdentifier(identifier, kind);
  return identifier;
}

const SAFE_COLUMN_DEFINITION_RE =
  /^(?:INTEGER|REAL|TEXT|BLOB|NUMERIC)(?:\s+(?:NOT\s+NULL|UNIQUE|PRIMARY\s+KEY))*?(?:\s+DEFAULT\s+(?:NULL|[-+]?\d+(?:\.\d+)?|"[^"]*"|'[^']*'))?(?:\s+REFERENCES\s+[A-Za-z_][A-Za-z0-9_]*\s*\([A-Za-z_][A-Za-z0-9_]*\))?$/i;

function assertSafeColumnDefinition(definition: string): void {
  const trimmed = definition.trim();
  if (!trimmed) throw new Error("Column definition must not be empty");
  if (/[;\0]/.test(trimmed)) {
    throw new Error(`Unsafe column definition: ${definition}`);
  }
  if (/--|\/\*/.test(trimmed)) {
    throw new Error(`Unsafe column definition comments are not allowed: ${definition}`);
  }
  if (!SAFE_COLUMN_DEFINITION_RE.test(trimmed)) {
    throw new Error(`Unsafe or unsupported column definition: ${definition}`);
  }
}

export function sqliteVersionAtLeast(version: string, minimum: string): boolean {
  const parse = (v: string) => v.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(version);
  const b = parse(minimum);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return true;
}

export function tableExists(db: Database.Database, tableName: string): boolean {
  return Boolean(
    db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?").get(tableName),
  );
}

export function columnExists(
  db: Database.Database,
  tableName: string,
  columnName: string,
): boolean {
  const safeTableName = safeIdentifier(tableName, "table");
  return (db.prepare(`PRAGMA table_info(${safeTableName})`).all() as TableInfoRow[]).some(
    (row) => row.name === columnName,
  );
}

export function addColumnIfMissing(
  db: Database.Database,
  tableName: string,
  columnName: string,
  columnDefinition: string,
): void {
  if (columnExists(db, tableName, columnName)) return;
  const safeTableName = safeIdentifier(tableName, "table");
  const safeColumnName = safeIdentifier(columnName, "column");
  assertSafeColumnDefinition(columnDefinition);
  db.exec(`ALTER TABLE ${safeTableName} ADD COLUMN ${safeColumnName} ${columnDefinition}`);
}

export function dropColumnIfExists(
  db: Database.Database,
  tableName: string,
  columnName: string,
): void {
  if (!columnExists(db, tableName, columnName)) return;
  const safeTableName = safeIdentifier(tableName, "table");
  const safeColumnName = safeIdentifier(columnName, "column");
  db.exec(`ALTER TABLE ${safeTableName} DROP COLUMN ${safeColumnName}`);
}

export function runMigrations(db: Database.Database, migrations: Migration[]): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);

  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: number }[]).map((row) => row.id),
  );

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    db.transaction(() => {
      migration.up(db);
      db.prepare(
        "INSERT INTO schema_migrations (id, description, applied_at) VALUES (?, ?, ?)",
      ).run(migration.id, migration.description, new Date().toISOString());
    })();
  }
}
