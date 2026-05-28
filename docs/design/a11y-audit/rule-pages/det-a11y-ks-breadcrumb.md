---
rule_id: DET.A11Y.KS.BREADCRUMB
lane: deterministic
scope: ks
title: Breadcrumb
summary: Deterministic accessibility check (ks scope).
page_version: 65466ed153b87870b51557a125ddfc22f77727ef3c91f784a8490b3c5759b48e
generated_at: 2026-05-28T03:48:11.000Z
registry_fingerprint: 0021c088bf3664f96bb6c318bf46b537f04b476e6c6b1d511b371f23ade016ac
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-breadcrumb
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (ks scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.KS.BREADCRUMB` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.KS.BREADCRUMB` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.KS.BREADCRUMB</code> (ks).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.KS.BREADCRUMB</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.KS.BREADCRUMB` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

