import type Database from "better-sqlite3";
import type { CatalogFile, ScanRoot } from "../types.js";

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
  getCatalogFileByNormalizedPath: Database.Statement<[string], CatalogFile>;
  listCatalogFilesByRoot: Database.Statement<[number], CatalogFile>;
  insertCatalogFile: Database.Statement<{
    root_id: number;
    path: string;
    normalized_path: string;
    filename: string;
    extension: string;
    size_bytes: number;
    modified_at: string;
    created_at_fs: string;
    content_hash: string;
    hash_algorithm: string;
    review_status: string;
  }>;
  updateCatalogFilePresent: Database.Statement<{
    id: number;
    path: string;
    normalized_path: string;
    filename: string;
    extension: string;
    size_bytes: number;
    modified_at: string;
    created_at_fs: string;
    content_hash: string;
    hash_algorithm: string;
    last_seen_at: string;
    updated_at: string;
  }>;
  markCatalogFileMissing: Database.Statement<{
    id: number;
    missing_since: string;
    updated_at: string;
  }>;
  updateCatalogFileMetadata: Database.Statement<{
    id: number;
    metadata_json: string | null;
    updated_at: string;
  }>;
  insertFileHistory: Database.Statement<{
    file_id: number;
    event_type: string;
    old_path: string | null;
    new_path: string | null;
    old_root_id: number | null;
    new_root_id: number | null;
    content_hash: string | null;
    details_json: string | null;
  }>;
  updateScanRootLastScanned: Database.Statement<{
    id: number;
    last_scanned_at: string;
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
    getCatalogFileByNormalizedPath: db.prepare<[string], CatalogFile>(
      "SELECT * FROM catalog_files WHERE normalized_path = ?",
    ),
    listCatalogFilesByRoot: db.prepare<[number], CatalogFile>(
      "SELECT * FROM catalog_files WHERE root_id = ? ORDER BY id ASC",
    ),
    insertCatalogFile: db.prepare(`
      INSERT INTO catalog_files (
        root_id,
        path,
        normalized_path,
        filename,
        extension,
        size_bytes,
        modified_at,
        created_at_fs,
        content_hash,
        hash_algorithm,
        review_status,
        scan_status,
        original_source_path,
        original_source_root_id
      ) VALUES (
        @root_id,
        @path,
        @normalized_path,
        @filename,
        @extension,
        @size_bytes,
        @modified_at,
        @created_at_fs,
        @content_hash,
        @hash_algorithm,
        @review_status,
        'present',
        @path,
        @root_id
      )
    `),
    updateCatalogFilePresent: db.prepare(`
      UPDATE catalog_files
      SET path = @path,
        normalized_path = @normalized_path,
        filename = @filename,
        extension = @extension,
        size_bytes = @size_bytes,
        modified_at = @modified_at,
        created_at_fs = @created_at_fs,
        content_hash = @content_hash,
        hash_algorithm = @hash_algorithm,
        scan_status = 'present',
        missing_since = NULL,
        last_seen_at = @last_seen_at,
        updated_at = @updated_at
      WHERE id = @id
    `),
    markCatalogFileMissing: db.prepare(`
      UPDATE catalog_files
      SET scan_status = 'missing',
        missing_since = @missing_since,
        updated_at = @updated_at
      WHERE id = @id
    `),
    updateCatalogFileMetadata: db.prepare(`
      UPDATE catalog_files
      SET metadata_json = @metadata_json,
        updated_at = @updated_at
      WHERE id = @id
    `),
    insertFileHistory: db.prepare(`
      INSERT INTO file_history (
        file_id,
        event_type,
        old_path,
        new_path,
        old_root_id,
        new_root_id,
        content_hash,
        details_json
      ) VALUES (
        @file_id,
        @event_type,
        @old_path,
        @new_path,
        @old_root_id,
        @new_root_id,
        @content_hash,
        @details_json
      )
    `),
    updateScanRootLastScanned: db.prepare(`
      UPDATE scan_roots
      SET last_scanned_at = @last_scanned_at,
        updated_at = @updated_at
      WHERE id = @id
    `),
  };
}
