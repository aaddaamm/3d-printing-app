# Robinson PrintWorks Brand Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a practical Robinson PrintWorks brand identity system, starting with documentation and governance, then applying it to website/app UI, product mockups, packaging, and reusable templates.

**Architecture:** The brand spec is the source of truth. A project-level Brand Guardian skill keeps future work aligned. Implementation proceeds in independent, reviewable units: audit, design tokens, UI application, asset prompts, packaging/social templates, and documentation.

**Tech Stack:** Markdown documentation, project-local skills, existing Preact/htm frontend, plain CSS, Hono routes, current no-build frontend architecture.

## Global Constraints

- Preserve the existing clean engineering-oriented spirit; evolve it rather than replacing it casually.
- Preferred identity direction is Deep Midnight Navy + restrained Electric Cyan.
- Accent usage should be approximately 15% of the composition.
- Avoid cyberpunk, RGB gamer, comic, steampunk, overly aggressive industrial, cheap Etsy, and generic 3D printer hobby branding.
- The Voron/printer may appear as a tool, but must not become the brand centerpiece.
- Brand-facing work must use `.claude/skills/brand-guardian/SKILL.md`.
- Follow project guidance: run `npm run lint`, `npm run typecheck`, and `npm test` before claiming implementation complete.

---

## File Structure

- `docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md` — source-of-truth brand design spec.
- `.claude/skills/brand-guardian/SKILL.md` — project skill that future agents load for brand-facing work.
- `docs/brand/` — create practical brand guide, prompt packs, template specs, and asset checklists.
- `frontend/app.css` — apply design tokens and visual language to the current UI.
- `frontend/components/` — adjust user-visible cards, navigation, buttons, badges, and empty states if needed.
- `frontend/index.html` — update metadata or global shell branding if needed.
- `README.md` or `CLAUDE.md` — add a short pointer to brand docs and Brand Guardian skill if useful.

---

### Task 1: Brand Governance Foundation

**Files:**

- Already created: `docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md`
- Already created: `.claude/skills/brand-guardian/SKILL.md`
- Create: `docs/brand/README.md`

**Interfaces:**

- Consumes: brand spec and Brand Guardian skill.
- Produces: a short entry point for humans and agents: `docs/brand/README.md`.

- [ ] **Step 1: Create brand documentation index**

Create `docs/brand/README.md`:

```markdown
# Robinson PrintWorks Brand

The brand source of truth is:

- `docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md`

Before changing brand-facing UI, product mockups, packaging, social templates, photography prompts, marketplace assets, colors, typography, icons, or logo usage, use:

- `.claude/skills/brand-guardian/SKILL.md`

## Current Direction

Robinson PrintWorks should feel modern, engineered, premium, reliable, clean, technical, approachable, creative, confident, and functional.

Preferred palette:

- Deep Midnight Navy `#061B33`
- Satin Royal Navy `#073B78`
- Electric Cyan `#22D3EE`
- Precision Cyan `#0891B2`
- Soft White `#F8FAFC`
- Cool Gray `#94A3B8`
- Graphite `#111827`

Use cyan as precision detailing, not decoration.

## Current Priority

Start by evolving the existing website/app visual language, then create product render prompts, packaging concepts, and social/marketplace templates.
```

- [ ] **Step 2: Verify files exist**

Run:

```bash
test -f docs/brand/README.md && test -f .claude/skills/brand-guardian/SKILL.md && test -f docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md
```

Expected: command exits with status 0.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md .claude/skills/brand-guardian/SKILL.md docs/brand/README.md
git commit -m "docs: add Robinson PrintWorks brand foundation"
```

---

### Task 2: Current Website/App Brand Audit

**Files:**

- Create: `docs/brand/current-site-audit.md`
- Read: `frontend/app.css`
- Read: `frontend/app.js`
- Read: `frontend/components/`
- Read: `routes/ui.ts`

**Interfaces:**

- Consumes: brand spec and current frontend.
- Produces: prioritized audit with exact selectors/components to change.

- [ ] **Step 1: Inspect frontend structure**

Run:

```bash
find frontend -maxdepth 3 -type f | sort
```

Expected: list of frontend files.

- [ ] **Step 2: Create audit document**

Create `docs/brand/current-site-audit.md` with this structure:

