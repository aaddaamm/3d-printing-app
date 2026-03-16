import fs from "node:fs";
import path from "node:path";
import { db } from "./db.js";
import { fetchWithRetry } from "./fetch.js";

export const COVERS_DIR = path.resolve(
  process.env["BAMBU_COVERS_DIR"] ?? "./covers",
);

export function localCoverPath(taskId: string): string {
  return path.join(COVERS_DIR, `${taskId}.png`);
}

export function localCoverExists(taskId: string): boolean {
  return fs.existsSync(localCoverPath(taskId));
}

/**
 * Downloads cover images for all tasks that have a cover URL but no local file.
 * Idempotent — skips already-downloaded files.
 * Prints inline progress to stdout.
 */
export async function downloadCovers(): Promise<{ downloaded: number; skipped: number; expired: number; failed: number }> {
  fs.mkdirSync(COVERS_DIR, { recursive: true });

  const tasks = db
    .prepare<[], { id: string; cover: string }>(
      "SELECT id, cover FROM print_tasks WHERE cover IS NOT NULL",
    )
    .all();

  const total = tasks.length;
  let downloaded = 0;
  let skipped = 0;
  let expired = 0;  // HTTP 403 — pre-signed URL expired (task older than fetch window)
  let failed = 0;   // other HTTP errors or network failures

  const printProgress = () => {
    const done = downloaded + skipped + expired + failed;
    const parts = [`${done}/${total}`];
    if (downloaded > 0) parts.push(`${downloaded} new`);
    if (expired > 0) parts.push(`${expired} expired`);
    if (failed > 0) parts.push(`${failed} failed`);
    process.stdout.write(`\r  Covers: ${parts.join(", ")}   `);
  };

  printProgress();

  for (const task of tasks) {
    const dest = localCoverPath(task.id);
    if (fs.existsSync(dest)) {
      skipped++;
    } else {
      try {
        const resp = await fetchWithRetry(task.cover, {}, { retries: 2, timeoutMs: 5000 });
        const buf = await resp.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(buf));
        downloaded++;
      } catch (e) {
        if (e instanceof Error && /^HTTP 403\b/.test(e.message)) expired++;
        else failed++;
      }
    }
    printProgress();
  }

  process.stdout.write("\n");
  if (expired > 0) {
    console.log(`  Note: ${expired} URLs expired (tasks older than API fetch window — unavailable).`);
  }
  return { downloaded, skipped, expired, failed };
}
