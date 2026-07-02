import { createHmac } from "node:crypto";

const SESSION_COOKIE_PURPOSE = "printworks-session-cookie:v1";

export function createSessionCookieValue(apiKey: string): string {
  return `v1.${createHmac("sha256", apiKey).update(SESSION_COOKIE_PURPOSE).digest("base64url")}`;
}
