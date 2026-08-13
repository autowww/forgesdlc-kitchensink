---
rule_id: DET.CONTEXT.BURDEN
lane: deterministic
title: First-screen context burden
summary: Quantitative caps on header navigation, pre-main link clusters, nav chrome bands, and hero-fold interactive controls keep public homepages story-led instead of docs-shaped.
page_version: 292b0ee1e765d6546938712874f88843defbed5b2628a87e85e68301e7906695
generated_at: 2026-05-19T21:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-context-burden
---

## Purpose

Kitchen Sink **`landing_page`** shells (`components/layouts.py`, `css/forgesdlc-theme.css`) are meant to lead with a product story: curated **`landing-header`** / **`landing-nav`**, a **`landing-hero`** band, and depth routes under `/docs` or `/handbook`. When a public homepage reuses handbook chrome—**`fs-primary-nav-global`**, persistent **`fs-sidebar`**, offcanvas trees, and wide link walls—the first screen reads as documentation before the visitor sees what the product does.

This deterministic rule enforces the Forge enterprise **first-screen budget** from `docs/design/forge-enterprise-ai-website-standard.md` using crawl metrics and a Playwright hero-fold probe:

| Signal | Cap | Scope |
|--------|-----|--------|
| Pre-main links before first in-main `h1` | ≤ **10** | All audited pages |
| Header / outside-main nav links | ≤ **7** | All audited pages |
| Distinct nav chrome containers outside `main` | ≤ **4** | All audited pages |
| First-viewport link count | ≤ **28** | Home / landing root only |
| Hero-fold interactive controls in `main` | ≤ **3** | Home / landing root only |

Interactive controls count visible `<button>`, `[role="button"]`, `.btn` anchors, and submit/button inputs in the hero fold, excluding pagination, dropdown menus, and in-nav controls. Platform handbook **inner** routes are skipped (same pattern as docs readers).

**Plan:** Audit `/` and primary landing URLs for chrome and link counts above the fold. **Do:** Switch root pages to **`landing_page`** shell; curate **`landing-nav-link`** items; demote depth to sidebars on deep routes only. **Check:** Confirm crawl metrics and `contextBurdenReport.heroInteractiveCount` are within caps. **Adjust:** When subjective overload persists after counts pass, escalate to **`AI.CONTEXT.BURDEN_SUBJECTIVE`**.

## Passing signals

- Root homepage uses **`landing-header`** + **`landing-nav`** with **4–7** visible top-level destinations (Overview, How it works, Trust, Docs, etc.).
- No persistent **`fs-sidebar`** or generated handbook tree on desktop homepage view; full trees live under `/docs`, `/handbook`, or `/reference`.
- **`preMainFirstH1LinkCount`** ≤ 10 — skip links, theme toggles, and cookie banners excluded from the count.
- **`outsideMainHeaderNavLinkCount`** ≤ 7 — curated global nav, not an exhaustive product index.
- **`navChromeContainerCount`** ≤ 4 — header + one mobile offcanvas band, not stacked sidebars and duplicate nav rails.
- On home: **`firstViewportLinkCount`** ≤ 28 and **`heroInteractiveCount`** ≤ 3 (typically one **`btn btn-forge`** primary, one **`btn-cyan-outline`** secondary, optional low-emphasis third).
- Additional destinations use **`landing-hero-secondary-links`** / **`landing-hero-secondary-link`** text links below the button row.

## Failing signals

- **`preMainFirstH1LinkCount` > 10** — link walls, cross-ref asides, or chrome links appear above the primary in-main headline (`pre_main_first_h1_link_count=N max=10`, **major**; **critical** when count exceeds max + 2).
- **`outsideMainHeaderNavLinkCount` > 7** — **`landing-nav`** or **`fs-primary-nav-global`** exposes too many top-level choices (`outside_main_header_nav_links=N max=7`).
- **`navChromeContainerCount` > 4** — competing **`header`**, **`nav`**, **`aside`**, **`fs-sidebar`**, and offcanvas bands outside **`main`** (`nav_chrome_container_count=N max=4`).
- On home: **`firstViewportLinkCount` > 28** — first viewport dominated by navigational anchors (**critical**).
- On home: **`heroInteractiveCount` > 3** — four or more hero-fold `.btn` / button controls in **`landing-hero-actions__buttons`** (**major**; **critical** when count exceeds max + 1).
- Homepage screenshot reads as handbook reader despite hero copy — often co-fails **`DET.PAGE.MODE`** and **`DET.NAV.DEDUP`**.

## Before example

