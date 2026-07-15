import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { CatalogScanError, CatalogScanSummary } from "../shared/catalog.js";
import { extract3mfPreview, previewContentType, writeCatalogPreview } from "./catalog-preview.js";
import { createCatalogStatements, type CatalogStatements } from "./db/catalog-statements.js";
import type { CatalogFile, ScanRoot } from "./types.js";

export { createCatalogStatements, type CatalogStatements };

export interface AddScanRootInput {
  name: string;
  rootPath: string;
}

export interface DiscoveredCatalogFile {
  path: string;
  normalizedPath: string;
  filename: string;
  extension: string;
  sizeBytes: number;
  modifiedAt: string;
  createdAtFs: string;
}

export interface ExistingCatalogFileFingerprint {
  size_bytes: CatalogFile["size_bytes"];
  modified_at: CatalogFile["modified_at"];
  content_hash: CatalogFile["content_hash"];
}

export interface DiscoveredCatalogFileFingerprint {
  sizeBytes: number;
  modifiedAt: string;
}

export interface CatalogDiscoveryResult {
  files: DiscoveredCatalogFile[];
  skipped: number;
  failed: number;
  complete: boolean;
  errors: CatalogScanError[];
}

export interface CatalogScanOptions {
  hashFile?: (filePath: string) => Promise<string>;
}

const HASH_ALGORITHM = "sha256";
export const MAX_CATALOG_SCAN_ERRORS = 20;

const SUPPORTED_CATALOG_EXTENSIONS = new Set([
  ".3mf",
  ".stl",
  ".step",
  ".stp",
  ".obj",
  ".f3d",
  ".blend",
  ".gcode",
]);

const SKIPPED_CATALOG_DIRECTORIES = new Set([
  ".git",
  ".hg",
  ".svn",
  ".DS_Store",
  "node_modules",
  "__MACOSX",
]);

export function normalizeCatalogPath(rawPath: string): string {
  return path.resolve(rawPath);
}

