import { toast } from "../components/toast.js";

const FETCH_TIMEOUT_MS = 15000;

export async function errorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchJson(url, fallback, options) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), ...options });
  } catch (err) {
    if (err?.name === "TimeoutError") throw new Error(`${fallback} (request timed out)`);
    throw new Error(`${fallback} (network error)`);
  }
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.json();
}

export async function fetchJsonOrToast(url, fallback, options) {
  try {
    return await fetchJson(url, fallback, options);
  } catch (err) {
    toast(err.message || fallback, "error");
    return null;
  }
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
