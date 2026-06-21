---
rule_id: DET.APP.CONTROL_A11Y
lane: deterministic
title: React A11Y Role
summary: Harness bootstrap handbook page for DET.APP.CONTROL_A11Y.
page_version: 92c34366a639ff1907da7f8e2f1722cfbd0fec9683b31a9fe9122b4ece1455a1
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-control_a11y
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-app-control-a11y.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.APP.CONTROL_A11Y` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="status-pill">
<button type="button" class="btn btn-sm btn-forge"></button>
</div>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="status-pill" role="status">
<button type="button" class="btn btn-sm btn-forge" aria-label="Refresh status">↻</button>
</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.CONTROL_A11Y`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
