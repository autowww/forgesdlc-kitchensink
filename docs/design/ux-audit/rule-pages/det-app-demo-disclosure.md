---
rule_id: DET.APP.DEMO_DISCLOSURE
lane: deterministic
title: App demo disclosure
summary: Demo and mock regions must be visibly labeled in the same section.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-demo-disclosure
registry_status: implemented
page_version: d6c28538b32e88f94fd45e283620939675fd8a57789c192fec095c4165f6538f
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
