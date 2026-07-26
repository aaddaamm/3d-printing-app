import { h } from "preact";
import { useMemo, useRef, useState } from "preact/hooks";
import htm from "htm";

import { calculatePriceQuote, type PriceQuoteResult } from "../lib/api.js";
import { copyTextToClipboard } from "../lib/copy-format.js";
import { Badge } from "./atoms.js";
import { fmtCurrency, fmtDate, fmtTime, fmtWeight } from "./helpers.js";
import { SavePriceToProductModal } from "./save-price-to-product-modal.js";
import type { Job } from "./jobs-view-types.js";
import {
  beginPriceQuoteRequest,
  canCalculatePriceQuote,
  completePriceQuoteRequest,
  filterPriceCandidateJobs,
  formatPriceQuoteForClipboard,
  initialPriceQuoteRequestState,
  initialPriceThisDraft,
  invalidatePriceQuoteRequests,
  isCurrentPriceQuoteRequest,
  priceThisDraftToRequest,
  togglePriceJob,
  type PriceThisDraft,
} from "./price-this-helpers.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type NumericDraftField =
  | "sellableUnits"
  | "batchLaborMinutes"
  | "perUnitLaborMinutes"
  | "packagingCostPerUnit"
  | "extraCost";

function NumericField({
  label,
  value,
  field,
  min = 0,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  field: NumericDraftField;
  min?: number;
  step?: number;
  onChange: (field: NumericDraftField, value: number) => void;
}) {
  return html`<label class="price-this-field">
    <span>${label}</span>
    <input
      class="price-this-input"
      type="number"
      min=${min}
      step=${step}
      value=${value}
      onInput=${(event: Event) =>
        onChange(field, Number((event.currentTarget as HTMLInputElement).value || 0))}
    />
  </label>`;
}

