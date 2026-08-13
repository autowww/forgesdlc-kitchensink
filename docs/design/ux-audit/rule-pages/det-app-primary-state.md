---
rule_id: DET.APP.PRIMARY_STATE
lane: deterministic
title: App primary state
summary: One visible primary workspace state region per active studio page.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-state
registry_status: implemented
page_version: 2b2cf27faeb1cb5db1a2148238c35353aed9eb178fba646d959c6e72ff456faf
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-05-28T17:05:34.727Z
---

## Purpose

Per active workspace, at most one visible `[data-studio-primary-state]` or `.studio-state--*` region.

## Before example

```html
<main id="main" class="studio-page" data-studio-workspace="hub">
<div class="studio-state--running" data-studio-primary-state>Running…</div>
<div class="studio-state--completed">Completed</div>
</main>
```

## After example

```html
<main id="main" class="studio-page" data-studio-workspace="hub">
<div class="studio-state--running" data-studio-primary-state>Running…</div>
<div class="studio-state--completed" hidden>Completed</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMARY_STATE`.
