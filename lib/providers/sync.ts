import type Database from "better-sqlite3";
import { normalizedRecordToPrintTask } from "./normalized-task.js";
import type { HistorySyncResult, PrinterIdentity, ProviderDefinition } from "./types.js";
import type { PrintTask } from "../types.js";

type UpsertTask = { run: (row: PrintTask) => unknown };
type ExistingTask = Record<string, unknown>;

const PROVIDER_REFRESH_IGNORED_FIELDS = new Set(["cover", "thumbnail", "raw_json", "session_id"]);

export type ProviderHistoryStoreResult = {
  inserted: number;
  updated: number;
};

function upsertProvider(database: Database.Database, provider: ProviderDefinition): void {
  database
    .prepare("INSERT OR IGNORE INTO providers (id, display_name) VALUES (?, ?)")
    .run(provider.id, provider.display_name);
}

function upsertPrinter(database: Database.Database, printer: PrinterIdentity): number {
  database
    .prepare(
      `INSERT INTO printers (provider, provider_printer_id, name, model, serial, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(provider, provider_printer_id) DO UPDATE SET
         name=excluded.name,
         model=excluded.model,
         serial=excluded.serial,
         updated_at=CURRENT_TIMESTAMP`,
    )
    .run(
      printer.provider_id,
      printer.provider_printer_id,
      printer.name ?? null,
      printer.model ?? null,
      printer.serial ?? null,
    );

  const row = database
    .prepare<
      [string, string],
      { id: number }
    >("SELECT id FROM printers WHERE provider = ? AND provider_printer_id = ?")
    .get(printer.provider_id, printer.provider_printer_id);

  if (!row)
    throw new Error(
      `Unable to upsert printer ${printer.provider_id}:${printer.provider_printer_id}`,
    );
  return row.id;
}

function normalizedValue(value: unknown): unknown {
  return value === undefined ? null : value;
}

function hasMaintenanceRelevantChange(existing: ExistingTask | undefined, row: PrintTask): boolean {
  if (!existing) return true;
  for (const [field, value] of Object.entries(row)) {
    if (PROVIDER_REFRESH_IGNORED_FIELDS.has(field)) continue;
    if (!(field in existing)) continue;
    if (normalizedValue(existing[field]) !== normalizedValue(value)) return true;
  }
  return false;
}

function insertBatch(
  database: Database.Database,
  upsertTask: UpsertTask,
  rows: PrintTask[],
): ProviderHistoryStoreResult {
  const countTasks = database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM print_tasks");
  const getExistingTask = database.prepare<[string], ExistingTask>(
    "SELECT * FROM print_tasks WHERE id = ?",
  );

  return database.transaction((batch: PrintTask[]) => {
    const before = countTasks.get()!.n;
    let changed = 0;
    for (const row of batch) {
      const existing = getExistingTask.get(row.id);
      const maintenanceRelevantChange = hasMaintenanceRelevantChange(existing, row);
      upsertTask.run(row);
      if (maintenanceRelevantChange) changed += 1;
    }
    const inserted = countTasks.get()!.n - before;
    return { inserted, updated: changed - inserted };
  })(rows);
}

export function storeProviderHistory(
  database: Database.Database,
  upsertTask: UpsertTask,
  provider: ProviderDefinition,
  result: HistorySyncResult,
): ProviderHistoryStoreResult {
  upsertProvider(database, provider);

  const printerIds = new Map<string, number>();
  for (const printer of result.printers) {
    printerIds.set(
      `${printer.provider_id}:${printer.provider_printer_id}`,
      upsertPrinter(database, printer),
    );
  }

  const rows = result.records.map((record) => {
    const printerKey = record.provider_printer_id
      ? `${record.provider_id}:${record.provider_printer_id}`
      : null;
    const printerId = printerKey ? (printerIds.get(printerKey) ?? null) : null;
    return normalizedRecordToPrintTask(record, printerId);
  });

  return insertBatch(database, upsertTask, rows);
}
