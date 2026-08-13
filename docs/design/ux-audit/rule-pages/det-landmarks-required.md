---
rule_id: DET.LANDMARKS.REQUIRED
lane: deterministic
title: Required document landmarks
summary: Each page exposes exactly one main landmark, a navigation landmark when global wayfinding exists outside main, and semantic header/footer landmarks when site chrome is present—each unique at document level.
page_version: 881b1032b396bfc9b7f6683f951150c8268bc36f73a54f7d4ed8523f847bd708
generated_at: 2026-05-25T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-landmarks-required
---

## Purpose

Screen readers, keyboard users, and skip-link targets rely on **document landmarks** to jump directly to the primary content column, global navigation, and site chrome. Kitchen Sink handbook shells (**`showcase_page`**, **`handbook_page`**), marketing layouts (**`landing_page`**, **`marketing_page`**), and app shells emit predictable anatomy: **`header.site-header`** or **`header.landing-header`**, **`aside.forge-sidebar`** with section rails, **`main#main`**, and closing **`footer`** / **`.ks-site-footer-region`** (**Ksf**).

This deterministic rule samples the live DOM during the metrics phase. It counts visible, non-`aria-hidden` landmarks at **document level** (not nested inside `main`, `article`, `aside`, or `section`). A page **passes** when:

- Exactly **one** `main` or `[role="main"]` wraps the primary reading column.
- When **≥ 2** non-auxiliary navigational links sit outside `main` (in header, nav, aside, or sidebar chrome), at least **one** `nav` or `[role="navigation"]` landmark exists outside `main`.
- When KS **header chrome** is detected (`.site-header`, `.landing-header`, `header.site-header`, `[data-shell-region="header|banner"]`), a single document-level **`header`** or `[role="banner"]` is present.
- When KS **footer chrome** is detected (`footer`, `.ks-site-footer-region`, `.fs-footer`, `[data-shell-region="footer"]`) **outside `main`**, a document-level **`footer`** or `[role="contentinfo"]` is present.
- No duplicate document-level banner or contentinfo landmarks.

**Plan:** Map layout contracts to landmark roles before shipping HTML. **Do:** Use semantic elements KS layouts already name in Python (`layouts.py`, `components.py`). **Check:** `landmarksReport.violations` is empty. **Adjust:** Replace styled `div` shells with `header` / `main` / `nav` / `footer`; demote extra `main` or nested section headers that duplicate banner/contentinfo.

## Passing signals

- **`main id="main"`** with class **`doc-main`**, **`fs-landing-main`**, or app workspace class wraps the primary content column — one visible root only.
- **`header.site-header`** (handbook/showcase masthead) or **`header.landing-header`** with **`nav.landing-header-navbar`** / **`nav.landing-nav`** provides the document banner and, when global links exist, the navigation landmark outside `main`.
- **`aside.forge-sidebar`** contains **`nav.nav-scroll`** with `aria-label="Sections"` or `"Primary navigation"` — sidebar wayfinding counts as a nav landmark outside `main`.
- **`footer.ks-site-footer-region`** (**Ksf**) or **`footer.fs-footer`** outside `main` exposes contentinfo when footer chrome is contracted at page scope.
- In-page **`nav.forge-toc`** (on-this-page TOC) and section **`header`** elements **inside `main`** do not inflate top-level banner counts — only document-level chrome is measured.
- Skip links, `#main` hash targets, and auxiliary anchors (`Skip to content`, `#top`) are excluded from the nav-link threshold.

## Failing signals

- **`missing-main`:** Primary content sits in **`div.doc-main`**, **`article`**, or a Bootstrap column with no `main` / `[role="main"]` landmark (`main_landmark_count=0`).
- **`duplicate-main`:** Two or more document-level `main` landmarks — for example a workspace `main` plus a marketing band also tagged `main`.
- **`missing-nav`:** **`header.site-header`** or header chrome exposes ≥ **2** global links (`Overview`, `Docs`, `Trust`, …) but links are bare anchors with no wrapping **`nav`** outside `main` (`nav_applicable=true`, `nav_landmark_count=0`).
- **`missing-banner`:** Visible **`.site-header`** or **`.landing-header`** exists outside `main` but the root is a **`div`** instead of **`header`** / `[role="banner"]`.
- **`missing-contentinfo`:** **`.ks-site-footer-region`** or footer chrome sits outside `main` as a **`div`** with no nested or sibling **`footer`** / `[role="contentinfo"]` at document level.
- **`duplicate-banner` / `duplicate-contentinfo`:** Multiple top-level **`header`** or **`footer`** elements outside nested sections — common when a page-level masthead and a hero **`header`** both register as banners.

## Before example

Failing KS markup: handbook-style shell uses styled **`div`** chrome and a content column without **`main`**; global header links lack a **`nav`** landmark; footer band is a **`div`** outside the content column.