```markdown
# Current Website/App Brand Audit

## Summary

The current site/app should be evolved, not replaced. This audit identifies where to align the existing UI with the Robinson PrintWorks navy/cyan precision system.

## Keep

- Clean engineering-oriented layout.
- Existing no-build Preact/htm architecture.
- Clear pricing/job/project utility.

## Change

| Area                | Current issue                | Brand-aligned change                               | Files/selectors                |
| ------------------- | ---------------------------- | -------------------------------------------------- | ------------------------------ |
| Global color tokens | To be filled from inspection | Use navy/graphite base with restrained cyan accent | `frontend/app.css`             |
| Buttons             | To be filled from inspection | Strong primary CTA, subtle secondary controls      | `frontend/app.css`             |
| Cards               | To be filled from inspection | Premium dark/light cards with precise borders      | `frontend/app.css`, components |
| Badges/status       | To be filled from inspection | Cyan only for active/precision emphasis            | `frontend/app.css`, components |
| Empty states        | To be filled from inspection | More confident product/engineering tone            | components                     |

## Priority Order

1. Design tokens and base surfaces.
2. Buttons, links, badges, and focus states.
3. Cards and data panels.
4. Navigation and page headers.
5. Empty states and microcopy.
```

Then replace each `To be filled from inspection` with findings from the files.

- [ ] **Step 3: Verify audit has no placeholders**

Run:

```bash
! grep -R "To be filled\|TBD\|TODO" docs/brand/current-site-audit.md
```

Expected: command exits with status 0.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/current-site-audit.md
git commit -m "docs: audit current brand application"
```

---

### Task 3: Website/App Design Tokens

**Files:**

- Modify: `frontend/app.css`
- Test: browser/manual visual check, lint/typecheck/test suite

**Interfaces:**

- Consumes: audit from Task 2.
- Produces: CSS custom properties for brand colors, spacing, radii, shadows, borders, and focus states.

- [ ] **Step 1: Read current CSS**

Use the read tool on `frontend/app.css` before editing.

- [ ] **Step 2: Add or update CSS tokens**

At the top-level token section in `frontend/app.css`, define brand tokens equivalent to:

```css
:root {
  --brand-midnight: #061b33;
  --brand-royal: #073b78;
  --brand-cyan: #22d3ee;
  --brand-cyan-deep: #0891b2;
  --brand-white: #f8fafc;
  --brand-cool-gray: #94a3b8;
  --brand-graphite: #111827;
  --brand-radius-sm: 8px;
  --brand-radius-md: 12px;
  --brand-radius-lg: 18px;
  --brand-border-subtle: rgba(148, 163, 184, 0.24);
  --brand-border-accent: rgba(34, 211, 238, 0.32);
  --brand-shadow-soft: 0 18px 60px rgba(6, 27, 51, 0.18);
  --brand-focus-ring: 0 0 0 3px rgba(34, 211, 238, 0.28);
}
```

Adapt names if existing CSS naming conventions require it, but keep all values available.

- [ ] **Step 3: Apply tokens to global surfaces and controls**

Update existing selectors rather than adding a parallel styling system. Prioritize:

- `body`
- links
- buttons
- cards/panels
- inputs/forms
- focus states
- status badges
- navigation/header surfaces

- [ ] **Step 4: Run checks**

```bash
npm run lint
npm run typecheck
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/app.css
git commit -m "feat: add Robinson PrintWorks brand tokens"
```

---

### Task 4: Apply Brand Language to Key UI Components

**Files:**

- Modify: `frontend/components/` files identified in Task 2 audit
- Modify: `frontend/app.css`
- Test: lint/typecheck/test suite and visual inspection

**Interfaces:**

- Consumes: CSS tokens from Task 3.
- Produces: brand-aligned UI cards, navigation, buttons, badges, and empty states.

- [ ] **Step 1: Read component files identified in audit**

Use `module_report` or `read` for each relevant component before editing.

- [ ] **Step 2: Update markup/classes minimally**

Only change markup when CSS alone cannot express the design. Prefer existing component structure and class names.

- [ ] **Step 3: Update microcopy only where it improves trust**

Use concise, engineering-oriented language. Avoid hype. Example tone:

```text
Production-ready pricing from real print history.
```

Do not introduce unverified claims such as guaranteed tolerances, fastest turnaround, or certified engineering.

- [ ] **Step 4: Run checks**

```bash
npm run lint
npm run typecheck
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/components frontend/app.css
git commit -m "feat: align app UI with brand system"
```

---

### Task 5: Product Render and Photography Prompt Pack

**Files:**

- Create: `docs/brand/product-render-prompts.md`

**Interfaces:**

- Consumes: brand spec.
- Produces: reusable prompt pack for mockup boards and product renders.

- [ ] **Step 1: Create prompt pack**

Create `docs/brand/product-render-prompts.md` with sections:

```markdown
# Product Render and Photography Prompt Pack

