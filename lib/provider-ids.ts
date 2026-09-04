export function providerScopedId(provider: string, nativeId: string): string {
  return `${provider}:${nativeId}`;
}

export function providerNativeId(provider: string, scopedId: string): string {
  const prefix = `${provider}:`;
  return scopedId.startsWith(prefix) ? scopedId.slice(prefix.length) : scopedId;
}
