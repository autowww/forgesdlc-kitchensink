---
rule_id: DET.APP.PRIMARY_STATE
lane: deterministic
title: App primary state
summary: One visible primary workspace state region per active studio page.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-state
registry_status: implemented
page_version: 822b0d45d1d63841d7348fe6d8799b7cdb86857e7e8de5203b31d60144b3bba1
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
