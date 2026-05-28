---
rule_id: DET.A11Y.GENERIC.DATA_TABLE_HEADERS
lane: deterministic
scope: generic
title: Data Table Headers
summary: Deterministic accessibility check (generic scope).
page_version: 4d0abfe3fc0b8d656074a353d42ba37d144cd1ab04f79aa598a89f3ef055a53f
generated_at: 2026-05-28T04:23:01.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-data-table-headers
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.DATA_TABLE_HEADERS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.DATA_TABLE_HEADERS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.GENERIC.DATA_TABLE_HEADERS</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.GENERIC.DATA_TABLE_HEADERS</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.DATA_TABLE_HEADERS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.3.1** — [`wcag/2.2/sc/1.3.1-info-and-relationships.md`](../wcag/2.2/sc/1.3.1-info-and-relationships.md)

