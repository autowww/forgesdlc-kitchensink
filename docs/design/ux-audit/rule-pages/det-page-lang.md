---
rule_id: DET.PAGE.LANG
lane: deterministic
title: Page Lang
summary: Harness bootstrap handbook page for DET.PAGE.LANG.
page_version: 442adfa047af1bd765185104a6d6f9698ddb8c8f882055b063245dcd8eeddce0
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-lang
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/page/lang.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PAGE.LANG` on the defect fixture.

## Before example

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Missing lang</title></head>
<body><main id="main"><p class="forge-support">Root element omits lang.</p></main></body>
</html>
```

## After example

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>With lang</title></head>
<body><main id="main"><p class="forge-support">Document language declared.</p></main></body>
</html>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.LANG`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
