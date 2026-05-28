---
rule_id: DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC
lane: deterministic
scope: generic
title: Reading Level Heuristic
summary: Deterministic accessibility check (generic scope).
page_version: 3bda15a55735e88d878914bc224207c80ce300fc3bd8e6ae4ca2d0d71bc7ef1e
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-reading-level-heuristic
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC` expects ≥1 finding on the Before fixture.

## Before example

```html
<h1>Article</h1>
  <p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
  <p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
```

## After example

```html
<h1>Article</h1>
  <p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
<p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
  <p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
<p>term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term term</p>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.READING_LEVEL_HEURISTIC` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

