---
rule_id: DET.A11Y.GENERIC.CONTEXT_HELP
lane: deterministic
scope: generic
title: Context Help
summary: Deterministic accessibility check (generic scope).
page_version: c11457815b65844cccb7790f5c1311aa2f59c7de2aa363fbfbd7ba8548b1146c
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-context-help
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.CONTEXT_HELP` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.CONTEXT_HELP` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Context Help</h2><p class="forge-support mb-2">DOM or content signals fail <code>DET.A11Y.GENERIC.CONTEXT_HELP</code> (context help).</p><p class="mb-0 small">Rule: <code>DET.A11Y.GENERIC.CONTEXT_HELP</code> · scope: generic</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Context Help (remediated)</h2><p class="mb-2">DOM and content satisfy <code>DET.A11Y.GENERIC.CONTEXT_HELP</code> after remediation.</p><p class="mb-0 small text-muted">Deterministic accessibility check (generic scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.CONTEXT_HELP` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

