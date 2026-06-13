import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Job, LaborConfig, MachineRate, MaterialRate } from "../lib/types.js";

const { mockGetJobById, mockPatchJobRun, mockDbPrepare } = vi.hoisted(() => ({
  mockGetJobById: vi.fn(),
  mockPatchJobRun: vi.fn(),
  mockDbPrepare: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: mockDbPrepare },
  stmts: {
    getJobById: { get: mockGetJobById },
    patchJob: { run: mockPatchJobRun },
  },
}));

const laborConfig: LaborConfig = {
  id: 1,
  hourly_rate: 25,
  minimum_minutes: 15,
  profit_markup_pct: 0.2,
  failure_buffer_pct: 0,
  overhead_buffer_pct: 0,
};

const machineRate: MachineRate = {
  device_model: "A1 mini",
  purchase_price: 200,
  lifetime_hrs: 3000,
  electricity_rate: 0.1,
  maintenance_buffer: 0.5,
  machine_rate_per_hr: 0.7,
};

const plaRate: MaterialRate = {
  filament_type: "PLA",
  cost_per_g: 0.028,
  waste_buffer_pct: 0.1,
  rate_per_g: 0.0308,
};

vi.mock("../models/rates.js", () => ({
  loadRatesConfig: vi.fn(() => ({
    laborConfig,
    machineRates: new Map([[machineRate.device_model, machineRate]]),
    materialRates: new Map([[plaRate.filament_type, plaRate]]),
    fallbackMachine: machineRate,
  })),
}));

import { getAllJobPrices, getJobPrice, patchJob } from "../models/jobs.js";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: 1,
    provider: "bambu",
    provider_session_id: "s1",
    provider_printer_id: "dev1",
    printer_id: null,
    session_id: "s1",
    instanceId: 123,
    print_run: 1,
    designId: "d1",
    designTitle: "Thing",
    modelId: null,
    deviceId: "dev1",
    deviceModel: "A1 mini",
    startTime: null,
    endTime: null,
    total_weight_g: 100,
    total_time_s: 3600,
    plate_count: 1,
    status: "finish",
    customer: "Acme",
    notes: "Keep",
    price_override: null,
    status_override: null,
    project_id: null,
    extra_labor_minutes: null,
    ...overrides,
  };
}

function setDefaultDbMocks(): void {
  mockDbPrepare.mockImplementation((sql: string) => {
    if (sql.includes("SELECT 1 AS exists FROM jobs")) return { get: vi.fn(() => undefined) };
    if (sql.includes("SELECT COUNT(*) AS n FROM jobs")) return { get: vi.fn(() => ({ n: 1 })) };
    if (sql.includes("SELECT COUNT(*) AS n FROM job_price_cache"))
      return { get: vi.fn(() => ({ n: 0 })) };
    if (sql.includes("SELECT job_id, final_price FROM job_price_cache"))
      return { all: vi.fn(() => []) };
    if (sql.includes("INSERT INTO job_price_cache")) return { run: vi.fn() };
    if (sql.includes("FROM job_filaments") && sql.includes("GROUP BY pt.session_id"))
      return { all: vi.fn(() => []) };
    if (sql.includes("FROM print_tasks") && sql.includes("GROUP BY session_id"))
      return { all: vi.fn(() => []) };
    if (sql.includes("SELECT * FROM jobs")) return { all: vi.fn(() => [job()]) };
    if (sql.includes("FROM job_filaments") && sql.includes("GROUP BY jf.filament_type"))
      return { all: vi.fn(() => []) };
    if (
      sql.includes("SUM(COALESCE(weight, 0)) AS total_weight_g") &&
      sql.includes("WHERE session_id = ?")
    )
      return { get: vi.fn(() => ({ total_weight_g: 0, total_time_s: 0 })) };
    return { all: vi.fn(() => []), get: vi.fn(), run: vi.fn() };
  });
}

describe("patchJob", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetJobById.mockReturnValue(job());
    setDefaultDbMocks();
  });

  it("leaves omitted fields unchanged", () => {
    patchJob(1, {});

    expect(mockPatchJobRun).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "Acme", notes: "Keep" }),
    );
  });

  it("clears fields explicitly set to null", () => {
    patchJob(1, { customer: null, notes: null });

    expect(mockPatchJobRun).toHaveBeenCalledWith(
      expect.objectContaining({ customer: null, notes: null }),
    );
  });
});

describe("getAllJobPrices", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setDefaultDbMocks();
  });

  it("prices jobs with no filament rows using the PLA fallback", () => {
    const prices = getAllJobPrices();

    expect(prices[1]).toBeGreaterThan(0);
  });

  it("bypasses cache when active jobs exist", () => {
    mockDbPrepare.mockImplementation((sql: string) => {
      if (sql.includes("SELECT 1 AS exists FROM jobs"))
        return { get: vi.fn(() => ({ exists: 1 })) };
      if (sql.includes("FROM job_filaments") && sql.includes("GROUP BY pt.session_id"))
        return { all: vi.fn(() => []) };
      if (sql.includes("FROM print_tasks") && sql.includes("GROUP BY session_id"))
        return { all: vi.fn(() => []) };
      if (sql.includes("SELECT * FROM jobs"))
        return {
          all: vi.fn(() => [job({ status: "running", total_weight_g: 0, total_time_s: 0 })]),
        };
      if (sql.includes("INSERT INTO job_price_cache")) return { run: vi.fn() };
      return { all: vi.fn(() => []), get: vi.fn(), run: vi.fn() };
    });

    const prices = getAllJobPrices();
    expect(prices[1]).toBeGreaterThan(0);
  });
});

describe("getJobPrice", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setDefaultDbMocks();
  });

  it("uses print_tasks estimates for active jobs with zero normalized totals", () => {
    mockGetJobById.mockReturnValue(job({ status: "running", total_weight_g: 0, total_time_s: 0 }));

    mockDbPrepare.mockImplementation((sql: string) => {
      if (sql.includes("FROM job_filaments") && sql.includes("GROUP BY jf.filament_type")) {
        return { all: vi.fn(() => [{ filament_type: "PLA", total_weight: 200 }]) };
      }
      if (
        sql.includes("SUM(COALESCE(weight, 0)) AS total_weight_g") &&
        sql.includes("WHERE session_id = ?")
      ) {
        return { get: vi.fn(() => ({ total_weight_g: 200, total_time_s: 7200 })) };
      }
      return { all: vi.fn(() => []), get: vi.fn(), run: vi.fn() };
    });

    const result = getJobPrice(1);

    expect(result).not.toBeNull();
    expect(result!.material_cost).toBeGreaterThan(0);
    expect(result!.machine_cost).toBeGreaterThan(0);
    expect(result!.final_price).toBeGreaterThan(9);
  });
});
