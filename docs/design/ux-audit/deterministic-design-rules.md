# Deterministic design rules (`DET.*`)

Rules in this catalog are intended for **automated or scripted** evaluation (DOM crawl, static HTML scan, repo/Catalog JSON, screenshot bitmap hooks). They **must not** require an LLM to classify pass/fail.

**Convention:** `DET.<AREA>.<NAME>` — stable IDs for remediation plans, scorer defects, and AI batch cross-tags.

## Global / governance

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.HASH.MARKERS` | Each emitted visual root has **`hash="XYZ"`** and **`data-ks-hash="XYZ"`** (3-letter ASCII, registry-unique). | Raw HTML / showcase scan |
| `DET.HASH.REGISTRY_ROW` | Hash exists in `visual-registry.yaml` (or generated JSON) with expected `type`. | `check-visual-catalog.mjs` |
| `DET.CONTRACT.PATH` | Active rows reference an on-disk contract `.md` where required by registry policy. | Catalog check |
| `DET.CONTRACT.PLACEHOLDERS` | Contract body has no unresolved `TBD` / `TODO` / `FIXME` bullets (when strict mode enabled). | `inventory-ks-visuals.mjs` / contract linter |
| `DET.CATALOG.CONTRACT_SPECIFICITY` | Contract includes element-specific **Expected anatomy**, **Forbidden patterns**, and **Verification**—not only generic boilerplate repeated across unrelated hashes. | Repo scan / heuristic |
| `DET.SCREENSHOT.STATUS` | When `screenshot_status: captured`, PNG exists at catalog path; blocked rows documented. | Screenshot manifest |
| `DET.INVENTORY.CROSSWALK` | Showcase-emitted hashes ⊆ registry; no stray tokens. | `visual-inventory.generated.json` |

## Kitchen Sink consumer governance (`DET.KS.*`)

Scoped to **KS-driven** sites (`rulesScope` `ks` / `auto` when repo or DOM detects Kitchen Sink). Generic marketing sites are not scored on these rules.

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.KS.PRIMITIVE_VERSION_MATCH` | When `data-ks-primitive-version` or registry/contract `primitive_version` is set, runtime and catalog agree per react-primitive hash. | DOM + `visual-registry.generated.json` |
| `DET.KS.CONSUMER_ASSET_BUNDLE` | Pages with KS/react roots link theme + primitive CSS; live crawl asset URLs resolve (not 404). | DOM `<link>` / `<script>`; HTTP status |
| `DET.KS.HASH_SEMANTIC_UNIQUENESS` | A hash is not reused for unrelated `data-ks-type` / `data-ks-name` anatomy on the same page/build. | DOM / static HTML |
| `DET.KS.CONTRACT_EXAMPLE_SYNC` | Rule-page examples cite governed hashes in remediation/checks; `## Deterministic checks` lists the rule id. | Repo scan of `docs/design/ux-audit/rule-pages/` |
| `DET.KS.CSS_SCOPE_LEAK` | KS theme CSS does not apply destructive global styles to host-app controls outside KS roots. | Live computed styles (skipped in static-only) |
| `DET.KS.VISUAL_FAMILY_COVERAGE` | Consumer-bound registry rows (`emits_html`, react-primitive, component/svg sources) have `own` or `family-covered` contracts on disk. | Registry + contract paths |

