import fs from "node:fs";
import path from "node:path";
import { db } from "./db.js";
import { fetchWithRetry, HttpError } from "./fetch.js";
import { logInfo } from "./logger.js";

export const COVERS_DIR = path.resolve(process.env["BAMBU_COVERS_DIR"] ?? "./covers");

function ensureCoversDir(): string {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  return COVERS_DIR;
}

function isSafeTaskId(taskId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(taskId);
}

function sanitizeTaskId(taskId: string): string {
  if (!isSafeTaskId(taskId)) {
    throw new Error(`Invalid task id for cover path: ${taskId}`);
  }
  return taskId;
}

function assertInsideCoversDir(candidate: string): string {
  const root = ensureCoversDir();
  const resolved = path.resolve(candidate);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`Refusing path outside covers dir: ${resolved}`);
  }
  return resolved;
}

export function localCoverPath(taskId: string): string {
  const safeTaskId = sanitizeTaskId(taskId);
  return assertInsideCoversDir(path.join(ensureCoversDir(), safeTaskId + ".png"));
}

export function localCoverExists(taskId: string): boolean {
  if (!isSafeTaskId(taskId)) return false;
  return fs.existsSync(localCoverPath(taskId));
}

/**
 * Downloads cover images for all tasks that have a cover URL but no local file.
 * Idempotent — skips already-downloaded files.
 * Prints inline progress to stdout.
 */
export async function downloadCovers(): Promise<{
  downloaded: number;
  skipped: number;
  expired: number;
  failed: number;
}> {
  ensureCoversDir();

  const tasks = db
    .prepare<
      [],
      { id: string; cover: string }
    >("SELECT id, cover FROM print_tasks WHERE cover IS NOT NULL")
    .all();

  const total = tasks.length;
  let downloaded = 0;
  let skipped = 0;
  let expired = 0; // HTTP 403 — pre-signed URL expired (task older than fetch window)
  let failed = 0; // other HTTP errors or network failures

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
    const taskId = sanitizeTaskId(task.id);
    const dest = localCoverPath(taskId);
    if (fs.existsSync(dest)) {
      const stat = fs.lstatSync(dest);
      if (!stat.isFile() || stat.isSymbolicLink()) {
        throw new Error(`Refusing non-regular cover file path: ${dest}`);
      }
      skipped++;
    } else {
      try {
        const resp = await fetchWithRetry(task.cover, {}, { retries: 2, timeoutMs: 5000 });
        const buf = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(dest, buf);
        downloaded++;
      } catch (e) {
        if (e instanceof HttpError && e.status === 403) expired++;
        else failed++;
      }
    }
    printProgress();
  }

  process.stdout.write("\n");
  if (expired > 0) {
    logInfo(`  Note: ${expired} URLs expired (tasks older than API fetch window — unavailable).`);
  }
  return { downloaded, skipped, expired, failed };
}
