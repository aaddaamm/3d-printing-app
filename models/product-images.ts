import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { catalogPreviewPath, type CatalogPreviewContentType } from "../lib/catalog-preview.js";
import { localCoverPath } from "../lib/covers.js";
import { db } from "../lib/db.js";
import {
  appOwnedProductImageContentHash,
  createProductContactSheetSnapshot,
  fingerprintProductContactSheetInputs,
  generateProductContactSheet,
  type ContactSheetInput,
  storeRemoteProductImage,
  type StoredProductContactSheet,
  type StoredProductImage,
} from "../lib/product-image-files.js";
import { projectProductPhotoPath } from "../lib/product-photo-path.js";
import {
  canonicalSupportedImageUrl,
  canonicalSupportedModelUrl,
  fetchSupportedSourceImage,
  type RemoteImageDependencies,
} from "../lib/remote-product-images.js";
import { getProductSummaryById, ProductValidationError, type ProductSummary } from "./products.js";

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
  content_type: string | null;
  display_order: number;
  is_app_owned: number;
  is_main: number;
  is_auto_source: number;
};

type CatalogPreviewRow = {
  file_id: number;
  filename: string;
  metadata_json: string | null;
};

type CoverRow = {
  batch_id: number;
  task_id: string;
  title: string | null;
  plate_index: number | null;
  start_time: string | null;
};

type ContactSheetContext = {
  batchId: number;
  sourceRef: string;
};

export type ProductPhoto = {
  id: number;
  product_id: number;
  path: string;
  source_type: "manual_upload";
  source_ref: string;
  candidate_key: string;
  content_type: "image/webp";
  width: number;
  height: number;
  is_app_owned: 1;
};

