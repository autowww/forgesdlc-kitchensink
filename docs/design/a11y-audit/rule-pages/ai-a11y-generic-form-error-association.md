---
rule_id: AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION
lane: ai
scope: generic
title: Form Error Association
summary: AI judgment overlay (generic scope).
page_version: 4b7d26b26401252ed15719e4b809a2453e692ad27e0eb260e8924e2a73dfa612
generated_at: 2026-05-26T08:51:23.000Z
registry_fingerprint: e11a2939d018a45bae7d6e23364aba2ae4e13f190d942f49891c89ea84c44c46
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-generic-form-error-association
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.GENERIC.FORM_ERROR_ASSOCIATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

