---
rule_id: DET.NAV.FOCUS_ORDER
lane: deterministic
title: Keyboard focus order matches visual reading order
summary: Tab traversal follows top-to-bottom, left-to-right reading order on sampled paths through header, main, and footer chrome—no positive tabindex, large upward jumps, or row inversions.
page_version: 84636f49a8af2c9595b613d075ec4f5c84d25ca7537f8b8fc84b43684a3d0210
generated_at: 2026-05-25T19:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-focus_order
related_rules:
  - DET.LANDMARKS.REQUIRED
  - DET.NAV.DEPTH
  - DET.NAV.DEDUP
  - DET.NAV.BREADCRUMB
  - DET.NAV.IN_PAGE_TOC
  - DET.APP.FOCUS_TRAP
---

## Purpose

Keyboard users rely on **Tab** and **Shift+Tab** to move through interactive controls in an order that matches what sighted readers scan: header chrome → primary column → complementary rails → footer. When DOM order, CSS layout (`position`, `float`, `flex-direction`, grid placement), or **`tabindex` overrides** diverge from visual placement, focus jumps unpredictably—skipping masthead actions, revisiting regions, or trapping users in chrome that looks finished.

Kitchen Sink shells (**`header.site-header`**, **`nav.fs-primary-nav-global`** / **Kpn**, **`aside.forge-sidebar`** / **Ksr**, **`main#main`**, **`footer.ks-site-footer-region`** / **Ksf**) already encode a landmark sequence. This deterministic rule runs during the metrics phase. Playwright collects up to **48** visible tab stops per sampled page, ranks them (positive **`tabindex` first**, then DOM order), and compares consecutive stop centers against thresholds from `det-nav-focus-order.check.js`:

| Violation kind | Trigger |
|----------------|---------|
| **`positive-tabindex`** | Any focusable control has **`tabindex > 0`** |
| **`reverse-vertical`** | Next stop center is **> 72px above** the previous stop |
| **`reverse-horizontal`** (LTR) | On the same row (≤ **40px** vertical band), next stop is **> 96px left** of the previous |
| **`handbook-chrome-tab-suppressed`** | Curated top nav (`.fleet-handbook-topnav`) is present and **> 16** sidebar / in-page ToC / breadcrumb links use **`tabindex="-1"`** |

Regions are classified as **`header`**, **`nav`**, **`main`**, **`aside`**, **`footer`**, or **`document`** for evidence strings.

**Plan:** Walk keyboard paths on handbook, marketing, and showcase layouts before shipping HTML. **Do:** Keep focusable elements in DOM order that mirrors visual reading order; reserve **`tabindex="-1"`** for programmatic focus targets only. **Check:** `navFocusOrderReport.violations` is empty. **Adjust:** Remove positive tabindex, reorder DOM or fix layout, and restore natural tab order for complementary nav when top nav does not duplicate those destinations.

## Passing signals

- Tab moves through **`header.site-header`** / **`header.landing-header`** skip link → **`nav.fs-primary-nav-global`** (**Kpn**) or **`nav.landing-nav`** links left-to-right, then into **`main#main`** without large upward jumps.
- **`fs-nav-dropdown__trigger`** and **`.fs-nav-dropdown__link`** panel items follow DOM order matching their visual row; no **`flex-row-reverse`** or absolute positioning that inverts LTR toolbar order.
- Deep handbook links in **`aside.forge-sidebar`** (**Ksr**, `#ks-sidebar-aside`) and **`aside.ks-doc-toc-rail`** (**Ktx**) appear in tab order where keyboard users expect them relative to **`main`**—typically after masthead nav, alongside or before the primary column depending on layout grid.
- Hero CTAs (**`.btn.btn-forge`**, **`.landing-nav-cta`**) use default **`tabindex`** (0 or implicit); no **`tabindex="1"`** / **`tabindex="5"`** shortcuts.
- **`footer.ks-site-footer-region`** (**Ksf**) links receive focus after **`main`** content on the sampled path.
- When complementary chrome links are removed from tab order (**`tabindex="-1"`**), curated top nav still exposes every in-page section—or suppressed count stays ≤ **16**.
- Evidence shape: `navFocusOrderReport.tabStopCount` > 0 and `violations[]` empty on audited URLs.

## Failing signals

- **`positive-tabindex`** — a **`button`**, **`a`**, or **`input`** in **`main`**, hero, or sticky CTA band uses **`tabindex="2"`** or higher; Tab visits that control before earlier masthead links (`tabindex=N` in evidence).
- **`reverse-vertical`** — after tabbing through **`main`** body links, focus jumps to a **`position-fixed`** masthead action or sidebar rail **> 72px higher** on screen (`deltaY` negative, `fromRegion=main`, `toRegion=header|aside`).
- **`reverse-horizontal`** — **`nav.fs-primary-nav-global-inner`** uses **`flex-row-reverse`**, CSS grid **`order`**, or float layout so Tab moves **right-to-left** within a toolbar row (`deltaX` negative, same-row band).
- **`handbook-chrome-tab-suppressed`** — handbook shell with curated top nav hides **> 16** visible **`aside.forge-sidebar`**, **`.ks-doc-toc-rail`**, or breadcrumb anchors from tab order while top nav omits those destinations.
- Co-failures: inverted nav after flattening flyouts (**`DET.NAV.DEPTH`**); missing **`nav`** landmark wrapping reordered link bands (**`DET.LANDMARKS.REQUIRED`**).
- Evidence shapes: `step=N deltaY=-120px from <a>#cta (main) to <a>#skip (header)`; `tabindex=3 <button> id="hero-cta" region=main`; `handbook_chrome_tab_suppressed count=18 max=16`.