## Page-level

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.PAGE.MODE` | Page declares a **single primary mode** (marketing, handbook, listing, product detail, app shell, dashboard, wizard, data report, presentation) via metadata or predictable landmark/layout pattern—no ambiguous competing modes above the fold. | Layout class / `data-*` / heading stack |
| `DET.PAGE.TITLE` | `<title>` present, non-empty, not generic placeholder. | DOM |
| `DET.PAGE.LANG` | `<html lang>` set appropriately. | DOM |
| `DET.PAGE.VIEWPORT` | Responsive viewport meta present for web pages. | DOM |
| `DET.CONTEXT.BURDEN` | Quantitative caps: e.g. hero region interactive controls ≤ **N**, distinct nav bands ≤ **N**, above-the-fold link clusters ≤ threshold (per standard doc). | Crawl metrics |
| `DET.VISUAL.RHYTHM` | Repeated vertical spacing tokens between sections (CSS variable / shared class)—no ad hoc arbitrary gaps beyond tolerance. | Computed style sample / design token audit |
| `DET.LANDMARKS.REQUIRED` | `main`, `nav` (where applicable), `header`/`footer` landmarks exist and are unique per spec. | DOM |

## Layout & chrome

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.LAYOUT.GRID_CONSISTENCY` | Content aligns to layout grid (max width, gutters); no accidental full-bleed text rivers. | CSS / screenshot diff |
| `DET.CHROME.BOUNDARY` | Chrome (header/footer/sidebars) visually separated from content (`border`, `bg`, `shadow`) per contract. | Screenshot / CSS |
| `DET.NAV.DEPTH` | Global nav depth ≤ configured max; no excessive nested flyouts without mega-menu pattern. | DOM tree depth |
| `DET.NAV.DEDUP` | Same destination not repeated redundantly in conflicting nav bands without intentional hierarchy. | Link graph |

## Sections & content blocks

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.SECTION.HEADING` | Each major section has one heading; order matches outline. | Heading crawl |
| `DET.SECTION.SINGLE_JOB` | Section wraps one coherent topic (detectable via heading + keyword clustering heuristic). | NLP/heuristic optional |
| `DET.PROSE.LENGTH` | Paragraph length ≤ max words (configurable); lists capped per UX standard. | Text extraction |

## Cards & surfaces

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.CARD.TITLE` | Card has visible title or `aria-labelledby`. | DOM |
| `DET.CARD.ACTION_LIMIT` | ≤1 primary action per card unless “toolbar card” contract applies. | DOM |
| `DET.SURFACE.ELEVATION_TOKEN` | Surfaces use sanctioned elevation/border tokens—not raw one-off box-shadows outside theme. | CSS token scan |

## Navigation components

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.NAV.IN_PAGE_TOC` | Handbook/doc pages expose TOC when length exceeds threshold; links skip correctly. | Anchor map |
| `DET.NAV.FOCUS_ORDER` | Focus order matches visual order for keyboard traversal sample paths. | Automated tab order |
| `DET.NAV.BREADCRUMB` | Product/doc hubs include breadcrumb where registry marks `chrome-region` breadcrumb contract. | DOM presence |
| `DET.HTML.EMPTY_INLINE` | No empty `<strong>` / `<em>` in `main` (autodoc table focus rows). | DOM text |

## CTAs & button groups

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.CTA.HIERARCHY` | One **primary** CTA per logical viewport region (hero, sticky footer, modal). | Button class scan |
| `DET.CTA.LABEL_NONEMPTY` | Buttons/links have non-empty accessible names. | DOM |
| `DET.BUTTON.GROUP.MAX` | Horizontal button groups ≤ **N** visible actions before overflow/disclosure. | Layout metric |

## Data & charts

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.DATA.TABLE_HEADERS` | Tables have `<th>` scope or explicit `headers` associations. | DOM |
| `DET.CHART.ALT_SUMMARY` | Chart/graph has text summary, `aria-describedby`, or nearby caption. | DOM |
| `DET.DATA.COLOR_ONLY` | Meaning not conveyed by color alone (pattern/label redundancy check where detectable). | Heuristic |

## Diagrams & visual systems

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.DIAGRAM.LABELS` | SVG/diagram includes readable labels tied to contract legend keys. | SVG text nodes |
| `DET.DIAGRAM.ALT` | Decorative vs informative classification matches `role="img"` / `aria-hidden` usage. | DOM |
| `DET.DIAGRAM.ASSET_REGISTRY` | Diagram families registered under catalog diagram families where shipped to consumers. | Registry |

