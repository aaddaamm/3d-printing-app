import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnsureLocalCoverCached, mockListUiJobs } = vi.hoisted(() => ({
  mockEnsureLocalCoverCached: vi.fn(),
  mockListUiJobs: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: vi.fn() },
}));

vi.mock("../lib/covers.js", () => ({
  ensureLocalCoverCached: mockEnsureLocalCoverCached,
}));

vi.mock("../models/ui.js", () => ({
  listUiJobs: mockListUiJobs,
}));

import { createUiApp } from "../routes/ui.js";

function app(): Hono {
  return new Hono().route("/ui", createUiApp());
}

describe("cover UI routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListUiJobs.mockReturnValue([]);
    mockEnsureLocalCoverCached.mockResolvedValue({ status: "unavailable", path: null });
  });

  it("accepts cache-valid non-numeric task IDs", async () => {
    const response = await app().request("/ui/covers/task_1");

    expect(response.status).toBe(404);
    expect(mockEnsureLocalCoverCached).toHaveBeenCalledWith("task_1");
  });

  it("rejects unsafe task IDs", async () => {
    const response = await app().request("/ui/covers/moonraker%3A000001");

    expect(response.status).toBe(400);
    expect(mockEnsureLocalCoverCached).not.toHaveBeenCalled();
  });
});
