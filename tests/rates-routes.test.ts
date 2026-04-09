import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockUpdateLabor, mockUpsertMachine, mockUpsertMaterial } = vi.hoisted(() => ({
  mockUpdateLabor: vi.fn(),
  mockUpsertMachine: vi.fn(),
  mockUpsertMaterial: vi.fn(),
}));

vi.mock("../models/rates.js", () => ({
  getRates: vi.fn().mockReturnValue({ machine_rates: [], material_rates: [], labor_config: undefined }),
  updateLaborConfig: mockUpdateLabor,
  upsertMachineRate: mockUpsertMachine,
  upsertMaterialRate: mockUpsertMaterial,
}));

import { rates } from "../routes/rates.js";

async function patch(path: string, body: unknown): Promise<Response> {
  return rates.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── PATCH /labor ───────────────────────────────────────────────────────────────

describe("PATCH /labor validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateLabor.mockReturnValue({ id: 1, hourly_rate: 25, minimum_minutes: 15, profit_markup_pct: 0.2 });
  });

  it("accepts valid numeric values", async () => {
    const res = await patch("/labor", { hourly_rate: 25, minimum_minutes: 15, profit_markup_pct: 0.2 });
    expect(res.status).toBe(200);
  });

  it("rejects null (non-finite) for hourly_rate", async () => {
    const res = await patch("/labor", { hourly_rate: null, minimum_minutes: 15, profit_markup_pct: 0.2 });
    expect(res.status).toBe(400);
  });

  it("rejects string value for minimum_minutes", async () => {
    const res = await patch("/labor", { hourly_rate: 25, minimum_minutes: "15", profit_markup_pct: 0.2 });
    expect(res.status).toBe(400);
  });

  it("rejects negative hourly_rate", async () => {
    const res = await patch("/labor", { hourly_rate: -1, minimum_minutes: 15, profit_markup_pct: 0.2 });
    expect(res.status).toBe(400);
  });

  it("rejects missing fields", async () => {
    const res = await patch("/labor", { hourly_rate: 25 });
    expect(res.status).toBe(400);
  });
});

// ── PATCH /machines/:device_model ─────────────────────────────────────────────

describe("PATCH /machines/:device_model validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpsertMachine.mockReturnValue({
      device_model: "X1C",
      purchase_price: 1000,
      lifetime_hrs: 5000,
      electricity_rate: 0.1,
      maintenance_buffer: 0.5,
      machine_rate_per_hr: 0.8,
    });
  });

  it("accepts valid machine rate values", async () => {
    const res = await patch("/machines/X1C", {
      purchase_price: 1000,
      lifetime_hrs: 5000,
      electricity_rate: 0.1,
      maintenance_buffer: 0.5,
    });
    expect(res.status).toBe(200);
  });

  it("rejects null for purchase_price", async () => {
    const res = await patch("/machines/X1C", {
      purchase_price: null,
      lifetime_hrs: 5000,
      electricity_rate: 0.1,
      maintenance_buffer: 0.5,
    });
    expect(res.status).toBe(400);
  });

  it("rejects string for lifetime_hrs", async () => {
    const res = await patch("/machines/X1C", {
      purchase_price: 1000,
      lifetime_hrs: "5000",
      electricity_rate: 0.1,
      maintenance_buffer: 0.5,
    });
    expect(res.status).toBe(400);
  });

  it("rejects negative electricity_rate", async () => {
    const res = await patch("/machines/X1C", {
      purchase_price: 1000,
      lifetime_hrs: 5000,
      electricity_rate: -0.1,
      maintenance_buffer: 0.5,
    });
    expect(res.status).toBe(400);
  });
});

// ── PATCH /materials/:filament_type ───────────────────────────────────────────

describe("PATCH /materials/:filament_type validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUpsertMaterial.mockReturnValue({
      filament_type: "PLA",
      cost_per_g: 0.028,
      waste_buffer_pct: 0.1,
      rate_per_g: 0.0308,
    });
  });

  it("accepts valid material rate values", async () => {
    const res = await patch("/materials/PLA", { cost_per_g: 0.028, waste_buffer_pct: 0.1 });
    expect(res.status).toBe(200);
  });

  it("rejects null for cost_per_g", async () => {
    const res = await patch("/materials/PLA", { cost_per_g: null, waste_buffer_pct: 0.1 });
    expect(res.status).toBe(400);
  });

  it("rejects string for waste_buffer_pct", async () => {
    const res = await patch("/materials/PLA", { cost_per_g: 0.028, waste_buffer_pct: "0.1" });
    expect(res.status).toBe(400);
  });

  it("rejects negative cost_per_g", async () => {
    const res = await patch("/materials/PLA", { cost_per_g: -0.028, waste_buffer_pct: 0.1 });
    expect(res.status).toBe(400);
  });
});
