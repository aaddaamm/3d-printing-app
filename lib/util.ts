import type { Context } from "hono";

/** Parse a positive integer `:id` route param. Returns null if invalid. */
export function parseId(c: Context): number | null {
  const id = Number(c.req.param("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function parseJsonBody(c: Context): Promise<Record<string, unknown> | null> {
  try {
    return (await c.req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function unknownFields(body: Record<string, unknown>, allowed: readonly string[]): string[] {
  return Object.keys(body).filter((k) => !allowed.includes(k));
}
