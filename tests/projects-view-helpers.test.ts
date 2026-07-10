import { expect, it } from "vitest";
import {
  getProjectPlateCoverage,
  updateProjectInList,
  type Project,
} from "../frontend/components/projects-view-helpers.js";

it("summarizes observed project plate coverage", () => {
  const coverage = getProjectPlateCoverage([
    { plateIndex: 1 },
    { plateIndex: 1 },
    { plateIndex: 2 },
    { plateIndex: 4 },
    { plateIndex: null },
  ]);

  expect(coverage).toEqual({
    printedCount: 5,
    uniquePlateCount: 3,
    observedStart: 1,
    observedEnd: 4,
    duplicatePlateIndexes: [1],
    missingPlateIndexes: [3],
    unknownPlateIndexCount: 1,
    isContiguous: false,
  });
});

it("replaces a renamed project without dropping existing list-only stats", () => {
  const projects: Project[] = [
    { id: 1, name: "Old Name", job_count: 2, cover_url: "/ui/covers/1" },
    { id: 2, name: "Other", job_count: 1 },
  ];

  const updated = updateProjectInList(projects, { id: 1, name: "New Name" });

  expect(updated).toEqual([
    { id: 1, name: "New Name", job_count: 2, cover_url: "/ui/covers/1" },
    { id: 2, name: "Other", job_count: 1 },
  ]);
});
