import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db.js";
import { readyToList, sellabilityForProduct, type SellabilityLevel } from "../lib/product-rules.js";
import type { ProductImageSourceType } from "./product-images.js";

export interface ProductSummary {
  id: number;
  name: string;
  designer: string | null;
  category_id: string | null;
  category_label: string | null;
  status_id: string;
  status_label: string;
  source_id: string | null;
  source_label: string | null;
  license_id: string | null;
  license_label: string | null;
  main_photo_id: number | null;
  main_photo_path: string | null;
  main_photo_source_type: ProductImageSourceType | null;
  image_selection_mode: "auto" | "manual";
  target_sale_price: number | null;
  restock_priority: string;
  model_url: string | null;
  etsy_listing_url: string | null;
  default_material: string | null;
  primary_color: string | null;
  accent_color: string | null;
  preferred_printer_id: number | null;
  estimated_print_time_s: number | null;
  estimated_filament_g: number | null;
  booth_price: number | null;
  etsy_price: number | null;
  packaging_cost: number | null;
  handling_minutes: number | null;
  target_margin_pct: number | null;
  pricing_notes: string | null;
  notes: string | null;
  sales_companion_visible: boolean;
  can_sell_level: SellabilityLevel;
  can_sell_label: string;
  ready_to_list: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  designer?: string | null;
  category_id?: string | null;
  status_id?: string;
  source_id?: string | null;
  license_id?: string | null;
  model_url?: string | null;
  main_file_id?: number | null;
  etsy_listing_url?: string | null;
  default_material?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  preferred_printer_id?: number | null;
  estimated_print_time_s?: number | null;
  estimated_filament_g?: number | null;
  target_sale_price?: number | null;
  booth_price?: number | null;
  etsy_price?: number | null;
  packaging_cost?: number | null;
  handling_minutes?: number | null;
  target_margin_pct?: number | null;
  pricing_notes?: string | null;
  notes?: string | null;
  is_original_design?: boolean | number;
  sales_companion_visible?: boolean | number;
  restock_priority?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

type ProductSummaryRow = Omit<
  ProductSummary,
  | "main_photo_path"
  | "sales_companion_visible"
  | "can_sell_level"
  | "can_sell_label"
  | "ready_to_list"
> & {
  main_photo_stored_path: string | null;
  sales_companion_visible: number;
  model_url: string | null;
  main_file_id: number | null;
  main_photo_id: number | null;
};

export type SalesCompanionProduct = {
  id: number;
  name: string;
  identification_image_url: string | null;
  unit_cost: number;
  production_loss_cost: number;
  direct_price: number;
  direct_margin_pct: number;
  etsy_price: number;
  etsy_margin_pct: number;
  priced_at: string;
};

type SalesCompanionProductRow = Omit<SalesCompanionProduct, "identification_image_url"> & {
  main_photo_id: number | null;
  main_photo_stored_path: string | null;
};

type ProductColumn =
  | "name"
  | "description"
  | "designer"
  | "category_id"
  | "status_id"
  | "source_id"
  | "license_id"
  | "model_url"
  | "main_file_id"
  | "etsy_listing_url"
  | "default_material"
  | "primary_color"
  | "accent_color"
  | "preferred_printer_id"
  | "estimated_print_time_s"
  | "estimated_filament_g"
  | "target_sale_price"
  | "booth_price"
  | "etsy_price"
  | "packaging_cost"
  | "handling_minutes"
  | "target_margin_pct"
  | "pricing_notes"
  | "notes"
  | "is_original_design"
  | "sales_companion_visible"
  | "restock_priority";

const PRODUCT_SELECT = `
  SELECT
    p.id,
    p.name,
    p.designer,
    p.category_id,
    pc.label AS category_label,
    COALESCE(p.status_id, 'idea') AS status_id,
    COALESCE(ps.label, 'Idea') AS status_label,
    p.source_id,
    psrc.label AS source_label,
    p.license_id,
    pl.label AS license_label,
    COALESCE(pp.path, cf.path) AS main_photo_stored_path,
    p.main_photo_id,
    pp.source_type AS main_photo_source_type,
    p.image_selection_mode,
    p.target_sale_price,
    COALESCE(p.restock_priority, 'none') AS restock_priority,
    p.model_url,
    p.etsy_listing_url,
    p.default_material,
    p.primary_color,
    p.accent_color,
    p.preferred_printer_id,
    p.estimated_print_time_s,
    p.estimated_filament_g,
    p.booth_price,
    p.etsy_price,
    p.packaging_cost,
    p.handling_minutes,
    p.target_margin_pct,
    p.pricing_notes,
    p.notes,
    p.sales_companion_visible,
    p.main_file_id
  FROM products p
  LEFT JOIN product_categories pc ON pc.id = p.category_id
  LEFT JOIN product_statuses ps ON ps.id = p.status_id
  LEFT JOIN product_sources psrc ON psrc.id = p.source_id
  LEFT JOIN product_licenses pl ON pl.id = p.license_id
  LEFT JOIN product_photos pp ON pp.id = p.main_photo_id
  LEFT JOIN catalog_files cf ON cf.id = pp.file_id
`;

const LOOKUP_TABLES = {
  category_id: "product_categories",
  status_id: "product_statuses",
  source_id: "product_sources",
  license_id: "product_licenses",
} as const;

const OPTIONAL_TEXT_FIELDS = [
  "description",
  "designer",
  "model_url",
  "etsy_listing_url",
  "default_material",
  "primary_color",
  "accent_color",
  "pricing_notes",
  "notes",
] as const;
const OPTIONAL_LOOKUP_FIELDS = ["category_id", "source_id", "license_id"] as const;
const INTEGER_FIELDS = ["main_file_id", "preferred_printer_id"] as const;
const NON_NEGATIVE_NUMBER_FIELDS = [
  "estimated_filament_g",
  "target_sale_price",
  "booth_price",
  "etsy_price",
  "packaging_cost",
  "handling_minutes",
  "target_margin_pct",
] as const;
const RESTOCK_PRIORITIES = new Set(["none", "normal", "high", "urgent"]);
const EXPLICIT_HTTP_URL_RE = /^https?:\/\//i;

export function projectProductPhotoPath(
  photoId: number,
  storedPath: string | null,
): { url: string | null; available: boolean } {
  if (!storedPath) return { url: null, available: false };
  if (EXPLICIT_HTTP_URL_RE.test(storedPath)) {
    try {
      const url = new URL(storedPath);
      if ((url.protocol === "http:" || url.protocol === "https:") && url.hostname) {
        return { url: storedPath, available: true };
      }
    } catch {
      return { url: null, available: false };
    }
    return { url: null, available: false };
  }

  try {
    const filePath = path.resolve(storedPath);
    if (fs.lstatSync(filePath).isFile()) {
      return { url: `/ui/product-photos/${photoId}`, available: true };
    }
  } catch {
    // Missing and invalid local paths are unavailable.
  }
  return { url: null, available: false };
}

function productSummaryFromRow(row: ProductSummaryRow): ProductSummary {
  const sellability = sellabilityForProduct({
    licenseId: row.license_id,
    sourceId: row.source_id,
    statusId: row.status_id,
    targetSalePrice: row.target_sale_price,
    modelUrl: row.model_url,
    mainFileId: row.main_file_id,
    mainPhotoId: row.main_photo_id,
  });

  return {
    id: row.id,
    name: row.name,
    designer: row.designer,
    category_id: row.category_id,
    category_label: row.category_label,
    status_id: row.status_id,
    status_label: row.status_label,
    source_id: row.source_id,
    source_label: row.source_label,
    license_id: row.license_id,
    license_label: row.license_label,
    main_photo_id: row.main_photo_id,
    main_photo_path: projectProductPhotoPath(row.main_photo_id ?? 0, row.main_photo_stored_path)
      .url,
    main_photo_source_type: row.main_photo_source_type,
    image_selection_mode: row.image_selection_mode,
    target_sale_price: row.target_sale_price,
    restock_priority: row.restock_priority,
    model_url: row.model_url,
    etsy_listing_url: row.etsy_listing_url,
    default_material: row.default_material,
    primary_color: row.primary_color,
    accent_color: row.accent_color,
    preferred_printer_id: row.preferred_printer_id,
    estimated_print_time_s: row.estimated_print_time_s,
    estimated_filament_g: row.estimated_filament_g,
    booth_price: row.booth_price,
    etsy_price: row.etsy_price,
    packaging_cost: row.packaging_cost,
    handling_minutes: row.handling_minutes,
    target_margin_pct: row.target_margin_pct,
    pricing_notes: row.pricing_notes,
    notes: row.notes,
    sales_companion_visible: row.sales_companion_visible === 1,
    can_sell_level: sellability.level,
    can_sell_label: sellability.label,
    ready_to_list: readyToList({
      licenseId: row.license_id,
      sourceId: row.source_id,
      statusId: row.status_id,
      targetSalePrice: row.target_sale_price,
      modelUrl: row.model_url,
      mainFileId: row.main_file_id,
      mainPhotoId: row.main_photo_id,
    }),
  };
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "product";
}

function uniqueSlug(name: string, excludeId?: number): string {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  const sql = excludeId
    ? "SELECT id FROM products WHERE slug = ? AND id != ?"
    : "SELECT id FROM products WHERE slug = ?";
  const stmt = db.prepare(sql);

  while (excludeId ? stmt.get(slug, excludeId) : stmt.get(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ProductValidationError("name must be a non-empty string");
  }
  return value.trim();
}

function normalizeNullableText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ProductValidationError(`${field} must be a string or null`);
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function lookupExists(tableName: string, id: string): boolean {
  return Boolean(db.prepare(`SELECT 1 FROM ${tableName} WHERE id = ?`).get(id));
}

function normalizeLookup(
  value: unknown,
  field: keyof typeof LOOKUP_TABLES,
  options: { required?: boolean; fallback?: string | null } = {},
): string | null {
  if (value === undefined) {
    if (options.required && options.fallback === undefined) {
      throw new ProductValidationError(`${field} is required`);
    }
    return options.fallback ?? null;
  }
  if (value === null) {
    if (options.required) throw new ProductValidationError(`${field} is required`);
    return null;
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new ProductValidationError(
      `${field} must be a string${options.required ? "" : " or null"}`,
    );
  }

  const id = value.trim();
  if (!lookupExists(LOOKUP_TABLES[field], id)) {
    throw new ProductValidationError(`Unknown ${field}: ${id}`);
  }
  return id;
}

function normalizePositiveInteger(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ProductValidationError(`${field} must be a positive integer or null`);
  }
  return value;
}

function normalizeNonNegativeNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ProductValidationError(`${field} must be a non-negative number or null`);
  }
  return value;
}

