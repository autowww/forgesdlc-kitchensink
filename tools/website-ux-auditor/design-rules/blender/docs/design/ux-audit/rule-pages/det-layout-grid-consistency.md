---
rule_id: DET.LAYOUT.GRID_CONSISTENCY
lane: deterministic
title: Layout grid consistency
summary: Long-form body copy aligns to KS layout containers (max width, gutters); no accidental full-bleed text rivers, section gutter drift, excessive measure, or handbook dead gutter beside the doc sidebar.
page_version: e043020eebc75330527c09d512696bc164c9453c73a9af4848ded50f7dfc9d9a
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-layout-grid_consistency
related_rules:
  - DET.VISUAL.RHYTHM
  - DET.CHROME.BOUNDARY
  - DET.PROSE.LENGTH
  - DET.SECTION.HEADING
  - DET.NAV.IN_PAGE_TOC
  - AI.VISUAL.RHYTHM_SUBJECTIVE
---

## Purpose

Readers scan long-form copy faster when paragraphs share one layout grid: predictable max width, matching left inset, and gutters that do not jump between blocks. Kitchen Sink shells (`handbook_page`, `showcase_page`, `landing_page`) emit grid containers — `.container`, `.doc-content`, `.mx-auto` with `max-width:56rem`, `.landing-section-inner`, `.fs-main-inner`, and Bootstrap `.col` / `.row > *` columns. `det-layout-grid-consistency.check.js` samples visible `p` elements inside `main` during the **metrics** phase.

**Plan:** Map each prose band to the layout contract for its page mode (handbook, marketing, app). **Do:** Wrap substantive copy (32+ words) in `.doc-content` or an equivalent grid shell; keep left edges aligned within a section. **Check:** `layoutGridConsistencyReport.violations` is empty at desktop viewport (992 px or wider when handbook sidebar checks apply). **Adjust:** Remove ad-hoc margins, drop `mx-auto` on handbook `main` when **Ksr** is present, and constrain measure inside `.ks-doc-toc-prose` per `forge-theme.css` `.ks-doc-toc-flow`.

## Passing signals

- Long-form `p.forge-support` / body prose lives inside `.doc-content`, `.container`, `.landing-section-inner`, or a column with a documented max-width token (~56rem / 920 px).
- Paragraphs in the same `section`, `forge-section`, or `ks-section` band share left edges within **56 px** tolerance — no inline `margin-left` offsets or mixed container nesting.
- Handbook pages with `aside.forge-sidebar` (**Ksr**, `data-ks-hash="Ksr"`) use `doc-content w-100` (no `mx-auto`) on `main`, with readable measure inside `.ks-doc-toc-prose` within `.ks-doc-toc-flow` — sidebar-to-prose gap at most **64 px** at **992 px** viewport or wider.
- Hero bands (`.landing-hero`, `.landing-hero-wide`, `.product-hero`, `[class*="hero-band"]`) may span wide; substantive chapters below use the grid.
- Intentional wide surfaces (`[class*="full-bleed"]`, `data-full-bleed`, diagram modals, offcanvas) are excluded from prose-river detection.

## Failing signals

- **`full-bleed-prose`:** A substantive paragraph (≥ **32** words) has no grid ancestor and spans ≥ **88%** of `main` width or ≥ **82%** of the viewport — accidental text river outside `.doc-content` / `.container`.
- **`gutter-drift`:** Two or more substantive paragraphs in the same section show left-edge spread greater than **56 px** (for example one block flush left and a sibling with `style="margin-left:72px"` or mismatched wrapper padding).
- **`excessive-measure`:** Prose inside a grid container still exceeds **920 px** width — line length breaks the documented reading measure even though a wrapper exists.
- **`handbook-dead-gutter`:** With visible **Ksr** / `.forge-sidebar`, `.doc-content.mx-auto` centers the column away from the sidebar, leaving gap greater than **64 px** between sidebar edge and prose start at desktop widths.
- Alternating `container` and `container-fluid px-1` bands without a page-mode change — content rails jump even when individual paragraphs pass narrow checks (companion subjective review: `AI.VISUAL.RHYTHM_SUBJECTIVE`).

## Before example

Failing KS markup: substantive paragraphs sit directly in `main` without `.doc-content`, and the second block uses an ad-hoc left offset in the same `ks-section` — triggers `full-bleed-prose` on wide viewports and `gutter-drift` between siblings.

