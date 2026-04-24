import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetJobById, mockPatchJob, mockGetProjectById } = vi.hoisted(() => ({
  mockGetJobById: vi.fn(),
  mockPatchJob: vi.fn(),
  mockGetProjectById: vi.fn(),
}));

vi.mock("../models/jobs.js", () => ({
  listJobs: vi.fn(() => []),
  getJobById: mockGetJobById,
  patchJob: mockPatchJob,
  getJobWithDetails: vi.fn(),
  getJobPrice: vi.fn(),
  getAllJobPrices: vi.fn(() => ({})),
}));

vi.mock("../models/projects.js", () => ({
  getProjectById: mockGetProjectById,
}));

import { jobs } from "../routes/jobs.js";

async function patchJobRoute(id: number, body: unknown): Promise<Response> {
  return jobs.request(`/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /jobs/:id validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetJobById.mockReturnValue({ id: 1, customer: null, project_id: null });
    mockGetProjectById.mockReturnValue({ id: 10, name: "Project" });
    mockPatchJob.mockReturnValue({ id: 1, customer: null, project_id: 10 });
  });

  it("accepts an existing project_id", async () => {
    const res = await patchJobRoute(1, { project_id: 10 });

    expect(res.status).toBe(200);
    expect(mockGetProjectById).toHaveBeenCalledWith(10);
    expect(mockPatchJob).toHaveBeenCalledWith(1, expect.objectContaining({ project_id: 10 }));
  });

  it("accepts null project_id to unassign a job", async () => {
    const res = await patchJobRoute(1, { project_id: null });

    expect(res.status).toBe(200);
    expect(mockGetProjectById).not.toHaveBeenCalled();
    expect(mockPatchJob).toHaveBeenCalledWith(1, expect.objectContaining({ project_id: null }));
  });

  it("rejects a non-integer project_id", async () => {
    const res = await patchJobRoute(1, { project_id: 1.5 });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "project_id must be an integer or null" });
    expect(mockPatchJob).not.toHaveBeenCalled();
  });

  it("rejects a project_id that does not exist", async () => {
    mockGetProjectById.mockReturnValue(undefined);

    const res = await patchJobRoute(1, { project_id: 999 });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "project_id does not reference an existing project",
    });
    expect(mockPatchJob).not.toHaveBeenCalled();
  });
});
