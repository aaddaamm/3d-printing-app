import type Database from "better-sqlite3";
import type { Job, Project } from "../types.js";

export function createProjectStatements(db: Database.Database) {
  return {
    listProjects: db.prepare<
      [],
      Project & {
        job_count: number;
        total_plates: number | null;
        total_weight_g: number | null;
        total_time_s: number | null;
        latest_cover_task_id: string | null;
        latest_cover_provider: string | null;
        latest_cover_provider_printer_id: string | null;
        latest_cover_title: string | null;
        latest_cover: string | null;
        latest_cover_thumbnail: string | null;
      }
    >(`
      SELECT p.*,
        COUNT(j.id)           AS job_count,
        SUM(j.plate_count)    AS total_plates,
        SUM(j.total_weight_g) AS total_weight_g,
        SUM(j.total_time_s)   AS total_time_s,
        (SELECT pt.id FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_task_id,
        (SELECT pt.provider FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_provider,
        (SELECT pt.provider_printer_id FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_provider_printer_id,
        (SELECT pt.title FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_title,
        (SELECT pt.cover FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover,
        (SELECT pt.thumbnail FROM print_tasks pt
         WHERE pt.session_id = (
           SELECT j2.session_id FROM jobs j2
           WHERE j2.project_id = p.id
           ORDER BY j2.startTime DESC LIMIT 1
         )
         ORDER BY pt.plateIndex LIMIT 1) AS latest_cover_thumbnail
      FROM projects p
      LEFT JOIN jobs j ON j.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `),

    getProjectById: db.prepare<[number], Project>("SELECT * FROM projects WHERE id = ?"),

    createProject: db.prepare<Omit<Project, "id">>(`
      INSERT INTO projects (name, customer, notes, created_at)
      VALUES (@name, @customer, @notes, @created_at)
    `),

    patchProject: db.prepare<Pick<Project, "name" | "customer" | "notes" | "id">>(`
      UPDATE projects SET name=@name, customer=@customer, notes=@notes WHERE id=@id
    `),

    deleteProject: db.prepare<[number]>("DELETE FROM projects WHERE id = ?"),

    unassignProjectJobs: db.prepare<[number]>(
      "UPDATE jobs SET project_id = NULL WHERE project_id = ?",
    ),

    getProjectJobs: db.prepare<[number], Job>(
      "SELECT * FROM jobs WHERE project_id = ? ORDER BY startTime DESC",
    ),
  };
}
