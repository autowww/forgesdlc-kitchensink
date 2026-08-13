---
rule_id: DET.VISUAL.RHYTHM
lane: deterministic
title: Visual Rhythm
summary: Harness bootstrap handbook page for DET.VISUAL.RHYTHM.
page_version: 1bfdea1ce0ee05e14cc421984f3187982ab189b31aa472ffae4f5f7247c2cccc
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-visual-rhythm
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-visual-rhythm.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.VISUAL.RHYTHM` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<section class="forge-card p-3 mb-1 ks-section">Block A</section>
<section class="forge-card p-3 mb-5 ks-section">Block B</section>
<section class="forge-card p-3 mb-1 ks-section">Block C</section>
<section class="forge-card p-3 mb-5 ks-section">Block D</section>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<section class="forge-card p-3 mb-4 ks-section">Block A</section>
<section class="forge-card p-3 mb-4 ks-section">Block B</section>
<section class="forge-card p-3 mb-4 ks-section">Block C</section>
<section class="forge-card p-3 mb-4 ks-section">Block D</section>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.VISUAL.RHYTHM`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
