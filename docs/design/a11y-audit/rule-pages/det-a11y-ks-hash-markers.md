---
rule_id: DET.A11Y.KS.HASH_MARKERS
lane: deterministic
scope: ks
title: KS hash markers
summary: hash and data-ks-hash must agree on visual roots.
page_version: d00c8b56cf3d2d3489df3c58a997ba4362258683394271c8d661606972b8c976
generated_at: 2026-05-28T04:01:52.000Z
registry_fingerprint: 4d1679dc5f5a9212ebb2ca5072adbfd2683b2f93bfe6853ec5db7da590e25b0e
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

