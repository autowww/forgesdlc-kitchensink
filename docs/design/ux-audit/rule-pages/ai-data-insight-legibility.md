---
rule_id: AI.DATA.INSIGHT_LEGIBILITY
lane: ai
title: Data insight legibility
summary: Charts and data blocks must state the intended takeaway—not only render accurate geometry.
page_version: 85055acce8a777b2d6fcf903cb3d4c705fb30d0d73ac8c8fcc87591d99b3af57
generated_at: 2026-05-19T19:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-data-insight-legibility
---

## Purpose

Kitchen Sink **data charts** (`render_ks_chart_mount`, `data-ks-chart`, `forge-data-charts.js`) and adjacent tables ship on showcase pages (`Dcs`, `Dca`) and consumer dashboards. Deterministic checks confirm summaries exist (`DET.CHART.ALT_SUMMARY`), tables have headers (`DET.DATA.TABLE_HEADERS`), and meaning is not color-only (`DET.DATA.COLOR_ONLY`). This AI rule judges whether a visitor can answer **“so what?”** from the block—not merely decode bars or slices.

**Plan:** Read the chart in context (section title, surrounding copy, operator task). Note whether emphasis, annotation, and takeaway copy align with the story the page claims. **Do:** Add an outcome-first heading, a one-sentence insight, and in-chart or adjacent labels for the comparison you want remembered. **Check:** A skimmer gets the main claim without hovering every bar or inferring from palette alone. **Adjust:** If missing summaries or unlabeled series repeat, tighten `DET.CHART.ALT_SUMMARY` or propose annotation helpers in `forge-data-charts.js`.

## Passing signals

- **Takeaway title** states the insight (`h2` / `h3` in `ks-section`, or `card-label` inside `forge-card`)—not only the chart kind (`commit_weekly`) or raw metric name.
- **Plain-language summary** beside or below the mount (`forge-support`, `figcaption`, or `aria-describedby`) names direction, magnitude, and comparison window (e.g. “Commits doubled in W10 after the release freeze lifted”).
- **Emphasis matches the story:** annotated peak/trough, highlighted series, or callout on the bar/week that supports the takeaway—not decorative accent alone.
- **Redundant encoding:** series use labels, values on bars, `lenses-overview-donut-swatch` + text, or table columns—not hue alone (`DET.DATA.COLOR_ONLY` ally).
- **Accessible summary** satisfies `DET.CHART.ALT_SUMMARY` (non-trivial text, `aria-describedby`, or nearby caption) and stays consistent with visible emphasis.
- Chart mount keeps KS attributes (`ks-chart-mount`, `data-ks-chart-kind`, `data-ks-chart-state`) inside a bounded region with loading/error states readable.

## Failing signals

- Only the auto caption from `render_ks_chart_mount` (`<strong>Weekly commits</strong> · <code>commit_weekly</code>`) with no “so what” sentence.
- Accurate SVG geometry but **no** annotation on the week, repo, or score the prose discusses.
- Competing charts at equal visual weight with identical `forge-support` stubs—visitor cannot tell which block answers the section question.
- Insight buried in tooltip-only `<title>` elements with no visible takeaway for keyboard or skimming readers.
- Color highlights the tallest bar while copy claims a different trend (emphasis contradicts narrative).
- Dense multi-chart grids (`data-charts-static` style) with no per-chart summary or section-level synthesis.

## Before example

Failing KS markup: correct mount and geometry, but only a generic label—no takeaway, annotation, or accessible insight summary.

```html
<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <h2 class="ks-section-title">Activity</h2>
  <p class="forge-support small mb-1"><strong>Weekly commits</strong> · <code>commit_weekly</code></p>
  <div id="ks-cw" class="ks-chart-mount mb-3" data-ks-chart data-ks-chart-kind="commit_weekly" data-ks-chart-state="ready">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" role="img" aria-label="Commits by week" style="width:100%;max-width:720px;height:auto">
      <rect x="52" y="98" width="18" height="74" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="78" y="26" width="18" height="146" fill="rgba(6,182,212,0.85)" rx="2"/>
      <rect x="104" y="122" width="18" height="50" fill="rgba(6,182,212,0.85)" rx="2"/>
    </svg>
  </div>
</section>
```

