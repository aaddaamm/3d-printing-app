import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type NormalizeModule = typeof import("../normalize.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let normalizeModule: NormalizeModule | null = null;

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
  normalizeModule = await import("../normalize.js");
}

describe.sequential("provider-aware normalization", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "provider-normalize-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    normalizeModule = null;
  });

  it("preserves existing Bambu printer links when legacy resync rows omit printer_id", () => {
    const db = dbModule!.db;
    db.prepare(
      `INSERT INTO printers (provider, provider_printer_id, name, model)
       VALUES (?, ?, ?, ?)`,
    ).run("bambu", "bambu-p1s-001", "Shop P1S", "P1S");
    const printerId = Number(db.prepare("SELECT id FROM printers").pluck().get());

    dbModule!.stmts.upsertTask.run({
      id: "1000",
      provider: "bambu",
      provider_task_id: "1000",
      provider_printer_id: "bambu-p1s-001",
      printer_id: printerId,
      session_id: null,
      instanceId: 9001,
      plateIndex: 1,
      deviceId: "bambu-p1s-001",
      deviceName: "Shop P1S",
      deviceModel: "P1S",
      designId: "design-1",
      designTitle: "Widget",
      modelId: null,
      profileId: null,
      title: "Widget plate 1",
      status: "finish",
      failedType: null,
      bedType: null,
      weight: 12.5,
      length: null,
      costTime: 1200,
      startTime: "2026-02-01T10:00:00.000Z",
      endTime: "2026-02-01T10:20:00.000Z",
      cover: null,
      thumbnail: null,
      raw_json: JSON.stringify({
        id: 1000,
        instanceId: 9001,
        deviceId: "bambu-p1s-001",
        deviceModel: "P1S",
        title: "Widget plate 1",
        status: 2,
        weight: 12.5,
        costTime: 1200,
        startTime: "2026-02-01T10:00:00.000Z",
        endTime: "2026-02-01T10:20:00.000Z",
      }),
    });

    dbModule!.stmts.upsertTask.run({
      id: "1000",
      provider: "bambu",
      provider_task_id: "1000",
      provider_printer_id: "bambu-p1s-001",
      printer_id: null,
      session_id: null,
      instanceId: 9001,
      plateIndex: 1,
      deviceId: "bambu-p1s-001",
      deviceName: "Shop P1S",
      deviceModel: "P1S",
      designId: "design-1",
      designTitle: "Widget",
      modelId: null,
      profileId: null,
      title: "Widget plate 1",
      status: "finish",
      failedType: null,
      bedType: null,
      weight: 12.5,
      length: null,
      costTime: 1200,
      startTime: "2026-02-01T10:00:00.000Z",
      endTime: "2026-02-01T10:20:00.000Z",
      cover: null,
      thumbnail: null,
      raw_json: JSON.stringify({
        id: 1000,
        instanceId: 9001,
        deviceId: "bambu-p1s-001",
        deviceModel: "P1S",
        title: "Widget plate 1",
        status: 2,
        weight: 12.5,
        costTime: 1200,
        startTime: "2026-02-01T10:00:00.000Z",
        endTime: "2026-02-01T10:20:00.000Z",
      }),
    });

    normalizeModule!.runNormalize();

    const task = db.prepare("SELECT printer_id FROM print_tasks WHERE id = ?").get("1000") as {
      printer_id: number;
    };
    const job = db.prepare("SELECT printer_id FROM jobs WHERE session_id = ?").get("1000") as {
      printer_id: number;
    };

    expect(task.printer_id).toBe(printerId);
    expect(job.printer_id).toBe(printerId);
  });

  it("converts a generic provider history record into a priced job without Bambu instanceId", () => {
    const db = dbModule!.db;
    db.prepare("INSERT OR IGNORE INTO providers (id, display_name) VALUES (?, ?)").run(
      "moonraker",
      "Moonraker",
    );
    db.prepare(
      `INSERT INTO print_tasks (
        id, provider, provider_task_id, provider_printer_id, session_id,
        status, startTime, endTime, deviceId, deviceModel, title, weight, costTime, raw_json
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "moonraker:job-1",
      "moonraker",
      "job-1",
      "snapmaker-u1.local",
      "finish",
      "2026-02-01T10:00:00.000Z",
      "2026-02-01T12:00:00.000Z",
      "snapmaker-u1.local",
      "Snapmaker U1",
      "customer-part.gcode",
      82.4,
      7200,
      JSON.stringify({
        title: "customer-part.gcode",
        deviceId: "snapmaker-u1.local",
        deviceModel: "Snapmaker U1",
        weight: 82.4,
        costTime: 7200,
        startTime: "2026-02-01T10:00:00.000Z",
        endTime: "2026-02-01T12:00:00.000Z",
        amsDetailMapping: [
          {
            filamentType: "PLA",
            filamentId: "pla-black",
            targetColor: "#000000",
            weight: 82.4,
            amsId: null,
            slotId: 0,
            usageConfidence: "slicer_estimate",
          },
        ],
      }),
    );

    normalizeModule!.runNormalize();

    const task = db
      .prepare("SELECT session_id FROM print_tasks WHERE id = ?")
      .get("moonraker:job-1") as { session_id: string };
    const job = db.prepare("SELECT * FROM jobs WHERE session_id = ?").get("job-1") as {
      provider: string;
      provider_session_id: string;
      provider_printer_id: string;
      deviceId: string;
      deviceModel: string;
      designTitle: string;
      total_weight_g: number;
      total_time_s: number;
      plate_count: number;
      status: string;
    };
    const filament = db
      .prepare("SELECT filament_type, weight_g, material_usage_confidence FROM job_filaments")
      .get() as {
      filament_type: string;
      weight_g: number;
      material_usage_confidence: string;
    };

    expect(task.session_id).toBe("job-1");
    expect(job).toMatchObject({
      provider: "moonraker",
      provider_session_id: "job-1",
      provider_printer_id: "snapmaker-u1.local",
      deviceId: "snapmaker-u1.local",
      deviceModel: "Snapmaker U1",
      designTitle: "customer-part.gcode",
      total_weight_g: 82.4,
      total_time_s: 7200,
      plate_count: 1,
      status: "finish",
    });
    expect(filament).toMatchObject({
      filament_type: "PLA",
      weight_g: 82.4,
      material_usage_confidence: "slicer_estimate",
    });
  });
});
