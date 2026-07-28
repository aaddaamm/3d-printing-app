import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import htm from "htm";

import {
  fetchProductPricingHistory,
  type LegacyPriceQuoteResult,
  type PriceQuoteResult,
  type SavedProductPricingBatch,
} from "../lib/api.js";
import { fmtCurrency, fmtDate } from "./helpers.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type PricingChannel = "direct" | "etsy";

type ProductPricingCardBase = {
  batchId: number;
  channel: PricingChannel;
  price: number;
  unitCost: number;
  productionLossCost: number;
  profitPerUnit: number;
  marginPct: number;
  savedAt: string;
  warningCount: number;
  warnings: string[];
  linkedJobCount: number;
  successfulQuantity: number;
  provenanceLabel: string;
  storedRateCount: number;
};

export type ProductPricingCard =
  | (ProductPricingCardBase & {
      provenance: "current";
      assumptions: PriceQuoteResult["assumptions"];
    })
  | (ProductPricingCardBase & {
      provenance: "legacy_v1";
      assumptions: LegacyPriceQuoteResult["assumptions"];
    });

export type ProductPricingHistoryRequestState = {
  generation: number;
  activeGeneration: number | null;
  productId: number | null;
  loading: boolean;
  history: SavedProductPricingBatch[];
  error: string | null;
};

export function initialProductPricingHistoryRequestState(): ProductPricingHistoryRequestState {
  return {
    generation: 0,
    activeGeneration: null,
    productId: null,
    loading: true,
    history: [],
    error: null,
  };
}

export function beginProductPricingHistoryRequest(
  state: ProductPricingHistoryRequestState,
  productId: number,
): { state: ProductPricingHistoryRequestState; requestGeneration: number } {
  const requestGeneration = state.generation + 1;
  return {
    requestGeneration,
    state: {
      generation: requestGeneration,
      activeGeneration: requestGeneration,
      productId,
      loading: true,
      history: [],
      error: null,
    },
  };
}

export function isCurrentProductPricingHistoryRequest(
  state: ProductPricingHistoryRequestState,
  requestGeneration: number,
): boolean {
  return state.generation === requestGeneration && state.activeGeneration === requestGeneration;
}

export function resolveProductPricingHistoryRequest(
  state: ProductPricingHistoryRequestState,
  requestGeneration: number,
  history: readonly SavedProductPricingBatch[],
): ProductPricingHistoryRequestState {
  if (!isCurrentProductPricingHistoryRequest(state, requestGeneration)) return state;
  return {
    ...state,
    activeGeneration: null,
    loading: false,
    history: sortedPricingHistory(history),
    error: null,
  };
}

export function rejectProductPricingHistoryRequest(
  state: ProductPricingHistoryRequestState,
  requestGeneration: number,
  error: string,
): ProductPricingHistoryRequestState {
  if (!isCurrentProductPricingHistoryRequest(state, requestGeneration)) return state;
  return {
    ...state,
    activeGeneration: null,
    loading: false,
    history: [],
    error,
  };
}

export function sortedPricingHistory(
  history: readonly SavedProductPricingBatch[],
): SavedProductPricingBatch[] {
  return [...history].sort(
    (left, right) =>
      right.created_at.localeCompare(left.created_at) || right.batch_id - left.batch_id,
  );
}

