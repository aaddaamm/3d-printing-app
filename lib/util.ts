import type { Context } from "hono";

/** Parse a positive integer `:id` route param. Returns null if invalid. */
export function parseId(c: Context): number | null {
  const id = Number(c.req.param("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}
