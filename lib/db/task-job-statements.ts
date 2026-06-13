import type Database from "better-sqlite3";
import type { Job, JobFilament, PrintTask } from "../types.js";

export function createTaskJobStatements(db: Database.Database) {
  return {
    upsertTask: db.prepare<PrintTask>(`
      INSERT INTO print_tasks (
        id, provider, provider_task_id, provider_printer_id, printer_id,
        session_id, instanceId, plateIndex,
        deviceId, deviceName, deviceModel,
        designId, designTitle, modelId, profileId, title,
        status, failedType, bedType,
        weight, length, costTime, startTime, endTime,
        cover, thumbnail, raw_json
      ) VALUES (
        @id, @provider, @provider_task_id, @provider_printer_id, @printer_id,
        @session_id, @instanceId, @plateIndex,
        @deviceId, @deviceName, @deviceModel,
        @designId, @designTitle, @modelId, @profileId, @title,
        @status, @failedType, @bedType,
        @weight, @length, @costTime, @startTime, @endTime,
        @cover, @thumbnail, @raw_json
      )
      ON CONFLICT(id) DO UPDATE SET
        provider=excluded.provider,       provider_task_id=excluded.provider_task_id,
        provider_printer_id=excluded.provider_printer_id, printer_id=excluded.printer_id,
        session_id=excluded.session_id,
        instanceId=excluded.instanceId,   plateIndex=excluded.plateIndex,
        deviceId=excluded.deviceId,       deviceName=excluded.deviceName,     deviceModel=excluded.deviceModel,
        designId=excluded.designId,       designTitle=excluded.designTitle,
        modelId=excluded.modelId,         profileId=excluded.profileId,       title=excluded.title,
        status=excluded.status,           failedType=excluded.failedType,     bedType=excluded.bedType,
        weight=excluded.weight,           length=excluded.length,             costTime=excluded.costTime,
        startTime=excluded.startTime,     endTime=excluded.endTime,
        cover=excluded.cover,             thumbnail=excluded.thumbnail,
        raw_json=excluded.raw_json
    `),

    getTaskById: db.prepare<[string], PrintTask>("SELECT * FROM print_tasks WHERE id = ?"),

    upsertJob: db.prepare<
      Omit<
        Job,
        | "id"
        | "customer"
        | "notes"
        | "price_override"
        | "status_override"
        | "project_id"
        | "extra_labor_minutes"
      >
    >(`
      INSERT INTO jobs (
        provider, provider_session_id, provider_printer_id, printer_id,
        session_id, instanceId, print_run, designId, designTitle, modelId, deviceId, deviceModel,
        startTime, endTime, total_weight_g, total_time_s, plate_count, status
      ) VALUES (
        @provider, @provider_session_id, @provider_printer_id, @printer_id,
        @session_id, @instanceId, @print_run, @designId, @designTitle, @modelId, @deviceId, @deviceModel,
        @startTime, @endTime, @total_weight_g, @total_time_s, @plate_count, @status
      )
      ON CONFLICT(session_id) DO UPDATE SET
        provider=excluded.provider,         provider_session_id=excluded.provider_session_id,
        provider_printer_id=excluded.provider_printer_id, printer_id=excluded.printer_id,
        instanceId=excluded.instanceId,     print_run=excluded.print_run,
        designId=excluded.designId,         designTitle=excluded.designTitle,
        modelId=excluded.modelId,
        deviceId=excluded.deviceId,         deviceModel=excluded.deviceModel,
        startTime=excluded.startTime,       endTime=excluded.endTime,
        total_weight_g=excluded.total_weight_g, total_time_s=excluded.total_time_s,
        plate_count=excluded.plate_count,   status=excluded.status
    `),

    getJobById: db.prepare<[number], Job>("SELECT * FROM jobs WHERE id = ?"),

    patchJob: db.prepare<
      Pick<
        Job,
        | "customer"
        | "notes"
        | "price_override"
        | "status_override"
        | "project_id"
        | "extra_labor_minutes"
        | "id"
      >
    >(`
      UPDATE jobs SET customer=@customer, notes=@notes, price_override=@price_override,
        status_override=@status_override, project_id=@project_id, extra_labor_minutes=@extra_labor_minutes
      WHERE id=@id
    `),

    deleteJobFilaments: db.prepare<[string]>("DELETE FROM job_filaments WHERE task_id = ?"),

    insertFilament: db.prepare<Omit<JobFilament, "id">>(`
      INSERT INTO job_filaments (task_id, instanceId, filament_type, filament_id, color, weight_g, ams_id, slot_id)
      VALUES (@task_id, @instanceId, @filament_type, @filament_id, @color, @weight_g, @ams_id, @slot_id)
    `),

    getFilamentsBySession: db.prepare<[string], JobFilament>(`
      SELECT jf.* FROM job_filaments jf
      JOIN print_tasks pt ON jf.task_id = pt.id
      WHERE pt.session_id = ?
      ORDER BY jf.task_id, jf.ams_id, jf.slot_id
    `),
  };
}