export function latestPricingCards(
  history: readonly SavedProductPricingBatch[],
): ProductPricingCard[] {
  const latest = sortedPricingHistory(history)[0];
  if (!latest) return [];

  const cardBase = (channel: PricingChannel) => {
    const snapshot = latest.snapshots[channel];
    const { breakdown } = snapshot.quote;
    return {
      batchId: latest.batch_id,
      channel,
      price: breakdown.suggestedPrice,
      unitCost: breakdown.unitCost,
      productionLossCost: breakdown.productionLossCost,
      profitPerUnit: breakdown.profitPerUnit,
      marginPct: breakdown.estimatedMarginPct,
      savedAt: latest.created_at,
      warningCount: snapshot.quote.warnings.length,
      warnings: snapshot.quote.warnings,
      linkedJobCount: latest.job_ids.length,
      successfulQuantity: latest.sellable_units,
    };
  };

  if (latest.provenance === "legacy_v1") {
    return (["direct", "etsy"] as const).map((channel) => {
      const assumptions = latest.snapshots[channel].quote.assumptions;
      return {
        ...cardBase(channel),
        provenance: "legacy_v1" as const,
        provenanceLabel: "Legacy snapshot — limited material provenance",
        storedRateCount: assumptions.resolved_rates.length,
        assumptions,
      };
    });
  }

  return (["direct", "etsy"] as const).map((channel) => {
    const assumptions = latest.snapshots[channel].quote.assumptions;
    return {
      ...cardBase(channel),
      provenance: "current" as const,
      provenanceLabel: "Complete contribution provenance",
      storedRateCount:
        assumptions.material_contributions.length + assumptions.machine_contributions.length,
      assumptions,
    };
  });
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function ChannelCard({ card }: { card: ProductPricingCard }) {
  const assumptions = card.assumptions;
  return html`<article class=${"product-pricing-card product-pricing-card--" + card.channel}>
    <div class="product-pricing-card-heading">
      <span>${card.channel === "direct" ? "Direct" : "Etsy"}</span>
      <strong>${fmtCurrency(card.price)}</strong>
    </div>
    <dl class="product-pricing-metrics">
      <div>
        <dt>Stored unit cost</dt>
        <dd>${fmtCurrency(card.unitCost)}</dd>
      </div>
      <div>
        <dt>Production loss</dt>
        <dd>${fmtCurrency(card.productionLossCost)}</dd>
      </div>
      <div>
        <dt>Profit / unit</dt>
        <dd>${fmtCurrency(card.profitPerUnit)}</dd>
      </div>
      <div>
        <dt>Margin</dt>
        <dd>${percent(card.marginPct)}</dd>
      </div>
    </dl>
    <div class="product-pricing-assumptions">
      <strong>Saved rate assumptions</strong>
      <span>Labor ${fmtCurrency(assumptions.labor_hourly_rate)}/hr</span>
      <span>Target margin ${percent(assumptions.target_margin_pct)}</span>
      <span>Platform fee ${percent(assumptions.platform_fee_pct)}</span>
      <span>Fixed fee ${fmtCurrency(assumptions.fixed_fee_per_order)}</span>
      <span>Failure buffer ${percent(assumptions.failure_buffer_pct)}</span>
      <span>Overhead buffer ${percent(assumptions.overhead_buffer_pct)}</span>
      <strong>${card.provenanceLabel}</strong>
      ${card.provenance === "legacy_v1"
        ? html`<span>${card.storedRateCount} legacy material/printer rate assumptions</span>
            <span
              >Material weights, line costs, and task-level machine lines were not recorded.</span
            >`
        : html`<span
              >${card.assumptions.material_contributions.length} stored material contributions</span
            >
            <span
              >${card.assumptions.machine_contributions.length} stored task machine
              contributions</span
            >`}
    </div>
    ${card.warningCount > 0
      ? html`<div class="product-pricing-warnings">
          <strong
            >${card.warningCount} saved ${card.warningCount === 1 ? "warning" : "warnings"}</strong
          >
          <ul>
            ${card.warnings.map((warning) => html`<li>${warning}</li>`)}
          </ul>
        </div>`
      : html`<p class="product-pricing-no-warnings">No saved warnings.</p>`}
  </article>`;
}

function HistoryRow({ batch }: { batch: SavedProductPricingBatch }) {
  const direct = batch.snapshots.direct.quote.breakdown;
  const etsy = batch.snapshots.etsy.quote.breakdown;
  const warningCount =
    batch.snapshots.direct.quote.warnings.length + batch.snapshots.etsy.quote.warnings.length;

  return html`<li class="product-pricing-history-row">
    <div>
      <strong>${fmtDate(batch.created_at)}</strong>
      <span>Batch #${batch.batch_id}</span>
      ${batch.provenance === "legacy_v1"
        ? html`<span>Legacy snapshot — limited material provenance</span>`
        : null}
    </div>
    <div>
      <span>${batch.sellable_units} successful</span>
      <span>${batch.job_ids.length} linked ${batch.job_ids.length === 1 ? "job" : "jobs"}</span>
    </div>
    <div>
      <span>Direct ${fmtCurrency(direct.suggestedPrice)}</span>
      <span>Etsy ${fmtCurrency(etsy.suggestedPrice)}</span>
    </div>
    <div>
      <span>Unit cost ${fmtCurrency(direct.unitCost)}</span>
      <span>${warningCount} ${warningCount === 1 ? "warning" : "warnings"}</span>
    </div>
  </li>`;
}

export function ProductPricingHistory({ productId }: { productId: number }) {
  const initialRequestState = initialProductPricingHistoryRequestState();
  const requestStateRef = useRef(initialRequestState);
  const [requestState, setRequestState] = useState(initialRequestState);

  const applyRequestState = (nextState: ProductPricingHistoryRequestState) => {
    requestStateRef.current = nextState;
    setRequestState(nextState);
  };

  useEffect(() => {
    let cancelled = false;
    const started = beginProductPricingHistoryRequest(requestStateRef.current, productId);
    applyRequestState(started.state);

    fetchProductPricingHistory(productId)
      .then((savedHistory) => {
        if (cancelled) return;
        applyRequestState(
          resolveProductPricingHistoryRequest(
            requestStateRef.current,
            started.requestGeneration,
            savedHistory,
          ),
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load pricing history.";
        const rejected = rejectProductPricingHistoryRequest(
          requestStateRef.current,
          started.requestGeneration,
          message,
        );
        if (rejected !== requestStateRef.current) {
          applyRequestState(rejected);
          toast(message, "error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (requestState.productId !== productId || requestState.loading) {
    return html`<section class="product-pricing-history admin-section">
      <h3 class="admin-section-title">Saved pricing</h3>
      <p class="admin-section-desc">Loading stored pricing history…</p>
    </section>`;
  }

  if (requestState.error) {
    return html`<section class="product-pricing-history admin-section">
      <h3 class="admin-section-title">Saved pricing</h3>
      <p class="admin-section-desc product-pricing-load-error">
        Unable to load saved pricing history. ${requestState.error}
      </p>
    </section>`;
  }

  const cards = latestPricingCards(requestState.history);
  if (cards.length === 0) {
    return html`<section class="product-pricing-history admin-section">
      <h3 class="admin-section-title">Saved pricing</h3>
      <p class="admin-section-desc">
        No saved pricing yet. Pricing appears here only after a quote is saved to this Product.
      </p>
    </section>`;
  }

  return html`<section class="product-pricing-history admin-section">
    <div class="product-pricing-heading">
      <div>
        <h3 class="admin-section-title">Saved pricing</h3>
        <p class="admin-section-desc">
          Immutable snapshot saved ${fmtDate(cards[0]!.savedAt)}. Values below are not recalculated.
        </p>
      </div>
      <span>Batch #${cards[0]!.batchId}</span>
    </div>
    <div class="product-pricing-card-grid">
      ${cards.map((card) => html`<${ChannelCard} key=${card.channel} card=${card} />`)}
    </div>
    <details class="product-pricing-history-list">
      <summary>Saved history (${requestState.history.length})</summary>
      <ol>
        ${requestState.history.map(
          (batch) => html`<${HistoryRow} key=${batch.batch_id} batch=${batch} />`,
        )}
      </ol>
    </details>
  </section>`;
}
