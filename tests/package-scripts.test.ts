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

  expect(scripts.sync).toBe("npx tsx sync-configured-providers.ts");
  expect(scripts["sync:bambu"]).toBe("npx tsx dump-bambu-history.ts");
  expect(scripts["sync:moonraker"]).toBe("npx tsx sync-moonraker-history.ts");
});
