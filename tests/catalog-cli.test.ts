import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let tempDir = "";
let dbPath = "";
let rootDir = "";

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

function runCatalogCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync("npx", ["tsx", "scan-catalog.ts", ...args], {
    cwd: process.cwd(),
    env: { ...process.env, BAMBU_DB: dbPath },
    encoding: "utf8",
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("scan-catalog CLI", () => {
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-cli-"));
    dbPath = path.join(tempDir, "catalog.sqlite");
    rootDir = path.join(tempDir, "models");
    fs.mkdirSync(rootDir);
  });

  afterEach(() => {
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects unknown commands with usage", () => {
    const result = runCatalogCli(["wat"]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Usage:");
  });

  it("adds, lists, and removes scan roots", () => {
    const add = runCatalogCli(["roots", "add", rootDir, "Models"]);
    expect(add.status).toBe(0);
    expect(add.stdout).toContain("Added scan root #1");
    expect(add.stdout).toContain("Models");

    const list = runCatalogCli(["roots", "list"]);
    expect(list.status).toBe(0);
    expect(list.stdout).toContain("#1");
    expect(list.stdout).toContain("Models");
    expect(list.stdout).toContain(path.resolve(rootDir));

    const remove = runCatalogCli(["roots", "remove", "1"]);
    expect(remove.status).toBe(0);
    expect(remove.stdout).toContain("Deactivated scan root #1");

    const afterRemove = runCatalogCli(["roots", "list"]);
    expect(afterRemove.stdout).toContain("inactive");
  });

  it("scans active roots and prints concise summary counts", () => {
    fs.writeFileSync(path.join(rootDir, "dragon.stl"), "dragon");
    fs.writeFileSync(path.join(rootDir, "notes.txt"), "ignore me");
    expect(runCatalogCli(["roots", "add", rootDir, "Models"]).status).toBe(0);

    const scan = runCatalogCli(["scan"]);

    expect(scan.status).toBe(0);
    expect(scan.stdout).toContain("Catalog scan complete");
    expect(scan.stdout).toContain("scanned: 1");
    expect(scan.stdout).toContain("added: 1");
    expect(scan.stdout).toContain("failed: 0");
  });
});