## Motion & ambient layers

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.MOTION.PREFERS_REDUCED` | `@media (prefers-reduced-motion: reduce)` disables non-essential animation. | CSS audit |
| `DET.MOTION.NO_AUTO_PLAY_FLASH` | No seizure-risk flash patterns above threshold frequency (when measurable). | Pixel sampling / manual checklist fallback |
| `DET.AMBIENT.Z_INDEX` | Ambient canvases sit beneath interactive layers (`z-index` contract). | CSS |

## Desktop / app interfaces

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.APP.FOCUS_TRAP` | Modals/panels trap focus until dismissed (detectable via component contract tests). | E2E |
| `DET.APP.PERSISTENT_CHROME` | Shell regions stable across routes when contract promises persistence. | Route crawl |
| `DET.APP.PRIMARY_STATE` | Per `[data-studio-workspace]` or active `.studio-page`, at most one visible `[data-studio-primary-state]` / `.studio-state--*` region. | DOM |
| `DET.APP.PRIMARY_CTA` | Per workspace, ≤1 visible `[data-studio-primary-cta]` or `.btn-primary` primary action. | DOM |
| `DET.APP.DEMO_DISCLOSURE` | `[data-demo]` / `[data-mock]` containers include visible Demo/Sample/Mock labeling in the same section. | DOM |
| `DET.APP.TILE_AFFORDANCE` | Link-styled dashboard/KPI tiles are `<a href>` or keyboard-operable `role="button"`. | DOM |
| `DET.APP.TAB_PANEL` | Selected `[role="tab"]` has `aria-selected`, `aria-controls`, and a visible panel. | DOM |
| `DET.APP.PRIMITIVE_MARKERS` | Primitive emits `data-ks-hash`, `data-ks-type`, `data-ks-name` per `ksReactPrimitiveAttrs()` conventions. | DOM |
| `DET.APP.CONTROL_A11Y` | Interactive primitives expose correct ARIA roles/states for keyboard/screen readers. | axe / DOM |
| `DET.APP.PRIMITIVE_SOURCE` | Every `KS_REACT_PRIMITIVE` `.tsx` spreads `ksReactPrimitiveAttrs()`. | Repo scan |
| `DET.APP.PRIMITIVE_STYLES` | Pages with `data-ks-react-root` load `forge-react-primitives` / `ks-fe-*` styling. | DOM / CSS |
| `DET.APP.SHELL_INTEGRATION` | No Bootstrap `alert`/`badge` patterns adjacent to governed react-primitive roots in app workspace. | DOM |
| `DET.APP.ROUTE_DEEPLINK_STATE` | Deep-linked route preserves path, renders non-blank `main`, and active nav matches `location`. | DOM / route |
| `DET.APP.ERROR_BOUNDARY_RECOVERY` | Failed routes show error boundary / alert / retry—not a blank workspace shell. | DOM |
| `DET.APP.EMPTY_LOADING_ERROR_SUCCESS` | Data workspaces expose one primary state with heading and next action for empty/error. | DOM |
| `DET.APP.DISABLED_REASON` | Disabled primary controls expose visible reason (`aria-describedby`, title, or adjacent help). | DOM |
| `DET.APP.TOAST_LIFECYCLE` | Toasts use `role=status` / `aria-live`, dismiss when persistent, and do not cover primary CTAs. | DOM |
| `DET.APP.MODAL_DISMISSAL_GUARD` | Open modals include close affordance; destructive editable modals include cancel/unsaved guard. | DOM |
| `DET.APP.WIZARD_PROGRESS_CONTROLS` | Wizards show step X of Y, Back/Next controls, and disabled-next explanation. | DOM |
| `DET.APP.BULK_ACTION_SCOPE` | Bulk/destructive toolbars state selected count/scope before execution. | DOM |
| `DET.APP.DATA_REFRESH_STALENESS` | Data-heavy panels show last-updated/stale signal and refresh/retry action. | DOM |
| `DET.APP.CLIENT_ERROR_LOG_CLEAN` | Scenario step interactions produce no console/page errors (post-step capture). | Playwright |

