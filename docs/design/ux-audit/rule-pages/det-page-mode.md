---
rule_id: DET.PAGE.MODE
lane: deterministic
title: Page primary mode
summary: Each page declares one primary mode above the fold (marketing, handbook, listing, product, presentation, app) via KS layout metadata or compatible shell signals—no competing handbook chrome on landing routes.
page_version: dcd1e91b8f8ccccc2a17f9d8430dcf22a57d680124aaf93385ef24e873b1f8ca
generated_at: 2026-05-25T19:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-page-mode
---

## Purpose

Visitors should recognize **one primary job** for the page within the first screen: public marketing (`landing_page`), handbook reading (`handbook_page`), product guide (`product_page`), listing hub, showcase presentation, or app shell. When a route mixes incompatible shells—**`layout-landing`** hero plus a persistent **`forge-sidebar`** doc tree, or marketing copy inside a handbook reader—the page fails information-architecture review before copy edits can help.

Kitchen Sink layouts emit mode through **`layout_shell_attrs`** on the layout root (typically `<body>`): `data-ks-type="layout"`, `data-ks-name="layout-*"`, plus optional **`<meta name="forge-page-mode" content="…">`**. The auditor maps layout slugs to canonical modes (`layout-landing` → marketing, `layout-handbook` → handbook, `layout-listing` → listing, `layout-product` → product, `layout-showcase` / `layout-gallery` / `layout-split` → presentation) and infers competing modes from visible chrome: doc sidebars outside `main`, showcase header bands, app-shell regions, handbook phrase density, and sidebar link counts (≥ 6 links) on marketing routes.

**Plan:** Assign each URL to a mode from `docs/design/forge-enterprise-ai-website-standard.md` (modes 1–4). **Do:** Use **`landing_page`** on `/` with curated **`landing-header`** / **`landing-nav`** only; route depth to `/docs` or handbook layouts. **Check:** `pageModeReport.violations` is empty and `modes` has a single primary token. **Adjust:** Remove handbook sidebars and duplicate nav trees from marketing shells before rewriting hero text.

## Passing signals

- Root `/` uses **`landing_page`**: layout root carries `data-ks-type="layout" data-ks-name="layout-landing"` (hash **`Ldg`**) with **`landing-header`**, **`landing-hero fs-landing-hero-band`**, and **`main.fs-landing-main`**—no visible **`forge-sidebar`**, **`#ks-sidebar-aside`**, or **`fs-sidebar`** outside `main`.
- Handbook routes use **`handbook_page`** / **`chapter_page`**: `data-ks-name="layout-handbook"` or `layout-chapter`; **`Ksr`** doc sidebar is expected on handbook-native layouts and does not register as a competing handbook signal.
- Listing and product routes use `layout-listing` or `layout-product` with matching interior shells (`fs-listing-layout`, product chrome) and no app-shell regions on marketing paths.
- Optional metadata aligns with layout: `<meta name="forge-page-mode" content="marketing">` on landing shells; `content="handbook"` on docs pages.
- `pageModeReport.modes` is a single mode (for example `["marketing"]` on home) or only modes compatible with the declared layout slug.
- No **`competing-modes`** violation for `marketing↔handbook`, `marketing↔app`, `marketing↔dashboard`, or `listing↔app`.
- Home path (`/`, `/index.html`) does not trigger **`home-handbook-shell`** (critical when handbook chrome appears above the fold).

## Failing signals

- **`competing-modes`** — detected modes include both **marketing** and **handbook** (for example `layout-landing` on the layout root plus six or more sidebar links in **`.forge-sidebar`** outside `main`).
- **`home-handbook-shell`** — `/` exposes handbook/doc chrome while expected mode is **marketing** (often co-fails **`DET.CONTEXT.BURDEN`** and **`DET.NAV.DEDUP`**).
- **`undeclared-mode`** — KS layout marker present, substantial `main` copy (≥ 80 words), but no `data-ks-name` layout slug and no `forge-page-mode` meta (**warn**).
- Visible **`.site-header .site-header-content`** showcase band on a non-presentation layout adds **presentation** as a competing mode.
- **`[data-shell-region]`**, **`.museum-studio`**, or **`data-ks-name="museum-studio"`** on a marketing page adds **app** as a competing mode.
- Handbook phrase density above threshold on a marketing/home route forces an extra **handbook** mode via `handbookChromeAboveFold`.
- Evidence shapes: `competing_modes=marketing↔handbook detected=marketing+handbook layout=layout-landing`; `home_modes=marketing+handbook expected=marketing`.

## Before example

Failing KS markup: public landing declares **`layout-landing`** but still mounts a handbook doc rail beside the hero—marketing and handbook modes compete above the fold.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forge SDLC — Governed delivery</title>
  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />
</head>
<body
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="layout-landing"
  class="fs-landing"
