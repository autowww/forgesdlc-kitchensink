---
rule_id: DET.A11Y.KS.HASH_MARKERS
lane: deterministic
scope: ks
title: KS hash markers
summary: hash and data-ks-hash must agree on visual roots.
page_version: 46ebe041679ba66019e51869b1fdba1cf72b2f80b03925484c67097129944c75
generated_at: 2026-05-28T04:23:01.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-hash-markers
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

hash and data-ks-hash must agree on visual roots.

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.KS.HASH_MARKERS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.KS.HASH_MARKERS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><section class="forge-card p-3" hash="Abx" data-ks-hash="Xyz"><p class="mb-0">Mismatched governed markers.</p></section></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><section class="forge-card p-3" hash="Abx" data-ks-hash="Abx" data-ks-type="card" data-ks-name="demo-card"><p class="mb-0">Matching three-letter hash pair.</p></section></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.KS.HASH_MARKERS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **4.1.2** — [`wcag/2.2/sc/4.1.2-name-role-value.md`](../wcag/2.2/sc/4.1.2-name-role-value.md)

