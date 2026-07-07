import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockAddCatalogScanRoot,
  mockDeactivateCatalogScanRoot,
  mockListCatalogScanRoots,
  mockRunCatalogScan,
} = vi.hoisted(() => ({
  mockAddCatalogScanRoot: vi.fn(),
  mockDeactivateCatalogScanRoot: vi.fn(),
  mockListCatalogScanRoots: vi.fn(),
  mockRunCatalogScan: vi.fn(),
}));

vi.mock("../models/catalog.js", () => ({
  addCatalogScanRoot: mockAddCatalogScanRoot,
  deactivateCatalogScanRoot: mockDeactivateCatalogScanRoot,
  listCatalogScanRoots: mockListCatalogScanRoots,
  runCatalogScan: mockRunCatalogScan,
}));

import { catalog } from "../routes/catalog.js";

async function jsonBody(res: Response): Promise<unknown> {
  return res.json();
}

describe("catalog routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListCatalogScanRoots.mockReturnValue([]);
    mockAddCatalogScanRoot.mockReturnValue({
      id: 1,
      name: "Models",
      root_path: "/models",
      normalized_root_path: "/models",
      is_active: 1,
      last_scanned_at: null,
      created_at: "2026-07-06T00:00:00.000Z",
      updated_at: "2026-07-06T00:00:00.000Z",
    });
    mockDeactivateCatalogScanRoot.mockReturnValue({
      id: 1,
      name: "Models",
      root_path: "/models",
      normalized_root_path: "/models",
      is_active: 0,
      last_scanned_at: null,
      created_at: "2026-07-06T00:00:00.000Z",
      updated_at: "2026-07-06T00:00:00.000Z",
    });
    mockRunCatalogScan.mockResolvedValue({
      scanned: 1,
      added: 1,
      changed: 0,
      unchanged: 0,
      missing: 0,
      restored: 0,
      skipped: 0,
      failed: 0,
      durationMs: 5,
    });
  });

  it("lists scan roots", async () => {
    mockListCatalogScanRoots.mockReturnValue([{ id: 1, name: "Models" }]);

    const res = await catalog.request("/roots");

    expect(res.status).toBe(200);
    expect(await jsonBody(res)).toEqual({ roots: [{ id: 1, name: "Models" }] });
  });

  it("adds a scan root", async () => {
    const res = await catalog.request("/roots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rootPath: "/models", name: "Models" }),
    });

    expect(res.status).toBe(200);
    expect(mockAddCatalogScanRoot).toHaveBeenCalledWith({ rootPath: "/models", name: "Models" });
    expect(await jsonBody(res)).toEqual({
      root: expect.objectContaining({ id: 1, name: "Models" }),
    });
  });

  it("rejects invalid add-root bodies", async () => {
    const res = await catalog.request("/roots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Models" }),
    });

    expect(res.status).toBe(400);
    expect(mockAddCatalogScanRoot).not.toHaveBeenCalled();
  });

  it("deactivates a scan root", async () => {
    const res = await catalog.request("/roots/1", { method: "DELETE" });

    expect(res.status).toBe(200);
    expect(mockDeactivateCatalogScanRoot).toHaveBeenCalledWith(1);
    expect(await jsonBody(res)).toEqual({ root: expect.objectContaining({ id: 1, is_active: 0 }) });
  });

  it("runs a synchronous catalog scan", async () => {
    const res = await catalog.request("/scan", { method: "POST" });

    expect(res.status).toBe(200);
    expect(mockRunCatalogScan).toHaveBeenCalledWith();
    expect(await jsonBody(res)).toEqual({
      summary: expect.objectContaining({ scanned: 1, added: 1, failed: 0 }),
    });
  });
});
