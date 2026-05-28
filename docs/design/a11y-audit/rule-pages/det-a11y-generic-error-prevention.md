---
rule_id: DET.A11Y.GENERIC.ERROR_PREVENTION
lane: deterministic
scope: generic
title: Error Prevention
summary: Deterministic accessibility check (generic scope).
page_version: c11e75ee0785a026394759e18801722697d239b0268b0bb721ccc7bdc9765ea4
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-error-prevention
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.ERROR_PREVENTION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.ERROR_PREVENTION` expects ≥1 finding on the Before fixture.

## Before example

```html
<form id="checkout">
    <h1>Checkout</h1>
    <p>Enter payment card details to complete your purchase.</p>
    <label>Card <input name="card" type="text" /></label>
    <button type="submit">Purchase</button>
  </form>
```

## After example

```html
<form id="checkout">
    <h1>Checkout</h1>
    <p>Enter payment card details to complete your purchase.</p>
    <label>Card <input name="card" type="text" /></label>
    <button type="submit">Purchase</button>
  <p class="a11y-confirm-step"><label><input type="checkbox" name="user_confirm" id="user_confirm" required /> I confirm this submission</label></p></form>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.ERROR_PREVENTION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **3.3.4** — [`wcag/2.2/sc/3.3.4-error-prevention-legal-financial-data.md`](../wcag/2.2/sc/3.3.4-error-prevention-legal-financial-data.md)

