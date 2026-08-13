---
rule_id: DET.STUDIO.TESTID
lane: deterministic
title: Studio test anchors
summary: Pages expose data-testid hooks for Playwright PDCA gates and stable automation.
page_version: f0ba01f2d6bd68aea7bdabe3510b7b0ac6fc6ccb4142e16cfa07ac6063128612
generated_at: 2026-08-13T00:00:00.000Z
registry_status: documented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-studio-testid
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
---

## Purpose

Studio UX PDCA runs Playwright specs per manifest (`playwright_test_glob`). Pages should expose **`data-testid`** on header, tabs, primary table, and primary CTA so gates do not flake on text-only selectors.

Minor severity—does not block IA remounts but should be fixed before campaign close.

## Passing signals

- `data-testid` on page header, tablist, or primary workspace region.
- Manifest spec files reference the same ids.

## Failing signals

- Zero `data-testid` on a page with `playwright_test_glob` configured.

## Before example

```html
<header class="fc-page-header"><h1>Ingest</h1></header>
```

## After example

```html
<header class="fc-page-header" data-testid="ingest-header">
  <h1>Ingest</h1>
</header>
<div data-testid="ingest-job-table"><!-- rows --></div>
```

## Evidence and remediation

- `page.json.testid_count` from `capture-page.mjs`.

## Related rules

- `DET.APP.ROUTE_DEEPLINK_STATE`
