---
rule_id: DET.CHART.ALT_SUMMARY
lane: deterministic
title: Chart accessible summary
summary: Every visible Kitchen Sink chart or graph mount exposes a non-trivial text summary, aria-describedby target, or nearby caption for non-visual readers.
page_version: 6c251e266ae748fcae1c2704355aa3b9e01b41b427713414b2268dc540d32340
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-chart-alt-summary
related_rules:
  - AI.DATA.INSIGHT_LEGIBILITY
  - DET.DATA.COLOR_ONLY
  - DET.DATA.TABLE_HEADERS
  - DET.DIAGRAM.ALT
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
---

## Purpose

Kitchen Sink **data charts** ship through `render_ks_chart_mount` (`components/components.py`), `forge-data-charts.js`, and showcase pages (`Dcs`, `Dca`). Screen readers and skimmers who do not parse bar geometry still need a **text equivalent** for what the chart represents—not a one-word stub.

This deterministic rule scans visible chart roots (`[data-ks-chart]`, `.ks-chart-mount`, `[data-chart]`, and chart-class containers) and requires at least **8 characters** of summary text via `aria-label`, `aria-labelledby`, `aria-describedby` (with a resolvable target), `title`, sr-only / `data-chart-summary` nodes, or a nearby `figcaption` / `forge-support` caption. Decorative ambient canvases inside `.forge-ambient-bg`, `.ks-ambient-bg`, and `aria-hidden` subtrees are excluded.

**Plan:** List chart mounts on the page (static SVG, client-rendered canvas, API-driven mounts). **Do:** Pair each mount with a caption or wire `aria-describedby` to a paragraph that names metric, window, and direction. **Check:** Re-run the auditor metrics phase (`chartAltSummaryReport`) or inspect each `ks-chart-mount` in DevTools. **Adjust:** If only generic labels repeat, add summaries in the generator or page template; for “so what?” copy quality, see `AI.DATA.INSIGHT_LEGIBILITY`.

## Passing signals

- Chart root or inner `svg` / `canvas` / `[role="img"]` has **`aria-label` or `title` with at least 8 characters** (for example “Weekly commits by ISO week, 2025-W08 through W11”).
- Mount uses **`aria-describedby`** (or `aria-labelledby`) pointing at an element whose text is at least 8 characters—commonly `forge-support` copy above or below the mount.
- **`figure` + `figcaption`** wraps the mount with a non-trivial caption, or a **`p.forge-support`** / `[data-chart-summary]` sits within two sibling positions of the mount (matches `render_ks_chart_mount` title line plus an insight sentence).
- **Sr-only summary** (`.sr-only`, `.visually-hidden`, `[data-chart-summary]`) inside the mount carries at least 8 characters when visible captions are intentionally minimal.
- **Ambient exclusion:** canvases in `.forge-ambient`, `.ks-has-ambient-bg`, or `aria-hidden="true"` decorative layers are not scored as data charts.
- Summary text is **consistent** with visible series labels where both exist (does not contradict bar labels or legend swatches).

## Failing signals

- `ks-chart-mount` with rendered `svg[role="img"]` but **no** `aria-describedby`, **no** nearby caption, and only **`aria-label="Chart"`** or **`aria-label="Graph"`** (below `MIN_CHART_SUMMARY_CHARS` = 8).
- **Geometry only:** bars, slices, or canvas pixels with no accessible name and no preceding `forge-support` / `figcaption` paragraph.
- **`aria-describedby`** points at a missing id or an empty stub element (for example an empty `<div id="chart-desc">`).
- **Title line only** from `render_ks_chart_mount` is omitted on consumer pages, leaving a bare `<div class="ks-chart-mount" data-ks-chart>` with no caption sibling.
- **Tooltip-only** `<title>` inside SVG with no mount-level description (tooltips are not a substitute for page-level summary wiring).
- API chart stuck in **`data-ks-chart-state="loading"`** with no loading copy that satisfies the 8-character minimum for the mount region.

## Before example

Failing KS markup: valid mount and SVG geometry, but the accessible name is a generic stub and there is no caption or `aria-describedby` target.

