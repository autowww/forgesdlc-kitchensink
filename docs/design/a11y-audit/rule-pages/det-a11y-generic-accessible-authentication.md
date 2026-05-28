---
rule_id: DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION
lane: deterministic
scope: generic
title: Accessible Authentication
summary: Deterministic accessibility check (generic scope).
page_version: 083cce5ccdba8ea3f398ea6638a8d0cf66d9afcd71409de3bca009ea3734ab43
generated_at: 2026-05-28T05:09:12.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-accessible-authentication
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION` expects ≥1 finding on the Before fixture.

## Before example

```html
<form id="signin">
    <h1>Sign in</h1>
    <p>Log in with your password to access your account.</p>
    <label>Username <input type="email" autocomplete="username" /></label>
    <label>Password <input type="password" autocomplete="current-password" /></label>
    <button type="submit">Sign in</button>
  </form>
```

## After example

```html
<form id="signin">
    <h1>Sign in</h1>
    <p>Log in with your password to access your account.</p>
    <label>Username <input type="email" autocomplete="username" /></label>
    <label>Password <input type="password" autocomplete="current-password" /></label>
    <button type="submit">Sign in</button>
  <p class="a11y-auth-otp">Paste-friendly sign-in: use a one-time code from email.</p><input type="text" name="otp" autocomplete="one-time-code" inputmode="numeric" aria-label="One-time code" /></form>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.ACCESSIBLE_AUTHENTICATION` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **3.3.8** — [`wcag/2.2/sc/3.3.8-accessible-authentication-minimum.md`](../wcag/2.2/sc/3.3.8-accessible-authentication-minimum.md)

