---
rule_id: DET.A11Y.GENERIC.ORIENTATION
lane: deterministic
scope: generic
title: Orientation
summary: Do not lock viewport or CSS to one orientation (1.3.4).
page_version: 2803adbb5a2621f834d21bfdd519389287ccb8d04c9d39d52917403d772caf62
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-orientation
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Do not lock viewport or CSS to one orientation (1.3.4).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.ORIENTATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.ORIENTATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><meta name="viewport" content="width=device-width, orientation=landscape"><p class="mb-0">Content forced to landscape.</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><p class="mb-0">Works in portrait and landscape.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.ORIENTATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.3.4** — [`wcag/2.2/sc/1.3.4-orientation.md`](../wcag/2.2/sc/1.3.4-orientation.md)

