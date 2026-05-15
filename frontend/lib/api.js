import { toast } from "../components/toast.js";
import { FETCH_TIMEOUT_MS } from "./constants.js";

export async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function requestOptions(options) {
  return { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...options };
}

function toRequestError(err, fallback) {
  if (err?.name === "TimeoutError") return new Error(`${fallback} (request timed out)`);
  return new Error(`${fallback} (network error)`);
}

export async function fetchJson(url, fallback, options) {
  let res;
  try {
    res = await fetch(url, requestOptions(options));
  } catch (err) {
    throw toRequestError(err, fallback);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.json();
}

export async function fetchJsonResult(url, fallback, options) {
  try {
    return { data: await fetchJson(url, fallback, options), error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(fallback) };
  }
}

export async function fetchJsonOrToast(url, fallback, options) {
  const { data, error } = await fetchJsonResult(url, fallback, options);
  if (error) {
    toast(error.message || fallback, "error");
    return null;
  }
  return data;
}

export async function patchJsonOrToast(url, payload, fallback) {
  return fetchJsonOrToast(url, fallback, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postJsonOrToast(url, payload, fallback) {
  return fetchJsonOrToast(url, fallback, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
