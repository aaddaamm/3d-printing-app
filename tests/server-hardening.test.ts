import { Hono } from "hono";
import { expect, it } from "vitest";
import { resolveServerHost } from "../lib/server/host.js";
import { createHealthRoutes } from "../routes/health.js";
import { createUiApp } from "../routes/ui.js";

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

it("serves the UI without a login gate for local-only access", async () => {
  const app = new Hono().route("/ui", createUiApp());

  const res = await app.request("/ui/login");

  expect(res.status).toBe(200);
  expect(await res.text()).not.toContain("Sign in");
});
