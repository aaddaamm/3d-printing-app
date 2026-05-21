type LogLevel = "error" | "warn" | "info" | "debug";

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function resolveLogLevel(): LogLevel {
  const raw = (process.env["LOG_LEVEL"] ?? "info").toLowerCase();
  if (raw === "error" || raw === "warn" || raw === "info" || raw === "debug") return raw;
  return "info";
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= LEVELS[resolveLogLevel()];
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

export function logDebug(...args: unknown[]): void {
  if (!shouldLog("debug")) return;
  console.debug(...args);
}
