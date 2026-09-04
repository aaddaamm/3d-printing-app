import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

type PackageJson = {
  scripts: Record<string, string>;
};

function readPackageJson(): PackageJson {
  try {
    return JSON.parse(readFileSync("package.json", "utf8")) as PackageJson;
  } catch (error) {
    throw new Error("Unable to parse package.json", { cause: error });
  }
}

it("runs all configured provider sync jobs from npm run sync", () => {
  const { scripts } = readPackageJson();

  expect(scripts.sync).toBe("npx tsx scripts/sync-configured-providers.ts");
  expect(scripts["sync:bambu"]).toBe("npx tsx scripts/sync-bambu-history.ts");
  expect(scripts["sync:moonraker"]).toBe("npx tsx scripts/sync-moonraker-history.ts");
});

it("exposes the catalog scanner CLI", () => {
  const { scripts } = readPackageJson();

  expect(scripts.catalog).toBe("npx tsx scripts/scan-catalog.ts");
});
