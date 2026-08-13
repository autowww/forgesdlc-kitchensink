---
rule_id: DET.JS.PROGRESSIVE
lane: deterministic
title: Js Progressive
summary: Harness bootstrap handbook page for DET.JS.PROGRESSIVE.
page_version: e68b5b9e9e9296e6aaa48e13693ac5a07f077f06aade5eea9dba1077578615d4
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-js-progressive
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-js-progressive.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.JS.PROGRESSIVE` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<noscript><p class="forge-support">Brief noscript fallback only.</p></noscript>
<script>const m=document.getElementById('main');if(m)m.innerHTML='<p class="forge-support">'+'w '.repeat(200)+'</p>';</script>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4">
<p class="forge-support">Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. Same substantive copy visible with or without script. </p>
<noscript><p class="forge-support">Noscript fallback present.</p></noscript>
</main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.JS.PROGRESSIVE`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
