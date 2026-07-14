import path from "node:path";
import type { CatalogFile } from "./types.js";

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

const ORGANIZATION_HINT_DIRS = ["Downloads", "Desktop", "3d_prints"];

function organizationScore(file: CatalogDuplicateFileSummary): number {
  const parts = file.path.split(path.sep).filter(Boolean);
  if (parts.includes("3d_prints")) return 0;
  if (parts.includes("Downloads") || parts.includes("Desktop")) return 2;
  return 1;
}

function modifiedTime(file: CatalogDuplicateFileSummary): number {
  if (!file.modified_at) return 0;
  const time = new Date(file.modified_at).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function toSummary(file: CatalogFile): CatalogDuplicateFileSummary {
  return {
    id: file.id,
    filename: file.filename,
    folder: path.dirname(file.path),
    path: file.path,
    size_bytes: file.size_bytes,
    modified_at: file.modified_at,
    scan_status: file.scan_status,
  };
}

function chooseKeeper(files: CatalogDuplicateFileSummary[]): CatalogDuplicateFileSummary {
  const [keeper] = [...files].sort((a, b) => {
    const score = organizationScore(a) - organizationScore(b);
    if (score !== 0) return score;
    const modified = modifiedTime(b) - modifiedTime(a);
    if (modified !== 0) return modified;
    return a.path.length - b.path.length;
  });
  if (!keeper) throw new Error("Duplicate group must contain at least one file");
  return keeper;
}

function suggestionFor(keeper: CatalogDuplicateFileSummary): string {
  const hintText = ORGANIZATION_HINT_DIRS.join(", ");
  if (keeper.path.includes(`${path.sep}3d_prints${path.sep}`)) {
    return `Keep the copy in 3d_prints and review duplicates in ${hintText}.`;
  }
  return `Review folders and keep the best-organized copy. Common sources: ${hintText}.`;
}

export function groupCatalogDuplicates(files: CatalogFile[]): CatalogDuplicateGroup[] {
  const byHash = new Map<string, CatalogDuplicateFileSummary[]>();
  for (const file of files) {
    if (!file.content_hash || file.scan_status === "missing") continue;
    const items = byHash.get(file.content_hash) ?? [];
    items.push(toSummary(file));
    byHash.set(file.content_hash, items);
  }

  const groups: CatalogDuplicateGroup[] = [];
  for (const [contentHash, filesForHash] of byHash.entries()) {
    if (filesForHash.length <= 1) continue;
    const filesSorted = filesForHash.sort((a, b) => {
      const score = organizationScore(a) - organizationScore(b);
      if (score !== 0) return score;
      return a.path.localeCompare(b.path);
    });
    const keeper = chooseKeeper(filesSorted);
    groups.push({
      content_hash: contentHash,
      size_bytes: keeper.size_bytes,
      files: filesSorted,
      suggested_keep_id: keeper.id,
      suggestion: suggestionFor(keeper),
    });
  }

  return groups.sort(
    (a, b) => b.files.length - a.files.length || a.content_hash.localeCompare(b.content_hash),
  );
}
