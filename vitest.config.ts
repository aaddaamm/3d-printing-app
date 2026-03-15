import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/db.ts", "lib/fetch.ts", "lib/types.ts"], // require live DB/HTTP
      reporter: ["text", "html"],
    },
  },
});
