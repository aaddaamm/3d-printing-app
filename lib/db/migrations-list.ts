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
  {
    id: 10,
    description: "add provider-aware print history schema",
    up(database) {
      database.exec(`CREATE TABLE IF NOT EXISTS providers (
        id           TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      database.exec(`CREATE TABLE IF NOT EXISTS printers (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        provider            TEXT NOT NULL REFERENCES providers(id),
        provider_printer_id TEXT NOT NULL,
        name                TEXT,
        model               TEXT,
        serial              TEXT,
        created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_printer_id)
      )`);
      database.exec("CREATE INDEX IF NOT EXISTS idx_printers_provider ON printers(provider)");
      database
        .prepare("INSERT OR IGNORE INTO providers (id, display_name) VALUES (?, ?)")
        .run("bambu", "Bambu Lab");

      for (const [tableName, columns] of [
        [
          "print_tasks",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_task_id", "TEXT"],
            ["provider_printer_id", "TEXT"],
            ["printer_id", "INTEGER REFERENCES printers(id)"],
          ],
        ],
        [
          "jobs",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_session_id", "TEXT"],
            ["provider_printer_id", "TEXT"],
            ["printer_id", "INTEGER REFERENCES printers(id)"],
          ],
        ],
        [
          "sync_log",
          [
            ["provider", "TEXT NOT NULL DEFAULT 'bambu'"],
            ["provider_printer_id", "TEXT"],
          ],
        ],
      ] as const) {
        for (const [columnName, columnDefinition] of columns) {
          addColumnIfMissing(database, tableName, columnName, columnDefinition);
        }
      }

      database.exec("UPDATE print_tasks SET provider_task_id = id WHERE provider_task_id IS NULL");
      database.exec(
        "UPDATE print_tasks SET provider_printer_id = deviceId WHERE provider_printer_id IS NULL AND deviceId IS NOT NULL",
      );
      database.exec(
        "INSERT OR IGNORE INTO printers (provider, provider_printer_id, name, model) SELECT 'bambu', deviceId, MAX(deviceName), MAX(deviceModel) FROM print_tasks WHERE deviceId IS NOT NULL AND deviceId != '' GROUP BY deviceId",
      );
      database.exec(
        "UPDATE print_tasks SET printer_id = (SELECT p.id FROM printers p WHERE p.provider = print_tasks.provider AND p.provider_printer_id = print_tasks.provider_printer_id) WHERE printer_id IS NULL AND provider_printer_id IS NOT NULL",
      );
      database.exec(
        "UPDATE jobs SET provider_session_id = session_id WHERE provider_session_id IS NULL",
      );
      database.exec(
        "UPDATE jobs SET provider_printer_id = deviceId WHERE provider_printer_id IS NULL AND deviceId IS NOT NULL",
      );
      database.exec(
        "UPDATE jobs SET printer_id = (SELECT p.id FROM printers p WHERE p.provider = jobs.provider AND p.provider_printer_id = jobs.provider_printer_id) WHERE printer_id IS NULL AND provider_printer_id IS NOT NULL",
      );

      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_print_tasks_provider_task ON print_tasks(provider, provider_task_id) WHERE provider_task_id IS NOT NULL",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_print_tasks_provider_printer ON print_tasks(provider, provider_printer_id)",
      );
      database.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_provider_session ON jobs(provider, provider_session_id) WHERE provider_session_id IS NOT NULL",
      );
      database.exec(
        "CREATE INDEX IF NOT EXISTS idx_jobs_provider_printer ON jobs(provider, provider_printer_id)",
      );
    },
  },
  {
    id: 11,
    description: "add printer inventory lifecycle fields",
    up(database) {
      addColumnIfMissing(database, "printers", "is_active", "INTEGER NOT NULL DEFAULT 1");
      addColumnIfMissing(database, "printers", "retired_at", "TEXT");
      addColumnIfMissing(database, "printers", "notes", "TEXT");
      database.exec("CREATE INDEX IF NOT EXISTS idx_printers_active ON printers(is_active)");
    },
  },
  {
    id: 12,
    description: "add material usage confidence to filament rows",
    up(database) {
      if (!tableExists(database, "job_filaments")) return;
      addColumnIfMissing(
        database,
        "job_filaments",
        "material_usage_confidence",
        "TEXT NOT NULL DEFAULT 'unknown'",
      );
    },
  },
];

export function runDatabaseMigrations(database: Database.Database): void {
  runMigrations(database, DB_MIGRATIONS);
}
