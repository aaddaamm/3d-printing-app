# Security: CSV formula injection in export endpoint

## Effort: Small
## Benefit: Medium (security hygiene)

## Background

`GET /jobs/export.csv` builds CSV rows from user-controlled fields:
`customer`, `notes`, `designTitle`, `deviceModel`, `status_override`.

The `escape` helper wraps values in double quotes and escapes internal `"`:

```ts
const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
```

This prevents CSV parsing issues but does not block formula injection. If a
customer name is set to `=HYPERLINK("http://evil.com","Click")`, Excel and Google
Sheets will execute it when the file is opened. This is a real vector when CSV
exports are shared with clients or imported into shared financial tools.

## Fix

Sanitize any cell value that starts with a formula-injection trigger character
before wrapping it:

```ts
const INJECTION_CHARS = /^[=+\-@\t\r]/;

const escape = (v: unknown) => {
  const s = String(v);
  const safe = INJECTION_CHARS.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
```

Prepending `'` causes Excel to treat the cell as a literal string. This is
the standard mitigation (OWASP recommendation).

## Affected fields

Any free-text field the user can write: `customer`, `notes`, `status_override`,
and to a lesser extent `designTitle` (sourced from Bambu API, less controllable
but still potentially attacker-influenced).
