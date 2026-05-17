import { Hono } from "hono";
import {
  listJobs,
  getJobById,
  patchJob,
  getJobWithDetails,
  getJobPrice,
  getAllJobPrices,
} from "../models/jobs.js";
import {
  parseJsonBody,
  unknownFields,
  jsonError,
  requireId,
  isNullableString,
  isNullableFiniteNumber,
} from "../lib/util.js";
import { getProjectById } from "../models/projects.js";

export const jobs = new Hono();
const DEBUG_LOADING = process.env["DEBUG_LOADING"] === "1";

const TEXT_FIELDS = ["customer", "notes", "status_override"] as const;
const NUMERIC_FIELDS = ["price_override", "project_id", "extra_labor_minutes"] as const;
const ALL_FIELDS = [...TEXT_FIELDS, ...NUMERIC_FIELDS] as const;

jobs.get("/", (c) => {
  const rows = listJobs(c.req.query());
  return c.json({ count: rows.length, jobs: rows });
});

jobs.get("/prices", (c) => {
  const started = Date.now();
  const prices = getAllJobPrices();
  if (DEBUG_LOADING) {
    console.log(
      `[debug-loading] /jobs/prices entries=${Object.keys(prices).length} totalMs=${Date.now() - started}`,
    );
  }
  return c.json({ prices });
});

jobs.get("/export.csv", (c) => {
  const { status, device, customer, from, to } = c.req.query();
  const rows = listJobs({ status, device, customer, from, to });
  const prices = getAllJobPrices();

  const headers = [
    "date",
    "title",
    "printer",
    "customer",
    "status",
    "filament_g",
    "time_hrs",
    "plates",
    "final_price",
    "notes",
  ];
  const csvRows = rows.map((j) => [
    j.startTime ? j.startTime.slice(0, 10) : "",
    j.designTitle ?? "",
    j.deviceModel ?? "",
    j.customer ?? "",
    j.status_override ?? j.status ?? "",
    j.total_weight_g?.toFixed(1) ?? "",
    j.total_time_s != null ? (j.total_time_s / 3600).toFixed(2) : "",
    j.plate_count ?? "",
    prices[j.id] != null ? prices[j.id]!.toFixed(2) : "",
    j.notes ?? "",
  ]);

  // Prepend ' to cells starting with formula-injection chars (=, +, -, @, tab,
  // carriage return) so Excel/Sheets treat them as literal strings (OWASP).
  const INJECTION_PREFIX = /^[=+\-@\t\r]/;
  const escape = (v: unknown) => {
    const s = String(v);
    const safe = INJECTION_PREFIX.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [headers, ...csvRows].map((row) => row.map(escape).join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bambu-jobs-${date}.csv"`,
    },
  });
});

jobs.get("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  const result = getJobWithDetails(idOrError);
  if (!result) return jsonError(c, "Not found", 404);
  return c.json(result);
});

jobs.patch("/:id", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!getJobById(idOrError)) return jsonError(c, "Not found", 404);

  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, ALL_FIELDS as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  for (const field of NUMERIC_FIELDS) {
    if (!(field in body)) continue;
    const v = body[field];
    if (!isNullableFiniteNumber(v)) {
      return jsonError(c, `${field} must be a finite number or null`, 400);
    }
  }
  for (const field of TEXT_FIELDS) {
    if (!(field in body)) continue;
    const v = body[field];
    if (!isNullableString(v)) {
      return jsonError(c, `${field} must be a string or null`, 400);
    }
  }

  if (body["project_id"] != null) {
    const projectId = body["project_id"] as number;
    if (!Number.isInteger(projectId)) {
      return jsonError(c, "project_id must be an integer or null", 400);
    }
    if (!getProjectById(projectId)) {
      return jsonError(c, "project_id does not reference an existing project", 400);
    }
  }

  const job = patchJob(idOrError, {
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
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  try {
    const result = getJobPrice(idOrError);
    if (!result) return jsonError(c, "Not found", 404);
    return c.json(result);
  } catch (e) {
    return jsonError(c, e instanceof Error ? e.message : String(e), 500);
  }
});
