import { Hono } from "hono";
import {
  listProjects,
  getProjectById,
  createProject,
  patchProject,
  deleteProject,
  getProjectJobs,
  autoGroupByDesign,
  cleanupJunkProjects,
  getProjectPrice,
  getAllProjectPrices,
} from "../models/projects.js";
import {
  requireId,
  parseJsonBody,
  unknownFields,
  jsonError,
  isNullableString,
} from "../lib/util.js";

type ProjectCreateBody = {
  name?: string;
  customer?: string | null;
  notes?: string | null;
};

type ProjectPatchBody = {
  name?: string;
  customer?: string | null;
  notes?: string | null;
};

export const projects = new Hono();
const DEBUG_LOADING = process.env["DEBUG_LOADING"] === "1";

projects.get("/", (c) => {
  const started = Date.now();
  const projectsList = listProjects();
  if (DEBUG_LOADING) {
    console.log(
      `[debug-loading] /projects count=${projectsList.length} totalMs=${Date.now() - started}`,
    );
  }
  return c.json({ projects: projectsList });
});

// Must be before /:id to avoid param capture
projects.get("/prices", (c) => {
  const started = Date.now();
  const prices = getAllProjectPrices();
  if (DEBUG_LOADING) {
    console.log(
      `[debug-loading] /projects/prices entries=${Object.keys(prices).length} totalMs=${Date.now() - started}`,
    );
  }
  return c.json({ prices });
});

projects.post("/auto-group", (c) => {
  const result = autoGroupByDesign();
  return c.json(result);
});

projects.post("/cleanup-junk", (c) => {
  const result = cleanupJunkProjects();
  return c.json(result);
});

projects.post("/", async (c) => {
  const body = await parseJsonBody<ProjectCreateBody>(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);
  const name = body.name;
  const customer = body.customer;
  const notes = body.notes;

  if (!name || typeof name !== "string" || !name.trim()) {
    return jsonError(c, "name is required", 400);
  }
  for (const field of ["customer", "notes"] as const) {
    const value = body[field];
    if (field in body && !isNullableString(value)) {
      return jsonError(c, `${field} must be a string or null`, 400);
    }
  }
  const project = createProject({
    name: name.trim(),
    customer: customer ?? null,
    notes: notes ?? null,
  });
  return c.json({ project }, 201);
});

projects.get("/:id/price", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!getProjectById(idOrError)) return jsonError(c, "Not found", 404);
  const breakdown = getProjectPrice(idOrError);
  if (!breakdown) return jsonError(c, "Pricing config unavailable", 422);
  return c.json(breakdown);
});

projects.get("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  const project = getProjectById(idOrError);
  if (!project) return jsonError(c, "Not found", 404);
  const jobs = getProjectJobs(idOrError);
  return c.json({ project, jobs });
});

projects.patch("/:id", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!getProjectById(idOrError)) return jsonError(c, "Not found", 404);

  const body = await parseJsonBody<ProjectPatchBody>(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, ["name", "customer", "notes"]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  const name = body.name;
  const customer = body.customer;
  const notes = body.notes;

  if ("name" in body && (typeof name !== "string" || !name.trim())) {
    return jsonError(c, "name must be a non-empty string", 400);
  }
  for (const field of ["customer", "notes"] as const) {
    const value = body[field];
    if (field in body && !isNullableString(value)) {
      return jsonError(c, `${field} must be a string or null`, 400);
    }
  }

  const project = patchProject(idOrError, {
    ...("name" in body ? { name: String(name).trim() } : {}),
    ...("customer" in body ? { customer: customer ?? null } : {}),
    ...("notes" in body ? { notes: notes ?? null } : {}),
  });
  return c.json({ project });
});

projects.delete("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!deleteProject(idOrError)) return jsonError(c, "Not found", 404);
  return c.json({ ok: true });
});
