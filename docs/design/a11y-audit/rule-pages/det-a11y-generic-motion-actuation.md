---
rule_id: DET.A11Y.GENERIC.MOTION_ACTUATION
lane: deterministic
scope: generic
title: Motion Actuation
summary: Deterministic accessibility check (generic scope).
page_version: 37760b05e39a77a3c40e24c88699a65676ccd01a3574dbca71e5b6b039d3b2ac
generated_at: 2026-05-27T18:51:09.000Z
registry_fingerprint: e6ee2008237b1ef01ad3fc4119b64e3eff0194d1a45c35f10fc2b63d373bc3fd
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-motion-actuation
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.MOTION_ACTUATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.MOTION_ACTUATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.GENERIC.MOTION_ACTUATION</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.GENERIC.MOTION_ACTUATION</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.MOTION_ACTUATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

