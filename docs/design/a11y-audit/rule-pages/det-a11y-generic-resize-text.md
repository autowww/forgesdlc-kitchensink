---
rule_id: DET.A11Y.GENERIC.RESIZE_TEXT
lane: deterministic
scope: generic
title: Resize text
summary: Viewport must allow zoom; avoid clipping enlarged text (1.4.4).
page_version: a418aac64017eb6bd5069932133c26d59c8858c06d7cb956bd6a89662ea13bc3
generated_at: 2026-05-27T18:38:01.000Z
registry_fingerprint: 755460e3459075c98681623f9de9afefbe974f1c88c68d9c6bfd534026cc6bf8
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

