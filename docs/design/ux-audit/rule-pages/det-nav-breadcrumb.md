---
rule_id: DET.NAV.BREADCRUMB
lane: deterministic
title: Doc hub breadcrumb orientation
summary: Handbook, product, and showcase hub pages expose visible Kbc breadcrumb chrome when doc-sidebar rails or showcase mastheads signal deep IA—home and marketing landing layouts are exempt.
page_version: 78432403f7b834b8b4ab64d4dd743e8b6afdcd2dfecd25238bf362def0906639
generated_at: 2026-05-25T15:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-breadcrumb
---

## Purpose

Readers on doc and product hubs need a compact **where am I** trail separate from primary rails (**Ksr** sidebar) and page titles. Kitchen Sink layouts (`showcase_page`, `handbook_page`, product shells) contract **Kbc** — `.ks-doc-breadcrumb` with `hash="Kbc"` and `data-ks-hash="Kbc"` — inside **`header.site-header`** masthead bands.

This deterministic rule runs during the metrics phase. It sets `requiresBreadcrumb=true` when the page is **not** home and any doc-hub signal is present:

- Layout slug in **`layout-handbook`**, **`layout-chapter`**, **`layout-product`**, **`layout-showcase`**, **`layout-listing`**, **`layout-gallery`**, or **`layout-split`** (`[data-ks-type="layout"]` / `data-ks-name`).
- Visible doc sidebar: **`.forge-sidebar`**, **`#ks-sidebar-aside`**, **`.fs-sidebar`**, or **`aside[data-ks-hash="Ksr"]`** / **`aside[data-ks-name="doc-sidebar"]`**.
- Visible showcase masthead: **`.site-header .site-header-content`**.

**Exempt:** **`layout-landing`** and **`layout-marketing`** (and home `/`, `/index.html`).

A page **passes** when a visible breadcrumb root matches **`.ks-doc-breadcrumb`**, **`[data-ks-hash="Kbc"]`**, **`nav[aria-label="breadcrumb"]`**, or Bootstrap **`.breadcrumb`** inside header/main with meaningful content (linked trail, two or more items, or separator-delimited path text). When breadcrumb is present, **Kbc catalog markers** must also appear on the root.

**Plan:** Map layout contracts to breadcrumb emission before shipping HTML. **Do:** Use `render_breadcrumbs()` or `_showcase_header()` defaults in `components/layouts.py`. **Check:** `navBreadcrumbReport.requiresBreadcrumb && breadcrumbPresent && kbcMarkerPresent`. **Adjust:** Add **Kbc** to masthead; do not rely on sidebar labels alone for orientation.

## Passing signals

- **`nav.ks-doc-breadcrumb`** with **`hash="Kbc"`**, **`data-ks-hash="Kbc"`**, **`data-ks-type="chrome-region"`**, **`data-ks-name="doc-breadcrumb"`** sits in **`.site-header-content`** above or beside the page title.
- Ordered trail via **`<ol class="breadcrumb">`** with **`.breadcrumb-item`** links for upstream crumbs and **`aria-current="page"`** on the terminal crumb — matches `render_breadcrumbs()` in `components/components.py`.
- Default showcase header fallback emits Home to current page when `breadcrumb_html` is empty (`_showcase_header` in `layouts.py`).
- **`nav[aria-label="Breadcrumb"]`** with visible linked segments passes even without the Kbc class, but **Kbc markers** must still be present to avoid the secondary catalog finding.
- Home (`/`, `/index.html`) and **`layout-landing`** / **`layout-marketing`** pages correctly skip the requirement (`requiresBreadcrumb=false`).

## Failing signals

- **`missing_breadcrumb`:** Doc hub signals fire (`layout:layout-handbook`, `doc-sidebar`, or `showcase-header`) but no visible **`.ks-doc-breadcrumb`**, **`nav[aria-label*="breadcrumb"]`**, or **`.breadcrumb`** with meaningful content — readers see only sidebar nav and an **`h1`** title.
- Empty or decorative strip: breadcrumb root exists but has no links, fewer than two meaningful words, and no separators (`/`, `›`, `→`).
- Hidden or zero-size chrome: breadcrumb node present in DOM but **`display:none`**, **`visibility:hidden`**, or bounding box below visibility thresholds.
- **`kbc_marker_missing`:** Visible breadcrumb uses generic **`nav[aria-label="breadcrumb"]`** or **`.breadcrumb`** without **`hash="Kbc"`** / **`data-ks-hash="Kbc"`** on **`.ks-doc-breadcrumb`** — orientation works but visual catalog contract is unmet.
- Landing/marketing exemption misapplied: deep handbook page tagged **`layout-marketing`** solely to skip breadcrumb while still shipping **Ksr** sidebar chrome.

## Before example

Failing KS markup: handbook-style shell with **Ksr** sidebar and **`.site-header-content`**, but masthead shows only the chapter title — no **Kbc** orientation strip.

