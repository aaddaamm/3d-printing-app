import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import htm from "htm";

import { fetchJsonOrToast, postJsonOrToast, type ProductSummary } from "../lib/api.js";
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
  incompleteRoots: number;
  errors: CatalogScanError[];
  durationMs: number;
};

type CatalogScanError = {
  phase: "read-directory" | "read-metadata" | "index-file";
  path: string;
  message: string;
};

type CatalogFileSummary = {
  id: number;
  filename: string;
  extension: string | null;
  folder: string;
  size_bytes: number | null;
  modified_at: string | null;
  scan_status: string;
  review_status: string;
  storage_mode: "managed" | "referenced";
  linked_product_id: number | null;
  linked_product_name: string | null;
  preview_url: string | null;
};

type CatalogDuplicateFileSummary = {
  id: number;
  filename: string;
  folder: string;
  path: string;
  size_bytes: number | null;
  modified_at: string | null;
  scan_status: string;
};

type CatalogDuplicateGroup = {
  content_hash: string;
  size_bytes: number | null;
  files: CatalogDuplicateFileSummary[];
  suggested_keep_id: number;
  suggestion: string;
};

type DuplicatesResponse = { groups: CatalogDuplicateGroup[] };
type FilesResponse = {
  files: CatalogFileSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
type InboxResponse = { files: CatalogFileSummary[] };
type ProductsResponse = { products: ProductSummary[] };
type RootsResponse = { roots: ScanRoot[] };
type RootResponse = { root: ScanRoot };
type ScanResponse = { summary: CatalogScanSummary };
type AdoptionResponse = {
  adoption: {
    file: CatalogFileSummary;
    product_id: number;
    product_name: string;
    product_file_id: number;
  };
};

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return html`<div class="catalog-summary-pill">
    <strong>${value.toLocaleString()}</strong>${label}
  </div>`;
}

function CatalogFileCard({ file }: { file: CatalogFileSummary }) {
  return html`<article
    class=${`catalog-file-card ${file.scan_status === "missing" ? "is-missing" : ""}`}
  >
    <div class="catalog-file-preview">
      ${file.preview_url
        ? html`<img src=${file.preview_url} alt=${`Preview of ${file.filename}`} loading="lazy" />`
        : html`<div class="catalog-file-placeholder">
            ${(file.extension ?? "file").toUpperCase()}
          </div>`}
    </div>
    <div class="catalog-file-body">
      <h4 class="catalog-file-name" title=${file.filename}>${file.filename}</h4>
      <div class="catalog-file-folder" title=${file.folder}>${file.folder}</div>
      <div class="catalog-file-meta">
        <span>${formatBytes(file.size_bytes)}</span>
        <span>${formatDate(file.modified_at)}</span>
        <span>${file.scan_status === "missing" ? "missing" : file.review_status}</span>
      </div>
      ${file.linked_product_name
        ? html`<div class="catalog-file-link">Linked to ${file.linked_product_name}</div>`
        : null}
    </div>
  </article>`;
}

function suggestedProductName(filename: string): string {
  return (
    filename
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim() || filename
  );
}

