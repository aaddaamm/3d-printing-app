import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

// ── Mocks (hoisted before imports by vitest) ──────────────────────────────────

// db.ts opens a real SQLite file at module load — mock it before covers.ts loads.
const mockPrepareAll = vi.fn().mockReturnValue([]);
vi.mock("../lib/db.js", () => ({
  db: { prepare: vi.fn(() => ({ all: mockPrepareAll })) },
  stmts: {},
}));

// Mock the filesystem so tests are hermetic (no real disk I/O).
vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    default: {
      ...actual,
      mkdirSync: vi.fn(),
      existsSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
  };
});

import fs from "node:fs";
import { localCoverPath, localCoverExists, downloadCovers, COVERS_DIR } from "../lib/covers.js";

// ── localCoverPath ────────────────────────────────────────────────────────────

describe("localCoverPath", () => {
  it("returns <COVERS_DIR>/<taskId>.png", () => {
    expect(localCoverPath("abc123")).toBe(path.join(COVERS_DIR, "abc123.png"));
  });

  it("uses the COVERS_DIR constant as the directory", () => {
    const result = localCoverPath("xyz");
    expect(path.dirname(result)).toBe(COVERS_DIR);
    expect(path.basename(result)).toBe("xyz.png");
  });
});

// ── localCoverExists ──────────────────────────────────────────────────────────

describe("localCoverExists", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns true when existsSync returns true", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    expect(localCoverExists("task1")).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(localCoverPath("task1"));
  });

  it("returns false when existsSync returns false", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(localCoverExists("task2")).toBe(false);
  });
});

// ── downloadCovers ────────────────────────────────────────────────────────────

describe("downloadCovers", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns all-zero counts when there are no tasks", async () => {
    mockPrepareAll.mockReturnValue([]);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 0, failed: 0 });
  });

  it("skips a task whose local file already exists", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", cover: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = await downloadCovers();

    expect(result.skipped).toBe(1);
    expect(result.downloaded).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("HTTP 200 — downloaded increments and file is written to exact path", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", cover: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 1, skipped: 0, expired: 0, failed: 0 });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localCoverPath("t1"),
      Buffer.from(new ArrayBuffer(8)),
    );
  });

  it("HTTP 403 — expired increments, failed does not", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", cover: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 1, failed: 0 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("HTTP 500 — failed increments, expired does not", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", cover: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 0, failed: 1 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("network failure — failed increments", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", cover: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 0, failed: 1 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
