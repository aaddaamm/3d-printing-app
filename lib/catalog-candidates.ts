import path from "node:path";

export interface CatalogCandidateFile {
  id: number;
  filename: string;
  extension: string | null;
  folder: string;
  rootPath: string;
  size_bytes: number | null;
  modified_at: string | null;
  preview_url: string | null;
}

export interface CatalogInboxCandidate<TFile extends CatalogCandidateFile = CatalogCandidateFile> {
  key: string;
  name: string;
  folder: string;
  primary_file_id: number;
  total_size_bytes: number;
  files: TFile[];
}

const GENERIC_PACKAGE_DIRECTORIES = new Set([
  "3d files",
  "3mf",
  "files",
  "gcode",
  "model",
  "models",
  "stl",
]);

const PRIMARY_EXTENSION_PRIORITY = new Map([
  ["3mf", 0],
  ["stl", 1],
  ["step", 2],
  ["stp", 2],
  ["f3d", 3],
  ["blend", 4],
  ["obj", 5],
  ["gcode", 6],
]);

function normalizedStem(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .trim()
    .toLowerCase();
}

function displayName(value: string): string {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || value;
}

function candidateLocation(file: CatalogCandidateFile): {
  key: string;
  name: string;
  folder: string;
} {
  const folder = path.resolve(file.folder);
  const root = path.resolve(file.rootPath);
  if (folder === root) {
    const stem = normalizedStem(file.filename);
    const originalStem = file.filename.replace(/\.[^.]+$/, "").trim();
    return { key: `stem:${folder}/${stem}`, name: displayName(originalStem), folder };
  }

  const folderName = path.basename(folder);
  const parent = path.dirname(folder);
  if (GENERIC_PACKAGE_DIRECTORIES.has(folderName.toLowerCase())) {
    return {
      key: `folder:${parent}`,
      name: displayName(path.basename(parent)),
      folder: parent,
    };
  }
  return { key: `folder:${folder}`, name: displayName(folderName), folder };
}

function primaryFile<TFile extends CatalogCandidateFile>(files: TFile[]): TFile {
  const [primary] = [...files].sort((a, b) => {
    const extensionPriority =
      (PRIMARY_EXTENSION_PRIORITY.get(a.extension?.toLowerCase() ?? "") ?? 99) -
      (PRIMARY_EXTENSION_PRIORITY.get(b.extension?.toLowerCase() ?? "") ?? 99);
    if (extensionPriority !== 0) return extensionPriority;
    const previewPriority = Number(Boolean(b.preview_url)) - Number(Boolean(a.preview_url));
    if (previewPriority !== 0) return previewPriority;
    const nameLength = a.filename.length - b.filename.length;
    if (nameLength !== 0) return nameLength;
    return a.id - b.id;
  });
  if (!primary) throw new Error("Catalog candidate must contain at least one file");
  return primary;
}

export function groupCatalogInboxCandidates<TFile extends CatalogCandidateFile>(
  files: TFile[],
): CatalogInboxCandidate<TFile>[] {
  const grouped = new Map<string, { name: string; folder: string; files: TFile[] }>();
  for (const file of files) {
    const location = candidateLocation(file);
    const group = grouped.get(location.key) ?? { ...location, files: [] };
    group.files.push(file);
    grouped.set(location.key, group);
  }

  return [...grouped.entries()]
    .map(([key, group]) => {
      const filesSorted = [...group.files].sort((a, b) => a.filename.localeCompare(b.filename));
      return {
        key,
        name: group.name,
        folder: group.folder,
        primary_file_id: primaryFile(filesSorted).id,
        total_size_bytes: filesSorted.reduce((total, file) => total + (file.size_bytes ?? 0), 0),
        files: filesSorted,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name) || a.key.localeCompare(b.key));
}
