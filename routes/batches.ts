import { Hono } from "hono";
import {
  BatchValidationError,
  addBatchJob,
  addProjectJobsToBatch,
  createBatch,
  deleteBatchJob,
  getBatch,
  listBatches,
  updateBatch,
  type CreateBatchInput,
  type UpdateBatchInput,
} from "../models/batches.js";
import { jsonError, parseJsonBody, requireId, unknownFields } from "../lib/util.js";

export const batches = new Hono();

const BATCH_MUTABLE_FIELDS = [
  "product_id",
  "pricing_profile_id",
  "planned_quantity",
  "completed_quantity",
  "failed_quantity",
  "material_type",
  "primary_color",
  "printer_id",
  "total_filament_g",
  "total_print_time_s",
  "setup_minutes",
  "handling_minutes_per_unit",
  "packaging_cost_per_unit",
  "target_margin_pct",
  "platform_fee_pct",
  "notes",
] as const;

function handleBatchError(c: Parameters<typeof jsonError>[0], error: unknown): Response {
  if (error instanceof BatchValidationError) return jsonError(c, error.message, 400);
  throw error;
}

batches.get("/", (c) => {
  return c.json({ batches: listBatches() });
});

batches.post("/", async (c) => {
  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, BATCH_MUTABLE_FIELDS as unknown as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    const batch = createBatch(body as unknown as CreateBatchInput);
    return c.json({ batch }, 201);
  } catch (error: unknown) {
    return handleBatchError(c, error);
  }
});

batches.get("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const batch = getBatch(idOrError);
  if (!batch) return jsonError(c, "Not found", 404);
  return c.json({ batch });
});

batches.patch("/:id", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const body = await parseJsonBody(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, BATCH_MUTABLE_FIELDS as unknown as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    const batch = updateBatch(idOrError, body as unknown as UpdateBatchInput);
    if (!batch) return jsonError(c, "Not found", 404);
    return c.json({ batch });
  } catch (error: unknown) {
    return handleBatchError(c, error);
  }
});

batches.post("/:id/jobs", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const body = await parseJsonBody<{ job_id?: unknown }>(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, ["job_id"]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  try {
    const jobId = body.job_id;
    if (typeof jobId !== "number" || !Number.isInteger(jobId) || jobId <= 0) {
      return jsonError(c, "job_id must be a positive integer", 400);
    }
    const batch = addBatchJob(idOrError, jobId);
    if (!batch) return jsonError(c, "Not found", 404);
    return c.json({ batch });
  } catch (error: unknown) {
    return handleBatchError(c, error);
  }
});

batches.post("/:id/projects/:projectId", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const projectId = Number(c.req.param("projectId"));
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return jsonError(c, "Invalid projectId", 400);
  }

  try {
    const batch = addProjectJobsToBatch(idOrError, projectId);
    if (!batch) return jsonError(c, "Not found", 404);
    return c.json({ batch });
  } catch (error: unknown) {
    return handleBatchError(c, error);
  }
});

batches.delete("/:id/jobs/:jobId", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;

  const jobId = Number(c.req.param("jobId"));
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return jsonError(c, "Invalid jobId", 400);
  }

  try {
    const batch = deleteBatchJob(idOrError, jobId);
    if (!batch) return jsonError(c, "Not found", 404);
    return c.json({ batch });
  } catch (error: unknown) {
    return handleBatchError(c, error);
  }
});
