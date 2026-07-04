import Database from "better-sqlite3";
import { afterEach, beforeEach, expect, it } from "vitest";
import { storeProviderHistory } from "../lib/providers/sync.js";
import type { NormalizedPrintRecord, ProviderDefinition } from "../lib/providers/types.js";
import type { PrintTask } from "../lib/types.js";

let database: Database.Database;

const provider: ProviderDefinition = {
  id: "moonraker",
  display_name: "Moonraker",
  capabilities: ["history:list"],
};

function record(raw: Record<string, unknown>, title = "Job 1"): NormalizedPrintRecord {
  return {
    provider_id: "moonraker",
    provider_record_id: "job-1",
    provider_printer_id: null,
    title,
    status: "finish",
    started_at: null,
    ended_at: null,
    duration_s: null,
    printer: null,
    materials: [],
    media: [],
    raw,
  };
}

beforeEach(() => {
  database = new Database(":memory:");
  database.exec(`
    CREATE TABLE providers (id TEXT PRIMARY KEY, display_name TEXT NOT NULL);
    CREATE TABLE print_tasks (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      provider_task_id TEXT,
      title TEXT,
      raw_json TEXT NOT NULL
    );
  `);
});

afterEach(() => {
  database.close();
});

it("does not count unchanged provider records as updates", () => {
  const upsertTask = database.prepare<PrintTask>(`
    INSERT INTO print_tasks (id, provider, provider_task_id, title, raw_json)
    VALUES (@id, @provider, @provider_task_id, @title, @raw_json)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, raw_json = excluded.raw_json
  `);
  const result = {
    provider_id: "moonraker",
    records: [record({ version: 1 })],
    printers: [],
    errors: [],
  };

  expect(storeProviderHistory(database, upsertTask, provider, result)).toEqual({
    inserted: 1,
    updated: 0,
  });
  expect(storeProviderHistory(database, upsertTask, provider, result)).toEqual({
    inserted: 0,
    updated: 0,
  });
  expect(
    storeProviderHistory(database, upsertTask, provider, {
      ...result,
      records: [record({ version: 2 })],
    }),
  ).toEqual({ inserted: 0, updated: 0 });
  expect(
    storeProviderHistory(database, upsertTask, provider, {
      ...result,
      records: [record({ version: 3 }, "Renamed Job")],
    }),
  ).toEqual({ inserted: 0, updated: 1 });
});
