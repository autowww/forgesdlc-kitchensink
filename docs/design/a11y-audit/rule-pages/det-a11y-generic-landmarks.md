---
rule_id: DET.A11Y.GENERIC.LANDMARKS
lane: deterministic
scope: generic
title: Landmarks
summary: One main landmark and nav when chrome links exist.
page_version: 55fa55cce449bfc0b59fd29f556d9e0d18b039da258dd04bb2611701c6f8b7e3
generated_at: 2026-05-26T08:51:23.000Z
registry_fingerprint: e11a2939d018a45bae7d6e23364aba2ae4e13f190d942f49891c89ea84c44c46
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-landmarks
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

One main landmark and nav when chrome links exist.

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.LANDMARKS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.LANDMARKS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><p>Content without a main landmark wrapper.</p><nav class="mt-2"><a href="/">Home</a> · <a href="/docs">Docs</a></nav></div>
```

## After example

```html
<header class="site-header p-2 mb-2"><span class="forge-support">Site header</span></header><nav aria-label="Primary"><a href="/">Home</a> · <a href="/docs">Docs</a></nav><main id="main" class="p-3"><h1 class="h4">Primary content</h1></main><footer class="p-2 mt-2"><span class="forge-support">Footer</span></footer>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.LANDMARKS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

