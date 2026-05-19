// ── Admin / Rates view ────────────────────────────────────────────────────────

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import htm from "htm";

import { fmtCurrency } from "./helpers.js";
import { fetchJsonOrToast, patchJsonOrToast } from "../lib/api.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type LaborConfig = {
  hourly_rate: number;
  minimum_minutes: number;
  profit_markup_pct: number;
  failure_buffer_pct: number;
  overhead_buffer_pct: number;
};

type MachineRate = {
  device_model: string;
  purchase_price: number;
  lifetime_hrs: number;
  electricity_rate: number;
  maintenance_buffer: number;
};

type MaterialRate = {
  filament_type: string;
  cost_per_g: number;
  waste_buffer_pct: number;
};

type RatesResponse = {
  labor_config: LaborConfig;
  machine_rates: MachineRate[];
  material_rates: MaterialRate[];
};

function replaceByKey<T>(items: T[], keyOf: (item: T) => string, next: T): T[] {
  const key = keyOf(next);
  return items.map((item) => (keyOf(item) === key ? next : item));
}

type RateFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  min?: string;
};

function RateField({ label, value, onChange, step = "0.01", min = "0" }: RateFieldProps) {
  return html`
    <label class="form-label">
      ${label}
      <input
        type="number"
        class="form-input"
        step=${step}
        min=${min}
        value=${value}
        onInput=${(e: Event) => onChange(Number((e.target as HTMLInputElement).value))}
      />
    </label>
  `;
}

function LaborForm({
  labor,
  saving,
  saved,
  onSave,
}: {
  labor: LaborConfig;
  saving: boolean;
  saved: boolean;
  onSave: (labor: LaborConfig) => void;
}) {
  const [v, setV] = useState(labor);
  useEffect(() => setV(labor), [labor]);
  return html`
    <div class="admin-card">
      <div class="admin-card-fields">
        <${RateField}
          label="Hourly rate ($)"
          value=${v.hourly_rate}
          step="0.5"
          onChange=${(val: number) => setV((x) => ({ ...x, hourly_rate: val }))}
        />
        <${RateField}
          label="Minimum minutes"
          value=${v.minimum_minutes}
          step="1"
          onChange=${(val: number) => setV((x) => ({ ...x, minimum_minutes: val }))}
        />
        <${RateField}
          label="Profit markup (%)"
          value=${Math.round(v.profit_markup_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x) => ({ ...x, profit_markup_pct: val / 100 }))}
        />
        <${RateField}
          label="Failure buffer (%)"
          value=${Math.round(v.failure_buffer_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x) => ({ ...x, failure_buffer_pct: val / 100 }))}
        />
        <${RateField}
          label="Overhead buffer (%)"
          value=${Math.round(v.overhead_buffer_pct * 100)}
          step="1"
          onChange=${(val: number) => setV((x) => ({ ...x, overhead_buffer_pct: val / 100 }))}
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

function MachineForm({
  machine,
  saving,
  saved,
  onSave,
}: {
  machine: MachineRate;
  saving: boolean;
  saved: boolean;
  onSave: (machine: MachineRate) => void;
}) {
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
          onChange=${(val: number) => setV((x) => ({ ...x, purchase_price: val }))}
        />
        <${RateField}
          label="Lifetime hours"
          value=${v.lifetime_hrs}
          step="100"
          onChange=${(val: number) => setV((x) => ({ ...x, lifetime_hrs: val }))}
        />
        <${RateField}
          label="Electricity ($/hr)"
          value=${v.electricity_rate}
          step="0.01"
          onChange=${(val: number) => setV((x) => ({ ...x, electricity_rate: val }))}
        />
        <${RateField}
          label="Maintenance ($/hr)"
          value=${v.maintenance_buffer}
          step="0.01"
          onChange=${(val: number) => setV((x) => ({ ...x, maintenance_buffer: val }))}
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

function MaterialForm({
  material,
  saving,
  saved,
  onSave,
}: {
  material: MaterialRate;
  saving: boolean;
  saved: boolean;
  onSave: (material: MaterialRate) => void;
}) {
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
          onChange=${(val: number) => setV((x) => ({ ...x, cost_per_g: val }))}
        />
        <${RateField}
          label="Waste buffer fraction"
          value=${v.waste_buffer_pct}
          step="0.01"
          onChange=${(val: number) => setV((x) => ({ ...x, waste_buffer_pct: val }))}
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
  const [rates, setRates] = useState<RatesResponse | null>(null);
  const [saving, setSaving] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    fetchJsonOrToast<RatesResponse>("/rates", "Failed to load rates.").then((data) => {
      if (data) setRates(data);
    });
  }, []);

  const flash = (key: string) => {
    setSaved(key);
    setTimeout(() => setSaved(""), 2000);
  };

  const runSave = async (saveKey: string, action: () => Promise<boolean>) => {
    setSaving(saveKey);
    try {
      const ok = await action();
      if (!ok) return;
      flash(saveKey);
      onRatesChanged();
    } finally {
      setSaving("");
    }
  };

  const saveLaborConfig = async (labor: LaborConfig) => {
    await runSave("labor", async () => {
      const data = await patchJsonOrToast<{ labor_config?: LaborConfig }>(
        "/rates/labor",
        labor,
        "Failed to save labor rates.",
      );
      const laborConfig = data?.labor_config;
      if (!laborConfig) return false;
      setRates((r) => (r ? { ...r, labor_config: laborConfig } : r));
      return true;
    });
  };

  const saveMachine = async (machine: MachineRate) => {
    const { device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } =
      machine;
    await runSave(device_model, async () => {
      const data = await patchJsonOrToast<{ machine_rate?: MachineRate }>(
        `/rates/machines/${encodeURIComponent(device_model)}`,
        { purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer },
        "Failed to save machine rate.",
      );
      const machineRate = data?.machine_rate;
      if (!machineRate) return false;
      setRates((r) =>
        r
          ? {
              ...r,
              machine_rates: replaceByKey(r.machine_rates, (m) => m.device_model, machineRate),
            }
          : r,
      );
      return true;
    });
  };

  const saveMaterial = async (material: MaterialRate) => {
    const { filament_type, cost_per_g, waste_buffer_pct } = material;
    await runSave(filament_type, async () => {
      const data = await patchJsonOrToast<{ material_rate?: MaterialRate }>(
        `/rates/materials/${encodeURIComponent(filament_type)}`,
        { cost_per_g, waste_buffer_pct },
        "Failed to save material rate.",
      );
      const materialRate = data?.material_rate;
      if (!materialRate) return false;
      setRates((r) =>
        r
          ? {
              ...r,
              material_rates: replaceByKey(r.material_rates, (m) => m.filament_type, materialRate),
            }
          : r,
      );
      return true;
    });
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
          (m: MachineRate) => html`
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
          (m: MaterialRate) => html`
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
