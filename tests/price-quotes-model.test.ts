import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type PriceQuotesModule = typeof import("../models/price-quotes.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let priceQuotesModule: PriceQuotesModule | null = null;
let successJobId = 0;
let failedJobId = 0;

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
  priceQuotesModule = await import("../models/price-quotes.js");
}

function seedRates(): void {
  const db = dbModule!.db;
  db.exec("DELETE FROM machine_rates; DELETE FROM material_rates;");
  const insertMachine = db.prepare(
    `INSERT INTO machine_rates
       (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
     VALUES (?, 0, 1, 0, 0, ?)`,
  );
  insertMachine.run("P1S", 2);
  insertMachine.run("Snapmaker U1", 4);

  const insertMaterial = db.prepare(
    `INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
     VALUES (?, ?, 0, ?)`,
  );
  insertMaterial.run("PLA", 0.02, 0.02);
  insertMaterial.run("PETG", 0.03, 0.03);

  db.prepare(
    `UPDATE labor_config
     SET hourly_rate = 30, failure_buffer_pct = 0, overhead_buffer_pct = 0
     WHERE id = 1`,
  ).run();
  db.prepare(
    `UPDATE pricing_profiles
     SET target_margin_pct = 0.4, platform_fee_pct = 0.03, fixed_fee_per_order = 0,
         failure_buffer_pct = 0, overhead_buffer_pct = 0, minimum_price = NULL
     WHERE id = 'booth'`,
  ).run();
  db.prepare(
    `UPDATE pricing_profiles
     SET target_margin_pct = 0.5, platform_fee_pct = 0.12, fixed_fee_per_order = 0.45,
         failure_buffer_pct = 0, overhead_buffer_pct = 0, minimum_price = NULL
     WHERE id = 'etsy'`,
  ).run();
}

