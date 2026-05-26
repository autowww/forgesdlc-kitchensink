---
rule_id: DET.A11Y.GENERIC.VIEWPORT
lane: deterministic
scope: generic
title: Viewport
summary: Deterministic accessibility check (generic scope).
page_version: 1ceebbbf934953cf933e81cb1f0a00d2ca8695aab64a86f5fff229c14bb1b270
generated_at: 2026-05-26T08:51:23.000Z
registry_fingerprint: e11a2939d018a45bae7d6e23364aba2ae4e13f190d942f49891c89ea84c44c46
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-viewport
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.VIEWPORT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.VIEWPORT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.GENERIC.VIEWPORT</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.GENERIC.VIEWPORT</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.VIEWPORT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

