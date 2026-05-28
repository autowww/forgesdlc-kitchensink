---
rule_id: DET.A11Y.KS.PY_HASH_ATTRS
lane: deterministic
scope: ks
title: Py Hash Attrs
summary: Deterministic accessibility check (ks scope).
page_version: 7abf4e51ad1c979a435b9793e00416d87f01486e1485d969ae18a4d3c4eac4bb
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-py-hash-attrs
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (ks scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.KS.PY_HASH_ATTRS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.KS.PY_HASH_ATTRS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Py Hash Attrs</h2><p class="forge-support mb-2">KS visual hash markers are missing or mismatched.</p><p class="mb-0 small">Rule: <code>DET.A11Y.KS.PY_HASH_ATTRS</code> · scope: ks</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Py Hash Attrs (remediated)</h2><p class="mb-2">hash and data-ks-hash match on governed roots.</p><p class="mb-0 small text-muted">Deterministic accessibility check (ks scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.KS.PY_HASH_ATTRS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **4.1.2** — [`wcag/2.2/sc/4.1.2-name-role-value.md`](../wcag/2.2/sc/4.1.2-name-role-value.md)

