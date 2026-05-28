---
rule_id: DET.A11Y.GENERIC.RE_AUTHENTICATION
lane: deterministic
scope: generic
title: Re Authentication
summary: Deterministic accessibility check (generic scope).
page_version: a891819a704f0a235ba6142f40130898f8aeaae3d45e9a56fe806e22a0b1c470
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-re-authentication
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.RE_AUTHENTICATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.RE_AUTHENTICATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<form id="reauth">
    <h1>Session expired</h1>
    <p>Your session expired. Please log in again to continue.</p>
    <label>Password <input type="password" name="password" /></label>
    <button type="submit">Sign in again</button>
  </form>
```

## After example

```html
<form id="reauth">
    <h1>continue your session</h1>
    <p>Your continue your session. Please continue your session to continue.</p>
    <label>Password <input type="password" name="password" /></label>
    <button type="submit">continue your session</button>
  <p class="a11y-session-preserve" data-session-preserve="true">Your entries are preserved for 20 hours after you sign back in.</p></form>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.RE_AUTHENTICATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

