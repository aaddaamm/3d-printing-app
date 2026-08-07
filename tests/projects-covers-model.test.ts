import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type ProjectsModule = typeof import("../models/projects-crud.js");
type CoversModule = typeof import("../lib/covers.js");

let tempDir = "";
let dbPath = "";
let coversDir = "";
let dbModule: DbModule | null = null;
let projectsModule: ProjectsModule | null = null;
let coversModule: CoversModule | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshModules(): Promise<void> {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  process.env.BAMBU_COVERS_DIR = coversDir;
  dbModule = await import("../lib/db.js");
  coversModule = await import("../lib/covers.js");
  projectsModule = await import("../models/projects-crud.js");
}

function createProject(name: string): number {
  const result = dbModule!.db
    .prepare("INSERT INTO projects (name, created_at) VALUES (?, ?)")
    .run(name, "2026-01-01T00:00:00.000Z");
  return Number(result.lastInsertRowid);
}

function createJob(sessionId: string, projectId: number | null): void {
  dbModule!.db
    .prepare("INSERT INTO jobs (session_id, project_id, plate_count) VALUES (?, ?, ?)")
    .run(sessionId, projectId, 1);
}

function createTask({
  id,
  sessionId,
  endTime,
  status = "finish",
  cover = null,
}: {
  id: string;
  sessionId: string;
  endTime: string | null;
  status?: string;
  cover?: string | null;
}): void {
  dbModule!.db
    .prepare(
      `INSERT INTO print_tasks (id, session_id, endTime, status, cover, raw_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(id, sessionId, endTime, status, cover, "{}");
}

function cacheCover(taskId: string): void {
  fs.writeFileSync(coversModule!.localCoverPath(taskId), "cover");
}

function projectCoverUrl(projectId: number): string | null | undefined {
  return projectsModule!.listProjects().find((project) => project.id === projectId)?.cover_url;
}

describe.sequential("listProjects cover URLs", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "projects-covers-"));
    dbPath = path.join(tempDir, "test.sqlite");
    coversDir = path.join(tempDir, "covers");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    delete process.env.BAMBU_COVERS_DIR;
    dbModule = null;
    projectsModule = null;
    coversModule = null;
  });

  it("selects the newest cached cover across assigned job sessions and excludes unrelated tasks", () => {
    const projectId = createProject("Project");
    const otherProjectId = createProject("Other");
    createJob("older-session", projectId);
    createJob("newer-session", projectId);
    createJob("unrelated-session", otherProjectId);
    createTask({
      id: "older",
      sessionId: "older-session",
      endTime: "2026-01-02T12:00:00.000Z",
      status: "failed",
    });
    createTask({
      id: "newest",
      sessionId: "newer-session",
      endTime: "2026-01-03T12:00:00.000Z",
      status: "cancelled",
    });
    createTask({
      id: "unrelated",
      sessionId: "unrelated-session",
      endTime: "2026-02-01T12:00:00.000Z",
    });
    createTask({
      id: "orphan",
      sessionId: "orphan-session",
      endTime: "2026-03-01T12:00:00.000Z",
    });
    cacheCover("older");
    cacheCover("newest");
    cacheCover("unrelated");
    cacheCover("orphan");

    expect(projectCoverUrl(projectId)).toBe("/ui/covers/newest");
  });

  it("sorts newer near-parseable non-ISO timestamps after valid values, then task IDs by BINARY order", () => {
    const projectId = createProject("Project");
    createJob("session", projectId);
    createTask({ id: "z_task", sessionId: "session", endTime: "2026-01-03T12:00:00.000Z" });
    createTask({ id: "A_task", sessionId: "session", endTime: "2026-01-03T12:00:00.000Z" });
    createTask({ id: "invalid-calendar", sessionId: "session", endTime: "2026-02-30T12:00:00Z" });
    createTask({ id: "non-iso-double-t", sessionId: "session", endTime: "2026-02-01TT12:00:00Z" });
    createTask({
      id: "non-iso-space-after-t",
      sessionId: "session",
      endTime: "2026-03-01T 12:00:00Z",
    });
    createTask({
      id: "non-iso-vertical-tab",
      sessionId: "session",
      endTime: "2026-04-01T12:00:00.000Z\v",
    });
    createTask({
      id: "non-iso-nul",
      sessionId: "session",
      endTime: "2026-05-01T12:00:00.000Z\0",
    });
    createTask({
      id: "non-iso-date-only-nul",
      sessionId: "session",
      endTime: "2026-06-01\0",
    });
    createTask({ id: "null-time", sessionId: "session", endTime: null });
    createTask({ id: "empty-time", sessionId: "session", endTime: "" });
    createTask({ id: "malformed-time", sessionId: "session", endTime: "definitely-not-a-date" });
    cacheCover("z_task");
    cacheCover("A_task");
    cacheCover("invalid-calendar");
    cacheCover("non-iso-double-t");
    cacheCover("non-iso-space-after-t");
    cacheCover("non-iso-vertical-tab");
    cacheCover("non-iso-nul");
    cacheCover("non-iso-date-only-nul");
    cacheCover("null-time");
    cacheCover("empty-time");
    cacheCover("malformed-time");

    expect(projectCoverUrl(projectId)).toBe("/ui/covers/A_task");
  });

  it("orders valid fractional seconds beyond SQLite millisecond precision", () => {
    const projectId = createProject("Project");
    createJob("fraction-session", projectId);
    createTask({
      id: "a_older",
      sessionId: "fraction-session",
      endTime: "2026-01-03T12:00:00.0001Z",
    });
    createTask({
      id: "z_newer",
      sessionId: "fraction-session",
      endTime: "2026-01-03T12:00:00.0004Z",
    });
    cacheCover("a_older");
    cacheCover("z_newer");

    expect(projectCoverUrl(projectId)).toBe("/ui/covers/z_newer");
  });

  it("selects a cached Moonraker cover through its safe cover key", () => {
    const projectId = createProject("Moonraker Project");
    createJob("moonraker-session", projectId);
    createTask({
      id: "moonraker:000001",
      sessionId: "moonraker-session",
      endTime: "2026-01-04T12:00:00.000Z",
    });
    cacheCover("moonraker:000001");

    expect(projectCoverUrl(projectId)).toBe("/ui/covers/~bW9vbnJha2VyOjAwMDAwMQ");
  });

  it("returns null rather than a provider-media URL when no matching task has a local cover", () => {
    const projectId = createProject("Project");
    createJob("session", projectId);
    createTask({
      id: "remote-only",
      sessionId: "session",
      endTime: "2026-01-03T12:00:00.000Z",
      cover: "https://provider.example/cover.png",
    });

    expect(projectCoverUrl(projectId)).toBeNull();
  });

  it("updates the selected cover after job assignment, unassignment, and reassignment", () => {
    const firstProjectId = createProject("First");
    const secondProjectId = createProject("Second");
    createJob("session", firstProjectId);
    createTask({ id: "task_1", sessionId: "session", endTime: "2026-01-03T12:00:00.000Z" });
    cacheCover("task_1");

    expect(projectCoverUrl(firstProjectId)).toBe("/ui/covers/task_1");

    dbModule!.db.prepare("UPDATE jobs SET project_id = NULL WHERE session_id = ?").run("session");
    expect(projectCoverUrl(firstProjectId)).toBeNull();

    dbModule!.db
      .prepare("UPDATE jobs SET project_id = ? WHERE session_id = ?")
      .run(secondProjectId, "session");
    expect(projectCoverUrl(firstProjectId)).toBeNull();
    expect(projectCoverUrl(secondProjectId)).toBe("/ui/covers/task_1");
  });
});
