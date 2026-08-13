---
rule_id: DET.APP.PRIMARY_CTA
lane: deterministic
title: App primary CTA
summary: At most one visible primary action per workspace.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-cta
registry_status: implemented
page_version: c77e5e20f41bdde93395a9104263c7186fd27a3bf2446472ba39546a4e929fb6
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
