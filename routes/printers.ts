import { Hono } from "hono";
import { getPrinterById, listPrinters, patchPrinter } from "../models/printers.js";
import { jsonError, parseJsonBody, requireId, unknownFields, isNullableString } from "../lib/util.js";

export const printers = new Hono();

type PrinterPatchBody = {
  name?: string | null;
  model?: string | null;
  serial?: string | null;
  is_active?: boolean;
  notes?: string | null;
};

const TEXT_FIELDS = ["name", "model", "serial", "notes"] as const;
const ALL_FIELDS = [...TEXT_FIELDS, "is_active"] as const;

function validatePatchBody(body: PrinterPatchBody): string | null {
  for (const field of TEXT_FIELDS) {
    if (field in body && !isNullableString(body[field])) {
      return `${field} must be a string or null`;
    }
  }

  if ("is_active" in body && typeof body.is_active !== "boolean") {
    return "is_active must be a boolean";
  }

  return null;
}

printers.get("/", (c) => {
  const includeRetired = c.req.query("include_retired") !== "0";
  const rows = listPrinters({ includeRetired });
  return c.json({ count: rows.length, printers: rows });
});

printers.get("/:id", (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  const printer = getPrinterById(idOrError);
  if (!printer) return jsonError(c, "Not found", 404);
  return c.json({ printer });
});

printers.patch("/:id", async (c) => {
  const idOrError = requireId(c);
  if (idOrError instanceof Response) return idOrError;
  if (!getPrinterById(idOrError)) return jsonError(c, "Not found", 404);

  const body = await parseJsonBody<PrinterPatchBody>(c);
  if (!body) return jsonError(c, "Invalid JSON body", 400);

  const unknown = unknownFields(body, ALL_FIELDS as readonly string[]);
  if (unknown.length) return jsonError(c, `Unknown fields: ${unknown.join(", ")}`, 400);

  const fieldTypeError = validatePatchBody(body);
  if (fieldTypeError) return jsonError(c, fieldTypeError, 400);

  const printer = patchPrinter(idOrError, body);
  return c.json({ printer });
});
