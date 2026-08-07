import "dotenv/config";
import { db } from "./lib/db.js";
import { red } from "./lib/colors.js";
import { runConfiguredProviderSync } from "./lib/configured-provider-sync.js";
import { logError } from "./lib/logger.js";

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
  await runConfiguredProviderSync(parseCliArgs(process.argv.slice(2)));
}

main()
  .catch((error: unknown) => {
    logError(`\n${red("Error:")} ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
