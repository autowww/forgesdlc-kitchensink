---
rule_id: DET.VISUAL.RHYTHM
lane: deterministic
title: Visual rhythm between sections
summary: Vertical spacing between major sections repeats on the shared KS rhythm scale (CSS variables, spacing utilities, 8px grid)—not cramped stacks, wild gap spread, or ad hoc pixel margins.
page_version: 34c97742f51f9ba21a25a468c09d85934f66664723a208599c485565a7016b51
generated_at: 2026-05-29T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-visual-rhythm
related_rules:
  - DET.LAYOUT.GRID_CONSISTENCY
  - AI.VISUAL.RHYTHM_SUBJECTIVE
  - DET.SECTION.HEADING
  - DET.CONTEXT.BURDEN
  - AI.VISUAL.HIERARCHY
---

## Purpose

Kitchen Sink marketing and handbook pages stack many visible bands—`fs-landing-section`, `forge-section`, `ks-section`, and card-backed `section` blocks inside `main`. Readers feel quality when those bands breathe at a **repeatable vertical cadence**: shared `py-*` utilities, `var(--*)` padding, or documented section shells (`forgesdlc-theme.css` `.fs-landing-section`), not alternating micro-gaps and one-off pixel margins.

This deterministic rule runs in the **metrics** phase (`scoreDimension: visualRhythmFirstScreen`). With Playwright, it samples visible `section` / `article` / `.fs-landing-section` nodes inside `main`, measures vertical gaps between their tops, and flags:

| Violation kind | Trigger (summary) |
|----------------|-------------------|
| `cramped-median-gap` | At least 4 sections and median gap under 32 px (**major**) |
| `gap-inconsistency` | Gap spread (max minus min) divided by median over 0.55 when median is at least 24 px (**warn**) |
| `adhoc-section-spacing` | Inline margin/padding or computed edges off the 8px grid without spacing utility classes (**minor**) |
| `handbook-table-heavy-first-screen` | Handbook layout: more than 1 table in first viewport (**warn**) |
| `handbook-dense-first-screen` | Handbook: at least 3 visible h2 above fold and at least 300 above-fold words (**warn**) |

Recognized spacing utilities include `py-*`, `pt-*`, `pb-*`, `my-*`, `mt-*`, `mb-*`, `gap-*`, `landing-section`, `fs-landing-section`, `forge-section`, and `ks-section`. Nav, header, footer, modals, and offcanvas are excluded from section sampling.

**Plan:** Inventory section bands down `main` and note margin/padding classes vs inline styles. **Do:** Apply one KS section shell (`fs-landing-section py-4 px-2 px-md-3`, consistent `mb-4`, or theme tokens). **Check:** Re-run metrics; confirm no cramped_median_gap, gap_inconsistency, or adhoc_section_spacing evidence. **Adjust:** Normalize handbook openers that stack tables and many h2 blocks before the outcome story.

## Passing signals

- Four or more major sections inside `main` show a **median vertical gap of at least 32 px** between band tops (for example consistent `py-4` / `mb-4` stacks).
- Adjacent section gaps stay within **55% relative spread** of the median—no alternating `mb-1` / `mb-5` or lone `margin-top: 120px` outliers.
- Sections use **tokenized spacing**: Bootstrap utilities (`py-4`, `mb-4`), `var(--*)` in CSS, `rem`/`em`, or px values on the **4 px grid** (32 px, 48 px)—not raw `33px` margins.
- Marketing bands follow `components/marketing_sections.py`: `fs-landing-section … py-4 px-2 px-md-3` with optional `forge-section` / hash attrs.
- Handbook chapters (`data-ks-name="layout-handbook"`) keep **at most 1** table in the first viewport and defer extra `h2` reference blocks below a short outcome lead.
- Metrics pass with **no** `visualRhythm` findings; `sectionMedianGapPx` and `sectionGapsPx` look stable on long landing scrolls.

## Failing signals

- **`cramped-median-gap`:** Many tight sections (`py-2`, `mb-1`, micro-gaps) yield median gap **under 32 px** with section count at least 4—first screen feels stacked, not enterprise-spaced.
- **`gap-inconsistency`:** Measured gaps like `[32, 120, 40]` produce spread ratio **over 0.55**—readers hit accidental air pockets between bands.
- **`adhoc-section-spacing`:** A `section` uses `style="margin-top:33px"` or computed margins off the 8px grid **without** `py-*` / `forge-section` / `fs-landing-section` utilities—evidence `adhoc_section_spacing hint="section…"`.
- Inline `margin` / `padding` on section roots (`[inline]` in selector hints).
- Handbook opener shows **two tables** above the fold (`handbook_tables_first_viewport=2`).
- Handbook first viewport stacks **at least 3** `h2` headings with **at least 300** above-fold words (`handbook_dense_first_screen`).
- Page may pass **`DET.LAYOUT.GRID_CONSISTENCY`** yet still fail here because vertical cadence is independent.

