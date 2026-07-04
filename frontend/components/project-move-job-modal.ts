import { h } from "preact";
import { useCallback, useState } from "preact/hooks";
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
  onMoveJobToProject: (jobId: number, projectId: number) => void;
  onNavigateToProject: (projectId: number) => void;
}) {
  const [name, setName] = useState(initialName);

  const moveToNewProject = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const data = await postJsonOrToast<{ project?: Project }>(
      "/projects",
      { name: trimmedName, customer: job.customer ?? null, notes: null },
      "Failed to create project.",
    );
    if (!data?.project) return;

    onProjectCreated(data.project);
    onMoveJobToProject(job.id, data.project.id);
    onNavigateToProject(data.project.id);
    onClose();
  }, [
    job.customer,
    job.id,
    name,
    onClose,
    onMoveJobToProject,
    onNavigateToProject,
    onProjectCreated,
  ]);

  return html`<div class="modal-backdrop" onClick=${onClose}>
    <div class="modal-card" onClick=${(e: MouseEvent) => e.stopPropagation()}>
      <h3>Move print run to new project</h3>
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
        <button type="button" class="btn-secondary" onClick=${onClose}>Cancel</button>
        <button
          type="button"
          class="btn-primary"
          disabled=${!name.trim()}
          onClick=${moveToNewProject}
        >
          Create and move
        </button>
      </div>
    </div>
  </div>`;
}
