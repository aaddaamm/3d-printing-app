/** 4-hour gap between tasks = separate print runs of the same design */
export const SESSION_GAP_S = 4 * 3600;

/** Default page size for Bambu API task fetches */
export const API_PAGE_LIMIT = 1000;

/** Default request timeout for fetchWithRetry */
export const FETCH_TIMEOUT_MS = 10_000;

/** Session cookie lifetime */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
