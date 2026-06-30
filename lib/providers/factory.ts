import { BambuCloudProvider } from "./bambu/cloud.js";
import { MoonrakerHistoryProvider } from "./moonraker/history.js";
import {
  providerLimit,
  resolveBambuToken,
  type BambuProviderRegistryEntry,
  type MoonrakerProviderRegistryEntry,
  type ProviderRegistryEntry,
} from "./config.js";
import type { PrintHistoryProvider } from "./types.js";

export type ConfiguredProvider = {
  config: ProviderRegistryEntry;
  provider: PrintHistoryProvider;
};

export function createConfiguredProvider(
  config: ProviderRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): ConfiguredProvider {
  if (config.type === "moonraker") {
    return { config, provider: createMoonrakerProvider(config, env) };
  }
  return { config, provider: createBambuProvider(config, env) };
}

export function createConfiguredProviders(
  configs: ProviderRegistryEntry[],
  env: NodeJS.ProcessEnv = process.env,
): ConfiguredProvider[] {
  return configs.map((config) => createConfiguredProvider(config, env));
}

function createMoonrakerProvider(
  config: MoonrakerProviderRegistryEntry,
  env: NodeJS.ProcessEnv,
): MoonrakerHistoryProvider {
  return new MoonrakerHistoryProvider({
    baseUrl: config.baseUrl,
    apiKey: config.apiKeyEnv ? env[config.apiKeyEnv] : undefined,
    printerId: config.printerId,
    printerName: config.printerName ?? config.name,
    printerModel: config.printerModel ?? config.model,
    limit: providerLimit(config),
  });
}

function createBambuProvider(
  config: BambuProviderRegistryEntry,
  env: NodeJS.ProcessEnv,
): BambuCloudProvider {
  const token = resolveBambuToken(config, env);
  if (!token) {
    const source = config.tokenEnv ?? config.tokenPath ?? "BAMBU_TOKEN or ~/.bambu_token";
    throw new Error(`No Bambu token found for provider ${config.id}. Set ${source}.`);
  }

  return new BambuCloudProvider({
    baseUrl: config.baseUrl ?? "https://api.bambulab.com",
    token,
    limit: providerLimit(config),
    deviceId: config.deviceId,
  });
}
