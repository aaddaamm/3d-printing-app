import type { Context } from "hono";

/** Parse a numeric `:id` route param. Returns null if missing or non-finite. */
export function parseId(c: Context): number | null {
  const id = Number(c.req.param("id"));
  return Number.isFinite(id) ? id : null;
}
