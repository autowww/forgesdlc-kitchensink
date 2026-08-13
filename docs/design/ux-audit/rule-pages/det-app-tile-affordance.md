---
rule_id: DET.APP.TILE_AFFORDANCE
lane: deterministic
title: App tile affordance
summary: Link-styled dashboard tiles are operable links or keyboard buttons.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tile-affordance
registry_status: implemented
page_version: e92494baf346c5ab7fdc4d4482e4e02912db890a7798939137f1b584e27ff9de
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-05-28T17:05:34.739Z
---

## Purpose

KPI/dashboard tiles that look clickable must be `<a href>` or keyboard-operable `role="button"`.

## Before example

```html
<main id="main">
<div class="dashboard-tile card" style="cursor:pointer" tabindex="0">
  <span class="h4 mb-0">12</span>
  <span class="text-muted">Open findings</span>
</div>
</main>
```

## After example

```html
<main id="main">
<a class="dashboard-tile card text-decoration-none" href="/findings">
  <span class="h4 mb-0">12</span>
  <span class="text-muted">Open findings</span>
</a>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.TILE_AFFORDANCE`.
