import { Hono } from "hono";
import type { Context } from "hono";
import {
  listProjects,
  getProjectById,
  createProject,
  patchProject,
  deleteProject,
  getProjectJobs,
} from "../models/projects.js";

export const projects = new Hono();

function parseId(c: Context): number | null {
  const id = Number(c.req.param("id"));
  return Number.isFinite(id) ? id : null;
}

projects.get("/", (c) => {
  return c.json({ projects: listProjects() });
});

projects.post("/", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  if (!body["name"] || typeof body["name"] !== "string" || !body["name"].trim()) {
    return c.json({ error: "name is required" }, 400);
  }
  for (const field of ["customer", "notes"] as const) {
    if (field in body && body[field] !== null && typeof body[field] !== "string") {
      return c.json({ error: `${field} must be a string or null` }, 400);
    }
  }
  const project = createProject({
    name: (body["name"] as string).trim(),
    customer: (body["customer"] ?? null) as string | null,
    notes: (body["notes"] ?? null) as string | null,
  });
  return c.json({ project }, 201);
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

  let body: Record<string, unknown>;
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const ALLOWED = new Set(["name", "customer", "notes"]);
  const unknown = Object.keys(body).filter((k) => !ALLOWED.has(k));
  if (unknown.length) return c.json({ error: `Unknown fields: ${unknown.join(", ")}` }, 400);

  if ("name" in body && (typeof body["name"] !== "string" || !body["name"].trim())) {
    return c.json({ error: "name must be a non-empty string" }, 400);
  }
  for (const field of ["customer", "notes"] as const) {
    if (field in body && body[field] !== null && typeof body[field] !== "string") {
      return c.json({ error: `${field} must be a string or null` }, 400);
    }
  }

  const project = patchProject(id, {
    ...("name" in body ? { name: body["name"] as string } : {}),
    ...("customer" in body ? { customer: (body["customer"] ?? null) as string | null } : {}),
    ...("notes" in body ? { notes: (body["notes"] ?? null) as string | null } : {}),
  });
  return c.json({ project });
});

projects.delete("/:id", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  if (!deleteProject(id)) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});
