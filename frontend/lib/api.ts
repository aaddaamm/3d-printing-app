import { toast } from "../components/toast.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";

type JsonRecord = Record<string, unknown>;

type RequestOptions = RequestInit | undefined;

export async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as JsonRecord;
    return typeof data.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

function requestOptions(options: RequestOptions): RequestInit {
  return { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...options };
}

function toRequestError(err: unknown, fallback: string): Error {
  if ((err as { name?: string } | null)?.name === "TimeoutError") {
    return new Error(`${fallback} (request timed out)`);
  }
  return new Error(`${fallback} (network error)`);
}

export async function fetchJson<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, requestOptions(options));
  } catch (err) {
    throw toRequestError(err, fallback);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return (await res.json()) as T;
}

export async function fetchJsonResult<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    return { data: await fetchJson<T>(url, fallback, options), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(fallback) };
  }
}

export async function fetchJsonOrToast<T = JsonRecord>(
  url: string,
  fallback: string,
  options?: RequestInit,
): Promise<T | null> {
  const { data, error } = await fetchJsonResult<T>(url, fallback, options);
  if (error) {
    toast(error.message || fallback, "error");
    return null;
  }
  return data;
}

export async function patchJsonOrToast<T = JsonRecord>(
  url: string,
  payload: unknown,
  fallback: string,
): Promise<T | null> {
  return fetchJsonOrToast<T>(url, fallback, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postJsonOrToast<T = JsonRecord>(
  url: string,
  payload: unknown,
  fallback: string,
): Promise<T | null> {
  return fetchJsonOrToast<T>(url, fallback, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
