---
title: Route navigation predicates need regression coverage for new app sections
category: testing
severity: low
tags:
  - frontend
  - navigation
  - routes
  - active-state
  - regression-tests
  - vitest
  - catalog-ui
applies_when:
  - Adding a new top-level route or app section to the PrintWorks frontend
  - Reviewing SPA navigation active-state predicates
  - Splitting route detection across shell routing and navigation components
  - Adding minimal UI slices where the page renders but nav state can still be wrong
---

# Problem

A new Catalog route rendered correctly, but the Jobs navigation item also stayed active on `/catalog`. The page-level router knew about the Catalog route, while the Jobs nav active predicate only excluded the older non-job routes.

# Context

The catalog API/UI slice added a top-level Catalog tab and route. Review found that `renderMainContent()` handled `route.isCatalog`, but `isJobsRoute()` still returned `true` for any route that was not Projects, Admin, or Printers.

That made the UI subtly wrong even though the Catalog page and API behavior worked. This kind of bug is easy to miss in API-focused tests because it lives in route classification glue rather than the new page component itself.

# Solution

When adding a top-level route:

- Update the main route-state helper.
- Update every nav active-state predicate that defines a default or catch-all route.
- Export small pure route predicates when useful so they can be unit-tested directly.
- Add a regression test for the new route and nearby existing routes.

For this case, the fix was:

- Export `isJobsRoute()` from `frontend/components/jobs-view.ts`.
- Exclude `/catalog` from the Jobs route predicate.
- Add `tests/jobs-view.test.ts` to assert Jobs is active only on job routes and inactive on `/catalog`, `/projects`, `/printers`, and `/admin`.

# Why this works

Catch-all route predicates are negative lists. Every new top-level route must be excluded explicitly unless the route system is refactored to a positive match. A small pure-function test is faster and less brittle than a browser test for this logic, while still catching the user-visible double-active-nav state.

# Prevention

Future `02-plan` runs for frontend route additions should include a route/nav regression test task, not just page rendering and API tests.

Future `04-review` runs should check:

- Does the new route render in the shell?
- Does the nav expose the new route?
- Do existing catch-all/default route predicates exclude it?
- Is there a focused unit test for route classification or active nav state?
