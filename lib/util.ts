import type { Context } from "hono";

/** Parse a positive integer `:id` route param. Returns null if invalid. */
export function parseId(c: Context): number | null {
  const id = Number(c.req.param("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function jsonError(c: Context, error: string, status = 400): Response {
  c.status(status as never);
  return c.json({ error });
}

export async function parseJsonBody(c: Context): Promise<Record<string, unknown> | null> {
  try {
    return (await c.req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function requireId(c: Context): number | Response {
  const id = parseId(c);
  if (id === null) return jsonError(c, "Invalid id", 400);
  return id;
}

export function unknownFields(body: Record<string, unknown>, allowed: readonly string[]): string[] {
  return Object.keys(body).filter((k) => !allowed.includes(k));
}

export function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}
