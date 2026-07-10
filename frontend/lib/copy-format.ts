export type CopyJob = {
  id: number;
  designTitle?: string | null;
  customer?: string | null;
  status?: string | null;
  deviceModel?: string | null;
  startTime?: string | null;
  total_weight_g?: number | null;
  total_time_s?: number | null;
  final_price?: number | null;
  plate_count?: number | null;
  print_run?: number | null;
};

export type CopyProject = {
  id: number;
  name?: string | null;
  customer?: string | null;
  notes?: string | null;
  job_count?: number | null;
  total_plates?: number | null;
  total_weight_g?: number | null;
  total_time_s?: number | null;
};

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function titleOrFallback(title: string | null | undefined, fallback: string): string {
  const trimmed = title?.trim();
  return trimmed || fallback;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatDuration(seconds: number | null | undefined): string {
  if (!hasValue(seconds) || seconds <= 0) return "—";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatWeight(grams: number | null | undefined): string {
  if (!hasValue(grams) || grams <= 0) return "—";
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams.toFixed(1)} g`;
}

function formatMoney(value: number | null | undefined): string {
  if (!hasValue(value)) return "—";
  return `$${value.toFixed(2)}`;
}

function line(label: string, value: string | number | null | undefined): string {
  return `- ${label}: ${hasValue(value) && value !== "" ? value : "—"}`;
}

export function formatJobForClipboard(job: CopyJob): string {
  return [
    `## ${titleOrFallback(job.designTitle, `Print Job #${job.id}`)}`,
    line("Job ID", job.id),
    line("Status", job.status),
    line("Customer", job.customer),
    line("Printer", job.deviceModel),
    line("Printed", formatDate(job.startTime)),
    line("Plates", job.plate_count),
    line("Print run", job.print_run),
    line("Filament", formatWeight(job.total_weight_g)),
    line("Print time", formatDuration(job.total_time_s)),
    line("Estimated price", formatMoney(job.final_price)),
  ].join("\n");
}

export function formatProjectForClipboard(project: CopyProject, jobs: CopyJob[] = []): string {
  const sections = [
    `## ${titleOrFallback(project.name, `Project #${project.id}`)}`,
    line("Project ID", project.id),
    line("Customer", project.customer),
    line("Jobs", project.job_count ?? jobs.length),
    line("Plates", project.total_plates),
    line("Filament", formatWeight(project.total_weight_g)),
    line("Print time", formatDuration(project.total_time_s)),
  ];

  const notes = project.notes?.trim();
  if (notes) sections.push(line("Notes", notes));

  if (jobs.length > 0) {
    sections.push("", "### Prints");
    for (const job of jobs) {
      sections.push(
        `- ${titleOrFallback(job.designTitle, `Job #${job.id}`)} — ${formatWeight(job.total_weight_g)}, ${formatDuration(job.total_time_s)}, ${formatMoney(job.final_price)}`,
      );
    }
  }

  return sections.join("\n");
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is unavailable in this browser context.");
  }
  await navigator.clipboard.writeText(text);
}
