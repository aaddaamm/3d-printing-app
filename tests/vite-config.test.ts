import { expect, it } from "vitest";
import { createViteConfig } from "../vite.config.js";

it("proxies API routes to the configured backend during Vite development", () => {
  const config = createViteConfig("http://api.test:4321");

  expect(config.server?.proxy?.["/api"]).toBe("http://api.test:4321");
});
