---
rule_id: DET.DATA.TABLE_HEADERS
lane: deterministic
title: Data table header scope
summary: Visible Kitchen Sink data tables expose column or row headers with valid th scope or explicit headers associations on body cells.
page_version: 3009d93382a3693aae8cea0dee8eb6ec8df9960cf27e9c7557393059615f35c8
generated_at: 2026-05-19T22:35:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-data-table_headers
---

## Purpose

Kitchen Sink pages ship **data tables** beside charts and token grids—`render_table` in `components/components.py`, `.forge-table-wrap` on `Srf` (surfaces), `Ctr` (controls), `Tkn` (tokens), and consumer dashboards. Screen readers need a **programmatic header relationship** for each visible `<td>`: either `<th scope="col|row|colgroup|rowgroup">` (or `[role="columnheader"]` / `[role="rowheader"]` with the same scope values), or `headers` on every body cell pointing at header ids inside the table.

This deterministic rule scans **visible** tables with at least one data cell, skips layout tables (`role="presentation"`), and flags tables with no header cells or `<th>` without valid scope when body cells lack `headers` wiring. Decorative or `aria-hidden` subtrees are ignored.

**Plan:** List tables in chart sections, IO matrices, and status grids. **Do:** Add a `<thead>` row of scoped `<th>` or wire `headers` on each `<td>`. **Check:** Re-run auditor metrics (`tableHeadersReport`) or inspect each `.forge-table-wrap` table in DevTools. **Adjust:** Fix generator output (`render_table` already emits `scope='col'`); repair hand-authored showcase HTML that omits scope.

## Passing signals

- **`render_table`** output wraps tables in **`.forge-table-wrap`** with `<th scope='col'>` for every column header (canonical KS helper).
- Hand-authored tables follow **`Ctr`** / **`controls.py`**: `.forge-table-wrap` > `.table.table-sm` with `<th scope="col">` on each header cell.
- **Row-header tables** use `<th scope="row">` for the first column when labels identify rows (for example methodology names in a comparison matrix).
- **Complex grids** set `headers="col-a col-b"` on each `<td>` referencing `<th id="col-a">` ids when scope alone is insufficient (merged cells, dual headers).
- **`role="columnheader"`** / **`role="rowheader"`** cells include the same valid `scope` attribute when used instead of native `<th>`.
- **Layout tables** use `role="presentation"` (or live inside a presentation subtree) and are excluded from scoring.
- Tables with **only header rows and no visible `<td>`** are skipped (nothing to associate).

## Failing signals

- **`.forge-table-wrap`** table with `<thead><tr><th>…</th>` but **no `scope`** on any `<th>`, and body `<td>` cells **without `headers`**—issue `th-missing-scope`, **major**.
- **Data grid** built with `<td>` in the first row acting as visual headers (no `<th>`) and no `headers` attributes—issue `no-header-cells`, **major**.
- **Showcase copy-paste** from early `Srf` examples: striped `.table` with header text in `<th>` but missing `scope="col"`.
- **Status / heatmap tables** beside `ks-chart-mount` blocks where color encodes meaning but column titles are plain `<td>` or unscoped `<th>`.
- **Third-party widget tables** mounted in `.forge-widget-host` without thead scope after hydration (common regression when only CSS classes are applied).
- **Visible comparison tables** inside expanded panels fail when they contain data cells and lack scope or `headers` wiring.

## Before example

Failing KS markup: surfaces-style table with real data cells but header cells lack `scope` and body cells lack `headers` (matches legacy `generator/pages/surfaces.py` pattern).

```html
<section id="sec-tables" class="ks-section" hash="Srf" data-ks-hash="Srf" data-ks-type="page" data-ks-name="surfaces">
  <h2 class="ks-section-title">Tables</h2>
  <p class="forge-support mb-3">Wrap standard Bootstrap tables in <code>.forge-table-wrap</code> for themed styling.</p>
  <div class="forge-table-wrap">
    <table class="table table-striped mb-0">
      <thead>
        <tr>
          <th>Methodology</th>
          <th>Type</th>
          <th>Team size</th>
          <th>Iteration</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Scrum</td><td>Agile</td><td>5–9</td><td>2-week sprint</td></tr>
        <tr><td>Kanban</td><td>Lean</td><td>Any</td><td>Continuous</td></tr>
        <tr><td>Forge</td><td>AI-native</td><td>1–3</td><td>Spark-driven</td></tr>
      </tbody>
    </table>
  </div>
</section>
```

