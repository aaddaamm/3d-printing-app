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
        product_id: number | null;
      }
    >(`
      SELECT p.*,
        COUNT(j.id)           AS job_count,
        SUM(j.plate_count)    AS total_plates,
        SUM(j.total_weight_g) AS total_weight_g,
        SUM(j.total_time_s)   AS total_time_s,
        (SELECT pp.product_id FROM project_products pp
         WHERE pp.project_id = p.id
         ORDER BY pp.created_at, pp.product_id LIMIT 1) AS product_id
      FROM projects p
      LEFT JOIN jobs j ON j.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `),

    listProjectCoverTasks: db.prepare<[], { project_id: number; task_id: string }>(`
      SELECT j.project_id, pt.id AS task_id
      FROM jobs j
      INNER JOIN print_tasks pt ON pt.session_id = j.session_id
      WHERE j.project_id IS NOT NULL
      ORDER BY j.project_id,
        CASE
          WHEN pt.endTime IS NOT NULL
            AND trim(pt.endTime) <> ''
            AND trim(pt.endTime) = pt.endTime
            AND (length(pt.endTime) = 10 OR substr(pt.endTime, 11, 1) = 'T')
            AND strftime('%s', pt.endTime) IS NOT NULL
            AND substr(pt.endTime, 1, 10) = date(julianday(substr(pt.endTime, 1, 10)))
          THEN 0
          ELSE 1
        END,
        CASE
          WHEN pt.endTime IS NOT NULL
            AND trim(pt.endTime) <> ''
            AND trim(pt.endTime) = pt.endTime
            AND (length(pt.endTime) = 10 OR substr(pt.endTime, 11, 1) = 'T')
            AND strftime('%s', pt.endTime) IS NOT NULL
            AND substr(pt.endTime, 1, 10) = date(julianday(substr(pt.endTime, 1, 10)))
          THEN julianday(pt.endTime)
        END DESC,
        pt.id COLLATE BINARY ASC
    `),

    getProjectById: db.prepare<[number], Project & { product_id: number | null }>(`
      SELECT p.*,
        (SELECT pp.product_id FROM project_products pp
         WHERE pp.project_id = p.id
         ORDER BY pp.created_at, pp.product_id LIMIT 1) AS product_id
      FROM projects p
      WHERE p.id = ?
    `),

    createProject: db.prepare<Omit<Project, "id">>(`
      INSERT INTO projects (name, customer, notes, created_at)
      VALUES (@name, @customer, @notes, @created_at)
    `),

    patchProject: db.prepare<Pick<Project, "name" | "customer" | "notes" | "id">>(`
      UPDATE projects SET name=@name, customer=@customer, notes=@notes WHERE id=@id
    `),

    deleteProject: db.prepare<[number]>("DELETE FROM projects WHERE id = ?"),

    deleteEmptyProject: db.prepare<[number, number]>(`
      DELETE FROM projects
      WHERE id = ?
        AND NOT EXISTS (SELECT 1 FROM jobs WHERE project_id = ?)
    `),

    unassignProjectJobs: db.prepare<[number]>(
      "UPDATE jobs SET project_id = NULL WHERE project_id = ?",
    ),

    getProjectJobs: db.prepare<[number], Job>(
      "SELECT * FROM jobs WHERE project_id = ? ORDER BY startTime DESC",
    ),
  };
}
