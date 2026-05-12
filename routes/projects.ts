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
import { parseId, parseJsonBody, unknownFields } from "../lib/util.js";

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
  const body = await parseJsonBody(c);
  if (!body) return c.json({ error: "Invalid JSON body" }, 400);
  const name = body.name;
  const customer = body.customer;
  const notes = body.notes;

  if (!name || typeof name !== "string" || !name.trim()) {
    return c.json({ error: "name is required" }, 400);
  }
  for (const field of ["customer", "notes"] as const) {
    const value = body[field];
    if (field in body && value !== null && typeof value !== "string") {
      return c.json({ error: `${field} must be a string or null` }, 400);
    }
  }
  const project = createProject({
    name: name.trim(),
    customer: (customer ?? null) as string | null,
    notes: (notes ?? null) as string | null,
  });
  return c.json({ project }, 201);
});

projects.get("/:id/price", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  if (!getProjectById(id)) return c.json({ error: "Not found" }, 404);
  const breakdown = getProjectPrice(id);
  if (!breakdown) return c.json({ error: "Pricing config unavailable" }, 422);
  return c.json(breakdown);
});

projects.get("/:id", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  const project = getProjectById(id);
  if (!project) return c.json({ error: "Not found" }, 404);
  const jobs = getProjectJobs(id);
  return c.json({ project, jobs });
});

projects.patch("/:id", async (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  if (!getProjectById(id)) return c.json({ error: "Not found" }, 404);

  const body = await parseJsonBody(c);
  if (!body) return c.json({ error: "Invalid JSON body" }, 400);

  const unknown = unknownFields(body, ["name", "customer", "notes"]);
  if (unknown.length) return c.json({ error: `Unknown fields: ${unknown.join(", ")}` }, 400);

  const name = body.name;
  const customer = body.customer;
  const notes = body.notes;

  if ("name" in body && (typeof name !== "string" || !name.trim())) {
    return c.json({ error: "name must be a non-empty string" }, 400);
  }
  for (const field of ["customer", "notes"] as const) {
    const value = body[field];
    if (field in body && value !== null && typeof value !== "string") {
      return c.json({ error: `${field} must be a string or null` }, 400);
    }
  }

  const project = patchProject(id, {
    ...("name" in body ? { name: (name as string).trim() } : {}),
    ...("customer" in body ? { customer: (customer ?? null) as string | null } : {}),
    ...("notes" in body ? { notes: (notes ?? null) as string | null } : {}),
  });
  return c.json({ project });
});

projects.delete("/:id", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  if (!deleteProject(id)) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});
