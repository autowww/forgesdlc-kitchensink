---
rule_id: DET.SURFACE.ELEVATION_TOKEN
lane: deterministic
title: Surface Elevation Token
summary: Harness bootstrap handbook page for DET.SURFACE.ELEVATION_TOKEN.
page_version: f717e83eb07af79d22bff78d0410dd04a3fcab0d0f703ae826f10d4e280c7e58
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-surface-elevation_token
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-surface-elevation-token.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.SURFACE.ELEVATION_TOKEN` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<div class="forge-card p-3" style="box-shadow:0 24px 80px rgba(0,0,0,0.55)">Ad-hoc deep shadow.</div>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><div class="forge-card p-3">Uses design-system elevation tokens only.</div></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SURFACE.ELEVATION_TOKEN`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
