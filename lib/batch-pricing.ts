import { calcProductionPricing } from "./production-pricing.js";

export interface BatchPricingInput {
  completedQuantity: number;
  failedQuantity: number;
  totalFilamentG: number;
  totalPrintTimeS: number;
  materialRatePerG: number;
  machineRatePerHr: number;
  laborHourlyRate: number;
  setupMinutes: number;
  handlingMinutesPerUnit: number;
  packagingCostPerUnit: number;
  targetMarginPct: number;
  platformFeePct: number;
  fixedFeePerOrder: number;
  failureBufferPct: number;
  overheadBufferPct: number;
  minimumPrice: number | null;
}

export interface BatchPricingBreakdown {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  setupLaborCost: number;
  handlingLaborCost: number;
  packagingCost: number;
  subtotalCost: number;
  bufferCost: number;
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  estimatedMarginPct: number;
}

export function calcBatchPricing(input: BatchPricingInput): BatchPricingBreakdown {
  if (input.completedQuantity <= 0) {
    throw new Error("completedQuantity must be greater than 0");
  }

  const materialCost = input.totalFilamentG * input.materialRatePerG;
  const machineCost = (input.totalPrintTimeS / 3600) * input.machineRatePerHr;
  const pricing = calcProductionPricing({
    sellableUnits: input.completedQuantity,
    materialCost,
    machineCost,
    productionLossCost: 0,
    laborHourlyRate: input.laborHourlyRate,
    batchLaborMinutes: input.setupMinutes,
    perUnitLaborMinutes: input.handlingMinutesPerUnit,
    packagingCostPerUnit: input.packagingCostPerUnit,
    extraCost: 0,
    targetMarginPct: input.targetMarginPct,
    platformFeePct: input.platformFeePct,
    fixedFeePerOrder: input.fixedFeePerOrder,
    failureBufferPct: input.failureBufferPct,
    overheadBufferPct: input.overheadBufferPct,
    minimumPrice: input.minimumPrice,
  });

  return {
    sellableUnits: pricing.sellableUnits,
    materialCost: pricing.materialCost,
    machineCost: pricing.machineCost,
    setupLaborCost: pricing.batchLaborCost,
    handlingLaborCost: pricing.perUnitLaborCost,
    packagingCost: pricing.packagingCost,
    subtotalCost: pricing.subtotalCost,
    bufferCost: pricing.bufferCost,
    totalCost: pricing.totalCost,
    unitCost: pricing.unitCost,
    suggestedPrice: pricing.suggestedPrice,
    estimatedMarginPct: pricing.estimatedMarginPct,
  };
}
