---
rule_id: DET.PAGE.MODE
lane: deterministic
title: Page Mode
summary: Harness bootstrap handbook page for DET.PAGE.MODE.
page_version: dede42ab56e5555c9927d8a2039d05702d211c43675e5a43ad7ed6b2b738bbf2
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-mode
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-page-mode.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.PAGE.MODE` on the defect fixture.

## Before example

```html
<div class="landing-hero fs-landing-hero-band forge-section" data-ks-type="layout" data-ks-name="layout-landing">
  <div class="container-fluid"><h1 class="font-display mb-3">Product landing</h1></div>
</div>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar">
  <nav class="nav-scroll"><a href="/docs/a" class="nav-link">Chapter A</a><a href="/docs/b" class="nav-link">Chapter B</a>
  <a href="/docs/c" class="nav-link">Chapter C</a><a href="/docs/d" class="nav-link">Chapter D</a>
  <a href="/docs/e" class="nav-link">Chapter E</a><a href="/docs/f" class="nav-link">Chapter F</a></nav>
</aside>
<main id="main" class="doc-main px-4 py-4"><p class="forge-support">Handbook sidebar competes with marketing hero.</p></main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><section class="landing-hero"><h1 class="font-display">Product landing</h1>
<p class="forge-support">Single marketing mode without handbook chrome.</p></section></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.MODE`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
