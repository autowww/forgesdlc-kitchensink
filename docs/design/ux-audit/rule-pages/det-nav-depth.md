---
rule_id: DET.NAV.DEPTH
lane: deterministic
title: Nav Depth
summary: Harness bootstrap handbook page for DET.NAV.DEPTH.
page_version: 6c9992a82595ddcfeb679163a84a7f1e5c1029afa94c102b83936be64244f5fb
generated_at: 2026-05-23T13:24:10Z
agent_model: bootstrap-missing-rule-pages.py
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-depth
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-nav-depth.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.NAV.DEPTH` on the defect fixture.

## Before example

```html
<header class="site-header px-3 py-2"><nav aria-label="Site navigation" class="landing-nav">
<ul class="list-unstyled mb-0"><li><a href="/">Home</a>
<ul><li><a href="/a">A</a><ul><li><a href="/b">B</a><ul><li><a href="/c">C</a><ul><li><a href="/d">D</a></li></ul></li></ul></li></ul></li></ul></li></ul>
</nav></header><main id="main" class="px-4 py-4"><p class="forge-support">Global nav nesting exceeds depth cap.</p></main>
```

## After example

```html
<header class="site-header px-3 py-2"><nav aria-label="Site navigation" class="landing-nav">
<ul class="list-unstyled mb-0"><li><a href="/">Home</a><ul><li><a href="/docs">Docs</a></li></ul></li></ul>
</nav></header><main id="main" class="px-4 py-4"><p class="forge-support">Shallow global nav.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.DEPTH`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
