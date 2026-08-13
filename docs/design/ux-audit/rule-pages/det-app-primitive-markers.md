---
rule_id: DET.APP.PRIMITIVE_MARKERS
lane: deterministic
title: React Ks Attrs
summary: Harness bootstrap handbook page for DET.APP.PRIMITIVE_MARKERS.
page_version: 3a6187cbcb464af3f4e2b5e4d062871160f71cc6662192b03526f9bb8bdff848
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