```html
<div
  data-ks-type="layout"
  data-ks-name="layout-handbook"
  hash="Hbk"
  data-ks-hash="Hbk"
  class="container-fluid"
>
  <header class="site-header d-none d-lg-block">
    <div class="row g-0">
      <div class="col-lg-3 col-xl-2 site-header-brand">
        <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
        <p class="mt-1 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook</p>
      </div>
      <div class="col-lg-9 col-xl-10 site-header-content d-flex align-items-center">
        <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">Governance patterns</h1>
      </div>
    </div>
  </header>
  <div class="row g-0">
    <aside
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
    >
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Sections">
        <p class="nav-section-label">Handbook</p>
        <a href="/docs/start" class="nav-link">Getting started</a>
        <a href="/docs/govern" class="nav-link active">Governance</a>
      </nav>
    </aside>
    <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
      <p class="forge-support mb-0">Doc hub without Kbc breadcrumb — auditor flags missing_breadcrumb.</p>
    </main>
  </div>
</div>
```

## After example

Passing KS markup: same handbook anatomy with contracted **Kbc** trail in the masthead — upstream links plus current page, catalog markers on the root.

```html
<div
  data-ks-type="layout"
  data-ks-name="layout-handbook"
  hash="Hbk"
  data-ks-hash="Hbk"
  class="container-fluid"
>
  <header class="site-header d-none d-lg-block">
    <div class="row g-0">
      <div class="col-lg-3 col-xl-2 site-header-brand">
        <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
        <p class="mt-1 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook</p>
      </div>
      <div class="col-lg-9 col-xl-10 site-header-content">
        <nav
          class="ks-doc-breadcrumb"
          aria-label="Breadcrumb"
          hash="Kbc"
          data-ks-hash="Kbc"
          data-ks-type="chrome-region"
          data-ks-name="doc-breadcrumb"
        >
          <ol class="breadcrumb mb-1" style="font-size:0.75rem">
            <li class="breadcrumb-item">
              <a href="/" class="text-cyan" style="text-decoration:none">Home</a>
            </li>
            <li class="breadcrumb-item">
              <a href="/docs/govern" class="text-cyan" style="text-decoration:none">Governance</a>
            </li>
            <li class="breadcrumb-item active text-dim" aria-current="page">Patterns</li>
          </ol>
        </nav>
        <h1 class="font-display forge-gradient-text mb-0 mt-1" style="font-size:clamp(1.25rem,3vw,1.75rem)">Governance patterns</h1>
      </div>
    </div>
  </header>
  <div class="row g-0">
    <aside
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
    >
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Sections">
        <p class="nav-section-label">Handbook</p>
        <a href="/docs/start" class="nav-link">Getting started</a>
        <a href="/docs/govern" class="nav-link active">Governance</a>
      </nav>
    </aside>
    <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
      <p class="forge-support mb-0">Kbc breadcrumb present — breadcrumbPresent and kbcMarkerPresent both true.</p>
    </main>
  </div>
</div>
```

## Evidence and remediation

1. **Confirm hub signals** — inspect `navBreadcrumbReport.docHubSignals` (`layout:…`, `doc-sidebar`, `showcase-header`, or `landing-exempt`). Home and pure marketing shells should not require breadcrumb.
2. **Emit Kbc in layout Python** — pass `breadcrumb_html` into `showcase_page` / `handbook_page`, or call `render_breadcrumbs([("index.html", "Home"), (None, page_title)])` from `components/components.py`.
3. **Preserve catalog markers** — root must include **`hash="Kbc"`** and **`data-ks-hash="Kbc"`** per `docs/design/catalog/chrome/Kbc-doc-breadcrumb.md` and `chrome_region_attrs("doc-breadcrumb")`.
4. **Keep content meaningful** — at least one upstream link or separator-delimited path; terminal crumb uses **`aria-current="page"`**; decorative separators use **`aria-hidden="true"`** when not in link text.
5. **Rebuild and re-audit** — run `python3 generator/build-showcase.py` for KS surfaces, then `node tools/website-ux-auditor/analyze-website-ux.mjs` or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.BREADCRUMB`.
6. **Harness fixtures** — defect/pass pairs live under `auditor-tests/` via `generator/build_rule_defect_fixtures.py`; compare HTML against the before/after blocks above.

Finding text (when failing): *Doc or product hub page is missing visible breadcrumb orientation chrome (Kbc / .ks-doc-breadcrumb)* or *Visible doc breadcrumb chrome lacks Kbc catalog markers* — severity **warn**, area **informationArchitecture** / **visual-catalog**.

## Related rules

- `DET.LANDMARKS.REQUIRED` — breadcrumb `nav` complements sidebar `nav` landmarks; both sit outside `main`.
- `DET.CHROME.BOUNDARY` — **Kbc** stays visually lighter than **Ksr** rails; orientation chrome must not replace primary wayfinding.
- `DET.APP.PERSISTENT_CHROME` — breadcrumb belongs in stable masthead chrome across in-app routes.
- `DET.NAV.DEPTH` — deep IA paths need breadcrumb when sidebar depth alone is insufficient on condensed viewports.
- `DET.NAV.DEDUP` — do not duplicate the full sidebar tree inside the breadcrumb strip.
- `DET.HASH.MARKERS` — **Kbc** roots require paired `hash` / `data-ks-hash` markers on emitted HTML.
- `AI.APP.WORKFLOW_CONTINUITY` — judgment layer for breadcrumb labels that read as generic "Workspace" on every route.
