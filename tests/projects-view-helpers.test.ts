import { expect, it } from "vitest";
import {
  getProjectPlateCoverage,
  updateProjectInList,
  type Project,
} from "../frontend/components/projects-view-helpers.js";

it("summarizes observed project plate coverage", () => {
  const coverage = getProjectPlateCoverage([
    { plateIndex: 1, status: "finish" },
    { plateIndex: 1, status: "cancel" },
    { plateIndex: 2, status: "finish" },
    { plateIndex: 3, status: "cancel" },
    { plateIndex: 4, status: "finish" },
    { plateIndex: null, status: "finish" },
  ]);

  expect(coverage).toEqual({
    attemptCount: 6,
    completedCount: 4,
    uniqueObservedPlateCount: 4,
    uniqueCompletedPlateCount: 3,
    observedStart: 1,
    observedEnd: 4,
    retriedPlateIndexes: [1],
    missingCompletedPlateIndexes: [3],
    unknownPlateIndexCount: 1,
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
