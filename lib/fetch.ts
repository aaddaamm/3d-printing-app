import type { BambuApiResponse } from "./types.js";

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

export async function fetchWithRetry(
  url: URL | string,
  options: RequestInit,
  { retries = 4, timeoutMs = 10_000 }: FetchRetryOptions = {},
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });

    if (res.ok) return res;

    const isRetryable = res.status === 429 || res.status >= 500;
    if (!isRetryable || attempt === retries) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}\n${body}`);
    }

    const retryAfter = Number(res.headers.get("retry-after") ?? 0) * 1000;
    const backoff = retryAfter || 2 ** attempt * 500 + Math.random() * 500;
    console.warn(
      `\n  HTTP ${res.status} — retrying in ${Math.round(backoff / 1000)}s (attempt ${attempt + 1}/${retries})`,
    );
    await sleep(backoff);
  }
  // Unreachable — loop always throws or returns, but satisfies TypeScript.
  throw new Error("fetchWithRetry: exhausted retries");
}

export async function fetchTasks({
  baseUrl,
  token,
  limit,
  offset = 0,
  deviceId,
}: FetchTasksParams): Promise<BambuApiResponse> {
  const url = new URL(`${baseUrl}/v1/user-service/my/tasks`);
  url.searchParams.set("limit", String(limit));
  if (offset > 0) url.searchParams.set("offset", String(offset));
  if (deviceId) url.searchParams.set("deviceId", deviceId);

  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as BambuApiResponse;
  if (process.env["BAMBU_DEBUG"]) {
    console.log("\n[debug] url:", url.toString());
    console.log("[debug] hits count:", data.hits?.length, "api total:", data.total);
  }
  return data;
}
