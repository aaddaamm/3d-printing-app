import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  mockFindDesignsAll,
  mockFindAutoProjectGet,
  mockInsertAutoProjectRun,
  mockAssignJobsRun,
  mockFindUserJobsAll,
  mockAssignByIdsRun,
} = vi.hoisted(() => ({
  mockFindDesignsAll: vi.fn<() => { designId: string; designTitle: string | null }[]>(),
  mockFindAutoProjectGet: vi.fn<(id: string) => { id: number } | undefined>(),
  mockInsertAutoProjectRun: vi.fn<() => { lastInsertRowid: number }>(),
  mockAssignJobsRun: vi.fn<() => { changes: number }>(),
  mockFindUserJobsAll: vi.fn<() => { id: number; title: string | null }[]>(),
  mockAssignByIdsRun: vi.fn<() => { changes: number }>(),
}));

vi.mock("../lib/db.js", () => ({
  db: {
    prepare: vi.fn((sql: string) => {
      if (sql.includes("SELECT DISTINCT designId")) return { all: mockFindDesignsAll };
      if (sql.includes("SELECT id FROM projects")) return { get: mockFindAutoProjectGet };
      if (sql.includes("INSERT INTO projects")) return { run: mockInsertAutoProjectRun };
      if (sql.includes("UPDATE jobs SET project_id = ? WHERE designId"))
        return { run: mockAssignJobsRun };
      if (sql.includes("SELECT j.id, pt.title")) return { all: mockFindUserJobsAll };
      if (sql.includes("UPDATE jobs SET project_id = ? WHERE id IN"))
        return { run: mockAssignByIdsRun };
      return { all: vi.fn(), get: vi.fn(), run: vi.fn() };
    }),
    transaction: vi.fn((fn: () => void) => fn),
  },
}));

import { autoGroupProjects, deriveBaseTitle } from "../lib/auto-group.js";

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
    mockFindUserJobsAll.mockReturnValue([]);
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

  it("groups user-imported jobs by title prefix", () => {
    mockFindUserJobsAll.mockReturnValue([
      { id: 10, title: "Gerbil Cage_plate_1" },
      { id: 11, title: "Gerbil Cage_plate_2" },
      { id: 12, title: "Gerbil Cage_plate_3" },
    ]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockAssignByIdsRun.mockReturnValue({ changes: 3 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 1, assigned: 3 });
    expect(mockInsertAutoProjectRun).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gerbil Cage",
        source_design_id: "title:Gerbil Cage",
      }),
    );
  });

  it("merges named plates into their parent project", () => {
    mockFindUserJobsAll.mockReturnValue([
      { id: 20, title: "BD-1 - complete_plate_10" },
      { id: 21, title: "BD-1 - complete_plate_11" },
      { id: 22, title: "BD-1 - complete_Leg Lower - Right" },
    ]);
    mockFindAutoProjectGet.mockReturnValue(undefined);
    mockAssignByIdsRun.mockReturnValue({ changes: 3 });

    const result = autoGroupProjects();

    // All 3 should be in a single "BD-1 - complete" project
    expect(result).toEqual({ created: 1, assigned: 3 });
    expect(mockInsertAutoProjectRun).toHaveBeenCalledWith(
      expect.objectContaining({ name: "BD-1 - complete" }),
    );
  });

  it("reuses existing project for user-imported title group", () => {
    mockFindUserJobsAll.mockReturnValue([{ id: 30, title: "Widget_plate_1" }]);
    mockFindAutoProjectGet.mockReturnValue({ id: 55 });
    mockAssignByIdsRun.mockReturnValue({ changes: 1 });

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 1 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
  });

  // Regression: the HTTP route (POST /projects/auto-group) previously used an
  // inline implementation without AND project_id IS NULL, which allowed it to
  // overwrite manually assigned project_ids. Now it calls autoGroupProjects,
  // which only queries jobs WHERE project_id IS NULL (mockFindDesignsAll and
  // mockFindUserJobsAll both use that filter). Re-running auto-group against an
  // already-processed set therefore produces zero changes.
  it("produces no changes when all jobs are already assigned (manual-assignment safety)", () => {
    // Both queries return empty — all jobs already have project_id set
    mockFindDesignsAll.mockReturnValue([]);
    mockFindUserJobsAll.mockReturnValue([]);

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 0 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
    expect(mockAssignJobsRun).not.toHaveBeenCalled();
    expect(mockAssignByIdsRun).not.toHaveBeenCalled();
  });
});

describe("deriveBaseTitle", () => {
  it("strips _plate_N suffix", () => {
    const bases = new Set<string>();
    expect(deriveBaseTitle("Gerbil Cage_plate_3", bases)).toBe("Gerbil Cage");
  });

  it("strips named plate when base is in knownBases", () => {
    const bases = new Set(["BD-1 - complete"]);
    expect(deriveBaseTitle("BD-1 - complete_Leg Lower - Right", bases)).toBe("BD-1 - complete");
  });

  it("keeps title intact when no plate suffix and no known base", () => {
    const bases = new Set<string>();
    expect(deriveBaseTitle("FigmentHeadPNG-cookiecad", bases)).toBe("FigmentHeadPNG-cookiecad");
  });

  it("keeps title with underscores intact when base is not known", () => {
    const bases = new Set<string>();
    expect(deriveBaseTitle("Blue_Tetris Magnets", bases)).toBe("Blue_Tetris Magnets");
  });
});
