import fs from "node:fs";
import path from "node:path";
import { catalogPreviewPath, type CatalogPreviewContentType } from "../lib/catalog-preview.js";
import { localCoverPath } from "../lib/covers.js";
import { db } from "../lib/db.js";
import { projectProductPhotoPath } from "../lib/product-photo-path.js";
import { listProducts, ProductValidationError, type ProductSummary } from "./products.js";

export type ProductImageSourceType =
  | "manual_upload"
  | "source_hero"
  | "catalog_preview"
  | "contact_sheet"
  | "print_cover"
  | "placeholder";

export type ProductImageCandidate = {
  candidate_key: string;
  source_type: ProductImageSourceType;
  photo_id: number | null;
  url: string | null;
  label: string;
  priority: number;
  available: boolean;
  warning: string | null;
};

export class ProductImageValidationError extends ProductValidationError {
  constructor(message: string) {
    super(message);
    this.name = "ProductImageValidationError";
  }
}

type PersistedPhotoRow = {
  id: number;
  file_id: number | null;
  path: string | null;
  source_type: string;
  source_ref: string | null;
  candidate_key: string | null;
  caption: string | null;
  display_order: number;
  is_main: number;
};

type CatalogPreviewRow = {
  file_id: number;
  filename: string;
  metadata_json: string | null;
};

type CoverRow = {
  task_id: string;
  title: string | null;
};

type CandidateDetails = ProductImageCandidate & {
  file_id: number | null;
  file_path: string | null;
  source_ref: string | null;
  content_type: string | null;
  display_order: number;
  is_main: boolean;
};

type CatalogPreviewMetadata = {
  preview?: {
    hash?: unknown;
    contentType?: unknown;
  };
};

const SOURCE_PRIORITIES: Record<ProductImageSourceType, number> = {
  manual_upload: 10,
  source_hero: 20,
  catalog_preview: 30,
  contact_sheet: 40,
  print_cover: 50,
  placeholder: 60,
};
const SOURCE_TYPES = new Set<ProductImageSourceType>(
  Object.keys(SOURCE_PRIORITIES) as ProductImageSourceType[],
);

function requireProduct(productId: number): ProductSummary {
  const product = listProducts().find(({ id }) => id === productId);
  if (!product) throw new ProductImageValidationError(`Unknown product_id: ${productId}`);
  return product;
}

function isSourceType(value: string): value is ProductImageSourceType {
  return SOURCE_TYPES.has(value as ProductImageSourceType);
}

function regularFileExists(filePath: string): boolean {
  try {
    return fs.lstatSync(filePath).isFile();
  } catch {
    return false;
  }
}

function sameLocalPath(left: string | null, right: string | null): boolean {
  if (!left || !right) return false;
  return path.resolve(left) === path.resolve(right);
}

function parseCatalogPreview(
  metadataJson: string | null,
): { hash: string; contentType: CatalogPreviewContentType } | null {
  if (!metadataJson) return null;
  try {
    const metadata = JSON.parse(metadataJson) as CatalogPreviewMetadata;
    const preview = metadata.preview;
    if (!preview || typeof preview.hash !== "string" || !/^[a-f0-9]{64}$/i.test(preview.hash)) {
      return null;
    }
    if (preview.contentType !== "image/png" && preview.contentType !== "image/jpeg") return null;
    return { hash: preview.hash.toLowerCase(), contentType: preview.contentType };
  } catch {
    return null;
  }
}

function previewExtension(contentType: CatalogPreviewContentType): "jpg" | "png" {
  return contentType === "image/jpeg" ? "jpg" : "png";
}

