---
rule_id: DET.PY.OPTIONAL_REGIONS
lane: deterministic
title: Py Optional Regions
summary: Harness bootstrap handbook page for DET.PY.OPTIONAL_REGIONS.
page_version: 855a50dba569006c705edcf7d346e6220f908e672ab7a26044839f3e45a69106
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
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
