import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runDatabaseMigrations } from "../lib/db/migrations-list.js";

type Row = Record<string, unknown>;

let tempDir = "";
let dbPath = "";
let database: Database.Database | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

function columnNames(tableName: string): string[] {
  return database!
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((row) => (row as { name: string }).name);
}

function createLegacySchema(): void {
  database!.exec(`
    CREATE TABLE print_tasks (
      id TEXT PRIMARY KEY,
      deviceId TEXT,
      deviceName TEXT,
      deviceModel TEXT,
      raw_json TEXT NOT NULL
    );
    CREATE TABLE jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      deviceId TEXT,
      deviceModel TEXT
    );
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      customer TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      inserted INTEGER,
      updated INTEGER,
      error TEXT
    );
    CREATE TABLE job_filaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      instanceId INTEGER,
      filament_type TEXT,
      filament_id TEXT,
      color TEXT,
      weight_g REAL,
      ams_id INTEGER,
      slot_id INTEGER
    );
    CREATE TABLE labor_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hourly_rate REAL NOT NULL DEFAULT 25.0,
      minimum_minutes REAL NOT NULL DEFAULT 15.0,
      profit_markup_pct REAL NOT NULL DEFAULT 0.20
    );
  `);
}

describe.sequential("provider-aware schema migration", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "provider-schema-"));
    dbPath = path.join(tempDir, "test.sqlite");
    database = new Database(dbPath);
  });

  afterEach(() => {
    database?.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    database = null;
  });

  it("adds provider identity columns and backfills existing Bambu rows", () => {
    createLegacySchema();
    database!
      .prepare(
        "INSERT INTO print_tasks (id, deviceId, deviceName, deviceModel, raw_json) VALUES (?, ?, ?, ?, ?)",
      )
      .run("task-1", "device-1", "Shop P1S", "P1S", "{}");
    database!
      .prepare("INSERT INTO jobs (session_id, deviceId, deviceModel) VALUES (?, ?, ?)")
      .run("task-1", "device-1", "P1S");

    runDatabaseMigrations(database!);
    runDatabaseMigrations(database!);

    expect(columnNames("print_tasks")).toEqual(
      expect.arrayContaining(["provider", "provider_task_id", "provider_printer_id", "printer_id"]),
    );
    expect(columnNames("jobs")).toEqual(
      expect.arrayContaining([
        "provider",
        "provider_session_id",
        "provider_printer_id",
        "printer_id",
      ]),
    );
    expect(columnNames("sync_log")).toEqual(
      expect.arrayContaining(["provider", "provider_printer_id"]),
    );
    expect(columnNames("printers")).toEqual(
      expect.arrayContaining(["is_active", "retired_at", "notes"]),
    );
    expect(columnNames("job_filaments")).toContain("material_usage_confidence");

    expect(database!.prepare("SELECT id, display_name FROM providers").all()).toContainEqual({
      id: "bambu",
      display_name: "Bambu Lab",
    });

    const task = database!.prepare("SELECT * FROM print_tasks WHERE id = ?").get("task-1") as Row;
    const job = database!.prepare("SELECT * FROM jobs WHERE session_id = ?").get("task-1") as Row;
    const printer = database!
      .prepare(
        "SELECT id, provider, provider_printer_id, name, model, is_active, retired_at FROM printers",
      )
      .get() as Row;

    expect(task).toMatchObject({
      provider: "bambu",
      provider_task_id: "task-1",
      provider_printer_id: "device-1",
    });
    expect(job).toMatchObject({
      provider: "bambu",
      provider_session_id: "task-1",
      provider_printer_id: "device-1",
    });
    expect(printer).toMatchObject({
      provider: "bambu",
      provider_printer_id: "device-1",
      name: "Shop P1S",
      model: "P1S",
      is_active: 1,
      retired_at: null,
    });
    expect(task["printer_id"]).toBe(printer["id"]);
    expect(job["printer_id"]).toBe(printer["id"]);
  });
});
