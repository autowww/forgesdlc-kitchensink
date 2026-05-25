---
rule_id: DET.NAV.FOCUS_ORDER
lane: deterministic
title: Nav Focus Order
summary: Harness bootstrap handbook page for DET.NAV.FOCUS_ORDER.
page_version: caf6e37b2bf33ac33e7bd439c20d3ae66fc4954ff028ad9dbb1df2fa25518bb0
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-focus_order
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-nav-focus-order.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.NAV.FOCUS_ORDER` on the defect fixture.

## Before example

```html
<header class="site-header px-3 py-2"><a href="#main" class="btn btn-sm btn-forge">Skip</a></header>
<div class="doc-main px-4 py-4" tabindex="0"><a href="/" class="btn btn-forge">Home</a></div>
<a href="/contact" class="btn btn-outline-secondary position-fixed" style="top:8px;right:8px;z-index:2000">Contact</a>
```

## After example

```html
<header class="site-header px-3 py-2"><a href="#main" class="btn btn-sm btn-forge">Skip</a></header>
<main id="main" class="doc-main px-4 py-4"><a href="/" class="btn btn-forge">Home</a></main>
<a href="/contact" class="btn btn-outline-secondary">Contact</a>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.FOCUS_ORDER`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
