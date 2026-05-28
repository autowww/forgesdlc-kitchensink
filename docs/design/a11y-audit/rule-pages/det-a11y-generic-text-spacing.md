---
rule_id: DET.A11Y.GENERIC.TEXT_SPACING
lane: deterministic
scope: generic
title: Text spacing
summary: Avoid clipping when spacing increases (1.4.12).
page_version: 7c121f1c086e99604f46b577a89385e1c771c728cc7636b2fe5aadf927bcc54b
generated_at: 2026-05-28T04:08:36.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-text-spacing
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Avoid clipping when spacing increases (1.4.12).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.TEXT_SPACING` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.TEXT_SPACING` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><p style="line-height:12px!important;overflow:hidden;height:2em">Clipped paragraph text.</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><p style="line-height:1.5">Paragraph allows extra spacing.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.TEXT_SPACING` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

