---
rule_id: DET.APP.PRIMARY_CTA
lane: deterministic
title: App primary CTA
summary: At most one visible primary action per workspace.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primary-cta
registry_status: implemented
page_version: 8a3d48bb18ed60117a9fbc1044fa7df7f8cbcbf09e1360c0d7b3e19cec1545bf
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
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
