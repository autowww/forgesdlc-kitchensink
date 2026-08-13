---
rule_id: DET.APP.DEMO_DISCLOSURE
lane: deterministic
title: App demo disclosure
summary: Demo and mock regions must be visibly labeled in the same section.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-demo-disclosure
registry_status: implemented
page_version: 21ddb6237563e9cc3fac1a8eceefab6a2ba6543079414b007adafcfd15292323
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-05-28T17:05:34.718Z
---

## Purpose

Operator surfaces must not present sample or mock data without a visible Demo/Sample/Mock label in the same section.

## Before example

```html
<main id="main" class="doc-main px-4 py-4" data-studio-workspace="demo">
<section data-demo class="card p-3">
  <h2 class="h5">Run summary</h2>
  <p class="mb-0">Synthetic metrics for layout review only.</p>
</section>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4" data-studio-workspace="demo">
<section data-demo class="card p-3">
  <span class="badge bg-secondary studio-demo-label">Demo data</span>
  <h2 class="h5">Run summary</h2>
  <p class="mb-0">Synthetic metrics for layout review only.</p>
</section>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DEMO_DISCLOSURE`.
