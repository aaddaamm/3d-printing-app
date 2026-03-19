import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  mockFindDesignsAll,
  mockFindAutoProjectGet,
  mockInsertAutoProjectRun,
  mockAssignJobsRun,
  mockFindUserTitleGroupsAll,
  mockAssignByIdsRun,
} = vi.hoisted(() => ({
  mockFindDesignsAll: vi.fn<() => { designId: string; designTitle: string | null }[]>(),
  mockFindAutoProjectGet: vi.fn<(id: string) => { id: number } | undefined>(),
  mockInsertAutoProjectRun: vi.fn<() => { lastInsertRowid: number }>(),
  mockAssignJobsRun: vi.fn<() => { changes: number }>(),
  mockFindUserTitleGroupsAll: vi.fn<() => { base_title: string; job_ids: string }[]>(),
  mockAssignByIdsRun: vi.fn<() => { changes: number }>(),
}));

vi.mock("../lib/db.js", () => ({
  db: {
    prepare: vi.fn((sql: string) => {
      if (sql.includes("SELECT DISTINCT designId")) return { all: mockFindDesignsAll };
      if (sql.includes("SELECT id FROM projects")) return { get: mockFindAutoProjectGet };
      if (sql.includes("INSERT INTO projects")) return { run: mockInsertAutoProjectRun };
      if (sql.includes("UPDATE jobs SET project_id = ? WHERE designId")) return { run: mockAssignJobsRun };
      if (sql.includes("SELECT base_title")) return { all: mockFindUserTitleGroupsAll };
      if (sql.includes("UPDATE jobs SET project_id = ? WHERE id IN")) return { run: mockAssignByIdsRun };
      return { all: vi.fn(), get: vi.fn(), run: vi.fn() };
    }),
    transaction: vi.fn((fn: () => void) => fn),
  },
}));

import { autoGroupProjects } from "../lib/auto-group.js";

function design(designId: string, designTitle: string | null = "My Design") {
  return { designId, designTitle };
}

describe("autoGroupProjects", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockInsertAutoProjectRun.mockReturnValue({ lastInsertRowid: 99 });
    mockAssignJobsRun.mockReturnValue({ changes: 0 });
    mockAssignByIdsRun.mockReturnValue({ changes: 0 });
    mockFindDesignsAll.mockReturnValue([]);
    mockFindUserTitleGroupsAll.mockReturnValue([]);
  });

  it("returns zeroes when there are no unassigned jobs", () => {
    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 0 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
  });

  it("creates a new project for an unseen designId", () => {
    mockFindDesignsAll.mockReturnValue([design("d1", "My Vase")]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockAssignJobsRun.mockReturnValue({ changes: 3 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 1, assigned: 3 });
    expect(mockInsertAutoProjectRun).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Vase", source_design_id: "d1" }),
    );
    expect(mockAssignJobsRun).toHaveBeenCalledWith(99, "d1");
  });

  it("uses designId as project name when designTitle is null", () => {
    mockFindDesignsAll.mockReturnValue([design("d2", null)]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockAssignJobsRun.mockReturnValue({ changes: 1 });

    autoGroupProjects();

    expect(mockInsertAutoProjectRun).toHaveBeenCalledWith(
      expect.objectContaining({ name: "d2", source_design_id: "d2" }),
    );
  });

  it("reuses an existing auto-project without creating a duplicate", () => {
    mockFindDesignsAll.mockReturnValue([design("d3", "My Ship")]);
    mockFindAutoProjectGet.mockReturnValue({ id: 42 });
    mockAssignJobsRun.mockReturnValue({ changes: 2 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 2 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
    expect(mockAssignJobsRun).toHaveBeenCalledWith(42, "d3");
  });

  it("handles multiple designs in one pass", () => {
    mockFindDesignsAll.mockReturnValue([design("d4"), design("d5")]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockInsertAutoProjectRun
      .mockReturnValueOnce({ lastInsertRowid: 10 })
      .mockReturnValueOnce({ lastInsertRowid: 11 });
    mockAssignJobsRun.mockReturnValue({ changes: 1 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 2, assigned: 2 });
    expect(mockAssignJobsRun).toHaveBeenCalledTimes(2);
  });

  // ── user-imported title-based grouping ──────────────────────────────────────

  it("groups user-imported models by title prefix", () => {
    mockFindUserTitleGroupsAll.mockReturnValue([
      { base_title: "Gerbil Cage lid 32x62", job_ids: "10,11,12" },
    ]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockAssignByIdsRun.mockReturnValue({ changes: 3 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 1, assigned: 3 });
    expect(mockInsertAutoProjectRun).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gerbil Cage lid 32x62",
        source_design_id: "title:Gerbil Cage lid 32x62",
      }),
    );
  });

  it("reuses existing project for a seen title prefix", () => {
    mockFindUserTitleGroupsAll.mockReturnValue([
      { base_title: "BD-1 - complete", job_ids: "20,21" },
    ]);
    mockFindAutoProjectGet.mockReturnValue({ id: 55 });
    mockAssignByIdsRun.mockReturnValue({ changes: 2 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 2 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
  });

  it("handles both design and title groups in one pass", () => {
    mockFindDesignsAll.mockReturnValue([design("d6", "MakerWorld Model")]);
    mockFindUserTitleGroupsAll.mockReturnValue([
      { base_title: "My Custom Print", job_ids: "30" },
    ]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockInsertAutoProjectRun
      .mockReturnValueOnce({ lastInsertRowid: 70 })
      .mockReturnValueOnce({ lastInsertRowid: 71 });
    mockAssignJobsRun.mockReturnValue({ changes: 1 });
    mockAssignByIdsRun.mockReturnValue({ changes: 1 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 2, assigned: 2 });
  });
});
