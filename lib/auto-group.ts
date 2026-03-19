import { db } from "./db.js";

// ── autoGroupProjects ─────────────────────────────────────────────────────────
//
// After each normalize pass, assigns unassigned jobs to projects based on
// designId. One project is auto-created per distinct designId the first time
// it is seen (named after designTitle, falling back to designId).
//
// For user-imported models (designId is "0" or empty), falls back to grouping
// by title prefix. Bambu Studio names tasks as "{project}_{plate}" — we strip
// the "_plate_N" suffix and group by the base name.
//
// Override safety: only jobs with project_id IS NULL are touched. Any job
// that was manually assigned to a project (via PATCH /jobs/:id) keeps its
// assignment forever — upsertJob never writes project_id, so re-syncs cannot
// overwrite it either.

// ── MakerWorld designs (have a real designId) ─────────────────────────────────

const findDesigns = db.prepare<[], { designId: string; designTitle: string | null }>(`
  SELECT DISTINCT designId, designTitle
  FROM jobs
  WHERE project_id IS NULL AND designId IS NOT NULL AND designId != '0' AND designId != ''
`);

const findAutoProject = db.prepare<[string], { id: number }>(`
  SELECT id FROM projects WHERE source_design_id = ?
`);

const insertAutoProject = db.prepare<{ name: string; source_design_id: string; created_at: string }>(`
  INSERT INTO projects (name, source_design_id, created_at)
  VALUES (@name, @source_design_id, @created_at)
`);

const assignJobs = db.prepare<[number, string]>(`
  UPDATE jobs SET project_id = ? WHERE designId = ? AND project_id IS NULL
`);

// ── User-imported models (designId is "0"/empty/null → group by title prefix) ─

const findUserTitleGroups = db.prepare<[], { base_title: string; job_ids: string }>(`
  SELECT base_title, GROUP_CONCAT(j.id) AS job_ids
  FROM (
    SELECT j.id,
      CASE
        WHEN pt.title LIKE '%/_plate/_%' ESCAPE '/'
          THEN SUBSTR(pt.title, 1, INSTR(pt.title, '_plate_') - 1)
        ELSE pt.title
      END AS base_title
    FROM jobs j
    JOIN print_tasks pt ON pt.session_id = j.session_id AND pt.plateIndex = (
      SELECT MIN(pt2.plateIndex) FROM print_tasks pt2 WHERE pt2.session_id = j.session_id
    )
    WHERE j.project_id IS NULL
      AND (j.designId IS NULL OR j.designId = '0' OR j.designId = '')
  ) sub
  JOIN jobs j ON j.id = sub.id
  WHERE base_title IS NOT NULL AND base_title != ''
  GROUP BY base_title
`);

export function autoGroupProjects(): { created: number; assigned: number } {
  let created = 0;
  let assigned = 0;
  const now = new Date().toISOString();

  db.transaction(() => {
    // 1. Group MakerWorld designs by designId
    const designs = findDesigns.all();
    for (const { designId, designTitle } of designs) {
      let project = findAutoProject.get(designId);

      if (!project) {
        const { lastInsertRowid } = insertAutoProject.run({
          name: designTitle ?? designId,
          source_design_id: designId,
          created_at: now,
        });
        project = { id: Number(lastInsertRowid) };
        created++;
      }

      const { changes } = assignJobs.run(project.id, designId);
      assigned += changes;
    }

    // 2. Group user-imported models by title prefix
    const titleGroups = findUserTitleGroups.all();
    for (const { base_title, job_ids } of titleGroups) {
      const sourceKey = `title:${base_title}`;
      let project = findAutoProject.get(sourceKey);

      if (!project) {
        const { lastInsertRowid } = insertAutoProject.run({
          name: base_title,
          source_design_id: sourceKey,
          created_at: now,
        });
        project = { id: Number(lastInsertRowid) };
        created++;
      }

      const ids = job_ids.split(",").map(Number);
      const placeholders = ids.map(() => "?").join(",");
      const { changes } = db
        .prepare(`UPDATE jobs SET project_id = ? WHERE id IN (${placeholders}) AND project_id IS NULL`)
        .run(project.id, ...ids);
      assigned += changes;
    }
  })();

  return { created, assigned };
}
