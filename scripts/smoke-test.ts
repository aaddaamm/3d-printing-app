import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

type SmokeContext = {
  tempDir: string;
  dbPath: string;
  port: number;
  origin: string;
  jobId: number;
  projectId: number;
};

type JsonRecord = Record<string, unknown>;

type UiDataResponse = {
  jobs?: Array<{ cover_url?: string | null }>;
};

const SOURCE_DB = process.env["BAMBU_DB"] ?? "./bambu_print_history.sqlite";
const GATES = ["npm run typecheck", "npm run lint", "npm test", "npm run build"];

function logStep(message: string): void {
  console.log(`\n▶ ${message}`);
}

function pass(message: string): void {
  console.log(`  ✓ ${message}`);
}

function warn(message: string): void {
  console.log(`  ⚠ ${message}`);
}

function runGate(command: string): void {
  logStep(command);
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status ?? "unknown"}`);
  }
  pass(command);
}

function randomPort(): number {
  return 31_000 + Math.floor(Math.random() * 10_000);
}

function prepareSmokeData(dbPath: string): Pick<SmokeContext, "jobId" | "projectId"> {
  const db = new Database(dbPath);
  try {
    const job = db
      .prepare<[], { id: number }>(
        `SELECT id
         FROM jobs
         WHERE total_weight_g IS NOT NULL
           AND total_time_s IS NOT NULL
         ORDER BY startTime DESC, id DESC
         LIMIT 1`,
      )
      .get();
    if (!job) throw new Error("Smoke test requires at least one job with weight/time totals.");

    const project = db
      .prepare<[], { id: number }>(
        `SELECT p.id
         FROM projects p
         JOIN jobs j ON j.project_id = p.id
         GROUP BY p.id
         HAVING COUNT(j.id) > 0
         ORDER BY MAX(j.startTime) DESC, p.id DESC
         LIMIT 1`,
      )
      .get();
    if (project) return { jobId: job.id, projectId: project.id };

    const projectResult = db
      .prepare("INSERT INTO projects (name, created_at) VALUES (?, CURRENT_TIMESTAMP)")
      .run("Smoke Test Project");
    const projectId = Number(projectResult.lastInsertRowid);
    const projectJobs = db
      .prepare<[], { id: number }>(
        `SELECT id
         FROM jobs
         WHERE total_weight_g IS NOT NULL
           AND total_time_s IS NOT NULL
         ORDER BY startTime DESC, id DESC
         LIMIT 2`,
      )
      .all();
    if (projectJobs.length === 0) {
      throw new Error("Smoke test could not find jobs to attach to a temporary project.");
    }

    const assign = db.prepare("UPDATE jobs SET project_id = ? WHERE id = ?");
    const assignAll = db.transaction((ids: number[]) => {
      for (const id of ids) assign.run(projectId, id);
    });
    assignAll(projectJobs.map(({ id }) => id));
    return { jobId: job.id, projectId };
  } finally {
    db.close();
  }
}

async function createTempDb(): Promise<SmokeContext> {
  if (!existsSync(SOURCE_DB)) throw new Error(`Source DB not found: ${SOURCE_DB}`);

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "printworks-smoke-"));
  const dbPath = path.join(tempDir, "smoke.sqlite");
  const source = new Database(SOURCE_DB, { readonly: true });
  try {
    await source.backup(dbPath);
  } finally {
    source.close();
  }

  const port = randomPort();
  return {
    tempDir,
    dbPath,
    port,
    origin: `http://127.0.0.1:${port}`,
    ...prepareSmokeData(dbPath),
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

async function runWorkflowSmoke(ctx: SmokeContext): Promise<void> {
  logStep("HTTP workflow smoke");
  const products = await fetchJson<{ products?: unknown[] }>(`${ctx.origin}/api/products`);
  if (!Array.isArray(products.products)) throw new Error("/api/products did not return products[]");
  pass("products API lists");

  const batches = await fetchJson<{ batches?: unknown[] }>(`${ctx.origin}/api/batches`);
  if (!Array.isArray(batches.batches)) throw new Error("/api/batches did not return batches[]");
  pass("batches API lists");

  const fromJob = await fetchJson<{ product?: { id?: unknown; name?: unknown } }>(
    `${ctx.origin}/api/products/from-job/${ctx.jobId}`,
    { method: "POST" },
  );
  const jobProductId = Number(fromJob.product?.id);
  if (!Number.isInteger(jobProductId) || jobProductId <= 0) {
    throw new Error("Create product from job did not return a product id");
  }
  pass(`created product ${jobProductId} from job ${ctx.jobId}`);

  const fromProject = await fetchJson<{ product?: { id?: unknown; name?: unknown } }>(
    `${ctx.origin}/api/products/from-project/${ctx.projectId}`,
    { method: "POST" },
  );
  const projectProductId = Number(fromProject.product?.id);
  if (!Number.isInteger(projectProductId) || projectProductId <= 0) {
    throw new Error("Create product from project did not return a product id");
  }
  pass(`created product ${projectProductId} from project ${ctx.projectId}`);

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
  }>(`${ctx.origin}/api/batches/${batchId}/projects/${ctx.projectId}`, { method: "POST" });
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
    pass(`copied DB to ${ctx.dbPath}`);

    server = startServer(ctx);
    await waitForHealth(ctx.origin);
    await assertHtml(ctx.origin);
    await assertCoverRoute(ctx.origin);
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
