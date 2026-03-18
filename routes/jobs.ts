import { Hono } from "hono";
import { listJobs, getJobById, patchJob, getJobWithDetails, getJobPrice, getAllJobPrices } from "../models/jobs.js";
import { parseId } from "../lib/util.js";

export const jobs = new Hono();

const TEXT_FIELDS = ["customer", "notes", "status_override"] as const;
const NUMERIC_FIELDS = ["price_override", "project_id", "extra_labor_minutes"] as const;
const ALL_FIELDS = [...TEXT_FIELDS, ...NUMERIC_FIELDS] as const;

jobs.get("/", (c) => {
  const rows = listJobs(c.req.query());
  return c.json({ count: rows.length, jobs: rows });
});

jobs.get("/prices", (c) => {
  return c.json({ prices: getAllJobPrices() });
});

jobs.get("/export.csv", (c) => {
  const { status, device, customer, from, to } = c.req.query();
  const rows = listJobs({ status, device, customer, from, to });
  const prices = getAllJobPrices();

  const headers = ["date", "title", "printer", "customer", "status", "filament_g", "time_hrs", "plates", "final_price", "notes"];
  const csvRows = rows.map(j => [
    j.startTime ? j.startTime.slice(0, 10) : "",
    j.designTitle ?? "",
    j.deviceModel ?? "",
    j.customer ?? "",
    (j.status_override ?? j.status) ?? "",
    j.total_weight_g?.toFixed(1) ?? "",
    j.total_time_s != null ? (j.total_time_s / 3600).toFixed(2) : "",
    j.plate_count ?? "",
    prices[j.id] != null ? prices[j.id]!.toFixed(2) : "",
    j.notes ?? "",
  ]);

  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...csvRows].map(row => row.map(escape).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bambu-jobs-${date}.csv"`,
    },
  });
});

jobs.get("/:id", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  const result = getJobWithDetails(id);
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

jobs.patch("/:id", async (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  if (!getJobById(id)) return c.json({ error: "Not found" }, 404);

  let body: Record<string, unknown>;
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const unknown = Object.keys(body).filter((k) => !(ALL_FIELDS as readonly string[]).includes(k));
  if (unknown.length) return c.json({ error: `Unknown fields: ${unknown.join(", ")}` }, 400);

  for (const field of NUMERIC_FIELDS) {
    if (!(field in body)) continue;
    const v = body[field];
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v))) {
      return c.json({ error: `${field} must be a finite number or null` }, 400);
    }
  }
  for (const field of TEXT_FIELDS) {
    if (!(field in body)) continue;
    const v = body[field];
    if (v !== null && typeof v !== "string") {
      return c.json({ error: `${field} must be a string or null` }, 400);
    }
  }

  const job = patchJob(id, {
    customer: body["customer"] as string | null | undefined,
    notes: body["notes"] as string | null | undefined,
    price_override: body["price_override"] as number | null | undefined,
    status_override: body["status_override"] as string | null | undefined,
    project_id: body["project_id"] as number | null | undefined,
    extra_labor_minutes: body["extra_labor_minutes"] as number | null | undefined,
  });
  return c.json({ job });
});

jobs.get("/:id/price", (c) => {
  const id = parseId(c);
  if (id === null) return c.json({ error: "Invalid id" }, 400);
  try {
    const result = getJobPrice(id);
    if (!result) return c.json({ error: "Not found" }, 404);
    return c.json(result);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
