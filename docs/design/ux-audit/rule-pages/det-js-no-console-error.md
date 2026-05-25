---
rule_id: DET.JS.NO_CONSOLE_ERROR
lane: deterministic
title: Js No Console Error
summary: Harness bootstrap handbook page for DET.JS.NO_CONSOLE_ERROR.
page_version: 3a388ec1fd4634daaabc8760c5cf8f447dcd1a931e2cc74d3e9107d3d4d3b401
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-js-no_console_error
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-js-no-console-error.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.JS.NO_CONSOLE_ERROR` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<ul class="nav nav-tabs mb-3"><li><button type="button" class="btn btn-sm btn-forge" data-bs-toggle="tab" id="harnessErrTab">Trigger</button></li></ul>
<script>document.getElementById('harnessErrTab')?.addEventListener('click',()=>console.error('harness intentional console error'));</script>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><button type="button" class="btn btn-forge">Safe</button></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.JS.NO_CONSOLE_ERROR`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
