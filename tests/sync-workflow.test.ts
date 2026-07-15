import Database from "better-sqlite3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { autoGroupProjects } from "../lib/auto-group.js";
import { invalidateAllPriceCaches } from "../lib/price-cache.js";
import { getAllJobPrices } from "../models/jobs.js";
import { getAllProjectPrices } from "../models/projects.js";
import { runNormalize } from "../normalize.js";
import {
  defaultDbPath,
  hasSyncChanges,
  insertSyncLog,
  runPostSyncMaintenance,
  updateSyncLog,
} from "../lib/sync-workflow.js";

vi.mock("../lib/auto-group.js", () => ({ autoGroupProjects: vi.fn() }));
vi.mock("../lib/colors.js", () => ({ dim: String, green: String }));
vi.mock("../lib/logger.js", () => ({ logInfo: vi.fn() }));
vi.mock("../lib/price-cache.js", () => ({ invalidateAllPriceCaches: vi.fn() }));
vi.mock("../models/jobs.js", () => ({ getAllJobPrices: vi.fn() }));
vi.mock("../models/projects.js", () => ({ getAllProjectPrices: vi.fn() }));
vi.mock("../normalize.js", () => ({ runNormalize: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(autoGroupProjects).mockReturnValue({ created: 0, assigned: 0 });
  vi.mocked(getAllJobPrices).mockReturnValue({});
  vi.mocked(getAllProjectPrices).mockReturnValue({});
});

it("detects whether sync counts include real row changes", () => {
  expect(hasSyncChanges([])).toBe(false);
  expect(hasSyncChanges([{ inserted: 0, updated: 0 }])).toBe(false);
  expect(
    hasSyncChanges([
      { inserted: 0, updated: 0 },
      { inserted: 1, updated: 0 },
    ]),
  ).toBe(true);
  expect(hasSyncChanges([{ inserted: 0, updated: 2 }])).toBe(true);
});

it("resolves the database path from the environment with a local fallback", () => {
  expect(defaultDbPath({})).toBe("./bambu_print_history.sqlite");
  expect(defaultDbPath({ BAMBU_DB: "/tmp/printworks.sqlite" })).toBe("/tmp/printworks.sqlite");
});

describe("sync log persistence", () => {
  it("inserts and completes a provider sync log", () => {
    const database = new Database(":memory:");
    database.exec(`CREATE TABLE sync_log (
      id INTEGER PRIMARY KEY,
      provider TEXT,
      provider_printer_id TEXT,
      started_at TEXT,
      ended_at TEXT,
      inserted INTEGER,
      updated INTEGER,
      error TEXT
    )`);

    const id = insertSyncLog(database, {
      provider: "moonraker",
      providerPrinterId: "voron-24",
    });
    updateSyncLog(database, id, { inserted: 4, updated: 2 }, "partial failure");

    expect(database.prepare("SELECT * FROM sync_log WHERE id = ?").get(id)).toMatchObject({
      provider: "moonraker",
      provider_printer_id: "voron-24",
      inserted: 4,
      updated: 2,
      error: "partial failure",
    });
    expect(
      database.prepare("SELECT started_at, ended_at FROM sync_log WHERE id = ?").get(id),
    ).toMatchObject({
      started_at: expect.any(String),
      ended_at: expect.any(String),
    });
    database.close();
  });

  it("stores nullable provider metadata and a successful completion", () => {
    const database = new Database(":memory:");
    database.exec(`CREATE TABLE sync_log (
      id INTEGER PRIMARY KEY,
      provider TEXT,
      provider_printer_id TEXT,
      started_at TEXT,
      ended_at TEXT,
      inserted INTEGER,
      updated INTEGER,
      error TEXT
    )`);

    const id = insertSyncLog(database);
    updateSyncLog(database, id, { inserted: 0, updated: 0 });

    expect(database.prepare("SELECT * FROM sync_log WHERE id = ?").get(id)).toMatchObject({
      provider: null,
      provider_printer_id: null,
      inserted: 0,
      updated: 0,
      error: null,
    });
    database.close();
  });
});

describe("post-sync maintenance", () => {
  it("normalizes, groups, invalidates, and warms pricing caches", () => {
    vi.mocked(autoGroupProjects).mockReturnValue({ created: 1, assigned: 3 });
    vi.mocked(getAllJobPrices).mockReturnValue({ 1: 1.25, 2: 2.5 });
    vi.mocked(getAllProjectPrices).mockReturnValue({ 7: 8.75 });
    vi.spyOn(Date, "now").mockReturnValue(5_000);

    runPostSyncMaintenance({ elapsedFrom: 2_500, dbPath: "/tmp/printworks.sqlite" });

    expect(runNormalize).toHaveBeenCalledOnce();
    expect(autoGroupProjects).toHaveBeenCalledOnce();
    expect(invalidateAllPriceCaches).toHaveBeenCalledOnce();
    expect(getAllJobPrices).toHaveBeenCalledOnce();
    expect(getAllProjectPrices).toHaveBeenCalledOnce();
  });

  it("handles maintenance with no elapsed time, path, or new groups", () => {
    runPostSyncMaintenance();

    expect(runNormalize).toHaveBeenCalledOnce();
    expect(autoGroupProjects).toHaveBeenCalledOnce();
    expect(invalidateAllPriceCaches).toHaveBeenCalledOnce();
  });
});
