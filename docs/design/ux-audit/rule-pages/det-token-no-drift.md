---
rule_id: DET.TOKEN.NO_DRIFT
lane: deterministic
title: Token No Drift
summary: Harness bootstrap handbook page for DET.TOKEN.NO_DRIFT.
page_version: b916f7c5ee3279164038c3c813a9a5d8f45ecb49af8df9e105a5d664d1b77c61
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-token-no_drift
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-token-no-drift.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.TOKEN.NO_DRIFT` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Raw hex in repo CSS overlay triggers drift scan.</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support" style="color:var(--forge-text-1)">Token-only styling.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.TOKEN.NO_DRIFT`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
