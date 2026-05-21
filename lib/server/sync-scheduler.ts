import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dim, red } from "../colors.js";
import { logError, logInfo } from "../logger.js";

type SyncCommand = { cmd: string; args: string[] };

type StartSyncSchedulerArgs = {
  syncIntervalHours: number;
  appEntryUrl: string;
};

function buildSyncCommand(appEntryUrl: string): SyncCommand {
  const filename = fileURLToPath(appEntryUrl);
  const isCompiled = filename.endsWith(".js");

  if (isCompiled) {
    return {
      cmd: process.execPath,
      args: [fileURLToPath(new URL("./dump-bambu-history.js", appEntryUrl))],
    };
  }

  return {
    cmd: "tsx",
    args: [fileURLToPath(new URL("./dump-bambu-history.ts", appEntryUrl))],
  };
}

function spawnSync(appEntryUrl: string): Promise<void> {
  const { cmd, args } = buildSyncCommand(appEntryUrl);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`sync exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

export function startSyncScheduler({
  syncIntervalHours,
  appEntryUrl,
}: StartSyncSchedulerArgs): void {
  if (syncIntervalHours <= 0) return;

  let syncInProgress = false;

  const runScheduledSync = async (): Promise<void> => {
    if (syncInProgress) {
      logInfo(dim("  Sync skipped — previous run still in progress"));
      return;
    }

    syncInProgress = true;
    try {
      await spawnSync(appEntryUrl);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logError(`${red("Sync error:")} ${error.message}`);
      throw error;
    } finally {
      syncInProgress = false;
    }
  };

  logInfo(`  ${dim("Sync:")} every ${syncIntervalHours}h`);
  const intervalMs = syncIntervalHours * 3_600_000;

  setTimeout(() => {
    runScheduledSync().catch(() => {
      // already logged in runScheduledSync
    });
  }, 10_000);

  setInterval(() => {
    runScheduledSync().catch(() => {
      // already logged in runScheduledSync
    });
  }, intervalMs);
}
