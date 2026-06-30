import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import { autoGroupProjects } from "./lib/auto-group.js";
import { bold, cyan, dim, green, red } from "./lib/colors.js";
import {
  defaultConfigPath,
  loadPrintworksConfig,
  type ProviderRegistryEntry,
} from "./lib/providers/config.js";
import { createConfiguredProvider } from "./lib/providers/factory.js";
import { storeProviderHistory } from "./lib/providers/sync.js";
import { invalidateAllPriceCaches } from "./lib/price-cache.js";
import { logError, logInfo } from "./lib/logger.js";
import { getAllJobPrices } from "./models/jobs.js";
import { getAllProjectPrices } from "./models/projects.js";
import { runNormalize } from "./normalize.js";

const DB_PATH = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";

type CliOptions = {
  providerId?: string;
  configPath?: string;
};

function setProviderId(options: CliOptions, value: string | undefined): void {
  if (value) options.providerId = value;
}

function setConfigPath(options: CliOptions, value: string | undefined): void {
  if (value) options.configPath = value;
}

function parseCliArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg === "--provider") {
      i += 1;
      setProviderId(options, argv[i]);
    } else if (arg.startsWith("--provider=")) {
      setProviderId(options, arg.slice("--provider=".length));
    } else if (arg === "--config") {
      i += 1;
      setConfigPath(options, argv[i]);
    } else if (arg.startsWith("--config=")) {
      setConfigPath(options, arg.slice("--config=".length));
    } else if (!options.providerId) {
      setProviderId(options, arg);
    }
  }
  return options;
}

function insertSyncLog(provider: ProviderRegistryEntry): number {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO sync_log (provider, provider_printer_id, started_at)
       VALUES (?, ?, ?)`,
    )
    .run(
      provider.type,
      provider.type === "moonraker" ? (provider.printerId ?? null) : (provider.deviceId ?? null),
      new Date().toISOString(),
    );
  return Number(lastInsertRowid);
}

function updateSyncLog(
  id: number,
  inserted: number,
  updated: number,
  error: string | null = null,
): void {
  db.prepare(
    `UPDATE sync_log
     SET ended_at = ?, inserted = ?, updated = ?, error = ?
     WHERE id = ?`,
  ).run(new Date().toISOString(), inserted, updated, error, id);
}

async function syncProvider(config: ProviderRegistryEntry): Promise<void> {
  const { provider } = createConfiguredProvider(config);
  const syncId = insertSyncLog(config);
  let inserted = 0;
  let updated = 0;

  try {
    logInfo(`  ${dim("Provider:")} ${config.id} ${dim(`(${config.type})`)}`);
    const result = await provider.fetchHistory(config.limit ? { limit: config.limit } : undefined);
    if (result.errors.length > 0)
      throw new Error(result.errors.map((error) => error.message).join("; "));

    const stored = storeProviderHistory(db, stmts.upsertTask, provider, result);
    inserted = stored.inserted;
    updated = stored.updated;
    updateSyncLog(syncId, inserted, updated);

    logInfo(
      `  ${green("Stored history.")} ${bold(String(inserted))} new, ${bold(String(updated))} updated.`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateSyncLog(syncId, inserted, updated, message);
    throw error;
  }
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  const configPath = options.configPath ?? defaultConfigPath();
  const config = loadPrintworksConfig(configPath);
  if (!config) throw new Error(`No provider config found at ${configPath}`);

  const providers = options.providerId
    ? config.providers.filter((provider) => provider.id === options.providerId)
    : config.providers;

  if (providers.length === 0) throw new Error(`No provider found with id: ${options.providerId}`);

  logInfo(bold(cyan("=== configured-provider-sync ===")));
  logInfo(`  ${dim("Config:")} ${configPath}`);
  logInfo(`  ${dim("DB    :")} ${dim(DB_PATH)}`);
  logInfo("");

  for (const provider of providers) await syncProvider(provider);

  logInfo("");
  runNormalize();

  const { created, assigned } = autoGroupProjects();
  if (created > 0 || assigned > 0) {
    logInfo(
      `  Auto-grouped: ${green(String(assigned))} job(s) into projects ${dim(`(${created} new project(s) created)`)}.`,
    );
  }

  invalidateAllPriceCaches();
  const jobPrices = getAllJobPrices();
  const projectPrices = getAllProjectPrices();
  logInfo(
    `  Warmed price cache: ${green(String(Object.keys(jobPrices).length))} jobs, ${green(String(Object.keys(projectPrices).length))} projects.`,
  );
}

main()
  .catch((error: unknown) => {
    logError(`\n${red("Error:")} ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
