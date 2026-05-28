---
rule_id: DET.A11Y.GENERIC.ORIENTATION
lane: deterministic
scope: generic
title: Orientation
summary: Do not lock viewport or CSS to one orientation (1.3.4).
page_version: 8c300aa7ba71012aed754a798ccae60595d586718888112d2c774e4653267503
generated_at: 2026-05-28T04:01:52.000Z
registry_fingerprint: 4d1679dc5f5a9212ebb2ca5072adbfd2683b2f93bfe6853ec5db7da590e25b0e
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

