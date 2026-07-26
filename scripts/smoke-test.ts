import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import sharp from "sharp";

type SmokeContext = {
  tempDir: string;
  dbPath: string;
  port: number;
  origin: string;
  coversDir: string;
  productImagesDir: string;
  jobId: number | null;
  failedJobId: number | null;
  projectId: number | null;
};

type JsonRecord = Record<string, unknown>;

type UiDataResponse = {
  jobs?: Array<{ cover_url?: string | null }>;
};

type SavedQuote = {
  channel?: string;
  attempts?: Array<{ status?: string; production_loss_cost?: number }>;
  breakdown?: { unitCost?: number; suggestedPrice?: number };
};

type SavedProductPricingResponse = {
  saved?: {
    product?: { id?: number; name?: string; sales_companion_visible?: boolean };
    batch_id?: number;
    snapshots?: {
      direct?: { quote?: SavedQuote };
      etsy?: { quote?: SavedQuote };
    };
  };
};

const GATES: Array<{ command: string; args: string[]; label: string }> = [
  { command: "npm", args: ["run", "typecheck"], label: "npm run typecheck" },
  { command: "npm", args: ["run", "lint"], label: "npm run lint" },
  { command: "npm", args: ["test"], label: "npm test" },
  { command: "npm", args: ["run", "build"], label: "npm run build" },
];

function logStep(message: string): void {
  console.log(`\n▶ ${message}`);
}

function pass(message: string): void {
  console.log(`  ✓ ${message}`);
}

function warn(message: string): void {
  console.log(`  ⚠ ${message}`);
}

function runGate(gate: { command: string; args: string[]; label: string }): void {
  logStep(gate.label);
  const result = spawnSync(gate.command, gate.args, {
    shell: false,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${gate.label} failed with exit code ${result.status ?? "unknown"}`);
  }
  pass(gate.label);
}

function randomPort(): number {
  return 31_000 + Math.floor(Math.random() * 10_000);
}

async function prepareSmokeData(
  ctx: SmokeContext,
): Promise<Pick<SmokeContext, "jobId" | "failedJobId" | "projectId">> {
  const db = new Database(ctx.dbPath);
  try {
    db.exec(`
      DELETE FROM machine_rates;
      DELETE FROM material_rates;
      INSERT INTO machine_rates
        (device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer, machine_rate_per_hr)
      VALUES
        ('P1S', 0, 1, 0, 0, 2),
        ('Snapmaker U1', 0, 1, 0, 0, 4);
      INSERT INTO material_rates (filament_type, cost_per_g, waste_buffer_pct, rate_per_g)
      VALUES ('PLA', 0.02, 0, 0.02), ('PETG', 0.03, 0, 0.03);
      UPDATE labor_config
      SET hourly_rate = 30, failure_buffer_pct = 0.1, overhead_buffer_pct = 0.05
      WHERE id = 1;
      UPDATE pricing_profiles
      SET target_margin_pct = 0.4, platform_fee_pct = 0, fixed_fee_per_order = 0,
          minimum_price = NULL
      WHERE id = 'booth';
      UPDATE pricing_profiles
      SET target_margin_pct = 0.5, platform_fee_pct = 0.12, fixed_fee_per_order = 0.45,
          minimum_price = NULL
      WHERE id = 'etsy';
    `);

    const projectId = Number(
      db
        .prepare(
          "INSERT INTO projects (name, created_at) VALUES ('Smoke Fixture Project', CURRENT_TIMESTAMP) RETURNING id",
        )
        .pluck()
        .get(),
    );
    const insertJob = db.prepare(
      `INSERT INTO jobs (
         provider, session_id, print_run, deviceModel, status, designTitle,
         total_weight_g, total_time_s, project_id, startTime
       ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       RETURNING id`,
    );
    const jobId = Number(
      insertJob
        .pluck()
        .get("bambu", "smoke-finished", "P1S", "finish", "Smoke Widget", 50, 3600, projectId),
    );
    const failedJobId = Number(
      insertJob
        .pluck()
        .get(
          "moonraker",
          "smoke-failed",
          "Snapmaker U1",
          "cancelled",
          "Smoke Widget retry",
          20,
          1800,
          projectId,
        ),
    );
    const finishedTaskId = "1001";
    const failedTaskId = "1002";
    const insertTask = db.prepare(
      `INSERT INTO print_tasks
         (id, provider, session_id, title, status, deviceModel, weight, costTime, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
    );
    insertTask.run(
      finishedTaskId,
      "bambu",
      "smoke-finished",
      "Smoke Widget body",
      "finish",
      "P1S",
      50,
      3600,
    );
    insertTask.run(
      failedTaskId,
      "moonraker",
      "smoke-failed",
      "Smoke Widget retry",
      "cancelled",
      "Snapmaker U1",
      20,
      1800,
    );
    db.prepare(
      `INSERT INTO job_filaments (task_id, filament_type, weight_g)
       VALUES (?, 'PLA', 50), (?, 'PETG', 20)`,
    ).run(finishedTaskId, failedTaskId);

    await mkdir(ctx.coversDir, { recursive: true });
    await Promise.all([
      sharp({
        create: { width: 80, height: 60, channels: 3, background: "#2563eb" },
      })
        .png()
        .toFile(path.join(ctx.coversDir, `${finishedTaskId}.png`)),
      sharp({
        create: { width: 80, height: 60, channels: 3, background: "#dc2626" },
      })
        .png()
        .toFile(path.join(ctx.coversDir, `${failedTaskId}.png`)),
    ]);

    return { jobId, failedJobId, projectId };
  } finally {
    db.close();
  }
}

async function createTempDb(): Promise<SmokeContext> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "printworks-smoke-"));
  const port = randomPort();
  return {
    tempDir,
    dbPath: path.join(tempDir, "smoke.sqlite"),
    port,
    origin: `http://127.0.0.1:${port}`,
    coversDir: path.join(tempDir, "covers"),
    productImagesDir: path.join(tempDir, "product-images"),
    jobId: null,
    failedJobId: null,
    projectId: null,
  };
}

