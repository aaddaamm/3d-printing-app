import type Database from "better-sqlite3";
import type { ScanRoot } from "../types.js";

export interface CatalogStatements {
  insertScanRoot: Database.Statement<{
    name: string;
    root_path: string;
    normalized_root_path: string;
  }>;
  getScanRootById: Database.Statement<[number], ScanRoot>;
  getScanRootByNormalizedPath: Database.Statement<[string], ScanRoot>;
  listScanRoots: Database.Statement<[], ScanRoot>;
  deactivateScanRoot: Database.Statement<{
    id: number;
    updated_at: string;
  }>;
}

export function createCatalogStatements(db: Database.Database): CatalogStatements {
  return {
    insertScanRoot: db.prepare(`
      INSERT INTO scan_roots (name, root_path, normalized_root_path)
      VALUES (@name, @root_path, @normalized_root_path)
    `),
    getScanRootById: db.prepare<[number], ScanRoot>("SELECT * FROM scan_roots WHERE id = ?"),
    getScanRootByNormalizedPath: db.prepare<[string], ScanRoot>(
      "SELECT * FROM scan_roots WHERE normalized_root_path = ?",
    ),
    listScanRoots: db.prepare<[], ScanRoot>("SELECT * FROM scan_roots ORDER BY id ASC"),
    deactivateScanRoot: db.prepare(`
      UPDATE scan_roots
      SET is_active = 0, updated_at = @updated_at
      WHERE id = @id
    `),
  };
}
