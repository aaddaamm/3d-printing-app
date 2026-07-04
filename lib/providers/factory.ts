import { BambuCloudProvider } from "./bambu/cloud.js";
import { MoonrakerHistoryProvider } from "./moonraker/history.js";
import {
  providerLimit,
  resolveBambuTokenWithSource,
  type BambuProviderRegistryEntry,
  type MoonrakerProviderRegistryEntry,
  type ProviderRegistryEntry,
} from "./config.js";
import type { PrintHistoryProvider } from "./types.js";

export type ConfiguredProvider = {
  config: ProviderRegistryEntry;
  provider: PrintHistoryProvider;
  credentialSource?: string;
};

export function createConfiguredProvider(
  config: ProviderRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): ConfiguredProvider {
  if (config.type === "moonraker") {
    return { config, provider: createMoonrakerProvider(config, env) };
  }
  const { provider, credentialSource } = createBambuProvider(config, env);
  return { config, provider, credentialSource };
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
): { provider: BambuCloudProvider; credentialSource: string } {
  const { token, source } = resolveBambuTokenWithSource(config, env);
  if (!token) {
    throw new Error(`No Bambu token found for provider ${config.id}. Set ${source}.`);
  }

  return {
    provider: new BambuCloudProvider({
      baseUrl: config.baseUrl ?? "https://api.bambulab.com",
      token,
      limit: providerLimit(config),
      deviceId: config.deviceId,
    }),
    credentialSource: source,
  };
}