## Base Style Prompt

Premium industrial design presentation for Robinson PrintWorks, deep midnight navy primary material, restrained electric cyan precision details, soft chamfers, rounded industrial geometry, subtle embossed branding, dark studio background, controlled softbox lighting, cyan rim light, soft reflections, macro detail photography, Apple/Formlabs-inspired product presentation, clean layout, no RGB gamer aesthetic, no cyberpunk, no comic style, no cheap Etsy styling.

## Product Ecosystem Board Prompt

Create a polished Robinson PrintWorks brand identity board showing an articulated gecko, Gridfinity bins, desk organizer, phone stand, cable organizer, hex key holder, wall organizer, business card holder, desktop sign, coasters, tool tray, filament sample card, printer badge, branded calibration cube, and packaging insert. All objects share the same navy/cyan visual language, rounded industrial forms, soft chamfers, subtle embossed marks, and restrained cyan precision details. Include labeled color swatches and material callouts.

## Individual Product Prompt Template

Product: [PRODUCT NAME]
Use: [FUNCTION]
Brand application: deep midnight navy body, electric cyan precision detail, subtle embossed Robinson PrintWorks mark, soft chamfers, functional geometry, premium dark studio lighting, macro close-up detail, minimal clutter.

## Negative Prompt

Avoid RGB lighting, cyberpunk, gamer styling, comic/cartoon style, steampunk, aggressive military styling, excessive ornamentation, cheap Etsy look, generic 3D printer clipart, noisy backgrounds, oversized logos, cyan-dominant surfaces.

## Shot List

1. Hero ecosystem board.
2. Macro logo emboss/deboss detail.
3. Articulated gecko family resemblance shot.
4. Desk organizer/Gridfinity utility shot.
5. Packaging insert and QR card flat lay.
6. Marketplace listing hero image.
7. Social launch square crop.
```

- [ ] **Step 2: Verify no placeholders except template fields**

Run:

```bash
! grep -R "TBD\|TODO" docs/brand/product-render-prompts.md
```

Expected: command exits with status 0.

- [ ] **Step 3: Commit**

```bash
git add docs/brand/product-render-prompts.md
git commit -m "docs: add brand render prompt pack"
```

---

### Task 6: Packaging and Social Template Specs

**Files:**

- Create: `docs/brand/packaging-system.md`
- Create: `docs/brand/social-marketplace-templates.md`

**Interfaces:**

- Consumes: brand spec and prompt pack.
- Produces: practical template descriptions for repeated real use.

- [ ] **Step 1: Create packaging spec**

Create `docs/brand/packaging-system.md` with exact sections:

```markdown
# Packaging System

## Principles

- Premium but practical for a small maker business.
- Navy/neutral base with restrained cyan precision details.
- Clear product identification and QR-driven instructions.
- Subtle marks that can be printed, stickered, stamped, embossed, or debossed.

## Components

| Item                 | Format                              | Brand treatment                                     |
| -------------------- | ----------------------------------- | --------------------------------------------------- |
| Product box          | Matte navy or kraft with navy label | Small mark, product name, cyan rule line            |
| Shipping label       | White label                         | Clean typography, small mark, no decorative clutter |
| Thank-you card       | A6 or 4x6                           | Navy front, cyan detail, concise message            |
| Instruction card     | A6 or 4x6                           | Step hierarchy, QR code, support URL                |
| Warranty card        | A6 or 4x6                           | Plain language, production/date field               |
| QR insert            | Business-card size                  | Product page, care instructions, contact            |
| Sticker              | Die-cut mark or wordmark            | One-color and navy/cyan variants                    |
| Filament sample card | Small card with sample clip         | Material, color, nozzle/temp notes                  |
| Packaging tape       | Navy mark repeat or cyan line       | Use sparingly; avoid loud patterning                |

