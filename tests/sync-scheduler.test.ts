import { describe, expect, it } from "vitest";
import { buildSyncCommand, parseSyncSchedules } from "../lib/server/sync-scheduler.js";

describe("parseSyncSchedules", () => {
  it("keeps legacy SYNC_INTERVAL_HOURS mapped to Bambu only", () => {
    expect(parseSyncSchedules({ SYNC_INTERVAL_HOURS: "6" })).toEqual([
      { provider: "bambu", intervalHours: 6 },
    ]);
  });

  it("supports provider-specific intervals without enabling every provider", () => {
    expect(
      parseSyncSchedules({
        BAMBU_SYNC_INTERVAL_HOURS: "12",
        MOONRAKER_SYNC_INTERVAL_HOURS: "2",
      }),
    ).toEqual([
      { provider: "bambu", intervalHours: 12 },
      { provider: "moonraker", intervalHours: 2 },
    ]);
  });

  it("uses SYNC_PROVIDERS with legacy interval as a shared fallback", () => {
    expect(
      parseSyncSchedules({ SYNC_PROVIDERS: "bambu, moonraker", SYNC_INTERVAL_HOURS: "4" }),
    ).toEqual([
      { provider: "bambu", intervalHours: 4 },
      { provider: "moonraker", intervalHours: 4 },
    ]);
  });

  it("lets provider-specific intervals override the shared fallback", () => {
    expect(
      parseSyncSchedules({
        SYNC_PROVIDERS: "bambu,moonraker",
        SYNC_INTERVAL_HOURS: "4",
        MOONRAKER_SYNC_INTERVAL_HOURS: "1",
      }),
    ).toEqual([
      { provider: "bambu", intervalHours: 4 },
      { provider: "moonraker", intervalHours: 1 },
    ]);
  });
});

describe("buildSyncCommand", () => {
  it("selects provider scripts for source execution", () => {
    const bambu = buildSyncCommand("file:///repo/api.ts", "bambu");
    const moonraker = buildSyncCommand("file:///repo/api.ts", "moonraker");

    expect(bambu).toMatchObject({ cmd: "tsx", args: ["/repo/dump-bambu-history.ts"] });
    expect(moonraker).toMatchObject({ cmd: "tsx", args: ["/repo/sync-moonraker-history.ts"] });
  });

  it("selects provider scripts for compiled execution", () => {
    const command = buildSyncCommand("file:///repo/dist/api.js", "moonraker");

    expect(command.cmd).toBe(process.execPath);
    expect(command.args).toEqual(["/repo/dist/sync-moonraker-history.js"]);
  });
});
