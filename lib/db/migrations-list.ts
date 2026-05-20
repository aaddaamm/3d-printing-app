import type Database from "better-sqlite3";
import {
  addColumnIfMissing,
  columnExists,
  dropColumnIfExists,
  runMigrations,
  sqliteVersionAtLeast,
  tableExists,
  type Migration,
} from "../migrations.js";
import { LABOR_BUFFER_MIGRATION } from "./labor-config.js";

const DB_MIGRATIONS: Migration[] = [
  {
    id: 1,
    description: "rename legacy tasks table to print_tasks",
    up(database) {
      const hasOldTable = tableExists(database, "tasks");
      const hasNewTable = tableExists(database, "print_tasks");
      if (hasOldTable && hasNewTable) database.exec("DROP TABLE tasks");
      else if (hasOldTable) database.exec("ALTER TABLE tasks RENAME TO print_tasks");
    },
  },
  {
    id: 2,
    description: "rebuild very old jobs table without session_id",
    up(database) {
      if (!tableExists(database, "jobs") || columnExists(database, "jobs", "session_id")) return;
      database.exec("DROP TABLE jobs");
      database.exec(`CREATE TABLE jobs (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id     TEXT UNIQUE NOT NULL,
        instanceId     INTEGER,
        print_run      INTEGER NOT NULL DEFAULT 1,
        designId       TEXT,
        designTitle    TEXT,
        modelId        TEXT,
        deviceId       TEXT,
        deviceModel    TEXT,
        startTime      TEXT,
        endTime        TEXT,
        total_weight_g REAL,
        total_time_s   INTEGER,
        plate_count    INTEGER,
        status         TEXT,
        customer       TEXT,
        notes          TEXT,
        price_override REAL,
        project_id     INTEGER REFERENCES projects(id),
        status_override TEXT,
        extra_labor_minutes REAL
      )`);
    },
  },
  {
    id: 3,
    description: "add normalized print_tasks columns",
    up(database) {
      for (const [columnName, columnDefinition] of [
        ["session_id", "TEXT"],
        ["instanceId", "INTEGER"],
        ["plateIndex", "INTEGER"],
        ["deviceModel", "TEXT"],
        ["title", "TEXT"],
        ["failedType", "INTEGER"],
        ["bedType", "TEXT"],
      ] as const) {
        addColumnIfMissing(database, "print_tasks", columnName, columnDefinition);
      }
    },
  },
  {
    id: 4,
    description: "add auto-project source design id",
    up(database) {
      addColumnIfMissing(database, "projects", "source_design_id", "TEXT");
      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_source_design_id ON projects(source_design_id) WHERE source_design_id IS NOT NULL",
      );
    },
  },
  {
    id: 5,
    description: "add model id to jobs",
    up(database) {
      addColumnIfMissing(database, "jobs", "modelId", "TEXT");
    },
  },
  {
    id: 6,
    description: "add job project and override fields",
    up(database) {
      addColumnIfMissing(database, "jobs", "project_id", "INTEGER REFERENCES projects(id)");
      addColumnIfMissing(database, "jobs", "status_override", "TEXT");
      addColumnIfMissing(database, "jobs", "extra_labor_minutes", "REAL");
    },
  },
  {
    id: 7,
    description: "drop legacy print_tasks pricing columns",
    up(database) {
      const sqliteVersion = (
        database.prepare("SELECT sqlite_version() AS v").get() as { v: string }
      ).v;
      if (!sqliteVersionAtLeast(sqliteVersion, "3.35.0")) return;
      for (const columnName of ["material_cost", "labor_cost", "price", "notes", "customer"]) {
        dropColumnIfExists(database, "print_tasks", columnName);
      }
    },
  },
  {
    id: 8,
    description: "add precomputed price cache tables",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS job_price_cache (
        job_id      INTEGER PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
        final_price REAL NOT NULL,
        computed_at TEXT NOT NULL
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS project_price_cache (
        project_id  INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
        final_price REAL NOT NULL,
        computed_at TEXT NOT NULL
      )`);
    },
  },
  LABOR_BUFFER_MIGRATION,
];

export function runDatabaseMigrations(database: Database.Database): void {
  runMigrations(database, DB_MIGRATIONS);
}
