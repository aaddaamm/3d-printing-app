import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type PrintersModule = typeof import("../models/printers.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let printersModule: PrintersModule | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshModules(): Promise<void> {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  dbModule = await import("../lib/db.js");
  printersModule = await import("../models/printers.js");
}

describe.sequential("printer inventory model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "printers-model-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    printersModule = null;
  });

  it("lists active and retired printers with historical job totals", () => {
    const db = dbModule!.db;
    db.prepare(
      `INSERT INTO printers (provider, provider_printer_id, name, model)
       VALUES (?, ?, ?, ?)`,
    ).run("bambu", "a1-mini", "A1 Mini", "A1 mini");
    const printerId = Number(db.prepare("SELECT id FROM printers").pluck().get());
    db.prepare(
      `INSERT INTO jobs (
        provider, provider_session_id, provider_printer_id, printer_id,
        session_id, print_run, deviceId, deviceModel, startTime,
        total_weight_g, total_time_s, plate_count, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "bambu",
      "session-1",
      "a1-mini",
      printerId,
      "session-1",
      1,
      "a1-mini",
      "A1 mini",
      "2026-01-01T00:00:00.000Z",
      42,
      3600,
      1,
      "finish",
    );

    const retired = printersModule!.patchPrinter(printerId, { is_active: false, notes: "Sold" });
    const rows = printersModule!.listPrinters();

    expect(retired).toMatchObject({ is_active: 0, notes: "Sold" });
    expect(retired?.retired_at).toEqual(expect.any(String));
    expect(rows[0]).toMatchObject({
      provider: "bambu",
      provider_display_name: "Bambu Lab",
      provider_printer_id: "a1-mini",
      job_count: 1,
      task_count: 0,
      total_time_s: 3600,
      total_weight_g: 42,
      is_active: 0,
    });
    expect(printersModule!.listPrinters({ includeRetired: false })).toEqual([]);
  });
});
