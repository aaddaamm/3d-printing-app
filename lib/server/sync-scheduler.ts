import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dim, red } from "../colors.js";
import { logError, logInfo } from "../logger.js";

type SyncCommand = { cmd: string; args: string[] };

export type SyncProviderId = "bambu" | "moonraker";

export type SyncSchedule = {
  provider: SyncProviderId;
  intervalHours: number;
};

type StartSyncSchedulerArgs = {
  schedules: SyncSchedule[];
  appEntryUrl: string;
};

const PROVIDER_SCRIPT_BASE: Record<SyncProviderId, string> = {
  bambu: "dump-bambu-history",
  moonraker: "sync-moonraker-history",
};

function parseCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseHours(value: string | undefined, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toProviderId(rawProvider: string): SyncProviderId {
  if (rawProvider === "bambu" || rawProvider === "moonraker") return rawProvider;
  throw new Error(`Unknown sync provider: ${rawProvider}`);
}

function intervalForProvider(
  provider: SyncProviderId,
  env: NodeJS.ProcessEnv,
  fallbackIntervalHours: number,
): number {
  if (provider === "bambu") {
    return parseHours(env["BAMBU_SYNC_INTERVAL_HOURS"], fallbackIntervalHours);
  }
  return parseHours(env["MOONRAKER_SYNC_INTERVAL_HOURS"], fallbackIntervalHours);
}

export function parseSyncSchedules(env: NodeJS.ProcessEnv = process.env): SyncSchedule[] {
  const legacyIntervalHours = parseHours(env["SYNC_INTERVAL_HOURS"]);
  const configuredProviders = parseCsv(env["SYNC_PROVIDERS"]);
  const providers = configuredProviders.length
    ? configuredProviders.map(toProviderId)
    : (["bambu", "moonraker"] as const);

  return providers
    .map((provider) => {
      const fallback = configuredProviders.length || provider === "bambu" ? legacyIntervalHours : 0;
      const intervalHours = intervalForProvider(provider, env, fallback);
      return { provider, intervalHours };
    })
    .filter((schedule) => schedule.intervalHours > 0);
}

export function buildSyncCommand(appEntryUrl: string, provider: SyncProviderId): SyncCommand {
  const filename = fileURLToPath(appEntryUrl);
  const isCompiled = filename.endsWith(".js");
  const scriptBase = PROVIDER_SCRIPT_BASE[provider];
  const scriptName = `${scriptBase}.${isCompiled ? "js" : "ts"}`;
  const scriptUrl = new URL(`./${scriptName}`, appEntryUrl);

  if (isCompiled) {
    return {
      cmd: process.execPath,
      args: [fileURLToPath(scriptUrl)],
    };
  }

  return {
    cmd: "tsx",
    args: [fileURLToPath(scriptUrl)],
  };
}

function spawnSync(appEntryUrl: string, provider: SyncProviderId): Promise<void> {
  const { cmd, args } = buildSyncCommand(appEntryUrl, provider);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env: process.env });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${provider} sync exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function startProviderSchedule(schedule: SyncSchedule, appEntryUrl: string): void {
  let syncInProgress = false;

  const runScheduledSync = async (): Promise<void> => {
    if (syncInProgress) {
      logInfo(dim(`  ${schedule.provider} sync skipped — previous run still in progress`));
      return;
    }

    syncInProgress = true;
    try {
      await spawnSync(appEntryUrl, schedule.provider);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logError(`${red(`${schedule.provider} sync error:`)} ${error.message}`);
      throw error;
    } finally {
      syncInProgress = false;
    }
  };

  logInfo(`  ${dim("Sync:")} ${schedule.provider} every ${schedule.intervalHours}h`);
  const intervalMs = schedule.intervalHours * 3_600_000;

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

export function startSyncScheduler({ schedules, appEntryUrl }: StartSyncSchedulerArgs): void {
  if (schedules.length === 0) return;
  for (const schedule of schedules) {
    startProviderSchedule(schedule, appEntryUrl);
  }
}
