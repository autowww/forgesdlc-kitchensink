---
rule_id: DET.LANDMARKS.REQUIRED
lane: deterministic
title: Landmarks Required
summary: Harness bootstrap handbook page for DET.LANDMARKS.REQUIRED.
page_version: 51297216607b12c57ee833bd45163f19e075b08342eb765435c5ec12058d4d9c
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-landmarks-required
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-landmarks-required.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.LANDMARKS.REQUIRED` on the defect fixture.

## Before example

```html
<div class="site-header border-bottom px-3 py-2"><p class="forge-brand mb-0">Forge</p></div>
<div class="doc-main px-4 py-4"><p class="forge-support">Content without main landmark.</p></div>
<footer class="py-3 text-center"><p class="forge-support mb-0">Footer</p></footer>
```

## After example

```html
<header class="site-header border-bottom px-3 py-2"><p class="forge-brand mb-0">Forge</p></header>
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Semantic main landmark wraps primary content.</p></main>
<footer class="py-3 text-center"><p class="forge-support mb-0">Footer</p></footer>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.LANDMARKS.REQUIRED`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
