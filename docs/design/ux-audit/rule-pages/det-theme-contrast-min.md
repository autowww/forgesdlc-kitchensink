---
rule_id: DET.THEME.CONTRAST_MIN
lane: deterministic
title: Theme Contrast Min
summary: Harness bootstrap handbook page for DET.THEME.CONTRAST_MIN.
page_version: e487b7c9267eef1a167c6dab7403d670c3cabfec711f1672b867944699e7a293
generated_at: 2026-05-23T13:24:10Z
agent_model: handbook-version-sync
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
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
