---
rule_id: DET.TOKEN.NO_DRIFT
lane: deterministic
title: Token No Drift
summary: Harness bootstrap handbook page for DET.TOKEN.NO_DRIFT.
page_version: 5ed128085a781532bd03395cf303b8346906ee1d32da4c60fd8028d754dabf15
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
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
