import fs from "node:fs";
import path from "node:path";
import { groupCatalogDuplicates, type CatalogDuplicateGroup } from "../lib/catalog-duplicates.js";
import { catalogPreviewExists, catalogPreviewPath } from "../lib/catalog-preview.js";
import { db } from "../lib/db.js";
import { createProduct } from "./products.js";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  listScanRoots,
  scanCatalogRoot,
  type CatalogScanSummary,
} from "../lib/catalog-scanner.js";
import type { CatalogFile, ScanRoot } from "../lib/types.js";

const catalogStatements = createCatalogStatements(db);

export interface AddCatalogScanRootInput {
  rootPath: string;
  name?: string;
}

export interface CatalogFileSummary {
  id: number;
  filename: string;
  extension: string | null;
  folder: string;
  size_bytes: number | null;
  modified_at: string | null;
  scan_status: string;
  review_status: string;
  storage_mode: "managed" | "referenced";
  linked_product_id: number | null;
  linked_product_name: string | null;
  preview_url: string | null;
}

interface CatalogFileListRow extends CatalogFile {
  linked_product_id: number | null;
  linked_product_name: string | null;
}

export interface AdoptCatalogFileInput {
  productId?: number;
  productName?: string;
}

export interface CatalogFileAdoption {
  file: CatalogFileSummary;
  product_id: number;
  product_name: string;
  product_file_id: number;
}

export class CatalogValidationError extends Error {}

export interface CatalogPreviewContent {
  content: Buffer;
  contentType: "image/png" | "image/jpeg";
}

interface CatalogPreviewMetadata {
  preview?: {
    hash?: unknown;
    contentType?: unknown;
  };
}

function parseCatalogMetadata(value: string | null): CatalogPreviewMetadata {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as CatalogPreviewMetadata;
    }
  } catch {
    return {};
  }
  return {};
}

function previewExtension(contentType: "image/png" | "image/jpeg"): "jpg" | "png" {
  return contentType === "image/jpeg" ? "jpg" : "png";
}

function previewUrl(file: CatalogFile): string | null {
  const preview = parseCatalogMetadata(file.metadata_json).preview;
  if (!preview || typeof preview.hash !== "string") return null;
  if (preview.contentType !== "image/png" && preview.contentType !== "image/jpeg") return null;
  if (!catalogPreviewExists(preview.hash, preview.contentType)) return null;
  return `/catalog/previews/${preview.hash}.${previewExtension(preview.contentType)}`;
}

function toCatalogFileSummary(file: CatalogFileListRow): CatalogFileSummary {
  return {
    id: file.id,
    filename: file.filename,
    extension: file.extension,
    folder: path.dirname(file.path),
    size_bytes: file.size_bytes,
    modified_at: file.modified_at,
    scan_status: file.scan_status,
    review_status: file.review_status,
    storage_mode: file.managed_blob_id === null ? "referenced" : "managed",
    linked_product_id: file.linked_product_id,
    linked_product_name: file.linked_product_name,
    preview_url: previewUrl(file),
  };
}

const CATALOG_FILE_LIST_SELECT = `SELECT
  cf.*,
  linked.product_id AS linked_product_id,
  linked.product_name AS linked_product_name
FROM catalog_files cf
LEFT JOIN (
  SELECT pf.file_id, pf.product_id, p.name AS product_name
  FROM product_files pf
  JOIN products p ON p.id = pf.product_id
  WHERE pf.id = (
    SELECT MIN(first_pf.id)
    FROM product_files first_pf
    WHERE first_pf.file_id = pf.file_id
  )
) linked ON linked.file_id = cf.id`;

function getCatalogFileRow(id: number): CatalogFileListRow | null {
  return (
    db
      .prepare<[number], CatalogFileListRow>(`${CATALOG_FILE_LIST_SELECT} WHERE cf.id = ?`)
      .get(id) ?? null
  );
}

function requireCatalogFileRow(id: number): CatalogFileListRow {
  const file = getCatalogFileRow(id);
  if (!file) throw new CatalogValidationError(`Catalog file not found: ${id}`);
  return file;
}

function requireProduct(id: number): { id: number; name: string } {
  const product = db
    .prepare<[number], { id: number; name: string }>("SELECT id, name FROM products WHERE id = ?")
    .get(id);
  if (!product) throw new CatalogValidationError(`Product not found: ${id}`);
  return product;
}

function resolveAdoptionProduct(input: AdoptCatalogFileInput): { id: number; name: string } {
  const hasProductId = input.productId !== undefined;
  const productName = input.productName?.trim() ?? "";
  const hasProductName = productName !== "";
  if (hasProductId === hasProductName) {
    throw new CatalogValidationError("Provide exactly one of productId or productName");
  }
  if (hasProductId) {
    if (!Number.isInteger(input.productId) || (input.productId ?? 0) <= 0) {
      throw new CatalogValidationError("productId must be a positive integer");
    }
    return requireProduct(input.productId!);
  }
  const created = createProduct({
    name: productName,
    status_id: "downloaded_designed",
    license_id: "unknown_verify",
  });
  return { id: created.id, name: created.name };
}