Failing KS markup: handbook-style chrome on `/` — stacked nav bands, sidebar tree, pre-main cross-refs, and four hero buttons. Exceeds header nav, nav-band, pre-main, and hero-control budgets.

```html
<body class="fs-landing fs-layout-landing">
  <nav class="fs-primary-nav-global" aria-label="Site sections" hash="Kpn" data-ks-hash="Kpn">
    <div class="fs-primary-nav-global-inner">
      <a class="landing-nav-link" href="/">Home</a>
      <a class="landing-nav-link" href="/overview">Overview</a>
      <a class="landing-nav-link" href="/how-it-works">How it works</a>
      <a class="landing-nav-link" href="/roles">Roles</a>
      <a class="landing-nav-link" href="/trust">Trust</a>
      <a class="landing-nav-link" href="/ecosystem">Ecosystem</a>
      <a class="landing-nav-link" href="/docs">Docs</a>
      <a class="landing-nav-link" href="/handbook">Handbook</a>
      <a class="landing-nav-link" href="/reference">Reference</a>
      <a class="landing-nav-link" href="/operate">Operate</a>
    </div>
  </nav>

  <header class="landing-header">
    <nav class="navbar navbar-expand-lg landing-header-navbar py-0">
      <div class="container-fluid landing-header-inner px-3 px-xxl-5">
        <a class="navbar-brand fs-brand text-decoration-none mb-0" href="/">Forge<span class="fs-accent">SDLC</span></a>
        <nav class="landing-nav ms-lg-auto pt-2 pt-lg-0" aria-label="Site navigation">
          <a class="landing-nav-link" href="/quickstart">Quickstart</a>
          <a class="landing-nav-link" href="/guides">Guides</a>
          <a class="landing-nav-link" href="/schemas">Schemas</a>
          <a class="landing-nav-link" href="/api">API</a>
          <a class="landing-nav-link" href="/changelog">Changelog</a>
        </nav>
      </div>
    </nav>
  </header>

  <div class="container-fluid fs-layout">
    <div class="row g-0">
      <aside class="col-lg-3 col-xl-2 d-none d-lg-block fs-sidebar py-3 px-3" hash="Ksr" data-ks-hash="Ksr">
        <details class="fs-nav-tier-wrap" open>
          <summary class="fs-nav-tier text-muted">Handbook</summary>
          <ul class="nav flex-column px-1 mb-2">
            <li class="nav-item"><a class="nav-link" href="/handbook/intro">Introduction</a></li>
            <li class="nav-item"><a class="nav-link" href="/handbook/chapters">Chapters</a></li>
            <li class="nav-item"><a class="nav-link" href="/handbook/adr">ADR index</a></li>
            <li class="nav-item"><a class="nav-link" href="/handbook/evidence">Evidence</a></li>
          </ul>
        </details>
      </aside>

      <main id="main" class="col-lg-9 col-xl-10 fs-main fs-landing-main">
        <aside class="fs-cross-refs" role="complementary">
          <p class="forge-support mb-2">Popular paths</p>
          <ul>
            <li><a href="/docs/architecture">Architecture</a></li>
            <li><a href="/docs/schemas">Schemas</a></li>
            <li><a href="/docs/operate">Operate</a></li>
            <li><a href="/docs/maintainer">Maintainer setup</a></li>
          </ul>
        </aside>

        <section class="landing-hero fs-landing-hero-band forge-section" hash="Ldg" data-ks-hash="Ldg">
          <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
            <div class="row align-items-center g-4 landing-hero-grid">
              <div class="col-12 col-xl-7 landing-hero-copy">
                <h1 class="font-display forge-gradient-text product-landing-title mb-3">
                  Governed human + agent delivery
                </h1>
                <p class="forge-support landing-hero-tagline mb-4">
                  One methodology spine from intent to evidence.
                </p>
                <div class="landing-hero-actions">
                  <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-3">
                    <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
                    <a class="btn btn-forge" href="/demo">Book demo</a>
                    <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
                    <a class="btn btn-forge-outline" href="/trust">Trust model</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</body>
```

## After example

Passing KS markup: canonical **`landing_page`** shell — curated header nav, no homepage sidebar, story-first hero with two button actions and muted secondary links.

