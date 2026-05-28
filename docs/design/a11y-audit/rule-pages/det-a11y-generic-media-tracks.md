---
rule_id: DET.A11Y.GENERIC.MEDIA_TRACKS
lane: deterministic
scope: generic
title: Media Tracks
summary: Deterministic accessibility check (generic scope).
page_version: c0473f8439e8292158b91ac2c3bb62c974dad0fa59dadf396f6cbe6b7ae20f65
generated_at: 2026-05-28T04:23:01.000Z
registry_fingerprint: b3797010c3ca988bb0d21d5e85d4efece0b9e83f311c2d4981ebbf402df7a7c2
registry_status: implemented
source_rule: docs/design/a11y-audit/deterministic-a11y-rules.md#det-a11y-generic-media-tracks
related_rules:
  - DET.A11Y.GENERIC.LANG
---

## Purpose

Deterministic accessibility check (generic scope).

## Passing signals

- DOM and/or repo signals satisfy the rule implementation in `tools/website-a11y-auditor`.
- For **axe**-backed WCAG criteria, use `--lanes axe,det` with an appropriate `--standard` preset.

## Failing signals

- Auditor emits a finding with `ruleId` `DET.A11Y.GENERIC.MEDIA_TRACKS` on the crawled URL.
- Harness: `auditor-tests/invoke-a11y-ruleset-harness.sh DET.A11Y.GENERIC.MEDIA_TRACKS` expects ≥1 finding on the Before fixture.

## Before example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="forge-support mb-0">Placeholder failing state for <code>DET.A11Y.GENERIC.MEDIA_TRACKS</code> (generic).</p></div>
```

## After example

```html
<div data-ks-embed-main class="p-3 forge-card"><p class="mb-0">Placeholder passing state for <code>DET.A11Y.GENERIC.MEDIA_TRACKS</code>.</p></div>
```

## Evidence and remediation

1. Reproduce with `analyze-website-a11y.mjs --only-deterministic-rule-ids DET.A11Y.GENERIC.MEDIA_TRACKS` when lane is deterministic.
2. Apply the After markup pattern (or fix generator source for KS rules).
3. Re-run harness or audit until the rule is clean on the target URL.

## Related rules

- See [deterministic-a11y-rules.md](../deterministic-a11y-rules.md)

## Related WCAG

- WCAG **1.2.1** — [`wcag/2.2/sc/1.2.1-audio-only-and-video-only-prerecorded.md`](../wcag/2.2/sc/1.2.1-audio-only-and-video-only-prerecorded.md)
- WCAG **1.2.2** — [`wcag/2.2/sc/1.2.2-captions-prerecorded.md`](../wcag/2.2/sc/1.2.2-captions-prerecorded.md)
- WCAG **1.2.3** — [`wcag/2.2/sc/1.2.3-audio-description-or-media-alternative-prerecorded.md`](../wcag/2.2/sc/1.2.3-audio-description-or-media-alternative-prerecorded.md)
- WCAG **1.2.4** — [`wcag/2.2/sc/1.2.4-captions-live.md`](../wcag/2.2/sc/1.2.4-captions-live.md)
- WCAG **1.2.5** — [`wcag/2.2/sc/1.2.5-audio-description-prerecorded.md`](../wcag/2.2/sc/1.2.5-audio-description-prerecorded.md)

