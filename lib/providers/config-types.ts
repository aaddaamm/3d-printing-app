export type ProviderType = "bambu" | "moonraker";

export type BaseProviderConfig = {
  id: string;
  type: ProviderType;
  name?: string | undefined;
  syncIntervalHours?: number | undefined;
};

export type MoonrakerProviderRegistryEntry = BaseProviderConfig & {
  type: "moonraker";
  baseUrl: string;
  apiKeyEnv?: string | undefined;
  printerId?: string | undefined;
  printerName?: string | undefined;
  printerModel?: string | undefined;
  model?: string | undefined;
  limit?: number | undefined;
};

export type BambuProviderRegistryEntry = BaseProviderConfig & {
  type: "bambu";
  baseUrl?: string | undefined;
  tokenEnv?: string | undefined;
  tokenPath?: string | undefined;
  deviceId?: string | undefined;
  limit?: number | undefined;
};

export type ProviderRegistryEntry = MoonrakerProviderRegistryEntry | BambuProviderRegistryEntry;

export type PrintworksConfig = {
  providers: ProviderRegistryEntry[];
};
