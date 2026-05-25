---
rule_id: DET.LAYOUT.GRID_CONSISTENCY
lane: deterministic
title: Layout Grid Consistency
summary: Harness bootstrap handbook page for DET.LAYOUT.GRID_CONSISTENCY.
page_version: 35628467615fe6c13c124c8bec16571065b3b46b09e9a3866e7a9ef1659e048c
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-layout-grid_consistency
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-layout-grid-consistency.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.LAYOUT.GRID_CONSISTENCY` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<section class="ks-section">
<p class="forge-support">Aligned prose block one with shared measure and enough words for grid scan. Aligned prose block one with shared measure and enough words for grid scan. Aligned prose block one with shared measure and enough words for grid scan. Aligned prose block one with shared measure and enough words for grid scan. </p>
<p class="forge-support" style="margin-left:72px">Same section but gutter drift on block two with matching word count. Same section but gutter drift on block two with matching word count. Same section but gutter drift on block two with matching word count. Same section but gutter drift on block two with matching word count. </p>
</section>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<div class="doc-content"><p class="forge-support">Aligned prose block one.</p></div>
<div class="doc-content"><p class="forge-support">Aligned prose block two.</p></div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.LAYOUT.GRID_CONSISTENCY`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
