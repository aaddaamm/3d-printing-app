import { describe, expect, it } from "vitest";
import { groupCatalogDuplicates } from "../lib/catalog-duplicates.js";
import type { CatalogFile } from "../lib/types.js";

function catalogFile(overrides: Partial<CatalogFile>): CatalogFile {
  return {
    id: 1,
    root_id: 1,
    path: "/Users/adam/Downloads/model.3mf",
    normalized_path: "/Users/adam/Downloads/model.3mf",
    filename: "model.3mf",
    extension: "3mf",
    size_bytes: 100,
    modified_at: "2026-07-06T00:00:00.000Z",
    created_at_fs: "2026-07-06T00:00:00.000Z",
    quick_hash: null,
    content_hash: "a".repeat(64),
    hash_algorithm: "sha256",
    storage_role: "source",
    managed_blob_id: null,
    original_source_path: null,
    original_source_root_id: null,
    scan_status: "present",
    review_status: "indexed",
    reviewed_at: null,
    missing_since: null,
    metadata_json: null,
    first_seen_at: "2026-07-06T00:00:00.000Z",
    last_seen_at: "2026-07-06T00:00:00.000Z",
    updated_at: "2026-07-06T00:00:00.000Z",
    ...overrides,
  };
}

describe("catalog duplicate grouping", () => {
  it("groups exact duplicates by content hash and suggests the organized 3d_prints copy", () => {
    const duplicateHash = "b".repeat(64);
    const groups = groupCatalogDuplicates([
      catalogFile({
        id: 1,
        path: "/Users/adam/Downloads/dragon.3mf",
        filename: "dragon.3mf",
        content_hash: duplicateHash,
        modified_at: "2026-07-07T00:00:00.000Z",
      }),
      catalogFile({
        id: 2,
        path: "/Users/adam/3d_prints/dragon.3mf",
        filename: "dragon.3mf",
        content_hash: duplicateHash,
        modified_at: "2026-07-06T00:00:00.000Z",
      }),
      catalogFile({
        id: 3,
        path: "/Users/adam/Desktop/unrelated.3mf",
        filename: "unrelated.3mf",
        content_hash: "c".repeat(64),
      }),
      catalogFile({
        id: 4,
        path: "/Users/adam/Downloads/missing.3mf",
        filename: "missing.3mf",
        content_hash: duplicateHash,
        scan_status: "missing",
      }),
    ]);

    expect(groups).toEqual([
      {
        content_hash: duplicateHash,
        size_bytes: 100,
        suggested_keep_id: 2,
        suggestion:
          "Keep the copy in 3d_prints and review duplicates in Downloads, Desktop, 3d_prints.",
        files: [
          expect.objectContaining({ id: 2, folder: "/Users/adam/3d_prints" }),
          expect.objectContaining({ id: 1, folder: "/Users/adam/Downloads" }),
        ],
      },
    ]);
  });
});
