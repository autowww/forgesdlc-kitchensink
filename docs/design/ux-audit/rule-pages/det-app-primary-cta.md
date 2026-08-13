---
rule_id: DET.APP.PRIMARY_CTA
lane: deterministic
title: App primary CTA
summary: At most one visible primary action per workspace.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-cta
registry_status: implemented
page_version: af34958630f56a2572b55c75db2f53627431d7313171ad41d837a26ceeea6f24
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-05-28T17:05:34.723Z
---

## Purpose

Each `[data-studio-workspace]` exposes at most one visible primary CTA.

## Before example

```html
<main id="main" data-studio-workspace="runs">
<button type="button" class="btn btn-primary">Start run</button>
<button type="button" class="btn btn-primary">Export report</button>
</main>
```

## After example

```html
<main id="main" data-studio-workspace="runs">
<button type="button" class="btn btn-primary" data-studio-primary-cta>Start run</button>
<button type="button" class="btn btn-outline-primary">Export report</button>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMARY_CTA`.