function CatalogInboxCard({
  file,
  products,
  busy,
  onAdopt,
  onIgnore,
}: {
  file: CatalogFileSummary;
  products: ProductSummary[];
  busy: boolean;
  onAdopt: (
    file: CatalogFileSummary,
    payload: { productId?: number; productName?: string },
  ) => void;
  onIgnore: (file: CatalogFileSummary) => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState("new");
  const [productName, setProductName] = useState(suggestedProductName(file.filename));
  const useExisting = selectedProduct !== "new";
  const canAdopt = useExisting || productName.trim() !== "";

  const adopt = () => {
    if (!canAdopt) return;
    if (useExisting) {
      onAdopt(file, { productId: Number(selectedProduct) });
      return;
    }
    onAdopt(file, { productName: productName.trim() });
  };

  return html`<article class="catalog-inbox-card">
    <div class="catalog-file-preview catalog-inbox-preview">
      ${file.preview_url
        ? html`<img src=${file.preview_url} alt=${`Preview of ${file.filename}`} loading="lazy" />`
        : html`<div class="catalog-file-placeholder">
            ${(file.extension ?? "file").toUpperCase()}
          </div>`}
    </div>
    <div class="catalog-inbox-body">
      <div>
        <h4 class="catalog-file-name" title=${file.filename}>${file.filename}</h4>
        <div class="catalog-file-folder" title=${file.folder}>${file.folder}</div>
      </div>
      <label class="form-label">
        Adopt as
        <select
          class="form-input"
          value=${selectedProduct}
          onInput=${(event: Event) => setSelectedProduct((event.target as HTMLSelectElement).value)}
        >
          <option value="new">New product</option>
          ${products.map(
            (product) =>
              html`<option value=${String(product.id)} key=${product.id}>${product.name}</option>`,
          )}
        </select>
      </label>
      ${useExisting
        ? null
        : html`<label class="form-label">
            Product name
            <input
              class="form-input"
              value=${productName}
              onInput=${(event: Event) => setProductName((event.target as HTMLInputElement).value)}
            />
          </label>`}
      <div class="catalog-inbox-actions">
        <button class="btn-primary" onClick=${adopt} disabled=${busy || !canAdopt}>
          ${busy ? "Working…" : "Adopt reference"}
        </button>
        <button class="btn-secondary" onClick=${() => onIgnore(file)} disabled=${busy}>
          Ignore
        </button>
      </div>
    </div>
  </article>`;
}

function DuplicateGroupCard({ group }: { group: CatalogDuplicateGroup }) {
  return html`<article class="catalog-duplicate-card">
    <div class="catalog-duplicate-card-header">
      <div>
        <h4 class="catalog-file-name">${group.files.length} exact copies</h4>
        <p class="admin-section-desc">${group.suggestion}</p>
      </div>
      <div class="catalog-file-count">${formatBytes(group.size_bytes)}</div>
    </div>
    <div class="catalog-duplicate-list">
      ${group.files.map(
        (file) =>
          html`<div
            class=${`catalog-duplicate-row ${file.id === group.suggested_keep_id ? "is-keeper" : ""}`}
            key=${file.id}
          >
            <div>
              <div class="catalog-file-name">${file.filename}</div>
              <div class="catalog-file-folder" title=${file.folder}>${file.folder}</div>
            </div>
            <div class="catalog-file-meta">
              <span>${file.id === group.suggested_keep_id ? "suggested keep" : "review"}</span>
              <span>${formatDate(file.modified_at)}</span>
            </div>
          </div>`,
      )}
    </div>
  </article>`;
}

function ScanSummary({ summary }: { summary: CatalogScanSummary | null }) {
  if (!summary) return null;
  return html`
    <div role="status" aria-live="polite">
      <div class="catalog-summary">
        <${SummaryPill} label="scanned" value=${summary.scanned} />
        <${SummaryPill} label="added" value=${summary.added} />
        <${SummaryPill} label="changed" value=${summary.changed} />
        <${SummaryPill} label="unchanged" value=${summary.unchanged} />
        <${SummaryPill} label="missing" value=${summary.missing} />
        <${SummaryPill} label="restored" value=${summary.restored} />
        <${SummaryPill} label="skipped" value=${summary.skipped} />
        <${SummaryPill} label="failed" value=${summary.failed} />
      </div>
      ${summary.incompleteRoots > 0
        ? html`<p class="catalog-scan-warning">
            Missing-file detection was skipped for ${summary.incompleteRoots} unreadable
            ${summary.incompleteRoots === 1 ? "root" : "roots"}.
          </p>`
        : null}
      ${summary.errors.length > 0
        ? html`<details class="catalog-scan-errors">
            <summary>
              Review ${summary.errors.length} scan
              ${summary.errors.length === 1 ? "error" : "errors"}
            </summary>
            <ul>
              ${summary.errors.map(
                (error) =>
                  html`<li>
                    <strong>${error.phase}</strong> — ${error.path}<br />${error.message}
                  </li>`,
              )}
            </ul>
          </details>`
        : null}
    </div>
  `;
}

export function CatalogView() {
  const [duplicateGroups, setDuplicateGroups] = useState<CatalogDuplicateGroup[]>([]);
  const [files, setFiles] = useState<CatalogFileSummary[]>([]);
  const [inboxFiles, setInboxFiles] = useState<CatalogFileSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [roots, setRoots] = useState<ScanRoot[]>([]);
  const [rootPath, setRootPath] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [triagingId, setTriagingId] = useState<number | null>(null);
  const [summary, setSummary] = useState<CatalogScanSummary | null>(null);
  const [filePage, setFilePage] = useState(1);
  const [fileTotal, setFileTotal] = useState(0);
  const [fileTotalPages, setFileTotalPages] = useState(1);
  const [fileSearchInput, setFileSearchInput] = useState("");
  const [fileQuery, setFileQuery] = useState("");
  const [fileScanStatus, setFileScanStatus] = useState("");
  const [fileReviewStatus, setFileReviewStatus] = useState("");
  const fileRequestId = useRef(0);

  const loadDuplicates = async () => {
    const data = await fetchJsonOrToast<DuplicatesResponse>(
      "/catalog/duplicates",
      "Failed to load duplicates.",
    );
    if (data) setDuplicateGroups(data.groups);
  };

  const loadFiles = async () => {
    const requestId = ++fileRequestId.current;
    setFilesLoading(true);
    const params = new URLSearchParams({ page: String(filePage), pageSize: "48" });
    if (fileQuery) params.set("q", fileQuery);
    if (fileScanStatus) params.set("scanStatus", fileScanStatus);
    if (fileReviewStatus) params.set("reviewStatus", fileReviewStatus);
    const data = await fetchJsonOrToast<FilesResponse>(
      `/catalog/files?${params.toString()}`,
      "Failed to load files.",
    );
    if (data && requestId === fileRequestId.current) {
      setFiles(data.files);
      setFilePage(data.page);
      setFileTotal(data.total);
      setFileTotalPages(data.totalPages);
    }
    if (requestId === fileRequestId.current) setFilesLoading(false);
  };

  const loadInbox = async () => {
    const data = await fetchJsonOrToast<InboxResponse>(
      "/catalog/inbox",
      "Failed to load catalog inbox.",
    );
    if (data) setInboxFiles(data.files);
  };

  const loadProducts = async () => {
    const data = await fetchJsonOrToast<ProductsResponse>(
      "/api/products",
      "Failed to load products.",
    );
    if (data) setProducts(data.products);
  };

  const loadRoots = async () => {
    const data = await fetchJsonOrToast<RootsResponse>("/catalog/roots", "Failed to load roots.");
    if (data) setRoots(data.roots);
  };

  const loadCatalog = async () => {
    await Promise.all([loadRoots(), loadInbox(), loadProducts(), loadDuplicates()]);
    setLoading(false);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [filePage, fileQuery, fileScanStatus, fileReviewStatus]);

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
      toast(
        data.summary.incompleteRoots > 0
          ? "Catalog scan completed with unreadable folders; missing-file detection was skipped."
          : "Catalog scan complete.",
        data.summary.failed > 0 ? "info" : "success",
      );
      await Promise.all([loadCatalog(), loadFiles()]);
    } finally {
      setScanning(false);
    }
  };

  const adoptFile = async (
    file: CatalogFileSummary,
    payload: { productId?: number; productName?: string },
  ) => {
    setTriagingId(file.id);
    try {
      const data = await postJsonOrToast<AdoptionResponse>(
        `/catalog/files/${file.id}/adopt`,
        payload,
        "Failed to adopt catalog file.",
      );
      if (!data) return;
      setInboxFiles((items) => items.filter((item) => item.id !== file.id));
      toast(`Linked ${file.filename} to ${data.adoption.product_name}.`, "success");
      await Promise.all([loadFiles(), loadProducts()]);
    } finally {
      setTriagingId(null);
    }
  };

  const ignoreFile = async (file: CatalogFileSummary) => {
    setTriagingId(file.id);
    try {
      const data = await postJsonOrToast<{ file: CatalogFileSummary }>(
        `/catalog/files/${file.id}/ignore`,
        {},
        "Failed to ignore catalog file.",
      );
      if (!data) return;
      setInboxFiles((items) => items.filter((item) => item.id !== file.id));
      toast(`${file.filename} removed from the inbox.`, "success");
      await loadFiles();
    } finally {
      setTriagingId(null);
    }
  };

  let fileGallery = html`<div class="catalog-file-grid">
    ${files.map((file) => html`<${CatalogFileCard} key=${file.id} file=${file} />`)}
  </div>`;
  if (filesLoading) fileGallery = html`<div class="empty">Loading catalog files…</div>`;
  else if (files.length === 0)
    fileGallery = html`<div class="empty">No catalog files scanned yet.</div>`;

  const duplicateCopies = duplicateGroups.reduce(
    (total, group) => total + group.files.length - 1,
    0,
  );
  let duplicatePanel = html`<div class="catalog-duplicate-grid">
    ${duplicateGroups.map(
      (group) => html`<${DuplicateGroupCard} key=${group.content_hash} group=${group} />`,
    )}
  </div>`;
  if (loading) duplicatePanel = html`<div class="empty">Loading duplicate analysis…</div>`;
  else if (duplicateGroups.length === 0)
    duplicatePanel = html`<div class="empty">No exact duplicate files found.</div>`;

  let inboxPanel = html`<div class="catalog-inbox-grid">
    ${inboxFiles.map(
      (file) =>
        html`<${CatalogInboxCard}
          key=${file.id}
          file=${file}
          products=${products}
          busy=${triagingId === file.id}
          onAdopt=${adoptFile}
          onIgnore=${ignoreFile}
        />`,
    )}
  </div>`;
  if (loading) inboxPanel = html`<div class="empty">Loading catalog inbox…</div>`;
  else if (inboxFiles.length === 0)
    inboxPanel = html`<div class="empty">
      Inbox clear. Newly scanned files will appear here for review.
    </div>`;

  let rootList = html`<div class="catalog-root-list">
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
            ? html`<button
                class="btn-secondary btn-compact"
                onClick=${() => deactivateRoot(root.id)}
              >
                Deactivate
              </button>`
            : null}
        </div>`,
    )}
  </div>`;
  if (loading) rootList = html`<div class="empty">Loading scan roots…</div>`;
  else if (roots.length === 0) rootList = html`<div class="empty">No scan roots configured.</div>`;

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
        <div class="catalog-section-heading">
          <div>
            <h3 class="admin-section-title">File inbox</h3>
            <p class="admin-section-desc">
              Adopt new discoveries as product references or ignore them. Files stay exactly where
              they are.
            </p>
          </div>
          <div class="catalog-file-count">${inboxFiles.length.toLocaleString()} to review</div>
        </div>
        ${inboxPanel}
      </section>

      <section class="admin-section">
        <div class="catalog-section-heading">
          <div>
            <h3 class="admin-section-title">File gallery</h3>
            <p class="admin-section-desc">
              Browse scanned 3MF/model files with embedded thumbnails when available.
            </p>
          </div>
          <div class="catalog-file-count">${fileTotal.toLocaleString()} files</div>
        </div>
        <form
          class="catalog-file-toolbar"
          onSubmit=${(event: Event) => {
            event.preventDefault();
            setFilePage(1);
            setFileQuery(fileSearchInput.trim());
          }}
        >
          <label class="form-label catalog-file-search">
            Search
            <input
              type="search"
              class="form-input"
              placeholder="Filename or folder"
              value=${fileSearchInput}
              onInput=${(event: Event) =>
                setFileSearchInput((event.target as HTMLInputElement).value)}
            />
          </label>
          <label class="form-label">
            File state
            <select
              class="form-input"
              value=${fileScanStatus}
              onChange=${(event: Event) => {
                setFilePage(1);
                setFileScanStatus((event.target as HTMLSelectElement).value);
              }}
            >
              <option value="">All files</option>
              <option value="present">Present</option>
              <option value="missing">Missing</option>
            </select>
          </label>
          <label class="form-label">
            Review state
            <select
              class="form-input"
              value=${fileReviewStatus}
              onChange=${(event: Event) => {
                setFilePage(1);
                setFileReviewStatus((event.target as HTMLSelectElement).value);
              }}
            >
              <option value="">All states</option>
              <option value="inbox">Inbox</option>
              <option value="referenced">Referenced</option>
              <option value="indexed">Indexed</option>
              <option value="ignored">Ignored</option>
            </select>
          </label>
          <button class="btn-secondary" type="submit">Search</button>
        </form>
        ${fileGallery}
        <div class="catalog-pagination" aria-label="Catalog file pages">
          <button
            class="btn-secondary btn-compact"
            type="button"
            disabled=${filePage <= 1 || filesLoading}
            onClick=${() => setFilePage((page) => Math.max(1, page - 1))}
          >
            Previous
          </button>
          <span>Page ${filePage.toLocaleString()} of ${fileTotalPages.toLocaleString()}</span>
          <button
            class="btn-secondary btn-compact"
            type="button"
            disabled=${filePage >= fileTotalPages || filesLoading}
            onClick=${() => setFilePage((page) => Math.min(fileTotalPages, page + 1))}
          >
            Next
          </button>
        </div>
      </section>

      <section class="admin-section">
        <div class="catalog-section-heading">
          <div>
            <h3 class="admin-section-title">Duplicate files</h3>
            <p class="admin-section-desc">
              Exact content matches across Downloads, Desktop, 3d_prints, and other scan roots.
            </p>
          </div>
          <div class="catalog-file-count">
            ${duplicateGroups.length.toLocaleString()} groups · ${duplicateCopies.toLocaleString()}
            extra copies
          </div>
        </div>
        ${duplicatePanel}
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

        ${rootList}
      </section>
    </main>
  `;
}
