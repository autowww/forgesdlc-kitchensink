---
rule_id: DET.MOTION.NO_AUTO_PLAY_FLASH
lane: deterministic
title: Motion No Auto Play Flash
summary: Harness bootstrap handbook page for DET.MOTION.NO_AUTO_PLAY_FLASH.
page_version: 6d362dfebaa938ee2d52159a9935b5122d886612dc0347ad9ce3691cc7665594
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-motion-no_auto_play_flash
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-motion-no-auto-play-flash.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.MOTION.NO_AUTO_PLAY_FLASH` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<style>@keyframes blink { from { opacity: 1; } to { opacity: 0; } }
.risk { animation: blink 0.2s infinite; }</style>
<p class="risk forge-support">High-frequency flashing text.</p>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">No seizure-risk flash animation.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.NO_AUTO_PLAY_FLASH`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