function startServer(ctx: SmokeContext): ChildProcessWithoutNullStreams {
  logStep(`start API server on ${ctx.origin}`);
  const child = spawn("npx", ["tsx", "api.ts"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(ctx.port),
      BAMBU_DB: ctx.dbPath,
      BAMBU_COVERS_DIR: ctx.coversDir,
      PRODUCT_IMAGES_DIR: ctx.productImagesDir,
      SYNC_INTERVAL_HOURS: "0",
      BAMBU_SYNC_INTERVAL_HOURS: "0",
      MOONRAKER_SYNC_INTERVAL_HOURS: "0",
      SYNC_PROVIDERS: "",
      LOG_REQUESTS: "0",
    },
    stdio: "pipe",
  });

  child.stdout.on("data", (chunk: Buffer) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk: Buffer) => process.stderr.write(chunk));
  child.on("exit", (code) => {
    if (code !== null && code !== 0) warn(`API server exited with code ${code}`);
  });

  return child;
}

function parseJsonResponse<T extends JsonRecord>(text: string, url: string): T {
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON from ${url}: ${message}`, { cause: error });
  }
}

async function fetchJson<T extends JsonRecord>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  const data = parseJsonResponse<T>(text, url);
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${url} failed ${response.status}: ${text}`);
  }
  return data;
}

