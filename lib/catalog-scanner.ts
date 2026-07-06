import path from "node:path";
import {
  createCatalogStatements,
  type CatalogStatements,
} from "./db/catalog-statements.js";
import type { ScanRoot } from "./types.js";

export { createCatalogStatements, type CatalogStatements };

export interface AddScanRootInput {
  name: string;
  rootPath: string;
}

export function normalizeCatalogPath(rawPath: string): string {
  return path.resolve(rawPath).toLowerCase();
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