function normalizeNonNegativeInteger(value: unknown, field: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new ProductValidationError(`${field} must be a non-negative integer or null`);
  }
  return value;
}

function normalizeBooleanFlag(value: unknown, field: string): number {
  if (value === undefined) return 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === 0 || value === 1) return value;
  throw new ProductValidationError(`${field} must be a boolean`);
}

function normalizeExplicitBooleanFlag(value: unknown, field: string): number {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === 0 || value === 1) return value;
  throw new ProductValidationError(`${field} must be a boolean`);
}

function normalizeRestockPriority(value: unknown, fallback = "none"): string {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") {
    throw new ProductValidationError("restock_priority must be a string or null");
  }
  const priority = value.trim();
  if (!RESTOCK_PRIORITIES.has(priority)) {
    throw new ProductValidationError(`Unknown restock_priority: ${priority}`);
  }
  return priority;
}

function getProductSummaryById(id: number): ProductSummary | null {
  const row = db.prepare<[number], ProductSummaryRow>(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id);
  return row ? productSummaryFromRow(row) : null;
}

function requireProductSummaryById(id: number): ProductSummary {
  const product = getProductSummaryById(id);
  if (!product) throw new ProductValidationError(`Product not found after insert: ${id}`);
  return product;
}

type ProductSourceJob = {
  id: number;
  session_id: string;
  designTitle: string | null;
  total_weight_g: number | null;
  total_time_s: number | null;
  printer_id: number | null;
  deviceModel: string | null;
};

