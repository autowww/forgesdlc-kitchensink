---
rule_id: DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE
lane: deterministic
scope: generic
title: Focus context change
summary: Avoid navigation or submit on focus (3.2.1).
page_version: 5fb3f6b9a30f87073225fced6e87724c66cd78b5bc40185ee94f53b101ab7edc
generated_at: 2026-05-28T03:48:11.000Z
registry_fingerprint: 0021c088bf3664f96bb6c318bf46b537f04b476e6c6b1d511b371f23ade016ac
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-focus-context-change
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Avoid navigation or submit on focus (3.2.1).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><input autofocus onfocus="location.href='/'" aria-label="Jump on focus"></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><button type="button">Explicit control — no focus handler</button></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.FOCUS_CONTEXT_CHANGE` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

