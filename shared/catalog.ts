export interface CatalogScanRoot {
  id: number;
  name: string;
  root_path: string;
  normalized_root_path: string;
  is_active: number;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogScanError {
  phase: "read-directory" | "read-metadata" | "index-file";
  path: string;
  message: string;
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
  incompleteRoots: number;
  errors: CatalogScanError[];
  durationMs: number;
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

export interface CatalogInboxCandidateFile extends CatalogFileSummary {
  rootPath: string;
}

export interface CatalogInboxCandidate {
  key: string;
  name: string;
  folder: string;
  primary_file_id: number;
  total_size_bytes: number;
  files: CatalogInboxCandidateFile[];
}

export interface CatalogDuplicateFileSummary {
  id: number;
  filename: string;
  folder: string;
  path: string;
  size_bytes: number | null;
  modified_at: string | null;
  scan_status: string;
}

export interface CatalogDuplicateGroup {
  content_hash: string;
  size_bytes: number | null;
  files: CatalogDuplicateFileSummary[];
  suggested_keep_id: number;
  suggestion: string;
}

export interface CatalogFilePage {
  files: CatalogFileSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogDuplicatePage {
  groups: CatalogDuplicateGroup[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  extraCopies: number;
}

export interface CatalogFileAdoption {
  file: CatalogFileSummary;
  product_id: number;
  product_name: string;
  product_file_id: number;
}

export interface CatalogCandidateAdoption {
  files: CatalogFileSummary[];
  product_id: number;
  product_name: string;
  primary_product_file_id: number;
}

export type CatalogInboxResponse = { candidates: CatalogInboxCandidate[] };
export type CatalogRootsResponse = { roots: CatalogScanRoot[] };
export type CatalogRootResponse = { root: CatalogScanRoot };
export type CatalogScanResponse = { summary: CatalogScanSummary };
export type CatalogFileAdoptionResponse = { adoption: CatalogFileAdoption };
export type CatalogCandidateAdoptionResponse = { adoption: CatalogCandidateAdoption };
export type CatalogFileResponse = { file: CatalogFileSummary };
