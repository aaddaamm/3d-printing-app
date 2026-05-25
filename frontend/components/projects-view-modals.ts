import { h } from "preact";
import { useState, useMemo, useCallback } from "preact/hooks";
import htm from "htm";

import { fmtDateShort } from "./helpers.js";
import { RowThumb } from "./atoms.js";
import { filterJobs, type Job, type Project } from "./projects-view-helpers.js";
import { postJsonOrToast } from "../lib/api.js";
import { useEscapeClose } from "../hooks/use-escape-close.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

function onOverlayClick(onClose: () => void) {
  return (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };
}

export function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (project: Project) => void;
}) {
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEscapeClose(onClose);

  const handleSubmit = useCallback(
    async (e: Event) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSaving(true);
      try {
        const data = await postJsonOrToast<{ project?: Project }>(
          "/projects",
          { name: name.trim(), customer: customer || null, notes: notes || null },
          "Failed to create project.",
        );
        if (!data?.project) return;
        onCreate(data.project);
        onClose();
      } finally {
        setSaving(false);
      }
    },
    [name, customer, notes, onCreate, onClose],
  );

  return html`
    <div class="overlay" onClick=${onOverlayClick(onClose)}>
      <div class="modal">
        <div class="modal-header">
          <h2>New Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <form class="project-form" onSubmit=${handleSubmit}>
            <label class="form-label"
              >Name *
              <input
                class="form-input"
                type="text"
                value=${name}
                onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
                placeholder="Project name"
                required
              />
            </label>
            <label class="form-label"
              >Customer
              <input
                class="form-input"
                type="text"
                value=${customer}
                onInput=${(e: Event) => setCustomer((e.target as HTMLInputElement).value)}
                placeholder="Optional"
              />
            </label>
            <label class="form-label"
              >Notes
              <textarea
                class="form-input form-textarea"
                value=${notes}
                onInput=${(e: Event) => setNotes((e.target as HTMLInputElement).value)}
                placeholder="Optional"
              />
            </label>
            <div class="form-actions">
              <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
              <button type="submit" class="btn-primary" disabled=${saving || !name.trim()}>
                ${saving ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function AddJobsModal({
  unassignedJobs,
  onClose,
  onAdd,
}: {
  unassignedJobs: Job[];
  onClose: () => void;
  onAdd: (jobId: number) => void;
}) {
  const [q, setQ] = useState("");
  useEscapeClose(onClose);
  const filtered = useMemo(() => filterJobs(unassignedJobs, q), [unassignedJobs, q]);

  return html`
    <div class="overlay" onClick=${onOverlayClick(onClose)}>
      <div class="modal">
        <div class="modal-header">
          <h2>Add Jobs to Project</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        <div class="modal-body">
          <input
            type="search"
            class="add-jobs-search"
            placeholder="Search…"
            value=${q}
            onInput=${(e: Event) => setQ((e.target as HTMLInputElement).value)}
          />
          ${filtered.length === 0
            ? html`<div class="empty" style="padding:16px 0">
                ${q ? "No matches." : "All jobs are already assigned to projects."}
              </div>`
            : html`<div class="add-jobs-list">
                ${filtered.map(
                  (job: Job) => html`
                    <div class="add-jobs-row" key=${job.id} onClick=${() => onAdd(job.id)}>
                      <${RowThumb} url=${job.cover_url} />
                      <div class="add-jobs-info">
                        <div class="add-jobs-title">${job.designTitle || "Untitled Job"}</div>
                        <div class="add-jobs-meta">
                          ${fmtDateShort(job.startTime)} · ${job.deviceModel || "—"}
                        </div>
                      </div>
                      <button class="btn-primary add-jobs-btn">Add</button>
                    </div>
                  `,
                )}
              </div>`}
        </div>
      </div>
    </div>
  `;
}
