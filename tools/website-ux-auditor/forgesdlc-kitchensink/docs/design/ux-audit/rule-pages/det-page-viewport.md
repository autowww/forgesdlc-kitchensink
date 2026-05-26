---
rule_id: DET.PAGE.VIEWPORT
lane: deterministic
title: Responsive viewport meta
summary: Every web page declares a viewport meta tag so mobile browsers scale layout to device width instead of rendering a desktop-width column with pinch-zoom only.
page_version: e7575c6d91dfcdd8b116c46bf9d0e72834a96f8ba28aef18b49964474c7f0736
generated_at: 2026-05-25T17:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-viewport
related_rules:
  - DET.PAGE.LANG
  - DET.PAGE.TITLE
  - DET.LANDMARKS.REQUIRED
  - DET.PAGE.MODE
---

## Purpose

Without a **viewport meta tag**, mobile browsers assume a ~980px layout width. Kitchen Sink responsive grids (`container-fluid`, `col-lg-*`, `d-lg-flex`, `clamp()` headings) collapse incorrectly: sidebars stay desktop-sized, text rivers shrink to a narrow column, and users must pinch-zoom to read body copy.

Kitchen Sink layouts emit the standard tag in every full document shell:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

`handbook_page`, `chapter_page`, `product_page`, `landing_page`, and showcase shells in `components/layouts.py` include this line in `<head>` alongside charset, title, and theme CSS.

This deterministic rule runs in the **metrics** phase. The crawler reads `document.querySelector('meta[name="viewport"]')?.getAttribute('content')` into `metrics.metaViewport`. A page **passes** when that value is present and non-empty after trim. A page **fails** when the tag is missing or `content=""`.

**Plan:** Treat viewport meta as part of the document shell contract for every consumer HTML page. **Do:** Keep the KS `<head>` block intact in generators and static export. **Check:** `metrics.metaViewport` is truthy in crawl JSON. **Adjust:** Add the meta tag to minimal stubs, legacy templates, or SPA shells that ship HTML without a responsive viewport.

## Passing signals

- **`<meta name="viewport" content="width=device-width, initial-scale=1">`** appears in `<head>` on every full web document.
- **`handbook_page`** and sibling layouts in `layouts.py` emit the tag immediately after charset / color-scheme init.
- Audit metrics report **`metaViewport: "width=device-width, initial-scale=1"`** (or another non-empty value); `DET.PAGE.VIEWPORT` produces no findings.
- Mobile layout behaves as authored: `forge-sidebar` hides at `d-lg-flex`, `doc-content` uses readable width, Bootstrap breakpoints apply.
- Viewport meta sits in **`<head>`**, not duplicated or relocated to `<body>`.

## Failing signals

- **Missing tag:** `<head>` has charset and `<title>` but no `<meta name="viewport">` — common in minimal HTML stubs or copied desktop-only templates.
- **Empty content:** `<meta name="viewport" content="">` — treated as absent; `metrics.metaViewport` is falsy.
- **Wrong attribute:** `property="viewport"` or a typo in `name` — the check queries `meta[name="viewport"]` only.
- **Generator drift:** Python layout includes the tag but post-processing or a consumer partial strips `<head>` during static export.
- **SPA shell gap:** Client-rendered app serves a bare `index.html` without viewport meta before hydration.
- Auditor evidence: *"Responsive viewport meta tag is missing."* with *`<meta name="viewport"> not found.`*

## Before example

Failing KS markup: handbook-style shell mirrors `handbook_page` anatomy (`forge-aurora`, `forge-sidebar`, `main#main`, `doc-content`, responsive grid classes) but omits viewport meta, so mobile browsers default to a desktop layout width.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Forge SDLC &mdash; Governed delivery handbook</title>
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0">
        <nav class="nav-scroll px-2 py-3" aria-label="Primary navigation">
          <p class="nav-section-label">Handbook</p>
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </nav>
      </aside>
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
        <div class="mx-auto doc-content" style="max-width:56rem">
          <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
            <p class="section-label text-cyan mb-2">Methodology</p>
            <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed human + agent delivery</h1>
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">Responsive CSS is present, but mobile browsers still assume desktop width.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Handbook grids and typography do not reflow correctly on phones.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>
```

## After example

Passing KS markup: same handbook shell with the **viewport meta** emitted by `handbook_page` in `components/layouts.py`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forge SDLC &mdash; Governed delivery handbook</title>
  <link rel="stylesheet" href="assets/forge-theme.css" />
</head>
<body>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>
  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
      <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0">
        <nav class="nav-scroll px-2 py-3" aria-label="Primary navigation">
          <p class="nav-section-label">Handbook</p>
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </nav>
      </aside>
      <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
        <div class="mx-auto doc-content" style="max-width:56rem">
          <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
            <p class="section-label text-cyan mb-2">Methodology</p>
            <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed human + agent delivery</h1>
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">Mobile browsers scale the layout to device width.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Bootstrap breakpoints and KS sidebar hiding work on narrow viewports.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>
```

## Evidence and remediation

| Evidence | Meaning | Remediation |
|----------|---------|-------------|
| `metrics.metaViewport` empty in crawl JSON | Viewport meta missing or blank | Add `<meta name="viewport" content="width=device-width, initial-scale=1">` in layout `<head>` |
| Finding: *Responsive viewport meta tag is missing* | `viewport.check.js` failed | Restore KS `<head>` block in generator; fix export step that strips meta tags |
| Raw HTML lacks `name="viewport"` in first `<head>` | Post-build regression | Patch template partial or SPA `index.html` shell |
| Mobile layout looks desktop-zoomed despite responsive CSS | Runtime symptom of missing viewport | Confirm meta tag in served HTML, not only in source templates |

**Kitchen Sink:** Keep the viewport line in `handbook_page`, `chapter_page`, `product_page`, and `landing_page` return strings. Confirm `generator/build-showcase.py` output includes the tag. Do not remove it when trimming `<head>` for performance.

**Consumer sites:** After layout fixes, run `python3 generator/build-site.py` (or handbook build), then re-audit. Spot-check: `curl -s … | grep -i 'name="viewport"'` should return `width=device-width, initial-scale=1`.

**Harness:** `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.VIEWPORT` for regression. Implementation: `tools/website-ux-auditor/design-rules/deterministic/page/viewport.check.js`.

## Related rules

- **DET.PAGE.LANG** — root `<html lang>` declaration (same metadata accessibility bundle).
- **DET.PAGE.TITLE** — non-empty, descriptive `<title>` for browser chrome and assistive tech.
- **DET.LANDMARKS.REQUIRED** — semantic `main`, `nav`, `header`, `footer` landmarks on the same handbook shells.
- **DET.PAGE.MODE** — single primary page mode above the fold; viewport meta is independent but fixed in the same layout contracts.
