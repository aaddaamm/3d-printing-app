type UserJobRow = { id: number; title: string | null };

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

export function groupIdsByBaseTitle(userJobs: UserJobRow[]): Map<string, number[]> {
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
    /^(?<base>.+?)[ _-]+(?:PLA|PETG|ABS|ASA|TPU|PC|PA|PVA|HIPS|NYLON)(?:[-_ A-Z0-9]*)?(?:[ _-]+(?:\d+h)?(?:\d+m)?(?:\d+s)?)?$/i;
  const match = withoutExtension.match(materialAndDuration);
  return match?.groups?.["base"]?.trim() || null;
}

function shouldCollapseToFirstWord(base: string, firstWord: string): boolean {
  const words = base.split(/\s+/).filter(Boolean);
  return words.length === 2 && firstWord === firstWord.toLowerCase();
}

const PART_SUFFIX_WORD_RE =
  /^(?:body|hood|head|tail|arm|leg|hand|foot|wing|base|lid|cover|stand|shell|part|piece|left|right|top|bottom|front|back)(?:\b|\d)/i;

function stripLocalPartSuffix(base: string): string | null {
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length < 3) return null;

  const lastWord = words.at(-1);
  if (!lastWord || !PART_SUFFIX_WORD_RE.test(lastWord)) return null;
  return words.slice(0, -1).join(" ");
}

export function deriveLocalSlicerFamilyTitle(title: string): string | null {
  const base = stripSlicerSuffix(title) ?? stripKnownExtension(title).trim();
  if (!base) return null;

  const withoutPartSuffix = stripLocalPartSuffix(base);
  if (withoutPartSuffix) return withoutPartSuffix;

  const firstWord = base.split(/\s+/)[0]?.trim();
  if (!firstWord || firstWord.length < 3) return base;
  return shouldCollapseToFirstWord(base, firstWord) ? firstWord : base;
}
