import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDbPrepare, mockEnsureLocalCoverCached, mockListUiJobs } = vi.hoisted(() => ({
  mockDbPrepare: vi.fn(),
  mockEnsureLocalCoverCached: vi.fn(),
  mockListUiJobs: vi.fn(),
}));

vi.mock("../lib/db.js", () => ({
  db: { prepare: mockDbPrepare },
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

describe("printer photo UI routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListUiJobs.mockReturnValue([]);
  });

  it("serves the local Snapmaker U1 photo and rejects unknown slugs", async () => {
    const response = await app().request("/ui/printers/snapmaker-u1");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);

    expect((await app().request("/ui/printers/not-real")).status).toBe(404);
    expect((await app().request("/ui/printers/not-real/secret")).status).toBe(404);
  });
});
