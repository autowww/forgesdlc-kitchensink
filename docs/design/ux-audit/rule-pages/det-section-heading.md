---
rule_id: DET.SECTION.HEADING
lane: deterministic
title: Section Heading
summary: Harness bootstrap handbook page for DET.SECTION.HEADING.
page_version: b960990ee6bafad724cc31a3a032fa3a3b79c8e27e9a971910ad0378a4103778
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-section-heading
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-section-heading.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.SECTION.HEADING` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<h1 class="font-display">Page title</h1>
<h3 class="h5">Skipped level</h3>
<p class="forge-support">Heading hierarchy jumps from h1 to h3.</p>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<h1 class="font-display">Forge UX rule handbook for section headings</h1>
<h2 class="h4">Section</h2>
<p class="forge-support">Sequential heading levels.</p>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SECTION.HEADING`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