function persistedCandidates(
  productId: number,
  currentDerivedCandidates: ReadonlyMap<string, CandidateDetails>,
): CandidateDetails[] {
  const rows = db
    .prepare<[number], PersistedPhotoRow>(
      `SELECT
         pp.id,
         pp.file_id,
         COALESCE(pp.path, cf.path) AS path,
         pp.source_type,
         pp.source_ref,
         pp.candidate_key,
         pp.caption,
         pp.display_order,
         CASE WHEN p.main_photo_id = pp.id THEN 1 ELSE 0 END AS is_main
       FROM product_photos pp
       JOIN products p ON p.id = pp.product_id
       LEFT JOIN catalog_files cf ON cf.id = pp.file_id
       WHERE pp.product_id = ?
       ORDER BY pp.display_order, pp.id`,
    )
    .all(productId);

  return rows.flatMap((row) => {
    if (!isSourceType(row.source_type) || row.source_type === "placeholder") return [];
    const candidateKey = row.candidate_key ?? `${row.source_type}:photo:${row.id}`;
    const projection = projectProductPhotoPath(row.id, row.path);
    let available = projection.available;
    let warning = available ? null : "The saved image file is unavailable.";

    if (row.source_type === "catalog_preview" || row.source_type === "print_cover") {
      const currentSource = currentDerivedCandidates.get(candidateKey);
      const matchesCurrentSource =
        currentSource !== undefined &&
        currentSource.available &&
        sameLocalPath(row.path, currentSource.file_path) &&
        (row.source_type !== "catalog_preview" || row.file_id === currentSource.file_id) &&
        row.source_ref === currentSource.source_ref;
      available = available && matchesCurrentSource;
      if (!available) {
        warning = currentSource
          ? "The current source image file is unavailable."
          : "This derived image no longer matches the Product's current source.";
      }
    }

    return [
      {
        candidate_key: candidateKey,
        source_type: row.source_type,
        photo_id: row.id,
        url: projection.url,
        label: row.caption?.trim() || `${row.source_type.replaceAll("_", " ")} photo`,
        priority: SOURCE_PRIORITIES[row.source_type],
        available,
        warning,
        file_id: row.file_id,
        file_path: row.path,
        source_ref: row.source_ref,
        content_type: null,
        display_order: row.display_order,
        is_main: row.is_main === 1,
      },
    ];
  });
}

function catalogPreviewCandidates(productId: number): CandidateDetails[] {
  const rows = db
    .prepare<[number], CatalogPreviewRow>(
      `SELECT cf.id AS file_id, cf.filename, cf.metadata_json
       FROM product_files pf
       JOIN catalog_files cf ON cf.id = pf.file_id
       WHERE pf.product_id = ?
         AND cf.scan_status = 'present'
       ORDER BY cf.normalized_path, cf.id`,
    )
    .all(productId);

  return rows.flatMap((row) => {
    const preview = parseCatalogPreview(row.metadata_json);
    if (!preview) return [];
    const filePath = catalogPreviewPath(preview.hash, preview.contentType);
    const available = regularFileExists(filePath);
    return [
      {
        candidate_key: `catalog_preview:${row.file_id}:${preview.hash}`,
        source_type: "catalog_preview" as const,
        photo_id: null,
        url: available
          ? `/catalog/previews/${preview.hash}.${previewExtension(preview.contentType)}`
          : null,
        label: `${row.filename} preview`,
        priority: SOURCE_PRIORITIES.catalog_preview,
        available,
        warning: available ? null : "The catalog preview file is unavailable.",
        file_id: row.file_id,
        file_path: filePath,
        source_ref: String(row.file_id),
        content_type: preview.contentType,
        display_order: 0,
        is_main: false,
      },
    ];
  });
}

function printCoverCandidates(productId: number): CandidateDetails[] {
  const rows = db
    .prepare<[number], CoverRow>(
      `WITH latest_saved_batch AS (
         SELECT id
         FROM product_batches
         WHERE product_id = ? AND source_type = 'price_quote'
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       )
       SELECT DISTINCT pt.id AS task_id, pt.title
       FROM latest_saved_batch latest
       JOIN product_batch_jobs pbj ON pbj.batch_id = latest.id
       JOIN jobs j ON j.id = pbj.job_id
       JOIN print_tasks pt ON pt.session_id = j.session_id
       ORDER BY pt.id`,
    )
    .all(productId);

  return rows.flatMap((row) => {
    let filePath: string;
    try {
      filePath = localCoverPath(row.task_id);
    } catch {
      return [];
    }
    const available = regularFileExists(filePath);
    return [
      {
        candidate_key: `print_cover:${row.task_id}`,
        source_type: "print_cover" as const,
        photo_id: null,
        url: available ? `/ui/covers/${encodeURIComponent(row.task_id)}` : null,
        label: row.title?.trim() || `Print ${row.task_id}`,
        priority: SOURCE_PRIORITIES.print_cover,
        available,
        warning: available ? null : "The cached print cover is unavailable.",
        file_id: null,
        file_path: filePath,
        source_ref: row.task_id,
        content_type: "image/png",
        display_order: 0,
        is_main: false,
      },
    ];
  });
}

function placeholderCandidate(): CandidateDetails {
  return {
    candidate_key: "placeholder",
    source_type: "placeholder",
    photo_id: null,
    url: null,
    label: "No product image",
    priority: SOURCE_PRIORITIES.placeholder,
    available: true,
    warning: null,
    file_id: null,
    file_path: null,
    source_ref: null,
    content_type: null,
    display_order: 0,
    is_main: false,
  };
}

function compareCandidates(left: CandidateDetails, right: CandidateDetails): number {
  if (left.priority !== right.priority) return left.priority - right.priority;
  if (left.available !== right.available) return left.available ? -1 : 1;
  if (left.is_main !== right.is_main) return left.is_main ? -1 : 1;
  if (left.display_order !== right.display_order) return left.display_order - right.display_order;
  return left.candidate_key.localeCompare(right.candidate_key);
}

