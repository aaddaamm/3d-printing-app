import { calcBatchPricing } from "../lib/batch-pricing.js";
import { db } from "../lib/db.js";
import type { MachineRate, MaterialRate } from "../lib/types.js";
import { loadRatesConfig } from "./rates.js";

export interface BatchSummary {
  id: number;
  product_id: number;
  product_name: string;
  pricing_profile_id: string;
  pricing_profile_label: string;
  planned_quantity: number;
  completed_quantity: number;
  failed_quantity: number;
  material_type: string | null;
  primary_color: string | null;
  total_filament_g: number | null;
  total_print_time_s: number | null;
  setup_minutes: number | null;
  handling_minutes_per_unit: number | null;
  packaging_cost_per_unit: number | null;
  unit_cost: number | null;
  suggested_price: number | null;
  estimated_margin_pct: number | null;
  notes: string | null;
}

export interface CreateBatchInput {
  product_id: number;
  pricing_profile_id: string;
  planned_quantity?: number;
  completed_quantity?: number;
  failed_quantity?: number;
  material_type?: string | null;
  primary_color?: string | null;
  printer_id?: number | null;
  total_filament_g?: number | null;
  total_print_time_s?: number | null;
  setup_minutes?: number | null;
  handling_minutes_per_unit?: number | null;
  packaging_cost_per_unit?: number | null;
  target_margin_pct?: number | null;
  platform_fee_pct?: number | null;
  notes?: string | null;
}

export type UpdateBatchInput = Partial<CreateBatchInput>;

export class BatchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BatchValidationError";
  }
}

interface BatchRow {
  id: number;
  product_id: number;
  product_name: string;
  product_default_material: string | null;
  product_primary_color: string | null;
  preferred_printer_id: number | null;
  product_packaging_cost: number | null;
  product_handling_minutes: number | null;
  product_target_margin_pct: number | null;
  pricing_profile_id: string;
  pricing_profile_label: string;
  profile_target_margin_pct: number;
  profile_platform_fee_pct: number;
  profile_failure_buffer_pct: number;
  profile_overhead_buffer_pct: number;
  profile_default_packaging_cost: number;
  profile_default_setup_minutes: number;
  profile_default_handling_minutes: number;
  profile_minimum_price: number | null;
  planned_quantity: number;
  completed_quantity: number;
  failed_quantity: number;
  batch_material_type: string | null;
  batch_primary_color: string | null;
  printer_id: number | null;
  explicit_total_filament_g: number | null;
  explicit_total_print_time_s: number | null;
  linked_total_filament_g: number | null;
  linked_total_print_time_s: number | null;
  linked_device_model: string | null;
  setup_minutes: number | null;
  handling_minutes_per_unit: number | null;
  packaging_cost_per_unit: number | null;
  batch_target_margin_pct: number | null;
  batch_platform_fee_pct: number | null;
  notes: string | null;
}

const BATCH_SELECT = `
  SELECT
    b.id,
    b.product_id,
    p.name AS product_name,
    p.default_material AS product_default_material,
    p.primary_color AS product_primary_color,
    p.preferred_printer_id,
    p.packaging_cost AS product_packaging_cost,
    p.handling_minutes AS product_handling_minutes,
    p.target_margin_pct AS product_target_margin_pct,
    b.pricing_profile_id,
    pp.label AS pricing_profile_label,
    pp.target_margin_pct AS profile_target_margin_pct,
    pp.platform_fee_pct AS profile_platform_fee_pct,
    pp.failure_buffer_pct AS profile_failure_buffer_pct,
    pp.overhead_buffer_pct AS profile_overhead_buffer_pct,
    pp.default_packaging_cost AS profile_default_packaging_cost,
    pp.default_setup_minutes AS profile_default_setup_minutes,
    pp.default_handling_minutes AS profile_default_handling_minutes,
    pp.minimum_price AS profile_minimum_price,
    b.planned_quantity,
    b.completed_quantity,
    b.failed_quantity,
    b.material_type AS batch_material_type,
    b.primary_color AS batch_primary_color,
    b.printer_id,
    b.total_filament_g AS explicit_total_filament_g,
    b.total_print_time_s AS explicit_total_print_time_s,
    linked.total_filament_g AS linked_total_filament_g,
    linked.total_print_time_s AS linked_total_print_time_s,
    linked.device_model AS linked_device_model,
    b.setup_minutes,
    b.handling_minutes_per_unit,
    b.packaging_cost_per_unit,
    b.target_margin_pct AS batch_target_margin_pct,
    b.platform_fee_pct AS batch_platform_fee_pct,
    b.notes
  FROM product_batches b
  JOIN products p ON p.id = b.product_id
  JOIN pricing_profiles pp ON pp.id = b.pricing_profile_id
  LEFT JOIN (
    SELECT
      pbj.batch_id,
      SUM(COALESCE(j.total_weight_g, 0)) AS total_filament_g,
      SUM(COALESCE(j.total_time_s, 0)) AS total_print_time_s,
      MIN(j.deviceModel) AS device_model
    FROM product_batch_jobs pbj
    JOIN jobs j ON j.id = pbj.job_id
    GROUP BY pbj.batch_id
  ) linked ON linked.batch_id = b.id
`;

