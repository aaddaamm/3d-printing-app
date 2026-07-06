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