function listCandidateDetails(productId: number): CandidateDetails[] {
  requireProduct(productId);
  const derivedCandidates = [
    ...catalogPreviewCandidates(productId),
    ...printCoverCandidates(productId),
  ];
  const currentDerivedByKey = new Map(
    derivedCandidates.map((candidate) => [candidate.candidate_key, candidate]),
  );
  const candidates = [
    ...persistedCandidates(productId, currentDerivedByKey),
    ...derivedCandidates,
    placeholderCandidate(),
  ];
  const unique = new Map<string, CandidateDetails>();
  for (const candidate of candidates) {
    const existing = unique.get(candidate.candidate_key);
    if (!existing || (!existing.available && candidate.available)) {
      unique.set(candidate.candidate_key, candidate);
    }
  }
  return [...unique.values()].sort(compareCandidates);
}

function publicCandidate(candidate: CandidateDetails): ProductImageCandidate {
  return {
    candidate_key: candidate.candidate_key,
    source_type: candidate.source_type,
    photo_id: candidate.photo_id,
    url: candidate.url,
    label: candidate.label,
    priority: candidate.priority,
    available: candidate.available,
    warning: candidate.warning,
  };
}

export function listProductImageCandidates(productId: number): ProductImageCandidate[] {
  return listCandidateDetails(productId).map(publicCandidate);
}

function materializeCandidate(productId: number, candidate: CandidateDetails): number | null {
  if (candidate.source_type === "placeholder") return null;
  if (candidate.photo_id !== null) return candidate.photo_id;
  if (!candidate.file_path) {
    throw new ProductImageValidationError(
      `Image candidate is unavailable: ${candidate.candidate_key}`,
    );
  }

  db.prepare(
    `INSERT INTO product_photos (
       product_id, file_id, path, role, caption, source_type, source_ref, candidate_key, content_type
     ) VALUES (?, ?, ?, 'gallery', ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, candidate_key) WHERE candidate_key IS NOT NULL DO UPDATE SET
       file_id = excluded.file_id,
       path = excluded.path,
       caption = excluded.caption,
       source_type = excluded.source_type,
       source_ref = excluded.source_ref,
       content_type = excluded.content_type,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(
    productId,
    candidate.file_id,
    candidate.file_path,
    candidate.label,
    candidate.source_type,
    candidate.source_ref,
    candidate.candidate_key,
    candidate.content_type,
  );

  const photoId = db
    .prepare<
      [number, string],
      { id: number }
    >("SELECT id FROM product_photos WHERE product_id = ? AND candidate_key = ?")
    .get(productId, candidate.candidate_key)?.id;
  if (!photoId) throw new ProductImageValidationError("Failed to persist image candidate");
  return photoId;
}

function summaryAfterUpdate(productId: number): ProductSummary {
  return requireProduct(productId);
}

const selectProductImageTransaction = db.transaction(
  (productId: number, candidateKey: string): ProductSummary => {
    const candidate = listCandidateDetails(productId).find(
      ({ candidate_key }) => candidate_key === candidateKey,
    );
    if (!candidate) {
      throw new ProductImageValidationError(`Unknown image candidate: ${candidateKey}`);
    }
    if (!candidate.available) {
      throw new ProductImageValidationError(`Image candidate is unavailable: ${candidateKey}`);
    }
    const photoId = materializeCandidate(productId, candidate);
    db.prepare(
      `UPDATE products
       SET main_photo_id = ?, image_selection_mode = 'manual', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    ).run(photoId, productId);
    return summaryAfterUpdate(productId);
  },
);

export function selectProductImage(productId: number, candidateKey: string): ProductSummary {
  return selectProductImageTransaction(productId, candidateKey);
}

const refreshAutoProductImageTransaction = db.transaction((productId: number): ProductSummary => {
  const product = requireProduct(productId);
  if (product.image_selection_mode === "manual") return product;
  const candidate = listCandidateDetails(productId).find(({ available }) => available);
  const photoId = candidate ? materializeCandidate(productId, candidate) : null;
  db.prepare(
    `UPDATE products SET main_photo_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(photoId, productId);
  return summaryAfterUpdate(productId);
});

export function refreshAutoProductImage(productId: number): ProductSummary {
  return refreshAutoProductImageTransaction(productId);
}

const returnProductImageToAutoTransaction = db.transaction((productId: number): ProductSummary => {
  requireProduct(productId);
  db.prepare(
    `UPDATE products SET image_selection_mode = 'auto', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(productId);
  return refreshAutoProductImageTransaction(productId);
});

export function returnProductImageToAuto(productId: number): ProductSummary {
  return returnProductImageToAutoTransaction(productId);
}
