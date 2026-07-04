import { h } from "preact";
import { useCallback, useState } from "preact/hooks";
import htm from "htm";

import { patchJsonOrToast } from "../lib/api.js";
import type { Project } from "./projects-view-helpers.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export function RenameProjectModal({
  project,
  onClose,
  onRenamed,
}: {
  project: Project;
  onClose: () => void;
  onRenamed: (project: Project) => void;
}) {
  const [name, setName] = useState(project.name ?? "");
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      const data = await patchJsonOrToast<{ project?: Project }>(
        `/projects/${project.id}`,
        { name: trimmedName },
        "Failed to rename project.",
      );
      const updatedProject = data?.project;
      if (!updatedProject) return;
      onRenamed(updatedProject);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [name, onClose, onRenamed, project.id]);

  return html`<div class="modal-backdrop" onClick=${onClose}>
    <div class="modal-card" onClick=${(e: MouseEvent) => e.stopPropagation()}>
      <h3>Rename project</h3>
      <p class="modal-subtle">${project.name}</p>
      <label>
        Project name
        <input
          value=${name}
          onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!name.trim() || saving}
          onClick=${save}
        >
          ${saving ? "Saving…" : "Save name"}
        </button>
      </div>
    </div>
  </div>`;
}
