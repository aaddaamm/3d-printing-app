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

type DesignRow = { designId: string; designTitle: string | null };
type UserJobRow = { id: number; title: string | null };
type ProjectRow = { id: number };
type TitleProjectRow = { id: number; name: string; source_design_id: string };
type Summary = { created: number; assigned: number };

// ── MakerWorld designs (have a real designId) ─────────────────────────────────

const findDesigns = db.prepare<[], DesignRow>(`
  SELECT DISTINCT designId, designTitle
  FROM jobs
  WHERE project_id IS NULL AND designId IS NOT NULL AND designId != '0' AND designId != ''
`);

const findAutoProject = db.prepare<[string], ProjectRow>(`
  SELECT id FROM projects WHERE source_design_id = ?
`);

const findManualProjectByName = db.prepare<[string], ProjectRow>(`
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

const findUserJobs = db.prepare<[], UserJobRow>(`
  SELECT j.id, pt.title
  FROM jobs j
  JOIN print_tasks pt ON pt.session_id = j.session_id
  WHERE j.project_id IS NULL
    AND (j.designId IS NULL OR j.designId = '0' OR j.designId = '')
`);

const findAutoTitleProjects = db.prepare<[], TitleProjectRow>(`
  SELECT id, name, source_design_id
  FROM projects
  WHERE source_design_id LIKE 'title:%'
`);

const updateProjectSourceAndName = db.prepare<{
  id: number;
  name: string;
  source_design_id: string;
}>(`
  UPDATE projects SET name = @name, source_design_id = @source_design_id WHERE id = @id
`);

const moveProjectJobs = db.prepare<[number, number]>(`
  UPDATE jobs SET project_id = ? WHERE project_id = ?
`);

const deleteProjectById = db.prepare<[number]>(`
  DELETE FROM projects WHERE id = ?
`);

const assignByIdsStmtCache = new Map<number, ReturnType<typeof db.prepare>>();

function getAssignByIdsStmt(idsLen: number) {
  let stmt = assignByIdsStmtCache.get(idsLen);
  if (!stmt) {
    const placeholders = Array.from({ length: idsLen }, () => "?").join(",");
    stmt = db.prepare(
      `UPDATE jobs SET project_id = ? WHERE id IN (${placeholders}) AND project_id IS NULL`,
    );
    assignByIdsStmtCache.set(idsLen, stmt);
  }
  return stmt;
}

function ensureProject(sourceKey: string, name: string, now: string, summary: Summary): ProjectRow {
  let project = findAutoProject.get(sourceKey);
  if (project) return project;

  project = findManualProjectByName.get(name);
  if (project) {
    adoptManualProject.run(sourceKey, project.id);
    return project;
  }

  const { lastInsertRowid } = insertAutoProject.run({
    name,
    source_design_id: sourceKey,
    created_at: now,
  });
  summary.created += 1;
  return { id: Number(lastInsertRowid) };
}

function groupDesignJobs(now: string, summary: Summary): void {
  const designs = findDesigns.all();

  for (const { designId, designTitle } of designs) {
    const project = ensureProject(designId, designTitle ?? designId, now, summary);
    const { changes } = assignJobs.run(project.id, designId);
    summary.assigned += changes;
  }
}

function collectPlateBases(userJobs: UserJobRow[]): ReadonlySet<string> {
  const plateBases = new Set<string>();
  for (const { title } of userJobs) {
    if (!title) continue;
    const match = title.match(/^(.+)_plate_\d+$/);
    if (match) plateBases.add(match[1]!);
  }
  return plateBases;
}

function collectTitlesByJobId(userJobs: UserJobRow[]): Map<number, string[]> {
  const titlesByJobId = new Map<number, string[]>();
  for (const { id, title } of userJobs) {
    if (!title) continue;
    const existing = titlesByJobId.get(id);
    if (existing) {
      existing.push(title);
      continue;
    }
    titlesByJobId.set(id, [title]);
  }
  return titlesByJobId;
}

function choosePreferredBase(
  derivedBases: string[],
  plateBases: ReadonlySet<string>,
): string | null {
  return (
    derivedBases.find((base) => plateBases.has(base)) ??
    derivedBases.find((base) => base.includes("_plate_")) ??
    derivedBases[0] ??
    null
  );
}

function groupIdsByBaseTitle(userJobs: UserJobRow[]): Map<string, number[]> {
  const plateBases = collectPlateBases(userJobs);
  const titlesByJobId = collectTitlesByJobId(userJobs);
  const groups = new Map<string, number[]>();

  for (const [id, titles] of titlesByJobId) {
    const derivedBases = titles.map((title) => deriveBaseTitle(title, plateBases));
    const preferredBase = choosePreferredBase(derivedBases, plateBases);
    if (!preferredBase) continue;

    const ids = groups.get(preferredBase);
    if (ids) {
      ids.push(id);
      continue;
    }
    groups.set(preferredBase, [id]);
  }

  return groups;
}

function groupTitleJobs(now: string, summary: Summary): void {
  const userJobs = findUserJobs.all();
  if (userJobs.length === 0) return;

  const groups = groupIdsByBaseTitle(userJobs);
  for (const [baseTitle, ids] of groups) {
    const sourceKey = `title:${baseTitle}`;
    const project = ensureProject(sourceKey, baseTitle, now, summary);
    const stmt = getAssignByIdsStmt(ids.length) as {
      run: (...args: Array<number>) => { changes: number };
    };
    const { changes } = stmt.run(project.id, ...ids);
    summary.assigned += changes;
  }
}

function sourceTitle(sourceDesignId: string): string {
  return sourceDesignId.startsWith("title:")
    ? sourceDesignId.slice("title:".length)
    : sourceDesignId;
}

function reconcileAutoTitleProjectFamilies(summary: Summary): void {
  const projectsByFamily = new Map<string, TitleProjectRow[]>();

  for (const project of findAutoTitleProjects.all()) {
    const title = sourceTitle(project.source_design_id);
    const familyTitle = deriveLocalSlicerFamilyTitle(title) ?? title;
    if (familyTitle === title) continue;

    const projects = projectsByFamily.get(familyTitle);
    if (projects) {
      projects.push(project);
      continue;
    }
    projectsByFamily.set(familyTitle, [project]);
  }

  for (const [familyTitle, projects] of projectsByFamily) {
    if (projects.length < 2) continue;

    const canonicalSourceKey = `title:${familyTitle}`;
    const existingCanonical = findAutoProject.get(canonicalSourceKey);
    const canonical = existingCanonical ?? [...projects].sort((a, b) => a.id - b.id)[0]!;

    if (!existingCanonical) {
      updateProjectSourceAndName.run({
        id: canonical.id,
        name: familyTitle,
        source_design_id: canonicalSourceKey,
      });
    }

    for (const project of projects) {
      if (project.id === canonical.id) continue;
      const { changes } = moveProjectJobs.run(canonical.id, project.id);
      summary.assigned += changes;
      deleteProjectById.run(project.id);
    }
  }
}

// Derive the project base name from a task title.
// Bambu Studio uses "{project}_{plate_N}" or "{project}_{custom name}".
// First pass: strip "_plate_N" suffixes to build a set of known project names.
// Second pass: for titles without "_plate_", check if stripping the last
// underscore-segment yields a known project name (named plate like "Leg Lower - Right").
export function deriveBaseTitle(title: string, knownBases: ReadonlySet<string>): string {
  const plateMatch = title.match(/^(.+)_plate_\d+$/);
  if (plateMatch) return plateMatch[1]!;

  let candidate = title;
  while (candidate.includes("_")) {
    candidate = candidate.slice(0, candidate.lastIndexOf("_"));
    if (knownBases.has(candidate)) return candidate;
  }

  return deriveLocalSlicerFamilyTitle(title) ?? title;
}

function stripKnownExtension(title: string): string {
  return title.replace(/\.(?:gcode|g|3mf)$/i, "");
}

function stripSlicerSuffix(title: string): string | null {
  const withoutExtension = stripKnownExtension(title).trim();
  const materialAndDuration =
    /^(?<base>.+?)[ _-]+(?:PLA|PETG|ABS|ASA|TPU|PC|PA|PVA|HIPS|NYLON)(?:[-_ A-Z0-9]*)?[ _-]+(?:\d+h)?(?:\d+m)?(?:\d+s)?$/i;
  const match = withoutExtension.match(materialAndDuration);
  return match?.groups?.["base"]?.trim() || null;
}

export function deriveLocalSlicerFamilyTitle(title: string): string | null {
  const base = stripSlicerSuffix(title);
  if (!base) return null;

  const firstWord = base.split(/\s+/)[0]?.trim();
  if (!firstWord || firstWord.length < 3) return base;
  return firstWord;
}

export function autoGroupProjects(): { created: number; assigned: number } {
  const summary: Summary = { created: 0, assigned: 0 };
  const now = new Date().toISOString();

  db.transaction(() => {
    groupDesignJobs(now, summary);
    groupTitleJobs(now, summary);
    reconcileAutoTitleProjectFamilies(summary);
  })();

  return summary;
}
