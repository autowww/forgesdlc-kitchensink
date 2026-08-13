---
rule_id: DET.SECTION.HEADING
lane: deterministic
title: Section Heading
summary: Harness bootstrap handbook page for DET.SECTION.HEADING.
page_version: 78c1baf2f436e662019243145c7d16e9ccd7421dd76c80e388e70a5aab80727a
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
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
