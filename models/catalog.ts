import fs from "node:fs";
import path from "node:path";
import { groupCatalogInboxCandidates } from "../lib/catalog-candidates.js";
import { groupCatalogDuplicates } from "../lib/catalog-duplicates.js";
import { catalogPreviewExists, catalogPreviewPath } from "../lib/catalog-preview.js";
import { db } from "../lib/db.js";
import { createProduct } from "./products.js";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  listScanRoots,
  scanCatalogRoot,
  MAX_CATALOG_SCAN_ERRORS,
} from "../lib/catalog-scanner.js";
import type { CatalogFile, ScanRoot } from "../lib/types.js";
import type {
  CatalogCandidateAdoption,
  CatalogDuplicateGroup,
  CatalogDuplicatePage,
  CatalogFileAdoption,
  CatalogFilePage,
  CatalogFileSummary,
  CatalogInboxCandidate,
  CatalogInboxCandidateFile,
  CatalogScanSummary,
} from "../shared/catalog.js";

const catalogStatements = createCatalogStatements(db);

export interface AddCatalogScanRootInput {
  rootPath: string;
  name?: string;
}

export interface CatalogFileListQuery {
  page?: number;
  pageSize?: number;
  query?: string;
  scanStatus?: "present" | "missing";
  reviewStatus?: "indexed" | "inbox" | "referenced" | "ignored";
}

interface CatalogFileListRow extends CatalogFile {
  linked_product_id: number | null;
  linked_product_name: string | null;
  scan_root_path: string | null;
}

export interface AdoptCatalogFileInput {
  productId?: number;
  productName?: string;
}

export interface AdoptCatalogCandidateInput extends AdoptCatalogFileInput {
  fileIds: number[];
  primaryFileId: number;
}

export class CatalogValidationError extends Error {}
export class CatalogConflictError extends Error {}
export class CatalogScanInProgressError extends Error {}

let catalogScanInProgress = false;

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
  linked.product_name AS linked_product_name,
  sr.root_path AS scan_root_path
FROM catalog_files cf
LEFT JOIN scan_roots sr ON sr.id = cf.root_id
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

function toCatalogInboxCandidateFile(file: CatalogFileListRow): CatalogInboxCandidateFile {
  return {
    ...toCatalogFileSummary(file),
    rootPath: file.scan_root_path ?? path.dirname(file.path),
  };
}

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

function catalogFileHasProductLinks(fileId: number): boolean {
  return Boolean(
    db
      .prepare<
        [number],
        { linked: number }
      >("SELECT 1 AS linked FROM product_files WHERE file_id = ? LIMIT 1")
      .get(fileId),
  );
}

function createProductFileReference(productId: number, file: CatalogFile): number {
  const existing = db
    .prepare<
      [number, number],
      { id: number }
    >("SELECT id FROM product_files WHERE product_id = ? AND file_id = ? ORDER BY id LIMIT 1")
    .get(productId, file.id)?.id;
  if (existing) return existing;
  return Number(
    db
      .prepare(
        `INSERT INTO product_files (product_id, file_id, role, label)
         VALUES (?, ?, 'source', ?)
         RETURNING id`,
      )
      .pluck()
      .get(productId, file.id, file.filename),
  );
}

