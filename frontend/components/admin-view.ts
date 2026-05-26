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

type SaveState = "idle" | "saving" | "saved";

const SAVED_FLASH_MS = 2000;

function replaceByKey<T>(items: T[], keyOf: (item: T) => string, next: T): T[] {
  const key = keyOf(next);
  return items.map((item) => (keyOf(item) === key ? next : item));
}

function saveButtonLabel(state: SaveState): string {
  if (state === "saving") return "Saving…";
  if (state === "saved") return "✓ Saved";
  return "Save";
}

function getSaveState(activeSavingKey: string, activeSavedKey: string, key: string): SaveState {
  if (activeSavingKey === key) return "saving";
  if (activeSavedKey === key) return "saved";
  return "idle";
}

function useSaveFeedback(onRatesChanged: () => void) {
  const [savingKey, setSavingKey] = useState("");
  const [savedKey, setSavedKey] = useState("");

  const flashSaved = (key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(""), SAVED_FLASH_MS);
  };

  const runSave = async (saveKey: string, action: () => Promise<boolean>) => {
    setSavingKey(saveKey);
    try {
      const ok = await action();
      if (!ok) return;
      flashSaved(saveKey);
      onRatesChanged();
    } finally {
      setSavingKey("");
    }
  };

  const getStateFor = (key: string) => getSaveState(savingKey, savedKey, key);

  return { runSave, getStateFor };
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
        value=${Number.isFinite(value) ? value : 0}
        onInput=${(e: Event) => onChange(Number((e.target as HTMLInputElement).value || 0))}
      />
    </label>
  `;
}

function SaveButton({ state }: { state: SaveState }) {
  return html`<button type="submit" class="btn-primary" disabled=${state === "saving"}>
    ${saveButtonLabel(state)}
  </button>`;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: unknown;
}) {
  return html`
    <section class="admin-section">
      <h3 class="admin-section-title">${title}</h3>
      <p class="admin-section-desc">${description}</p>
      ${children}
    </section>
  `;
}

function LaborForm({
  labor,
  saveState,
  onSave,
}: {
  labor: LaborConfig;
  saveState: SaveState;
  onSave: (next: LaborConfig) => void;
}) {
  const [v, setV] = useState(labor);
  useEffect(() => setV(labor), [labor]);

  return html`
    <form class="admin-card" onSubmit=${(e: Event) => (e.preventDefault(), onSave(v))}>
      <div class="admin-card-fields">
        <${RateField}
          label="Hourly rate ($)"
          value=${v.hourly_rate}
          step="0.5"
          onChange=${(hourly_rate: number) => setV({ ...v, hourly_rate })}
        />
        <${RateField}
          label="Minimum labor minutes"
          value=${v.minimum_minutes}
          step="1"
          onChange=${(minimum_minutes: number) => setV({ ...v, minimum_minutes })}
        />
        <${RateField}
          label="Profit markup (%)"
          value=${v.profit_markup_pct * 100}
          step="1"
          onChange=${(profit_markup_pct: number) =>
            setV({ ...v, profit_markup_pct: profit_markup_pct / 100 })}
        />
        <${RateField}
          label="Failure buffer (%)"
          value=${v.failure_buffer_pct * 100}
          step="1"
          onChange=${(failure_buffer_pct: number) =>
            setV({ ...v, failure_buffer_pct: failure_buffer_pct / 100 })}
        />
        <${RateField}
          label="Overhead buffer (%)"
          value=${v.overhead_buffer_pct * 100}
          step="1"
          onChange=${(overhead_buffer_pct: number) =>
            setV({ ...v, overhead_buffer_pct: overhead_buffer_pct / 100 })}
        />
      </div>
      <div class="admin-card-actions"><${SaveButton} state=${saveState} /></div>
    </form>
  `;
}

function MachineForm({
  machine,
  saveState,
  onSave,
}: {
  machine: MachineRate;
  saveState: SaveState;
  onSave: (next: MachineRate) => void;
}) {
  const [v, setV] = useState(machine);
  useEffect(() => setV(machine), [machine]);
  const rate = v.purchase_price / v.lifetime_hrs + v.electricity_rate + v.maintenance_buffer;

  return html`
    <form class="admin-card" onSubmit=${(e: Event) => (e.preventDefault(), onSave(v))}>
      <div class="admin-card-name">${v.device_model}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Purchase price ($)"
          value=${v.purchase_price}
          step="1"
          onChange=${(purchase_price: number) => setV({ ...v, purchase_price })}
        />
        <${RateField}
          label="Lifetime (hours)"
          value=${v.lifetime_hrs}
          step="100"
          min="1"
          onChange=${(lifetime_hrs: number) => setV({ ...v, lifetime_hrs })}
        />
        <${RateField}
          label="Electricity ($/hr)"
          value=${v.electricity_rate}
          step="0.01"
          onChange=${(electricity_rate: number) => setV({ ...v, electricity_rate })}
        />
        <${RateField}
          label="Maintenance ($/hr)"
          value=${v.maintenance_buffer}
          step="0.01"
          onChange=${(maintenance_buffer: number) => setV({ ...v, maintenance_buffer })}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">
          Computed rate: <strong>${fmtCurrency(rate)}</strong>/hr
        </div>
        <div class="admin-card-actions"><${SaveButton} state=${saveState} /></div>
      </div>
    </form>
  `;
}

function MaterialForm({
  material,
  saveState,
  onSave,
}: {
  material: MaterialRate;
  saveState: SaveState;
  onSave: (next: MaterialRate) => void;
}) {
  const [v, setV] = useState(material);
  useEffect(() => setV(material), [material]);
  const rate = v.cost_per_g * (1 + v.waste_buffer_pct);

  return html`
    <form class="admin-card" onSubmit=${(e: Event) => (e.preventDefault(), onSave(v))}>
      <div class="admin-card-name">${v.filament_type}</div>
      <div class="admin-card-fields">
        <${RateField}
          label="Cost per gram ($/g)"
          value=${v.cost_per_g}
          step="0.001"
          onChange=${(cost_per_g: number) => setV({ ...v, cost_per_g })}
        />
        <${RateField}
          label="Waste buffer (%)"
          value=${v.waste_buffer_pct * 100}
          step="1"
          onChange=${(waste_buffer_pct: number) =>
            setV({ ...v, waste_buffer_pct: waste_buffer_pct / 100 })}
        />
      </div>
      <div class="admin-card-footer">
        <div class="admin-rate-preview">Computed rate: <strong>${fmtCurrency(rate)}</strong>/g</div>
        <div class="admin-card-actions"><${SaveButton} state=${saveState} /></div>
      </div>
    </form>
  `;
}

export function AdminView({ onRatesChanged = () => {} }: { onRatesChanged?: () => void }) {
  const [rates, setRates] = useState<RatesResponse | null>(null);
  const { runSave, getStateFor } = useSaveFeedback(onRatesChanged);

  useEffect(() => {
    fetchJsonOrToast<RatesResponse>("/rates", "Failed to load rates.").then((data) => {
      if (data) setRates(data);
    });
  }, []);

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

  if (!rates) {
    return html`<div class="loading">
      <div class="spinner"></div>
      Loading rates…
    </div>`;
  }

  const { labor_config: lc, machine_rates, material_rates } = rates;

  return html`
    <div class="admin-page">
      <h2 class="admin-title">Rates & Pricing</h2>

      <${Section}
        title="Labor"
        description="Applied once per job (or once per project for project pricing)."
      >
        <${LaborForm}
          labor=${lc}
          saveState=${getStateFor("labor")}
          onSave=${saveLaborConfig}
        />
      </${Section}>

      <${Section}
        title="Machine Rates"
        description="Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance."
      >
        ${machine_rates.map(
          (m: MachineRate) => html`
            <${MachineForm}
              key=${m.device_model}
              machine=${m}
              saveState=${getStateFor(m.device_model)}
              onSave=${saveMachine}
            />
          `,
        )}
      </${Section}>

      <${Section}
        title="Material Rates"
        description="Cost per gram including waste. Rate = cost × (1 + waste fraction)."
      >
        ${material_rates.map(
          (m: MaterialRate) => html`
            <${MaterialForm}
              key=${m.filament_type}
              material=${m}
              saveState=${getStateFor(m.filament_type)}
              onSave=${saveMaterial}
            />
          `,
        )}
      </${Section}>
    </div>
  `;
}
