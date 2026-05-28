---
rule_id: DET.A11Y.GENERIC.POINTER_GESTURES
lane: deterministic
scope: generic
title: Pointer gestures
summary: Provide single-pointer alternative to path gestures (2.5.1).
page_version: da432c951ac3370557040afa9c6456a7374280d9a7e7678c5f5752af4a2d2faa
generated_at: 2026-05-28T03:48:11.000Z
registry_fingerprint: 0021c088bf3664f96bb6c318bf46b537f04b476e6c6b1d511b371f23ade016ac
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-pointer-gestures
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Provide single-pointer alternative to path gestures (2.5.1).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.POINTER_GESTURES` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.POINTER_GESTURES` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><div ontouchstart="void 0">Swipe-only zone</div></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><button type="button" onclick="void 0">Tap or click</button></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.POINTER_GESTURES` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

