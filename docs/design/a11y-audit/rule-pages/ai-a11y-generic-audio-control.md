---
rule_id: AI.A11Y.GENERIC.AUDIO_CONTROL
lane: ai
scope: generic
title: Audio Control
summary: AI judgment overlay (generic scope).
page_version: 5edcd9b1edb57d32d325ef2d0cb611862f887cd2e6f8dede7c5c6b12ce3d8919
generated_at: 2026-05-28T04:08:36.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-generic-audio-control
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.GENERIC.AUDIO_CONTROL` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.GENERIC.AUDIO_CONTROL` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>AI.A11Y.GENERIC.AUDIO_CONTROL</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>AI.A11Y.GENERIC.AUDIO_CONTROL</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.GENERIC.AUDIO_CONTROL` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

