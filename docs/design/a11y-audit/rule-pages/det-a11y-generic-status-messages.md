---
rule_id: DET.A11Y.GENERIC.STATUS_MESSAGES
lane: deterministic
scope: generic
title: Status messages
summary: Dynamic status needs role or aria-live (4.1.3).
page_version: e75bb3406f89bbc5a1c70254cbd8cf465a73d60fdbb181f50ae96187a9c1fdaa
generated_at: 2026-05-27T18:38:01.000Z
registry_fingerprint: 755460e3459075c98681623f9de9afefbe974f1c88c68d9c6bfd534026cc6bf8
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-status-messages
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Dynamic status needs role or aria-live (4.1.3).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.STATUS_MESSAGES` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.STATUS_MESSAGES` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3"><div class="alert alert-success">Saved — no live region.</div></div>
```

## After example

```html
<div data-ks-embed-main class="p-3"><div role="status" aria-live="polite">Saved successfully.</div></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.STATUS_MESSAGES` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

