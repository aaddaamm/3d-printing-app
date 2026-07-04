import { fetchTasks } from "../../fetch.js";
import { normalizeTask } from "../../normalize.js";
import type { BambuApiTask, PrintTask } from "../../types.js";
import type {
  CanonicalPrintStatus,
  HistorySyncOptions,
  HistorySyncResult,
  NormalizedMaterialUsage,
  NormalizedMediaAsset,
  NormalizedPrintRecord,
  PrinterIdentity,
  PrintHistoryProvider,
  ProviderCapability,
} from "../types.js";

const BAMBU_PROVIDER_ID = "bambu";
const CANONICAL_BAMBU_STATUSES = new Set<string>([
  "created",
  "running",
  "pause",
  "finish",
  "cancel",
  "failed",
]);

export type BambuCloudProviderConfig = {
  baseUrl: string;
  token: string;
  limit: number;
  deviceId?: string | undefined;
};

export type BambuTaskPage = {
  apiTotal: number | string;
  tasks: BambuApiTask[];
  printTasks: PrintTask[];
  records: NormalizedPrintRecord[];
};

function toStatus(status: string | null): CanonicalPrintStatus {
  if (status && CANONICAL_BAMBU_STATUSES.has(status)) return status as CanonicalPrintStatus;
  return "unknown";
}

function toMaterials(task: BambuApiTask): NormalizedMaterialUsage[] {
  const slots = task.amsDetailMapping ?? [];
  return slots.map((slot) => ({
    weight_g: slot.weight,
    filament_type: slot.filamentType,
    filament_id: slot.filamentId,
    color: slot.targetColor,
    slot_id: `${slot.amsId}:${slot.slotId}`,
    confidence: "actual",
    raw: slot,
  }));
}

function toMedia(task: BambuApiTask): NormalizedMediaAsset[] {
  const assets: NormalizedMediaAsset[] = [];
  if (task.cover) assets.push({ kind: "cover", url: task.cover });
  if (task.thumbnail) assets.push({ kind: "thumbnail", url: task.thumbnail });
  return assets;
}

function toPrinter(task: BambuApiTask): PrinterIdentity | null {
  if (!task.deviceId) return null;
  return {
    provider_id: BAMBU_PROVIDER_ID,
    provider_printer_id: task.deviceId,
    name: task.deviceName,
    model: task.deviceModel,
  };
}

export class BambuCloudProvider implements PrintHistoryProvider {
  readonly id = BAMBU_PROVIDER_ID;
  readonly display_name = "Bambu Lab";
  readonly capabilities: ProviderCapability[] = [
    "history:list",
    "history:actual_filament",
    "media:thumbnail",
    "printer:identity",
  ];

  constructor(private readonly config: BambuCloudProviderConfig) {}

  async listPrinters(): Promise<PrinterIdentity[]> {
    return [];
  }

  async fetchTaskPage(offset = 0): Promise<BambuTaskPage> {
    const page = await fetchTasks({
      baseUrl: this.config.baseUrl,
      token: this.config.token,
      limit: this.config.limit,
      offset,
      deviceId: this.config.deviceId,
    });
    const tasks = page.hits ?? [];
    return {
      apiTotal: page.total ?? "?",
      tasks,
      printTasks: tasks.map((task) => normalizeTask(task)),
      records: tasks.map((task) => this.toNormalizedRecord(task)),
    };
  }

  async fetchHistory(options: HistorySyncOptions = {}): Promise<HistorySyncResult> {
    const maxRecords = options.limit ?? Number.POSITIVE_INFINITY;
    const records: NormalizedPrintRecord[] = [];
    const printersById = new Map<string, PrinterIdentity>();
    let offset = 0;
    let apiTotal = Number.POSITIVE_INFINITY;

    while (records.length < maxRecords && offset < apiTotal) {
      const page = await this.fetchTaskPage(offset);
      if (page.tasks.length === 0) break;
      apiTotal = typeof page.apiTotal === "number" ? page.apiTotal : apiTotal;

      for (const record of page.records) {
        records.push(record);
        if (record.printer) printersById.set(record.printer.provider_printer_id, record.printer);
        if (records.length >= maxRecords) break;
      }

      offset += page.tasks.length;
    }

    return {
      provider_id: this.id,
      records,
      printers: [...printersById.values()],
      errors: [],
    };
  }

  toNormalizedRecord(task: BambuApiTask): NormalizedPrintRecord {
    const normalized = normalizeTask(task);
    return {
      provider_id: this.id,
      provider_record_id: normalized.provider_task_id ?? normalized.id,
      provider_printer_id: normalized.provider_printer_id,
      title: normalized.title,
      status: toStatus(normalized.status),
      started_at: normalized.startTime,
      ended_at: normalized.endTime,
      duration_s: normalized.costTime,
      printer: toPrinter(task),
      materials: toMaterials(task),
      media: toMedia(task),
      raw: task,
      provider_metadata: {
        instanceId: normalized.instanceId,
        plateIndex: normalized.plateIndex,
        designId: normalized.designId,
        designTitle: normalized.designTitle,
        modelId: normalized.modelId,
        profileId: normalized.profileId,
        failedType: normalized.failedType,
        bedType: normalized.bedType,
      },
    };
  }
}
