import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import htm from "htm";

import { postJsonOrToast } from "../lib/api.js";
import type { Job, Project } from "./projects-view-helpers.js";

const html = (
  htm as unknown as {
    bind: (renderer: typeof h) => (strings: TemplateStringsArray, ...values: unknown[]) => unknown;
  }
).bind(h);

export function MoveJobToNewProjectModal({
  job,
  initialName,
  onClose,
  onProjectCreated,
  onMoveJobToProject,
  onNavigateToProject,
}: {
  job: Job;
  initialName: string;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
  onMoveJobToProject: (jobId: number, projectId: number) => Promise<boolean>;
  onNavigateToProject: (projectId: number) => void;
}) {
  const [name, setName] = useState(initialName);
  const [moving, setMoving] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openingTrigger = useRef<HTMLElement | null>(
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !moving) {
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
  }, [moving, onClose]);

  const moveToNewProject = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setMoving(true);
    try {
      const data = await postJsonOrToast<{ project?: Project }>(
        "/projects",
        { name: trimmedName, customer: job.customer ?? null, notes: null },
        "Failed to create project.",
      );
      if (!data?.project) return;

      const moved = await onMoveJobToProject(job.id, data.project.id);
      if (!moved) return;

      onProjectCreated(data.project);
      onNavigateToProject(data.project.id);
      onClose();
    } finally {
      setMoving(false);
    }
  }, [
    job.customer,
    job.id,
    name,
    onClose,
    onMoveJobToProject,
    onNavigateToProject,
    onProjectCreated,
  ]);

  return html`<div class="overlay" onClick=${(event: MouseEvent) => event.target === event.currentTarget && !moving && onClose()}>
    <div class="modal" ref=${dialogRef} role="dialog" tabindex=${-1} aria-modal="true" aria-labelledby="move-job-title" onClick=${(e: MouseEvent) => e.stopPropagation()}>
      <h2 id="move-job-title">Move print run to new project</h2>
      <p class="modal-subtle">${job.designTitle || "Untitled Job"}</p>
      <label>
        New project name
        <input
          value=${name}
          onInput=${(e: Event) => setName((e.target as HTMLInputElement).value)}
          autofocus
        />
      </label>
      <div class="modal-actions">
        <button type="button" class="btn-secondary" onClick=${onClose} disabled=${moving}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!name.trim() || moving}
          onClick=${moveToNewProject}
        >
          ${moving ? "Moving…" : "Create and move"}
        </button>
      </div>
    </div>
  </div>`;
}
