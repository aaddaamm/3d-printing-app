import fs from "node:fs";
import path from "node:path";
import { API_PAGE_LIMIT } from "../constants.js";
import type { PrintworksConfig, ProviderRegistryEntry } from "./config-types.js";
export {
  resolveBambuToken,
  resolveBambuTokenWithSource,
  type BambuTokenResolution,
} from "./bambu/token.js";
export type {
  BaseProviderConfig,
  BambuProviderRegistryEntry,
  MoonrakerProviderRegistryEntry,
  PrintworksConfig,
  ProviderRegistryEntry,
  ProviderType,
} from "./config-types.js";

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
  if (raw === null || raw === undefined) return undefined;
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
  if (raw === null || raw === undefined) return undefined;

  let num = Number.NaN;
  if (typeof raw === "number") {
    num = raw;
  } else if (typeof raw === "string") {
    num = Number(raw);
  }

  if (!Number.isFinite(num) || num <= 0) {
    throw new PrintworksConfigError(`${label}.${key} must be a positive number`);
  }
  return num;
}

export function providerLimit(entry: ProviderRegistryEntry): number {
  return entry.limit ?? API_PAGE_LIMIT;
}
