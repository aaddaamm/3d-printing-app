import type { BambuApiResponse } from "./types.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";
import { logWarn } from "./logger.js";

interface FetchRetryOptions {
  retries?: number;
  timeoutMs?: number;
}

interface FetchTasksParams {
  baseUrl: string;
  token: string;
  limit: number;
  offset?: number;
  deviceId?: string | undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`HTTP ${status} ${statusText}\n${body}`);
    this.name = "HttpError";
  }
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    return typeof res.text === "function" ? await res.text() : "";
  } catch {
    return "";
  }
}

function retryBackoffMs(attempt: number, retryAfterHeader?: string | null): number {
  const retryAfter = Number(retryAfterHeader ?? 0) * 1000;
  return retryAfter || 2 ** attempt * 500 + Math.random() * 500;
}

export async function fetchWithRetry(
  url: URL | string,
  options: RequestInit,
  { retries = 4, timeoutMs = FETCH_TIMEOUT_MS }: FetchRetryOptions = {},
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
    } catch (e) {
      if (attempt === retries) throw e;

      const backoff = retryBackoffMs(attempt);
      const msg = e instanceof Error ? e.message : String(e);
      logWarn(
        `\n  Network error (${msg}) — retrying in ${Math.round(backoff / 1000)}s (attempt ${attempt + 1}/${retries})`,
      );
      await sleep(backoff);
      continue;
    }

    if (res.ok) return res;

    const isRetryable = res.status === 429 || res.status >= 500;
    if (!isRetryable || attempt === retries) {
      throw new HttpError(res.status, res.statusText, await readErrorBody(res));
    }

    const backoff = retryBackoffMs(attempt, res.headers.get("retry-after"));
    logWarn(
      `\n  HTTP ${res.status} — retrying in ${Math.round(backoff / 1000)}s (attempt ${attempt + 1}/${retries})`,
    );
    await sleep(backoff);
  }
  // TypeScript requires this — the loop always returns or throws on the final attempt,
  // but control flow analysis can't prove it when retries is a variable.
  throw new Error("fetchWithRetry: exhausted retries");
}

function buildBambuTasksUrl(baseUrl: string): URL {
  try {
    return new URL("/v1/user-service/my/tasks", baseUrl);
  } catch (error: unknown) {
    throw new Error(`Invalid Bambu API base URL: ${baseUrl}`, { cause: error });
  }
}

export async function fetchTasks({
  baseUrl,
  token,
  limit,
  offset = 0,
  deviceId,
}: FetchTasksParams): Promise<BambuApiResponse> {
  const url = buildBambuTasksUrl(baseUrl);
  url.searchParams.set("limit", String(limit));
  if (offset > 0) url.searchParams.set("offset", String(offset));
  if (deviceId) url.searchParams.set("deviceId", deviceId);

  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as BambuApiResponse;
  if (process.env["BAMBU_DEBUG"]) {
    process.stderr.write(`\n[debug] url: ${url.toString()}\n`);
    process.stderr.write(
      `[debug] hits count: ${String(data.hits?.length)} api total: ${String(data.total)}\n`,
    );
  }
  return data;
}
