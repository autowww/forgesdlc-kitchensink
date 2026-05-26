---
rule_id: DET.NAV.IN_PAGE_TOC
lane: deterministic
title: In-page table of contents for long doc pages
summary: Handbook and doc-hub pages expose visible Ktx on-this-page navigation when outline or word count exceeds threshold; every TOC hash link resolves to a heading inside main.
page_version: 73ca82c130c0f8d8ea17f8412cab30621bfb8fabd1924a6a943a3653e9680f47
generated_at: 2026-05-25T20:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-in_page_toc
related_rules:
  - DET.NAV.FOCUS_ORDER
  - DET.NAV.BREADCRUMB
  - DET.NAV.DEPTH
  - DET.NAV.DEDUP
  - DET.SECTION.HEADING
  - DET.LAYOUT.GRID_CONSISTENCY
  - DET.LANDMARKS.REQUIRED
  - AI.CONTEXT.COGNITIVE_CLARITY
---

## Purpose

Long handbook, chapter, product, and showcase pages need a **scannable on-this-page trail** separate from the doc IA rail (**Ksr**, `aside.forge-sidebar`) and global primary nav (**Kpn**). Kitchen Sink contracts **Ktx** — the doc ToC sidebar — as `nav.forge-toc` inside **`.ks-doc-toc-rail`** or **`.col-lg-4.col-xl-3.order-1.order-lg-2`**, listing `h2`/`h3` anchors that skip correctly into **`main#main`**.

This deterministic rule runs during the metrics phase. Playwright collects `navInPageTocReport` from `det-nav-in-page-toc.check.js`. A page **requires** an in-page TOC when it is **not** home and any doc-hub signal is present:

| Doc-hub signal | Detection |
|----------------|-----------|
| Layout slug | **`layout-handbook`**, **`layout-chapter`**, **`layout-product`**, **`layout-showcase`**, **`layout-listing`**, **`layout-gallery`**, or **`layout-split`** on `[data-ks-type="layout"]` |
| Doc sidebar | Visible **`.forge-sidebar`**, **`#ks-sidebar-aside`**, **`.fs-sidebar`**, or **`aside[data-ks-hash="Ksr"]`** |
| Showcase masthead | Visible **`.site-header .site-header-content`** |

**Exempt:** **`layout-landing`**, **`layout-marketing`**, and home (`/`, `/index.html`).

Length threshold (either condition):

- **≥ 4** `h2`/`h3` headings inside **`main`**, or
- **≥ 900** words in **`main`** body text.

A page **passes** when a visible TOC root matches **`.col-lg-4.col-xl-3.order-1.order-lg-2`**, **`[data-ks-hash="Ktx"]`**, **`nav.forge-toc`**, **`nav[aria-label="On this page"]`**, or **`.ks-doc-toc`** with **≥ 2** hash links; every **`href="#…"`** resolves to an element **inside `main`**; and at viewports **≥ 992 px** the rail is at least **140 px** wide with link labels at least **100 px** wide.

**Plan:** Emit Ktx when chapter/handbook layouts exceed length thresholds. **Do:** Use `render_toc_sidebar()` in `components/components.py` or the showcase ToC column in `showcase_page()`. **Check:** `navInPageTocReport.requiresToc && tocPresent && brokenAnchors[]` empty and rail width checks pass. **Adjust:** Add Ktx, fix stale heading ids, and use **`.ks-doc-toc-flow`** grid so the rail is not crushed by Bootstrap column math.

## Passing signals

- **`aside.ks-doc-toc-rail`** with **`hash="Ktx"`**, **`data-ks-hash="Ktx"`**, **`data-ks-type="chrome-region"`**, **`data-ks-name="doc-toc-sidebar"`** wraps **`nav.forge-toc`** with **`aria-label="On this page"`** and **≥ 2** **`a.nav-link[href^="#"]`** entries — matches `render_toc_sidebar()` output.
- Showcase layouts use the **`.col-lg-4.col-xl-3.order-1.order-lg-2`** ToC column with the same **`nav.forge-toc`** pattern from `showcase_page()` in `components/layouts.py`.
- Each TOC link targets a real **`id`** on an **`h2`** or **`h3`** inside **`main#main`**; heading text changes regenerate matching slugs per **`docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`**.
- Long pages inside **`.ks-doc-toc-flow`** place prose in **`.ks-doc-toc-prose`** and the rail in **`.ks-doc-toc-rail`** so link labels wrap instead of clipping (`forge-theme.css` **`minmax(12rem, 16rem)`** rail column).
- Home, landing, and marketing layouts correctly skip the requirement (`requiresToc=false`).
- Short doc pages (**< 4** outline headings and **< 900** words) pass without Ktx even on handbook layouts.
- Evidence shape: `navInPageTocReport.tocPresent=true`, `brokenAnchors=[]`, `tocRailWidthPx ≥ 140`, `minTocLinkWidthPx ≥ 100` at desktop viewport.

