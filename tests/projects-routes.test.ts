import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetProjectById, mockPatchProject } = vi.hoisted(() => ({
  mockGetProjectById: vi.fn(),
  mockPatchProject: vi.fn(),
}));

vi.mock("../models/projects.js", () => ({
  listProjects: vi.fn(() => []),
  getProjectById: mockGetProjectById,
  createProject: vi.fn(),
  patchProject: mockPatchProject,
  deleteProject: vi.fn(),
  getProjectJobs: vi.fn(() => []),
  autoGroupByDesign: vi.fn(),
  cleanupJunkProjects: vi.fn(),
  getProjectPrice: vi.fn(),
  getAllProjectPrices: vi.fn(() => ({})),
}));

import { projects } from "../routes/projects.js";

async function patchProjectRoute(id: number, body: unknown): Promise<Response> {
  return projects.request(`/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /projects/:id", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetProjectById.mockReturnValue({ id: 1, name: "Orig", customer: null, notes: null });
    mockPatchProject.mockReturnValue({ id: 1, name: "Trimmed", customer: null, notes: null });
  });

  it("trims name before patching", async () => {
    const res = await patchProjectRoute(1, { name: "  Trimmed  " });

    expect(res.status).toBe(200);
    expect(mockPatchProject).toHaveBeenCalledWith(1, expect.objectContaining({ name: "Trimmed" }));
  });

  it("rejects unknown fields", async () => {
    const res = await patchProjectRoute(1, { nope: true });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Unknown fields: nope" });
    expect(mockPatchProject).not.toHaveBeenCalled();
  });

  it("rejects non-integer route id", async () => {
    const res = await projects.request("/2.2", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid id" });
    expect(mockGetProjectById).not.toHaveBeenCalled();
  });

  it("rejects non-positive route id", async () => {
    const res = await projects.request("/-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid id" });
    expect(mockGetProjectById).not.toHaveBeenCalled();
  });
});
