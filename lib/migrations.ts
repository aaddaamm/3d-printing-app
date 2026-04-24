import type Database from "better-sqlite3";

export interface Migration {
  id: number;
  description: string;
  up: (db: Database.Database) => void;
}

interface TableInfoRow {
  name: string;
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
  return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
}

export function columnExists(
  db: Database.Database,
  tableName: string,
  columnName: string,
): boolean {
  return (db.prepare(`PRAGMA table_info(${tableName})`).all() as TableInfoRow[]).some(
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
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
}

export function dropColumnIfExists(
  db: Database.Database,
  tableName: string,
  columnName: string,
): void {
  if (!columnExists(db, tableName, columnName)) return;
  db.exec(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`);
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
