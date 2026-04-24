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

import { getAllJobPrices, patchJob } from "../models/jobs.js";

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: 1,
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

describe("patchJob", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetJobById.mockReturnValue(job());
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
    mockDbPrepare.mockImplementation((sql: string) => {
      if (sql.includes("FROM job_filaments")) return { all: vi.fn(() => []) };
      if (sql.includes("SELECT * FROM jobs")) return { all: vi.fn(() => [job()]) };
      return { all: vi.fn(() => []), get: vi.fn(), run: vi.fn() };
    });
  });

  it("prices jobs with no filament rows using the PLA fallback", () => {
    const prices = getAllJobPrices();

    expect(prices[1]).toBeGreaterThan(0);
  });
});