type ProductSourceProject = {
  id: number;
  name: string;
  notes: string | null;
};

type ProductSourceFilament = {
  filament_type: string | null;
  color: string | null;
  total_weight: number;
};

function loadPrimaryFilament(sessionId: string): ProductSourceFilament | null {
  return (
    db
      .prepare<[string], ProductSourceFilament>(
        `SELECT
           jf.filament_type,
           jf.color,
           SUM(jf.weight_g) AS total_weight
         FROM job_filaments jf
         JOIN print_tasks pt ON pt.id = jf.task_id
         WHERE pt.session_id = ?
         GROUP BY jf.filament_type, jf.color
         ORDER BY total_weight DESC
         LIMIT 1`,
      )
      .get(sessionId) ?? null
  );
}

function linkProductJob(productId: number, jobId: number, relationship: string): void {
  db.prepare(
    `INSERT OR IGNORE INTO product_jobs (product_id, job_id, relationship)
     VALUES (?, ?, ?)`,
  ).run(productId, jobId, relationship);
}

function productNameForJob(job: ProductSourceJob): string {
  const designTitle = job.designTitle?.trim();
  if (designTitle) return designTitle;
  return `Job ${job.id}`;
}

export function listProducts(): ProductSummary[] {
  return db
    .prepare<[], ProductSummaryRow>(
      `${PRODUCT_SELECT}
       ORDER BY ps.sort_order, p.name COLLATE NOCASE`,
    )
    .all()
    .map(productSummaryFromRow);
}

