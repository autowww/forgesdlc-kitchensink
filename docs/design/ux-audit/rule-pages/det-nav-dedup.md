---
rule_id: DET.NAV.DEDUP
lane: deterministic
title: Nav Dedup
summary: Harness bootstrap handbook page for DET.NAV.DEDUP.
page_version: 643931944e23c3e1ccbf5359980f1fcd92bdb862280232080043c903409b5146
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-dedup
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-nav-dedup.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.NAV.DEDUP` on the defect fixture.

## Before example

```html
<header class="site-header px-3 py-2"><nav><a href="/docs/start" class="nav-link">Getting started</a></nav></header>
<aside class="forge-sidebar p-3" data-ks-hash="Ksr"><nav><a href="/docs/start" class="nav-link active">Getting started</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Duplicate destination across bands.</p></main>
```

## After example

```html
<header class="site-header px-3 py-2"><nav><a href="/product" class="nav-link">Product</a></nav></header>
<aside class="forge-sidebar p-3" data-ks-hash="Ksr"><nav><a href="/docs/start" class="nav-link active">Getting started</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Distinct destinations per band.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.DEDUP`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