## After example

Passing KS markup: same surfaces table with `scope="col"` on headers (matches `render_table` and `controls.py`).

```html
<section id="sec-tables" class="ks-section" hash="Srf" data-ks-hash="Srf" data-ks-type="page" data-ks-name="surfaces">
  <h2 class="ks-section-title">Tables</h2>
  <p class="forge-support mb-3">Wrap standard Bootstrap tables in <code>.forge-table-wrap</code> for themed styling.</p>
  <div class="forge-table-wrap">
    <table class="table table-striped table-sm mb-0">
      <thead>
        <tr>
          <th scope="col">Methodology</th>
          <th scope="col">Type</th>
          <th scope="col">Team size</th>
          <th scope="col">Iteration</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Scrum</td><td>Agile</td><td>5–9</td><td>2-week sprint</td></tr>
        <tr><td>Kanban</td><td>Lean</td><td>Any</td><td>Continuous</td></tr>
        <tr><td>Forge</td><td>AI-native</td><td>1–3</td><td>Spark-driven</td></tr>
      </tbody>
    </table>
  </div>
</section>
```

Alternative passing pattern using **`headers`** when scope is impractical (sparse matrix beside a chart):

```html
<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Weekly commits</h2>
  <div class="ks-chart-mount mb-3" data-ks-chart data-ks-chart-kind="commit_weekly" data-ks-chart-state="ready"></div>
  <div class="forge-table-wrap">
    <table class="table table-sm table-striped mb-0" id="commit-weekly-grid">
      <thead>
        <tr>
          <th id="cw-week" scope="col">ISO week</th>
          <th id="cw-count" scope="col">Commits</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td headers="cw-week">2025-W08</td>
          <td headers="cw-count">4</td>
        </tr>
        <tr>
          <td headers="cw-week">2025-W09</td>
          <td headers="cw-count">6</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor metrics `tableHeadersReport` with `violations[]` entries `kind: missing-table-headers`, `issue` of `no-header-cells` or `th-missing-scope`, plus `selectorHint` (for example `table.table.table-striped[@Srf]`), `dataCellCount`, and `headerCount`. Findings surface as **major** accessibility issues with evidence token `missing_table_headers`. Capture the table outer HTML, each `<th>` `scope`, and any `headers` on `<td>` cells.

**Remediate (in order):**

1. Prefer **`render_table(headers, rows)`** for new tables so KS emits `<th scope='col'>` inside `.forge-table-wrap`.
2. For hand-authored HTML, add **`scope="col"`** to every column header in `<thead>` (or `scope="row"` for row-header columns).
3. When headers are not `<th>` (legacy markup), set **`headers="id1 id2"`** on each `<td>` referencing in-table header element ids.
4. Mark **layout-only** grids with `role="presentation"`; do not use presentation role on data tables.
5. Re-run deterministic table-header checks; pair with **`DET.DATA.COLOR_ONLY`** when cells use background fills and **`DET.CHART.ALT_SUMMARY`** for adjacent chart mounts.

## Related rules

- `DET.CHART.ALT_SUMMARY` — chart mounts need text summaries; tables beside charts still need header scope.
- `DET.DATA.COLOR_ONLY` — encoded cells must not rely on hue alone; header scope is required before color-only heuristics apply meaningfully.
- `AI.DATA.INSIGHT_LEGIBILITY` — judges whether table plus chart blocks answer “so what?” beyond structural accessibility.
- `DET.LANDMARKS.REQUIRED` — page regions must be landmarked; tables live inside main content landmarks.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — product tables should teach comparison, not only pass header wiring.
