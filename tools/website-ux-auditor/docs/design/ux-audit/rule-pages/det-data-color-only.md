---
rule_id: DET.DATA.COLOR_ONLY
lane: deterministic
title: Data color redundancy
summary: Chart legends, token swatches, and encoded table cells must pair color with visible text, patterns, or icons—not hue alone where the auditor can detect a swatch or fill.
page_version: 6867492406d3ec909a0742d87b388c8f118929ae94e16f369025c8fa1c41f736
generated_at: 2026-05-19T21:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-data-color_only
related_rules:
  - DET.CHART.ALT_SUMMARY
  - DET.DATA.TABLE_HEADERS
  - AI.DATA.INSIGHT_LEGIBILITY
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
  - DET.DIAGRAM.ALT
---

## Purpose

Kitchen Sink **data surfaces**—`ks-chart-mount` / `[data-ks-chart]` charts (`forge-data-charts.js`), **token swatches** on `Tkn` / For Agents pages (`.ks-swatch`, `.ks-swatch-box`, `.ks-swatch-label`), and **tables** beside charts—often use color to encode series, status, or magnitude. Visitors who cannot distinguish cyan from amber, or who print in grayscale, still need the same meaning from **redundant text or shape**.

This deterministic rule (metrics phase, `colorOnlyReport`) flags detectable **color-only encoding** inside data contexts: legend rows with a colored mark but no label (minimum **2 characters** via `MIN_COLOR_LABEL_CHARS`), `.ks-swatch` blocks missing `.ks-swatch-label`, and table cells whose background carries meaning while the cell body is empty. Decorative ambient layers and `aria-hidden` subtrees are ignored.

**Plan:** Inventory chart mounts, token grids, and heatmap-style tables on the page. **Do:** Pair every swatch or color-filled cell with a visible name, value, or icon in the same row. **Check:** Re-run auditor metrics or inspect `colorOnlyReport.violations[]`. **Adjust:** Wire labels in generators (`tokens.py`, `forge-data-charts.js`) or page templates; for narrative quality of the insight, see `AI.DATA.INSIGHT_LEGIBILITY`.

## Passing signals

- **Token swatches** follow the showcase pattern: `.ks-swatch` > `.ks-swatch-box` + **`.ks-swatch-label`** with at least two characters (for example `amber`, `surface-2`).
- **Donut / bar legends** from `forge-data-charts.js` use **`.lenses-overview-donut-swatch`** in a **`.d-flex`** row with a **`<span>` series name** and optional **`.text-muted`** percentage—hue is not the only cue.
- **Chart swatch rows** include sibling text, **`.ks-swatch-label`**, or **`aria-label` / `title`** on the swatch or row container (at least 2 characters).
- **Heatmap or status tables** put **numeric or categorical text** (or `aria-label`) in the same `<td>` as a background tint, or use icons/patterns in addition to fill.
- **SVG slices** expose `<title>` with series name and value when a separate legend is omitted (supplements, not replaces, visible legend text for sighted users).
- Swatches and encoded cells sit inside a **data context** (`[data-ks-chart]`, `.ks-chart-mount`, `figure`, `table`, etc.) so the check applies; unrelated decorative dots outside those regions are not scored.

## Failing signals

- **`.ks-swatch`** with **`.ks-swatch-box`** but **no `.ks-swatch-label`** (or label shorter than two characters)—kind `ks-swatch-missing-label`, **major**.
- **`.lenses-overview-donut-legend`** row containing only **`.lenses-overview-donut-swatch`** with inline `background:` and **no adjacent text**—kind `legend-swatch-without-label`, **warn**.
- **Generic legend marks** (`[class*="legend-mark"]`, `[class*="color-dot"]`, `[class*="status-dot"]`) inside a chart or table context with **no row label** and no `aria-label`.
- **Table body cells** with meaningful **background-color** but **empty text** and no `aria-label`, while the table has a header row with real `<th>` labels—kind `table-cell-color-only`, **warn**.
- **Status dashboards** that rely on green/red cell fills alone for pass/fail with no column text or icon.
- **Heatmap grids** where intensity is only `style="background:…"` on `<td>` elements with no legend key or cell values.

## Before example

Failing KS markup: token swatch and chart legend rely on color alone; the data table encodes severity only via background fill.

```html
<section id="sec-tkn-palette" class="ks-section" hash="Tkn" data-ks-hash="Tkn" data-ks-type="page" data-ks-name="tokens">
  <h2 class="ks-section-title">Accent palette</h2>
  <div class="d-flex flex-wrap gap-3 mb-4">
    <div class="ks-swatch">
      <div class="ks-swatch-box" style="background:var(--forge-amber)"></div>
    </div>
    <div class="ks-swatch">
      <div class="ks-swatch-box" style="background:var(--forge-cyan)"></div>
    </div>
  </div>
</section>

<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Repository mix</h2>
  <div class="ks-chart-mount mb-2" data-ks-chart data-ks-chart-kind="repo_mix" data-ks-chart-state="ready">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Repository mix donut">
      <path d="M60 10 A50 50 0 0 1 110 60 Z" fill="rgba(245,158,11,0.9)"/>
      <path d="M110 60 A50 50 0 0 1 60 110 Z" fill="rgba(6,182,212,0.85)"/>
    </svg>
    <div class="lenses-overview-donut-legend small mt-2">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="lenses-overview-donut-swatch" style="background:rgba(245,158,11,0.9)"></span>
      </div>
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="lenses-overview-donut-swatch" style="background:rgba(6,182,212,0.85)"></span>
      </div>
    </div>
  </div>
  <table class="table table-sm forge-table mb-0">
    <thead>
      <tr><th scope="col">Check</th><th scope="col">Status</th></tr>
    </thead>
    <tbody>
      <tr><td>Unit tests</td><td style="background:rgba(16,185,129,0.35)"></td></tr>
      <tr><td>Lint</td><td style="background:rgba(239,68,68,0.35)"></td></tr>
    </tbody>
  </table>
</section>
```