export function isSupportedCatalogFilePath(filePath: string): boolean {
  return SUPPORTED_CATALOG_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function shouldSkipCatalogDirectory(dirname: string): boolean {
  return SKIPPED_CATALOG_DIRECTORIES.has(dirname);
}

function isPathInsideRoot(root: string, candidate: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  return (
    resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(resolvedRoot + path.sep)
  );
}

function resolveCatalogChildPath(root: string, parent: string, childName: string): string | null {
  const candidate = path.resolve(parent, childName);
  return isPathInsideRoot(root, candidate) ? candidate : null;
}

export function discoverCatalogFilesWithStats(rootPath: string): CatalogDiscoveryResult {
  const root = path.resolve(rootPath);
  const discovered: DiscoveredCatalogFile[] = [];
  let skipped = 0;
  let failed = 0;
  let complete = true;
  const errors: CatalogScanError[] = [];

  function recordFailure(error: CatalogScanError): void {
    failed++;
    complete = false;
    if (errors.length < MAX_CATALOG_SCAN_ERRORS) errors.push(error);
  }

  function visit(directory: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error: unknown) {
      recordFailure({
        phase: "read-directory",
        path: directory,
        message: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    for (const entry of entries) {
      const entryPath = resolveCatalogChildPath(root, directory, entry.name);
      if (!entryPath) {
        skipped++;
        continue;
      }
      if (entry.isSymbolicLink()) {
        skipped++;
        continue;
      }
      if (entry.isDirectory()) {
        if (shouldSkipCatalogDirectory(entry.name)) {
          skipped++;
        } else {
          visit(entryPath);
        }
        continue;
      }
      if (!entry.isFile() || !isSupportedCatalogFilePath(entry.name)) {
        skipped++;
        continue;
      }

      try {
        const stat = fs.statSync(entryPath);
        discovered.push({
          path: entryPath,
          normalizedPath: normalizeCatalogPath(entryPath),
          filename: entry.name,
          extension: path.extname(entry.name).slice(1).toLowerCase(),
          sizeBytes: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          createdAtFs: stat.birthtime.toISOString(),
        });
      } catch (error: unknown) {
        recordFailure({
          phase: "read-metadata",
          path: entryPath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  visit(root);
  return {
    files: discovered.sort((a, b) => a.normalizedPath.localeCompare(b.normalizedPath)),
    skipped,
    failed,
    complete,
    errors,
  };
}

export function discoverCatalogFiles(rootPath: string): DiscoveredCatalogFile[] {
  return discoverCatalogFilesWithStats(rootPath).files;
}

export function hashFileContent(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export function fileNeedsContentHash(
  existing: ExistingCatalogFileFingerprint | null,
  discovered: DiscoveredCatalogFileFingerprint,
): boolean {
  if (!existing?.content_hash) return true;
  return (
    existing.size_bytes !== discovered.sizeBytes || existing.modified_at !== discovered.modifiedAt
  );
}

export function addScanRoot(statements: CatalogStatements, input: AddScanRootInput): ScanRoot {
  const rootPath = path.resolve(input.rootPath);
  let stat: fs.Stats;
  try {
    stat = fs.statSync(rootPath);
  } catch {
    throw new Error(`Scan root is not a directory: ${rootPath}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`Scan root is not a directory: ${rootPath}`);
  }

  const normalizedRootPath = normalizeCatalogPath(rootPath);
  const existing = statements.getScanRootByNormalizedPath.get(normalizedRootPath);
  if (existing) {
    throw new Error(`Scan root already exists: ${rootPath}`);
  }

  const result = statements.insertScanRoot.run({
    name: input.name,
    root_path: rootPath,
    normalized_root_path: normalizedRootPath,
  });
  return statements.getScanRootById.get(Number(result.lastInsertRowid))!;
}

export function listScanRoots(statements: CatalogStatements): ScanRoot[] {
  return statements.listScanRoots.all();
}

export function deactivateScanRoot(statements: CatalogStatements, id: number): ScanRoot {
  statements.deactivateScanRoot.run({ id, updated_at: new Date().toISOString() });
  const root = statements.getScanRootById.get(id);
  if (!root) throw new Error(`Scan root not found: ${id}`);
  return root;
}

function insertHistory(
  statements: CatalogStatements,
  file: CatalogFile,
  eventType: string,
  newPath: string | null,
  contentHash: string | null,
): void {
  statements.insertFileHistory.run({
    file_id: file.id,
    event_type: eventType,
    old_path: file.path ?? null,
    new_path: newPath,
    old_root_id: file.root_id ?? null,
    new_root_id: file.root_id ?? null,
    content_hash: contentHash,
    details_json: null,
  });
}

function writePreviewMetadata(
  statements: CatalogStatements,
  discovered: DiscoveredCatalogFile,
  file: CatalogFile,
  contentHash: string,
  now: string,
): void {
  if (discovered.extension !== "3mf") return;

  try {
    const preview = extract3mfPreview(discovered.path);
    const contentType = preview ? previewContentType(preview) : null;
    const metadataJson =
      preview && contentType
        ? JSON.stringify({ preview: { contentType, hash: contentHash } })
        : null;

    if (preview && contentType) writeCatalogPreview(contentHash, preview, contentType);
    statements.updateCatalogFileMetadata.run({
      id: file.id,
      metadata_json: metadataJson,
      updated_at: now,
    });
  } catch {
    try {
      statements.updateCatalogFileMetadata.run({
        id: file.id,
        metadata_json: null,
        updated_at: now,
      });
    } catch {
      // Preview extraction and caching are best-effort; scan results should not depend on them.
    }
  }
}

function updatePresentCatalogFile(
  statements: CatalogStatements,
  existing: CatalogFile,
  discovered: DiscoveredCatalogFile,
  contentHash: string,
  now: string,
): CatalogFile {
  statements.updateCatalogFilePresent.run({
    id: existing.id,
    path: discovered.path,
    normalized_path: discovered.normalizedPath,
    filename: discovered.filename,
    extension: discovered.extension,
    size_bytes: discovered.sizeBytes,
    modified_at: discovered.modifiedAt,
    created_at_fs: discovered.createdAtFs,
    content_hash: contentHash,
    hash_algorithm: HASH_ALGORITHM,
    last_seen_at: now,
    updated_at: now,
  });
  return statements.getCatalogFileByNormalizedPath.get(discovered.normalizedPath)!;
}

export async function scanCatalogRoot(
  statements: CatalogStatements,
  root: ScanRoot,
  options: CatalogScanOptions = {},
): Promise<CatalogScanSummary> {
  const startedAt = Date.now();
  const now = new Date().toISOString();
  const hashFile = options.hashFile ?? hashFileContent;
  const discovery = discoverCatalogFilesWithStats(root.root_path);
  const discoveredFiles = discovery.files;
  const seenPaths = new Set<string>();
  const summary: CatalogScanSummary = {
    scanned: discoveredFiles.length,
    added: 0,
    changed: 0,
    unchanged: 0,
    missing: 0,
    restored: 0,
    skipped: discovery.skipped,
    failed: discovery.failed,
    incompleteRoots: discovery.complete ? 0 : 1,
    errors: [...discovery.errors],
    durationMs: 0,
  };

  for (const discovered of discoveredFiles) {
    try {
      seenPaths.add(discovered.normalizedPath);
      const existing = statements.getCatalogFileByNormalizedPath.get(discovered.normalizedPath);
      if (!existing) {
        const contentHash = await hashFile(discovered.path);
        const result = statements.insertCatalogFile.run({
          root_id: root.id,
          path: discovered.path,
          normalized_path: discovered.normalizedPath,
          filename: discovered.filename,
          extension: discovered.extension,
          size_bytes: discovered.sizeBytes,
          modified_at: discovered.modifiedAt,
          created_at_fs: discovered.createdAtFs,
          content_hash: contentHash,
          hash_algorithm: HASH_ALGORITHM,
          review_status: "inbox",
        });
        const inserted = statements.getCatalogFileByNormalizedPath.get(discovered.normalizedPath)!;
        if (!inserted.id && result.lastInsertRowid) {
          throw new Error(`Failed to insert catalog file: ${discovered.path}`);
        }
        writePreviewMetadata(statements, discovered, inserted, contentHash, now);
        insertHistory(statements, inserted, "discovered", discovered.path, contentHash);
        summary.added++;
        continue;
      }

      const wasMissing = existing.scan_status === "missing";
      if (fileNeedsContentHash(existing, discovered) || wasMissing) {
        const contentHash = await hashFile(discovered.path);
        const updated = updatePresentCatalogFile(
          statements,
          existing,
          discovered,
          contentHash,
          now,
        );
        writePreviewMetadata(statements, discovered, updated, contentHash, now);
        insertHistory(
          statements,
          updated,
          wasMissing ? "restored" : "changed",
          discovered.path,
          contentHash,
        );
        if (wasMissing) summary.restored++;
        else summary.changed++;
        continue;
      }

      if (!existing.content_hash) {
        throw new Error(`Catalog file is missing content hash: ${existing.path}`);
      }
      updatePresentCatalogFile(statements, existing, discovered, existing.content_hash, now);
      summary.unchanged++;
    } catch (error: unknown) {
      summary.failed++;
      if (summary.errors.length < MAX_CATALOG_SCAN_ERRORS) {
        summary.errors.push({
          phase: "index-file",
          path: discovered.path,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  if (discovery.complete) {
    for (const existing of statements.listCatalogFilesByRoot.all(root.id)) {
      if (existing.scan_status === "missing" || seenPaths.has(existing.normalized_path)) continue;
      statements.markCatalogFileMissing.run({
        id: existing.id,
        missing_since: now,
        updated_at: now,
      });
      const missing = statements.getCatalogFileByNormalizedPath.get(existing.normalized_path)!;
      insertHistory(statements, missing, "missing", null, existing.content_hash);
      summary.missing++;
    }
  }

  statements.updateScanRootLastScanned.run({ id: root.id, last_scanned_at: now, updated_at: now });
  summary.durationMs = Date.now() - startedAt;
  return summary;
}
