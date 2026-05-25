---
rule_id: DET.HTML.EMPTY_INLINE
lane: deterministic
title: Html Empty Inline
summary: Harness bootstrap handbook page for DET.HTML.EMPTY_INLINE.
page_version: c7195a9b294297c8ee7a06c29cd8d07d908f6afa770e2370984dc48b01402e26
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-html-empty-inline
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-html-empty-inline.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.HTML.EMPTY_INLINE` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Label <strong></strong> with empty emphasis.</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Label <strong>visible</strong> text.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.HTML.EMPTY_INLINE`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
