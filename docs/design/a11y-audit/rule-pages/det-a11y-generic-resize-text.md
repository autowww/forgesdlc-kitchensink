---
rule_id: DET.A11Y.GENERIC.RESIZE_TEXT
lane: deterministic
scope: generic
title: Resize text
summary: Viewport must allow zoom; avoid clipping enlarged text (1.4.4).
page_version: ea9e31185b8ff976b15a38519ce10b19482b8a2d59cec58d7bc03b9fd6c0139d
generated_at: 2026-05-28T04:23:01.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-resize-text
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Viewport must allow zoom; avoid clipping enlarged text (1.4.4).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.RESIZE_TEXT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.RESIZE_TEXT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><p class="mb-0" style="font-size:8px">Tiny text may fail when zoomed.</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><p class="mb-0" style="font-size:1rem">Readable base size using rem.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.RESIZE_TEXT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.4.4** — [`wcag/2.2/sc/1.4.4-resize-text.md`](../wcag/2.2/sc/1.4.4-resize-text.md)