## Failing signals

- **`missing_in_page_toc`:** Doc-hub signals fire (`layout:layout-handbook`, `doc-sidebar`, or `showcase-header`) and length threshold is met, but no visible **`nav.forge-toc`**, **`[data-ks-hash="Ktx"]`**, or equivalent ToC root with **≥ 2** hash links — readers scroll a long chapter with no section jump list.
- **`broken_toc_anchor`:** Ktx link uses **`href="#old-slug"`** but the matching **`id`** is missing or lives outside **`main`** after a title edit or generator refactor (`severity: major`).
- **`toc_rail_cramped`:** ToC column renders but rail width **< 140 px** or minimum link width **< 100 px** at **≥ 992 px** viewport — often from nesting **`.ks-doc-toc-rail`** inside Bootstrap **`col-lg-*`** instead of **`.ks-doc-toc-flow`** grid.
- Hidden or inert ToC: node exists but is **`display:none`**, has zero-size bounding box, or fewer than two hash links (placeholder shell).
- Co-failures: headings skip levels or lack stable ids (**`DET.SECTION.HEADING`**); crushed prose+rail layout (**`DET.LAYOUT.GRID_CONSISTENCY`**); complementary nav removed from tab order without top-nav coverage (**`DET.NAV.FOCUS_ORDER`**).
- Evidence shapes: `missing_in_page_toc signals=layout:layout-chapter outline_h=6 main_words=1100`; `broken_toc_anchor href="#setup-guide" target_id="setup-guide"`; `toc_rail_cramped rail_width_px=64 min_link_width_px=64`.

## Before example

Failing KS markup: handbook shell with visible **Ksr** doc sidebar and six **`h2`** sections in **`main`**, but no **Ktx** / **`nav.forge-toc`** rail — triggers **`missing_in_page_toc`**.

```html
<div data-ks-type="layout" data-ks-name="layout-handbook"></div>
<header class="site-header d-none d-lg-block">
  <div class="site-header-content px-4 py-3">
    <h1 class="h4 font-display mb-0">Governance chapter</h1>
  </div>
</header>
<aside
  class="forge-sidebar col-lg-3 d-flex flex-column p-3"
  id="ks-sidebar-aside"
  hash="Ksr"
  data-ks-hash="Ksr"
  data-ks-type="chrome-region"
  data-ks-name="doc-sidebar"
>
  <nav aria-label="Handbook sections">
    <a href="/handbook/governance" class="nav-link active">Governance</a>
    <a href="/handbook/components" class="nav-link">Components</a>
  </nav>
</aside>
<main id="main" class="doc-main px-4 py-4">
  <div class="doc-content w-100">
    <h1 class="font-display">Governance chapter</h1>
    <h2 id="principles" class="font-display mt-4">Design principles</h2>
    <p class="forge-support">Long-form handbook prose that exceeds the configured word threshold without an on-this-page navigation column.</p>
    <h2 id="contracts" class="font-display mt-4">Design contracts</h2>
    <p class="forge-support">Each visual hash maps to an element-specific contract in the design catalog.</p>
    <h2 id="deterministic" class="font-display mt-4">Deterministic checks</h2>
    <p class="forge-support">Repeatable UX issues become automated rules in the website auditor.</p>
    <h2 id="remediation" class="font-display mt-4">Remediation loop</h2>
    <p class="forge-support">Findings feed handbook rule pages and generator fixes.</p>
    <h2 id="evidence" class="font-display mt-4">Evidence trail</h2>
    <p class="forge-support">Screenshots, DOM snapshots, and anchor maps prove pass or fail.</p>
    <h2 id="next-steps" class="font-display mt-4">Next steps</h2>
    <p class="forge-support mb-0">Ship Ktx beside this column so readers can jump sections without scrolling.</p>
  </div>
</main>
```

## After example

Passing KS markup: same long chapter wrapped in **`.ks-doc-toc-flow`** with **Ktx** rail listing every **`h2`** anchor; links resolve to ids inside **`main`**.

