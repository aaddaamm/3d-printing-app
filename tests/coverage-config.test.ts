import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("declares explicit backend and frontend production coverage paths", () => {
  const config = readFileSync("vitest.config.ts", "utf8");

  expect(config).toContain('include: ["lib/**/*.ts", "frontend/lib/**/*.ts"]');
  expect(config).toContain("statements: 88");
  expect(config).toContain("branches: 76");
  expect(config).toContain("functions: 94");
  expect(config).toContain("lines: 92");
});
