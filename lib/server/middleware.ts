import type { MiddlewareHandler } from "hono";
import { cyan, dim, green, red, yellow } from "../colors.js";
import { logInfo } from "../logger.js";

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return cyan(method.padEnd(6));
    case "POST":
      return green(method.padEnd(6));
    case "PUT":
    case "PATCH":
      return yellow(method.padEnd(6));
    case "DELETE":
      return red(method.padEnd(6));
    default:
      return method.padEnd(6);
  }
}

function statusColor(status: number): string {
  if (status < 300) return green(status);
  if (status < 400) return cyan(status);
  if (status < 500) return yellow(status);
  return red(status);
}

function formatRequestLogLine(method: string, path: string, status: number, ms: number): string {
  return `  ${methodColor(method)} ${path} ${dim("→")} ${statusColor(status)} ${dim(`${ms}ms`)}`;
}

export function createRequestLogger(enabled: boolean): MiddlewareHandler {
  return async (c, next) => {
    if (!enabled) {
      await next();
      return;
    }

    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    logInfo(formatRequestLogLine(c.req.method, c.req.path, c.res.status, ms));
  };
}
