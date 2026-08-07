import fs from "node:fs";
import path from "node:path";
import { bold, cyan, dim } from "./colors.js";
import { downloadCovers } from "./covers.js";
import { db, stmts } from "./db.js";
import { logInfo } from "./logger.js";
import { defaultConfigPath, loadPrintworksConfig } from "./providers/config.js";
import { syncConfiguredProvider } from "./providers/configured-sync.js";
import { defaultDbPath, hasSyncChanges, runPostSyncMaintenance } from "./sync-workflow.js";

export type ConfiguredProviderSyncOptions = {
  configPath?: string;
  providerId?: string;
};

export type ConfiguredProviderSyncProviderResult = {
  id: string;
  inserted: number;
  updated: number;
};

export type ConfiguredProviderSyncResult = {
  providers: ConfiguredProviderSyncProviderResult[];
  covers: Awaited<ReturnType<typeof downloadCovers>>;
};

export class ConcurrentConfiguredProviderSyncError extends Error {
  constructor() {
    super("A configured-provider sync is already running.");
    this.name = "ConcurrentConfiguredProviderSyncError";
  }
}

function configuredProviderSyncLockPath(): string {
  return path.join(path.dirname(path.resolve(defaultDbPath())), "configured-provider-sync.lock");
}

function acquireLock(lockPath: string): number {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  try {
    return fs.openSync(lockPath, "wx");
  } catch (error) {
    if (isErrorWithCode(error, "EEXIST")) throw new ConcurrentConfiguredProviderSyncError();
    throw error;
  }
}

function isErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function releaseLock(lockFd: number, lockPath: string): void {
  try {
    fs.closeSync(lockFd);
  } finally {
    fs.unlinkSync(lockPath);
  }
}

export async function runConfiguredProviderSync(
  options: ConfiguredProviderSyncOptions = {},
): Promise<ConfiguredProviderSyncResult> {
  const configPath = options.configPath ?? defaultConfigPath();
  const config = loadPrintworksConfig(configPath);
  if (!config) throw new Error(`No provider config found at ${configPath}`);

  const providers = options.providerId
    ? config.providers.filter((provider) => provider.id === options.providerId)
    : config.providers;
  if (providers.length === 0) throw new Error(`No provider found with id: ${options.providerId}`);

  const dbPath = defaultDbPath();
  logInfo(bold(cyan("=== configured-provider-sync ===")));
  logInfo(`  ${dim("Config:")} ${configPath}`);
  logInfo(`  ${dim("DB    :")} ${dim(dbPath)}`);
  logInfo("");

  const lockPath = configuredProviderSyncLockPath();
  const lockFd = acquireLock(lockPath);
  try {
    const results: ConfiguredProviderSyncProviderResult[] = [];
    for (const provider of providers) {
      const counts = await syncConfiguredProvider(db, stmts.upsertTask, provider);
      results.push({ id: provider.id, ...counts });
    }

    let maintenanceError: unknown;
    let maintenanceFailed = false;
    if (hasSyncChanges(results)) {
      try {
        runPostSyncMaintenance();
      } catch (error) {
        maintenanceError = error;
        maintenanceFailed = true;
      }
    } else {
      logInfo(`  ${dim("Post-sync:")} skipped — no provider records changed.`);
    }

    const covers = await downloadCovers();
    if (maintenanceFailed) throw maintenanceError;
    return { providers: results, covers };
  } finally {
    releaseLock(lockFd, lockPath);
  }
}
