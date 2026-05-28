---
rule_id: DET.A11Y.GENERIC.LABEL_IN_NAME
lane: deterministic
scope: generic
title: Label in name
summary: Accessible name should include visible label (2.5.3).
page_version: cc25aa0311e1ef6d8a5ff1660ed5297a04f1410aaf5293127e2bd2c7997936a9
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-label-in-name
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Accessible name should include visible label (2.5.3).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.LABEL_IN_NAME` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.LABEL_IN_NAME` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><button aria-label="Submit form">Send</button></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><button aria-label="Send invoice">Send</button></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.LABEL_IN_NAME` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **2.5.3** — [`wcag/2.2/sc/2.5.3-label-in-name.md`](../wcag/2.2/sc/2.5.3-label-in-name.md)

