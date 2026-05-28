---
rule_id: AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT
lane: ai
scope: generic
title: Pointer Gestures Judgment
summary: AI judgment overlay (generic scope).
page_version: 691ca6cd01ac81a6b53ddedcc23037756572646d3a0f7a2e535aa742270b1fcc
generated_at: 2026-05-28T04:01:52.000Z
registry_fingerprint: 4d1679dc5f5a9212ebb2ca5072adbfd2683b2f93bfe6853ec5db7da590e25b0e
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-generic-pointer-gestures-judgment
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.GENERIC.POINTER_GESTURES_JUDGMENT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