```html
<main id="main" class="doc-main px-4 py-4">
  <section class="forge-section ks-section">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="font-display h4 mb-3">Layout grid</h2>
    <p class="forge-support">Governed delivery prose should sit on the layout grid with consistent gutters and readable measure across handbook, marketing, and showcase pages. Repeat the sentence so auditors sample enough words for the prose river scan to fire on wide viewports. Repeat the sentence so auditors sample enough words for the prose river scan to fire on wide viewports.</p>
    <p class="forge-support" style="margin-left:72px">Second paragraph in the same section uses an ad hoc left margin instead of the shared grid track, so readers see jitter between blocks even when copy length matches the first paragraph. Second paragraph in the same section uses an ad hoc left margin instead of the shared grid track, so readers see jitter between blocks even when copy length matches the first paragraph.</p>
  </section>
</main>
```

## After example

Passing KS markup: the same section wraps prose in `mx-auto doc-content` with the 56rem measure; both paragraphs share the grid track with no inline offset. When **Ksr** is present, prefer `doc-content w-100` plus `.ks-doc-toc-prose` inside `.ks-doc-toc-flow` instead of centering `main`.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="mx-auto doc-content" style="max-width:56rem">
    <section class="forge-section ks-section">
      <p class="section-label text-cyan mb-2">Mechanism</p>
      <h2 class="font-display h4 mb-3">Layout grid</h2>
      <p class="forge-support">Governed delivery prose sits inside doc-content so line length and left inset match the Kitchen Sink handbook column. Shared container padding keeps gutters consistent across paragraphs, lists, and callouts in the same section band.</p>
      <p class="forge-support">A second paragraph without inline offset inherits the same grid track, so gutter drift checks stay within tolerance. When a left doc sidebar is present, use doc-content w-100 and constrain measure inside ks-doc-toc-prose within ks-doc-toc-flow rather than mx-auto on the main column.</p>
    </section>
  </div>
</main>
```

## Evidence and remediation

**Evidence:** Metrics phase emits `layoutGridConsistencyReport` with `proseSampleCount`, optional `handbookLayout` (`hasDocSidebar`, `gapSidebarToProsePx`, `docContentUsesMxAuto`), and `violations[]` (`kind`: `full-bleed-prose`, `gutter-drift`, `excessive-measure`, `handbook-dead-gutter`). Findings use area `readability`, default severity `warn` (gutter/measure `minor`), and evidence such as `full_bleed_prose hint="p.forge-support" width_px=1180 words=64`, `gutter_drift section="section.forge-section" left_spread_px=72`, or `handbook_dead_gutter gap_px=152 mx_auto=yes`. Capture a full-page desktop screenshot plus a crop of adjacent prose blocks showing left-edge alignment.

**Remediate (in order):**

1. **Wrap long prose** — move substantive `p` blocks into `.doc-content`, `.container`, or a `max-width:56rem` column; reserve full-bleed width for heroes, diagrams, and bands marked `full-bleed`.
2. **Align section gutters** — remove inline `margin-left` / asymmetric padding on siblings; use one wrapper per section and shared `.row g-3 g-lg-4` column spans.
3. **Constrain measure** — when `excessive-measure` fires, tighten `max-width` on `.doc-content` or `.ks-doc-toc-prose` to at most **920 px** (~56rem); do not stretch prose across the full `col-xl-10` canvas.
4. **Fix handbook dead gutter** — with **Ksr** visible, set `content_max_width=None` in `showcase_page` / `handbook_page` so HTML emits `doc-content w-100` (`layouts.py`), and place reading measure on `.ks-doc-toc-prose` inside `.ks-doc-toc-flow` per `forge-theme.css`; avoid `mx-auto doc-content` that centers away from the sidebar rail.
5. **Re-audit** — run `analyze-website-ux.mjs` on handbook chapters, marketing pages, and showcase docs; confirm `layoutGridConsistencyReport.violations` is empty. Harness regression: `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.LAYOUT.GRID_CONSISTENCY`.

## Related rules

- `DET.VISUAL.RHYTHM` — vertical spacing cadence between section bands; complements horizontal grid alignment.
- `DET.CHROME.BOUNDARY` — chrome rails and `main` canvas separation; grid gutters assume a readable content column inside `main`.
- `DET.PROSE.LENGTH` — word-count caps on dense paragraphs; grid consistency governs width and inset, not length alone.
- `DET.SECTION.HEADING` — section labels and headings should align with the same grid track as body copy.
- `DET.NAV.IN_PAGE_TOC` — `.ks-doc-toc-flow` keeps prose measure and the on-page ToC rail aligned.
- `AI.VISUAL.RHYTHM_SUBJECTIVE` — catches perceived width whiplash when deterministic grid checks pass but adjacent bands still feel misaligned.
