---
rule_id: AI.A11Y.GENERIC.VISUAL_PRESENTATION
lane: ai
scope: generic
title: Visual Presentation
summary: AI judgment overlay (generic scope).
page_version: f48a8bd380b250514ec13d0791a4d90ed5edbca8d329ca822bf1e68b9f5bd626
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-generic-visual-presentation
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.GENERIC.VISUAL_PRESENTATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.GENERIC.VISUAL_PRESENTATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Visual Presentation</h2><p class="forge-support mb-2">Content or UX likely fails human judgment for this AI overlay rule.</p><p class="mb-0 small">Rule: <code>AI.A11Y.GENERIC.VISUAL_PRESENTATION</code> · scope: generic</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Visual Presentation (remediated)</h2><p class="mb-2">Signals satisfy the AI rule prompt expectations on review.</p><p class="mb-0 small text-muted">AI judgment overlay (generic scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.GENERIC.VISUAL_PRESENTATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

