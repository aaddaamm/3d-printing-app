// ── Admin / Rates view ────────────────────────────────────────────────────────

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import htm from "htm";

import { fmtCurrency } from "./helpers.js";
import { fetchJsonOrToast, patchJsonOrToast } from "../lib/api.js";

const html = (
  htm as unknown as {
    bind: (
      renderer: typeof h,
    ) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type AnyObj = Record<string, any>;

function RateField({ label, value, onChange, step = "0.01", min = "0" }: AnyObj) {
  return html`
    <label class="form-label">
      ${label}
      <input
        type="number"
        class="form-input"
        step=${step}
        min=${min}
        value=${value}
        onInput=${(e: any) => onChange(Number(e.target.value))}
      />
    </label>
  `;
}

function LaborForm({ labor, saving, saved, onSave }: AnyObj) {
  const [v, setV] = useState(labor);
  useEffect(() => setV(labor), [labor]);
  return html`
    <div class="admin-card">
      <div class="admin-card-fields">
        <${RateField}
          label="Hourly rate ($)"
          value=${v.hourly_rate}
          step="0.5"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, hourly_rate: val }))}
        />
        <${RateField}
          label="Minimum minutes"
          value=${v.minimum_minutes}
          step="1"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, minimum_minutes: val }))}
        />
        <${RateField}
          label="Profit markup (%)"
          value=${Math.round(v.profit_markup_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, profit_markup_pct: val / 100 }))}
        />
        <${RateField}
          label="Failure buffer (%)"
          value=${Math.round(v.failure_buffer_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, failure_buffer_pct: val / 100 }))}
        />
        <${RateField}
          label="Overhead buffer (%)"
          value=${Math.round(v.overhead_buffer_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, overhead_buffer_pct: val / 100 }))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived"
          >→ Min charge: ${fmtCurrency((Math.max(v.minimum_minutes, 0) / 60) * v.hourly_rate)}</span
        >
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}

function MachineForm({ machine, saving, saved, onSave }: AnyObj) {
  const [v, setV] = useState(machine);
  useEffect(() => setV(machine), [machine]);
  const rate = v.purchase_price / v.lifetime_hrs + v.electricity_rate + v.maintenance_buffer;
  return html`
    <div class="admin-card">
      <div class="admin-card-name">${v.device_model}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Purchase price ($)"
          value=${v.purchase_price}
          step="1"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, purchase_price: val }))}
        />
        <${RateField}
          label="Lifetime hours"
          value=${v.lifetime_hrs}
          step="100"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, lifetime_hrs: val }))}
        />
        <${RateField}
          label="Electricity ($/hr)"
          value=${v.electricity_rate}
          step="0.01"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, electricity_rate: val }))}
        />
        <${RateField}
          label="Maintenance ($/hr)"
          value=${v.maintenance_buffer}
          step="0.01"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, maintenance_buffer: val }))}
        />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${fmtCurrency(rate)}/hr</span>
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}

function MaterialForm({ material, saving, saved, onSave }: AnyObj) {
  const [v, setV] = useState(material);
  useEffect(() => setV(material), [material]);
  const rate = v.cost_per_g * (1 + v.waste_buffer_pct);
  return html`
    <div class="admin-card">
      <div class="admin-card-name">${v.filament_type}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Cost per gram ($/g)"
          value=${v.cost_per_g}
          step="0.001"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, cost_per_g: val }))}
        />
        <${RateField}
          label="Waste buffer fraction"
          value=${v.waste_buffer_pct}
          step="0.01"
          onChange=${(val: number) => setV((x: AnyObj) => ({ ...x, waste_buffer_pct: val }))}
        />
        <p class="form-help">Stored as a fraction: 0.10 = 10% waste.</p>
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${(rate * 1000).toFixed(2)}¢/g effective</span>
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </div>
  `;
}

export function AdminView({ onRatesChanged = () => {} }: { onRatesChanged?: () => void }) {
  const [rates, setRates] = useState<AnyObj | null>(null);
  const [saving, setSaving] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetchJsonOrToast<AnyObj>("/rates", "Failed to load rates.").then((data) => {
      if (data) setRates(data);
    });
  }, []);

  const flash = (key: string) => {
    setSaved(key);
    setTimeout(() => setSaved(""), 2000);
  };

  const saveLaborConfig = async (labor: AnyObj) => {
    setSaving("labor");
    try {
      const data = await patchJsonOrToast<AnyObj>("/rates/labor", labor, "Failed to save labor rates.");
      if (!data?.labor_config) return;
      setRates((r) => (r ? { ...r, labor_config: data.labor_config } : r));
      flash("labor");
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };

  const saveMachine = async (machine: AnyObj) => {
    setSaving(machine.device_model);
    const { device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = machine;
    try {
      const data = await patchJsonOrToast<AnyObj>(
        `/rates/machines/${encodeURIComponent(device_model)}`,
        { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer },
        "Failed to save machine rate.",
      );
      if (!data?.machine_rate) return;
      setRates((r) =>
        r
          ? {
              ...r,
              machine_rates: r.machine_rates.map((m: AnyObj) =>
                m.device_model === device_model ? data.machine_rate : m,
              ),
            }
          : r,
      );
      flash(device_model);
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };

  const saveMaterial = async (material: AnyObj) => {
    setSaving(material.filament_type);
    const { filament_type, cost_per_g, waste_buffer_pct } = material;
    try {
      const data = await patchJsonOrToast<AnyObj>(
        `/rates/materials/${encodeURIComponent(filament_type)}`,
        { cost_per_g, waste_buffer_pct },
        "Failed to save material rate.",
      );
      if (!data?.material_rate) return;
      setRates((r) =>
        r
          ? {
              ...r,
              material_rates: r.material_rates.map((m: AnyObj) =>
                m.filament_type === filament_type ? data.material_rate : m,
              ),
            }
          : r,
      );
      flash(filament_type);
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };

  if (!rates)
    return html`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;

  const { labor_config: lc, machine_rates, material_rates } = rates;

  return html`
    <div class="admin-page">
      <h2 class="admin-title">Rates &amp; Pricing</h2>

      <section class="admin-section">
        <h3 class="admin-section-title">Labor</h3>
        <p class="admin-section-desc">
          Applied once per job (or once per project for project pricing).
        </p>
        <${LaborForm}
          labor=${lc}
          saving=${saving === "labor"}
          saved=${saved === "labor"}
          onSave=${saveLaborConfig}
        />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Machine Rates</h3>
        <p class="admin-section-desc">
          Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷
          lifetime + electricity + maintenance.
        </p>
        ${machine_rates.map(
          (m: AnyObj) => html`
            <${MachineForm}
              key=${m.device_model}
              machine=${m}
              saving=${saving === m.device_model}
              saved=${saved === m.device_model}
              onSave=${saveMachine}
            />
          `,
        )}
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Material Rates</h3>
        <p class="admin-section-desc">
          Cost per gram including waste. Rate = cost × (1 + waste fraction).
        </p>
        ${material_rates.map(
          (m: AnyObj) => html`
            <${MaterialForm}
              key=${m.filament_type}
              material=${m}
              saving=${saving === m.filament_type}
              saved=${saved === m.filament_type}
              onSave=${saveMaterial}
            />
          `,
        )}
      </section>
    </div>
  `;
}