## Copy Tone

Clear, useful, confident, and concise. Avoid hype and unsupported promises.
```

- [ ] **Step 2: Create social/marketplace spec**

Create `docs/brand/social-marketplace-templates.md` with exact sections:

```markdown
# Social and Marketplace Templates

## Template Rules

- Use the same product photography language as the brand spec.
- Keep layouts clean, with strong hierarchy and minimal labels.
- Use cyan for labels, rules, callouts, and precision highlights only.
- Preserve a consistent crop system for square, vertical, and thumbnail formats.

## Templates

| Template                 | Format           | Required elements                                  |
| ------------------------ | ---------------- | -------------------------------------------------- |
| Instagram product launch | 1:1 square       | Hero product, short title, cyan detail, small mark |
| Instagram process        | 4:5 vertical     | Before/after or macro detail, concise caption area |
| Facebook post            | 1.91:1 or square | Product image, title, CTA                          |
| YouTube thumbnail        | 16:9             | High-contrast product hero, 3-5 word title         |
| MakerWorld listing       | Marketplace hero | Product isolated on dark studio background         |
| Printables listing       | Marketplace hero | Product and use-case view                          |
| Sale graphic             | Square and story | Offer, product, restrained accent                  |
| STL release              | Square           | Render, file/type label, version/date              |

## Reusable Copy Patterns

- Designed for practical daily use.
- Printed, tested, and refined in-house.
- Functional parts with a clean engineered finish.
- Custom design and rapid prototyping from real print experience.
```

- [ ] **Step 3: Verify docs**

```bash
! grep -R "TBD\|TODO" docs/brand/packaging-system.md docs/brand/social-marketplace-templates.md
```

Expected: command exits with status 0.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/packaging-system.md docs/brand/social-marketplace-templates.md
git commit -m "docs: define packaging and social templates"
```

---

### Task 7: Final Brand Review and Verification

**Files:**

- Modify if needed: files changed in Tasks 1-6
- Create: `docs/brand/brand-review.md`

**Interfaces:**

- Consumes: all brand work.
- Produces: final review checklist and remaining work list.

- [ ] **Step 1: Create review document**

Create `docs/brand/brand-review.md`:

```markdown
# Brand Review

## Reviewed Against

- `docs/superpowers/specs/2026-07-02-robinson-printworks-brand-identity-design.md`
- `.claude/skills/brand-guardian/SKILL.md`

## Brand Fit

The current work aligns with the Robinson PrintWorks direction if it preserves a clean engineering feel, uses navy/neutral surfaces with restrained cyan precision details, and treats products, packaging, UI, and marketplace assets as one ecosystem.

## Checklist

- [ ] Navy/cyan system is present and restrained.
- [ ] Cyan is used as precision detailing, not decoration.
- [ ] UI, mockups, packaging, and templates feel related.
- [ ] The Voron/printer is not the centerpiece.
- [ ] Logo usage supports small physical applications.
- [ ] Copy is confident, technical, and approachable.
- [ ] No RGB gamer, cyberpunk, comic, steampunk, or cheap Etsy drift.

## Remaining Work

- Generate actual visual boards from the prompt pack.
- Choose final logo direction after comparing marks at 20 mm.
- Apply final identity to real product photography and marketplace assets.
- Consider a future public website refresh once visual boards are selected.
```

- [ ] **Step 2: Run project verification**

```bash
npm run lint
npm run typecheck
npm test
```

Expected: all pass.

- [ ] **Step 3: Run diagnostics**

```bash
git status --short
```

Expected: only intended brand files are modified before commit.

- [ ] **Step 4: Commit**

```bash
git add docs/brand/brand-review.md
git commit -m "docs: add brand review checklist"
```

---

## Plan Self-Review

- Spec coverage: covered governance, colors, logo constraints, product mockups, photography, website/app system, packaging, social, trade show direction through docs and implementation tasks.
- Placeholder scan: plan uses template placeholder fields only in the render prompt template; no implementation TBD/TODO placeholders are required.
- Type consistency: no new TypeScript interfaces are introduced; CSS token names are consistent within the plan.
