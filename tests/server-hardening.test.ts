import { Hono } from "hono";
import { expect, it } from "vitest";
import { createAuthMiddleware } from "../lib/server/middleware.js";
import { resolveServerHost } from "../lib/server/host.js";
import { createHealthRoutes } from "../routes/health.js";
import { createSessionCookieValue } from "../routes/ui.js";

async function requestPrivatePath(apiKey: string, sessionCookie: string): Promise<number> {
  const app = new Hono();
  app.use("/*", createAuthMiddleware(apiKey));
  app.get("/private", (c) => c.text("ok"));

  const res = await app.request("/private", {
    headers: { Cookie: `session=${sessionCookie}` },
  });
  return res.status;
}

it("binds to localhost by default and allows explicit host override", () => {
  expect(resolveServerHost({})).toBe("127.0.0.1");
  expect(resolveServerHost({ HOST: "0.0.0.0" })).toBe("0.0.0.0");
  expect(resolveServerHost({ HOST: "::" })).toBe("::");
});

it("keeps public health output minimal", async () => {
  const app = new Hono().route("/health", createHealthRoutes("/private/shop.sqlite"));

  const res = await app.request("/health");

  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

it("uses a derived session cookie instead of storing the raw API key", async () => {
  const apiKey = "super-secret-key";
  const expectedSession = createSessionCookieValue(apiKey);

  expect(expectedSession).not.toBe(apiKey);
  expect(expectedSession.length).toBeGreaterThan(32);
  expect(await requestPrivatePath(apiKey, expectedSession)).toBe(200);
  expect(await requestPrivatePath(apiKey, apiKey)).toBe(401);
});
