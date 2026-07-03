import { expect, it } from "vitest";
import { updateProjectInList, type Project } from "../frontend/components/projects-view-helpers.js";

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
