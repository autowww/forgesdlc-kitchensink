---
rule_id: DET.A11Y.GENERIC.INPUT_PURPOSE
lane: deterministic
scope: generic
title: Input purpose
summary: Personal data fields need autocomplete tokens (1.3.5).
page_version: 02148ab0dae225c64bc6ba6625963802b5ae37c3f3a9a8b5d4ece0e5e18a5b77
generated_at: 2026-05-28T04:08:36.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-input-purpose
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Personal data fields need autocomplete tokens (1.3.5).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.INPUT_PURPOSE` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.INPUT_PURPOSE` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><label>Email <input type="email" name="user_email" placeholder="you@example.com"></label></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><label>Email <input type="email" name="user_email" autocomplete="email"></label></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.INPUT_PURPOSE` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

