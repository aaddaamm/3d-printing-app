import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logError, logInfo } from "../lib/logger.js";
import {
  buildSyncCommand,
  parseSyncSchedules,
  startSyncScheduler,
} from "../lib/server/sync-scheduler.js";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));
vi.mock("../lib/colors.js", () => ({ dim: String, red: String }));
vi.mock("../lib/logger.js", () => ({ logError: vi.fn(), logInfo: vi.fn() }));

function mockChildProcess(): EventEmitter {
  const child = new EventEmitter();
  vi.mocked(spawn).mockReturnValue(child as ReturnType<typeof spawn>);
  return child;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

function legacyEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return { PRINTWORKS_CONFIG: path.join(os.tmpdir(), "missing-printworks.config.json"), ...env };
}

describe("parseSyncSchedules", () => {
  it("keeps legacy SYNC_INTERVAL_HOURS mapped to Bambu only", () => {
    expect(parseSyncSchedules(legacyEnv({ SYNC_INTERVAL_HOURS: "6" }))).toEqual([
      { provider: "bambu", intervalHours: 6 },
    ]);
  });

  it("supports provider-specific intervals without enabling every provider", () => {
    expect(
      parseSyncSchedules(
        legacyEnv({
          BAMBU_SYNC_INTERVAL_HOURS: "12",
          MOONRAKER_SYNC_INTERVAL_HOURS: "2",
        }),
      ),
    ).toEqual([
      { provider: "bambu", intervalHours: 12 },
      { provider: "moonraker", intervalHours: 2 },
    ]);
  });

  it("uses SYNC_PROVIDERS with legacy interval as a shared fallback", () => {
    expect(
      parseSyncSchedules(
        legacyEnv({ SYNC_PROVIDERS: "bambu, moonraker", SYNC_INTERVAL_HOURS: "4" }),
      ),
    ).toEqual([
      { provider: "bambu", intervalHours: 4 },
      { provider: "moonraker", intervalHours: 4 },
    ]);
  });

  it("lets provider-specific intervals override the shared fallback", () => {
    expect(
      parseSyncSchedules(
        legacyEnv({
          SYNC_PROVIDERS: "bambu,moonraker",
          SYNC_INTERVAL_HOURS: "4",
          MOONRAKER_SYNC_INTERVAL_HOURS: "1",
        }),
      ),
    ).toEqual([
      { provider: "bambu", intervalHours: 4 },
      { provider: "moonraker", intervalHours: 1 },
    ]);
  });

  it("uses configured provider intervals when PRINTWORKS_CONFIG exists", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printworks-scheduler-"));
    const configPath = path.join(dir, "printworks.config.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        providers: [
          { id: "u1", type: "moonraker", baseUrl: "http://u1.local", syncIntervalHours: 1 },
          { id: "manual", type: "moonraker", baseUrl: "http://manual.local" },
        ],
      }),
    );

    expect(parseSyncSchedules({ PRINTWORKS_CONFIG: configPath })).toEqual([
      { provider: "configured", providerId: "u1", intervalHours: 1 },
    ]);
  });

  it("ignores empty, invalid, and non-positive interval values", () => {
    expect(
      parseSyncSchedules(
        legacyEnv({
          SYNC_INTERVAL_HOURS: "not-a-number",
          BAMBU_SYNC_INTERVAL_HOURS: "-1",
          MOONRAKER_SYNC_INTERVAL_HOURS: "0",
        }),
      ),
    ).toEqual([]);
  });

  it("rejects unknown legacy provider ids", () => {
    expect(() =>
      parseSyncSchedules(legacyEnv({ SYNC_PROVIDERS: "bambu, unknown", SYNC_INTERVAL_HOURS: "1" })),
    ).toThrow("Unknown sync provider: unknown");
  });
});

