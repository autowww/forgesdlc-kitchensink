---
rule_id: DET.APP.PRIMITIVE_MARKERS
lane: deterministic
title: React Ks Attrs
summary: Harness bootstrap handbook page for DET.APP.PRIMITIVE_MARKERS.
page_version: c11418a99a10722ee59f11bdcdc6d2bb2e2dc1e60544e5d10b92845f6f09ad72
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-primitive_markers
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-app-primitive-markers.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.APP.PRIMITIVE_MARKERS` on the defect fixture.

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
<div hash="Rxp" data-ks-react-root="true" data-ks-type="react-primitive" data-ks-hash="Rxp" data-ks-name="chip">
<span class="badge">Chip</span></div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.PRIMITIVE_MARKERS`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
