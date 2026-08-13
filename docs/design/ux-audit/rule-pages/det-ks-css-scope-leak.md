---
rule_id: DET.KS.CSS_SCOPE_LEAK
lane: deterministic
title: KS CSS scope leak
summary: KS theme CSS does not apply destructive global styles to host-app controls outside governed roots.
page_version: e4b56b752fa0caf3b753838ea80c081006afb92c8bc77ab3161a09e54dedf493
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-css-scope-leak
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Embedded KS themes must not restyle native host `<input>`, `<select>`, or `<textarea>` elements outside KS roots (studio shells, Vite apps). **Live crawl** is authoritative; static-only audits skip DOM probes and record `skipped_scope` when no Playwright page is available.

## Passing signals

- Host controls outside `[data-ks-hash]` keep native or app-specific computed styles.

## Failing signals

- **host-control-themed-bg** — dark Forge background on a host input outside KS chrome.
- **host-control-faded** — opacity collapse on host controls.

## Before example

```html
<input type="text" id="host-search" aria-label="Search">
<div data-ks-hash="Fsb" class="ks-fe-banner">KS panel</div>
```

## After example

```html
<div data-ks-app-shell>
  <input type="text" class="ks-host-preserve" aria-label="Search">
  <div data-ks-hash="Fsb" class="ks-fe-banner">KS panel</div>
</div>
```

## Deterministic checks

- `DET.KS.CSS_SCOPE_LEAK` — `det-ks-css-scope-leak.check.js` (live `page.evaluate` only).

## Remediation

Import KS CSS under a mount root, use `@layer`, or ship a scoped build for consumer embeds.
