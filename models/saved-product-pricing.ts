import { db } from "../lib/db.js";
import {
  calculatePriceQuote,
  type PriceQuoteRequest,
  type PriceQuoteResult,
  type QuoteAttempt,
} from "./price-quotes.js";
import {
  createProduct,
  listProducts,
  type CreateProductInput,
  type ProductSummary,
} from "./products.js";

export type SaveProductPricingRequest = {
  job_ids: number[];
  sellable_units: number;
  batch_labor_minutes: number;
  per_unit_labor_minutes: number;
  packaging_cost_per_unit: number;
  extra_cost: number;
  target_margin_pct?: number;
  product_id?: number;
  new_product?: {
    name: string;
    designer?: string | null;
    source_id?: string | null;
    license_id?: string | null;
    model_url?: string | null;
    notes?: string | null;
  };
  notes?: string | null;
};

export type SavedPriceSnapshot = {
  id: number;
  batch_id: number;
  channel: "direct" | "etsy";
  created_at: string;
  quote: PriceQuoteResult;
};

export type SavedProductPricing = {
  product: ProductSummary;
  batch_id: number;
  snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
};

export type SavedProductPricingBatch = {
  batch_id: number;
  created_at: string;
  sellable_units: number;
  job_ids: number[];
  notes: string | null;
  snapshots: { direct: SavedPriceSnapshot; etsy: SavedPriceSnapshot };
};

export class SavedProductPricingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SavedProductPricingValidationError";
  }
}

type NormalizedSaveRequest = {
  jobIds: number[];
  sellableUnits: number;
  batchLaborMinutes: number;
  perUnitLaborMinutes: number;
  packagingCostPerUnit: number;
  extraCost: number;
  targetMarginPct: number | undefined;
  productId: number | undefined;
  newProduct: CreateProductInput | undefined;
  notes: string | null;
};

type SnapshotChannel = "direct" | "etsy";

type SnapshotRow = {
  id: number;
  batch_id: number;
  channel: SnapshotChannel;
  target_margin_pct: number;
  platform_fee_pct: number;
  fixed_fee_per_order: number;
  labor_hourly_rate: number;
  material_cost: number;
  machine_cost: number;
  production_loss_cost: number;
  batch_labor_cost: number;
  per_unit_labor_cost: number;
  packaging_cost: number;
  extra_cost: number;
  subtotal_cost: number;
  buffer_cost: number;
  total_cost: number;
  unit_cost: number;
  minimum_viable_price: number;
  suggested_price: number;
  profit_per_unit: number;
  profit_per_batch: number;
  estimated_margin_pct: number;
  input_json: string;
  assumptions_json: string;
  warnings_json: string;
  breakdown_json: string;
  created_at: string;
};

type BatchHistoryRow = {
  id: number;
  created_at: string;
  notes: string | null;
};

type StoredSnapshotInput = PriceQuoteRequest & {
  attempts: QuoteAttempt[];
};

type ValidatedSnapshot = {
  input: StoredSnapshotInput;
  snapshot: SavedPriceSnapshot;
};

const insertBatchStatement = db.prepare(`
  INSERT INTO product_batches (
    product_id,
    pricing_profile_id,
    planned_quantity,
    completed_quantity,
    failed_quantity,
    setup_minutes,
    handling_minutes_per_unit,
    packaging_cost_per_unit,
    target_margin_pct,
    platform_fee_pct,
    source_type,
    extra_cost,
    notes
  ) VALUES (
    @product_id,
    'booth',
    @sellable_units,
    @sellable_units,
    0,
    @batch_labor_minutes,
    @per_unit_labor_minutes,
    @packaging_cost_per_unit,
    @target_margin_pct,
    @platform_fee_pct,
    'price_quote',
    @extra_cost,
    @notes
  )
`);

const insertBatchJobStatement = db.prepare(`
  INSERT INTO product_batch_jobs (batch_id, job_id, relationship)
  VALUES (?, ?, 'production')
`);

