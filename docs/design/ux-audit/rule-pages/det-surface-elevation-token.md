---
rule_id: DET.SURFACE.ELEVATION_TOKEN
lane: deterministic
title: Surface Elevation Token
summary: Harness bootstrap handbook page for DET.SURFACE.ELEVATION_TOKEN.
page_version: aa7f0a4c0ff4aba8b16ed6191e023d1b65ad619cc02db92b03fb8c8ee846087a
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
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