export function createProduct(input: CreateProductInput): ProductSummary {
  const name = normalizeName(input.name);
  const statusId = normalizeLookup(input.status_id, "status_id", {
    required: true,
    fallback: "idea",
  });
  const values: Record<string, unknown> = {
    name,
    slug: uniqueSlug(name),
    status: statusId,
    status_id: statusId,
    is_original_design: normalizeBooleanFlag(input.is_original_design, "is_original_design"),
    sales_companion_visible: normalizeBooleanFlag(
      input.sales_companion_visible,
      "sales_companion_visible",
    ),
    restock_priority: normalizeRestockPriority(input.restock_priority),
  };

  for (const field of OPTIONAL_TEXT_FIELDS) {
    values[field] = normalizeNullableText(input[field], field);
  }
  for (const field of OPTIONAL_LOOKUP_FIELDS) {
    values[field] = normalizeLookup(input[field], field);
  }
  for (const field of INTEGER_FIELDS) {
    values[field] = normalizePositiveInteger(input[field], field);
  }
  for (const field of NON_NEGATIVE_NUMBER_FIELDS) {
    values[field] = normalizeNonNegativeNumber(input[field], field);
  }
  values["estimated_print_time_s"] = normalizeNonNegativeInteger(
    input.estimated_print_time_s,
    "estimated_print_time_s",
  );

  const result = db
    .prepare(
      `INSERT INTO products (
        name, slug, description, designer, status, category_id, status_id, source_id, license_id,
        model_url, main_file_id, etsy_listing_url, default_material,
        primary_color, accent_color, preferred_printer_id, estimated_print_time_s,
        estimated_filament_g, target_sale_price, booth_price, etsy_price, packaging_cost,
        handling_minutes, target_margin_pct, pricing_notes, notes, is_original_design,
        sales_companion_visible, restock_priority
      ) VALUES (
        @name, @slug, @description, @designer, @status, @category_id, @status_id, @source_id, @license_id,
        @model_url, @main_file_id, @etsy_listing_url, @default_material,
        @primary_color, @accent_color, @preferred_printer_id, @estimated_print_time_s,
        @estimated_filament_g, @target_sale_price, @booth_price, @etsy_price, @packaging_cost,
        @handling_minutes, @target_margin_pct, @pricing_notes, @notes, @is_original_design,
        @sales_companion_visible, @restock_priority
      )`,
    )
    .run(values);

  return requireProductSummaryById(result.lastInsertRowid as number);
}

