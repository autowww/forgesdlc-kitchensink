---
rule_id: DET.APP.TILE_AFFORDANCE
lane: deterministic
title: App tile affordance
summary: Link-styled dashboard and studio KPI tiles must be real links or keyboard-operable buttons—not inert divs with pointer styling.
page_version: 391e75de16571930c294e2ad7f43f6956cb95774e175dfacdc32656850cca291
generated_at: 2026-05-28T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tile-affordance
related_rules:
  - DET.APP.CONTROL_A11Y
  - DET.APP.PRIMARY_CTA
  - DET.NAV.FOCUS_ORDER
  - DET.APP.FOCUS_TRAP
  - AI.JS.BEHAVIOR_DISCOVERABILITY
---

## Purpose

Operator dashboards and studio workspaces use **metric tiles** that look like navigation targets: pointer cursor, hover elevation, and classes such as `dashboard-kpi-card--link` or `tile--link`. When the root is a non-interactive `<div>` (even with `tabindex="0"`), keyboard and assistive-tech users cannot activate the tile reliably, and trust in the control plane erodes.

This deterministic rule scans visible `.dashboard-kpi-card` and `[data-studio-tile]` roots. If a tile **looks clickable** (`cursor: pointer`, `dashboard-kpi-card--link`, `tile--link`, or class `clickable`) it must be a proper control: `<a href="…">`, `<button>`, or an element with `role="button"` / `role="link"` plus `tabindex="0"` (or native focusability).

**Plan:** Inventory KPI rows and studio tile grids on each workspace URL. **Do:** Use `<a>` for navigation tiles; use `<button>` or `role="button"` for in-place actions. **Check:** `metrics.tileAffordanceReport.violations` is empty. **Adjust:** Remove fake pointer affordance from static summary tiles, or wire real href / keyboard handlers.

## Passing signals

- Navigation KPI tiles are **`<a class="dashboard-kpi-card … dashboard-kpi-card--link" href="…">`** with label/value/status children (`dashboard-kpi-card__label`, `dashboard-kpi-card__value`, `dashboard-kpi-card__status`).
- In-place actions use **`<button type="button" class="dashboard-kpi-card …">`** or a **`role="button"`** surface with **`tabindex="0"`** and Enter/Space activation in script.
- Static metric tiles **omit** link styling: no `dashboard-kpi-card--link`, `tile--link`, `clickable`, or `cursor: pointer` unless the root is a proper control.
- `[data-studio-tile]` roots follow the same contract when they use link-like classes or pointer cursor.
- `metrics.tileAffordanceReport.violations` is empty after crawl; no finding *A tile looks clickable but is not a link or keyboard-operable button.*

## Failing signals

- **`<div class="dashboard-kpi-card dashboard-kpi-card--link" …>`** (or `[data-studio-tile]`) with pointer cursor or link class but **no** `href`, `<button>`, or `role="button"` / `role="link"` with `tabindex`.
- **`tabindex="0"` alone** on a `<div>` without `role` and without keyboard activation handlers—still fails `isProperControl`.
- Evidence includes `tile="#selectorHint"` from the first class or `id` on the violating root (up to six findings per page).
- **Severity:** **major** (`scoreDimension: trustAndEcosystemTruth`, `area: conversion`).
- Page may pass **`DET.APP.PRIMARY_CTA`** yet still fail here when multiple tiles look navigable but only one is operable.

## Before example

Failing markup: link-styled KPI tile on a `<div>`—looks clickable, not a link or button.

```html
<main id="main" data-studio-workspace="overview" class="doc-main px-4 py-4">
  <section class="dashboard-kpi-row" aria-label="Workspace metrics">
    <div class="dashboard-kpi-row__grid row g-3">
      <div
        class="dashboard-kpi-card dashboard-kpi-card--risk dashboard-kpi-card--interactive dashboard-kpi-card--link col-md-4"
        style="cursor: pointer"
        tabindex="0"
        data-studio-tile="open-findings"
      >
        <p class="dashboard-kpi-card__label" id="kpi-open-label">Open findings</p>
        <p class="dashboard-kpi-card__value">12</p>
        <p class="dashboard-kpi-card__status">
          <span class="dashboard-status-pill dashboard-status-pill--warn">Needs review</span>
        </p>
      </div>
    </div>
  </section>
</main>
```

