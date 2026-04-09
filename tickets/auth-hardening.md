# Auth hardening: cookie value, timing safety, and bypass scope

## Effort: Small
## Benefit: Low–Medium (defense in depth for a personal tool)

## Background

Three small auth issues identified in `api.ts` and `routes/ui.ts`:

### 1. Session cookie value is the literal API key

`routes/ui.ts` sets `setCookie(c, "session", API_KEY, ...)`. The cookie's value
is the raw secret. If the cookie ever appears in a log, crash dump, or error
response, the API key leaks directly. An opaque session token (HMAC of a random
nonce, or just a random token stored in a server-side Map) would limit exposure.

For a single-user personal tool this is low risk, but worth noting.

### 2. API key comparison is timing-sensitive

`api.ts` compares keys with `===`:

```ts
c.req.header("Authorization") === `Bearer ${API_KEY}`
getCookie(c, "session") === API_KEY
```

`===` on strings short-circuits on the first differing byte, which is technically
a timing oracle. For a long random key over a local network this is unexploitable
in practice, but `crypto.timingSafeEqual` is the correct primitive:

```ts
import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

### 3. `/ui/components/` auth bypass is broader than the handler's file regex

`api.ts` skips auth for any path that `startsWith("/ui/components/")`. The
actual handler at `routes/ui.ts` enforces `^[\w-]+\.js$` on the filename —
so e.g. `/ui/components/../data` bypasses auth middleware before Hono's router
resolves it. Hono doesn't normalize `..` the same way Express does, so there's
no path traversal to disk today, but the auth layer is wider than intended.

Tighten by either:
- Moving the file-extension check into the auth middleware, or
- Replacing the `startsWith` with a regex that matches the same set as the handler.

## Priority

For a personal/internal tool these are all low-priority. Fix them if the app
ever faces the public internet or if multiple users are added.
