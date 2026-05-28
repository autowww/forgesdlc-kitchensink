---
rule_id: DET.A11Y.GENERIC.REDUNDANT_ENTRY
lane: deterministic
scope: generic
title: Redundant Entry
summary: Deterministic accessibility check (generic scope).
page_version: e25486dee709d20fdd6ae7d1eec9a6af086b4fdc5f4e1cb22f3877e6d6e8dc31
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-redundant-entry
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.REDUNDANT_ENTRY` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.REDUNDANT_ENTRY` expects ≥1 finding on the Before fixture.

## Before example

```html
<form>
    <label>Email <input type="email" name="email" /></label>
    <label>Confirm email <input type="email" name="email" /></label>
    <button type="submit">Next</button>
  </form>
```

## After example

```html
<form>
    <label>Email <input type="email" name="email" / autocomplete="on"></label>
    <label>Confirm email <input type="email" name="email-2" / autocomplete="on"></label>
    <button type="submit">Next</button>
  </form>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.REDUNDANT_ENTRY` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **3.3.7** — [`wcag/2.2/sc/3.3.7-redundant-entry.md`](../wcag/2.2/sc/3.3.7-redundant-entry.md)

