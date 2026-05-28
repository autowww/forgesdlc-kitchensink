---
rule_id: DET.A11Y.GENERIC.LANG
lane: deterministic
scope: generic
title: Document language
summary: Root html must declare lang.
page_version: fdad71c75663018efbf6549789bb319b93d1557141b89f9c7dc0a0f2e718cfd2
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-lang
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Root html must declare lang.

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.LANG` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.LANG` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><h1 class="h4">Page without lang</h1><p class="forge-support mb-0">Simulates missing html[lang].</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3" lang="en"><h1 class="h4">Page with lang</h1><p class="forge-support mb-0">Assistive tech can pick en-US voice.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.LANG` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **3.1.1** — [`wcag/2.2/sc/3.1.1-language-of-page.md`](../wcag/2.2/sc/3.1.1-language-of-page.md)

