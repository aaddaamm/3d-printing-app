import type Database from "better-sqlite3";
import { bold, dim, green } from "../colors.js";
import { logInfo } from "../logger.js";
import { insertSyncLog, updateSyncLog } from "../sync-workflow.js";
import type { PrintTask } from "../types.js";
import type { ProviderRegistryEntry } from "./config.js";
import { createConfiguredProvider } from "./factory.js";
import { storeProviderHistory } from "./sync.js";

export type ConfiguredSyncResult = {
  inserted: number;
  updated: number;
};

type UpsertTask = { run: (row: PrintTask) => unknown };

function providerPrinterId(provider: ProviderRegistryEntry): string | null {
  return provider.type === "moonraker" ? (provider.printerId ?? null) : (provider.deviceId ?? null);
}

export async function syncConfiguredProvider(
  database: Database.Database,
  upsertTask: UpsertTask,
  config: ProviderRegistryEntry,
): Promise<ConfiguredSyncResult> {
  const { credentialSource, provider } = createConfiguredProvider(config);
  const syncId = insertSyncLog(database, {
    provider: config.type,
    providerPrinterId: providerPrinterId(config),
  });
  let inserted = 0;
  let updated = 0;

  try {
    logInfo(`  ${dim("Provider:")} ${config.id} ${dim(`(${config.type})`)}`);
    if (credentialSource) logInfo(`  ${dim("Token   :")} ${credentialSource}`);

    const result = await provider.fetchHistory(config.limit ? { limit: config.limit } : undefined);
    if (result.errors.length > 0) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const stored = storeProviderHistory(database, upsertTask, provider, result);
    inserted = stored.inserted;
    updated = stored.updated;
    updateSyncLog(database, syncId, { inserted, updated });

    logInfo(
      `  ${green("Stored history.")} ${bold(String(inserted))} new, ${bold(String(updated))} updated.`,
    );
    return { inserted, updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const sourceHint = credentialSource ? ` (token source: ${credentialSource})` : "";
    const syncError = new Error(`${message}${sourceHint}`, { cause: error });
    updateSyncLog(database, syncId, { inserted, updated }, syncError.message);
    throw syncError;
  }
}
