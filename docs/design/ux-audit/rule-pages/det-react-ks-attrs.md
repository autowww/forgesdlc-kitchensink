---
rule_id: DET.REACT.KS_ATTRS
lane: deterministic
title: React Ks Attrs
summary: Harness bootstrap handbook page for DET.REACT.KS_ATTRS.
page_version: 26e7bf7f3bcceb0f0350e4a906de03eb7463e0be102c445f2f3aacecd80f0484
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-react-ks_attrs
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-react-ks-attrs.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.REACT.KS_ATTRS` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-name="chip">
<span class="badge">Chip</span></div>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="chip">
<span class="badge">Chip</span></div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.REACT.KS_ATTRS`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