type CandidateDetails = ProductImageCandidate & {
  file_id: number | null;
  file_path: string | null;
  source_ref: string | null;
  content_type: string | null;
  display_order: number;
  is_main: boolean;
  is_current_source?: boolean;
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
  const product = getProductSummaryById(productId);
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

function sourceHeroCandidateKey(modelUrl: string, sourceUrl: string, contentHash: string): string {
  const modelHash = createHash("sha256").update(modelUrl).digest("hex");
  const sourceHash = createHash("sha256").update(sourceUrl).digest("hex");
  return `source_hero:${modelHash}:${sourceHash}:${contentHash}`;
}

function sourceHeroProvenance(
  sourceRef: string | null,
): { modelUrl: string; sourceUrl: string; contentHash: string } | null {
  if (!sourceRef?.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(sourceRef) as Record<string, unknown>;
    if (
      typeof parsed["modelUrl"] !== "string" ||
      typeof parsed["sourceUrl"] !== "string" ||
      typeof parsed["contentHash"] !== "string"
    ) {
      return null;
    }
    const modelUrl = canonicalSupportedModelUrl(parsed["modelUrl"]);
    const sourceUrl = canonicalSupportedImageUrl(parsed["sourceUrl"]);
    const contentHash = parsed["contentHash"].toLowerCase();
    if (!modelUrl || !sourceUrl || !/^[a-f0-9]{64}$/.test(contentHash)) return null;
    if (
      parsed["modelUrl"] !== modelUrl ||
      parsed["sourceUrl"] !== sourceUrl ||
      parsed["contentHash"] !== contentHash
    ) {
      return null;
    }
    return { modelUrl, sourceUrl, contentHash };
  } catch {
    return null;
  }
}

function persistedCandidates(
  productId: number,
  currentModelUrl: string | null,
  currentDerivedCandidates: ReadonlyMap<string, CandidateDetails>,
  contactSheetContext: ContactSheetContext | null,
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
         pp.content_type,
         pp.display_order,
         pp.is_app_owned,
         CASE WHEN p.main_photo_id = pp.id THEN 1 ELSE 0 END AS is_main,
         CASE WHEN p.auto_source_photo_id = pp.id THEN 1 ELSE 0 END AS is_auto_source
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

    if (row.source_type === "source_hero") {
      const provenance = sourceHeroProvenance(row.source_ref);
      const currentSourceUrl = currentModelUrl ? canonicalSupportedModelUrl(currentModelUrl) : null;
      const expectedKey = provenance
        ? sourceHeroCandidateKey(provenance.modelUrl, provenance.sourceUrl, provenance.contentHash)
        : null;
      let actualHash: string | null = null;
      try {
        if (row.path) actualHash = appOwnedProductImageContentHash(row.path, "remote");
      } catch {
        actualHash = null;
      }
      const validSourceHero =
        provenance !== null &&
        provenance.modelUrl === currentSourceUrl &&
        row.is_app_owned === 1 &&
        candidateKey === expectedKey &&
        path.basename(row.path ?? "") === `${provenance.contentHash}.webp` &&
        actualHash === provenance.contentHash;
      available = available && validSourceHero;
      if (!available) {
        warning =
          "This source image has invalid or stale MakerWorld provenance and does not match the Product's current source URL.";
      }
    } else if (row.source_type === "catalog_preview" || row.source_type === "print_cover") {
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
    } else if (row.source_type === "contact_sheet") {
      const expectedPrefix = contactSheetContext
        ? `contact_sheet:${contactSheetContext.batchId}:`
        : null;
      const contentHash = candidateKey.split(":").at(-1) ?? "";
      let actualHash: string | null = null;
      try {
        if (row.path) actualHash = appOwnedProductImageContentHash(row.path, "contact-sheets");
      } catch {
        actualHash = null;
      }
      const matchesCurrentSource =
        contactSheetContext !== null &&
        row.is_app_owned === 1 &&
        row.source_ref === contactSheetContext.sourceRef &&
        expectedPrefix !== null &&
        candidateKey.startsWith(expectedPrefix) &&
        /^[a-f0-9]{64}$/.test(contentHash) &&
        path.basename(row.path ?? "") === `${contentHash}.webp` &&
        actualHash === contentHash;
      available = available && matchesCurrentSource;
      if (!available) {
        warning = "This contact sheet no longer matches the latest saved Batch covers.";
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
        content_type: row.content_type,
        display_order: row.display_order,
        is_main: row.is_main === 1,
        is_current_source: row.is_auto_source === 1,
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

function latestSavedBatchCoverRows(productId: number): CoverRow[] {
  return db
    .prepare<[number], CoverRow>(
      `WITH latest_saved_batch AS (
         SELECT id
         FROM product_batches
         WHERE product_id = ? AND source_type = 'price_quote'
         ORDER BY created_at DESC, id DESC
         LIMIT 1
       )
       SELECT DISTINCT
         latest.id AS batch_id,
         pt.id AS task_id,
         pt.title,
         pt.plateIndex AS plate_index,
         pt.startTime AS start_time
       FROM latest_saved_batch latest
       JOIN product_batch_jobs pbj ON pbj.batch_id = latest.id
       JOIN jobs j ON j.id = pbj.job_id
       JOIN print_tasks pt ON pt.session_id = j.session_id
       ORDER BY
         pt.plateIndex IS NULL,
         pt.plateIndex,
         pt.startTime IS NULL,
         pt.startTime,
         pt.id`,
    )
    .all(productId);
}

function printCoverCandidates(rows: CoverRow[]): CandidateDetails[] {
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
  if (left.source_type === "source_hero" && right.source_type === "source_hero") {
    if (left.is_current_source !== right.is_current_source) {
      return left.is_current_source ? -1 : 1;
    }
    const leftId = left.photo_id ?? 0;
    const rightId = right.photo_id ?? 0;
    if (leftId !== rightId) return rightId - leftId;
  }
  if (left.is_main !== right.is_main) return left.is_main ? -1 : 1;
  if (left.display_order !== right.display_order) return left.display_order - right.display_order;
  return left.candidate_key.localeCompare(right.candidate_key);
}

function listCandidateDetails(
  productId: number,
  contactSheetContextOverride?: ContactSheetContext | null,
): CandidateDetails[] {
  const product = requireProduct(productId);
  const coverRows = latestSavedBatchCoverRows(productId);
  const derivedCandidates = [
    ...catalogPreviewCandidates(productId),
    ...printCoverCandidates(coverRows),
  ];
  const currentDerivedByKey = new Map(
    derivedCandidates.map((candidate) => [candidate.candidate_key, candidate]),
  );
  const contactSheetContext =
    contactSheetContextOverride === undefined
      ? currentContactSheetContext(coverRows)
      : contactSheetContextOverride;
  const candidates = [
    ...persistedCandidates(productId, product.model_url, currentDerivedByKey, contactSheetContext),
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

function availableContactSheetInputs(rows: CoverRow[]): ContactSheetInput[] {
  const unique = new Map<string, ContactSheetInput>();
  for (const row of rows) {
    if (unique.has(row.task_id)) continue;
    let filePath: string;
    try {
      filePath = localCoverPath(row.task_id);
    } catch {
      continue;
    }
    if (!regularFileExists(filePath)) continue;
    unique.set(row.task_id, {
      key: `print_cover:${row.task_id}`,
      label: row.title?.trim() || `Print ${row.task_id}`,
      path: filePath,
    });
  }
  return [...unique.values()];
}

function currentContactSheetContext(rows: CoverRow[]): ContactSheetContext | null {
  const batchId = rows[0]?.batch_id;
  const inputs = availableContactSheetInputs(rows);
  if (!batchId || inputs.length < 2) return null;
  try {
    const fingerprint = fingerprintProductContactSheetInputs(inputs);
    return {
      batchId,
      sourceRef: `contact_sheet:${batchId}:${fingerprint}`,
    };
  } catch {
    return null;
  }
}

function upsertContactSheet(
  productId: number,
  batchId: number,
  stored: StoredProductContactSheet,
): void {
  const candidateKey = `contact_sheet:${batchId}:${stored.contentHash}`;
  const caption = `Batch ${batchId} contact sheet`;
  const sourceRef = `contact_sheet:${batchId}:${stored.sourceFingerprint}`;
  db.prepare(
    `INSERT INTO product_photos (
       product_id, path, role, caption, source_type, source_ref, candidate_key,
       is_app_owned, content_type, width, height
     ) VALUES (?, ?, 'gallery', ?, 'contact_sheet', ?, ?, 1, ?, ?, ?)
     ON CONFLICT(product_id, candidate_key) WHERE candidate_key IS NOT NULL DO UPDATE SET
       path = excluded.path,
       caption = excluded.caption,
       source_ref = excluded.source_ref,
       is_app_owned = excluded.is_app_owned,
       content_type = excluded.content_type,
       width = excluded.width,
       height = excluded.height,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(
    productId,
    stored.path,
    caption,
    sourceRef,
    candidateKey,
    stored.contentType,
    stored.width,
    stored.height,
  );
}

export async function ensureGeneratedProductImageCandidates(
  productId: number,
): Promise<{ candidates: ProductImageCandidate[]; warnings: string[] }> {
  requireProduct(productId);
  const coverRows = latestSavedBatchCoverRows(productId);
  const batchId = coverRows[0]?.batch_id;
  const inputs = availableContactSheetInputs(coverRows);
  if (!batchId || inputs.length < 2) {
    return { candidates: listProductImageCandidates(productId), warnings: [] };
  }

  try {
    const snapshot = createProductContactSheetSnapshot(inputs);
    const contactSheetContext = {
      batchId,
      sourceRef: `contact_sheet:${batchId}:${snapshot.fingerprint}`,
    };
    const currentCandidates = listCandidateDetails(productId, contactSheetContext);
    if (
      currentCandidates.some(
        ({ source_type, source_ref, available }) =>
          source_type === "contact_sheet" &&
          source_ref === contactSheetContext.sourceRef &&
          available,
      )
    ) {
      return { candidates: currentCandidates.map(publicCandidate), warnings: [] };
    }

    const stored = await generateProductContactSheet(productId, batchId, snapshot);
    if (stored) upsertContactSheet(productId, batchId, stored);
    return {
      candidates: listCandidateDetails(productId, contactSheetContext).map(publicCandidate),
      warnings: [],
    };
  } catch {
    // A generated content-addressed file may be shared or concurrently referenced. If its
    // upsert fails, retain the safe orphan for a later reference-aware garbage collector.
    const warning = `The contact sheet for Batch ${batchId} could not be generated.`;
    const unavailable: ProductImageCandidate = {
      candidate_key: `contact_sheet:${batchId}:unavailable`,
      source_type: "contact_sheet",
      photo_id: null,
      url: null,
      label: `Batch ${batchId} contact sheet`,
      priority: SOURCE_PRIORITIES.contact_sheet,
      available: false,
      warning,
    };
    const current = listProductImageCandidates(productId).map((candidate) =>
      candidate.source_type === "contact_sheet"
        ? { ...candidate, available: false, warning: candidate.warning ?? warning }
        : candidate,
    );
    const candidates = [...current, unavailable].sort(
      (left, right) =>
        left.priority - right.priority ||
        Number(right.available) - Number(left.available) ||
        left.candidate_key.localeCompare(right.candidate_key),
    );
    return { candidates, warnings: [warning] };
  }
}

function upsertSourceHero(
  productId: number,
  modelUrl: string,
  sourceUrl: string,
  stored: StoredProductImage,
): void {
  const canonicalModelUrl = canonicalSupportedModelUrl(modelUrl);
  const canonicalSourceUrl = canonicalSupportedImageUrl(sourceUrl);
  const contentHash = stored.contentHash.toLowerCase();
  let actualHash: string | null;
  try {
    actualHash = appOwnedProductImageContentHash(stored.path, "remote");
  } catch {
    actualHash = null;
  }
  if (
    !canonicalModelUrl ||
    !canonicalSourceUrl ||
    !/^[a-f0-9]{64}$/.test(contentHash) ||
    path.basename(stored.path) !== `${contentHash}.webp` ||
    actualHash !== contentHash
  ) {
    throw new ProductImageValidationError("Invalid MakerWorld source image provenance");
  }
  const candidateKey = sourceHeroCandidateKey(canonicalModelUrl, canonicalSourceUrl, contentHash);
  const sourceRef = JSON.stringify({
    modelUrl: canonicalModelUrl,
    sourceUrl: canonicalSourceUrl,
    contentHash,
  });
  db.transaction(() => {
    const product = requireProduct(productId);
    if (canonicalSupportedModelUrl(product.model_url ?? "") !== canonicalModelUrl) {
      throw new ProductImageValidationError(
        "The Product source URL changed before its source image could be stored",
      );
    }
    db.prepare(
      `INSERT INTO product_photos (
         product_id, path, role, caption, source_type, source_ref, candidate_key,
         is_app_owned, content_type, width, height
       ) VALUES (?, ?, 'gallery', 'MakerWorld source image', 'source_hero', ?, ?, 1, ?, ?, ?)
       ON CONFLICT(product_id, candidate_key) WHERE candidate_key IS NOT NULL DO NOTHING`,
    ).run(
      productId,
      stored.path,
      sourceRef,
      candidateKey,
      stored.contentType,
      stored.width,
      stored.height,
    );
    const photo = db
      .prepare<
        [number, string],
        { id: number; product_id: number; source_type: string; source_ref: string | null }
      >(
        `SELECT id, product_id, source_type, source_ref
         FROM product_photos
         WHERE product_id = ? AND candidate_key = ?`,
      )
      .get(productId, candidateKey);
    const provenance = sourceHeroProvenance(photo?.source_ref ?? null);
    if (
      !photo ||
      photo.product_id !== productId ||
      photo.source_type !== "source_hero" ||
      provenance?.modelUrl !== canonicalModelUrl ||
      provenance.sourceUrl !== canonicalSourceUrl ||
      provenance.contentHash !== contentHash
    ) {
      throw new ProductImageValidationError("Invalid current Product source photo");
    }
    const pointerUpdate = db
      .prepare(
        `UPDATE products
         SET auto_source_photo_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .run(photo.id, productId);
    if (pointerUpdate.changes !== 1) {
      throw new ProductImageValidationError("Failed to update the current Product source photo");
    }
  })();
}

function warningMessage(prefix: string, error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${detail}`;
}

export async function refreshProductIdentificationImages(
  productId: number,
  dependencies?: Partial<RemoteImageDependencies>,
): Promise<{ product: ProductSummary; warnings: string[] }> {
  const initialProduct = requireProduct(productId);
  const warnings: string[] = [];
  const modelUrl = initialProduct.model_url?.trim() || null;

  if (!modelUrl) {
    warnings.push("The Product does not have a source URL to refresh.");
  } else {
    try {
      const remote = await fetchSupportedSourceImage(modelUrl, dependencies);
      if (!remote) {
        warnings.push("The MakerWorld page does not provide a supported source image.");
      } else {
        const stored = await storeRemoteProductImage(productId, remote.sourceUrl, remote.bytes);
        upsertSourceHero(productId, modelUrl, remote.sourceUrl, stored);
      }
    } catch (error: unknown) {
      // Source enrichment is best-effort. A normalized file whose DB upsert fails is retained as
      // a safe orphan for later reference-aware cleanup, matching upload/contact-sheet behavior.
      warnings.push(warningMessage("The MakerWorld source image could not be refreshed", error));
    }
  }

  try {
    const generated = await ensureGeneratedProductImageCandidates(productId);
    warnings.push(...generated.warnings);
  } catch (error: unknown) {
    warnings.push(warningMessage("Product image candidates could not be generated", error));
  }

  const currentProduct = requireProduct(productId);
  const product =
    currentProduct.image_selection_mode === "auto"
      ? refreshAutoProductImage(productId)
      : currentProduct;
  return { product, warnings: [...new Set(warnings)] };
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
    .prepare<[number, string], { id: number }>(
      "SELECT id FROM product_photos WHERE product_id = ? AND candidate_key = ?",
    )
    .get(productId, candidate.candidate_key)?.id;
  if (!photoId) throw new ProductImageValidationError("Failed to persist image candidate");
  return photoId;
}

function summaryAfterUpdate(productId: number): ProductSummary {
  return requireProduct(productId);
}

const createManualProductPhotoTransaction = db.transaction(
  (
    productId: number,
    stored: StoredProductImage,
  ): { product: ProductSummary; photo: ProductPhoto } => {
    requireProduct(productId);
    if (
      stored.contentType !== "image/webp" ||
      !/^[a-f0-9]{64}$/.test(stored.contentHash) ||
      !Number.isInteger(stored.width) ||
      stored.width <= 0 ||
      !Number.isInteger(stored.height) ||
      stored.height <= 0 ||
      !stored.path
    ) {
      throw new ProductImageValidationError("Invalid stored product image");
    }
    const candidateKey = `manual_upload:${stored.contentHash}`;
    db.prepare(
      `INSERT INTO product_photos (
         product_id, path, role, caption, source_type, source_ref, candidate_key,
         is_app_owned, content_type, width, height
       ) VALUES (?, ?, 'gallery', 'Uploaded photo', 'manual_upload', ?, ?, 1, ?, ?, ?)
       ON CONFLICT(product_id, candidate_key) WHERE candidate_key IS NOT NULL DO UPDATE SET
         path = excluded.path,
         source_ref = excluded.source_ref,
         is_app_owned = excluded.is_app_owned,
         content_type = excluded.content_type,
         width = excluded.width,
         height = excluded.height,
         updated_at = CURRENT_TIMESTAMP`,
    ).run(
      productId,
      stored.path,
      stored.contentHash,
      candidateKey,
      stored.contentType,
      stored.width,
      stored.height,
    );
    const photo = db
      .prepare<[number, string], ProductPhoto>(
        `SELECT id, product_id, path, source_type, source_ref, candidate_key,
                content_type, width, height, is_app_owned
         FROM product_photos
         WHERE product_id = ? AND candidate_key = ?`,
      )
      .get(productId, candidateKey);
    if (!photo) throw new ProductImageValidationError("Failed to persist uploaded photo");
    db.prepare(
      `UPDATE products
       SET main_photo_id = ?, image_selection_mode = 'manual', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    ).run(photo.id, productId);
    return { product: summaryAfterUpdate(productId), photo };
  },
);

export function createManualProductPhoto(
  productId: number,
  stored: StoredProductImage,
): { product: ProductSummary; photo: ProductPhoto } {
  return createManualProductPhotoTransaction(productId, stored);
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

function resolveAutoCandidate(productId: number): CandidateDetails | undefined {
  const candidates = listCandidateDetails(productId);
  const currentSource = candidates.find(
    ({ source_type, is_current_source, available }) =>
      source_type === "source_hero" && is_current_source === true && available,
  );
  return (
    currentSource ??
    candidates.find(({ source_type, available }) => source_type !== "source_hero" && available)
  );
}

export function clearAutoSourcePhoto(productId: number): void {
  const result = db
    .prepare(
      `UPDATE products
       SET auto_source_photo_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .run(productId);
  if (result.changes !== 1) {
    throw new ProductImageValidationError(`Unknown product_id: ${productId}`);
  }
}

export function refreshAutoProductImageBody(productId: number): ProductSummary {
  const product = requireProduct(productId);
  if (product.image_selection_mode === "manual") return product;
  const candidate = resolveAutoCandidate(productId);
  const photoId = candidate ? materializeCandidate(productId, candidate) : null;
  db.prepare(
    `UPDATE products SET main_photo_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(photoId, productId);
  return summaryAfterUpdate(productId);
}

const refreshAutoProductImageTransaction = db.transaction(refreshAutoProductImageBody);

export function refreshAutoProductImage(productId: number): ProductSummary {
  return refreshAutoProductImageTransaction(productId);
}

const returnProductImageToAutoTransaction = db.transaction((productId: number): ProductSummary => {
  requireProduct(productId);
  db.prepare(
    `UPDATE products SET image_selection_mode = 'auto', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(productId);
  return refreshAutoProductImageBody(productId);
});

export function returnProductImageToAuto(productId: number): ProductSummary {
  return returnProductImageToAutoTransaction(productId);
}
