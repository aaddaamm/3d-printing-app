import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  MockCatalogScanInProgressError,
  mockAddCatalogScanRoot,
  mockAdoptCatalogFile,
  mockDeactivateCatalogScanRoot,
  mockIgnoreCatalogFile,
  mockListCatalogDuplicateGroups,
  mockListCatalogFiles,
  mockListCatalogInboxFiles,
  mockListCatalogScanRoots,
  mockReadCatalogPreview,
  mockReturnCatalogFileToInbox,
  mockRunCatalogScan,
} = vi.hoisted(() => ({
  MockCatalogScanInProgressError: class CatalogScanInProgressError extends Error {},
  mockAddCatalogScanRoot: vi.fn(),
  mockAdoptCatalogFile: vi.fn(),
  mockDeactivateCatalogScanRoot: vi.fn(),
  mockIgnoreCatalogFile: vi.fn(),
  mockListCatalogDuplicateGroups: vi.fn(),
  mockListCatalogFiles: vi.fn(),
  mockListCatalogInboxFiles: vi.fn(),
  mockListCatalogScanRoots: vi.fn(),
  mockReadCatalogPreview: vi.fn(),
  mockReturnCatalogFileToInbox: vi.fn(),
  mockRunCatalogScan: vi.fn(),
}));

vi.mock("../models/catalog.js", () => ({
  CatalogScanInProgressError: MockCatalogScanInProgressError,
  CatalogValidationError: class CatalogValidationError extends Error {},
  addCatalogScanRoot: mockAddCatalogScanRoot,
  adoptCatalogFile: mockAdoptCatalogFile,
  deactivateCatalogScanRoot: mockDeactivateCatalogScanRoot,
  ignoreCatalogFile: mockIgnoreCatalogFile,
  listCatalogDuplicateGroups: mockListCatalogDuplicateGroups,
  listCatalogFiles: mockListCatalogFiles,
  listCatalogInboxFiles: mockListCatalogInboxFiles,
  listCatalogScanRoots: mockListCatalogScanRoots,
  readCatalogPreview: mockReadCatalogPreview,
  returnCatalogFileToInbox: mockReturnCatalogFileToInbox,
  runCatalogScan: mockRunCatalogScan,
}));

import { catalog } from "../routes/catalog.js";

async function jsonBody(res: Response): Promise<unknown> {
  return res.json();
}

