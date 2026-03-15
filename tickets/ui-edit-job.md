# Job Editing in the UI

## Effort: Low
## Benefit: High

## Background

The API already supports PATCH /jobs/:id with fields: customer, notes,
price_override, status_override. The UI has no way to set customer/notes/price
— you need to use curl or another API client. Status override is already done.

## Work

Add inline editing to the job table/detail view:
- Customer field: text input, saved on blur or Enter
- Notes field: textarea, saved on blur or Enter  
- Price override: number input with a "clear override" button to revert to calculated price

The UI already fetches data with the Bearer token embedded, so PATCH requests
from the page can use the same key (it's already in the JS as `API_KEY`).

## UX considerations

- Show calculated price alongside override so the margin is visible
- Indicate visually when a price_override is active (already done with a badge in the
  current UI — just needs the input wired up)
- Debounce or confirm-on-blur to avoid accidental saves
