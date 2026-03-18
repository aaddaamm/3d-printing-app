// ── Admin / Rates view ────────────────────────────────────────────────────────

import { h } from 'https://esm.sh/preact@10';
import { useState, useEffect } from 'https://esm.sh/preact@10/hooks';
import htm from 'https://esm.sh/htm@3';

import { fmtCurrency } from './helpers.js';

const html = htm.bind(h);

function RateField({ label, value, onChange, step = '0.01', min = '0' }) {
  return html`
    <label class="form-label">
      ${label}
      <input type="number" class="form-input" step=${step} min=${min}
        value=${value} onInput=${e => onChange(Number(e.target.value))} />
    </label>
  `;
}

function LaborForm({ labor, saving, saved, onSave }) {
  const [v, setV] = useState(labor);
  useEffect(() => setV(labor), [labor]);
  return html`
    <div class="admin-card">
      <div class="admin-card-fields">
        <${RateField} label="Hourly rate ($)" value=${v.hourly_rate} step="0.5"
          onChange=${val => setV(x => ({ ...x, hourly_rate: val }))} />
        <${RateField} label="Minimum minutes" value=${v.minimum_minutes} step="1"
          onChange=${val => setV(x => ({ ...x, minimum_minutes: val }))} />
        <${RateField} label="Profit markup (%)" value=${Math.round(v.profit_markup_pct * 100)} step="1"
          onChange=${val => setV(x => ({ ...x, profit_markup_pct: val / 100 }))} />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ Min charge: ${fmtCurrency(Math.max(v.minimum_minutes, 0) / 60 * v.hourly_rate)}</span>
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  `;
}

function MachineForm({ machine, saving, saved, onSave }) {
  const [v, setV] = useState(machine);
  useEffect(() => setV(machine), [machine]);
  const rate = v.purchase_price / v.lifetime_hrs + v.electricity_rate + v.maintenance_buffer;
  return html`
    <div class="admin-card">
      <div class="admin-card-name">${v.device_model}</div>
      <div class="admin-card-fields">
        <${RateField} label="Purchase price ($)" value=${v.purchase_price} step="1"
          onChange=${val => setV(x => ({ ...x, purchase_price: val }))} />
        <${RateField} label="Lifetime hours" value=${v.lifetime_hrs} step="100"
          onChange=${val => setV(x => ({ ...x, lifetime_hrs: val }))} />
        <${RateField} label="Electricity ($/hr)" value=${v.electricity_rate} step="0.01"
          onChange=${val => setV(x => ({ ...x, electricity_rate: val }))} />
        <${RateField} label="Maintenance ($/hr)" value=${v.maintenance_buffer} step="0.01"
          onChange=${val => setV(x => ({ ...x, maintenance_buffer: val }))} />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${fmtCurrency(rate)}/hr</span>
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  `;
}

function MaterialForm({ material, saving, saved, onSave }) {
  const [v, setV] = useState(material);
  useEffect(() => setV(material), [material]);
  const rate = v.cost_per_g * (1 + v.waste_buffer_pct / 100);
  return html`
    <div class="admin-card">
      <div class="admin-card-name">${v.filament_type}</div>
      <div class="admin-card-fields">
        <${RateField} label="Cost per gram ($/g)" value=${v.cost_per_g} step="0.001"
          onChange=${val => setV(x => ({ ...x, cost_per_g: val }))} />
        <${RateField} label="Waste buffer (%)" value=${v.waste_buffer_pct} step="1"
          onChange=${val => setV(x => ({ ...x, waste_buffer_pct: val }))} />
      </div>
      <div class="admin-card-footer">
        <span class="admin-derived">→ ${(rate * 1000).toFixed(2)}¢/g effective</span>
        <button class="btn-primary" onClick=${() => onSave(v)} disabled=${saving}>
          ${saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  `;
}

export function AdminView() {
  const [rates, setRates] = useState(null);
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    fetch('/rates').then(r => r.json()).then(setRates);
  }, []);

  const flash = key => { setSaved(key); setTimeout(() => setSaved(''), 2000); };

  const saveLaborConfig = async (labor) => {
    setSaving('labor');
    const res = await fetch('/rates/labor', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(labor) });
    const { labor_config } = await res.json();
    setRates(r => ({ ...r, labor_config }));
    setSaving(''); flash('labor');
  };

  const saveMachine = async (machine) => {
    setSaving(machine.device_model);
    const { device_model, purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer } = machine;
    const res = await fetch(`/rates/machines/${encodeURIComponent(device_model)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchase_price, lifetime_hrs, electricity_rate, maintenance_buffer }),
    });
    const { machine_rate } = await res.json();
    setRates(r => ({ ...r, machine_rates: r.machine_rates.map(m => m.device_model === device_model ? machine_rate : m) }));
    setSaving(''); flash(device_model);
  };

  const saveMaterial = async (material) => {
    setSaving(material.filament_type);
    const { filament_type, cost_per_g, waste_buffer_pct } = material;
    const res = await fetch(`/rates/materials/${encodeURIComponent(filament_type)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost_per_g, waste_buffer_pct }),
    });
    const { material_rate } = await res.json();
    setRates(r => ({ ...r, material_rates: r.material_rates.map(m => m.filament_type === filament_type ? material_rate : m) }));
    setSaving(''); flash(filament_type);
  };

  if (!rates) return html`<div class="loading"><div class="spinner"></div>Loading rates…</div>`;

  const { labor_config: lc, machine_rates, material_rates } = rates;

  return html`
    <div class="admin-page">
      <h2 class="admin-title">Rates &amp; Pricing</h2>

      <section class="admin-section">
        <h3 class="admin-section-title">Labor</h3>
        <p class="admin-section-desc">Applied once per job (or once per project for project pricing).</p>
        <${LaborForm} labor=${lc} saving=${saving === 'labor'} saved=${saved === 'labor'} onSave=${saveLaborConfig} />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Machine Rates</h3>
        <p class="admin-section-desc">Depreciation + electricity + maintenance per hour of print time. Rate = purchase ÷ lifetime + electricity + maintenance.</p>
        ${machine_rates.map(m => html`
          <${MachineForm} key=${m.device_model} machine=${m}
            saving=${saving === m.device_model} saved=${saved === m.device_model}
            onSave=${saveMachine} />
        `)}
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Material Rates</h3>
        <p class="admin-section-desc">Cost per gram including waste. Rate = cost × (1 + waste%).</p>
        ${material_rates.map(m => html`
          <${MaterialForm} key=${m.filament_type} material=${m}
            saving=${saving === m.filament_type} saved=${saved === m.filament_type}
            onSave=${saveMaterial} />
        `)}
      </section>
    </div>
  `;
}
