---
rule_id: DET.PY.OPTIONAL_REGIONS
lane: deterministic
title: Py Optional Regions
summary: Harness bootstrap handbook page for DET.PY.OPTIONAL_REGIONS.
page_version: 71766cb637ebd19d64f9e352322bff3857f7f79149387898b2d2c6e95be325df
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-py-optional_regions
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-py-optional-regions.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PY.OPTIONAL_REGIONS` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-optional="true" class="fs-site-announcement"><h2 class="h6">Announcement</h2></div>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<div data-ks-optional="true" class="fs-site-announcement" hidden><h2 class="h6">Announcement</h2></div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PY.OPTIONAL_REGIONS`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