```html
<body class="fs-landing fs-layout-landing">
  <a href="#main" class="skip-link">Skip to content</a>

  <header class="landing-header">
    <div class="landing-header-inner px-3 px-xxl-5">
      <a class="fs-brand text-decoration-none" href="/">Forge<span class="fs-accent">SDLC</span></a>
      <nav class="landing-nav" aria-label="Site navigation">
        <a class="landing-nav-link active" href="/">Overview</a>
        <a class="landing-nav-link" href="/how-it-works">How it works</a>
        <a class="landing-nav-link" href="/trust">Trust</a>
        <a class="landing-nav-link" href="/ecosystem">Ecosystem</a>
        <a class="landing-nav-link landing-nav-cta btn btn-forge btn-sm" href="/docs">Docs</a>
      </nav>
    </div>
  </header>

  <main id="main" class="fs-landing-main">
    <section class="landing-hero fs-landing-hero-band forge-section" hash="Ldg" data-ks-hash="Ldg" data-fs-section="hero">
      <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
        <div class="landing-hero-grid-wrap">
          <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
            <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
              <h1 class="font-display forge-gradient-text product-landing-title mb-3">
                Governed human + agent delivery
              </h1>
              <p class="forge-support landing-hero-tagline mb-4">
                Shape intent, delegate safely, and release with evidence—not ad hoc prompts.
              </p>
              <div class="landing-hero-actions">
                <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 justify-content-center justify-content-xl-start mb-3 mb-md-2">
                  <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
                  <a class="btn btn-cyan-outline" href="/how-it-works">See how it works</a>
                </p>
                <p class="landing-hero-secondary-links forge-support text-muted mb-0">
                  <a class="landing-hero-secondary-link" href="/docs">Full documentation</a>
                  <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
                  <a class="landing-hero-secondary-link" href="/trust">Trust model</a>
                </p>
              </div>
            </div>
            <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
              <div class="landing-forge-visual">
                <img
                  src="/assets/hero-flow.svg"
                  alt="Intent to evidence workflow diagram"
                  class="landing-forge-visual__img"
                  width="640"
                  height="420"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="fs-landing-body-shell">
      <section class="forge-section py-5">
        <div class="container-fluid px-3 px-xxl-5">
          <h2 class="font-display mb-3">Three outcomes teams need</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="forge-card p-3 h-100">
                <p class="forge-support mb-0">Clear intent before agent work starts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</body>
```

## Evidence and remediation

**Evidence:** Crawl metrics from `lib/dom-metrics.js` — `preMainFirstH1LinkCount`, `outsideMainHeaderNavLinkCount`, `navChromeContainerCount`, `firstViewportLinkCount` (home only). Playwright probe `contextBurdenReport.heroInteractiveCount` from `collectContextBurdenReport`. Finding messages cite keys such as `pre_main_first_h1_link_count=14 max=10`, `outside_main_header_nav_links=12 max=7`, `nav_chrome_container_count=6 max=4`, `first_viewport_link_count=30 max=28`, `hero_interactive_controls=5 max=3`.

**Remediate (in order):**

1. **Shell:** Route `/` through **`landing_page`**, not **`product_page`** with persistent **`fs-sidebar`**. Move handbook trees to `/docs` / `/handbook` deep routes.
2. **Header nav:** Trim **`landing-nav`** / **`fs-primary-nav-global`** to **4–7** curated destinations; nest the rest under Docs or a single mega-menu on interior pages only.
3. **Pre-main links:** Remove **`fs-cross-refs`**, breadcrumb walls, and maintainer indexes above the hero **`h1`**; link dense reference from below the fold or dedicated pages.
4. **Hero controls:** Collapse to one **`btn-forge`** + one **`btn-cyan-outline`**; demote extras to **`landing-hero-secondary-link`** (align with **`DET.BUTTON.GROUP.MAX`**).
5. **Chrome bands:** Consolidate duplicate mobile/desktop nav trees; keep offcanvas for small viewports without also exposing full sidebar on homepage desktop.
6. Re-run `analyze-website-ux.mjs` on `/`; if counts pass but the viewport still feels noisy, review **`AI.CONTEXT.BURDEN_SUBJECTIVE`**.

## Related rules

- `DET.BUTTON.GROUP.MAX` — horizontal hero button row cap (feeds hero interactive count).
- `DET.CTA.HIERARCHY` — one primary CTA class per viewport region.
- `DET.NAV.DEDUP` — duplicate destination labels across competing nav bands.
- `DET.NAV.DEPTH` — global primary nav nesting depth (`.landing-nav`, `.fs-primary-nav-global`).
- `DET.PAGE.MODE` — root `/` must use landing/product shell, not handbook reader mode.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — perceived overload when numeric caps pass.
- `AI.CONTEXT.COGNITIVE_CLARITY` — acronyms and technical depth before product explanation.
