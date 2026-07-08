import { db } from "../lib/db.js";
import { readyToList, sellabilityForProduct, type SellabilityLevel } from "../lib/product-rules.js";

export interface ProductSummary {
  id: number;
  name: string;
  category_id: string | null;
  category_label: string | null;
  status_id: string;
  status_label: string;
  source_id: string | null;
  source_label: string | null;
  license_id: string | null;
  license_label: string | null;
  main_photo_path: string | null;
  target_sale_price: number | null;
  restock_priority: string;
  can_sell_level: SellabilityLevel;
  can_sell_label: string;
  ready_to_list: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  category_id?: string | null;
  status_id?: string;
  source_id?: string | null;
  license_id?: string | null;
  model_url?: string | null;
  main_file_id?: number | null;
  main_photo_id?: number | null;
  etsy_listing_url?: string | null;
  default_material?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  preferred_printer_id?: number | null;
  estimated_print_time_s?: number | null;
  estimated_filament_g?: number | null;
  target_sale_price?: number | null;
  notes?: string | null;
  is_original_design?: boolean | number;
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
  "can_sell_level" | "can_sell_label" | "ready_to_list"
> & {
  model_url: string | null;
  main_file_id: number | null;
  main_photo_id: number | null;
};

type ProductColumn =
  | "name"
  | "description"
  | "category_id"
  | "status_id"
  | "source_id"
  | "license_id"
  | "model_url"
  | "main_file_id"
  | "main_photo_id"
  | "etsy_listing_url"
  | "default_material"
  | "primary_color"
  | "accent_color"
  | "preferred_printer_id"
  | "estimated_print_time_s"
  | "estimated_filament_g"
  | "target_sale_price"
  | "notes"
  | "is_original_design"
  | "restock_priority";

const PRODUCT_SELECT = `
  SELECT
    p.id,
    p.name,
    p.category_id,
    pc.label AS category_label,
    COALESCE(p.status_id, 'idea') AS status_id,
    COALESCE(ps.label, 'Idea') AS status_label,
    p.source_id,
    psrc.label AS source_label,
    p.license_id,
    pl.label AS license_label,
    COALESCE(pp.path, cf.path) AS main_photo_path,
    p.target_sale_price,
    COALESCE(p.restock_priority, 'none') AS restock_priority,
    p.model_url,
    p.main_file_id,
    p.main_photo_id
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
  "model_url",
  "etsy_listing_url",
  "default_material",
  "primary_color",
  "accent_color",
  "notes",
] as const;
const OPTIONAL_LOOKUP_FIELDS = ["category_id", "source_id", "license_id"] as const;
const INTEGER_FIELDS = ["main_file_id", "main_photo_id", "preferred_printer_id"] as const;
const NON_NEGATIVE_NUMBER_FIELDS = ["estimated_filament_g", "target_sale_price"] as const;
const RESTOCK_PRIORITIES = new Set(["none", "normal", "high", "urgent"]);

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
    category_id: row.category_id,
    category_label: row.category_label,
    status_id: row.status_id,
    status_label: row.status_label,
    source_id: row.source_id,
    source_label: row.source_label,
    license_id: row.license_id,
    license_label: row.license_label,
    main_photo_path: row.main_photo_path,
    target_sale_price: row.target_sale_price,
    restock_priority: row.restock_priority,
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

function normalizeBooleanFlag(value: unknown): number {
  if (value === undefined) return 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === 0 || value === 1) return value;
  throw new ProductValidationError("is_original_design must be a boolean");
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
    is_original_design: normalizeBooleanFlag(input.is_original_design),
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
        name, slug, description, status, category_id, status_id, source_id, license_id,
        model_url, main_file_id, main_photo_id, etsy_listing_url, default_material,
        primary_color, accent_color, preferred_printer_id, estimated_print_time_s,
        estimated_filament_g, target_sale_price, notes, is_original_design, restock_priority
      ) VALUES (
        @name, @slug, @description, @status, @category_id, @status_id, @source_id, @license_id,
        @model_url, @main_file_id, @main_photo_id, @etsy_listing_url, @default_material,
        @primary_color, @accent_color, @preferred_printer_id, @estimated_print_time_s,
        @estimated_filament_g, @target_sale_price, @notes, @is_original_design, @restock_priority
      )`,
    )
    .run(values);

  return getProductSummaryById(result.lastInsertRowid as number)!;
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
    setColumn("is_original_design", normalizeBooleanFlag(input.is_original_design));
  }
  if ("restock_priority" in input) {
    setColumn("restock_priority", normalizeRestockPriority(input.restock_priority));
  }

  db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = @id`).run(values);
  return getProductSummaryById(id);
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
