---
rule_id: DET.PAGE.TITLE
lane: deterministic
title: Page Title
summary: Harness bootstrap handbook page for DET.PAGE.TITLE.
page_version: 4b00e7a048eddc2e3b0b44f2a4ae46fe17b045273abee7241b1753feb85b2596
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-title
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/page/title.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PAGE.TITLE` on the defect fixture.

## Before example

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Home</title></head>
<body><main id="main"><p class="forge-support">Generic title placeholder.</p></main></body>
</html>
```

## After example

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Forge SDLC — Governed delivery handbook</title></head>
<body><main id="main"><p class="forge-support">Descriptive page title.</p></main></body>
</html>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.TITLE`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
