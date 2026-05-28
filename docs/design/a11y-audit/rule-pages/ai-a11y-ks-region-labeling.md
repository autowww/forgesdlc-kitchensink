---
rule_id: AI.A11Y.KS.REGION_LABELING
lane: ai
scope: ks
title: Region Labeling
summary: AI judgment overlay (ks scope).
page_version: 9621a04a37c3177743c416db496d7b6718343a62c16ebe07402049b927100789
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-ks-region-labeling
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (ks scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.KS.REGION_LABELING` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.KS.REGION_LABELING` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="fail"><h2 class="h6">Region Labeling</h2><p class="forge-support mb-2">Content or UX likely fails human judgment for this AI overlay rule.</p><p class="mb-0 small">Rule: <code>AI.A11Y.KS.REGION_LABELING</code> · scope: ks</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card" data-a11y-example="pass"><h2 class="h6">Region Labeling (remediated)</h2><p class="mb-2">Signals satisfy the AI rule prompt expectations on review.</p><p class="mb-0 small text-muted">AI judgment overlay (ks scope).</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.KS.REGION_LABELING` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.3.1** — [`wcag/2.2/sc/1.3.1-info-and-relationships.md`](../wcag/2.2/sc/1.3.1-info-and-relationships.md)
- WCAG **4.1.2** — [`wcag/2.2/sc/4.1.2-name-role-value.md`](../wcag/2.2/sc/4.1.2-name-role-value.md)