## Python-generated HTML modules

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.PY.KS_HASH_ATTRS` | Renderer uses `ks_hash_attrs` (or equivalent) on visual roots. | Generated HTML |
| `DET.PY.OPTIONAL_REGIONS` | Optional slots render zero-height or omit when empty—no “ghost” headings. | DOM |

## Visual styles / theme packs

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.THEME.CONTRAST_MIN` | Text/background pairs meet configured contrast minimum for body UI (WCAG AA heuristic). | Color extraction |
| `DET.THEME.FONT_STACK` | Font stacks match approved tokens for display/body/mono roles. | CSS |
| `DET.TOKEN.NO_DRIFT` | Forbidden raw hex outside token allowlist for consumer-bound surfaces (when policy enabled). | CSS static scan |

**Backlog (not yet in registry):** `DET.THEME.SPACING_TOKEN_DRIFT` — one-off margin/padding outside the spacing scale; `DET.THEME.RADIUS_SHADOW_TOKEN_DRIFT` — raw border-radius/box-shadow outside elevation/radius tokens. Track before promoting to implemented DET rows.

## Interaction scripts

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.JS.NO_CONSOLE_ERROR` | Scripted interactions emit no uncaught errors on golden paths (showcase smoke). | Playwright |
| `DET.JS.PROGRESSIVE` | Critical content visible without script; enhancements gated. | DOM with JS disabled |

## Generic website (marketing / docs / product)

Scoped to **generic** sites (`rulesScope` `generic` / `auto` when not KS-driven). Route rules run at **crawl** phase; others run per page from `metrics.genericWebsitePageReport`.

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.ROUTE.HTTP_STATUS_CANONICAL` | Internal links return 2xx HTML; no redirect loops; no SPA blank shells; canonical targets unique. | Crawl HTTP probe + fingerprints |
| `DET.ROUTE.CONTENT_UNIQUENESS` | Title, H1, and meta description signatures differ across routes (no cloned placeholders). | Crawl fingerprint rollup |
| `DET.RESPONSIVE.NO_HORIZONTAL_OVERFLOW` | No horizontal overflow at 390 / 768 / 1280px; primary controls not clipped. | Viewport metrics |
| `DET.MOBILE.NAV_DISCLOSURE` | Mobile nav opens/closes; close label; body scroll locked when open. | Playwright interaction |
| `DET.FORM.LABEL_ERROR_SUMMARY` | Visible labels, required markers, inline errors, error summary on multi-field forms. | DOM |
| `DET.SEARCH.FILTER_STATE` | Search/filter UIs show result count, active filters, clear-all, empty recovery. | DOM |
| `DET.TABLE.RESPONSIVE_CONTROLS` | Dense tables: headers, horizontal containment, sort labels, pagination when long. | DOM |
| `DET.LOADING.EMPTY_ERROR_STATES` | Loading/empty/error/success mutually exclusive; recovery copy present. | DOM |
| `DET.STATUS.FEEDBACK_REGION` | Submits/async actions have aria-live or status region. | DOM |
| `DET.METADATA.SOCIAL_PREVIEW` | Non-placeholder description, canonical, favicon, OG/Twitter basics. | DOM |
| `DET.EXTERNAL_LINK.SAFETY` | `target=_blank` uses `rel=noopener`; downloads/contact links labeled. | DOM |
| `DET.MEDIA.ASPECT_RATIO` | Hero/card media has aspect hints; no viewport overflow. | DOM |

---

**Implementation note:** Registry rows with `status: implemented` and `design-rules/deterministic/generated/*.check.js` modules are wired through `design-rule-runtime` (static, live crawl, repo overlay, and Studio dynamic lanes). New checks must cite these IDs in defect payloads so remediation, harness fixtures, and AI batches stay aligned. Run `npm run blend-rules` and `npm run preflight-deterministic` after doc or mapping edits.
