# Security: API key exposed in browser memory

**Priority:** Medium
**File:** `routes/ui.ts:97`

## Problem

The API key is injected into HTML as a global variable:

```typescript
<script>window.API_KEY=${JSON.stringify(apiKey)}</script>
```

Any XSS vulnerability in the frontend exposes the API key.

## Approach

Instead of injecting the key, use session-only auth:

1. API routes check for valid session cookie (already done for `/ui`)
2. Frontend makes API calls with credentials: `fetch(url, { credentials: 'include' })`
3. Remove the key from HTML entirely

This means the API key never leaves the server.

## Tradeoff

- **Pro:** More secure, matches modern web standards
- **Con:** Requires frontend changes to pass credentials

## Note

This is lower priority if the frontend is trusted code (no user-submitted content, no third-party scripts).