describe("catalog routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListCatalogDuplicateGroups.mockReturnValue([]);
    mockListCatalogFiles.mockReturnValue({
      files: [],
      page: 1,
      pageSize: 48,
      total: 0,
      totalPages: 1,
    });
    mockListCatalogInboxFiles.mockReturnValue([]);
    mockListCatalogScanRoots.mockReturnValue([]);
    mockReadCatalogPreview.mockReturnValue(null);
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
      incompleteRoots: 0,
      errors: [],
      durationMs: 5,
    });
    mockAdoptCatalogFile.mockReturnValue({
      file: { id: 10, review_status: "referenced" },
      product_id: 2,
      product_name: "Dragon",
      product_file_id: 3,
    });
    mockIgnoreCatalogFile.mockReturnValue({ id: 10, review_status: "ignored" });
    mockReturnCatalogFileToInbox.mockReturnValue({ id: 10, review_status: "inbox" });
  });

  it("lists scan roots", async () => {
    mockListCatalogScanRoots.mockReturnValue([{ id: 1, name: "Models" }]);

    const res = await catalog.request("/roots");

    expect(res.status).toBe(200);
    expect(await jsonBody(res)).toEqual({ roots: [{ id: 1, name: "Models" }] });
  });

  it("lists catalog files with preview URLs", async () => {
    mockListCatalogFiles.mockReturnValue({
      files: [
        {
          id: 10,
          filename: "dragon.3mf",
          extension: "3mf",
          folder: "/models",
          size_bytes: 1234,
          modified_at: "2026-07-06T00:00:00.000Z",
          scan_status: "present",
          preview_url:
            "/catalog/previews/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png",
        },
      ],
      page: 2,
      pageSize: 24,
      total: 30,
      totalPages: 2,
    });

    const res = await catalog.request(
      "/files?page=2&pageSize=24&q=dragon&scanStatus=present&reviewStatus=indexed",
    );

    expect(res.status).toBe(200);
    expect(mockListCatalogFiles).toHaveBeenCalledWith({
      page: 2,
      pageSize: 24,
      query: "dragon",
      scanStatus: "present",
      reviewStatus: "indexed",
    });
    expect(await jsonBody(res)).toEqual({
      files: [expect.objectContaining({ filename: "dragon.3mf", preview_url: expect.any(String) })],
      page: 2,
      pageSize: 24,
      total: 30,
      totalPages: 2,
    });
  });

  it("rejects invalid catalog pagination and filters", async () => {
    const badPage = await catalog.request("/files?page=0");
    const badPageSize = await catalog.request("/files?pageSize=101");
    const badStatus = await catalog.request("/files?scanStatus=gone");

    expect(badPage.status).toBe(400);
    expect(badPageSize.status).toBe(400);
    expect(badStatus.status).toBe(400);
    expect(mockListCatalogFiles).not.toHaveBeenCalled();
  });

  it("lists newly discovered inbox files", async () => {
    mockListCatalogInboxFiles.mockReturnValue([{ id: 10, review_status: "inbox" }]);

    const res = await catalog.request("/inbox");

    expect(res.status).toBe(200);
    expect(await jsonBody(res)).toEqual({ files: [{ id: 10, review_status: "inbox" }] });
  });

  it("adopts a catalog file into an existing product", async () => {
    const res = await catalog.request("/files/10/adopt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: 2 }),
    });

    expect(res.status).toBe(200);
    expect(mockAdoptCatalogFile).toHaveBeenCalledWith(10, { productId: 2 });
    expect(await jsonBody(res)).toEqual({
      adoption: expect.objectContaining({ product_id: 2, product_file_id: 3 }),
    });
  });

  it("adopts a catalog file into a new product", async () => {
    const res = await catalog.request("/files/10/adopt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: "Dragon" }),
    });

    expect(res.status).toBe(200);
    expect(mockAdoptCatalogFile).toHaveBeenCalledWith(10, { productName: "Dragon" });
  });

  it("ignores a catalog inbox file and can return it to the inbox", async () => {
    const ignored = await catalog.request("/files/10/ignore", { method: "POST" });
    const restored = await catalog.request("/files/10/inbox", { method: "POST" });

    expect(ignored.status).toBe(200);
    expect(restored.status).toBe(200);
    expect(mockIgnoreCatalogFile).toHaveBeenCalledWith(10);
    expect(mockReturnCatalogFileToInbox).toHaveBeenCalledWith(10);
  });

  it("lists exact duplicate catalog groups", async () => {
    mockListCatalogDuplicateGroups.mockReturnValue([
      {
        content_hash: "b".repeat(64),
        size_bytes: 100,
        suggested_keep_id: 2,
        suggestion:
          "Keep the copy in 3d_prints and review duplicates in Downloads, Desktop, 3d_prints.",
        files: [
          { id: 2, filename: "dragon.3mf", folder: "/Users/adam/3d_prints" },
          { id: 1, filename: "dragon.3mf", folder: "/Users/adam/Downloads" },
        ],
      },
    ]);

    const res = await catalog.request("/duplicates");

    expect(res.status).toBe(200);
    expect(await jsonBody(res)).toEqual({
      groups: [expect.objectContaining({ suggested_keep_id: 2, files: expect.any(Array) })],
    });
  });

  it("serves cached catalog previews", async () => {
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    mockReadCatalogPreview.mockReturnValue({ content: bytes, contentType: "image/png" });

    const res = await catalog.request(
      "/previews/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png",
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(Buffer.from(await res.arrayBuffer())).toEqual(bytes);
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

  it("rejects an overlapping catalog scan", async () => {
    mockRunCatalogScan.mockRejectedValueOnce(
      new MockCatalogScanInProgressError("A catalog scan is already in progress"),
    );

    const res = await catalog.request("/scan", { method: "POST" });

    expect(res.status).toBe(409);
    expect(await jsonBody(res)).toEqual({ error: "A catalog scan is already in progress" });
  });
});
