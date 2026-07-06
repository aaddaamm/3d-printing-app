import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  createCatalogStatements,
  type CatalogStatements,
} from "./db/catalog-statements.js";
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

export interface CatalogScanSummary {
  scanned: number;
  added: number;
  changed: number;
  unchanged: number;
  missing: number;
  restored: number;
  skipped: number;
  failed: number;
  durationMs: number;
}

const HASH_ALGORITHM = "sha256";

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
  return path.resolve(rawPath).toLowerCase();
}

export function isSupportedCatalogFilePath(filePath: string): boolean {
  return SUPPORTED_CATALOG_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function shouldSkipCatalogDirectory(dirname: string): boolean {
  return SKIPPED_CATALOG_DIRECTORIES.has(dirname);
}

export function discoverCatalogFiles(rootPath: string): DiscoveredCatalogFile[] {
  const root = path.resolve(rootPath);
  const discovered: DiscoveredCatalogFile[] = [];

  function visit(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        if (!shouldSkipCatalogDirectory(entry.name)) visit(entryPath);
        continue;
      }
      if (!entry.isFile() || !isSupportedCatalogFilePath(entry.name)) continue;

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
    }
  }

  visit(root);
  return discovered.sort((a, b) => a.normalizedPath.localeCompare(b.normalizedPath));
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
  return existing.size_bytes !== discovered.sizeBytes || existing.modified_at !== discovered.modifiedAt;
}

export function addScanRoot(statements: CatalogStatements, input: AddScanRootInput): ScanRoot {
  const rootPath = path.resolve(input.rootPath);
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

async function updatePresentCatalogFile(
  statements: CatalogStatements,
  existing: CatalogFile,
  discovered: DiscoveredCatalogFile,
  contentHash: string,
  now: string,
): Promise<CatalogFile> {
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
): Promise<CatalogScanSummary> {
  const startedAt = Date.now();
  const now = new Date().toISOString();
  const discoveredFiles = discoverCatalogFiles(root.root_path);
  const seenPaths = new Set<string>();
  const summary: CatalogScanSummary = {
    scanned: discoveredFiles.length,
    added: 0,
    changed: 0,
    unchanged: 0,
    missing: 0,
    restored: 0,
    skipped: 0,
    failed: 0,
    durationMs: 0,
  };

  for (const discovered of discoveredFiles) {
    seenPaths.add(discovered.normalizedPath);
    const existing = statements.getCatalogFileByNormalizedPath.get(discovered.normalizedPath);
    if (!existing) {
      const contentHash = await hashFileContent(discovered.path);
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
      });
      const inserted = statements.getCatalogFileByNormalizedPath.get(discovered.normalizedPath)!;
      if (!inserted.id && result.lastInsertRowid) {
        throw new Error(`Failed to insert catalog file: ${discovered.path}`);
      }
      insertHistory(statements, inserted, "discovered", discovered.path, contentHash);
      summary.added++;
      continue;
    }

    const wasMissing = existing.scan_status === "missing";
    if (fileNeedsContentHash(existing, discovered) || wasMissing) {
      const contentHash = await hashFileContent(discovered.path);
      const updated = await updatePresentCatalogFile(
        statements,
        existing,
        discovered,
        contentHash,
        now,
      );
      insertHistory(statements, updated, wasMissing ? "restored" : "changed", discovered.path, contentHash);
      if (wasMissing) summary.restored++;
      else summary.changed++;
      continue;
    }

    if (!existing.content_hash) {
      throw new Error(`Catalog file is missing content hash: ${existing.path}`);
    }
    await updatePresentCatalogFile(statements, existing, discovered, existing.content_hash, now);
    summary.unchanged++;
  }

  for (const existing of statements.listCatalogFilesByRoot.all(root.id)) {
    if (existing.scan_status === "missing" || seenPaths.has(existing.normalized_path)) continue;
    statements.markCatalogFileMissing.run({ id: existing.id, missing_since: now, updated_at: now });
    const missing = statements.getCatalogFileByNormalizedPath.get(existing.normalized_path)!;
    insertHistory(statements, missing, "missing", null, existing.content_hash);
    summary.missing++;
  }

  statements.updateScanRootLastScanned.run({ id: root.id, last_scanned_at: now, updated_at: now });
  summary.durationMs = Date.now() - startedAt;
  return summary;
}
