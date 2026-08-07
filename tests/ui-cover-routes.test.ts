import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnsureLocalCoverCached, mockTaskIdFromCoverKey, mockListUiJobs } = vi.hoisted(() => ({
  mockEnsureLocalCoverCached: vi.fn(),
  mockTaskIdFromCoverKey: vi.fn(),
  mockListUiJobs: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: vi.fn() },
}));

vi.mock("../lib/covers.js", () => ({
  ensureLocalCoverCached: mockEnsureLocalCoverCached,
  taskIdFromCoverKey: mockTaskIdFromCoverKey,
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
    mockTaskIdFromCoverKey.mockReturnValue(null);
    mockEnsureLocalCoverCached.mockResolvedValue({ status: "unavailable", path: null });
  });

  it("serves a Moonraker cover through its safe cover key", async () => {
    mockTaskIdFromCoverKey.mockReturnValue("moonraker:000001");
    mockEnsureLocalCoverCached.mockResolvedValue({
      status: "ready",
      path: "/dev/null",
    });

    const response = await app().request("/ui/covers/~bW9vbnJha2VyOjAwMDAwMQ");

    expect(response.status).toBe(200);
    expect(mockTaskIdFromCoverKey).toHaveBeenCalledWith("~bW9vbnJha2VyOjAwMDAwMQ");
    expect(mockEnsureLocalCoverCached).toHaveBeenCalledWith("moonraker:000001");
  });

  it("rejects cover keys that do not map to a task ID", async () => {
    const response = await app().request("/ui/covers/moonraker%3A000001");

    expect(response.status).toBe(400);
    expect(mockEnsureLocalCoverCached).not.toHaveBeenCalled();
  });
});