function SelectedAttempt({
  job,
  jobId,
  onRemove,
}: {
  job?: Job;
  jobId: number;
  onRemove: () => void;
}) {
  return html`<article class="price-this-attempt-card">
    <div class="price-this-attempt-main">
      <div class="price-this-attempt-heading">
        <strong>${job?.designTitle || `Job #${jobId}`}</strong>
        <${Badge} status=${job?.status} />
      </div>
      <div class="price-this-attempt-meta">
        <span>${job?.deviceModel || "Unknown printer"}</span>
        <span>${fmtDate(job?.startTime)}</span>
        <span>${fmtWeight(job?.total_weight_g)}</span>
        <span>${fmtTime(job?.total_time_s)}</span>
      </div>
    </div>
    <button
      class="price-this-remove"
      type="button"
      onClick=${onRemove}
      aria-label=${`Remove ${job?.designTitle || `job ${jobId}`}`}
    >
      Remove
    </button>
  </article>`;
}

function CandidateAttempt({ job, onAdd }: { job: Job; onAdd: () => void }) {
  return html`<button class="price-this-candidate" type="button" onClick=${onAdd}>
    <span>
      <strong>${job.designTitle || `Job #${job.id}`}</strong>
      <small>${job.deviceModel || "Unknown printer"} · ${fmtDate(job.startTime)}</small>
    </span>
    <span class="price-this-candidate-add">Add</span>
  </button>`;
}

function ResultMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return html`<div
    class=${`price-this-result-metric${emphasis ? " price-this-result-metric--emphasis" : ""}`}
  >
    <span>${label}</span><strong>${value}</strong>
  </div>`;
}

function PriceResult({
  quote,
  onCopy,
  onSave,
}: {
  quote: PriceQuoteResult;
  onCopy: () => void;
  onSave: () => void;
}) {
  const breakdown = quote.breakdown;
  return html`<div class="price-this-result">
    <div class="price-this-result-hero">
      <div>
        <span>Recommended ${quote.channel === "etsy" ? "Etsy" : "direct"} price</span>
        <strong>${fmtCurrency(breakdown.suggestedPrice)}</strong>
        <small>per sellable unit</small>
      </div>
      <div class="price-this-result-actions">
        <button class="price-this-copy" type="button" onClick=${onCopy}>Copy price summary</button>
        <button class="btn-primary" type="button" onClick=${onSave}>Save to Product</button>
      </div>
    </div>

    <div class="price-this-result-grid">
      <${ResultMetric} label="Total manufacturing" value=${fmtCurrency(breakdown.totalCost)} />
      <${ResultMetric} label="Production loss" value=${fmtCurrency(breakdown.productionLossCost)} />
      <${ResultMetric} label="Sellable units" value=${String(breakdown.sellableUnits)} />
      <${ResultMetric}
        label="Unit cost"
        value=${fmtCurrency(breakdown.unitCost)}
        emphasis=${true}
      />
      <${ResultMetric} label="Minimum viable" value=${fmtCurrency(breakdown.minimumViablePrice)} />
      <${ResultMetric} label="Profit per unit" value=${fmtCurrency(breakdown.profitPerUnit)} />
      <${ResultMetric} label="Profit per batch" value=${fmtCurrency(breakdown.profitPerBatch)} />
      <${ResultMetric}
        label="Estimated margin"
        value=${`${(breakdown.estimatedMarginPct * 100).toFixed(1)}%`}
      />
    </div>

    <details class="price-this-breakdown">
      <summary>Cost breakdown and assumptions</summary>
      <dl>
        <div>
          <dt>Material</dt>
          <dd>${fmtCurrency(breakdown.materialCost)}</dd>
        </div>
        <div>
          <dt>Machine</dt>
          <dd>${fmtCurrency(breakdown.machineCost)}</dd>
        </div>
        <div>
          <dt>Batch labor</dt>
          <dd>${fmtCurrency(breakdown.batchLaborCost)}</dd>
        </div>
        <div>
          <dt>Per-unit labor</dt>
          <dd>${fmtCurrency(breakdown.perUnitLaborCost)}</dd>
        </div>
        <div>
          <dt>Packaging</dt>
          <dd>${fmtCurrency(breakdown.packagingCost)}</dd>
        </div>
        <div>
          <dt>Extras</dt>
          <dd>${fmtCurrency(breakdown.extraCost)}</dd>
        </div>
        <div>
          <dt>Buffer</dt>
          <dd>${fmtCurrency(breakdown.bufferCost)}</dd>
        </div>
        <div>
          <dt>Labor rate</dt>
          <dd>${fmtCurrency(quote.assumptions.labor_hourly_rate)}/hr</dd>
        </div>
        <div>
          <dt>Target margin</dt>
          <dd>${(quote.assumptions.target_margin_pct * 100).toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Platform fee</dt>
          <dd>
            ${(quote.assumptions.platform_fee_pct * 100).toFixed(1)}% +
            ${fmtCurrency(quote.assumptions.fixed_fee_per_order)}
          </dd>
        </div>
      </dl>
    </details>

    ${quote.warnings.length > 0
      ? html`<div class="price-this-warnings" role="status">
          <strong>Check these assumptions</strong>
          <ul>
            ${quote.warnings.map((warning) => html`<li>${warning}</li>`)}
          </ul>
        </div>`
      : null}
  </div>`;
}

export function PriceThisView({
  jobs,
  initialJobIds,
  navigate,
}: {
  jobs: Job[];
  initialJobIds: number[];
  navigate: (path: string) => void;
}) {
  const [draft, setDraft] = useState<PriceThisDraft>(() => initialPriceThisDraft(initialJobIds));
  const [candidateQuery, setCandidateQuery] = useState("");
  const [quote, setQuote] = useState<PriceQuoteResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const quoteRequestState = useRef(initialPriceQuoteRequestState());

  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs]);
  const selectedIds = useMemo(() => new Set(draft.selectedJobIds), [draft.selectedJobIds]);
  const selectedJobs = useMemo(
    () => draft.selectedJobIds.map((jobId) => jobsById.get(jobId)),
    [draft.selectedJobIds, jobsById],
  );
  const candidates = useMemo(
    () =>
      candidateQuery.trim()
        ? filterPriceCandidateJobs(jobs, candidateQuery, selectedIds).slice(0, 10)
        : [],
    [candidateQuery, jobs, selectedIds],
  );
  const measuredWeight = selectedJobs.reduce((total, job) => total + (job?.total_weight_g || 0), 0);
  const measuredTime = selectedJobs.reduce((total, job) => total + (job?.total_time_s || 0), 0);

  const replaceDraft = (next: PriceThisDraft) => {
    quoteRequestState.current = invalidatePriceQuoteRequests(quoteRequestState.current);
    setDraft(next);
    setQuote(null);
    setCalculating(false);
    setSaveModalOpen(false);
  };
  const updateNumber = (field: NumericDraftField, value: number) => {
    replaceDraft({ ...draft, [field]: value });
  };
  const toggleJob = (jobId: number) => {
    replaceDraft(togglePriceJob(draft, jobId));
    setCandidateQuery("");
  };
  const updateChannel = (channel: "direct" | "etsy") => {
    replaceDraft({ ...draft, channel });
  };

  const calculate = async (event: Event) => {
    event.preventDefault();
    if (!canCalculatePriceQuote(draft)) return;

    const started = beginPriceQuoteRequest(quoteRequestState.current);
    quoteRequestState.current = started.state;
    setQuote(null);
    setCalculating(true);
    try {
      const result = await calculatePriceQuote(priceThisDraftToRequest(draft));
      if (
        result &&
        isCurrentPriceQuoteRequest(quoteRequestState.current, started.requestGeneration)
      ) {
        setQuote(result);
      }
    } finally {
      if (isCurrentPriceQuoteRequest(quoteRequestState.current, started.requestGeneration)) {
        quoteRequestState.current = completePriceQuoteRequest(
          quoteRequestState.current,
          started.requestGeneration,
        );
        setCalculating(false);
      }
    }
  };

  const copySummary = async () => {
    if (!quote) return;
    try {
      await copyTextToClipboard(formatPriceQuoteForClipboard(quote));
      toast("Price summary copied.", "success");
    } catch (error: unknown) {
      toast(error instanceof Error ? error.message : "Failed to copy price summary.", "error");
    }
  };

  return html`<main class="price-this-page">
    <section class="price-this-header">
      <div>
        <p class="price-this-kicker">Production pricing</p>
        <h2>Price this</h2>
        <p>
          Combine real print attempts, set sellable output, and calculate a channel-ready price.
        </p>
      </div>
      <button class="price-this-back" type="button" onClick=${() => navigate("/")}>
        Back to jobs
      </button>
    </section>

    <form class="price-this-form" onSubmit=${calculate}>
      <section class="price-this-section">
        <div class="price-this-section-heading">
          <div>
            <span>1</span>
            <div>
              <h3>Production attempts</h3>
              <p>
                Include successful, failed, and cancelled attempts whose costs belong in this price.
              </p>
            </div>
          </div>
          <div class="price-this-totals" aria-label="Selected production totals">
            <span><strong>${draft.selectedJobIds.length}</strong> attempts</span>
            <span><strong>${fmtWeight(measuredWeight)}</strong> material</span>
            <span><strong>${fmtTime(measuredTime)}</strong> runtime</span>
          </div>
        </div>

        <div class="price-this-attempts">
          ${draft.selectedJobIds.length === 0
            ? html`<p class="price-this-empty">Add at least one production attempt.</p>`
            : draft.selectedJobIds.map(
                (jobId) =>
                  html`<${SelectedAttempt}
                    key=${jobId}
                    jobId=${jobId}
                    job=${jobsById.get(jobId)}
                    onRemove=${() => toggleJob(jobId)}
                  />`,
              )}
        </div>

        <div class="price-this-search">
          <label for="price-this-candidate-search">Add another production attempt</label>
          <input
            id="price-this-candidate-search"
            type="search"
            placeholder="Search title, printer, or status"
            value=${candidateQuery}
            onInput=${(event: Event) =>
              setCandidateQuery((event.currentTarget as HTMLInputElement).value)}
          />
          ${candidateQuery.trim()
            ? html`<div class="price-this-candidates">
                ${candidates.length > 0
                  ? candidates.map(
                      (job) =>
                        html`<${CandidateAttempt}
                          key=${job.id}
                          job=${job}
                          onAdd=${() => toggleJob(job.id)}
                        />`,
                    )
                  : html`<p class="price-this-empty">No unselected jobs match that search.</p>`}
              </div>`
            : null}
        </div>
      </section>

      <section class="price-this-section">
        <div class="price-this-section-heading">
          <div>
            <span>2</span>
            <div>
              <h3>Output and labor</h3>
              <p>Enter sellable output and costs not measured by print history.</p>
            </div>
          </div>
        </div>
        <div class="price-this-input-grid">
          <${NumericField}
            label="Sellable units"
            field="sellableUnits"
            value=${draft.sellableUnits}
            min=${1}
            step=${1}
            onChange=${updateNumber}
          />
          <${NumericField}
            label="Batch labor (minutes)"
            field="batchLaborMinutes"
            value=${draft.batchLaborMinutes}
            onChange=${updateNumber}
          />
          <${NumericField}
            label="Per-unit labor (minutes)"
            field="perUnitLaborMinutes"
            value=${draft.perUnitLaborMinutes}
            onChange=${updateNumber}
          />
          <${NumericField}
            label="Packaging per unit ($)"
            field="packagingCostPerUnit"
            value=${draft.packagingCostPerUnit}
            step=${0.01}
            onChange=${updateNumber}
          />
          <${NumericField}
            label="Other extras ($)"
            field="extraCost"
            value=${draft.extraCost}
            step=${0.01}
            onChange=${updateNumber}
          />
        </div>
      </section>

      <section class="price-this-section price-this-result-section">
        <div class="price-this-section-heading">
          <div>
            <span>3</span>
            <div>
              <h3>Price result</h3>
              <p>Choose a sales channel, then calculate from the current rate assumptions.</p>
            </div>
          </div>
        </div>
        <div class="price-this-calculate-row">
          <div class="price-this-channel" role="group" aria-label="Sales channel">
            <button
              type="button"
              class=${draft.channel === "direct" ? "active" : ""}
              aria-pressed=${draft.channel === "direct"}
              onClick=${() => updateChannel("direct")}
            >
              Direct
            </button>
            <button
              type="button"
              class=${draft.channel === "etsy" ? "active" : ""}
              aria-pressed=${draft.channel === "etsy"}
              onClick=${() => updateChannel("etsy")}
            >
              Etsy
            </button>
          </div>
          <button
            class="price-this-calculate"
            type="submit"
            disabled=${calculating || !canCalculatePriceQuote(draft)}
          >
            ${calculating ? "Calculating…" : "Calculate price"}
          </button>
        </div>
        ${!canCalculatePriceQuote(draft)
          ? html`<p class="price-this-validation">
              Select at least one attempt and enter a positive whole-number quantity.
            </p>`
          : null}
        ${quote
          ? html`<${PriceResult}
              quote=${quote}
              onCopy=${copySummary}
              onSave=${() => quote && setSaveModalOpen(true)}
            />`
          : html`<div class="price-this-result-empty">
              Your manufacturing cost and recommended unit price will appear here.
            </div>`}
      </section>
    </form>

    ${saveModalOpen && quote
      ? html`<${SavePriceToProductModal}
          draft=${draft}
          selectedJobs=${selectedJobs}
          navigate=${navigate}
          onClose=${() => setSaveModalOpen(false)}
        />`
      : null}
  </main>`;
}
