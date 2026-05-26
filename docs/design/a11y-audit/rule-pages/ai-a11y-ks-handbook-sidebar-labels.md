---
rule_id: AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS
lane: ai
scope: ks
title: Handbook Sidebar Labels
summary: AI judgment overlay (ks scope).
page_version: 442bc2e72ad1227e949746587b797ed3df48b4deb4a3410cfda4f8149e33042d
generated_at: 2026-05-26T08:51:23.000Z
registry_fingerprint: e11a2939d018a45bae7d6e23364aba2ae4e13f190d942f49891c89ea84c44c46
registry_status: implemented
source_rule: docs/design/a11y-audit/ai-enabled-a11y-principles.md#ai-a11y-ks-handbook-sidebar-labels
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

AI judgment overlay (ks scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS</code> (ks).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids AI.A11Y.KS.HANDBOOK_SIDEBAR_LABELS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