function seedJobs(): void {
  const db = dbModule!.db;
  successJobId = Number(
    db
      .prepare(
        `INSERT INTO jobs (provider, session_id, print_run, deviceModel, status, designTitle)
         VALUES ('bambu', 'bambu-session', 1, 'P1S', 'finish', 'Dragon')
         RETURNING id`,
      )
      .pluck()
      .get(),
  );
  failedJobId = Number(
    db
      .prepare(
        `INSERT INTO jobs (provider, session_id, print_run, deviceModel, status, designTitle)
         VALUES ('moonraker', 'moon-session', 1, 'Snapmaker U1', 'cancelled', 'Dragon retry')
         RETURNING id`,
      )
      .pluck()
      .get(),
  );

  const insertTask = db.prepare(
    `INSERT INTO print_tasks
       (id, provider, session_id, title, status, deviceModel, weight, costTime, raw_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
  );
  insertTask.run("bambu-task", "bambu", "bambu-session", "Dragon body", "finish", "P1S", 50, 3600);
  insertTask.run(
    "moon-task",
    "moonraker",
    "moon-session",
    "Dragon body retry",
    "cancelled",
    "Snapmaker U1",
    20,
    1800,
  );

  const insertFilament = db.prepare(
    `INSERT INTO job_filaments (task_id, filament_type, weight_g)
     VALUES (?, ?, ?)`,
  );
  insertFilament.run("bambu-task", "PLA", 50);
  insertFilament.run("moon-task", "PETG", 20);
}

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    job_ids: [successJobId, failedJobId],
    sellable_units: 2,
    batch_labor_minutes: 0,
    per_unit_labor_minutes: 0,
    packaging_cost_per_unit: 0,
    extra_cost: 0,
    channel: "direct" as const,
    ...overrides,
  };
}

describe.sequential("price quotes model", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "price-quotes-model-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
    seedRates();
    seedJobs();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    priceQuotesModule = null;
  });

  it("resolves cross-provider attempts and reports failed production cost separately", () => {
    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts.map((attempt) => attempt.job_id)).toEqual([successJobId, failedJobId]);
    expect(result.attempts).toEqual([
      {
        job_id: successJobId,
        title: "Dragon",
        status: "finish",
        printer: "P1S",
        material_cost: 1,
        machine_cost: 2,
        production_loss_cost: 0,
      },
      {
        job_id: failedJobId,
        title: "Dragon retry",
        status: "cancelled",
        printer: "Snapmaker U1",
        material_cost: 0.6,
        machine_cost: 2,
        production_loss_cost: 2.6,
      },
    ]);
    expect(result.breakdown.productionLossCost).toBeGreaterThan(0);
    expect(result.breakdown.materialCost + result.breakdown.machineCost).toBeGreaterThanOrEqual(
      result.breakdown.productionLossCost,
    );
    expect(result.warnings).toEqual([]);
  });

  it("normalizes duplicate job ids while preserving first-seen order", () => {
    const result = priceQuotesModule!.calculatePriceQuote(
      validInput({ job_ids: [failedJobId, successJobId, failedJobId] }),
    );

    expect(result.attempts.map((attempt) => attempt.job_id)).toEqual([failedJobId, successJobId]);
  });

  it("rejects the whole request when any selected job is unknown", () => {
    expect(() =>
      priceQuotesModule!.calculatePriceQuote(
        validInput({ job_ids: [successJobId, 999_999, failedJobId] }),
      ),
    ).toThrowError(priceQuotesModule!.PriceQuoteValidationError);
    expect(() =>
      priceQuotesModule!.calculatePriceQuote(
        validInput({ job_ids: [successJobId, 999_999, failedJobId] }),
      ),
    ).toThrow(/unknown job_ids.*999999/i);
  });

  it("rejects zero sellable units", () => {
    expect(() =>
      priceQuotesModule!.calculatePriceQuote(validInput({ sellable_units: 0 })),
    ).toThrowError(priceQuotesModule!.PriceQuoteValidationError);
  });

  it("uses each task's printer-specific machine rate", () => {
    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts.map((attempt) => attempt.machine_cost)).toEqual([2, 2]);
    expect(result.breakdown.machineCost).toBe(4);
  });

  it("uses effective material rates including configured waste buffers", () => {
    const updateRate = dbModule!.db.prepare(
      `UPDATE material_rates
       SET waste_buffer_pct = ?, rate_per_g = ?
       WHERE filament_type = ?`,
    );
    updateRate.run(0.25, 0.025, "PLA");
    updateRate.run(0.5, 0.045, "PETG");

    const configured = priceQuotesModule!.calculatePriceQuote(validInput());
    expect(configured.attempts.map((attempt) => attempt.material_cost)).toEqual([1.25, 0.9]);
    expect(configured.breakdown.materialCost).toBe(2.15);

    dbModule!.db.prepare("DELETE FROM job_filaments WHERE task_id = 'moon-task'").run();
    const plaFallback = priceQuotesModule!.calculatePriceQuote(validInput());
    expect(plaFallback.attempts[1]!.material_cost).toBe(0.5);
  });

  it("falls back to task weight and PLA cost with a visible filament warning", () => {
    dbModule!.db.prepare("DELETE FROM job_filaments WHERE task_id = 'moon-task'").run();

    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts[1]!.material_cost).toBe(0.4);
    expect(result.warnings).toEqual([
      expect.stringMatching(/job .*Dragon retry.*task .*Dragon body retry.*PLA/i),
    ]);
  });

  it("uses measured filament weight with the PLA rate when its material rate is missing", () => {
    dbModule!.db
      .prepare("UPDATE job_filaments SET filament_type = 'ABS' WHERE task_id = 'moon-task'")
      .run();
    dbModule!.db.prepare("UPDATE print_tasks SET weight = 999 WHERE id = 'moon-task'").run();

    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts[1]!.material_cost).toBe(0.4);
    expect(result.warnings).toEqual([
      expect.stringMatching(/job .*Dragon retry.*task .*Dragon body retry.*ABS.*PLA/i),
    ]);
  });

  it("warns explicitly when missing filament data and task weight produce zero material cost", () => {
    dbModule!.db.prepare("DELETE FROM job_filaments WHERE task_id = 'moon-task'").run();
    dbModule!.db.prepare("UPDATE print_tasks SET weight = NULL WHERE id = 'moon-task'").run();

    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts[1]!.material_cost).toBe(0);
    expect(result.warnings).toEqual([expect.stringMatching(/zero material cost/i)]);
  });

  it("uses the existing fallback machine rate with a visible warning", () => {
    dbModule!.db
      .prepare("UPDATE print_tasks SET deviceModel = 'Unknown Model' WHERE id = 'moon-task'")
      .run();
    dbModule!.db
      .prepare("UPDATE jobs SET deviceModel = 'Unknown Model' WHERE id = ?")
      .run(failedJobId);

    const result = priceQuotesModule!.calculatePriceQuote(validInput());

    expect(result.attempts[1]!.machine_cost).toBe(1);
    expect(result.warnings).toEqual([
      expect.stringMatching(/job .*Dragon retry.*task .*Dragon body retry.*machine.*P1S/i),
    ]);
  });

  it("loads every task in a selected job session", () => {
    dbModule!.db
      .prepare(
        `INSERT INTO print_tasks
           (id, provider, session_id, title, status, deviceModel, weight, costTime, raw_json)
         VALUES ('second-task', 'bambu', 'bambu-session', 'Dragon detail', 'failed', 'P1S', 10, 900, '{}')`,
      )
      .run();
    dbModule!.db
      .prepare(
        `INSERT INTO job_filaments (task_id, filament_type, weight_g)
         VALUES ('second-task', 'PETG', 10)`,
      )
      .run();

    const result = priceQuotesModule!.calculatePriceQuote(validInput({ job_ids: [successJobId] }));

    expect(result.attempts[0]).toMatchObject({
      material_cost: 1.3,
      machine_cost: 2.5,
      production_loss_cost: 0.8,
    });
    expect(result.breakdown.productionLossCost).toBe(0.8);
  });

  it("applies direct and Etsy profile assumptions and permits a margin override", () => {
    const direct = priceQuotesModule!.calculatePriceQuote(validInput());
    const etsy = priceQuotesModule!.calculatePriceQuote(validInput({ channel: "etsy" }));
    const overridden = priceQuotesModule!.calculatePriceQuote(
      validInput({ channel: "etsy", target_margin_pct: 0.25 }),
    );

    expect(direct.assumptions).toEqual({
      labor_hourly_rate: 30,
      target_margin_pct: 0.4,
      platform_fee_pct: 0,
      fixed_fee_per_order: 0,
    });
    expect(etsy.assumptions).toEqual({
      labor_hourly_rate: 30,
      target_margin_pct: 0.5,
      platform_fee_pct: 0.12,
      fixed_fee_per_order: 0.45,
    });
    expect(overridden.assumptions.target_margin_pct).toBe(0.25);
    expect(etsy.breakdown.suggestedPrice).toBeGreaterThan(direct.breakdown.suggestedPrice);
  });

  it("keeps manufacturing costs channel-independent when profile buffers differ", () => {
    dbModule!.db
      .prepare(
        `UPDATE labor_config
         SET failure_buffer_pct = 0.1, overhead_buffer_pct = 0.05
         WHERE id = 1`,
      )
      .run();
    dbModule!.db
      .prepare(
        `UPDATE pricing_profiles
         SET failure_buffer_pct = 0.01, overhead_buffer_pct = 0.02
         WHERE id = 'booth'`,
      )
      .run();
    dbModule!.db
      .prepare(
        `UPDATE pricing_profiles
         SET failure_buffer_pct = 0.3, overhead_buffer_pct = 0.2
         WHERE id = 'etsy'`,
      )
      .run();

    const direct = priceQuotesModule!.calculatePriceQuote(validInput());
    const etsy = priceQuotesModule!.calculatePriceQuote(validInput({ channel: "etsy" }));

    expect(etsy.breakdown.materialCost).toBe(direct.breakdown.materialCost);
    expect(etsy.breakdown.machineCost).toBe(direct.breakdown.machineCost);
    expect(etsy.breakdown.bufferCost).toBe(direct.breakdown.bufferCost);
    expect(etsy.breakdown.totalCost).toBe(direct.breakdown.totalCost);
    expect(etsy.breakdown.unitCost).toBe(direct.breakdown.unitCost);
    expect(direct.breakdown.bufferCost).toBeGreaterThan(0);
    expect(etsy.breakdown.suggestedPrice).not.toBe(direct.breakdown.suggestedPrice);
  });

  it.each([null, -10])("warns when a task duration is missing or invalid: %s", (costTime) => {
    dbModule!.db
      .prepare("UPDATE print_tasks SET costTime = ? WHERE id = 'bambu-task'")
      .run(costTime);

    const result = priceQuotesModule!.calculatePriceQuote(validInput({ job_ids: [successJobId] }));

    expect(result.attempts[0]!.machine_cost).toBe(0);
    expect(result.warnings).toEqual([
      expect.stringMatching(/job .*Dragon.*task .*Dragon body.*duration.*zero/i),
    ]);
  });

  it.each([
    ["empty selection", { job_ids: [] }],
    ["non-integer job id", { job_ids: [successJobId, 1.5] }],
    ["non-positive job id", { job_ids: [-1] }],
    ["fractional units", { sellable_units: 1.5 }],
    ["negative batch labor", { batch_labor_minutes: -1 }],
    ["negative per-unit labor", { per_unit_labor_minutes: -1 }],
    ["negative packaging", { packaging_cost_per_unit: -1 }],
    ["negative extras", { extra_cost: -1 }],
    ["negative margin", { target_margin_pct: -0.1 }],
    ["impossible Etsy margin", { channel: "etsy", target_margin_pct: 0.83 }],
  ])("rejects invalid input: %s", (_name, overrides) => {
    expect(() => priceQuotesModule!.calculatePriceQuote(validInput(overrides))).toThrowError(
      priceQuotesModule!.PriceQuoteValidationError,
    );
  });
});
