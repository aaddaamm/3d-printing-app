import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { API_PAGE_LIMIT } from "../constants.js";

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

export class PrintworksConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrintworksConfigError";
  }
}

export function defaultConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  return env["PRINTWORKS_CONFIG"] ?? path.resolve(process.cwd(), "printworks.config.json");
}

export function loadPrintworksConfig(
  configPath: string | undefined = undefined,
  env: NodeJS.ProcessEnv = process.env,
): PrintworksConfig | null {
  const resolvedPath = configPath ?? defaultConfigPath(env);
  if (!fs.existsSync(resolvedPath)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(resolvedPath, "utf8")) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PrintworksConfigError(`Unable to read ${resolvedPath}: ${message}`);
  }

  return parsePrintworksConfig(parsed, resolvedPath);
}

export function parsePrintworksConfig(
  value: unknown,
  source = "printworks config",
): PrintworksConfig {
  if (!isRecord(value)) throw new PrintworksConfigError(`${source} must be a JSON object`);

  const providers = value["providers"];
  if (!Array.isArray(providers)) {
    throw new PrintworksConfigError(`${source} must contain a providers array`);
  }

  const entries = providers.map((provider, index) => parseProvider(provider, index, source));
  const ids = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new PrintworksConfigError(`Duplicate provider id: ${entry.id}`);
    ids.add(entry.id);
  }

  return { providers: entries };
}

export type BambuTokenResolution = {
  token: string;
  source: string;
};

export function resolveBambuTokenWithSource(
  entry: BambuProviderRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): BambuTokenResolution {
  const tokenEnv = entry.tokenEnv ?? "BAMBU_TOKEN";
  const envToken = env[tokenEnv];
  if (envToken) return { token: readToken(envToken), source: `${tokenEnv} env` };

  const configuredTokenPath = entry.tokenPath ?? "~/.bambu_token";
  const tokenPath = resolveHomePath(configuredTokenPath);
  if (!fs.existsSync(tokenPath)) return { token: "", source: configuredTokenPath };

  const stat = fs.lstatSync(tokenPath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new PrintworksConfigError(`Bambu token path must point to a regular file: ${tokenPath}`);
  }

  return { token: readToken(fs.readFileSync(tokenPath, "utf8")), source: configuredTokenPath };
}

export function resolveBambuToken(
  entry: BambuProviderRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveBambuTokenWithSource(entry, env).token;
}

function parseProvider(value: unknown, index: number, source: string): ProviderRegistryEntry {
  const label = `${source} providers[${index}]`;
  if (!isRecord(value)) throw new PrintworksConfigError(`${label} must be an object`);

  const id = requiredString(value, "id", label);
  const type = requiredString(value, "type", label);
  const syncIntervalHours = optionalPositiveNumber(value, "syncIntervalHours", label);
  const name = optionalString(value, "name", label);

  if (type === "moonraker") {
    return {
      id,
      type,
      name,
      syncIntervalHours,
      baseUrl: requiredUrl(value, "baseUrl", label),
      apiKeyEnv: optionalString(value, "apiKeyEnv", label),
      printerId: optionalString(value, "printerId", label),
      printerName: optionalString(value, "printerName", label) ?? name,
      printerModel:
        optionalString(value, "printerModel", label) ?? optionalString(value, "model", label),
      model: optionalString(value, "model", label),
      limit: optionalPositiveNumber(value, "limit", label),
    };
  }

  if (type === "bambu") {
    const baseUrl = optionalString(value, "baseUrl", label) ?? "https://api.bambulab.com";
    if (!baseUrl.startsWith("https://")) {
      throw new PrintworksConfigError(`${label}.baseUrl must start with https://`);
    }

    return {
      id,
      type,
      name,
      syncIntervalHours,
      baseUrl,
      tokenEnv: optionalString(value, "tokenEnv", label),
      tokenPath: optionalString(value, "tokenPath", label),
      deviceId: optionalString(value, "deviceId", label),
      limit: optionalPositiveNumber(value, "limit", label),
    };
  }

  throw new PrintworksConfigError(`${label}.type must be one of: bambu, moonraker`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requiredString(value: Record<string, unknown>, key: string, label: string): string {
  const result = optionalString(value, key, label);
  if (!result) throw new PrintworksConfigError(`${label}.${key} is required`);
  return result;
}

function optionalString(
  value: Record<string, unknown>,
  key: string,
  label: string,
): string | undefined {
  const raw = value[key];
  if (raw == null) return undefined;
  if (typeof raw !== "string") throw new PrintworksConfigError(`${label}.${key} must be a string`);
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requiredUrl(value: Record<string, unknown>, key: string, label: string): string {
  const url = requiredString(value, key, label);
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new PrintworksConfigError(`${label}.${key} must start with http:// or https://`);
  }
  return url;
}

function optionalPositiveNumber(
  value: Record<string, unknown>,
  key: string,
  label: string,
): number | undefined {
  const raw = value[key];
  if (raw == null) return undefined;
  const num = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isFinite(num) || num <= 0) {
    throw new PrintworksConfigError(`${label}.${key} must be a positive number`);
  }
  return num;
}

function resolveHomePath(value: string): string {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

function readToken(raw: string): string {
  const s = raw.trim();
  try {
    const parsed = JSON.parse(s) as unknown;
    if (isRecord(parsed) && typeof parsed["token"] === "string") return parsed["token"].trim();
  } catch {
    // not JSON — treat as raw token string
  }
  return s;
}

export function providerLimit(entry: ProviderRegistryEntry): number {
  return entry.limit ?? API_PAGE_LIMIT;
}
