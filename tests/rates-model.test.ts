import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockUpsertRun, mockGetMaterial } = vi.hoisted(() => ({
  mockUpsertRun: vi.fn(),
  mockGetMaterial: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  stmts: {
    upsertMaterialRate: { run: mockUpsertRun },
    getMaterialRate: { get: mockGetMaterial },
    getLaborConfig: { get: vi.fn() },
    getMachineRates: { all: vi.fn(() => []) },
    getMaterialRates: { all: vi.fn(() => []) },
    updateLaborConfig: { run: vi.fn() },
    upsertMachineRate: { run: vi.fn() },
    getMachineRate: { get: vi.fn() },
  },
}));

import { upsertMaterialRate } from "../models/rates.js";

describe("upsertMaterialRate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetMaterial.mockReturnValue({
      filament_type: "PLA",
      cost_per_g: 0.028,
      waste_buffer_pct: 0.1,
      rate_per_g: 0.0308,
    });
  });

  it("computes rate_per_g as cost_per_g * (1 + waste_buffer_pct)", () => {
    upsertMaterialRate({ filament_type: "PLA", cost_per_g: 0.028, waste_buffer_pct: 0.1 });

    const { rate_per_g } = mockUpsertRun.mock.calls[0]![0] as { rate_per_g: number };
    expect(rate_per_g).toBeCloseTo(0.028 * 1.1, 6); // 0.0308
  });

  it("regression: does NOT divide waste_buffer_pct by 100 (fraction not percent)", () => {
    upsertMaterialRate({ filament_type: "PLA", cost_per_g: 0.028, waste_buffer_pct: 0.1 });

    const { rate_per_g } = mockUpsertRun.mock.calls[0]![0] as { rate_per_g: number };
    // If the bug were present: 0.028 * (1 + 0.1/100) ≈ 0.028028 — not 0.0308
    expect(rate_per_g).toBeGreaterThan(0.030);
    expect(rate_per_g).toBeCloseTo(0.0308, 4);
  });

  it("passes all input fields through to the DB unchanged", () => {
    upsertMaterialRate({ filament_type: "PETG", cost_per_g: 0.035, waste_buffer_pct: 0.15 });

    const call = mockUpsertRun.mock.calls[0]![0] as Record<string, unknown>;
    expect(call.filament_type).toBe("PETG");
    expect(call.cost_per_g).toBe(0.035);
    expect(call.waste_buffer_pct).toBe(0.15);
    expect(call.rate_per_g).toBeCloseTo(0.035 * 1.15, 6);
  });
});
