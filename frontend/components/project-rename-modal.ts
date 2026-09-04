import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openingTrigger = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      if (openingTrigger.current?.isConnected) openingTrigger.current.focus();
    };
  }, [onClose, saving]);

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

  return html`<div class="overlay" onClick=${(event: MouseEvent) => event.target === event.currentTarget && !saving && onClose()}>
    <div class="modal" ref=${dialogRef} role="dialog" tabindex=${-1} aria-modal="true" aria-labelledby="rename-project-title" onClick=${(e: MouseEvent) => e.stopPropagation()}>
      <h2 id="rename-project-title">Rename project</h2>
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
        <button type="button" class="btn-secondary" onClick=${onClose} disabled=${saving}>Cancel</button>
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
