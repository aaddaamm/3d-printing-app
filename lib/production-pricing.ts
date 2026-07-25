export interface ProductionPricingInput {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  productionLossCost: number;
  laborHourlyRate: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  targetMarginPct: number;
  platformFeePct: number;
  fixedFeePerOrder: number;
  failureBufferPct: number;
  overheadBufferPct: number;
  minimumPrice: number | null;
}

export interface ProductionPricingBreakdown {
  sellableUnits: number;
  materialCost: number;
  machineCost: number;
  productionLossCost: number;
  batchLaborCost: number;
  perUnitLaborCost: number;
  packagingCost: number;
  extraCost: number;
  subtotalCost: number;
  bufferCost: number;
  totalCost: number;
  unitCost: number;
  minimumViablePrice: number;
  suggestedPrice: number;
  profitPerUnit: number;
  profitPerBatch: number;
  estimatedMarginPct: number;
}

const REQUIRED_NUMERIC_FIELDS = [
  "materialCost",
  "machineCost",
  "productionLossCost",
  "laborHourlyRate",
  "batchLaborMinutes",
  "perUnitLaborMinutes",
  "packagingCostPerUnit",
  "extraCost",
  "targetMarginPct",
  "platformFeePct",
  "fixedFeePerOrder",
  "failureBufferPct",
  "overheadBufferPct",
] as const satisfies ReadonlyArray<keyof ProductionPricingInput>;

export function calcProductionPricing(input: ProductionPricingInput): ProductionPricingBreakdown {
  validateInput(input);

  const batchLaborCost = (input.batchLaborMinutes / 60) * input.laborHourlyRate;
  const perUnitLaborCost =
    (input.sellableUnits * input.perUnitLaborMinutes * input.laborHourlyRate) / 60;
  const packagingCost = input.sellableUnits * input.packagingCostPerUnit;
  const subtotalCost =
    input.materialCost +
    input.machineCost +
    batchLaborCost +
    perUnitLaborCost +
    packagingCost +
    input.extraCost;
  const bufferCost = subtotalCost * (input.failureBufferPct + input.overheadBufferPct);
  const totalCost = subtotalCost + bufferCost;
  const unitCost = totalCost / input.sellableUnits;
  const roundedUnitCost = round2(unitCost);
  const minimumViablePrice = round2(
    (unitCost + input.fixedFeePerOrder) / (1 - input.platformFeePct),
  );
  const suggestedPrice = calcSuggestedPrice(input, unitCost);
  const profitPerUnit = round2(
    suggestedPrice * (1 - input.platformFeePct) - input.fixedFeePerOrder - roundedUnitCost,
  );
  const profitPerBatch = round2(profitPerUnit * input.sellableUnits);
  const estimatedMarginPct = calcEstimatedMarginPct(
    suggestedPrice,
    roundedUnitCost,
    input.platformFeePct,
    input.fixedFeePerOrder,
  );

  return {
    sellableUnits: input.sellableUnits,
    materialCost: round2(input.materialCost),
    machineCost: round2(input.machineCost),
    productionLossCost: round2(input.productionLossCost),
    batchLaborCost: round2(batchLaborCost),
    perUnitLaborCost: round2(perUnitLaborCost),
    packagingCost: round2(packagingCost),
    extraCost: round2(input.extraCost),
    subtotalCost: round2(subtotalCost),
    bufferCost: round2(bufferCost),
    totalCost: round2(totalCost),
    unitCost: roundedUnitCost,
    minimumViablePrice,
    suggestedPrice,
    profitPerUnit,
    profitPerBatch,
    estimatedMarginPct,
  };
}

function validateInput(input: ProductionPricingInput): void {
  if (!Number.isInteger(input.sellableUnits) || input.sellableUnits <= 0) {
    throw new Error("sellableUnits must be a positive integer");
  }

  for (const field of REQUIRED_NUMERIC_FIELDS) {
    assertFiniteNonnegative(field, input[field]);
  }

  if (input.minimumPrice !== null) {
    assertFiniteNonnegative("minimumPrice", input.minimumPrice);
  }

  if (input.targetMarginPct + input.platformFeePct >= 0.95) {
    throw new Error("target margin plus platform fee must be less than 0.95");
  }
}

function assertFiniteNonnegative(field: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be finite and nonnegative`);
  }
}

function calcSuggestedPrice(input: ProductionPricingInput, unitCost: number): number {
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