## After example

Passing markup: same visual tile as a real navigation link (preferred for drill-down KPIs).

```html
<main id="main" data-studio-workspace="overview" class="doc-main px-4 py-4">
  <section class="dashboard-kpi-row" aria-label="Workspace metrics">
    <div class="dashboard-kpi-row__grid row g-3">
      <a
        class="dashboard-kpi-card dashboard-kpi-card--risk dashboard-kpi-card--interactive dashboard-kpi-card--link col-md-4 text-decoration-none"
        href="/workspace/findings"
        data-studio-tile="open-findings"
        aria-labelledby="kpi-open-label"
      >
        <p class="dashboard-kpi-card__label" id="kpi-open-label">Open findings</p>
        <p class="dashboard-kpi-card__value">12</p>
        <p class="dashboard-kpi-card__status">
          <span class="dashboard-status-pill dashboard-status-pill--warn">Needs review</span>
        </p>
      </a>
    </div>
  </section>
</main>
```

Alternative passing pattern when the tile triggers an in-place action (refresh, expand) instead of navigation:

```html
<button
  type="button"
  class="dashboard-kpi-card dashboard-kpi-card--neutral dashboard-kpi-card--interactive tile--link col-md-4"
  data-studio-tile="refresh-metrics"
  aria-labelledby="kpi-refresh-label"
>
  <p class="dashboard-kpi-card__label" id="kpi-refresh-label">Coverage</p>
  <p class="dashboard-kpi-card__value">94%</p>
  <p class="dashboard-kpi-card__status">
    <span class="dashboard-status-pill dashboard-status-pill--ok">Healthy</span>
  </p>
</button>
```

## Evidence and remediation

**Evidence:** Playwright field `metrics.tileAffordanceReport` with `violations[]` entries (`selectorHint` from tile `id` or first class). Findings message: *A tile looks clickable but is not a link or keyboard-operable button.* Remediation hint: use `<a href="…">` for navigation tiles or add `role="button"`, `tabindex="0"`, and keyboard activation.

**Remediate (in order):**

1. **Navigation tiles** — change the root to `<a href="…" class="dashboard-kpi-card … dashboard-kpi-card--link">`; keep `aria-labelledby` pointing at `dashboard-kpi-card__label`.
2. **Action tiles** — use `<button type="button">` or `role="button"` with `tabindex="0"` and document Enter/Space handlers; do not rely on click-only `<div>` listeners.
3. **Static metrics** — remove `dashboard-kpi-card--link`, `tile--link`, `clickable`, and inline `cursor: pointer` from non-interactive summaries.
4. **Studio tiles** — apply the same rules to `[data-studio-tile]` when link styling or pointer cursor is present.

Reproduce locally: `generator/build_rule_defect_fixtures.py`, then `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TILE_AFFORDANCE`. Inspect `collectTileAffordanceReport` in `design-rules/deterministic/generated/det-app-tile-affordance.check.js`.

## Related rules

- `DET.APP.CONTROL_A11Y` — ARIA roles and states on interactive primitives inside app shells.
- `DET.APP.PRIMARY_CTA` — at most one visible primary action per workspace (orthogonal to per-tile affordance).
- `DET.NAV.FOCUS_ORDER` — logical tab order when multiple operable tiles sit in one row.
- `DET.APP.FOCUS_TRAP` — modals opened from a tile must trap focus until dismiss.
- `AI.JS.BEHAVIOR_DISCOVERABILITY` — judgment pass when tile behavior depends on undisclosed script contracts.