const MUTABLE_COLUMNS = [
  "product_id",
  "pricing_profile_id",
  "planned_quantity",
  "completed_quantity",
  "failed_quantity",
  "material_type",
  "primary_color",
  "printer_id",
  "total_filament_g",
  "total_print_time_s",
  "setup_minutes",
  "handling_minutes_per_unit",
  "packaging_cost_per_unit",
  "target_margin_pct",
  "platform_fee_pct",
  "notes",
] as const;

type BatchColumn = (typeof MUTABLE_COLUMNS)[number];

function getProduct(id: number): { id: number } | undefined {
  return db.prepare<[number], { id: number }>("SELECT id FROM products WHERE id = ?").get(id);
}

function getPricingProfile(id: string): { id: string } | undefined {
  return db
    .prepare<[string], { id: string }>("SELECT id FROM pricing_profiles WHERE id = ?")
    .get(id);
}

function getPrinter(id: number): { id: number } | undefined {
  return db.prepare<[number], { id: number }>("SELECT id FROM printers WHERE id = ?").get(id);
}

function getJob(id: number): { id: number } | undefined {
  return db.prepare<[number], { id: number }>("SELECT id FROM jobs WHERE id = ?").get(id);
}

function normalizePositiveInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new BatchValidationError(`${field} must be a positive integer`);
  }
  return value;
}

function normalizeNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BatchValidationError(`${field} must be a non-negative integer`);
  }
  return value;
}

function normalizeNullableNonNegativeNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new BatchValidationError(`${field} must be a non-negative number or null`);
  }
  return value;
}

function normalizeNullableNonNegativeInteger(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new BatchValidationError(`${field} must be a non-negative integer or null`);
  }
  return value;
}

function normalizeNullablePositiveInteger(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new BatchValidationError(`${field} must be a positive integer or null`);
  }
  return value;
}

function normalizeNullableText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string")
    throw new BatchValidationError(`${field} must be a string or null`);
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeProductId(value: unknown): number {
  const productId = normalizePositiveInteger(value, "product_id");
  if (!getProduct(productId)) throw new BatchValidationError(`Unknown product_id: ${productId}`);
  return productId;
}

function normalizePricingProfileId(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BatchValidationError("pricing_profile_id must be a non-empty string");
  }
  const pricingProfileId = value.trim();
  if (!getPricingProfile(pricingProfileId)) {
    throw new BatchValidationError(`Unknown pricing_profile_id: ${pricingProfileId}`);
  }
  return pricingProfileId;
}

function normalizePrinterId(value: unknown): number | null {
  const printerId = normalizeNullablePositiveInteger(value, "printer_id");
  if (printerId !== null && !getPrinter(printerId)) {
    throw new BatchValidationError(`Unknown printer_id: ${printerId}`);
  }
  return printerId;
}

function normalizeCreateInput(input: CreateBatchInput): Record<BatchColumn, unknown> {
  return {
    product_id: normalizeProductId(input.product_id),
    pricing_profile_id: normalizePricingProfileId(input.pricing_profile_id),
    planned_quantity:
      input.planned_quantity === undefined
        ? 1
        : normalizePositiveInteger(input.planned_quantity, "planned_quantity"),
    completed_quantity:
      input.completed_quantity === undefined
        ? 0
        : normalizeNonNegativeInteger(input.completed_quantity, "completed_quantity"),
    failed_quantity:
      input.failed_quantity === undefined
        ? 0
        : normalizeNonNegativeInteger(input.failed_quantity, "failed_quantity"),
    material_type: normalizeNullableText(input.material_type, "material_type"),
    primary_color: normalizeNullableText(input.primary_color, "primary_color"),
    printer_id: normalizePrinterId(input.printer_id),
    total_filament_g: normalizeNullableNonNegativeNumber(
      input.total_filament_g,
      "total_filament_g",
    ),
    total_print_time_s: normalizeNullableNonNegativeInteger(
      input.total_print_time_s,
      "total_print_time_s",
    ),
    setup_minutes: normalizeNullableNonNegativeNumber(input.setup_minutes, "setup_minutes"),
    handling_minutes_per_unit: normalizeNullableNonNegativeNumber(
      input.handling_minutes_per_unit,
      "handling_minutes_per_unit",
    ),
    packaging_cost_per_unit: normalizeNullableNonNegativeNumber(
      input.packaging_cost_per_unit,
      "packaging_cost_per_unit",
    ),
    target_margin_pct: normalizeNullableNonNegativeNumber(
      input.target_margin_pct,
      "target_margin_pct",
    ),
    platform_fee_pct: normalizeNullableNonNegativeNumber(
      input.platform_fee_pct,
      "platform_fee_pct",
    ),
    notes: normalizeNullableText(input.notes, "notes"),
  };
}

