---
rule_id: DET.PAGE.VIEWPORT
lane: deterministic
title: Page Viewport
summary: Harness bootstrap handbook page for DET.PAGE.VIEWPORT.
page_version: dd0af00c344b04902548cde47c0a4b1ff924d78b01337602af39029a86bdbd70
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-viewport
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/page/viewport.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PAGE.VIEWPORT` on the defect fixture.

## Before example

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>No viewport</title></head>
<body><main id="main"><p class="forge-support">Missing responsive viewport meta.</p></main></body>
</html>
```

## After example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>With viewport</title>
</head>
<body><main id="main"><p class="forge-support">Viewport meta present.</p></main></body>
</html>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.VIEWPORT`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
