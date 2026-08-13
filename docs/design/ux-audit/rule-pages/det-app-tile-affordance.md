---
rule_id: DET.APP.TILE_AFFORDANCE
lane: deterministic
title: App tile affordance
summary: Link-styled dashboard tiles are operable links or keyboard buttons.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-tile-affordance
registry_status: implemented
page_version: 434a258de5ac9ffeff504dd1f7e24a94a77797598889484e1dd5b010d7e5fbab
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