>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>

  <header class="landing-header">
    <div class="landing-header-inner px-3 px-xxl-5">
      <a class="fs-brand text-decoration-none" href="/">Forge<span class="fs-accent">SDLC</span></a>
      <nav class="landing-nav" aria-label="Site navigation">
        <a class="landing-nav-link" href="/">Overview</a>
        <a class="landing-nav-link" href="/trust">Trust</a>
        <a class="landing-nav-link" href="/docs">Docs</a>
      </nav>
    </div>
  </header>

  <div class="container-fluid px-0">
    <div class="row g-0 flex-lg-nowrap min-vh-100">
      <aside
        hash="Ksr"
        data-ks-hash="Ksr"
        data-ks-type="chrome-region"
        data-ks-name="doc-sidebar"
        id="ks-sidebar-aside"
        class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      >
        <nav class="nav-scroll px-2 py-3" aria-label="Handbook sections">
          <p class="nav-section-label">Handbook</p>
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
          <a href="/docs/agents" class="nav-link">Agents</a>
          <a href="/docs/evidence" class="nav-link">Evidence</a>
          <a href="/docs/release" class="nav-link">Release</a>
          <a href="/docs/operate" class="nav-link">Operate</a>
          <a href="/docs/maintainer" class="nav-link">Maintainer</a>
        </nav>
      </aside>

      <main id="main" class="col-lg-9 col-xl-10 fs-landing-main px-3 px-md-5">
        <section class="landing-hero fs-landing-hero-band forge-section" data-fs-section="hero">
          <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
            <p class="section-label text-cyan mb-2">Methodology</p>
            <h1 class="font-display mb-3">Governed human + agent delivery</h1>
            <p class="forge-support mb-4">Hero reads as marketing while sidebar reads as handbook.</p>
            <div class="landing-hero-actions">
              <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2">
                <a class="btn btn-forge" href="/quickstart">Quickstart</a>
                <a class="btn btn-cyan-outline" href="/docs">Read the handbook</a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</body>
</html>
```

## After example

Passing KS markup: same landing story with **`landing_page`** anatomy only—layout marker, curated header nav, hero band, and body shell; handbook tree lives under `/docs` routes, not on `/`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="forge-page-mode" content="marketing" />
  <title>Forge SDLC — Governed delivery</title>
  <link rel="stylesheet" href="assets/forgesdlc-theme.css" />
</head>
<body
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="layout-landing"
  class="fs-landing"
>
  <div class="forge-aurora"></div>
  <a href="#main" class="skip-link">Skip to content</a>

  <header class="landing-header">
    <nav class="navbar navbar-expand-lg landing-header-navbar py-0">
      <div class="container-fluid landing-header-inner px-3 px-xxl-5">
        <a class="navbar-brand fs-brand text-decoration-none mb-0" href="/">Forge<span class="fs-accent">SDLC</span></a>
        <button class="navbar-toggler border-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#fsLandingNav" aria-controls="fsLandingNav" aria-expanded="false" aria-label="Open site menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-lg-end" id="fsLandingNav">
          <nav class="landing-nav ms-lg-auto pt-2 pt-lg-0 w-100" aria-label="Site navigation">
            <a class="landing-nav-link" href="/">Overview</a>
            <a class="landing-nav-link" href="/how-it-works">How it works</a>
            <a class="landing-nav-link" href="/trust">Trust</a>
            <a class="landing-nav-link" href="/docs">Docs</a>
          </nav>
        </div>
      </div>
    </nav>
  </header>

  <main id="main" class="fs-landing-main">
    <div class="landing-hero fs-landing-hero-band" data-fs-section="hero">
      <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
        <p class="section-label text-cyan mb-2">Methodology</p>
        <h1 class="font-display mb-3">Governed human + agent delivery</h1>
        <p class="forge-support mb-4">Single marketing mode: outcome-first hero without handbook chrome.</p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2">
            <a class="btn btn-forge" href="/quickstart">Quickstart</a>
            <a class="btn btn-cyan-outline" href="/docs">Read the handbook</a>
          </p>
        </div>
      </div>
    </div>
    <div class="fs-landing-body-shell">
      <section class="forge-section py-5">
        <div class="container">
          <div class="row g-3 g-lg-4">
            <div class="col-md-4">
              <div class="forge-card p-3 h-100">
                <p class="card-label mb-1">Outcome</p>
                <p class="forge-support mb-0">Clear intent and reviewable execution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</body>
</html>
```

## Evidence and remediation

| Evidence | Meaning | Remediation |
|----------|---------|-------------|
| `competing_modes=marketing↔handbook` | Landing layout plus doc sidebar or handbook chrome | Remove **`forge-sidebar`** / **`fs-sidebar`** from `/`; use **`landing_page`** only |
| `home_modes=…+handbook expected=marketing` | Homepage reads as docs reader | Switch root generator to **`landing_page`**; move trees under `/docs` |
| `undeclared_mode` | Layout slug or meta missing on KS-marked page | Emit `layout_shell_attrs("landing_page")` or `<meta name="forge-page-mode" content="marketing">` |
| `layout=layout-handbook` on `/` | Wrong layout function for URL | Fix `build-site.py` / content-map routing before copy edits |

**Kitchen Sink:** Call **`landing_page`** for public roots (`components/layouts.py`); use **`handbook_page`** / **`chapter_page`** only on handbook URLs. Confirm `layout_shell_attrs` resolves to `data-ks-name="layout-landing"` (registry slug **`layout-landing`**, hash **`Ldg`**). Rebuild showcase and consumer sites after layout changes.

**Consumer sites:** Map URLs to mode 1–4 in `docs/design/forge-enterprise-ai-website-standard.md`. Re-audit with `analyze-website-ux.mjs`; inspect `metrics.pageModeReport` in crawl JSON.

**Harness:** `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.PAGE.MODE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-page-mode.check.js`.

## Related rules

- **DET.CONTEXT.BURDEN** — quantitative first-screen caps; handbook chrome on `/` often fails both rules.
- **DET.NAV.DEDUP** — duplicate destinations across masthead and sidebar when modes are mixed.
- **DET.NAV.DEPTH** — global nav depth; marketing shells should stay shallow.
- **DET.LANDMARKS.REQUIRED** — `main`, `nav`, and header landmarks differ by layout mode.
- **DET.PAGE.LANG** — `html lang` on the same document shells.
- **AI.NARRATIVE.COHERENCE** — story arc after mode is unambiguous (hero → outcomes → trust).
