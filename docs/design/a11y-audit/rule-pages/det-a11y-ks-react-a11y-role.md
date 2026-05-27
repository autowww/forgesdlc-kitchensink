---
rule_id: DET.A11Y.KS.REACT_A11Y_ROLE
lane: deterministic
scope: ks
title: React A11Y Role
summary: Deterministic accessibility check (ks scope).
page_version: 12d277513ddd47bcd5d56388d2b97acc85845382a7ff036038a4fa2107964811
generated_at: 2026-05-27T18:38:01.000Z
registry_fingerprint: 755460e3459075c98681623f9de9afefbe974f1c88c68d9c6bfd534026cc6bf8
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-react-a11y-role
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (ks scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.KS.REACT_A11Y_ROLE` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.KS.REACT_A11Y_ROLE` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.KS.REACT_A11Y_ROLE</code> (ks).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.KS.REACT_A11Y_ROLE</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.KS.REACT_A11Y_ROLE` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

