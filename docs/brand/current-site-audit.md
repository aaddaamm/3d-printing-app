# Current Website/App Brand Audit

## Summary

The current site/app should be evolved, not replaced. It already has a clean, technical dashboard feel, local fonts, dark surfaces, compact information density, and restrained component structure. The main brand drift is that the visual language currently leans neon/cyber dashboard because of bright cyan, magenta gradients, glow effects, scan animations, and the legacy `bambu history` name. The Robinson PrintWorks system should keep the engineered utility while moving toward deep navy, graphite, restrained cyan precision details, calmer surfaces, and broader PrintWorks ecosystem language.

## Keep

- Clean engineering-oriented layout and compact information density.
- Existing no-build Preact/htm frontend architecture.
- Local Inter and JetBrains Mono fonts.
- Dark mode as the primary operating environment.
- Clear pricing/job/project utility.
- Card/table density controls and direct operational navigation.
- Existing printer/job/project structure as business functionality, while avoiding printer-centric brand identity.

## Change

| Area | Current issue | Brand-aligned change | Files/selectors |
| --- | --- | --- | --- |
| Global color tokens | `:root` uses near-black surfaces, neon `#00f5ff`, magenta `--accent-2`, glow variables, and cyan/magenta panel borders. | Add explicit Robinson PrintWorks tokens: Deep Midnight Navy, Satin Royal Navy, Electric Cyan, Precision Cyan, Soft White, Cool Gray, Graphite. Retire magenta as a primary UI accent. | `frontend/app.css` `:root`, `body`, `::selection`, `:focus-visible` |
| Page background | Body uses visible grid texture plus cyan and magenta radial glows, which can read cyber/RGB dashboard. | Keep dark technical depth, but shift to midnight/navy gradients with one restrained cyan accent glow and subtler grid/noise. | `frontend/app.css` `body` |
| Header naming | Header still says `bambu history`, and the login/shell titles say `Bambu Print History`. | Move visible product naming toward Robinson PrintWorks / PrintWorks operations while keeping Bambu as provider context where needed. | `frontend/components/jobs-view.ts` `Header`; `frontend/index.html`; `routes/ui.ts` `LOGIN_HTML` |
| Header styling | Header uses neon cyan cursor and cyan border; current wordmark is lowercase tool-style rather than brand-forward. | Keep the compact technical header, but use navy/graphite glass, restrained cyan badge/cursor, and brand/system wording. | `frontend/app.css` `header`, `header h1`, `.brand-cursor`, `.header-range`, `.top-nav`, `.nav-btn` |
| Toolbar | Toolbar uses a magenta-tinted border/background and black form fields. | Use graphite/navy form surfaces, cool-gray borders, cyan focus rings, and remove magenta as a structural accent. | `frontend/app.css` `.toolbar`, `.toolbar input`, `.toolbar select` |
| Buttons | Primary/add buttons use cyan-to-magenta gradients and glow; hover effects emphasize neon energy. | Use navy/royal base with cyan edge/detail or cyan primary fills only for key actions; keep hover precise and reduce glow. | `frontend/app.css` `.btn-primary`, `.btn-secondary`, `.add-jobs-btn`, `.btn-csv`, `.btn-link`, `.view-btn`, `.density-btn` |
| Cards and panels | Cards use cyan/magenta border interplay, glow-on-hover, and animated printer scan effects. | Use premium navy panels, subtle borders, soft elevation, restrained cyan border on active/hover states only. Remove magenta glow and reduce animation. | `frontend/app.css` `.card`, `.card:hover`, `.proj-card`, `.proj-card:hover`, `.printer-card`, `.jobs-record-row`, `.dashboard-loader-card` |
| Badges/status | Running badge uses cyan/purple gradient; statuses are functional but not connected to the brand system. | Keep semantic colors for states, but make active/running cyan restrained and avoid decorative gradients. | `frontend/app.css` `.badge`, `.badge-running`, `.badge-finish`, `.badge-failed`, `.badge-cancel`, `.badge-pause` |
| Loading states | Loading shell uses `bambu history`, `INTERNAL PRINT DASHBOARD`, bright cursor, progress animation, and dashboard skeletons. | Rename to PrintWorks workspace/operations language, use calm navy/cyan progress detail, and keep skeletons premium and subdued. | `frontend/index.html`; `frontend/components/app-shell.ts` `LoadingView`; `frontend/app.css` `.app-loading`, `.loader-*`, `.dashboard-loader-*` |
| Empty states | Empty copy is functional but generic; project placeholder uses a printer emoji. | Use more confident operational copy and replace emoji placeholders with branded neutral geometry or simple icon treatment. | `frontend/components/projects-view-parts.ts`, `frontend/components/projects-view-modals.ts`, `frontend/components/jobs-printer-breakdown.ts`, `.empty`, `.proj-card-cover--empty` |
| Printer view | Printer cards use animated scan glints and can make printers feel like the visual centerpiece. | Keep printer management as a tool view, but reduce hero treatment and align cards with the same product/system panel language. | `frontend/components/jobs-printer-breakdown.ts`; `frontend/app.css` `.printer-card`, `.printer-card::before`, `.printer-card::after` |
| Login page | Login page is inline-styled black/teal and titled `Sign in — Bambu Print History`. | Align with brand tokens and rename to Robinson PrintWorks / PrintWorks Operations. | `routes/ui.ts` `LOGIN_HTML` |
| Shell metadata | Browser title and initial loader reference Bambu rather than Robinson PrintWorks. | Update static shell metadata and pre-app loader to Robinson PrintWorks language. | `frontend/index.html` |

## Priority Order

1. Design tokens and base surfaces.
2. Header, shell metadata, and login naming.
3. Buttons, links, badges, and focus states.
4. Cards, panels, tables, and data surfaces.
5. Loading states, empty states, and microcopy.
6. Printer view treatment so printers are clearly tools, not the brand centerpiece.

## Brand Guardian Review

**Brand fit:** The existing UI is a strong technical foundation, but it needs to be calmed and broadened from Bambu/neon dashboard toward Robinson PrintWorks premium engineering.

**Spec alignment:**

- Color: replace magenta/neon emphasis with deep navy, graphite, and restrained cyan precision details.
- Form: keep compact cards and tables, but shift hover/border language toward soft chamfers, subtle panels, and premium surfaces.
- Ecosystem: update copy so jobs, projects, pricing, printers, and products feel like one PrintWorks operating system.
- Photography/product direction: avoid making printer imagery the visual hero unless context specifically requires a printer management view.

**Risks:** Overcorrecting into generic SaaS dark mode would lose the maker/engineering character; keeping magenta glows and scan effects would drift toward cyber/RGB styling.

**Next adjustment:** Introduce brand tokens in `frontend/app.css`, then update header/shell naming and primary control styles before touching deeper component markup.
