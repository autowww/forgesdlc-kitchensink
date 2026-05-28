---
rule_id: DET.A11Y.GENERIC.CONCURRENT_INPUT
lane: deterministic
scope: generic
title: Concurrent input
summary: Do not block keyboard or pointer when not essential (2.5.6).
page_version: e4d0fdb706092dbd05a9ceedef8dc21b9ce2478ead28cba4c36eb0d43d93d9f4
generated_at: 2026-05-28T03:48:11.000Z
registry_fingerprint: 0021c088bf3664f96bb6c318bf46b537f04b476e6c6b1d511b371f23ade016ac
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-concurrent-input
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Do not block keyboard or pointer when not essential (2.5.6).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.CONCURRENT_INPUT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.CONCURRENT_INPUT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><canvas data-touch-only></canvas></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><button type="button">Works with keyboard and pointer</button></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.CONCURRENT_INPUT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

