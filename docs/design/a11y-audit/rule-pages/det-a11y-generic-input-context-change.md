---
rule_id: DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE
lane: deterministic
scope: generic
title: Input Context Change
summary: Deterministic accessibility check (generic scope).
page_version: 5f154bf13c04f992ac18b1b95dd986f4620728aad355c09f24e7dc60c0e10a03
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-input-context-change
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Input Context Change</h2><p class="forge-support mb-2">Form control labeling or error association is weak.</p><p class="mb-0 small">Rule: <code>DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE</code> · scope: generic</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Input Context Change (remediated)</h2><p class="mb-2">Labels, instructions, and errors are programmatically associated.</p><p class="mb-0 small text-muted">Deterministic accessibility check (generic scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.INPUT_CONTEXT_CHANGE` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **3.2.2** — [`wcag/2.2/sc/3.2.2-on-input.md`](../wcag/2.2/sc/3.2.2-on-input.md)

