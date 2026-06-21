---
rule_id: DET.THEME.CONTRAST_MIN
lane: deterministic
title: Theme Contrast Min
summary: Harness bootstrap handbook page for DET.THEME.CONTRAST_MIN.
page_version: 97c147779f5f6f04f6305f426ad1aebad6f7de5ded7de9b6d052f38d8f737141
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-theme-contrast_min
related_rules: []
---

## Purpose

Bootstrap page for the DET ruleset harness. Examples are minimal Kitchen Sink markup aligned with `design-rules/deterministic/generated/det-theme-contrast-min.check.js`.

## Passing signals

- After example satisfies the rule on audit.

## Failing signals

- Before example triggers `DET.THEME.CONTRAST_MIN` on the defect fixture.

## Before example

```html
<main id="main" class="doc-main px-4 py-4">
<p style="color:#5a5a5a;background:#606060" class="forge-support">Low contrast body text on muted panel.</p>
</main>
```

## After example

```html
<main id="main" class="doc-main px-4 py-4"><p class="forge-support" style="color:var(--forge-text-1);background:var(--forge-bg)">Token-backed contrast.</p></main>
```

## Evidence and remediation

Run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.THEME.CONTRAST_MIN`.

## Related rules

- See `docs/design/ux-audit/deterministic-design-rules.md`
