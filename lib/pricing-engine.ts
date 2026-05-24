import {
  calcWeightedMaterialCost,
  round2,
  totalPricingMultiplier,
  type FilamentWeight,
} from "./pricing.js";
import type { LaborConfig, MaterialRate, PriceBreakdown } from "./types.js";

export interface VariableCosts {
  material_cost: number;
  machine_cost: number;
  labor_cost: number;
  extra_labor_cost: number;
}

export function getFallbackMaterialRate(
  materialRates: ReadonlyMap<string, MaterialRate>,
): MaterialRate | null {
  return materialRates.get("PLA") ?? null;
}

export function calcMaterialCostWithFallback(
  totalWeightG: number,
  filamentTotals: FilamentWeight[],
  materialRates: ReadonlyMap<string, MaterialRate>,
): number {
  const fallback = getFallbackMaterialRate(materialRates);
  if (!fallback) return 0;
  return calcWeightedMaterialCost(totalWeightG, filamentTotals, materialRates, fallback);
}

export function buildPriceBreakdown(
  costs: VariableCosts,
  laborConfig: LaborConfig,
  isOverride = false,
  overrideFinalPrice?: number,
): PriceBreakdown {
  const base_price = costs.material_cost + costs.machine_cost + costs.labor_cost + costs.extra_labor_cost;
  const computedFinal = Math.ceil(base_price * totalPricingMultiplier(laborConfig));
  const final_price = isOverride ? (overrideFinalPrice ?? computedFinal) : computedFinal;

  return {
    material_cost: round2(costs.material_cost),
    machine_cost: round2(costs.machine_cost),
    labor_cost: round2(costs.labor_cost),
    extra_labor_cost: round2(costs.extra_labor_cost),
    base_price: round2(base_price),
    final_price: round2(final_price),
    is_override: isOverride,
  };
}