## After example

Passing KS markup: outcome-first heading, insight summary linked to the chart, and visible emphasis on the week the copy discusses.

```html
<section id="sec-dc-kinds" class="ks-section" hash="Dcs" data-ks-hash="Dcs" data-ks-type="page" data-ks-name="data-charts-static">
  <div class="forge-card p-3 mb-4">
    <p class="card-label mb-1">Delivery pulse</p>
    <h2 class="h5 mb-2" id="weekly-commits-insight">Commit volume spiked in 2025-W10, then eased</h2>
    <p id="weekly-commits-summary" class="forge-support mb-3">
      Weekly commits jumped from 4 to 7 (+75%) in W10—the highest bar in the window—before falling to 3 in W11.
    </p>
    <p class="forge-support small mb-1"><strong>Weekly commits</strong> · <code>commit_weekly</code></p>
    <div
      id="ks-cw"
      class="ks-chart-mount mb-0"
      data-ks-chart
      data-ks-chart-kind="commit_weekly"
      data-ks-chart-state="ready"
      aria-describedby="weekly-commits-summary"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" role="img" aria-labelledby="weekly-commits-insight" aria-describedby="weekly-commits-summary" style="width:100%;max-width:720px;height:auto">
        <rect x="52" y="98" width="18" height="74" fill="rgba(6,182,212,0.55)" rx="2"/>
        <rect x="78" y="26" width="18" height="146" fill="rgba(245,158,11,0.88)" rx="2"/>
        <rect x="104" y="122" width="18" height="50" fill="rgba(6,182,212,0.55)" rx="2"/>
        <text x="87" y="18" text-anchor="middle" fill="var(--forge-muted,#94a3b8)" font-size="10">Peak · W10 · 7 commits</text>
      </svg>
    </div>
    <p class="forge-support small mb-0 mt-2">
      <span class="lenses-overview-donut-swatch" style="background:rgba(245,158,11,0.88)" aria-hidden="true"></span>
      Highlighted week = focal comparison; muted bars = baseline weeks.
    </p>
  </div>
</section>
```

## Evidence and remediation

**Capture:** screenshot of the chart block at desktop and narrow widths; copy the DOM around `ks-chart-mount` including headings, `aria-describedby` targets, and any `forge-card` wrapper. For API-driven charts (`data-ks-chart-url`), capture loading and error states too.

**Remediate (in order):**

1. Replace kind-only headings with an **outcome title** (`h2`/`h3` or `card-label` + insight headline).
2. Add a **one-sentence takeaway** (`forge-support` or `figcaption`) that states direction, delta, and window; wire `aria-describedby` on the mount (`DET.CHART.ALT_SUMMARY`).
3. **Emphasize** the series or period the copy names (amber peak bar, callout text, table row bold)—keep redundant text labels (`DET.DATA.COLOR_ONLY`).
4. If multiple charts share a section, add a **section synthesis** paragraph or reorder so one chart is primary.
5. Re-run deterministic chart/table checks; if tooltip-only insight repeats, propose a `DET.*` annotation contract for `forge-data-charts.js`.

## Related rules

- `DET.CHART.ALT_SUMMARY` — chart or graph has a non-trivial text summary, `aria-describedby`, or nearby caption.
- `DET.DATA.COLOR_ONLY` — meaning not conveyed by color alone where detectable.
- `DET.DATA.TABLE_HEADERS` — tables expose `<th>` scope or explicit header associations.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — product visuals teach mechanism and outcome, not decoration alone.
- `AI.DIAGRAM.SEMANTIC_ACCURACY` — diagram topology matches captioned mechanism (adjacent judgment for SVG flows).
