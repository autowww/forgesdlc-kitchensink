---
rule_id: DET.REACT.A11Y_ROLE
lane: deterministic
title: React A11Y Role
summary: Harness bootstrap handbook page for DET.REACT.A11Y_ROLE.
page_version: e0f4f7afd99adb70f2e8dac7e98a974e0a016573516c11d8072ed8e09a8032b5
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-react-a11y_role
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-react-a11y-role.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.REACT.A11Y_ROLE` on the defect fixture.

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

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.REACT.A11Y_ROLE`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