```html
<div data-ks-type="layout" data-ks-name="layout-handbook"></div>
<header class="site-header d-none d-lg-block">
  <div class="site-header-content px-4 py-3">
    <h1 class="h4 font-display mb-0">Governance chapter</h1>
  </div>
</header>
<aside
  class="forge-sidebar col-lg-3 d-flex flex-column p-3"
  id="ks-sidebar-aside"
  hash="Ksr"
  data-ks-hash="Ksr"
  data-ks-type="chrome-region"
  data-ks-name="doc-sidebar"
>
  <nav aria-label="Handbook sections">
    <a href="/handbook/governance" class="nav-link active">Governance</a>
    <a href="/handbook/components" class="nav-link">Components</a>
  </nav>
</aside>
<main id="main" class="doc-main px-4 py-4">
  <div class="doc-content w-100 ks-doc-toc-flow">
    <div class="ks-doc-toc-prose">
      <h1 class="font-display">Governance chapter</h1>
      <h2 id="principles" class="font-display mt-4">Design principles</h2>
      <p class="forge-support">Long-form handbook prose with a companion on-this-page navigation rail.</p>
      <h2 id="contracts" class="font-display mt-4">Design contracts</h2>
      <p class="forge-support">Each visual hash maps to an element-specific contract in the design catalog.</p>
      <h2 id="deterministic" class="font-display mt-4">Deterministic checks</h2>
      <p class="forge-support">Repeatable UX issues become automated rules in the website auditor.</p>
      <h2 id="remediation" class="font-display mt-4">Remediation loop</h2>
      <p class="forge-support">Findings feed handbook rule pages and generator fixes.</p>
      <h2 id="evidence" class="font-display mt-4">Evidence trail</h2>
      <p class="forge-support">Screenshots, DOM snapshots, and anchor maps prove pass or fail.</p>
      <h2 id="next-steps" class="font-display mt-4">Next steps</h2>
      <p class="forge-support mb-0">Readers jump directly to the section they need.</p>
    </div>
    <aside
      class="ks-doc-toc-rail"
      hash="Ktx"
      data-ks-hash="Ktx"
      data-ks-type="chrome-region"
      data-ks-name="doc-toc-sidebar"
    >
      <nav class="forge-toc" aria-label="On this page">
        <p class="toc-title mb-2">On this page</p>
        <a class="nav-link" href="#principles">Design principles</a>
        <a class="nav-link" href="#contracts">Design contracts</a>
        <a class="nav-link" href="#deterministic">Deterministic checks</a>
        <a class="nav-link" href="#remediation">Remediation loop</a>
        <a class="nav-link" href="#evidence">Evidence trail</a>
        <a class="nav-link" href="#next-steps">Next steps</a>
      </nav>
    </aside>
  </div>
</main>
```

## Evidence and remediation

1. **Confirm requirement** — inspect `navInPageTocReport.docHubSignals`, `outlineHeadingCount`, and `mainWordCount`; verify the page is not home or a landing layout exempt from Ktx.
2. **Emit Ktx** — call `render_toc_sidebar(toc_entries)` from `components/components.py` or wire the showcase ToC column in `showcase_page()` / `handbook_page()` when outline or word thresholds are met.
3. **Repair broken anchors** — regenerate heading `id` values when titles change; ensure each **`nav.forge-toc .nav-link`** `href` matches an **`h2`/`h3`** inside **`main#main`** (see **`docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`**).
4. **Fix cramped rails** — wrap prose + rail in **`.ks-doc-toc-flow`**, keep measure on **`.ks-doc-toc-prose`**, and avoid stacking Bootstrap **`col-lg-*`** on **`.ks-doc-toc-rail`** so the grid assigns **`minmax(12rem, 16rem)`** width.
5. **Verify** — re-run `node tools/website-ux-auditor/analyze-website-ux.mjs` or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.IN_PAGE_TOC`; expect `tocPresent=true`, empty `brokenAnchors`, and no `toc_rail_cramped` finding.

Typical evidence strings: `missing_in_page_toc signals=doc-sidebar outline_h=6 main_words=1100 expected="nav.forge-toc"`; `broken_toc_anchor href="#old-title" target_id="old-title"`; `toc_rail_cramped rail_width_px=64 min_link_width_px=64`.

## Related rules

- `DET.NAV.FOCUS_ORDER` — **Ktx** links must stay keyboard-reachable when top nav does not duplicate section targets.
- `DET.NAV.BREADCRUMB` — **Kbc** orientation trail complements, not replaces, on-this-page section jumps.
- `DET.NAV.DEPTH` — curated nav depth limits apply to primary rails; Ktx mirrors on-page outline only.
- `DET.NAV.DEDUP` — do not repeat the same destinations across Ktx, Ksr, and Kpn without distinct jobs.
- `DET.SECTION.HEADING` — stable heading ladder and ids feed TOC generation.
- `DET.LAYOUT.GRID_CONSISTENCY` — **`.ks-doc-toc-flow`** keeps prose measure and ToC rail aligned.
- `DET.LANDMARKS.REQUIRED` — **`nav.forge-toc`** inside complementary chrome must not replace **`main`** landmarks.
- `AI.CONTEXT.COGNITIVE_CLARITY` — judgment-heavy review when TOC labels no longer match visible section jobs.
