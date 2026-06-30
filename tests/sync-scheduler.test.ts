import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
});
