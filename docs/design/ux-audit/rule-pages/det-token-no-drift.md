---
rule_id: DET.TOKEN.NO_DRIFT
lane: deterministic
title: Token No Drift
summary: Harness bootstrap handbook page for DET.TOKEN.NO_DRIFT.
page_version: 53a3887c59e39d84ed2ca7f199dbceec852ca7bc4163d428d8cbb997c8fab24c
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
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
