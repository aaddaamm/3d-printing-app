import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
//
// auto-group.ts calls db.prepare() at module load time (not inside functions),
// so the mock factory runs before any `const` declarations are initialized.
// vi.hoisted() evaluates before both the vi.mock factory and all imports,
// guaranteeing the mock fns are ready when prepare() fires during import.

const {
  mockFindDesignsAll,
  mockFindAutoProjectGet,
  mockInsertAutoProjectRun,
  mockAssignJobsRun,
} = vi.hoisted(() => ({
  mockFindDesignsAll: vi.fn<[], { designId: string; designTitle: string | null }[]>(),
  mockFindAutoProjectGet: vi.fn<[string], { id: number } | undefined>(),
  mockInsertAutoProjectRun: vi.fn<[], { lastInsertRowid: number }>(),
  mockAssignJobsRun: vi.fn<[], { changes: number }>(),
}));

vi.mock("../lib/db.js", () => ({
  db: {
    // Route each prepare() call to the right mock by inspecting the SQL.
    prepare: vi.fn((sql: string) => {
      if (sql.includes("SELECT DISTINCT designId")) return { all: mockFindDesignsAll };
      if (sql.includes("SELECT id FROM projects")) return { get: mockFindAutoProjectGet };
      if (sql.includes("INSERT INTO projects")) return { run: mockInsertAutoProjectRun };
      if (sql.includes("UPDATE jobs SET project_id")) return { run: mockAssignJobsRun };
      return { all: vi.fn(), get: vi.fn(), run: vi.fn() };
    }),
    // transaction(fn) returns fn; calling the result executes fn immediately (no real tx).
    transaction: vi.fn((fn: () => void) => fn),
  },
}));

import { autoGroupProjects } from "../lib/auto-group.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function design(designId: string, designTitle: string | null = "My Design") {
  return { designId, designTitle };
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe("autoGroupProjects", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockInsertAutoProjectRun.mockReturnValue({ lastInsertRowid: 99 });
    mockAssignJobsRun.mockReturnValue({ changes: 0 });
  });

  it("returns zeroes and does nothing when there are no unassigned jobs", () => {
    mockFindDesignsAll.mockReturnValue([]);

    const result = autoGroupProjects();

    expect(result).toEqual({ created: 0, assigned: 0 });
    expect(mockInsertAutoProjectRun).not.toHaveBeenCalled();
    expect(mockAssignJobsRun).not.toHaveBeenCalled();
  });

  it("creates a new project and assigns jobs for an unseen designId", () => {
    mockFindDesignsAll.mockReturnValue([design("d1", "My Vase")]);
    mockFindAutoProjectGet.mockReturnValue(undefined); // no existing project
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
    mockFindAutoProjectGet.mockReturnValue({ id: 42 }); // project already exists
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
});
