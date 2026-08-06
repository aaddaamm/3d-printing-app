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
      WITH project_cover_tasks AS (
        SELECT j.project_id, pt.id AS task_id, pt.endTime,
          CASE
            WHEN pt.endTime IS NOT NULL
              AND (
                (length(pt.endTime) = 10
                  AND pt.endTime GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')
                OR (
                  pt.endTime GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]*'
                  AND pt.endTime NOT GLOB '*[^0-9TZ+:.-]*'
                  AND instr(pt.endTime, char(0)) = 0
                )
              )
              AND strftime('%s', pt.endTime) IS NOT NULL
              AND substr(pt.endTime, 1, 10) = date(julianday(substr(pt.endTime, 1, 10)))
            THEN 1
            ELSE 0
          END AS has_valid_end_time
        FROM jobs j
        INNER JOIN print_tasks pt ON pt.session_id = j.session_id
        WHERE j.project_id IS NOT NULL
      ),
      project_cover_times AS (
        SELECT project_id, task_id, endTime, has_valid_end_time,
          CASE
            WHEN has_valid_end_time = 1 THEN CAST(strftime('%s', endTime) AS INTEGER)
          END AS end_time_s,
          CASE
            WHEN has_valid_end_time = 1 AND instr(endTime, '.') > 0
            THEN substr(endTime, instr(endTime, '.') + 1)
            ELSE ''
          END AS fractional_tail
        FROM project_cover_tasks
      ),
      project_cover_ordering AS (
        SELECT project_id, task_id, has_valid_end_time, end_time_s,
          rtrim(
            CASE
              WHEN instr(fractional_tail, 'Z') > 0
              THEN substr(fractional_tail, 1, instr(fractional_tail, 'Z') - 1)
              WHEN instr(fractional_tail, '+') > 0
              THEN substr(fractional_tail, 1, instr(fractional_tail, '+') - 1)
              WHEN instr(fractional_tail, '-') > 0
              THEN substr(fractional_tail, 1, instr(fractional_tail, '-') - 1)
              ELSE fractional_tail
            END,
            '0'
          ) AS fractional_seconds
        FROM project_cover_times
      )
      SELECT project_id, task_id
      FROM project_cover_ordering
      ORDER BY project_id,
        has_valid_end_time DESC,
        end_time_s DESC,
        fractional_seconds COLLATE BINARY DESC,
        task_id COLLATE BINARY ASC
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
