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

  const marginAndFee = input.targetMarginPct + input.platformFeePct;
  if (marginAndFee >= 0.95) {
    throw new Error("target margin plus platform fee must be less than 0.95");
  }

  const materialCost = input.totalFilamentG * input.materialRatePerG;
  const machineCost = (input.totalPrintTimeS / 3600) * input.machineRatePerHr;
  const setupLaborCost = (input.setupMinutes / 60) * input.laborHourlyRate;
  const handlingLaborCost =
    (input.completedQuantity * input.handlingMinutesPerUnit * input.laborHourlyRate) / 60;
  const packagingCost = input.completedQuantity * input.packagingCostPerUnit;
  const subtotalCost =
    materialCost + machineCost + setupLaborCost + handlingLaborCost + packagingCost;
  const bufferCost = subtotalCost * (input.failureBufferPct + input.overheadBufferPct);
  const totalCost = subtotalCost + bufferCost;
  const unitCost = totalCost / input.completedQuantity;
  const suggestedPrice = calcSuggestedPrice(input, unitCost);
  const estimatedMarginPct = calcEstimatedMarginPct(
    suggestedPrice,
    round2(unitCost),
    input.platformFeePct,
    input.fixedFeePerOrder,
  );

  return {
    sellableUnits: input.completedQuantity,
    materialCost: round2(materialCost),
    machineCost: round2(machineCost),
    setupLaborCost: round2(setupLaborCost),
    handlingLaborCost: round2(handlingLaborCost),
    packagingCost: round2(packagingCost),
    subtotalCost: round2(subtotalCost),
    bufferCost: round2(bufferCost),
    totalCost: round2(totalCost),
    unitCost: round2(unitCost),
    suggestedPrice,
    estimatedMarginPct,
  };
}

function calcSuggestedPrice(input: BatchPricingInput, unitCost: number): number {
  const roundedUnitCost = round2(unitCost);
  if (input.targetMarginPct === 0 && input.platformFeePct === 0) {
    return roundedUnitCost;
  }

  const rawPrice =
    (unitCost + input.fixedFeePerOrder) / (1 - input.targetMarginPct - input.platformFeePct);
  const minimumPrice = input.minimumPrice ?? 0;
  return roundUpToFriendly99(Math.max(rawPrice, minimumPrice));
}

function calcEstimatedMarginPct(
  suggestedPrice: number,
  unitCost: number,
  platformFeePct: number,
  fixedFeePerOrder: number,
): number {
  if (suggestedPrice === 0) return 0;

  return round4(
    (suggestedPrice * (1 - platformFeePct) - fixedFeePerOrder - unitCost) / suggestedPrice,
  );
}

function roundUpToFriendly99(value: number): number {
  const dollars = Math.floor(value);
  let friendlyPrice = dollars + 0.99;
  if (friendlyPrice + Number.EPSILON < value) {
    friendlyPrice += 1;
  }

  return round2(friendlyPrice);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