function normalizeUpdateField(column: BatchColumn, value: unknown): unknown {
  switch (column) {
    case "product_id":
      return normalizeProductId(value);
    case "pricing_profile_id":
      return normalizePricingProfileId(value);
    case "planned_quantity":
      return normalizePositiveInteger(value, "planned_quantity");
    case "completed_quantity":
    case "failed_quantity":
      return normalizeNonNegativeInteger(value, column);
    case "printer_id":
      return normalizePrinterId(value);
    case "total_print_time_s":
      return normalizeNullableNonNegativeInteger(value, column);
    case "total_filament_g":
    case "setup_minutes":
    case "handling_minutes_per_unit":
    case "packaging_cost_per_unit":
    case "target_margin_pct":
    case "platform_fee_pct":
      return normalizeNullableNonNegativeNumber(value, column);
    case "material_type":
    case "primary_color":
    case "notes":
      return normalizeNullableText(value, column);
  }
}

function materialRateFor(
  row: BatchRow,
  materialRates: ReadonlyMap<string, MaterialRate>,
): MaterialRate | null {
  const materialType = row.batch_material_type ?? row.product_default_material;
  if (materialType && materialRates.has(materialType)) return materialRates.get(materialType)!;
  const productDefault = row.product_default_material;
  if (productDefault && materialRates.has(productDefault))
    return materialRates.get(productDefault)!;
  return materialRates.get("PLA") ?? null;
}

function printerModel(printerId: number | null): string | null {
  if (printerId == null) return null;
  const row = db
    .prepare<[number], { model: string | null }>("SELECT model FROM printers WHERE id = ?")
    .get(printerId);
  return row?.model ?? null;
}

function machineRateFor(
  row: BatchRow,
  machineRates: ReadonlyMap<string, MachineRate>,
  fallbackMachine: MachineRate,
): MachineRate {
  const preferredPrinterModel = printerModel(row.preferred_printer_id);
  if (preferredPrinterModel && machineRates.has(preferredPrinterModel)) {
    return machineRates.get(preferredPrinterModel)!;
  }
  if (row.linked_device_model && machineRates.has(row.linked_device_model)) {
    return machineRates.get(row.linked_device_model)!;
  }
  return fallbackMachine;
}

function computedTotals(row: BatchRow): {
  total_filament_g: number | null;
  total_print_time_s: number | null;
} {
  return {
    total_filament_g: row.explicit_total_filament_g ?? row.linked_total_filament_g ?? null,
    total_print_time_s: row.explicit_total_print_time_s ?? row.linked_total_print_time_s ?? null,
  };
}

