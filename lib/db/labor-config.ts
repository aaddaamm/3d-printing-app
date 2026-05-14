import type Database from "better-sqlite3";
import { addColumnIfMissing, type Migration } from "../migrations.js";

export const LABOR_CONFIG_TABLE_SQL = `CREATE TABLE IF NOT EXISTS labor_config (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),
  hourly_rate         REAL NOT NULL DEFAULT 25.0,
  minimum_minutes     REAL NOT NULL DEFAULT 15.0,
  profit_markup_pct   REAL NOT NULL DEFAULT 0.20,
  failure_buffer_pct  REAL NOT NULL DEFAULT 0.00,
  overhead_buffer_pct REAL NOT NULL DEFAULT 0.00
)`;

export const LABOR_BUFFER_MIGRATION: Migration = {
  id: 9,
  description: "add labor failure and overhead buffers",
  up(database) {
    addColumnIfMissing(
      database,
      "labor_config",
      "failure_buffer_pct",
      "REAL NOT NULL DEFAULT 0.00",
    );
    addColumnIfMissing(
      database,
      "labor_config",
      "overhead_buffer_pct",
      "REAL NOT NULL DEFAULT 0.00",
    );
  },
};

export function seedLaborConfig(database: Database.Database): void {
  if ((database.prepare("SELECT COUNT(*) AS n FROM labor_config").get() as { n: number }).n > 0) {
    return;
  }

  database
    .prepare(
      "INSERT INTO labor_config (id, hourly_rate, minimum_minutes, profit_markup_pct, failure_buffer_pct, overhead_buffer_pct) VALUES (1, 25.0, 15.0, 0.20, 0.00, 0.00)",
    )
    .run();
}
