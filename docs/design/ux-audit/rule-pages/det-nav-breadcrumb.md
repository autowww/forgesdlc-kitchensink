---
rule_id: DET.NAV.BREADCRUMB
lane: deterministic
title: Nav Breadcrumb
summary: Harness bootstrap handbook page for DET.NAV.BREADCRUMB.
page_version: 6a69666312297289b01b2cfc0636983ebc28efaa97376a00e4063ea57cad56f4
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-breadcrumb
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-nav-breadcrumb.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.NAV.BREADCRUMB` on the defect fixture.

## Before example

```html
<header class="site-header px-3 py-2"><div class="site-header-content"><h1 class="h5 mb-0">Chapter</h1></div></header>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr" data-ks-type="chrome-region" data-ks-name="doc-sidebar">
<nav><a href="/docs" class="nav-link active">Docs</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Doc hub without Kbc breadcrumb chrome.</p></main>
```

## After example

```html
<header class="site-header px-3 py-2">
<nav class="ks-doc-breadcrumb" aria-label="Breadcrumb" data-ks-hash="Kbc" data-ks-type="chrome-region" data-ks-name="doc-breadcrumb">
<a href="/" class="forge-support">Home</a><span aria-hidden="true"> / </span><span aria-current="page">Page</span>
</nav></header>
<aside class="forge-sidebar col-lg-3 d-flex flex-column p-3" data-ks-hash="Ksr"><nav><a href="/docs" class="nav-link active">Docs</a></nav></aside>
<main id="main" class="px-4 py-4"><p class="forge-support">Kbc breadcrumb present on doc hub.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.BREADCRUMB`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
