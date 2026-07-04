import "dotenv/config";
import { db, stmts } from "./lib/db.js";
import { bold, cyan, dim, red } from "./lib/colors.js";
import { defaultConfigPath, loadPrintworksConfig } from "./lib/providers/config.js";
import { syncConfiguredProvider } from "./lib/providers/configured-sync.js";
import { logError, logInfo } from "./lib/logger.js";
import { defaultDbPath, hasSyncChanges, runPostSyncMaintenance } from "./lib/sync-workflow.js";

const DB_PATH = defaultDbPath();

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

  const counts = [];
  for (const provider of providers) {
    counts.push(await syncConfiguredProvider(db, stmts.upsertTask, provider));
  }

  if (hasSyncChanges(counts)) {
    runPostSyncMaintenance();
  } else {
    logInfo(`  ${dim("Post-sync:")} skipped — no provider records changed.`);
  }
}

main()
  .catch((error: unknown) => {
    logError(`\n${red("Error:")} ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