## Before example

Failing KS markup: cramped py-2 / mb-1, non-grid 33px inline margin, and alternating mb-1 / mb-5 card bands.

```html
<main id="main" class="doc-main px-4 py-4">
  <section class="fs-landing-section fs-marketing-stat-band py-2 px-2">
    <h2 class="font-display h4 mb-2">Outcomes</h2>
    <p class="forge-support mb-0">Tight band with minimal vertical padding.</p>
  </section>
  <section class="forge-section ks-section py-2">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="font-display h4 mb-2">How it works</h2>
    <p class="forge-support mb-0">Second band also uses py-2—median gap stays under 32px.</p>
  </section>
  <section class="forge-card p-3" style="margin-top:33px">
    <p class="forge-support mb-0">Ad hoc 33px margin—not on the 8px rhythm grid.</p>
  </section>
  <section class="forge-card p-3 mb-1">
    <p class="forge-support mb-0">Block C — mb-1 micro-gap below.</p>
  </section>
  <section class="forge-card p-3 mb-5">
    <p class="forge-support mb-0">Block D — mb-5 air pocket; gap spread exceeds tolerance.</p>
  </section>
</main>
```

## After example

Passing KS markup: consistent fs-landing-section / forge-section py-4 and uniform mb-4.

```html
<main id="main" class="doc-main px-4 py-4">
  <section
    class="fs-landing-section fs-marketing-stat-band py-4 px-2 px-md-3 forge-section"
    hash="Stt"
    data-ks-hash="Stt"
    data-ks-type="section"
    data-ks-name="outcomes-band"
  >
    <h2 class="font-display h4 mb-3">Outcomes</h2>
    <p class="forge-support mb-0">Shared py-4 section shell from marketing_sections.</p>
  </section>
  <section class="forge-section ks-section py-4 px-2 px-md-3">
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="font-display h4 mb-3">How it works</h2>
    <p class="forge-support mb-0">Matching vertical utilities keep median gap at or above 32px.</p>
  </section>
  <section class="forge-card p-3 mb-4">
    <p class="forge-support mb-0">Block C — mb-4 on the Bootstrap spacing scale.</p>
  </section>
  <section class="forge-card p-3 mb-4">
    <p class="forge-support mb-0">Block D — same mb-4; predictable rhythm down the page.</p>
  </section>
</main>
```

## Evidence and remediation

**Evidence:** Playwright `collectVisualRhythmReport` returns `sectionCount`, `sectionGapsPx`, and `adhocSpacingHints`. Findings cite `cramped_median_gap section_median_gap_px=… sections=…`, `gap_inconsistency median_gap_px=… spread_px=…`, `adhoc_section_spacing hint="section…"`, or handbook kinds with `handbook_tables_first_viewport` / `h2_above_fold` / `above_fold_words`. Default severities: **major** (cramped), **warn** (spread, handbook), **minor** (adhoc). Area: `first-screen` or `readability`. Capture a full-page screenshot and compare section top positions in DevTools.

**Remediate (in order):**

1. **Pick one section shell** — prefer `fs-landing-section py-4 px-2 px-md-3` or `forge-section ks-section py-4`; avoid mixing `py-2` stacks with lone `mb-5` outliers.
2. **Normalize margins** — replace inline `margin-top: 33px` (and other off-grid px) with `mb-4`, `py-4`, or theme `var(--*)` padding.
3. **Fix gap spread** — align inter-section gaps to the same utility until spread ratio is at most 0.55.
4. **Relieve cramped stacks** — when median gap is under 32 px with four or more sections, use `py-4` minimum on major bands instead of `mb-1` / `py-2` chains.
5. **Handbook first screen** — move comparison tables below the outcome paragraph; keep at most 1 table in the first viewport; defer dense `h2` stacks when above-fold words ≥ 300.
6. **Re-audit** — run `analyze-website-ux.mjs` on landing and handbook URLs; harness: `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.VISUAL.RHYTHM` after `generator/build_rule_defect_fixtures.py`.

## Related rules

- `DET.LAYOUT.GRID_CONSISTENCY` — horizontal content rails; complements vertical cadence.
- `AI.VISUAL.RHYTHM_SUBJECTIVE` — judgment when numeric checks pass but bands feel accidental.
- `DET.SECTION.HEADING` — one heading per major section.
- `DET.CONTEXT.BURDEN` — first-screen control density.
- `AI.VISUAL.HIERARCHY` — visual weight competition across bands.
