export function resolveServerHost(env: NodeJS.ProcessEnv = process.env): string {
  return env["HOST"]?.trim() || "127.0.0.1";
}