```html
<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Activity</h2>
  <div
    id="ks-cw"
    class="ks-chart-mount mb-3"
    data-ks-chart
    data-ks-chart-kind="commit_weekly"
    data-ks-chart-state="ready"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" role="img" aria-label="Chart" style="width:100%;max-width:720px;height:auto">
      <rect x="52" y="98" width="18" height="74" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="78" y="26" width="18" height="146" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="104" y="122" width="18" height="50" fill="rgba(6,182,212,0.85)" rx="2"/>
    </svg>
  </div>
</section>
```

## After example

Passing KS markup: non-trivial summary copy linked to the mount; SVG inherits description from the same targets.

```html
<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Activity</h2>
  <p class="forge-support small mb-1"><strong>Weekly commits</strong> · <code>commit_weekly</code></p>
  <p id="weekly-commits-summary" class="forge-support mb-3">
    Bar chart of weekly commit counts for 2025-W08 through W11; highest bar is W10 at seven commits.
  </p>
  <div
    id="ks-cw"
    class="ks-chart-mount mb-0"
    data-ks-chart
    data-ks-chart-kind="commit_weekly"
    data-ks-chart-state="ready"
    aria-describedby="weekly-commits-summary"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 200"
      role="img"
      aria-label="Weekly commits by ISO week, 2025-W08 through W11"
      aria-describedby="weekly-commits-summary"
      style="width:100%;max-width:720px;height:auto"
    >
      <rect x="52" y="98" width="18" height="74" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="78" y="26" width="18" height="146" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="104" y="122" width="18" height="50" fill="rgba(6,182,212,0.85)" rx="2"/>
    </svg>
  </div>
</section>
```

Alternative passing pattern using `figure` / `figcaption`:

```html
<figure class="forge-card p-3 mb-4" hash="Dca" data-ks-hash="Dca">
  <figcaption id="api-latency-caption" class="forge-support mb-2">
    Line chart of median API latency (ms) over the last seven days; day six peaked at 420 ms.
  </figcaption>
  <div
    id="ks-api-latency"
    class="ks-chart-mount mb-0"
    data-ks-chart
    data-ks-chart-kind="api_latency_daily"
    data-ks-chart-url="/api/charts/api_latency_daily.json"
    data-ks-chart-state="ready"
    aria-labelledby="api-latency-caption"
  ></div>
</figure>
```

## Evidence and remediation

**Evidence:** Auditor metrics `chartAltSummaryReport` with `violations[]` kind `missing-chart-alt-summary`, `selectorHint` (for example `div#ks-cw.ks-chart-mount[kind=commit_weekly]`), and `className`. Findings surface as **major** accessibility issues with evidence token `missing_chart_alt_summary`. Capture the mount outer HTML, any `aria-*` attributes, and adjacent `forge-support` / `figcaption` nodes.

**Remediate (in order):**

1. Add a **visible or sr-only paragraph** (at least 8 characters) that states metric, unit, time window, and direction—not only the chart kind code.
2. Set **`aria-describedby`** on `.ks-chart-mount` (and matching `aria-label` / `aria-describedby` on inner `svg` or `canvas`) to that paragraph id.
3. When using `render_ks_chart_mount`, pass a **`title`** and add a second `forge-support` insight line in the page template if the auto caption is not enough.
4. For API-driven charts, ensure **loading and error** copy in the mount subtree meets the same minimum length.
5. Re-run deterministic chart checks; if summaries exist but lack takeaway quality, address **`AI.DATA.INSIGHT_LEGIBILITY`** separately.

## Related rules

- `AI.DATA.INSIGHT_LEGIBILITY` — judges whether the chart answers “so what?” beyond a minimal accessible summary.
- `DET.DATA.COLOR_ONLY` — meaning must not rely on hue alone where detectable.
- `DET.DATA.TABLE_HEADERS` — tabular data beside charts needs proper `<th>` scope.
- `DET.DIAGRAM.ALT` — static mechanism diagrams use diagram alt policy; data charts are covered here.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — product visuals should teach mechanism, not only meet caption minima.
