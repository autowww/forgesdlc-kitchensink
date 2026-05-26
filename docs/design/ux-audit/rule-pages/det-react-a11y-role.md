---
rule_id: DET.REACT.A11Y_ROLE
lane: deterministic
title: React A11Y Role
summary: Harness bootstrap handbook page for DET.REACT.A11Y_ROLE.
page_version: ff0b0c65b02fd5b179a0115612c24b1dd6493a03243d1208d1b8127f7aeab7bc
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
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
