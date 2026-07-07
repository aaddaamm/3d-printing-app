import { db } from "../lib/db.js";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  listScanRoots,
  scanCatalogRoot,
  type CatalogScanSummary,
} from "../lib/catalog-scanner.js";
import type { ScanRoot } from "../lib/types.js";

const catalogStatements = createCatalogStatements(db);

export interface AddCatalogScanRootInput {
  rootPath: string;
  name?: string;
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
