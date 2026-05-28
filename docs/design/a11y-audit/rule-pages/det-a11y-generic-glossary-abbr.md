---
rule_id: DET.A11Y.GENERIC.GLOSSARY_ABBR
lane: deterministic
scope: generic
title: Glossary Abbr
summary: Deterministic accessibility check (generic scope).
page_version: 20fad2a0bc0ea3bd403259739fb755beb5b75fb3b6ddf927e381b0233a56351c
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-glossary-abbr
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.GLOSSARY_ABBR` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.GLOSSARY_ABBR` expects ≥1 finding on the Before fixture.

## Before example

```html
<h1>Glossary</h1>
  <p>The <abbr>API</abbr> and <abbr>WCAG</abbr> terms appear without definitions.</p>
```

## After example

```html
<h1>Glossary</h1>
  <p>The <abbr title="API">API</abbr> and <abbr title="WCAG">WCAG</abbr> terms appear without definitions.</p>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.GLOSSARY_ABBR` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

