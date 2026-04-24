import { db } from "./db.js";

// ── autoGroupProjects ─────────────────────────────────────────────────────────
//
// After each normalize pass, assigns unassigned jobs to projects based on
// designId. One project is auto-created per distinct designId the first time
// it is seen (named after designTitle, falling back to designId).
//
// For user-imported models (designId is "0" or empty), falls back to grouping
// by title prefix. Bambu Studio names tasks as "{project}_{plate_N}" for
// auto-numbered plates and "{project}_{custom name}" for named plates. We
// strip the plate suffix and merge named plates into their parent project
// when a matching _plate_ base exists.
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

const findManualProjectByName = db.prepare<[string], { id: number }>(`
  SELECT id FROM projects WHERE source_design_id IS NULL AND name = ?
`);

const adoptManualProject = db.prepare<[string, number]>(`
  UPDATE projects SET source_design_id = ? WHERE id = ? AND source_design_id IS NULL
`);

const insertAutoProject = db.prepare<{
  name: string;
  source_design_id: string;
  created_at: string;
}>(`
  INSERT INTO projects (name, source_design_id, created_at)
  VALUES (@name, @source_design_id, @created_at)
`);

const assignJobs = db.prepare<[number, string]>(`
  UPDATE jobs SET project_id = ? WHERE designId = ? AND project_id IS NULL
`);

// ── User-imported models (designId is "0"/empty/null → group by title) ───────

const findUserJobs = db.prepare<[], { id: number; title: string | null }>(`
  SELECT j.id, pt.title
  FROM jobs j
  JOIN print_tasks pt ON pt.session_id = j.session_id AND pt.plateIndex = (
    SELECT MIN(pt2.plateIndex) FROM print_tasks pt2 WHERE pt2.session_id = j.session_id
  )
  WHERE j.project_id IS NULL
    AND (j.designId IS NULL OR j.designId = '0' OR j.designId = '')
`);

// Derive the project base name from a task title.
// Bambu Studio uses "{project}_{plate_N}" or "{project}_{custom name}".
// First pass: strip "_plate_N" suffixes to build a set of known project names.
// Second pass: for titles without "_plate_", check if stripping the last
// underscore-segment yields a known project name (named plate like "Leg Lower - Right").
export function deriveBaseTitle(title: string, knownBases: ReadonlySet<string>): string {
  const plateMatch = title.match(/^(.+)_plate_\d+$/);
  if (plateMatch) return plateMatch[1]!;

  // Check if removing the last _segment yields a known base
  const lastUnderscore = title.lastIndexOf("_");
  if (lastUnderscore > 0) {
    const candidate = title.slice(0, lastUnderscore);
    if (knownBases.has(candidate)) return candidate;
  }

  return title;
}

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
    const userJobs = findUserJobs.all();
    if (userJobs.length === 0) return;

    // Pass 1: collect all _plate_N base names
    const plateBases = new Set<string>();
    for (const { title } of userJobs) {
      if (!title) continue;
      const m = title.match(/^(.+)_plate_\d+$/);
      if (m) plateBases.add(m[1]!);
    }

    // Pass 2: derive base title for every job, group by base
    const groups = new Map<string, number[]>();
    for (const { id, title } of userJobs) {
      const base = title ? deriveBaseTitle(title, plateBases) : null;
      if (!base) continue;
      if (!groups.has(base)) groups.set(base, []);
      groups.get(base)!.push(id);
    }

    // Pass 3: create/find projects and assign
    for (const [baseTitle, ids] of groups) {
      const sourceKey = `title:${baseTitle}`;
      let project = findAutoProject.get(sourceKey);

      if (!project) {
        project = findManualProjectByName.get(baseTitle);
        if (project) {
          adoptManualProject.run(sourceKey, project.id);
        }
      }

      if (!project) {
        const { lastInsertRowid } = insertAutoProject.run({
          name: baseTitle,
          source_design_id: sourceKey,
          created_at: now,
        });
        project = { id: Number(lastInsertRowid) };
        created++;
      }

      const placeholders = ids.map(() => "?").join(",");
      const { changes } = db
        .prepare(
          `UPDATE jobs SET project_id = ? WHERE id IN (${placeholders}) AND project_id IS NULL`,
        )
        .run(project.id, ...ids);
      assigned += changes;
    }
  })();

  return { created, assigned };
}
