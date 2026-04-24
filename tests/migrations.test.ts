import { describe, expect, it, vi } from "vitest";
import {
  addColumnIfMissing,
  columnExists,
  dropColumnIfExists,
  runMigrations,
  sqliteVersionAtLeast,
  tableExists,
  type Migration,
} from "../lib/migrations.js";

type Row = Record<string, unknown>;

class FakeDb {
  tables = new Map<string, Set<string>>();
  migrations: Row[] = [];

  exec(sql: string): void {
    const normalized = sql.trim().replace(/\s+/g, " ");
    const create = normalized.match(/^CREATE TABLE(?: IF NOT EXISTS)? (\w+) \((.+)\)$/i);
    if (create) {
      const tableName = create[1]!;
      const cols = create[2]!;
      const names = cols
        .split(",")
        .map((col) => col.trim().split(/\s+/)[0])
        .filter((name): name is string => !!name);
      if (!this.tables.has(tableName)) this.tables.set(tableName, new Set(names));
      return;
    }

    const add = normalized.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/i);
    if (add) {
      this.tables.get(add[1]!)?.add(add[2]!);
      return;
    }

    const drop = normalized.match(/^ALTER TABLE (\w+) DROP COLUMN (\w+)/i);
    if (drop) {
      this.tables.get(drop[1]!)?.delete(drop[2]!);
      return;
    }

    throw new Error(`Unsupported SQL in fake DB: ${sql}`);
  }

  prepare(sql: string) {
    if (sql.startsWith("SELECT 1 FROM sqlite_master")) {
      return { get: (tableName: string) => (this.tables.has(tableName) ? { 1: 1 } : undefined) };
    }
    if (sql.startsWith("PRAGMA table_info")) {
      const tableName = sql.match(/PRAGMA table_info\((\w+)\)/)?.[1] ?? "";
      return { all: () => [...(this.tables.get(tableName) ?? [])].map((name) => ({ name })) };
    }
    if (sql === "SELECT id FROM schema_migrations") {
      return { all: () => this.migrations.map(({ id }) => ({ id })) };
    }
    if (sql === "SELECT id FROM schema_migrations ORDER BY id") {
      return { all: () => this.migrations.map(({ id }) => ({ id })) };
    }
    if (sql.startsWith("INSERT INTO schema_migrations")) {
      return {
        run: (id: number, description: string, applied_at: string) => {
          this.migrations.push({ id, description, applied_at });
        },
      };
    }
    throw new Error(`Unsupported prepared SQL in fake DB: ${sql}`);
  }

  transaction<T extends () => void>(fn: T): T {
    return (() => {
      const tableSnapshot = new Map([...this.tables].map(([k, v]) => [k, new Set(v)]));
      const migrationSnapshot = this.migrations.map((row) => ({ ...row }));
      try {
        fn();
      } catch (e) {
        this.tables = tableSnapshot;
        this.migrations = migrationSnapshot;
        throw e;
      }
    }) as unknown as T;
  }
}

function fakeDb(): FakeDb & Parameters<typeof tableExists>[0] {
  return new FakeDb() as FakeDb & Parameters<typeof tableExists>[0];
}

describe("sqliteVersionAtLeast", () => {
  it("compares SQLite versions numerically instead of lexicographically", () => {
    expect(sqliteVersionAtLeast("3.9.0", "3.35.0")).toBe(false);
    expect(sqliteVersionAtLeast("3.35.0", "3.35.0")).toBe(true);
    expect(sqliteVersionAtLeast("3.46.1", "3.35.0")).toBe(true);
  });
});

describe("migration helpers", () => {
  it("detects tables and adds columns only when missing", () => {
    const database = fakeDb();
    database.exec("CREATE TABLE things (id INTEGER PRIMARY KEY)");

    expect(tableExists(database, "things")).toBe(true);
    expect(tableExists(database, "missing")).toBe(false);
    expect(columnExists(database, "things", "name")).toBe(false);

    addColumnIfMissing(database, "things", "name", "TEXT");
    addColumnIfMissing(database, "things", "name", "TEXT");

    expect(columnExists(database, "things", "name")).toBe(true);
    expect([...database.tables.get("things")!].filter((col) => col === "name")).toHaveLength(1);
  });

  it("drops columns only when present", () => {
    const database = fakeDb();
    database.exec("CREATE TABLE things (id INTEGER PRIMARY KEY, old_value TEXT)");

    dropColumnIfExists(database, "things", "old_value");
    dropColumnIfExists(database, "things", "old_value");

    expect(columnExists(database, "things", "old_value")).toBe(false);
  });
});

describe("runMigrations", () => {
  it("runs migrations once and records applied ids", () => {
    const database = fakeDb();
    const first = vi.fn((d: Parameters<Migration["up"]>[0]) =>
      d.exec("CREATE TABLE things (id INTEGER)"),
    );
    const second = vi.fn((d: Parameters<Migration["up"]>[0]) =>
      d.exec("ALTER TABLE things ADD COLUMN name TEXT"),
    );
    const migrations: Migration[] = [
      { id: 1, description: "create things", up: first },
      { id: 2, description: "add name", up: second },
    ];

    runMigrations(database, migrations);
    runMigrations(database, migrations);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(columnExists(database, "things", "name")).toBe(true);
    const applied = database.prepare("SELECT id FROM schema_migrations ORDER BY id");
    expect("all" in applied ? applied.all() : []).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("rolls back a failed migration and does not record it", () => {
    const database = fakeDb();
    const migrations: Migration[] = [
      {
        id: 1,
        description: "fails",
        up(d) {
          d.exec("CREATE TABLE partial (id INTEGER)");
          throw new Error("boom");
        },
      },
    ];

    expect(() => runMigrations(database, migrations)).toThrow("boom");
    expect(tableExists(database, "partial")).toBe(false);
    const applied = database.prepare("SELECT id FROM schema_migrations");
    expect("all" in applied ? applied.all() : []).toEqual([]);
  });
});
