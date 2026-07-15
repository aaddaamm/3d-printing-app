import "dotenv/config";
import { db } from "./lib/db.js";
import {
  addScanRoot,
  createCatalogStatements,
  deactivateScanRoot,
  listScanRoots,
  MAX_CATALOG_SCAN_ERRORS,
  scanCatalogRoot,
} from "./lib/catalog-scanner.js";

function usage(): string {
  return `Usage:
  npm run catalog -- roots add <path> [name]
  npm run catalog -- roots list
  npm run catalog -- roots remove <id>
  npm run catalog -- scan`;
}

function print(message: string): void {
  process.stdout.write(`${message}\n`);
}

function fail(message: string): never {
  process.stderr.write(`${message}\n\n${usage()}\n`);
  process.exit(1);
}

function formatRootStatus(isActive: number): string {
  return isActive === 1 ? "active" : "inactive";
}

async function main(): Promise<void> {
  const [command, subcommand, ...args] = process.argv.slice(2);
  const statements = createCatalogStatements(db);

  if (command === "roots" && subcommand === "add") {
    const [rootPath, name] = args;
    if (!rootPath) fail("Missing scan root path.");
    const root = addScanRoot(statements, { name: name ?? rootPath, rootPath });
    print(`Added scan root #${root.id} ${root.name}: ${root.root_path}`);
    return;
  }

  if (command === "roots" && subcommand === "list") {
    const roots = listScanRoots(statements);
    if (roots.length === 0) {
      print("No scan roots configured.");
      return;
    }
    for (const root of roots) {
      print(`#${root.id} ${root.name} [${formatRootStatus(root.is_active)}] ${root.root_path}`);
    }
    return;
  }

  if (command === "roots" && subcommand === "remove") {
    const [rawId] = args;
    const id = Number(rawId);
    if (!rawId || !Number.isInteger(id) || id <= 0) fail("Missing or invalid scan root id.");
    const root = deactivateScanRoot(statements, id);
    print(`Deactivated scan root #${root.id} ${root.name}`);
    return;
  }

  if (command === "scan" && !subcommand) {
    const roots = listScanRoots(statements).filter((root) => root.is_active === 1);
    const totals = {
      scanned: 0,
      added: 0,
      changed: 0,
      unchanged: 0,
      missing: 0,
      restored: 0,
      skipped: 0,
      failed: 0,
      incompleteRoots: 0,
      errors: [] as { phase: string; path: string; message: string }[],
      durationMs: 0,
    };

    for (const root of roots) {
      const summary = await scanCatalogRoot(statements, root);
      totals.scanned += summary.scanned;
      totals.added += summary.added;
      totals.changed += summary.changed;
      totals.unchanged += summary.unchanged;
      totals.missing += summary.missing;
      totals.restored += summary.restored;
      totals.skipped += summary.skipped;
      totals.failed += summary.failed;
      totals.incompleteRoots += summary.incompleteRoots;
      totals.errors.push(
        ...summary.errors.slice(0, MAX_CATALOG_SCAN_ERRORS - totals.errors.length),
      );
      totals.durationMs += summary.durationMs;
    }

    print(
      `Catalog scan complete: scanned: ${totals.scanned}, added: ${totals.added}, changed: ${totals.changed}, unchanged: ${totals.unchanged}, missing: ${totals.missing}, restored: ${totals.restored}, skipped: ${totals.skipped}, failed: ${totals.failed}, incompleteRoots: ${totals.incompleteRoots}, durationMs: ${totals.durationMs}`,
    );
    for (const error of totals.errors) {
      print(`  ${error.phase}: ${error.path} — ${error.message}`);
    }
    return;
  }

  fail("Unknown catalog command.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected catalog scan failure.";
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