async function waitForHealth(origin: string): Promise<void> {
  const deadline = Date.now() + 30_000;
  let lastError: unknown = null;
  while (Date.now() < deadline) {
    try {
      const health = await fetchJson<{ ok?: unknown }>(`${origin}/health`);
      if (health.ok === true) {
        pass("health check");
        return;
      }
      lastError = new Error(`health returned ${JSON.stringify(health)}`);
    } catch (error: unknown) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw lastError instanceof Error ? lastError : new Error("Timed out waiting for /health");
}

async function assertHtml(origin: string): Promise<void> {
  const response = await fetch(`${origin}/ui`);
  const html = await response.text();
  if (!response.ok || !html.includes("PrintWorks")) {
    throw new Error(`GET /ui failed ${response.status}`);
  }
  pass("UI shell loads");
}

async function assertCoverRoute(origin: string): Promise<void> {
  const data = await fetchJson<UiDataResponse>(`${origin}/ui/data`);
  const localCoverPath = data.jobs?.find((job) =>
    job.cover_url?.startsWith("/ui/covers/"),
  )?.cover_url;
  if (!localCoverPath) {
    warn("no local cover URL available; skipped cover route smoke");
    return;
  }

  const response = await fetch(`${origin}${localCoverPath}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (!response.ok || !isPng) {
    throw new Error(`Cover route failed ${response.status} for ${localCoverPath}`);
  }
  pass(`cover route serves ${localCoverPath}`);
}

async function runSavedProductFoundationSmoke(ctx: SmokeContext): Promise<void> {
  logStep("saved Product pricing, visibility, and image fallback smoke");
  const jobId = ctx.jobId;
  const failedJobId = ctx.failedJobId;
  if (jobId === null || failedJobId === null) throw new Error("Smoke attempts were not seeded");

  const saveResponse = await fetch(`${ctx.origin}/api/price-quotes/save-to-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_ids: [jobId, failedJobId],
      sellable_units: 1,
      batch_labor_minutes: 10,
      per_unit_labor_minutes: 2,
      packaging_cost_per_unit: 0.75,
      extra_cost: 1.25,
      target_margin_pct: 0.45,
      new_product: {
        name: "Smoke Saved Product",
        designer: "Smoke Fixture",
        notes: "Generated by the isolated smoke test.",
      },
      notes: "Finished production plus one failed attempt.",
    }),
  });
  const saveText = await saveResponse.text();
  const saved = parseJsonResponse<SavedProductPricingResponse>(
    saveText,
    `${ctx.origin}/api/price-quotes/save-to-product`,
  );
  if (saveResponse.status !== 201) {
    throw new Error(`Save to Product failed ${saveResponse.status}: ${saveText}`);
  }

  const productId = Number(saved.saved?.product?.id);
  const batchId = Number(saved.saved?.batch_id);
  const direct = saved.saved?.snapshots?.direct?.quote;
  const etsy = saved.saved?.snapshots?.etsy?.quote;
  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    !Number.isInteger(batchId) ||
    batchId <= 0
  ) {
    throw new Error("Save to Product did not return Product and Batch ids");
  }
  if (direct?.channel !== "direct" || etsy?.channel !== "etsy") {
    throw new Error("Save to Product did not return Direct and Etsy snapshots");
  }

  const directUnitCost = Number(direct.breakdown?.unitCost);
  const etsyUnitCost = Number(etsy.breakdown?.unitCost);
  const directPrice = Number(direct.breakdown?.suggestedPrice);
  const etsyPrice = Number(etsy.breakdown?.suggestedPrice);
  if (!(directUnitCost > 0) || directUnitCost !== etsyUnitCost) {
    throw new Error("Direct and Etsy snapshots did not preserve one shared positive unit cost");
  }
  if (!(directPrice > 0) || !(etsyPrice > 0) || directPrice === etsyPrice) {
    throw new Error("Direct and Etsy snapshots did not produce distinct positive suggestions");
  }
  const finishedAttempt = direct.attempts?.find(({ status }) => status === "finish");
  const failedAttempt = direct.attempts?.find(({ status }) => status === "cancelled");
  if (!finishedAttempt || !failedAttempt || !(Number(failedAttempt.production_loss_cost) > 0)) {
    throw new Error("Saved snapshots did not retain the finished and failed production attempts");
  }
  if (saved.saved?.product?.sales_companion_visible !== false) {
    throw new Error("A newly saved Product was not private by default");
  }
  pass(
    `saved private product ${productId}; shared unit cost $${directUnitCost.toFixed(2)}, Direct $${directPrice.toFixed(2)}, Etsy $${etsyPrice.toFixed(2)}`,
  );

  const privateCompanion = await fetchJson<{ products?: Array<{ id?: number }> }>(
    `${ctx.origin}/api/products/sales-companion`,
  );
  if (!Array.isArray(privateCompanion.products)) {
    throw new Error("Sales Companion API did not return products[]");
  }
  if (privateCompanion.products.some(({ id }) => id === productId)) {
    throw new Error("Private Product appeared in the Sales Companion response");
  }
  pass("saved Product remains absent from Sales Companion before explicit opt-in");

  const history = await fetchJson<{
    history?: Array<{
      batch_id?: number;
      snapshots?: { direct?: { quote?: SavedQuote }; etsy?: { quote?: SavedQuote } };
    }>;
  }>(`${ctx.origin}/api/products/${productId}/pricing-history`);
  const savedHistory = history.history?.find((entry) => entry.batch_id === batchId);
  if (
    !savedHistory ||
    savedHistory.snapshots?.direct?.quote?.breakdown?.unitCost !== directUnitCost ||
    savedHistory.snapshots?.direct?.quote?.breakdown?.suggestedPrice !== directPrice ||
    savedHistory.snapshots?.etsy?.quote?.breakdown?.suggestedPrice !== etsyPrice
  ) {
    throw new Error("Product pricing history did not reproduce the immutable saved snapshots");
  }
  pass("Product pricing history returns the saved Direct and Etsy values");

  const imageResult = await fetchJson<{
    candidates?: Array<{
      source_type?: string;
      available?: boolean;
      url?: string | null;
    }>;
    warnings?: string[];
  }>(`${ctx.origin}/api/products/${productId}/image-candidates`);
  if (!Array.isArray(imageResult.candidates)) {
    throw new Error("Product image candidate API did not return candidates[]");
  }
  const coverCandidate = imageResult.candidates.find(
    ({ source_type, available, url }) =>
      source_type === "print_cover" && available === true && typeof url === "string",
  );
  const placeholder = imageResult.candidates.find(
    ({ source_type, available }) => source_type === "placeholder" && available === true,
  );
  if (!coverCandidate?.url || !placeholder) {
    throw new Error("Generated local covers did not produce print-cover and placeholder fallbacks");
  }
  const coverResponse = await fetch(`${ctx.origin}${coverCandidate.url}`);
  const coverBytes = new Uint8Array(await coverResponse.arrayBuffer());
  if (
    !coverResponse.ok ||
    coverBytes[0] !== 0x89 ||
    coverBytes[1] !== 0x50 ||
    coverBytes[2] !== 0x4e ||
    coverBytes[3] !== 0x47
  ) {
    throw new Error("Generated print-cover candidate was not served as PNG");
  }
  pass("generated local covers provide print-cover and placeholder image fallbacks");

  const updated = await fetchJson<{ product?: { sales_companion_visible?: boolean } }>(
    `${ctx.origin}/api/products/${productId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales_companion_visible: true }),
    },
  );
  if (updated.product?.sales_companion_visible !== true) {
    throw new Error("Explicit Sales Companion visibility update did not persist");
  }

  const visibleCompanion = await fetchJson<{ products?: JsonRecord[] }>(
    `${ctx.origin}/api/products/sales-companion`,
  );
  const visible = visibleCompanion.products?.find(({ id }) => id === productId);
  const expectedPublicKeys = [
    "direct_margin_pct",
    "direct_price",
    "etsy_margin_pct",
    "etsy_price",
    "id",
    "identification_image_url",
    "name",
    "priced_at",
    "production_loss_cost",
    "unit_cost",
  ];
  if (
    !visible ||
    JSON.stringify(Object.keys(visible).sort()) !== JSON.stringify(expectedPublicKeys)
  ) {
    throw new Error("Visible Sales Companion Product did not use the minimal public row contract");
  }
  if (
    visible["unit_cost"] !== directUnitCost ||
    visible["direct_price"] !== directPrice ||
    visible["etsy_price"] !== etsyPrice
  ) {
    throw new Error("Sales Companion row did not use the latest saved pricing snapshots");
  }
  pass("explicit opt-in publishes only the minimal Sales Companion pricing row");
}

async function runWorkflowSmoke(ctx: SmokeContext): Promise<void> {
  logStep("HTTP workflow smoke");
  const products = await fetchJson<{ products?: unknown[] }>(`${ctx.origin}/api/products`);
  if (!Array.isArray(products.products)) throw new Error("/api/products did not return products[]");
  pass("products API lists");

  const batches = await fetchJson<{ batches?: unknown[] }>(`${ctx.origin}/api/batches`);
  if (!Array.isArray(batches.batches)) throw new Error("/api/batches did not return batches[]");
  pass("batches API lists");

  const jobId = ctx.jobId;
  const projectId = ctx.projectId;
  if (jobId === null || projectId === null) {
    warn("no jobs with weight/time totals; skipped price quote and job-backed workflow smoke");
    return;
  }

  const priceQuote = await fetchJson<{
    quote?: { breakdown?: { unitCost?: unknown; suggestedPrice?: unknown } };
  }>(`${ctx.origin}/api/price-quotes/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_ids: [jobId],
      sellable_units: 1,
      batch_labor_minutes: 0,
      per_unit_labor_minutes: 0,
      packaging_cost_per_unit: 0,
      extra_cost: 0,
      channel: "direct",
      target_margin_pct: 0.4,
    }),
  });
  const quoteUnitCost = Number(priceQuote.quote?.breakdown?.unitCost);
  const quoteSuggestedPrice = Number(priceQuote.quote?.breakdown?.suggestedPrice);
  if (!Number.isFinite(quoteUnitCost) || quoteUnitCost <= 0) {
    throw new Error("Price quote did not return a finite positive unit cost");
  }
  if (!Number.isFinite(quoteSuggestedPrice) || quoteSuggestedPrice <= 0) {
    throw new Error("Price quote did not return a finite positive suggested price");
  }
  pass(
    `priced job ${jobId}; unit cost $${quoteUnitCost.toFixed(2)}, suggested $${quoteSuggestedPrice.toFixed(2)}`,
  );

  const fromJob = await fetchJson<{ product?: { id?: unknown; name?: unknown } }>(
    `${ctx.origin}/api/products/from-job/${jobId}`,
    { method: "POST" },
  );
  const jobProductId = Number(fromJob.product?.id);
  if (!Number.isInteger(jobProductId) || jobProductId <= 0) {
    throw new Error("Create product from job did not return a product id");
  }
  pass(`created product ${jobProductId} from job ${jobId}`);

  const fromProject = await fetchJson<{ product?: { id?: unknown; name?: unknown } }>(
    `${ctx.origin}/api/products/from-project/${projectId}`,
    { method: "POST" },
  );
  const projectProductId = Number(fromProject.product?.id);
  if (!Number.isInteger(projectProductId) || projectProductId <= 0) {
    throw new Error("Create product from project did not return a product id");
  }
  pass(`created product ${projectProductId} from project ${projectId}`);

  const createdBatch = await fetchJson<{
    batch?: { id?: unknown; unit_cost?: unknown; suggested_price?: unknown };
  }>(`${ctx.origin}/api/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: projectProductId,
      pricing_profile_id: "booth",
      planned_quantity: 1,
      completed_quantity: 1,
    }),
  });
  const batchId = Number(createdBatch.batch?.id);
  if (!Number.isInteger(batchId) || batchId <= 0) throw new Error("Batch create failed");
  pass(`created batch ${batchId}`);

  const linkedBatch = await fetchJson<{
    batch?: { total_filament_g?: unknown; total_print_time_s?: unknown; unit_cost?: unknown };
  }>(`${ctx.origin}/api/batches/${batchId}/projects/${projectId}`, { method: "POST" });
  const totalFilament = Number(linkedBatch.batch?.total_filament_g);
  const totalTime = Number(linkedBatch.batch?.total_print_time_s);
  const unitCost = Number(linkedBatch.batch?.unit_cost);
  if (!(totalFilament > 0) || !(totalTime > 0)) {
    throw new Error("Project jobs did not populate batch production totals");
  }
  if (!(unitCost > 0)) {
    throw new Error("Linked batch did not produce a positive unit cost");
  }
  pass(`linked project jobs to batch; unit cost $${unitCost.toFixed(2)}`);
}

async function stopServer(child: ChildProcessWithoutNullStreams): Promise<void> {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
      resolve();
    }, 2_000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function main(): Promise<void> {
  for (const gate of GATES) runGate(gate);

  let ctx: SmokeContext | null = null;
  let server: ChildProcessWithoutNullStreams | null = null;
  try {
    logStep("prepare isolated smoke database");
    ctx = await createTempDb();
    pass(`created temporary DB path ${ctx.dbPath}`);

    server = startServer(ctx);
    await waitForHealth(ctx.origin);
    Object.assign(ctx, await prepareSmokeData(ctx));
    pass("seeded deterministic finished/failed attempts and local cover fixtures");
    await assertHtml(ctx.origin);
    await assertCoverRoute(ctx.origin);
    await runSavedProductFoundationSmoke(ctx);
    await runWorkflowSmoke(ctx);

    console.log("\n✓ Smoke orchestration passed");
  } finally {
    if (server) await stopServer(server);
    if (ctx) await rm(ctx.tempDir, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error("\nSmoke orchestration failed:");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
