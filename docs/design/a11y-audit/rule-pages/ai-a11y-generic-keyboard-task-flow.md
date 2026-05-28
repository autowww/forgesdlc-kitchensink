---
rule_id: AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW
lane: ai
scope: generic
title: Keyboard Task Flow
summary: AI judgment overlay (generic scope).
page_version: f5bc62c731158cd94da5cd07e5ea06aba755d77f875f4aa3edd0a5002c0e91a8
generated_at: 2026-05-28T04:23:01.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-generic-keyboard-task-flow
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.GENERIC.KEYBOARD_TASK_FLOW` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **2.1.1** — [`wcag/2.2/sc/2.1.1-keyboard.md`](../wcag/2.2/sc/2.1.1-keyboard.md)
- WCAG **2.1.2** — [`wcag/2.2/sc/2.1.2-no-keyboard-trap.md`](../wcag/2.2/sc/2.1.2-no-keyboard-trap.md)
- WCAG **2.4.3** — [`wcag/2.2/sc/2.4.3-focus-order.md`](../wcag/2.2/sc/2.4.3-focus-order.md)
- WCAG **2.4.7** — [`wcag/2.2/sc/2.4.7-focus-visible.md`](../wcag/2.2/sc/2.4.7-focus-visible.md)

