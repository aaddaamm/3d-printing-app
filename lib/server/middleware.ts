import { timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie"; // pi-lens-ignore: ast-grep:find-import-file-without-extension, find-import-file-without-extension
import { cyan, dim, green, red, yellow } from "../colors.js";
import { logInfo } from "../logger.js";
import { createSessionCookieValue } from "./session.js";

const PUBLIC_PATHS = new Set(["/health", "/ui/login", "/ui/app.js", "/ui/app.css"]);
const PUBLIC_FONT_RE = /^\/ui\/fonts\/[\w,.-]+\.(?:woff2|ttf)$/;

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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || PUBLIC_FONT_RE.test(pathname);
}

function formatRequestLogLine(method: string, path: string, status: number, ms: number): string {
  return `  ${methodColor(method)} ${path} ${dim("→")} ${statusColor(status)} ${dim(`${ms}ms`)}`;
}

function isAuthorizedRequest(
  path: string,
  authorizationHeader: string,
  session: string,
  apiKey: string,
): boolean {
  return (
    isPublicPath(path) ||
    safeEqual(authorizationHeader, `Bearer ${apiKey}`) ||
    safeEqual(session, createSessionCookieValue(apiKey))
  );
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

export function createAuthMiddleware(apiKey: string): MiddlewareHandler {
  return async (c, next) => {
    const path = c.req.path;
    const authorizationHeader = c.req.header("Authorization") ?? "";
    const session = getCookie(c, "session") ?? "";

    if (isAuthorizedRequest(path, authorizationHeader, session, apiKey)) {
      await next();
      return;
    }

    if (path.startsWith("/ui")) return c.redirect("/ui/login");
    return c.json({ error: "Unauthorized" }, 401);
  };
}
