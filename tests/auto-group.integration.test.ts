import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type DbModule = typeof import("../lib/db.js");
type AutoGroupModule = typeof import("../lib/auto-group.js");

let tempDir = "";
let dbPath = "";
let dbModule: DbModule | null = null;
let autoGroupModule: AutoGroupModule | null = null;

function cleanupSqliteFiles(basePath: string): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = `${basePath}${suffix}`;
    if (fs.existsSync(target)) fs.rmSync(target, { force: true });
  }
}

async function loadFreshModules() {
  vi.resetModules();
  process.env.BAMBU_DB = dbPath;
  dbModule = await import("../lib/db.js");
  autoGroupModule = await import("../lib/auto-group.js");
}

describe.sequential("autoGroupProjects (DB integration)", () => {
  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auto-group-int-"));
    dbPath = path.join(tempDir, "test.sqlite");
    await loadFreshModules();
  });

  afterEach(() => {
    dbModule?.db.close();
    cleanupSqliteFiles(dbPath);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BAMBU_DB;
    dbModule = null;
    autoGroupModule = null;
  });

  it("groups mixed title patterns and ignores null titles", () => {
    const db = dbModule!.db;
    const autoGroupProjects = autoGroupModule!.autoGroupProjects;

    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s1", "0", null, "2026-01-01T00:00:00.000Z");
    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s2", "", null, "2026-01-01T00:01:00.000Z");
    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s3", null, null, "2026-01-01T00:02:00.000Z");

    const insertTask = db.prepare(
      "INSERT INTO print_tasks (id, session_id, title, raw_json) VALUES (?, ?, ?, ?)",
    );
    insertTask.run("t1", "s1", "Gerbil Cage_plate_1", "{}");
    insertTask.run("t2", "s2", "Gerbil Cage_Leg Lower - Right", "{}");
    insertTask.run("t3", "s3", null, "{}");

    const result = autoGroupProjects();
    expect(result).toEqual({ created: 1, assigned: 2 });

    const project = db
      .prepare("SELECT id, name, source_design_id FROM projects WHERE source_design_id = ?")
      .get("title:Gerbil Cage") as { id: number; name: string; source_design_id: string };
    expect(project.name).toBe("Gerbil Cage");

    const jobs = db
      .prepare("SELECT session_id, project_id FROM jobs ORDER BY session_id")
      .all() as Array<{ session_id: string; project_id: number | null }>;
    expect(jobs).toEqual([
      { session_id: "s1", project_id: project.id },
      { session_id: "s2", project_id: project.id },
      { session_id: "s3", project_id: null },
    ]);
  });

  it("adopts a manual project for title-based grouping", () => {
    const db = dbModule!.db;
    const autoGroupProjects = autoGroupModule!.autoGroupProjects;

    const { lastInsertRowid } = db
      .prepare("INSERT INTO projects (name, created_at, source_design_id) VALUES (?, ?, ?)")
      .run("Widget", "2026-01-01T00:00:00.000Z", null);
    const manualProjectId = Number(lastInsertRowid);

    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s10", "0", null, "2026-01-01T00:10:00.000Z");
    db.prepare("INSERT INTO print_tasks (id, session_id, title, raw_json) VALUES (?, ?, ?, ?)").run(
      "t10",
      "s10",
      "Widget_plate_1",
      "{}",
    );

    const result = autoGroupProjects();
    expect(result).toEqual({ created: 0, assigned: 1 });

    const adopted = db
      .prepare("SELECT id, source_design_id FROM projects WHERE id = ?")
      .get(manualProjectId) as { id: number; source_design_id: string | null };
    expect(adopted.source_design_id).toBe("title:Widget");

    const job = db.prepare("SELECT project_id FROM jobs WHERE session_id = ?").get("s10") as {
      project_id: number | null;
    };
    expect(job.project_id).toBe(manualProjectId);
  });

  it("uses all plate titles for a job to choose the correct base", () => {
    const db = dbModule!.db;
    const autoGroupProjects = autoGroupModule!.autoGroupProjects;

    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s20", "0", null, "2026-01-01T00:20:00.000Z");
    db.prepare(
      "INSERT INTO jobs (session_id, designId, designTitle, startTime, print_run) VALUES (?, ?, ?, ?, 1)",
    ).run("s21", "0", null, "2026-01-01T00:21:00.000Z");

    const insertTask = db.prepare(
      "INSERT INTO print_tasks (id, session_id, title, raw_json) VALUES (?, ?, ?, ?)",
    );
    insertTask.run("t20a", "s20", "My_Project_Custom_Name", "{}");
    insertTask.run("t20b", "s20", "My_Project_plate_1", "{}");
    insertTask.run("t21", "s21", "My_Project_plate_2", "{}");

    const result = autoGroupProjects();
    expect(result).toEqual({ created: 1, assigned: 2 });

    const project = db
      .prepare("SELECT id, source_design_id FROM projects WHERE source_design_id = ?")
      .get("title:My_Project") as { id: number; source_design_id: string };

    const jobAssignments = db
      .prepare("SELECT session_id, project_id FROM jobs ORDER BY session_id")
      .all() as Array<{ session_id: string; project_id: number | null }>;
    expect(jobAssignments).toEqual([
      { session_id: "s20", project_id: project.id },
      { session_id: "s21", project_id: project.id },
    ]);
  });
});
