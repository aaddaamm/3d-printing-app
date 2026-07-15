import { beforeEach, describe, expect, it, vi } from "vitest";
import { createConfiguredProvider } from "../lib/providers/factory.js";
import { storeProviderHistory } from "../lib/providers/sync.js";
import { syncConfiguredProvider } from "../lib/providers/configured-sync.js";
import { insertSyncLog, updateSyncLog } from "../lib/sync-workflow.js";
import type { HistorySyncResult, PrintHistoryProvider } from "../lib/providers/types.js";

vi.mock("../lib/colors.js", () => ({ bold: String, dim: String, green: String }));
vi.mock("../lib/logger.js", () => ({ logInfo: vi.fn() }));
vi.mock("../lib/providers/factory.js", () => ({ createConfiguredProvider: vi.fn() }));
vi.mock("../lib/providers/sync.js", () => ({ storeProviderHistory: vi.fn() }));
vi.mock("../lib/sync-workflow.js", () => ({
  insertSyncLog: vi.fn(),
  updateSyncLog: vi.fn(),
}));

const emptyResult: HistorySyncResult = {
  provider_id: "bambu",
  records: [],
  printers: [],
  errors: [],
};

function provider(fetchHistory: PrintHistoryProvider["fetchHistory"]): PrintHistoryProvider {
  return {
    id: "bambu",
    display_name: "Bambu Cloud",
    capabilities: ["history:list"],
    listPrinters: vi.fn(),
    fetchHistory,
  };
}

describe("configured provider sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(insertSyncLog).mockReturnValue(17);
  });

  it("fetches with the configured limit, stores history, and completes the sync log", async () => {
    const fetchHistory = vi.fn().mockResolvedValue(emptyResult);
    vi.mocked(createConfiguredProvider).mockReturnValue({
      config: { id: "shop-bambu", type: "bambu", deviceId: "printer-1", limit: 75 },
      provider: provider(fetchHistory),
      credentialSource: "BAMBU_TOKEN",
    });
    vi.mocked(storeProviderHistory).mockReturnValue({ inserted: 3, updated: 2 });
    const database = {} as Parameters<typeof syncConfiguredProvider>[0];
    const upsertTask = { run: vi.fn() };

    await expect(
      syncConfiguredProvider(database, upsertTask, {
        id: "shop-bambu",
        type: "bambu",
        deviceId: "printer-1",
        limit: 75,
      }),
    ).resolves.toEqual({ inserted: 3, updated: 2 });

    expect(insertSyncLog).toHaveBeenCalledWith(database, {
      provider: "bambu",
      providerPrinterId: "printer-1",
    });
    expect(fetchHistory).toHaveBeenCalledWith({ limit: 75 });
    expect(storeProviderHistory).toHaveBeenCalledWith(
      database,
      upsertTask,
      expect.any(Object),
      emptyResult,
    );
    expect(updateSyncLog).toHaveBeenCalledWith(database, 17, { inserted: 3, updated: 2 });
  });

  it("uses the Moonraker printer id and omits empty fetch options", async () => {
    const fetchHistory = vi.fn().mockResolvedValue({ ...emptyResult, provider_id: "moonraker" });
    vi.mocked(createConfiguredProvider).mockReturnValue({
      config: {
        id: "voron",
        type: "moonraker",
        baseUrl: "http://voron.local",
        printerId: "voron-24",
      },
      provider: provider(fetchHistory),
    });
    vi.mocked(storeProviderHistory).mockReturnValue({ inserted: 0, updated: 0 });
    const database = {} as Parameters<typeof syncConfiguredProvider>[0];

    await syncConfiguredProvider(
      database,
      { run: vi.fn() },
      {
        id: "voron",
        type: "moonraker",
        baseUrl: "http://voron.local",
        printerId: "voron-24",
      },
    );

    expect(insertSyncLog).toHaveBeenCalledWith(database, {
      provider: "moonraker",
      providerPrinterId: "voron-24",
    });
    expect(fetchHistory).toHaveBeenCalledWith(undefined);
  });

  it("records provider errors with credential context before rethrowing", async () => {
    const fetchHistory = vi.fn().mockResolvedValue({
      ...emptyResult,
      errors: [
        {
          provider_id: "bambu",
          code: "unauthorized",
          message: "Token expired",
          retryable: false,
        },
        {
          provider_id: "bambu",
          code: "offline",
          message: "Printer unavailable",
          retryable: true,
        },
      ],
    });
    vi.mocked(createConfiguredProvider).mockReturnValue({
      config: { id: "shop", type: "bambu" },
      provider: provider(fetchHistory),
      credentialSource: "~/.bambu_token",
    });
    const database = {} as Parameters<typeof syncConfiguredProvider>[0];

    await expect(
      syncConfiguredProvider(database, { run: vi.fn() }, { id: "shop", type: "bambu" }),
    ).rejects.toThrow("Token expired; Printer unavailable (token source: ~/.bambu_token)");

    expect(storeProviderHistory).not.toHaveBeenCalled();
    expect(updateSyncLog).toHaveBeenCalledWith(
      database,
      17,
      { inserted: 0, updated: 0 },
      "Token expired; Printer unavailable (token source: ~/.bambu_token)",
    );
  });

  it("normalizes non-Error fetch failures", async () => {
    vi.mocked(createConfiguredProvider).mockReturnValue({
      config: { id: "shop", type: "bambu" },
      provider: provider(vi.fn().mockRejectedValue("connection lost")),
    });
    const database = {} as Parameters<typeof syncConfiguredProvider>[0];

    await expect(
      syncConfiguredProvider(database, { run: vi.fn() }, { id: "shop", type: "bambu" }),
    ).rejects.toThrow("connection lost");
    expect(updateSyncLog).toHaveBeenCalledWith(
      database,
      17,
      { inserted: 0, updated: 0 },
      "connection lost",
    );
  });
});
