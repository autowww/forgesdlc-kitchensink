---
rule_id: DET.STUDIO.JOB_BUDGET
lane: deterministic
title: Studio job budget
summary: One primary workspace job per view; secondary jobs behind Svc tabs or disclosure—not competing H2 scroll sections.
page_version: 06474ed3727ea0c55143d391d9e620c8ecc34c97e09ca684ed03905c9ef701e5
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-job_budget
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Operator Studio pages may be information-dense, but each **workspace view** should expose **one primary job** in the first viewport. Secondary jobs (Screen vs Alerts vs Compare, Charts vs Wiki) belong behind **`Svc`** segmented tabs (`[role=tablist]`), not as four peer `h2` sections on one long scroll.

`DET.STUDIO.JOB_BUDGET` replaces marketing **`DET.SECTION.SINGLE_JOB`** for Studio SPAs. It counts `h2` elements when no tablist is present: warn above 2, fail above 4. Mode tabs plus a single in-panel filter toolbar (`Ftb`) are progressive disclosure, not competing jobs, when only one data surface is visible.

**Plan:** List H2s above the fold and below. **Do:** Remount IA with `Svc` tabs before cosmetic polish. **Check:** `has_tablist: true` or `h2_count ≤ 2`. **Adjust:** Demote reference panels to tabs or collapsible `Cap` panels.

## Passing signals

- One primary table, chart, or builder visible; secondary jobs behind `[role="tablist"]`.
- `h2_count ≤ 2` without tabs, or tabs present with one active panel.
- Filters in `Ftb` scope the primary job—they are chrome, not a second page.

## Failing signals

- Five `h2` sections (Lists, Screen, Alerts, Compare, Settings) on one scroll without tabs.
- Two full-width tables visible simultaneously without a mode switch.
- Wiki builder and operational table both expanded as peer jobs on a non-wiki route.

## Before example

```html
<main class="fc-main" data-studio-workspace="watchlists">
  <h1>Watchlists</h1>
  <section><h2>Your lists</h2><!-- table --></section>
  <section><h2>Screen criteria</h2><!-- form --></section>
  <section><h2>Alerts</h2><!-- table --></section>
  <section><h2>Compare</h2><!-- table --></section>
  <section><h2>Export</h2><!-- actions --></section>
</main>
```

## After example

```html
<main class="fc-main" data-studio-workspace="watchlists" data-ks-hash="Wls">
  <header class="fc-page-header"><h1>Watchlists</h1></header>
  <div role="tablist" aria-label="Watchlist modes" class="fc-segmented" data-testid="watchlists-tabs">
    <button role="tab" aria-selected="true" aria-controls="panel-lists" id="tab-lists">Lists</button>
    <button role="tab" aria-selected="false" aria-controls="panel-screen" id="tab-screen">Screen</button>
    <button role="tab" aria-selected="false" aria-controls="panel-alerts" id="tab-alerts">Alerts</button>
    <button role="tab" aria-selected="false" aria-controls="panel-compare" id="tab-compare">Compare</button>
  </div>
  <section role="tabpanel" id="panel-lists" aria-labelledby="tab-lists">
    <h2 class="visually-hidden">Your lists</h2>
    <!-- single primary table -->
  </section>
</main>
```

## Evidence and remediation

- Scorer: `tools/studio-ux-pdca/score-page.mjs` (`DET.STUDIO.JOB_BUDGET`).
- Remediation component: **`Svc`** (`studio-ui/src/ks/` segmented control).
- Do **not** use marketing `DET.SECTION.SINGLE_JOB` NLP on Studio routes.

## Related rules

- `DET.APP.TAB_PANEL` — ARIA wiring for tabs.
- `DET.BUTTON.GROUP.MAX` — action rows after IA remount.
- `AI.APP.DENSITY_BALANCE` — judgment when counts pass but layout still feels chaotic.
- `DET.SECTION.SINGLE_JOB` — marketing/handbook sections only.
