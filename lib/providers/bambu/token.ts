import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { BambuProviderRegistryEntry } from "../config.js";

export type BambuTokenResolution = {
  token: string;
  source: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
    throw new Error(`Bambu token path must point to a regular file: ${tokenPath}`);
  }

  return { token: readToken(fs.readFileSync(tokenPath, "utf8")), source: configuredTokenPath };
}

export function resolveBambuToken(
  entry: BambuProviderRegistryEntry,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveBambuTokenWithSource(entry, env).token;
}
