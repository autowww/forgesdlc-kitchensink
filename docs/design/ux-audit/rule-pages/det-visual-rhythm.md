---
rule_id: DET.VISUAL.RHYTHM
lane: deterministic
title: Visual Rhythm
summary: Harness bootstrap handbook page for DET.VISUAL.RHYTHM.
page_version: faa9c8a86519d5225e9bfc6e09d05da20bd7e4fb8de953fe9f52e3132ca07184
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
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