export function createProductFromJob(jobId: number): ProductSummary {
  const job = db
    .prepare<[number], ProductSourceJob>(
      `SELECT id, session_id, designTitle, total_weight_g, total_time_s, printer_id, deviceModel
       FROM jobs
       WHERE id = ?`,
    )
    .get(jobId);
  if (!job) throw new ProductValidationError(`Unknown job_id: ${jobId}`);

  const primaryFilament = loadPrimaryFilament(job.session_id);
  const product = createProduct({
    name: productNameForJob(job),
    status_id: "test_print",
    license_id: "unknown_verify",
    default_material: primaryFilament?.filament_type ?? null,
    primary_color: primaryFilament?.color ?? null,
    preferred_printer_id: job.printer_id,
    estimated_print_time_s: job.total_time_s,
    estimated_filament_g: job.total_weight_g,
    notes: `Created from job #${job.id}${job.deviceModel ? ` on ${job.deviceModel}` : ""}.`,
  });
  linkProductJob(product.id, job.id, "source_job");
  return product;
}

export function createProductFromProject(projectId: number): ProductSummary {
  const project = db
    .prepare<[number], ProductSourceProject>("SELECT id, name, notes FROM projects WHERE id = ?")
    .get(projectId);
  if (!project) throw new ProductValidationError(`Unknown project_id: ${projectId}`);

  const jobs = db
    .prepare<[number], ProductSourceJob>(
      `SELECT id, session_id, designTitle, total_weight_g, total_time_s, printer_id, deviceModel
       FROM jobs
       WHERE project_id = ?
       ORDER BY startTime DESC, id DESC`,
    )
    .all(projectId);
  if (jobs.length === 0) {
    throw new ProductValidationError(`Project ${projectId} has no jobs to link`);
  }

  const firstPrinterId = jobs.find((job) => job.printer_id !== null)?.printer_id ?? null;
  const totalWeightG = jobs.reduce((sum, job) => sum + (job.total_weight_g ?? 0), 0);
  const totalTimeS = jobs.reduce((sum, job) => sum + (job.total_time_s ?? 0), 0);
  const product = createProduct({
    name: project.name,
    status_id: "test_print",
    license_id: "unknown_verify",
    preferred_printer_id: firstPrinterId,
    estimated_print_time_s: totalTimeS,
    estimated_filament_g: totalWeightG,
    notes: project.notes ?? `Created from project #${project.id}.`,
  });

  for (const job of jobs) {
    linkProductJob(product.id, job.id, "source_project");
  }
  return product;
}