## After example

Passing KS markup: every swatch and legend row includes text labels; status cells repeat meaning in characters, not only fill.

```html
<section id="sec-tkn-palette" class="ks-section" hash="Tkn" data-ks-hash="Tkn" data-ks-type="page" data-ks-name="tokens">
  <h2 class="ks-section-title">Accent palette</h2>
  <div class="d-flex flex-wrap gap-3 mb-4">
    <div class="ks-swatch">
      <div class="ks-swatch-box" style="background:var(--forge-amber)"></div>
      <span class="ks-swatch-label">amber</span>
    </div>
    <div class="ks-swatch">
      <div class="ks-swatch-box" style="background:var(--forge-cyan)"></div>
      <span class="ks-swatch-label">cyan</span>
    </div>
  </div>
</section>

<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Repository mix</h2>
  <p id="repo-mix-summary" class="forge-support mb-2">
    Donut of tracked files by top-level language; Python leads at 41.2%, Markdown 33.8%.
  </p>
  <div
    class="ks-chart-mount mb-2"
    data-ks-chart
    data-ks-chart-kind="repo_mix"
    data-ks-chart-state="ready"
    aria-describedby="repo-mix-summary"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Repository mix by language">
      <path d="M60 10 A50 50 0 0 1 110 60 Z" fill="rgba(245,158,11,0.9)"><title>Python: 41.2%</title></path>
      <path d="M110 60 A50 50 0 0 1 60 110 Z" fill="rgba(6,182,212,0.85)"><title>Markdown: 33.8%</title></path>
    </svg>
    <div class="lenses-overview-donut-legend small mt-2">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="lenses-overview-donut-swatch" style="background:rgba(245,158,11,0.9)" aria-hidden="true"></span>
        <span>Python</span>
        <span class="text-muted ms-auto">41.2%</span>
      </div>
      <div class="d-flex align-items-center gap-2 mb-1">
        <span class="lenses-overview-donut-swatch" style="background:rgba(6,182,212,0.85)" aria-hidden="true"></span>
        <span>Markdown</span>
        <span class="text-muted ms-auto">33.8%</span>
      </div>
    </div>
  </div>
  <table class="table table-sm forge-table mb-0">
    <thead>
      <tr><th scope="col">Check</th><th scope="col">Status</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Unit tests</td>
        <td class="text-success" aria-label="Status: pass">Pass</td>
      </tr>
      <tr>
        <td>Lint</td>
        <td class="text-danger" aria-label="Status: fail">Fail</td>
      </tr>
    </tbody>
  </table>
</section>
```

## Evidence and remediation

**Evidence:** Auditor metrics `colorOnlyReport` with `violations[]` entries: `kind` (`ks-swatch-missing-label`, `legend-swatch-without-label`, `table-cell-color-only`), `region`, `selectorHint`, and `className`. Findings use evidence token `color_only_encoding` with severity **major** for missing `.ks-swatch-label` and **warn** for legend or table-cell cases. Capture the swatch row outer HTML, sibling text nodes, and any `aria-label` / `title` attributes.

**Remediate (in order):**

1. **Token pages:** emit `.ks-swatch-label` beside every `.ks-swatch-box` (see `generator/pages/tokens.py` and `components/layouts.py` showcase styles).
2. **Chart legends:** match `forge-data-charts.js`—each `.lenses-overview-donut-swatch` in a `.d-flex` row with series name and optional percentage text.
3. **Custom legends:** add `.ks-swatch-label`, visible `<span>` text, or `aria-label` on the swatch or row (at least 2 characters).
4. **Tables:** put status words, counts, or icons in the cell; use `aria-label` only when visible text is intentionally abbreviated.
5. Re-run deterministic color-only checks; pair with **`DET.CHART.ALT_SUMMARY`** for mount-level summaries and **`DET.DATA.TABLE_HEADERS`** for header scope.

## Related rules

- `DET.CHART.ALT_SUMMARY` — chart mounts need a text summary, not only redundant legend labels.
- `DET.DATA.TABLE_HEADERS` — tables need `<th scope>` before cell-only color encoding is evaluated meaningfully.
- `AI.DATA.INSIGHT_LEGIBILITY` — judges whether charts answer “so what?” beyond redundant encoding.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — product visuals should teach mechanism, not only pass swatch-label heuristics.
- `DET.DIAGRAM.ALT` — static SVG mechanism diagrams use diagram alt policy; this rule targets data charts, swatches, and tables.
