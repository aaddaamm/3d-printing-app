import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logInfo } from "../lib/logger.js";
import { createRequestLogger } from "../lib/server/middleware.js";

vi.mock("../lib/colors.js", () => ({
  cyan: String,
  dim: String,
  green: String,
  red: String,
  yellow: String,
}));

vi.mock("../lib/logger.js", () => ({ logInfo: vi.fn() }));

function createApp(enabled = true): Hono {
  const app = new Hono();
  app.use("*", createRequestLogger(enabled));
  app.get("/ok", (c) => c.text("ok"));
  app.post("/created", (c) => c.text("created", 201));
  app.put("/redirect", (c) => c.redirect("/ok"));
  app.patch("/invalid", (c) => c.text("invalid", 422));
  app.delete("/failed", (c) => c.text("failed", 500));
  app.options("/other", (c) => c.text("other"));
  return app;
}

describe("request logger middleware", () => {
  beforeEach(() => {
    vi.mocked(logInfo).mockReset();
    vi.spyOn(Date, "now").mockReturnValue(100);
  });

  it("bypasses timing and logging when disabled", async () => {
    const response = await createApp(false).request("/ok");

    expect(response.status).toBe(200);
    expect(logInfo).not.toHaveBeenCalled();
  });

  it.each([
    ["GET", "/ok", 200],
    ["POST", "/created", 201],
    ["PUT", "/redirect", 302],
    ["PATCH", "/invalid", 422],
    ["DELETE", "/failed", 500],
    ["OPTIONS", "/other", 200],
  ])(
    "logs %s responses with method, path, status, and elapsed time",
    async (method, path, status) => {
      const response = await createApp().request(path, { method });

      expect(response.status).toBe(status);
      expect(logInfo).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`${method}\\s+${path} → ${status} 0ms$`)),
      );
    },
  );
});
