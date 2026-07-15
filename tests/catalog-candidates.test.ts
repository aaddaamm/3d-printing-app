import { describe, expect, it } from "vitest";
import {
  groupCatalogInboxCandidates,
  type CatalogCandidateFile,
} from "../lib/catalog-candidates.js";

function candidateFile(overrides: Partial<CatalogCandidateFile>): CatalogCandidateFile {
  return {
    id: 1,
    filename: "dragon.stl",
    extension: "stl",
    folder: "/models/Dragon Pack",
    rootPath: "/models",
    size_bytes: 100,
    modified_at: "2026-07-14T00:00:00.000Z",
    preview_url: null,
    ...overrides,
  };
}

describe("catalog inbox candidate grouping", () => {
  it("groups files in a package folder and prefers a previewable 3MF", () => {
    const candidates = groupCatalogInboxCandidates([
      candidateFile({ id: 1, filename: "dragon.stl" }),
      candidateFile({
        id: 2,
        filename: "dragon.3mf",
        extension: "3mf",
        preview_url: "/preview.png",
      }),
      candidateFile({ id: 3, filename: "dragon.step", extension: "step" }),
    ]);

    expect(candidates).toEqual([
      expect.objectContaining({
        name: "Dragon Pack",
        folder: "/models/Dragon Pack",
        primary_file_id: 2,
        total_size_bytes: 300,
        files: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      }),
    ]);
  });

  it("folds generic STL and 3MF directories into their parent package", () => {
    const candidates = groupCatalogInboxCandidates([
      candidateFile({ id: 1, folder: "/models/Dragon/STL" }),
      candidateFile({ id: 2, folder: "/models/Dragon/3MF", extension: "3mf" }),
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ name: "Dragon", folder: "/models/Dragon" });
  });

  it("keeps unrelated root files separate but groups matching stems", () => {
    const candidates = groupCatalogInboxCandidates([
      candidateFile({ id: 1, filename: "dragon.stl", folder: "/models" }),
      candidateFile({ id: 2, filename: "dragon.3mf", extension: "3mf", folder: "/models" }),
      candidateFile({ id: 3, filename: "gear.stl", folder: "/models" }),
    ]);

    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.name)).toEqual(["dragon", "gear"]);
    expect(candidates[0]?.primary_file_id).toBe(2);
  });
});
