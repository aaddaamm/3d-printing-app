import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import htm from "htm";

import { fetchJsonOrToast, postJsonOrToast } from "../lib/api.js";
import { toast } from "./toast.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

type ScanRoot = {
  id: number;
  name: string;
  root_path: string;
  is_active: number;
  last_scanned_at: string | null;
};

type CatalogScanSummary = {
  scanned: number;
  added: number;
  changed: number;
  unchanged: number;
  missing: number;
  restored: number;
  skipped: number;
  failed: number;
  durationMs: number;
};

type RootsResponse = { roots: ScanRoot[] };
type RootResponse = { root: ScanRoot };
type ScanResponse = { summary: CatalogScanSummary };

function SummaryPill({ label, value }: { label: string; value: number }) {
  return html`<div class="catalog-summary-pill">
    <strong>${value.toLocaleString()}</strong>${label}
  </div>`;
}

function ScanSummary({ summary }: { summary: CatalogScanSummary | null }) {
  if (!summary) return null;
  return html`
    <div class="catalog-summary" role="status" aria-live="polite">
      <${SummaryPill} label="scanned" value=${summary.scanned} />
      <${SummaryPill} label="added" value=${summary.added} />
      <${SummaryPill} label="changed" value=${summary.changed} />
      <${SummaryPill} label="unchanged" value=${summary.unchanged} />
      <${SummaryPill} label="missing" value=${summary.missing} />
      <${SummaryPill} label="restored" value=${summary.restored} />
      <${SummaryPill} label="skipped" value=${summary.skipped} />
      <${SummaryPill} label="failed" value=${summary.failed} />
    </div>
  `;
}

export function CatalogView() {
  const [roots, setRoots] = useState<ScanRoot[]>([]);
  const [rootPath, setRootPath] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [summary, setSummary] = useState<CatalogScanSummary | null>(null);

  const loadRoots = async () => {
    const data = await fetchJsonOrToast<RootsResponse>("/catalog/roots", "Failed to load roots.");
    if (data) setRoots(data.roots);
    setLoading(false);
  };

  useEffect(() => {
    loadRoots();
  }, []);

  const addRoot = async (event: Event) => {
    event.preventDefault();
    const trimmedPath = rootPath.trim();
    if (!trimmedPath) return;
    const payload = name.trim()
      ? { rootPath: trimmedPath, name: name.trim() }
      : { rootPath: trimmedPath };
    const data = await postJsonOrToast<RootResponse>(
      "/catalog/roots",
      payload,
      "Failed to add root.",
    );
    if (!data) return;
    setRoots((items) => [...items, data.root]);
    setRootPath("");
    setName("");
    toast("Catalog root added.", "success");
  };

  const deactivateRoot = async (id: number) => {
    const data = await fetchJsonOrToast<RootResponse>(
      `/catalog/roots/${id}`,
      "Failed to remove root.",
      {
        method: "DELETE",
      },
    );
    if (!data) return;
    setRoots((items) => items.map((item) => (item.id === id ? data.root : item)));
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const data = await postJsonOrToast<ScanResponse>(
        "/catalog/scan",
        {},
        "Catalog scan failed.",
        {
          timeoutMs: null,
        },
      );
      if (!data) return;
      setSummary(data.summary);
      toast("Catalog scan complete.", data.summary.failed > 0 ? "info" : "success");
      await loadRoots();
    } finally {
      setScanning(false);
    }
  };

  return html`
    <main class="catalog-page">
      <section class="admin-section">
        <div class="catalog-header-row">
          <div>
            <h2 class="admin-section-title">Catalog scanner</h2>
            <p class="admin-section-desc">
              Index local model and G-code files without copying or attaching them to products.
            </p>
          </div>
          <button
            class="btn-primary"
            onClick=${runScan}
            disabled=${scanning || roots.every((root) => !root.is_active)}
          >
            ${scanning ? "Scanning…" : "Run scan"}
          </button>
        </div>
        <${ScanSummary} summary=${summary} />
      </section>

      <section class="admin-section">
        <h3 class="admin-section-title">Scan roots</h3>
        <form class="admin-card catalog-root-form" onSubmit=${addRoot}>
          <label class="form-label">
            Folder path
            <input
              class="form-input"
              value=${rootPath}
              placeholder="/Users/adam/3d-models"
              onInput=${(event: Event) => setRootPath((event.target as HTMLInputElement).value)}
            />
          </label>
          <label class="form-label">
            Name
            <input
              class="form-input"
              value=${name}
              placeholder="Models"
              onInput=${(event: Event) => setName((event.target as HTMLInputElement).value)}
            />
          </label>
          <button class="btn-primary" type="submit">Add root</button>
        </form>

        ${loading
          ? html`<div class="empty">Loading scan roots…</div>`
          : roots.length === 0
            ? html`<div class="empty">No scan roots configured.</div>`
            : html`<div class="catalog-root-list">
                ${roots.map(
                  (root) =>
                    html`<div class="admin-card catalog-root-card" key=${root.id}>
                      <div>
                        <div class="admin-card-name">${root.name}</div>
                        <div class="catalog-root-path">${root.root_path}</div>
                        <div class="catalog-root-meta">
                          ${root.is_active ? "active" : "inactive"}
                          ${root.last_scanned_at ? ` · scanned ${root.last_scanned_at}` : ""}
                        </div>
                      </div>
                      ${root.is_active
                        ? html`<button class="btn-ghost" onClick=${() => deactivateRoot(root.id)}>
                            Deactivate
                          </button>`
                        : null}
                    </div>`,
                )}
              </div>`}
      </section>
    </main>
  `;
}