function markCatalogFileReferenced(
  file: CatalogFile,
  productId: number,
  productFileId: number,
  now: string,
  candidateKey?: string,
): void {
  db.prepare(
    `UPDATE catalog_files
     SET review_status = 'referenced', reviewed_at = ?, updated_at = ?
     WHERE id = ?`,
  ).run(now, now, file.id);
  recordCatalogReview(file, "referenced", {
    productId,
    productFileId,
    ...(candidateKey ? { candidateKey } : {}),
  });
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

export function listCatalogFiles(input: CatalogFileListQuery = {}): CatalogFilePage {
  const requestedPage = Math.max(1, Math.trunc(input.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(input.pageSize ?? 48)));
  const conditions: string[] = [];
  const parameters: string[] = [];
  const query = input.query?.trim();

  if (query) {
    conditions.push("(cf.filename LIKE ? ESCAPE '\\' OR cf.path LIKE ? ESCAPE '\\')");
    const escapedQuery = query
      .replaceAll("\\", "\\\\")
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    parameters.push(`%${escapedQuery}%`, `%${escapedQuery}%`);
  }
  if (input.scanStatus) {
    conditions.push("cf.scan_status = ?");
    parameters.push(input.scanStatus);
  }
  if (input.reviewStatus) {
    conditions.push("cf.review_status = ?");
    parameters.push(input.reviewStatus);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  const total = Number(
    db
      .prepare(`SELECT COUNT(*) FROM catalog_files cf${whereClause}`)
      .pluck()
      .get(...parameters),
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(
      `${CATALOG_FILE_LIST_SELECT}${whereClause}
       ORDER BY cf.updated_at DESC, cf.id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...parameters, pageSize, offset) as CatalogFileListRow[];

  return {
    files: rows.map(toCatalogFileSummary),
    page,
    pageSize,
    total,
    totalPages,
  };
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

export function listCatalogInboxCandidates(): CatalogInboxCandidate[] {
  const files = db
    .prepare<[], CatalogFileListRow>(
      `${CATALOG_FILE_LIST_SELECT}
       WHERE cf.review_status = 'inbox' AND cf.scan_status = 'present'
       ORDER BY cf.first_seen_at DESC, cf.id DESC`,
    )
    .all()
    .map(toCatalogInboxCandidateFile);
  return groupCatalogInboxCandidates(files);
}

export function adoptCatalogFile(id: number, input: AdoptCatalogFileInput): CatalogFileAdoption {
  return db.transaction(() => {
    const file = requireCatalogFileRow(id);
    if (file.scan_status !== "present") {
      throw new CatalogValidationError("Missing catalog files cannot be adopted");
    }
    const product = resolveAdoptionProduct(input);
    const productFileId = createProductFileReference(product.id, file);

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE products
       SET main_file_id = COALESCE(main_file_id, ?), updated_at = ?
       WHERE id = ?`,
    ).run(productFileId, now, product.id);
    markCatalogFileReferenced(file, product.id, productFileId, now);

    return {
      file: toCatalogFileSummary(requireCatalogFileRow(file.id)),
      product_id: product.id,
      product_name: product.name,
      product_file_id: productFileId,
    };
  })();
}

export function adoptCatalogCandidate(input: AdoptCatalogCandidateInput): CatalogCandidateAdoption {
  return db.transaction(() => {
    const fileIds = [...new Set(input.fileIds)];
    if (fileIds.length === 0 || fileIds.length > 500) {
      throw new CatalogValidationError("fileIds must contain between 1 and 500 unique files");
    }
    if (fileIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new CatalogValidationError("fileIds must contain positive integers");
    }
    if (!fileIds.includes(input.primaryFileId)) {
      throw new CatalogValidationError("primaryFileId must be included in fileIds");
    }

    const placeholders = fileIds.map(() => "?").join(", ");
    const files = db
      .prepare(`${CATALOG_FILE_LIST_SELECT} WHERE cf.id IN (${placeholders})`)
      .all(...fileIds) as CatalogFileListRow[];
    if (files.length !== fileIds.length) {
      throw new CatalogValidationError("One or more catalog files were not found");
    }
    if (files.some((file) => file.scan_status !== "present" || file.review_status !== "inbox")) {
      throw new CatalogConflictError("Candidate files must be present and awaiting inbox review");
    }
    if (files.some((file) => catalogFileHasProductLinks(file.id))) {
      throw new CatalogConflictError("Candidate files cannot already be linked to products");
    }

    const candidates = groupCatalogInboxCandidates(files.map(toCatalogInboxCandidateFile));
    if (candidates.length !== 1 || candidates[0]?.files.length !== files.length) {
      throw new CatalogValidationError("fileIds must belong to one current inbox candidate");
    }
    const [candidate] = candidates;
    if (!candidate || candidate.primary_file_id !== input.primaryFileId) {
      throw new CatalogConflictError(
        "The candidate primary file has changed; refresh and try again",
      );
    }

    const product = resolveAdoptionProduct(input);
    const now = new Date().toISOString();
    let primaryProductFileId: number | null = null;
    for (const file of files) {
      const productFileId = createProductFileReference(product.id, file);
      if (file.id === input.primaryFileId) primaryProductFileId = productFileId;
      markCatalogFileReferenced(file, product.id, productFileId, now, candidate.key);
    }
    if (primaryProductFileId === null) {
      throw new CatalogValidationError("Unable to create the primary product file reference");
    }
    db.prepare(
      `UPDATE products
       SET main_file_id = COALESCE(main_file_id, ?), updated_at = ?
       WHERE id = ?`,
    ).run(primaryProductFileId, now, product.id);

    return {
      files: files.map((file) => toCatalogFileSummary(requireCatalogFileRow(file.id))),
      product_id: product.id,
      product_name: product.name,
      primary_product_file_id: primaryProductFileId,
    };
  })();
}

export function ignoreCatalogFile(id: number): CatalogFileSummary {
  return db.transaction(() => {
    const file = requireCatalogFileRow(id);
    if (file.review_status !== "inbox") {
      throw new CatalogConflictError("Only inbox files can be ignored");
    }
    if (catalogFileHasProductLinks(file.id)) {
      throw new CatalogConflictError("Linked catalog files cannot be ignored");
    }
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
    if (file.review_status !== "ignored") {
      throw new CatalogConflictError("Only ignored files can be returned to the inbox");
    }
    if (catalogFileHasProductLinks(file.id)) {
      throw new CatalogConflictError("Linked catalog files cannot be returned to the inbox");
    }
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

export function listCatalogDuplicateGroups(page = 1, pageSize = 25): CatalogDuplicatePage {
  const requestedPage = Math.max(1, Math.trunc(page));
  const boundedPageSize = Math.min(50, Math.max(1, Math.trunc(pageSize)));
  const duplicateHashQuery = `SELECT content_hash, COUNT(*) AS file_count
    FROM catalog_files
    WHERE content_hash IS NOT NULL AND scan_status <> 'missing'
    GROUP BY content_hash
    HAVING COUNT(*) > 1`;
  const totals = db
    .prepare<[], { total: number; extra_copies: number }>(
      `SELECT COUNT(*) AS total, COALESCE(SUM(file_count - 1), 0) AS extra_copies
       FROM (${duplicateHashQuery}) duplicate_hashes`,
    )
    .get() ?? { total: 0, extra_copies: 0 };
  const totalPages = Math.max(1, Math.ceil(totals.total / boundedPageSize));
  const boundedPage = Math.min(requestedPage, totalPages);
  const hashes = db
    .prepare<[number, number], { content_hash: string }>(
      `${duplicateHashQuery}
       ORDER BY file_count DESC, content_hash ASC
       LIMIT ? OFFSET ?`,
    )
    .all(boundedPageSize, (boundedPage - 1) * boundedPageSize)
    .map((row) => row.content_hash);

  let groups: CatalogDuplicateGroup[] = [];
  if (hashes.length > 0) {
    const placeholders = hashes.map(() => "?").join(", ");
    const files = db
      .prepare(
        `SELECT * FROM catalog_files
         WHERE scan_status <> 'missing' AND content_hash IN (${placeholders})
         ORDER BY content_hash ASC, path ASC`,
      )
      .all(...hashes) as CatalogFile[];
    groups = groupCatalogDuplicates(files);
  }

  return {
    groups,
    page: boundedPage,
    pageSize: boundedPageSize,
    total: totals.total,
    totalPages,
    extraCopies: totals.extra_copies,
  };
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
  if (catalogScanInProgress) {
    throw new CatalogScanInProgressError("A catalog scan is already in progress");
  }
  catalogScanInProgress = true;

  try {
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
      incompleteRoots: 0,
      errors: [],
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
      total.incompleteRoots += summary.incompleteRoots;
      total.errors.push(...summary.errors.slice(0, MAX_CATALOG_SCAN_ERRORS - total.errors.length));
      total.durationMs += summary.durationMs;
    }

    return total;
  } finally {
    catalogScanInProgress = false;
  }
}
