type LogLevel = "error" | "warn" | "info";

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
};

function resolveLogLevel(): LogLevel {
  const raw = (process.env["LOG_LEVEL"] ?? "info").toLowerCase();
  if (raw === "error") return "error";
  if (raw === "warn") return "warn";
  return "info";
}

const CURRENT_LEVEL = LEVELS[resolveLogLevel()];

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= CURRENT_LEVEL;
}

export function logError(...args: unknown[]): void {
  if (!shouldLog("error")) return;
  console.error(...args);
}

export function logWarn(...args: unknown[]): void {
  if (!shouldLog("warn")) return;
  console.warn(...args);
}

export function logInfo(...args: unknown[]): void {
  if (!shouldLog("info")) return;
  console.log(...args);
}