function summaryFromRow(row: BatchRow): BatchSummary {
  const totals = computedTotals(row);
  let unitCost: number | null = null;
  let suggestedPrice: number | null = null;
  let estimatedMarginPct: number | null = null;

  if (row.completed_quantity > 0) {
    const ratesConfig = loadRatesConfig();
    const materialRate = ratesConfig ? materialRateFor(row, ratesConfig.materialRates) : null;
    if (ratesConfig && materialRate) {
      const machineRate = machineRateFor(
        row,
        ratesConfig.machineRates,
        ratesConfig.fallbackMachine,
      );
      const breakdown = calcBatchPricing({
        completedQuantity: row.completed_quantity,
        failedQuantity: row.failed_quantity,
        totalFilamentG: totals.total_filament_g ?? 0,
        totalPrintTimeS: totals.total_print_time_s ?? 0,
        materialRatePerG: materialRate.rate_per_g,
        machineRatePerHr: machineRate.machine_rate_per_hr,
        laborHourlyRate: ratesConfig.laborConfig.hourly_rate,
        setupMinutes: row.setup_minutes ?? row.profile_default_setup_minutes,
        handlingMinutesPerUnit:
          row.handling_minutes_per_unit ??
          row.product_handling_minutes ??
          row.profile_default_handling_minutes,
        packagingCostPerUnit:
          row.packaging_cost_per_unit ??
          row.product_packaging_cost ??
          row.profile_default_packaging_cost,
        targetMarginPct:
          row.batch_target_margin_pct ??
          row.product_target_margin_pct ??
          row.profile_target_margin_pct,
        platformFeePct: row.batch_platform_fee_pct ?? row.profile_platform_fee_pct,
        failureBufferPct: row.profile_failure_buffer_pct,
        overheadBufferPct: row.profile_overhead_buffer_pct,
        minimumPrice: row.profile_minimum_price,
      });
      unitCost = breakdown.unitCost;
      suggestedPrice = breakdown.suggestedPrice;
      estimatedMarginPct = breakdown.estimatedMarginPct;
    }
  }

  return {
    id: row.id,
    product_id: row.product_id,
    product_name: row.product_name,
    pricing_profile_id: row.pricing_profile_id,
    pricing_profile_label: row.pricing_profile_label,
    planned_quantity: row.planned_quantity,
    completed_quantity: row.completed_quantity,
    failed_quantity: row.failed_quantity,
    material_type: row.batch_material_type ?? row.product_default_material ?? null,
    primary_color: row.batch_primary_color ?? row.product_primary_color ?? null,
    total_filament_g: totals.total_filament_g,
    total_print_time_s: totals.total_print_time_s,
    setup_minutes: row.setup_minutes ?? row.profile_default_setup_minutes,
    handling_minutes_per_unit:
      row.handling_minutes_per_unit ??
      row.product_handling_minutes ??
      row.profile_default_handling_minutes,
    packaging_cost_per_unit:
      row.packaging_cost_per_unit ??
      row.product_packaging_cost ??
      row.profile_default_packaging_cost,
    unit_cost: unitCost,
    suggested_price: suggestedPrice,
    estimated_margin_pct: estimatedMarginPct,
    notes: row.notes,
  };
}

function getBatchRow(id: number): BatchRow | undefined {
  return db.prepare<[number], BatchRow>(`${BATCH_SELECT} WHERE b.id = ?`).get(id);
}

export function listBatches(): BatchSummary[] {
  return db
    .prepare<[], BatchRow>(`${BATCH_SELECT} ORDER BY b.created_at DESC, b.id DESC`)
    .all()
    .map(summaryFromRow);
}

export function getBatch(id: number): BatchSummary | null {
  const row = getBatchRow(id);
  return row ? summaryFromRow(row) : null;
}

export function createBatch(input: CreateBatchInput): BatchSummary {
  const values = normalizeCreateInput(input);
  const result = db
    .prepare(
      `INSERT INTO product_batches (
        product_id, pricing_profile_id, planned_quantity, completed_quantity, failed_quantity,
        material_type, primary_color, printer_id, total_filament_g, total_print_time_s,
        setup_minutes, handling_minutes_per_unit, packaging_cost_per_unit, target_margin_pct,
        platform_fee_pct, notes
      ) VALUES (
        @product_id, @pricing_profile_id, @planned_quantity, @completed_quantity, @failed_quantity,
        @material_type, @primary_color, @printer_id, @total_filament_g, @total_print_time_s,
        @setup_minutes, @handling_minutes_per_unit, @packaging_cost_per_unit, @target_margin_pct,
        @platform_fee_pct, @notes
      )`,
    )
    .run(values);

  return getBatch(result.lastInsertRowid as number)!;
}

export function updateBatch(id: number, input: UpdateBatchInput): BatchSummary | null {
  if (!getBatchRow(id)) return null;

  const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const values: Record<string, unknown> = { id };
  for (const column of MUTABLE_COLUMNS) {
    if (column in input) {
      updates.push(`${column} = @${column}`);
      values[column] = normalizeUpdateField(column, input[column]);
    }
  }

  db.prepare(`UPDATE product_batches SET ${updates.join(", ")} WHERE id = @id`).run(values);
  return getBatch(id);
}

export function addBatchJob(batchId: number, jobId: number): BatchSummary | null {
  if (!getBatchRow(batchId)) return null;
  const normalizedJobId = normalizePositiveInteger(jobId, "job_id");
  if (!getJob(normalizedJobId))
    throw new BatchValidationError(`Unknown job_id: ${normalizedJobId}`);

  db.prepare(
    `INSERT OR IGNORE INTO product_batch_jobs (batch_id, job_id, relationship)
     VALUES (?, ?, 'production')`,
  ).run(batchId, normalizedJobId);
  return getBatch(batchId);
}

export function deleteBatchJob(batchId: number, jobId: number): BatchSummary | null {
  if (!getBatchRow(batchId)) return null;
  const normalizedJobId = normalizePositiveInteger(jobId, "job_id");
  db.prepare("DELETE FROM product_batch_jobs WHERE batch_id = ? AND job_id = ?").run(
    batchId,
    normalizedJobId,
  );
  return getBatch(batchId);
}
