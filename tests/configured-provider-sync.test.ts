import { beforeEach, describe, expect, it, vi } from "vitest";
import path from "node:path";

const {
  mockOpenSync,
  mockCloseSync,
  mockUnlinkSync,
  mockMkdirSync,
  mockLoadPrintworksConfig,
  mockSyncConfiguredProvider,
  mockHasSyncChanges,
  mockRunPostSyncMaintenance,
  mockDownloadCovers,
} = vi.hoisted(() => ({
  mockOpenSync: vi.fn(),
  mockCloseSync: vi.fn(),
  mockUnlinkSync: vi.fn(),
  mockMkdirSync: vi.fn(),
  mockLoadPrintworksConfig: vi.fn(),
  mockSyncConfiguredProvider: vi.fn(),
  mockHasSyncChanges: vi.fn(),
  mockRunPostSyncMaintenance: vi.fn(),
  mockDownloadCovers: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: {
    mkdirSync: mockMkdirSync,
    openSync: mockOpenSync,
    closeSync: mockCloseSync,
    unlinkSync: mockUnlinkSync,
  },
}));
vi.mock("../lib/db.js", () => ({ db: {}, stmts: { upsertTask: {} } }));
vi.mock("../lib/providers/config.js", () => ({
  defaultConfigPath: vi.fn(() => "/tmp/printworks.config.json"),
  loadPrintworksConfig: mockLoadPrintworksConfig,
}));
vi.mock("../lib/providers/configured-sync.js", () => ({
  syncConfiguredProvider: mockSyncConfiguredProvider,
}));
vi.mock("../lib/sync-workflow.js", () => ({
  defaultDbPath: vi.fn(() => "/var/lib/printworks/history.sqlite"),
  hasSyncChanges: mockHasSyncChanges,
  runPostSyncMaintenance: mockRunPostSyncMaintenance,
}));
vi.mock("../lib/covers.js", () => ({ downloadCovers: mockDownloadCovers }));

import {
  ConcurrentConfiguredProviderSyncError,
  runConfiguredProviderSync,
} from "../lib/configured-provider-sync.js";

const config = {
  providers: [
    { id: "shop", type: "bambu" as const },
    { id: "voron", type: "moonraker" as const, baseUrl: "http://voron.local" },
  ],
};
const coverSummary = { downloaded: 2, skipped: 1, expired: 0, failed: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  mockOpenSync.mockReturnValue(42);
  mockLoadPrintworksConfig.mockReturnValue(config);
  mockSyncConfiguredProvider
    .mockResolvedValueOnce({ inserted: 2, updated: 1 })
    .mockResolvedValueOnce({ inserted: 0, updated: 3 });
  mockHasSyncChanges.mockReturnValue(true);
  mockDownloadCovers.mockResolvedValue(coverSummary);
});

describe("runConfiguredProviderSync", () => {
  it("syncs configured providers sequentially, maintains changed records, and caches media", async () => {
    await expect(runConfiguredProviderSync()).resolves.toEqual({
      providers: [
        { id: "shop", inserted: 2, updated: 1 },
        { id: "voron", inserted: 0, updated: 3 },
      ],
      covers: coverSummary,
    });

    expect(mockSyncConfiguredProvider).toHaveBeenNthCalledWith(1, {}, {}, config.providers[0]);
    expect(mockSyncConfiguredProvider).toHaveBeenNthCalledWith(2, {}, {}, config.providers[1]);
    expect(mockRunPostSyncMaintenance).toHaveBeenCalledOnce();
    expect(mockDownloadCovers).toHaveBeenCalledOnce();
    expect(mockOpenSync).toHaveBeenCalledWith(
      path.join("/var/lib/printworks", "configured-provider-sync.lock"),
      "wx",
    );
    expect(mockCloseSync).toHaveBeenCalledWith(42);
    expect(mockUnlinkSync).toHaveBeenCalledWith(
      path.join("/var/lib/printworks", "configured-provider-sync.lock"),
    );
  });

  it("caches media but skips post-sync maintenance when no records changed", async () => {
    mockSyncConfiguredProvider.mockReset().mockResolvedValue({ inserted: 0, updated: 0 });
    mockHasSyncChanges.mockReturnValue(false);

    await runConfiguredProviderSync({ providerId: "shop" });

    expect(mockSyncConfiguredProvider).toHaveBeenCalledOnce();
    expect(mockRunPostSyncMaintenance).not.toHaveBeenCalled();
    expect(mockDownloadCovers).toHaveBeenCalledOnce();
  });

  it("releases the lock when a provider sync fails", async () => {
    mockSyncConfiguredProvider.mockReset().mockRejectedValue(new Error("provider offline"));

    await expect(runConfiguredProviderSync()).rejects.toThrow("provider offline");

    expect(mockDownloadCovers).not.toHaveBeenCalled();
    expect(mockCloseSync).toHaveBeenCalledWith(42);
    expect(mockUnlinkSync).toHaveBeenCalledWith(
      path.join("/var/lib/printworks", "configured-provider-sync.lock"),
    );
  });

  it("raises a typed error when another process holds the lock", async () => {
    const lockError = Object.assign(new Error("already exists"), { code: "EEXIST" });
    mockOpenSync.mockImplementation(() => {
      throw lockError;
    });

    await expect(runConfiguredProviderSync()).rejects.toBeInstanceOf(
      ConcurrentConfiguredProviderSyncError,
    );

    expect(mockSyncConfiguredProvider).not.toHaveBeenCalled();
    expect(mockDownloadCovers).not.toHaveBeenCalled();
    expect(mockCloseSync).not.toHaveBeenCalled();
    expect(mockUnlinkSync).not.toHaveBeenCalled();
  });
});