export function updateProduct(id: number, input: UpdateProductInput): ProductSummary | null {
  if (!getProductSummaryById(id)) return null;

  const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
  const values: Record<string, unknown> = { id };

  function setColumn(column: ProductColumn, value: unknown): void {
    updates.push(`${column} = @${column}`);
    values[column] = value;
  }

  if ("name" in input) {
    const name = normalizeName(input.name);
    setColumn("name", name);
    updates.push("slug = @slug");
    values["slug"] = uniqueSlug(name, id);
  }
  if ("status_id" in input) {
    const statusId = normalizeLookup(input.status_id, "status_id", { required: true });
    setColumn("status_id", statusId);
    values["status"] = statusId;
    updates.push("status = @status");
  }
  for (const field of OPTIONAL_LOOKUP_FIELDS) {
    if (field in input) setColumn(field, normalizeLookup(input[field], field));
  }
  for (const field of OPTIONAL_TEXT_FIELDS) {
    if (field in input) setColumn(field, normalizeNullableText(input[field], field));
  }
  for (const field of INTEGER_FIELDS) {
    if (field in input) setColumn(field, normalizePositiveInteger(input[field], field));
  }
  for (const field of NON_NEGATIVE_NUMBER_FIELDS) {
    if (field in input) setColumn(field, normalizeNonNegativeNumber(input[field], field));
  }
  if ("estimated_print_time_s" in input) {
    setColumn(
      "estimated_print_time_s",
      normalizeNonNegativeInteger(input.estimated_print_time_s, "estimated_print_time_s"),
    );
  }
  if ("is_original_design" in input) {
    setColumn(
      "is_original_design",
      normalizeBooleanFlag(input.is_original_design, "is_original_design"),
    );
  }
  if ("sales_companion_visible" in input) {
    setColumn(
      "sales_companion_visible",
      normalizeExplicitBooleanFlag(input.sales_companion_visible, "sales_companion_visible"),
    );
  }
  if ("restock_priority" in input) {
    setColumn("restock_priority", normalizeRestockPriority(input.restock_priority));
  }

  db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = @id`).run(values);
  return getProductSummaryById(id);
}

export function listSalesCompanionProducts(): SalesCompanionProduct[] {
  return db
    .prepare<[], SalesCompanionProductRow>(
      `WITH complete_batches AS (
         SELECT
           pb.id,
           pb.product_id,
           pb.created_at,
           ROW_NUMBER() OVER (
             PARTITION BY pb.product_id
             ORDER BY pb.created_at DESC, pb.id DESC
           ) AS recency
         FROM product_batches pb
         JOIN product_price_snapshots snapshots ON snapshots.batch_id = pb.id
         WHERE pb.source_type = 'price_quote'
         GROUP BY pb.id
         HAVING COUNT(*) = 2
           AND SUM(CASE WHEN snapshots.channel = 'direct' THEN 1 ELSE 0 END) = 1
           AND SUM(CASE WHEN snapshots.channel = 'etsy' THEN 1 ELSE 0 END) = 1
       ),
       latest_complete_batches AS (
         SELECT id, product_id, created_at
         FROM complete_batches
         WHERE recency = 1
       )
       SELECT
         p.id,
         p.name,
         p.main_photo_id,
         COALESCE(pp.path, cf.path) AS main_photo_stored_path,
         direct.unit_cost,
         direct.production_loss_cost,
         direct.suggested_price AS direct_price,
         direct.estimated_margin_pct AS direct_margin_pct,
         etsy.suggested_price AS etsy_price,
         etsy.estimated_margin_pct AS etsy_margin_pct,
         latest.created_at AS priced_at
       FROM products p
       JOIN latest_complete_batches latest ON latest.product_id = p.id
       JOIN product_price_snapshots direct
         ON direct.batch_id = latest.id AND direct.channel = 'direct'
       JOIN product_price_snapshots etsy
         ON etsy.batch_id = latest.id AND etsy.channel = 'etsy'
       LEFT JOIN product_photos pp ON pp.id = p.main_photo_id
       LEFT JOIN catalog_files cf ON cf.id = pp.file_id
       WHERE p.sales_companion_visible = 1
       ORDER BY p.name COLLATE NOCASE, p.id`,
    )
    .all()
    .map(({ main_photo_id, main_photo_stored_path, ...row }) => ({
      ...row,
      identification_image_url: projectProductPhotoPath(main_photo_id ?? 0, main_photo_stored_path)
        .url,
    }));
}

export function listProductsToPrintNext(): ProductSummary[] {
  return db
    .prepare<[], ProductSummaryRow>(
      `${PRODUCT_SELECT}
       WHERE p.status_id IN ('active', 'selling_well')
         AND COALESCE(p.restock_priority, 'none') != 'none'
       ORDER BY
         CASE p.restock_priority
           WHEN 'urgent' THEN 0
           WHEN 'high' THEN 1
           WHEN 'normal' THEN 2
           ELSE 3
         END,
         p.name COLLATE NOCASE`,
    )
    .all()
    .map(productSummaryFromRow);
}