function recordCatalogReview(
  file: CatalogFile,
  eventType: string,
  details: Record<string, unknown>,
): void {
  db.prepare(
    `INSERT INTO file_history (
      file_id, event_type, old_path, new_path, old_root_id, new_root_id, content_hash, details_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    file.id,
    eventType,
    file.path,
    file.path,
    file.root_id,
    file.root_id,
    file.content_hash,
    JSON.stringify(details),
  );
}

export function listCatalogScanRoots(): ScanRoot[] {
  return listScanRoots(catalogStatements);
}

export function addCatalogScanRoot(input: AddCatalogScanRootInput): ScanRoot {
  return addScanRoot(catalogStatements, {
    rootPath: input.rootPath,
    name: input.name?.trim() || input.rootPath,
  });
}

export function deactivateCatalogScanRoot(id: number): ScanRoot {
  return deactivateScanRoot(catalogStatements, id);
}

export function listCatalogFiles(): CatalogFileSummary[] {
  return db
    .prepare<
      [],
      CatalogFileListRow
    >(`${CATALOG_FILE_LIST_SELECT} ORDER BY cf.updated_at DESC, cf.id DESC`)
    .all()
    .map(toCatalogFileSummary);
}

export function listCatalogInboxFiles(): CatalogFileSummary[] {
  return db
    .prepare<[], CatalogFileListRow>(
      `${CATALOG_FILE_LIST_SELECT}
       WHERE cf.review_status = 'inbox' AND cf.scan_status = 'present'
       ORDER BY cf.first_seen_at DESC, cf.id DESC`,
    )
    .all()
    .map(toCatalogFileSummary);
}

export function adoptCatalogFile(id: number, input: AdoptCatalogFileInput): CatalogFileAdoption {
  return db.transaction(() => {
    const file = requireCatalogFileRow(id);
    if (file.scan_status !== "present") {
      throw new CatalogValidationError("Missing catalog files cannot be adopted");
    }
    const product = resolveAdoptionProduct(input);
    let productFileId = db
      .prepare<
        [number, number],
        { id: number }
      >("SELECT id FROM product_files WHERE product_id = ? AND file_id = ? ORDER BY id LIMIT 1")
      .get(product.id, file.id)?.id;
    if (!productFileId) {
      productFileId = Number(
        db
          .prepare(
            `INSERT INTO product_files (product_id, file_id, role, label)
             VALUES (?, ?, 'source', ?)
             RETURNING id`,
          )
          .pluck()
          .get(product.id, file.id, file.filename),
      );
    }

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE products
       SET main_file_id = COALESCE(main_file_id, ?), updated_at = ?
       WHERE id = ?`,
    ).run(productFileId, now, product.id);
    db.prepare(
      `UPDATE catalog_files
       SET review_status = 'referenced', reviewed_at = ?, updated_at = ?
       WHERE id = ?`,
    ).run(now, now, file.id);
    recordCatalogReview(file, "referenced", {
      productId: product.id,
      productFileId,
    });

    return {
      file: toCatalogFileSummary(requireCatalogFileRow(file.id)),
      product_id: product.id,
      product_name: product.name,
      product_file_id: productFileId,
    };
  })();
}

export function ignoreCatalogFile(id: number): CatalogFileSummary {
  return db.transaction(() => {
    const file = requireCatalogFileRow(id);
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE catalog_files
       SET review_status = 'ignored', reviewed_at = ?, updated_at = ?
       WHERE id = ?`,
    ).run(now, now, id);
    recordCatalogReview(file, "ignored", {});
    return toCatalogFileSummary(requireCatalogFileRow(id));
  })();
}

export function returnCatalogFileToInbox(id: number): CatalogFileSummary {
  return db.transaction(() => {
    const file = requireCatalogFileRow(id);
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE catalog_files
       SET review_status = 'inbox', reviewed_at = NULL, updated_at = ?
       WHERE id = ?`,
    ).run(now, id);
    recordCatalogReview(file, "returned_to_inbox", {});
    return toCatalogFileSummary(requireCatalogFileRow(id));
  })();
}

export function listCatalogDuplicateGroups(): CatalogDuplicateGroup[] {
  const files = db
    .prepare<
      [],
      CatalogFile
    >("SELECT * FROM catalog_files WHERE content_hash IS NOT NULL ORDER BY content_hash ASC, path ASC")
    .all();
  return groupCatalogDuplicates(files);
}

export function readCatalogPreview(file: string): CatalogPreviewContent | null {
  const match = file.match(/^([a-f0-9]{64})\.(png|jpg|jpeg)$/i);
  if (!match) return null;

  const [, rawHash, rawExtension] = match;
  if (!rawHash || !rawExtension) return null;

  const hash = rawHash.toLowerCase();
  const contentType = rawExtension.toLowerCase() === "png" ? "image/png" : "image/jpeg";
  const filePath = catalogPreviewPath(hash, contentType);
  if (!fs.existsSync(filePath)) return null;
  return { content: fs.readFileSync(filePath), contentType };
}

export async function runCatalogScan(): Promise<CatalogScanSummary> {
  const roots = listCatalogScanRoots().filter((root) => root.is_active === 1);
  const total: CatalogScanSummary = {
    scanned: 0,
    added: 0,
    changed: 0,
    unchanged: 0,
    missing: 0,
    restored: 0,
    skipped: 0,
    failed: 0,
    durationMs: 0,
  };

  for (const root of roots) {
    const summary = await scanCatalogRoot(catalogStatements, root);
    total.scanned += summary.scanned;
    total.added += summary.added;
    total.changed += summary.changed;
    total.unchanged += summary.unchanged;
    total.missing += summary.missing;
    total.restored += summary.restored;
    total.skipped += summary.skipped;
    total.failed += summary.failed;
    total.durationMs += summary.durationMs;
  }

  return total;
}