```html
<div class="container-fluid">
  <div class="site-header d-none d-lg-block border-bottom">
    <div class="row g-0">
      <div class="col-lg-3 col-xl-2 site-header-brand">
        <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
      </div>
      <div class="col-lg-9 col-xl-10 site-header-content d-flex gap-3 align-items-center">
        <a href="/" class="forge-support">Overview</a>
        <a href="/docs" class="forge-support">Docs</a>
        <a href="/trust" class="forge-support">Trust</a>
        <h1 class="font-display forge-gradient-text mb-0 ms-auto" style="font-size:clamp(1.25rem,3vw,1.75rem)">Chapter</h1>
      </div>
    </div>
  </div>
  <div class="row g-0">
    <aside class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0">
      <div class="px-2 py-3">
        <p class="nav-section-label">Handbook</p>
        <a href="/docs/start" class="nav-link active">Getting started</a>
        <a href="/docs/govern" class="nav-link">Governance</a>
      </div>
    </aside>
    <div class="doc-main col-lg-9 col-xl-10 px-4 py-4">
      <div class="forge-card p-3">
        <p class="card-label mb-1">Body</p>
        <p class="forge-support mb-0">Primary column is a div — no main landmark; header and footer are not semantic landmarks.</p>
      </div>
    </div>
  </div>
  <div class="ks-site-footer-region border-top py-4 mt-4" style="border-color: var(--forge-border);">
    <p class="forge-support mb-0 text-center">© Forge — footer chrome without contentinfo landmark.</p>
  </div>
</div>
```

## After example

Passing KS markup: same handbook anatomy with semantic landmarks — **`header.site-header`**, **`nav`** in the sidebar rail, **`main#main.doc-main`**, and **`footer.ks-site-footer-region`** (**Ksf**) outside the content column.

```html
<div class="container-fluid">
  <header class="site-header d-none d-lg-block">
    <div class="row g-0">
      <div class="col-lg-3 col-xl-2 site-header-brand">
        <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
        <p class="mt-1 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook</p>
      </div>
      <div class="col-lg-9 col-xl-10 site-header-content">
        <div class="ks-doc-breadcrumb mb-2">
          <nav aria-label="Breadcrumb"><ol class="breadcrumb mb-0"><li class="breadcrumb-item"><a href="/">Home</a></li><li class="breadcrumb-item active">Chapter</li></ol></nav>
        </div>
        <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">Chapter</h1>
      </div>
    </div>
  </header>
  <div class="row g-0">
    <aside
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      id="ks-sidebar-aside"
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
    >
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Sections">
        <p class="nav-section-label">Handbook</p>
        <a href="/docs/start" class="nav-link active">Getting started</a>
        <a href="/docs/govern" class="nav-link">Governance</a>
      </nav>
    </aside>
    <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
      <div class="forge-card p-3">
        <p class="card-label mb-1">Body</p>
        <p class="forge-support mb-0">One main landmark; sidebar nav and header/footer chrome are exposed to assistive tech.</p>
      </div>
    </main>
  </div>
  <footer
    hash="Ksf"
    data-ks-hash="Ksf"
    data-ks-type="chrome-region"
    data-ks-name="site-footer"
    class="ks-site-footer-region border-top py-4 mt-4"
    style="border-color: var(--forge-border);"
  >
    <p class="forge-support mb-0 text-center">© Forge</p>
  </footer>
</div>
```

## Evidence and remediation

**Evidence:** Metrics phase emits `landmarksReport` with counts (`mainCount`, `navApplicable`, `navLandmarkCount`, `topBannerCount`, `topContentinfoCount`, `outsideMainNavLinkCount`) and `violations[]` (`kind`: `missing-main`, `duplicate-main`, `missing-nav`, `missing-banner`, `duplicate-banner`, `missing-contentinfo`, `duplicate-contentinfo`). Findings use area `accessibility`, severity `minor`, and evidence such as `main_landmark_count=0` or `chrome_header_without_banner=true`. Capture the accessibility tree or a landmark overlay screenshot for the audited URL.

**Remediate (in order):**

1. **Establish one `main`** — wrap the primary reading/workspace column in `<main id="main">` (or a single `[role="main"]`); remove duplicate mains from hero bands or nested layouts.
2. **Landmark the global nav** — when ≥ **2** wayfinding links live outside `main`, wrap them in `<nav aria-label="…">` in **`header.landing-header`**, **`aside.forge-sidebar`**, or a dedicated shell rail; do not rely on bare anchor lists in header chrome.
3. **Use semantic header/footer shells** — change **`.site-header`** / **`.landing-header`** roots from `div` to `<header>`; expose **Ksf** footer chrome as `<footer class="ks-site-footer-region">` or nest `<footer>` inside the contracted footer region when the outer wrapper must stay a `div` for hash attrs.
4. **Demote nested headers** — section titles inside `main` may use `<header>` only when they will not register as a second document-level banner; prefer heading elements inside `section` for in-page bands.
5. **Re-audit** — run `analyze-website-ux.mjs` on handbook, marketing, and app URLs; confirm `landmarksReport.violations` is empty and skip-link `#main` resolves to the sole main landmark.

## Related rules

- `DET.CHROME.BOUNDARY` — once landmarks exist, chrome regions must visually separate from the reading canvas.
- `DET.APP.PERSISTENT_CHROME` — app shells keep the same landmarked regions across crawled routes.
- `DET.NAV.FOCUS_ORDER` — keyboard tab order must follow the landmark structure screen readers announce.
- `DET.NAV.BREADCRUMB` — breadcrumb `nav` inside header content complements sidebar `nav` landmarks.
- `DET.SECTION.HEADING` — heading hierarchy inside `main` must remain coherent after landmark fixes.
- `DET.PAGE.MODE` — layout mode (handbook, marketing, app) predicts which landmark pattern applies.
