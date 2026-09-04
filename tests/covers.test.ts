import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

// ── Mocks (hoisted before imports by vitest) ──────────────────────────────────

// db.ts opens a real SQLite file at module load — mock it before covers.ts loads.
const mockPrepareAll = vi.fn().mockReturnValue([]);
const mockPrepareGet = vi.fn().mockReturnValue(null);
vi.mock("../lib/db.js", () => ({
  db: { prepare: vi.fn(() => ({ all: mockPrepareAll, get: mockPrepareGet })) },
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
      lstatSync: vi.fn(),
      writeFileSync: vi.fn(),
    },
  };
});

import fs from "node:fs";
import { db } from "../lib/db.js";
import {
  coverKeyForTaskId,
  taskIdFromCoverKey,
  localCoverPath,
  localCoverExists,
  downloadCovers,
  ensureLocalCoverCached,
  COVERS_DIR,
} from "../lib/covers.js";

// ── cover keys ───────────────────────────────────────────────────────────────

describe("cover keys", () => {
  it("round-trips provider-scoped Bambu IDs through a canonical URL-safe key", () => {
    const coverKey = coverKeyForTaskId("bambu:123456789");

    expect(coverKey).toBe("~YmFtYnU6MTIzNDU2Nzg5");
    expect(taskIdFromCoverKey(coverKey)).toBe("bambu:123456789");
  });

  it("round-trips provider-scoped IDs through a canonical URL-safe key", () => {
    const coverKey = coverKeyForTaskId("moonraker:000001");

    expect(coverKey).toBe("~bW9vbnJha2VyOjAwMDAwMQ");
    expect(taskIdFromCoverKey(coverKey)).toBe("moonraker:000001");
    expect(taskIdFromCoverKey("moonraker:000001")).toBeNull();
  });

  it("rejects malformed and alternate encodings", () => {
    expect(taskIdFromCoverKey("~bW9vbnJha2VyOjAwMDAwMQ=")).toBeNull();
    expect(taskIdFromCoverKey("~MTIz")).toBeNull();
  });

  it("encodes path-like IDs rather than using them as a filesystem path", () => {
    expect(path.dirname(localCoverPath("../covers"))).toBe(COVERS_DIR);
  });
});

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

  it("looks up provider-scoped task IDs through their safe cover key", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    expect(localCoverExists("moonraker:00002B")).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(localCoverPath("moonraker:00002B"));
  });

  it("uses a legacy Bambu cache file when the scoped cache file is absent", () => {
    vi.mocked(fs.existsSync).mockImplementation((filePath) => String(filePath).endsWith("123.png"));

    expect(localCoverExists("bambu:123")).toBe(true);
  });

  it("returns false when existsSync returns false", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(localCoverExists("task2")).toBe(false);
  });
});

// ── ensureLocalCoverCached ────────────────────────────────────────────────────

describe("ensureLocalCoverCached", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns ready without fetching when the local file belongs to a task", async () => {
    mockPrepareGet.mockReturnValue({ cover: "https://example.com/t1.png", thumbnail: null });
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.lstatSync).mockReturnValue({
      isFile: () => true,
      isSymbolicLink: () => false,
    } as fs.Stats);

    const result = await ensureLocalCoverCached("t1");

    expect(result).toEqual({ status: "ready", path: localCoverPath("t1") });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not serve a local filename that has no matching task", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const result = await ensureLocalCoverCached("unknown-task");

    expect(result).toEqual({ status: "unavailable", path: null });
    expect(fs.lstatSync).not.toHaveBeenCalled();
  });

  it("downloads and caches a missing local cover from the database cover URL", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    mockPrepareGet.mockReturnValue({ cover: "https://example.com/t1.png", thumbnail: null });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    const result = await ensureLocalCoverCached("t1");

    expect(result).toEqual({ status: "downloaded", path: localCoverPath("t1") });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localCoverPath("t1"),
      Buffer.from(new ArrayBuffer(8)),
    );
  });

  it("returns unavailable when the cached file is missing and the provider URL is expired", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    mockPrepareGet.mockReturnValue({ cover: "https://example.com/t1.png", thumbnail: null });
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

    const result = await ensureLocalCoverCached("t1");

    expect(result).toEqual({ status: "expired", path: null });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("returns unavailable when no media URL is stored for the task", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    mockPrepareGet.mockReturnValue({ cover: null, thumbnail: null });

    const result = await ensureLocalCoverCached("t1");

    expect(result).toEqual({ status: "unavailable", path: null });
    expect(fetch).not.toHaveBeenCalled();
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
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.lstatSync).mockReturnValue({
      isFile: () => true,
      isSymbolicLink: () => false,
    } as fs.Stats);

    const result = await downloadCovers();

    expect(result.skipped).toBe(1);
    expect(result.downloaded).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("downloads a Moonraker thumbnail through a safe local cover key", async () => {
    const moonrakerTaskId = "moonraker:000001";
    mockPrepareAll.mockReturnValue([
      { id: moonrakerTaskId, media_url: "https://example.com/t1-thumb.png" },
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 1, skipped: 0, expired: 0, failed: 0 });
    expect(fetch).toHaveBeenCalledWith("https://example.com/t1-thumb.png", expect.any(Object));
    expect(vi.mocked(db.prepare)).toHaveBeenCalledWith(
      expect.stringContaining("COALESCE(cover, thumbnail) AS media_url"),
    );
    expect(vi.mocked(db.prepare)).toHaveBeenCalledWith(
      expect.stringContaining("cover IS NOT NULL OR thumbnail IS NOT NULL"),
    );
    expect(vi.mocked(db.prepare)).toHaveBeenCalledWith(
      expect.not.stringContaining("id NOT GLOB '*[^A-Za-z0-9_-]*'"),
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      localCoverPath(moonrakerTaskId),
      Buffer.from(new ArrayBuffer(8)),
    );
  });

  it("uses the cover URL selected ahead of a thumbnail", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1-cover.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as Response);

    await downloadCovers();

    expect(fetch).toHaveBeenCalledWith("https://example.com/t1-cover.png", expect.any(Object));
  });

  it("HTTP 200 — downloaded increments and file is written to exact path", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1.png" }]);
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
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 1, failed: 0 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("HTTP 500 — failed increments, expired does not", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 0, failed: 1 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("network failure — failed increments", async () => {
    mockPrepareAll.mockReturnValue([{ id: "t1", media_url: "https://example.com/t1.png" }]);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await downloadCovers();

    expect(result).toEqual({ downloaded: 0, skipped: 0, expired: 0, failed: 1 });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
