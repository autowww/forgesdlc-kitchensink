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

## React primitives

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.REACT.KS_ATTRS` | Primitive emits `data-ks-hash`, `data-ks-type`, `data-ks-name` per KS helper conventions. | DOM |
| `DET.REACT.A11Y_ROLE` | Interactive primitives expose correct ARIA roles/states for keyboard/screen readers. | axe / DOM |

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

## Interaction scripts

| Rule ID | Check (pass condition) | Typical evidence |
|---------|-------------------------|------------------|
| `DET.JS.NO_CONSOLE_ERROR` | Scripted interactions emit no uncaught errors on golden paths (showcase smoke). | Playwright |
| `DET.JS.PROGRESSIVE` | Critical content visible without script; enhancements gated. | DOM with JS disabled |

---

**Implementation note:** Not every `DET.*` row is wired in `analyze-website-ux.mjs` today. New checks should cite these IDs in defect payloads so remediation and AI batches stay aligned.
