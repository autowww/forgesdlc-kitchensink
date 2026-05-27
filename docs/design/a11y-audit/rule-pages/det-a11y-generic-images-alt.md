---
rule_id: DET.A11Y.GENERIC.IMAGES_ALT
lane: deterministic
scope: generic
title: Image alt text
summary: Informative images need meaningful alt.
page_version: 2c42060327707ca69218f5a99ced113441643783e2092a0680408e23fd17c3ec
generated_at: 2026-05-27T18:51:09.000Z
registry_fingerprint: e6ee2008237b1ef01ad3fc4119b64e3eff0194d1a45c35f10fc2b63d373bc3fd
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-images-alt
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Informative images need meaningful alt.

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.IMAGES_ALT` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.IMAGES_ALT` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="120" height="80" alt=""><p class="forge-support mt-2 mb-0">Decorative-only alt missing on informative graphic.</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="120" height="80" alt="Architecture diagram: three-tier flow"><p class="forge-support mt-2 mb-0">Alt describes the diagram purpose.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.IMAGES_ALT` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

