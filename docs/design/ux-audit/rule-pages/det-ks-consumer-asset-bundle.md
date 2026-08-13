---
rule_id: DET.KS.CONSUMER_ASSET_BUNDLE
lane: deterministic
title: Consumer asset bundles
summary: KS consumer pages load required theme and react-primitive CSS; Vite asset links resolve in live crawl.
page_version: 61b5d5dbd1f44aa5873f398ed7edab35677b364e67daa1650af11466ce3354a6
generated_at: 2026-05-28T20:30:00.000Z
agent_model: composer-2.5-fast
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ks-consumer-asset-bundle
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
---

## Purpose

Pages that mount KS markers or react-primitive roots must ship **forge-theme** / **docs-theme** CSS and **forge-react-primitives** (or a Vite bundle that includes them). Live mode verifies linked URLs return HTTP below 400. **Scope:** KS-only (`skipped_scope` on generic sites). Static HTML scan checks `<link>` hints only.

## Passing signals

- `<link href="...forge-theme...">` and `...forge-react-primitives...` present when primitives mount.
- No broken module/stylesheet URLs in live crawl.

## Failing signals

- **missingPattern forge-react-primitives-stylesheet** — primitives mount without primitive CSS.
- **Asset 404** — Vite `assets/*.js` or CSS href fails fetch.

## Before example

```html
<link rel="stylesheet" href="/css/bootstrap.min.css">
<div data-ks-react-root="true" data-ks-hash="Fsb" data-ks-type="react-primitive"></div>
```

## After example

```html
<link rel="stylesheet" href="/css/forge-theme.css">
<link rel="stylesheet" href="/css/forge-react-primitives.css">
<div data-ks-react-root="true" data-ks-hash="Fsb" class="ks-fe-banner"></div>
```

## Deterministic checks

- `DET.KS.CONSUMER_ASSET_BUNDLE` — `det-ks-consumer-asset-bundle.check.js`.

## Remediation

Wire consumer `index.html` or Vite entry to import KS theme + primitive styles before hydrating react roots.
