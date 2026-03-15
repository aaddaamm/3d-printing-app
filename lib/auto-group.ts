import { db } from "./db.js";

// ── autoGroupProjects ─────────────────────────────────────────────────────────
//
// After each normalize pass, assigns unassigned jobs to projects based on
// designId. One project is auto-created per distinct designId the first time
// it is seen (named after designTitle, falling back to designId).
//
// Override safety: only jobs with project_id IS NULL are touched. Any job
// that was manually assigned to a project (via PATCH /jobs/:id) keeps its
// assignment forever — upsertJob never writes project_id, so re-syncs cannot
// overwrite it either.

const findDesigns = db.prepare<[], { designId: string; designTitle: string | null }>(`
  SELECT DISTINCT designId, designTitle
  FROM jobs
  WHERE project_id IS NULL AND designId IS NOT NULL
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

export function autoGroupProjects(): { created: number; assigned: number } {
  const designs = findDesigns.all();
  if (designs.length === 0) return { created: 0, assigned: 0 };

  let created = 0;
  let assigned = 0;
  const now = new Date().toISOString();

  db.transaction(() => {
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
  })();

  return { created, assigned };
}
