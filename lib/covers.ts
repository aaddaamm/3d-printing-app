import fs from "node:fs";
import path from "node:path";
import { db } from "./db.js";
import { fetchWithRetry, HttpError } from "./fetch.js";
import { logInfo } from "./logger.js";
import { providerNativeId } from "./provider-ids.js";

export const COVERS_DIR = path.resolve(process.env["BAMBU_COVERS_DIR"] ?? "./covers");

function ensureCoversDir(): string {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
  return COVERS_DIR;
}

const CACHE_SAFE_TASK_ID_RE = /^[A-Za-z0-9_-]+$/;
const ENCODED_COVER_KEY_PREFIX = "~";
const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;

function isCacheSafeTaskId(taskId: string): boolean {
  return CACHE_SAFE_TASK_ID_RE.test(taskId);
}

/**
 * Returns the filename and URL key for a task cover. Existing cache-safe IDs,
 * including Bambu's numeric task IDs, retain their original key. Provider-scoped
 * IDs containing separators use a prefixed base64url encoding instead.
 */
export function coverKeyForTaskId(taskId: string): string {
  if (!taskId) throw new Error("Task id is required for a cover path");
  if (isCacheSafeTaskId(taskId)) return taskId;
  return ENCODED_COVER_KEY_PREFIX + Buffer.from(taskId, "utf8").toString("base64url");
}

/**
 * Resolves a URL/file key to its task ID. Encoded keys must be canonical and
 * are reserved for task IDs that cannot already be used as cache-safe keys.
 */
export function taskIdFromCoverKey(coverKey: string): string | null {
  if (isCacheSafeTaskId(coverKey)) return coverKey;
  if (!coverKey.startsWith(ENCODED_COVER_KEY_PREFIX)) return null;

  const encodedTaskId = coverKey.slice(ENCODED_COVER_KEY_PREFIX.length);
  if (!BASE64URL_RE.test(encodedTaskId)) return null;

  const taskId = Buffer.from(encodedTaskId, "base64url").toString("utf8");
  if (
    !taskId ||
    isCacheSafeTaskId(taskId) ||
    ENCODED_COVER_KEY_PREFIX + Buffer.from(taskId, "utf8").toString("base64url") !== coverKey
  ) {
    return null;
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
  return assertInsideCoversDir(path.join(ensureCoversDir(), coverKeyForTaskId(taskId) + ".png"));
}

function legacyBambuCoverPath(taskId: string): string | null {
  if (!taskId.startsWith("bambu:")) return null;
  const nativeId = providerNativeId("bambu", taskId);
  return isCacheSafeTaskId(nativeId)
    ? assertInsideCoversDir(path.join(ensureCoversDir(), nativeId + ".png"))
    : null;
}

function existingLocalCoverPath(taskId: string): string | null {
  const currentPath = localCoverPath(taskId);
  if (fs.existsSync(currentPath)) return currentPath;
  const legacyPath = legacyBambuCoverPath(taskId);
  return legacyPath && fs.existsSync(legacyPath) ? legacyPath : null;
}

export function localCoverExists(taskId: string): boolean {
  if (!taskId) return false;
  return existingLocalCoverPath(taskId) !== null;
}

type CoverCacheStatus = "ready" | "downloaded" | "expired" | "failed" | "unavailable";

export interface CoverCacheResult {
  status: CoverCacheStatus;
  path: string | null;
}

function assertRegularCoverFile(filePath: string): void {
  const stat = fs.lstatSync(filePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Refusing non-regular cover file path: ${filePath}`);
  }
}

async function downloadCoverToFile(url: string, dest: string): Promise<void> {
  const resp = await fetchWithRetry(url, {}, { retries: 2, timeoutMs: 5000 });
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

export async function ensureLocalCoverCached(taskId: string): Promise<CoverCacheResult> {
  if (!taskId) return { status: "unavailable", path: null };

  const dest = localCoverPath(taskId);
  const task = db
    .prepare<[string], { cover: string | null; thumbnail: string | null }>(
      "SELECT cover, thumbnail FROM print_tasks WHERE id = ?",
    )
    .get(taskId);
  if (!task) return { status: "unavailable", path: null };

  const existingPath = existingLocalCoverPath(taskId);
  if (existingPath) {
    assertRegularCoverFile(existingPath);
    return { status: "ready", path: existingPath };
  }

  const mediaUrl = task.cover ?? task.thumbnail;
  if (!mediaUrl) return { status: "unavailable", path: null };

  try {
    await downloadCoverToFile(mediaUrl, dest);
    return { status: "downloaded", path: dest };
  } catch (e) {
    if (e instanceof HttpError && e.status === 403) return { status: "expired", path: null };
    return { status: "failed", path: null };
  }
}

/**
 * Downloads cover images for all tasks that have a cover or thumbnail URL but no local file.
 * Covers are preferred to thumbnails. Idempotent — skips already-downloaded files.
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
    .prepare<[], { id: string; media_url: string }>(
      `SELECT id, COALESCE(cover, thumbnail) AS media_url
       FROM print_tasks
       WHERE id <> ''
         AND (cover IS NOT NULL OR thumbnail IS NOT NULL)`,
    )
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
    const taskId = task.id;
    const dest = localCoverPath(taskId);
    const existingPath = existingLocalCoverPath(taskId);
    if (existingPath) {
      assertRegularCoverFile(existingPath);
      skipped++;
    } else {
      try {
        await downloadCoverToFile(task.media_url, dest);
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
