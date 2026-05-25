---
rule_id: DET.MOTION.PREFERS_REDUCED
lane: deterministic
title: Motion Prefers Reduced
summary: Harness bootstrap handbook page for DET.MOTION.PREFERS_REDUCED.
page_version: ffee4c3e5a22a542dcde4eb61650a5a74ffcf3f4fb3f4bbd0b6b1b2f58a66907
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-motion-prefers_reduced
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-motion-prefers-reduced.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.MOTION.PREFERS_REDUCED` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<style>@media (prefers-reduced-motion: no-preference) { .spin { animation: spin 0.4s linear infinite; } }
@keyframes spin { to { transform: rotate(360deg); } }</style>
<div class="spin forge-card p-3">Always spins — ignores reduced motion.</div>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<style>@media (prefers-reduced-motion: reduce) { .spin { animation: none !important; } }</style>
<div class="spin forge-card p-3">Respects prefers-reduced-motion.</div>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.PREFERS_REDUCED`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
