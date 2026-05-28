---
rule_id: DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT
lane: deterministic
scope: generic
title: Hover Focus Content
summary: Deterministic accessibility check (generic scope).
page_version: f965786c16dc705318df4317098fad555fae58800e027fd4daa9ae923e7c618d
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-hover-focus-content
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Hover Focus Content</h2><p class="forge-support mb-2">Keyboard or focus behavior blocks operation.</p><p class="mb-0 small">Rule: <code>DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT</code> · scope: generic</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Hover Focus Content (remediated)</h2><p class="mb-2">All functionality available via keyboard with visible focus.</p><p class="mb-0 small text-muted">Deterministic accessibility check (generic scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.HOVER_FOCUS_CONTENT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.4.13** — [`wcag/2.2/sc/1.4.13-content-on-hover-or-focus.md`](../wcag/2.2/sc/1.4.13-content-on-hover-or-focus.md)