const insertSnapshotStatement = db.prepare(`
  INSERT INTO product_price_snapshots (
    batch_id,
    channel,
    target_margin_pct,
    platform_fee_pct,
    fixed_fee_per_order,
    labor_hourly_rate,
    material_cost,
    machine_cost,
    production_loss_cost,
    batch_labor_cost,
    per_unit_labor_cost,
    packaging_cost,
    extra_cost,
    subtotal_cost,
    buffer_cost,
    total_cost,
    unit_cost,
    minimum_viable_price,
    suggested_price,
    profit_per_unit,
    profit_per_batch,
    estimated_margin_pct,
    input_json,
    assumptions_json,
    warnings_json,
    breakdown_json
  ) VALUES (
    @batch_id,
    @channel,
    @target_margin_pct,
    @platform_fee_pct,
    @fixed_fee_per_order,
    @labor_hourly_rate,
    @material_cost,
    @machine_cost,
    @production_loss_cost,
    @batch_labor_cost,
    @per_unit_labor_cost,
    @packaging_cost,
    @extra_cost,
    @subtotal_cost,
    @buffer_cost,
    @total_cost,
    @unit_cost,
    @minimum_viable_price,
    @suggested_price,
    @profit_per_unit,
    @profit_per_batch,
    @estimated_margin_pct,
    @input_json,
    @assumptions_json,
    @warnings_json,
    @breakdown_json
  )
`);

const SNAPSHOT_SELECT = `
  SELECT
    id,
    batch_id,
    channel,
    target_margin_pct,
    platform_fee_pct,
    fixed_fee_per_order,
    labor_hourly_rate,
    material_cost,
    machine_cost,
    production_loss_cost,
    batch_labor_cost,
    per_unit_labor_cost,
    packaging_cost,
    extra_cost,
    subtotal_cost,
    buffer_cost,
    total_cost,
    unit_cost,
    minimum_viable_price,
    suggested_price,
    profit_per_unit,
    profit_per_batch,
    estimated_margin_pct,
    input_json,
    assumptions_json,
    warnings_json,
    breakdown_json,
    created_at
  FROM product_price_snapshots
`;

const getSnapshotStatement = db.prepare<[number, SnapshotChannel], SnapshotRow>(`
  ${SNAPSHOT_SELECT}
  WHERE batch_id = ? AND channel = ?
`);

