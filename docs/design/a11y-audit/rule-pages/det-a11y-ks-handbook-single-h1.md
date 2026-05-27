---
rule_id: DET.A11Y.KS.HANDBOOK_SINGLE_H1
lane: deterministic
scope: ks
title: Handbook single H1
summary: One primary h1 inside handbook chapter layout.
page_version: b0f36a3e0e76348d39b6dc240a5b9e6481a3b2d7ae8191698694bd8e5f148f8b
generated_at: 2026-05-27T18:51:09.000Z
registry_fingerprint: e6ee2008237b1ef01ad3fc4119b64e3eff0194d1a45c35f10fc2b63d373bc3fd
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-ks-handbook-single-h1
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

One primary h1 inside handbook chapter layout.

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.KS.HANDBOOK_SINGLE_H1` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.KS.HANDBOOK_SINGLE_H1` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main><section data-ks-name="handbook-chapter"><main id="main" class="p-3"><h1>Chapter title</h1><h1>Duplicate from Markdown</h1><p>Two top-level headings confuse screen readers.</p></main></section></div>
```

## After example

```html
<div data-ks-embed-main><section data-ks-name="handbook-chapter"><main id="main" class="p-3"><h1>Chapter title</h1><h2>Section</h2><p>Body starts at h2 under a single h1.</p></main></section></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.KS.HANDBOOK_SINGLE_H1` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

