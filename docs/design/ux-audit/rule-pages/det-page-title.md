---
rule_id: DET.PAGE.TITLE
lane: deterministic
title: Document page title
summary: Every page exposes a non-empty, descriptive document title so browser tabs, bookmarks, search snippets, and assistive tech can identify the page without reading the body.
page_version: 13c9253bbc821dc30c1fdbd8b80593dfaf9e7051d4d8e45977e6318dbf4d7cb5
generated_at: 2026-05-25T16:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-title
---

## Purpose

The `<title>` element is the primary **document label** for browser chrome, history, bookmarks, search results, and screen-reader page summaries. A missing or placeholder title forces users to infer context from the URL or first heading — especially painful when many handbook tabs are open.

Kitchen Sink layouts set titles from Python parameters:

- **`handbook_page`** — `<title>{handbook_name} &mdash; {browser_title}</title>` (e.g. `Forge SDLC &mdash; Governed delivery handbook`). The visible `<h1 class="font-display">` uses **`page_title`**, which may differ from **`browser_title`** when the tab label should stay shorter.
- **`chapter_page`** / JS-driven handbook shells — `{handbook_name} — {browser_title}` in `<title>`.
- **`product_page`**, **`landing_page`**, showcase shells — **`doc_title`** or **`browser_title`** tied to the page's primary job.

This deterministic rule runs in the **metrics** phase. The crawler reads **`document.title`** (whitespace-normalized into `metrics.title`). A page **passes** when the title is non-empty and not a known generic placeholder (`index`, `home`, `document`, `page`, case-insensitive). A page **fails** when the title is missing or empty (**major**) or matches a generic placeholder (**minor**).

**Plan:** Define a title pattern per layout (handbook name + chapter, product name + section). **Do:** Pass `browser_title` / `doc_title` into layout calls and verify `<title>` in generated HTML. **Check:** `metrics.title` in crawl JSON is descriptive; `DET.PAGE.TITLE` produces no findings. **Adjust:** Replace scaffold defaults (`Home`, `index`) in generators, SPA shells, and static export stubs.

## Passing signals

- **`<title>`** in `<head>` is **non-empty** after trim — audit `metrics.title` is truthy.
- Title follows a **site-specific pattern**: handbook pages use `{handbook_name} — {browser_title}`; product pages use the visible primary topic, not a filename stem.
- **`handbook_page`** output matches `{handbook_name} &mdash; {browser_title}` from `components/layouts.py`.
- Title **aligns with the primary `<h1>`** or breadcrumb leaf — users see the same words in the tab and on the page where practical.
- Generic placeholders are **avoided**: not `Home`, `Index`, `Document`, or `Page` alone (see `GENERIC_TITLES` in `title.check.js`).
- Audit produces **no** `DET.PAGE.TITLE` findings.

## Failing signals

- **Missing or empty title:** no `<title>` element, `<title></title>`, or whitespace-only content — **major** finding: *"Page title is missing."*
- **Generic placeholder:** `<title>Home</title>`, `<title>index</title>`, `<title>Document</title>`, or `<title>Page</title>` — **minor** finding: *"Page title is too generic."*
- **Scaffold drift:** generator leaves Vite/React default `index` or a bare directory name while body copy and `<h1>` are fully authored.
- **Title/body mismatch:** tab reads `Home` but `<h1 class="font-display">` shows a specific chapter — hurts wayfinding and SEO snippets.
- **Wrong source:** title copied from a layout partial but post-processing strips `<head>` during static export.
- Auditor evidence includes `Title: "Home"` or `<title> is empty or absent.`

## Before example

Failing KS markup: handbook-style shell mirrors `handbook_page` anatomy (`forge-aurora`, `forge-sidebar`, `main#main`, `doc-content`, `font-display` heading) but leaves the scaffold placeholder **`Home`** in `<title>` instead of a descriptive handbook + chapter label.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Home</title>
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
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">Body copy is specific, but the browser tab still says Home.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Tabs, bookmarks, and search snippets cannot distinguish this page.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</body>
</html>
```

## After example

Passing KS markup: same handbook shell with a **descriptive `<title>`** as emitted by `handbook_page` when `handbook_name="Forge SDLC"` and `browser_title="Governed delivery handbook"`.

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
            <p class="forge-support mt-2 mb-0" style="font-size:1rem">Tab title matches the handbook name and page topic.</p>
          </header>
          <div class="forge-card p-3">
            <p class="card-label mb-1">Outcome</p>
            <p class="forge-support mb-0">Browser chrome and assistive tech announce a specific document label.</p>
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
| `metrics.title` empty in crawl JSON | `<title>` missing or blank | Add `<title>` in layout `<head>`; pass `browser_title` / `doc_title` into `handbook_page`, `chapter_page`, or `product_page` |
| Finding: *Page title is missing* | `title.check.js` major failure | Ensure generator emits `<title>` before ship; fix SPA shells that render body without updating `document.title` |
| Finding: *Page title is too generic* with `Title: "Home"` | Placeholder in `{index, home, document, page}` set | Replace scaffold default with `{handbook_name} — {browser_title}` or product-specific label |
| Raw HTML `<title>Home</title>` on authored pages | Layout default not overridden | Set `browser_title` in content map / generator call; rebuild `website/` |

**Kitchen Sink:** Pass meaningful `browser_title` and `handbook_name` into `handbook_page(...)`. Confirm `generator/build-showcase.py` and consumer builds emit `<title>` in the first `<head>` block. Match the visible `<h1 class="font-display">` topic (`page_title`) where practical.

**Consumer sites:** After layout fixes, run `python3 generator/build-site.py` (or handbook build), then re-audit. Spot-check: `curl -s … | grep -i '<title>'` should show a descriptive string, not `Home` or `index`.

**Harness:** `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.TITLE` for regression. Implementation: `tools/website-ux-auditor/design-rules/deterministic/page/title.check.js`. Deterministic fixer adapter: `page_title` in `lib/ux-deterministic-fixers/`.

## Related rules

- **DET.PAGE.LANG** — root `<html lang>` declaration (same metadata accessibility bundle).
- **DET.PAGE.VIEWPORT** — responsive viewport meta for web pages.
- **DET.LANDMARKS.REQUIRED** — semantic `main`, `nav`, `header`, `footer` landmarks on the same handbook shells.
- **DET.PAGE.MODE** — single primary page mode above the fold; title should reflect that mode (handbook vs marketing vs product detail).