describe("buildSyncCommand", () => {
  it("selects provider scripts for source execution", () => {
    const bambu = buildSyncCommand("file:///repo/api.ts", "bambu");
    const moonraker = buildSyncCommand("file:///repo/api.ts", "moonraker");
    const configured = buildSyncCommand("file:///repo/api.ts", "configured", "u1");

    expect(bambu).toMatchObject({ cmd: "tsx", args: ["/repo/dump-bambu-history.ts"] });
    expect(moonraker).toMatchObject({ cmd: "tsx", args: ["/repo/sync-moonraker-history.ts"] });
    expect(configured).toMatchObject({
      cmd: "tsx",
      args: ["/repo/sync-configured-providers.ts", "--provider", "u1"],
    });
  });

  it("selects provider scripts for compiled execution", () => {
    const command = buildSyncCommand("file:///repo/dist/api.js", "moonraker");

    expect(command.cmd).toBe(process.execPath);
    expect(command.args).toEqual(["/repo/dist/sync-moonraker-history.js"]);
  });

  it("omits configured-provider arguments when no provider id is supplied", () => {
    expect(buildSyncCommand("file:///repo/api.ts", "configured")).toEqual({
      cmd: "tsx",
      args: ["/repo/sync-configured-providers.ts"],
    });
  });
});

describe("startSyncScheduler", () => {
  it("does nothing when there are no schedules", () => {
    vi.useFakeTimers();

    startSyncScheduler({ schedules: [], appEntryUrl: "file:///repo/api.ts" });

    expect(vi.getTimerCount()).toBe(0);
    expect(spawn).not.toHaveBeenCalled();
  });

  it("starts each provider after the startup delay", async () => {
    vi.useFakeTimers();
    const child = mockChildProcess();
    startSyncScheduler({
      schedules: [
        { provider: "bambu", intervalHours: 1 },
        { provider: "configured", providerId: "voron", intervalHours: 2 },
      ],
      appEntryUrl: "file:///repo/api.ts",
    });

    expect(vi.getTimerCount()).toBe(4);
    expect(logInfo).toHaveBeenCalledWith("  Sync: bambu every 1h");
    expect(logInfo).toHaveBeenCalledWith("  Sync: voron every 2h");
    await vi.advanceTimersByTimeAsync(10_000);

    expect(spawn).toHaveBeenNthCalledWith(
      1,
      "tsx",
      ["/repo/dump-bambu-history.ts"],
      expect.objectContaining({ stdio: "inherit" }),
    );
    expect(spawn).toHaveBeenNthCalledWith(
      2,
      "tsx",
      ["/repo/sync-configured-providers.ts", "--provider", "voron"],
      expect.objectContaining({ stdio: "inherit" }),
    );
    child.emit("close", 0);
  });

  it("skips overlapping interval runs and resumes after completion", async () => {
    vi.useFakeTimers();
    const firstChild = mockChildProcess();
    startSyncScheduler({
      schedules: [{ provider: "moonraker", intervalHours: 1 }],
      appEntryUrl: "file:///repo/api.ts",
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(spawn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3_590_000);
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(logInfo).toHaveBeenCalledWith(
      "  moonraker sync skipped — previous run still in progress",
    );

    firstChild.emit("close", 0);
    await vi.advanceTimersByTimeAsync(3_600_000);
    expect(spawn).toHaveBeenCalledTimes(2);
  });

  it("logs failed child exits and allows the next interval to retry", async () => {
    vi.useFakeTimers();
    const failedChild = mockChildProcess();
    startSyncScheduler({
      schedules: [{ provider: "bambu", intervalHours: 1 }],
      appEntryUrl: "file:///repo/api.ts",
    });

    await vi.advanceTimersByTimeAsync(10_000);
    failedChild.emit("close", 2);
    await vi.advanceTimersByTimeAsync(0);

    expect(logError).toHaveBeenCalledWith("bambu sync error: bambu sync exited with code 2");
    await vi.advanceTimersByTimeAsync(3_590_000);
    expect(spawn).toHaveBeenCalledTimes(2);
  });

  it("normalizes non-Error child failures before logging", async () => {
    vi.useFakeTimers();
    const child = mockChildProcess();
    startSyncScheduler({
      schedules: [{ provider: "bambu", intervalHours: 1 }],
      appEntryUrl: "file:///repo/api.ts",
    });

    await vi.advanceTimersByTimeAsync(10_000);
    child.emit("error", "spawn unavailable");
    await vi.advanceTimersByTimeAsync(0);

    expect(logError).toHaveBeenCalledWith("bambu sync error: spawn unavailable");
  });
});
