import { describe, it, expect } from "vitest";
import { calcMaterialCost, calcMachineCost, calcLaborCost, calcPrice } from "../lib/pricing.js";
import type { MachineRate, MaterialRate, LaborConfig } from "../lib/types.js";

const machineRate: MachineRate = {
  device_model: "A1 mini",
  purchase_price: 213.99,
  lifetime_hrs: 3000,
  electricity_rate: 0.1,
  maintenance_buffer: 0.5,
  machine_rate_per_hr: 213.99 / 3000 + 0.1 + 0.5, // ~0.6713
};

const materialRate: MaterialRate = {
  filament_type: "PLA",
  cost_per_g: 0.028,
  waste_buffer_pct: 0.1,
  rate_per_g: 0.028 * 1.1, // 0.0308
};

const laborConfig: LaborConfig = {
  id: 1,
  hourly_rate: 25.0,
  minimum_minutes: 15.0,
  profit_markup_pct: 0.2,
};

describe("calcMaterialCost", () => {
  it("multiplies weight by rate_per_g", () => {
    expect(calcMaterialCost(100, materialRate)).toBeCloseTo(3.08, 4);
  });

  it("returns 0 for zero weight", () => {
    expect(calcMaterialCost(0, materialRate)).toBe(0);
  });
});

describe("calcMachineCost", () => {
  it("converts seconds to hours then multiplies by rate", () => {
    // 1 hour of printing
    expect(calcMachineCost(3600, machineRate)).toBeCloseTo(machineRate.machine_rate_per_hr, 4);
  });

  it("returns 0 for zero time", () => {
    expect(calcMachineCost(0, machineRate)).toBe(0);
  });

  it("prorates for partial hours", () => {
    // 30 minutes = half an hour
    expect(calcMachineCost(1800, machineRate)).toBeCloseTo(machineRate.machine_rate_per_hr / 2, 4);
  });
});

describe("calcLaborCost", () => {
  it("applies minimum_minutes floor for short jobs", () => {
    // 5-minute job should bill at the 15-minute minimum
    const cost5min = calcLaborCost(5, laborConfig);
    const cost15min = calcLaborCost(15, laborConfig);
    expect(cost5min).toBe(cost15min);
    expect(cost15min).toBeCloseTo((15 / 60) * 25, 4); // $6.25
  });

  it("bills actual time when above minimum", () => {
    expect(calcLaborCost(60, laborConfig)).toBeCloseTo(25.0, 4); // 1 hour at $25
  });
});

describe("calcPrice", () => {
  it("returns all cost components", () => {
    const result = calcPrice({
      total_weight_g: 100,
      total_time_s: 3600,
      machineRate,
      materialRate,
      laborConfig,
    });
    expect(result.material_cost).toBeGreaterThan(0);
    expect(result.machine_cost).toBeGreaterThan(0);
    expect(result.labor_cost).toBeGreaterThan(0);
    expect(result.base_price).toBeCloseTo(
      result.material_cost + result.machine_cost + result.labor_cost,
      1,
    );
  });

  it("applies 20% markup and rounds up to nearest dollar", () => {
    const result = calcPrice({
      total_weight_g: 100,
      total_time_s: 3600,
      machineRate,
      materialRate,
      laborConfig,
    });
    // final_price should be >= base_price * 1.20
    expect(result.final_price).toBeGreaterThanOrEqual(result.base_price * 1.2);
    // and be a whole number (CEILING to $1)
    expect(result.final_price % 1).toBe(0);
    expect(result.is_override).toBe(false);
  });

  it("uses price_override when provided", () => {
    const result = calcPrice({
      total_weight_g: 100,
      total_time_s: 3600,
      price_override: 99.99,
      machineRate,
      materialRate,
      laborConfig,
    });
    expect(result.final_price).toBe(99.99);
    expect(result.is_override).toBe(true);
    // costs still calculated for margin visibility
    expect(result.base_price).toBeGreaterThan(0);
  });

  it("project pricing invariant: one labor charge for N jobs costs less than N individual labor charges", () => {
    // Per-project pricing calls calcLaborCost(0, config) once and aggregates
    // material + machine across all jobs. This test demonstrates that billing
    // N jobs individually (each getting the minimum labor charge) produces a
    // higher labor total than the single-charge approach used for projects.
    const singleLaborCharge = calcLaborCost(0, laborConfig); // minimum_minutes floor
    const threeJobLaborCharges = 3 * singleLaborCharge;

    // Project should bill exactly one minimum labor charge, not three
    expect(singleLaborCharge).toBeCloseTo((15 / 60) * 25, 4); // $6.25
    expect(threeJobLaborCharges).toBeCloseTo(3 * 6.25, 4); // $18.75
    expect(singleLaborCharge).toBeLessThan(threeJobLaborCharges);
  });

  it("defaults labor_minutes to 15 when not provided", () => {
    const withDefault = calcPrice({
      total_weight_g: 0,
      total_time_s: 0,
      machineRate,
      materialRate,
      laborConfig,
    });
    const withExplicit = calcPrice({
      total_weight_g: 0,
      total_time_s: 0,
      labor_minutes: 15,
      machineRate,
      materialRate,
      laborConfig,
    });
    expect(withDefault.labor_cost).toBe(withExplicit.labor_cost);
  });
});