## Before example

Failing KS markup: **`Kpn`** uses **`flex-row-reverse`** so Tab traverses Trust → Docs → Overview **right-to-left** on one row (**`reverse-horizontal`**). Hero Quickstart uses **`tabindex="3"`** (**`positive-tabindex`**).

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content">
      <nav
        class="fs-primary-nav-global"
        aria-label="Site sections"
        hash="Kpn"
        data-ks-hash="Kpn"
        data-ks-type="chrome-region"
        data-ks-name="product-primary-nav"
      >
        <div class="fs-primary-nav-global-inner d-flex flex-row-reverse gap-3 align-items-center">
          <a href="/trust" class="landing-nav-link">Trust</a>
          <a href="/docs" class="landing-nav-link">Docs</a>
          <a href="/" class="landing-nav-link active">Overview</a>
        </div>
      </nav>
    </div>
  </div>
</header>
<main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
  <h1 class="font-display forge-gradient-text mb-3">Governed delivery</h1>
  <p class="forge-support mb-4">Keyboard tab order diverges from visual LTR nav and positive tabindex on the CTA.</p>
  <a href="/quickstart" class="btn btn-forge landing-nav-cta" tabindex="3">Quickstart</a>
</main>
```

## After example

Passing KS markup: **`Kpn`** links follow DOM order left-to-right; hero CTA uses default tab order; skip link and masthead precede **`main`** in both visual and focus sequence.

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content d-flex align-items-center gap-3">
      <a href="#main" class="btn btn-sm btn-forge">Skip to content</a>
      <nav
        class="fs-primary-nav-global"
        aria-label="Site sections"
        hash="Kpn"
        data-ks-hash="Kpn"
        data-ks-type="chrome-region"
        data-ks-name="product-primary-nav"
      >
        <div class="fs-primary-nav-global-inner d-flex gap-3 align-items-center">
          <a href="/" class="landing-nav-link active">Overview</a>
          <a href="/docs" class="landing-nav-link">Docs</a>
          <a href="/trust" class="landing-nav-link">Trust</a>
          <div class="fs-nav-dropdown" data-fs-nav-dropdown>
            <button type="button" class="fs-nav-dropdown__trigger" aria-expanded="false">More</button>
            <div class="fs-nav-dropdown__panel">
              <div class="fs-nav-dropdown__panel-inner">
                <a class="fs-nav-dropdown__link" href="/quickstart">Quickstart</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</header>
<main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
  <h1 class="font-display forge-gradient-text mb-3">Governed delivery</h1>
  <p class="forge-support mb-4">Tab moves skip link → Kpn left-to-right → main content without tabindex overrides.</p>
  <a href="/quickstart" class="btn btn-forge landing-nav-cta">Quickstart</a>
</main>
<footer class="ks-site-footer-region border-top px-4 py-3">
  <a href="/privacy" class="forge-support">Privacy</a>
</footer>
```

## Evidence and remediation

**Evidence:** Playwright `collectNavFocusOrderReport` → `metrics.navFocusOrderReport` with `tabStopCount`, `rtl`, `violations[]` (`kind`, `step`, `deltaY`, `deltaX`, `tabindex`, `fromRegion`, `toRegion`, `fromId`, `toId`), and `handbookFocus` (`hasTopnav`, `suppressedChromeTabCount`). Findings cite `step=N deltaY=…`, `tabindex=N`, or `handbook_chrome_tab_suppressed count=…`.

**Remediate (in order):**

1. **Remove positive tabindex** — delete **`tabindex="1"`** and higher on CTAs, skip links, and dropdown triggers; use DOM order and `:focus-visible` styles instead.
2. **Align DOM with layout** — move **`position-fixed`** or visually elevated controls into the landmark that matches their screen position (masthead **`header.site-header`**, not after **`main`**); avoid **`flex-row-reverse`** on **`fs-primary-nav-global-inner`** and toolbars unless `dir="rtl"`.
3. **Fix vertical inversions** — reorder sidebar (**Ksr**), in-page ToC (**Ktx**), and **`main`** columns so Tab does not jump upward more than **72px** between consecutive stops; check sticky headers and offcanvas (**Kco**) insertion points.
4. **Restore complementary nav tab order** — when using **`tabindex="-1"`** on sidebar or **`.ks-doc-toc-rail`** links, ensure curated top nav lists every section or keep suppressed link count ≤ **16**.
5. **Re-verify after nav refactors** — flattening flyouts (**`DET.NAV.DEPTH`**) and deduplicating chrome (**`DET.NAV.DEDUP`**) can change tab paths; re-run keyboard smoke tests through **`fs-nav-dropdown__trigger`** panels.
6. Re-run `analyze-website-ux.mjs`; for harness fixtures use `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.FOCUS_ORDER` and `node --test auditor-tests/det-nav-focus-order.test.js`.

## Related rules

- `DET.LANDMARKS.REQUIRED` — landmark regions (`header`, `nav`, `main`, `footer`) define the structural bands focus order should traverse.
- `DET.NAV.DEPTH` — flattening deep flyouts changes which controls appear early in the tab sequence.
- `DET.NAV.BREADCRUMB` — **Kbc** trail links participate in focus order when not suppressed from tab order.
- `DET.NAV.IN_PAGE_TOC` — **Ktx** / **`.ks-doc-toc-rail`** anchors must remain reachable when top nav does not duplicate section targets.
- `DET.APP.FOCUS_TRAP` — modals and offcanvas panels must return focus without permanently reordering page-level tab paths.