const updateProductProjectionStatement = db.prepare(`
  UPDATE products
  SET
    booth_price = ?,
    etsy_price = ?,
    target_sale_price = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

const saveTransaction = db.transaction(
  (
    normalized: NormalizedSaveRequest,
    direct: PriceQuoteResult,
    etsy: PriceQuoteResult,
  ): SavedProductPricing => {
    const product = normalized.newProduct
      ? createProduct(normalized.newProduct)
      : findProduct(normalized.productId!);
    if (!product) {
      throw new SavedProductPricingValidationError(`Unknown product_id: ${normalized.productId}`);
    }

    const batchResult = insertBatchStatement.run({
      product_id: product.id,
      sellable_units: normalized.sellableUnits,
      batch_labor_minutes: normalized.batchLaborMinutes,
      per_unit_labor_minutes: normalized.perUnitLaborMinutes,
      packaging_cost_per_unit: normalized.packagingCostPerUnit,
      target_margin_pct: direct.assumptions.target_margin_pct,
      platform_fee_pct: direct.assumptions.platform_fee_pct,
      extra_cost: normalized.extraCost,
      notes: normalized.notes,
    });
    const batchId = Number(batchResult.lastInsertRowid);

    for (const jobId of normalized.jobIds) {
      insertBatchJobStatement.run(batchId, jobId);
    }

    const directSnapshot = insertSnapshot(batchId, normalized, direct);
    const etsySnapshot = insertSnapshot(batchId, normalized, etsy);

    updateProductProjectionStatement.run(
      direct.breakdown.suggestedPrice,
      etsy.breakdown.suggestedPrice,
      direct.breakdown.suggestedPrice,
      product.id,
    );
    const projectedProduct = findProduct(product.id);
    if (!projectedProduct) {
      throw new SavedProductPricingValidationError(
        `Product not found after pricing update: ${product.id}`,
      );
    }

    return {
      product: projectedProduct,
      batch_id: batchId,
      snapshots: { direct: directSnapshot, etsy: etsySnapshot },
    };
  },
);

export function saveProductPricing(input: SaveProductPricingRequest): SavedProductPricing {
  const normalized = normalizeSaveRequest(input);
  const commonQuoteInput = {
    job_ids: normalized.jobIds,
    sellable_units: normalized.sellableUnits,
    batch_labor_minutes: normalized.batchLaborMinutes,
    per_unit_labor_minutes: normalized.perUnitLaborMinutes,
    packaging_cost_per_unit: normalized.packagingCostPerUnit,
    extra_cost: normalized.extraCost,
    ...(normalized.targetMarginPct === undefined
      ? {}
      : { target_margin_pct: normalized.targetMarginPct }),
  };
  const direct = calculatePriceQuote({ ...commonQuoteInput, channel: "direct" });
  const etsy = calculatePriceQuote({ ...commonQuoteInput, channel: "etsy" });

  return saveTransaction(normalized, direct, etsy);
}

export function listProductPricingHistory(productId: number): SavedProductPricingBatch[] {
  const normalizedProductId = normalizePositiveInteger(productId, "product_id");
  const batches = db
    .prepare<[number], BatchHistoryRow>(
      `SELECT id, created_at, notes
       FROM product_batches
       WHERE product_id = ? AND source_type = 'price_quote'
       ORDER BY created_at DESC, id DESC`,
    )
    .all(normalizedProductId);
  const getSnapshots = db.prepare<[number], SnapshotRow>(`
    ${SNAPSHOT_SELECT}
    WHERE batch_id = ?
    ORDER BY id
  `);

  return batches.map((batch) => {
    const snapshots = getSnapshots.all(batch.id);
    const directRows = snapshots.filter((snapshot) => snapshot.channel === "direct");
    const etsyRows = snapshots.filter((snapshot) => snapshot.channel === "etsy");
    if (snapshots.length !== 2 || directRows.length !== 1 || etsyRows.length !== 1) {
      throw new SavedProductPricingValidationError(
        `Saved pricing Batch ${batch.id} is incomplete: expected one direct and one etsy snapshot`,
      );
    }

    const direct = snapshotFromRow(directRows[0]!);
    const etsy = snapshotFromRow(etsyRows[0]!);
    validateSnapshotPair(batch.id, direct, etsy);

    return {
      batch_id: batch.id,
      created_at: batch.created_at,
      sellable_units: direct.input.sellable_units,
      job_ids: direct.input.job_ids,
      notes: batch.notes,
      snapshots: {
        direct: direct.snapshot,
        etsy: etsy.snapshot,
      },
    };
  });
}

function insertSnapshot(
  batchId: number,
  normalized: NormalizedSaveRequest,
  quote: PriceQuoteResult,
): SavedPriceSnapshot {
  const input: StoredSnapshotInput = {
    job_ids: normalized.jobIds,
    sellable_units: normalized.sellableUnits,
    batch_labor_minutes: normalized.batchLaborMinutes,
    per_unit_labor_minutes: normalized.perUnitLaborMinutes,
    packaging_cost_per_unit: normalized.packagingCostPerUnit,
    extra_cost: normalized.extraCost,
    channel: quote.channel,
    ...(normalized.targetMarginPct === undefined
      ? {}
      : { target_margin_pct: normalized.targetMarginPct }),
    attempts: quote.attempts,
  };
  const { assumptions, breakdown } = quote;
  insertSnapshotStatement.run({
    batch_id: batchId,
    channel: quote.channel,
    target_margin_pct: assumptions.target_margin_pct,
    platform_fee_pct: assumptions.platform_fee_pct,
    fixed_fee_per_order: assumptions.fixed_fee_per_order,
    labor_hourly_rate: assumptions.labor_hourly_rate,
    material_cost: breakdown.materialCost,
    machine_cost: breakdown.machineCost,
    production_loss_cost: breakdown.productionLossCost,
    batch_labor_cost: breakdown.batchLaborCost,
    per_unit_labor_cost: breakdown.perUnitLaborCost,
    packaging_cost: breakdown.packagingCost,
    extra_cost: breakdown.extraCost,
    subtotal_cost: breakdown.subtotalCost,
    buffer_cost: breakdown.bufferCost,
    total_cost: breakdown.totalCost,
    unit_cost: breakdown.unitCost,
    minimum_viable_price: breakdown.minimumViablePrice,
    suggested_price: breakdown.suggestedPrice,
    profit_per_unit: breakdown.profitPerUnit,
    profit_per_batch: breakdown.profitPerBatch,
    estimated_margin_pct: breakdown.estimatedMarginPct,
    input_json: JSON.stringify(input),
    assumptions_json: JSON.stringify(assumptions),
    warnings_json: JSON.stringify(quote.warnings),
    breakdown_json: JSON.stringify(breakdown),
  });

  const row = getSnapshotStatement.get(batchId, quote.channel);
  if (!row) {
    throw new SavedProductPricingValidationError(
      `Price snapshot not found after insert for Batch ${batchId}: ${quote.channel}`,
    );
  }
  return snapshotFromRow(row).snapshot;
}

function snapshotFromRow(row: SnapshotRow): ValidatedSnapshot {
  try {
    const input = JSON.parse(row.input_json) as unknown;
    const assumptions = JSON.parse(row.assumptions_json) as unknown;
    const warnings = JSON.parse(row.warnings_json) as unknown;
    const breakdown = JSON.parse(row.breakdown_json) as unknown;
    if (
      !isStoredSnapshotInput(input, row.channel) ||
      !isQuoteAssumptions(assumptions) ||
      !Array.isArray(warnings) ||
      !warnings.every((warning) => typeof warning === "string") ||
      !isQuoteBreakdown(breakdown)
    ) {
      throw new Error("invalid saved quote JSON");
    }
    validateSnapshotRecord(row, input, assumptions, breakdown);

    return {
      input,
      snapshot: {
        id: row.id,
        batch_id: row.batch_id,
        channel: row.channel,
        created_at: row.created_at,
        quote: {
          channel: row.channel,
          assumptions,
          attempts: input.attempts,
          warnings,
          breakdown,
        },
      },
    };
  } catch (error) {
    if (error instanceof SavedProductPricingValidationError) throw error;
    throw new SavedProductPricingValidationError(
      `Saved pricing snapshot ${row.id} contains invalid JSON`,
    );
  }
}

function validateSnapshotRecord(
  row: SnapshotRow,
  input: StoredSnapshotInput,
  assumptions: PriceQuoteResult["assumptions"],
  breakdown: PriceQuoteResult["breakdown"],
): void {
  const inputJobIds = input.job_ids;
  const attemptJobIds = input.attempts.map((attempt) => attempt.job_id);
  const hasValidMargin =
    assumptions.target_margin_pct < 0.95 &&
    assumptions.target_margin_pct + assumptions.platform_fee_pct < 0.95;
  const hasValidChannelFees =
    row.channel === "etsy" ||
    (assumptions.platform_fee_pct === 0 && assumptions.fixed_fee_per_order === 0);
  const requestedMarginMatches =
    input.target_margin_pct === undefined ||
    input.target_margin_pct === assumptions.target_margin_pct;
  const inputCostsMatch =
    breakdown.sellableUnits === input.sellable_units &&
    breakdown.batchLaborCost ===
      round2((input.batch_labor_minutes * assumptions.labor_hourly_rate) / 60) &&
    breakdown.perUnitLaborCost ===
      round2(
        (input.sellable_units * input.per_unit_labor_minutes * assumptions.labor_hourly_rate) / 60,
      ) &&
    breakdown.packagingCost === round2(input.sellable_units * input.packaging_cost_per_unit) &&
    breakdown.extraCost === round2(input.extra_cost);
  const resolvedJobsMatch = assumptions.resolved_rates.every((rate) =>
    inputJobIds.includes(rate.job_id),
  );

  if (
    !deepEqual(inputJobIds, attemptJobIds) ||
    !hasValidMargin ||
    !hasValidChannelFees ||
    !requestedMarginMatches ||
    !inputCostsMatch ||
    !resolvedJobsMatch ||
    !snapshotScalarsMatchJson(row, assumptions, breakdown)
  ) {
    throw new Error("invalid saved quote invariants");
  }
}

function snapshotScalarsMatchJson(
  row: SnapshotRow,
  assumptions: PriceQuoteResult["assumptions"],
  breakdown: PriceQuoteResult["breakdown"],
): boolean {
  return (
    row.target_margin_pct === assumptions.target_margin_pct &&
    row.platform_fee_pct === assumptions.platform_fee_pct &&
    row.fixed_fee_per_order === assumptions.fixed_fee_per_order &&
    row.labor_hourly_rate === assumptions.labor_hourly_rate &&
    row.material_cost === breakdown.materialCost &&
    row.machine_cost === breakdown.machineCost &&
    row.production_loss_cost === breakdown.productionLossCost &&
    row.batch_labor_cost === breakdown.batchLaborCost &&
    row.per_unit_labor_cost === breakdown.perUnitLaborCost &&
    row.packaging_cost === breakdown.packagingCost &&
    row.extra_cost === breakdown.extraCost &&
    row.subtotal_cost === breakdown.subtotalCost &&
    row.buffer_cost === breakdown.bufferCost &&
    row.total_cost === breakdown.totalCost &&
    row.unit_cost === breakdown.unitCost &&
    row.minimum_viable_price === breakdown.minimumViablePrice &&
    row.suggested_price === breakdown.suggestedPrice &&
    row.profit_per_unit === breakdown.profitPerUnit &&
    row.profit_per_batch === breakdown.profitPerBatch &&
    row.estimated_margin_pct === breakdown.estimatedMarginPct
  );
}

function validateSnapshotPair(
  batchId: number,
  direct: ValidatedSnapshot,
  etsy: ValidatedSnapshot,
): void {
  const directInput = { ...direct.input, channel: undefined };
  const etsyInput = { ...etsy.input, channel: undefined };
  const directQuote = direct.snapshot.quote;
  const etsyQuote = etsy.snapshot.quote;
  const sharedAssumptionsMatch =
    directQuote.assumptions.labor_hourly_rate === etsyQuote.assumptions.labor_hourly_rate &&
    directQuote.assumptions.failure_buffer_pct === etsyQuote.assumptions.failure_buffer_pct &&
    directQuote.assumptions.overhead_buffer_pct === etsyQuote.assumptions.overhead_buffer_pct &&
    deepEqual(directQuote.assumptions.resolved_rates, etsyQuote.assumptions.resolved_rates);
  const manufacturingFields = [
    "materialCost",
    "machineCost",
    "productionLossCost",
    "batchLaborCost",
    "perUnitLaborCost",
    "packagingCost",
    "extraCost",
    "subtotalCost",
    "bufferCost",
    "totalCost",
    "unitCost",
  ] as const;
  const manufacturingCostsMatch = manufacturingFields.every(
    (field) => directQuote.breakdown[field] === etsyQuote.breakdown[field],
  );

  if (
    !deepEqual(directInput, etsyInput) ||
    !deepEqual(directQuote.warnings, etsyQuote.warnings) ||
    !sharedAssumptionsMatch ||
    !manufacturingCostsMatch
  ) {
    throw new SavedProductPricingValidationError(
      `Saved pricing Batch ${batchId} contains conflicting direct and etsy snapshots`,
    );
  }
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length && left.every((value, index) => deepEqual(value, right[index]))
    );
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => key in right && deepEqual(left[key], right[key]))
    );
  }
  return false;
}

function isStoredSnapshotInput(
  value: unknown,
  channel: SnapshotChannel,
): value is StoredSnapshotInput {
  if (!isRecord(value) || value["channel"] !== channel) return false;
  if (
    !Array.isArray(value["job_ids"]) ||
    value["job_ids"].length === 0 ||
    !value["job_ids"].every(isPositiveInteger) ||
    !isPositiveInteger(value["sellable_units"])
  ) {
    return false;
  }
  for (const field of [
    "batch_labor_minutes",
    "per_unit_labor_minutes",
    "packaging_cost_per_unit",
    "extra_cost",
  ]) {
    if (!isNonnegativeNumber(value[field])) return false;
  }
  if (
    value["target_margin_pct"] !== undefined &&
    (!isNonnegativeNumber(value["target_margin_pct"]) || value["target_margin_pct"] >= 0.95)
  ) {
    return false;
  }
  return Array.isArray(value["attempts"]) && value["attempts"].every(isQuoteAttempt);
}

function isQuoteAttempt(value: unknown): value is QuoteAttempt {
  return (
    isRecord(value) &&
    isPositiveInteger(value["job_id"]) &&
    typeof value["title"] === "string" &&
    typeof value["status"] === "string" &&
    typeof value["printer"] === "string" &&
    isNonnegativeNumber(value["material_cost"]) &&
    isNonnegativeNumber(value["machine_cost"]) &&
    isNonnegativeNumber(value["production_loss_cost"])
  );
}

function isQuoteAssumptions(value: unknown): value is PriceQuoteResult["assumptions"] {
  if (!isRecord(value)) return false;
  for (const field of [
    "labor_hourly_rate",
    "target_margin_pct",
    "platform_fee_pct",
    "fixed_fee_per_order",
    "failure_buffer_pct",
    "overhead_buffer_pct",
  ]) {
    if (!isNonnegativeNumber(value[field])) return false;
  }
  const resolvedRates = value["resolved_rates"];
  return Array.isArray(resolvedRates) && resolvedRates.every(isResolvedRateAssumption);
}

function isResolvedRateAssumption(value: unknown): boolean {
  return (
    isRecord(value) &&
    isPositiveInteger(value["job_id"]) &&
    typeof value["task_id"] === "string" &&
    typeof value["material_type"] === "string" &&
    isNonnegativeNumber(value["material_rate_per_kg"]) &&
    typeof value["printer"] === "string" &&
    isNonnegativeNumber(value["machine_rate_per_hr"]) &&
    typeof value["used_material_fallback"] === "boolean" &&
    typeof value["used_machine_fallback"] === "boolean"
  );
}

function isQuoteBreakdown(value: unknown): value is PriceQuoteResult["breakdown"] {
  if (!isRecord(value) || !isPositiveInteger(value["sellableUnits"])) return false;
  for (const field of [
    "materialCost",
    "machineCost",
    "productionLossCost",
    "batchLaborCost",
    "perUnitLaborCost",
    "packagingCost",
    "extraCost",
    "subtotalCost",
    "bufferCost",
    "totalCost",
    "unitCost",
    "minimumViablePrice",
    "suggestedPrice",
    "profitPerUnit",
    "profitPerBatch",
    "estimatedMarginPct",
  ]) {
    if (!isNonnegativeNumber(value[field])) return false;
  }
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonnegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeSaveRequest(input: SaveProductPricingRequest): NormalizedSaveRequest {
  if (!input || typeof input !== "object") {
    throw new SavedProductPricingValidationError("input must be an object");
  }
  const hasProductId = input.product_id !== undefined;
  const hasNewProduct = input.new_product !== undefined;
  if (hasProductId === hasNewProduct) {
    throw new SavedProductPricingValidationError(
      "Exactly one of product_id and new_product is required",
    );
  }

  if (!Array.isArray(input.job_ids) || input.job_ids.length === 0) {
    throw new SavedProductPricingValidationError("job_ids must contain at least one job");
  }
  const jobIds: number[] = [];
  const seen = new Set<number>();
  for (const jobId of input.job_ids) {
    const normalizedJobId = normalizePositiveInteger(jobId, "job_ids");
    if (!seen.has(normalizedJobId)) {
      seen.add(normalizedJobId);
      jobIds.push(normalizedJobId);
    }
  }

  const sellableUnits = normalizePositiveInteger(input.sellable_units, "sellable_units");
  const batchLaborMinutes = normalizeNonnegative(input.batch_labor_minutes, "batch_labor_minutes");
  const perUnitLaborMinutes = normalizeNonnegative(
    input.per_unit_labor_minutes,
    "per_unit_labor_minutes",
  );
  const packagingCostPerUnit = normalizeNonnegative(
    input.packaging_cost_per_unit,
    "packaging_cost_per_unit",
  );
  const extraCost = normalizeNonnegative(input.extra_cost, "extra_cost");
  const targetMarginPct =
    input.target_margin_pct === undefined
      ? undefined
      : normalizeNonnegative(input.target_margin_pct, "target_margin_pct");
  if (targetMarginPct !== undefined && targetMarginPct >= 0.95) {
    throw new SavedProductPricingValidationError("target_margin_pct must be less than 0.95");
  }

  let productId: number | undefined;
  let newProduct: CreateProductInput | undefined;
  if (hasProductId) {
    productId = normalizePositiveInteger(input.product_id, "product_id");
  } else {
    if (!input.new_product || typeof input.new_product !== "object") {
      throw new SavedProductPricingValidationError("new_product must be an object");
    }
    newProduct = { ...input.new_product };
  }

  return {
    jobIds,
    sellableUnits,
    batchLaborMinutes,
    perUnitLaborMinutes,
    packagingCostPerUnit,
    extraCost,
    targetMarginPct,
    productId,
    newProduct,
    notes: normalizeNullableText(input.notes, "notes"),
  };
}

function findProduct(productId: number): ProductSummary | undefined {
  return listProducts().find((product) => product.id === productId);
}

function normalizePositiveInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new SavedProductPricingValidationError(`${field} must be a positive integer`);
  }
  return value;
}

function normalizeNonnegative(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SavedProductPricingValidationError(`${field} must be a finite non-negative number`);
  }
  return value;
}

function normalizeNullableText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new SavedProductPricingValidationError(`${field} must be a string or null`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
