---
rule_id: DET.NAV.DEDUP
lane: deterministic
title: Navigation deduplication
summary: Same navigational destination must not repeat across conflicting chrome bands (primary, sidebar, offcanvas) without breadcrumb hierarchy or intentional IA split.
page_version: bcb3250c8589083c2836ce6fe155f56bbcf0c877cc7a16c2052060969f891082
generated_at: 2026-05-25T17:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-dedup
---

## Purpose

Handbook and product shells expose several **navigation bands** outside `main`: **`Kpn`** product primary nav (`nav.fs-primary-nav-global`), handbook doc rail (**`Ksr`**, `aside.forge-sidebar`, `#ks-sidebar-aside`), mobile/offcanvas disclosure (**`Kco`**, `.offcanvas`), optional **`Kbc`** breadcrumb, in-page ToC (**`Ktx`**), and footer utilities. Each band has a distinct job — curated site IA, section tree, mobile collapse, orientation trail — and repeating the same destination in **conflicting** bands creates redundant choice, keyboard noise, and ambiguous “where am I?” signals.

This deterministic rule builds a same-origin link graph from visible anchors in chrome roots **outside `main`**. It normalizes paths (strips `/index.html`, trailing slashes, lowercases hash fragments) and flags two violation kinds:

1. **`duplicate-destination`** — the same pathname appears in **conflicting peer bands**: primary ↔ sidebar, primary ↔ offcanvas, or sidebar ↔ offcanvas.
2. **`duplicate-primary-roots`** — two distinct primary nav roots (for example nested `.site-header nav` trees plus **`Kpn`**) link to the same destination, violating the single masthead horizon in the **Kpn** contract.

**Breadcrumb hierarchy is intentional:** when **`Kbc`** (`nav.ks-doc-breadcrumb`) repeats a destination that also appears in exactly one other chrome band, the duplicate is exempt — the trail orients; the rail navigates. Footer and ToC links are not treated as conflicting peers with primary/sidebar/offcanvas in this check. Skip links, theme toggles, and cookie/consent anchors are ignored.

**Plan:** Map each chrome band’s allowed destinations per layout contract. **Do:** Keep section links in **`Ksr`**, curated top-level IA in **`Kpn`**, and mobile mirrors in offcanvas only when they replace — not duplicate — desktop rails. **Check:** `navDedupReport.violations` is empty. **Adjust:** Remove mirrored handbook trees from the header; collapse competing primary nav roots; use **`Kbc`** for hierarchy instead of copying sidebar hrefs into masthead nav.

## Passing signals

- **`Kpn`** (`nav.fs-primary-nav-global`) carries curated top-level IA (Overview, Trust, Quickstart) while **`Ksr`** (`aside.forge-sidebar`, `#ks-sidebar-aside`) holds the handbook section tree — **no shared pathname** between bands unless **`Kbc`** provides hierarchy.
- Mobile **`.offcanvas`** / `#fsNav` repeats sidebar links **only when** desktop sidebar is hidden at the breakpoint — not simultaneously visible with the same destinations in **`Kpn`** and **`Ksr`**.
- **`Kbc`** may repeat a parent segment (for example `/docs`) while **`Ksr`** holds the same href — auditor treats breadcrumb + one chrome band as intentional hierarchy.
- A single primary nav horizon: one visible **`Kpn`** / `.site-header nav` root outside `main`; no nested masthead inside `main` linking to the same routes.
- Footer utility links (`footer nav`, `.ks-site-footer-region nav`) may repeat destinations without triggering peer-band conflicts (footer is not a conflicting peer).
- Auxiliary controls excluded: skip-to-content, `#main` fragments, theme switchers, and consent links do not pollute the graph.

## Failing signals

- **`duplicate-destination`** with `bands=primary+sidebar` (or `primary+offcanvas`, `sidebar+offcanvas`) — same normalized pathname (for example `/docs/start`) and visible labels like “Getting started” in both **`Kpn`** / `.site-header nav` and **`Ksr`**.
- **`duplicate-primary-roots`** — two primary band roots (different `primaryRootId`) both expose `/platform` or `/docs` (nested site header inside `main` plus global **`Kpn`**).
- Full handbook tree copied into header nav **and** left intact in `.forge-sidebar` — classic handbook IA smell; often co-fails **`DET.CONTEXT.BURDEN`** and **`DET.PAGE.MODE`** on product/home routes.
- Offcanvas panel open on desktop while sidebar and primary both list identical section hrefs.
- Evidence shape: `nav_dedup pathname="/docs" bands=primary+sidebar kind=duplicate-destination labels="Docs | Documentation"`.

## Before example

Failing KS markup: handbook-style shell mirrors `/docs/start` in both `.site-header nav` and **`Ksr`** sidebar — conflicting primary + sidebar bands without breadcrumb exemption.

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content">
      <nav aria-label="Site sections">
        <a href="/docs/start" class="nav-link text-cyan">Getting started</a>
        <a href="/docs/govern" class="nav-link">Governance</a>
      </nav>
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
      <a href="/docs/start" class="nav-link active text-cyan">Getting started</a>
      <a href="/docs/govern" class="nav-link">Governance</a>
    </nav>
  </aside>
  <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
    <div class="forge-card p-3">
      <p class="card-label mb-1">Body</p>
      <p class="forge-support mb-0">Same section links in header nav and doc sidebar — redundant IA.</p>
    </div>
  </main>
</div>
```

## After example

Passing KS markup: **`Kpn`** carries site-level IA; **`Ksr`** owns the handbook tree; **`Kbc`** orients without duplicating conflicting bands.

```html
<nav
  class="fs-primary-nav-global"
  aria-label="Site sections"
  hash="Kpn"
  data-ks-hash="Kpn"
  data-ks-type="chrome-region"
  data-ks-name="product-primary-nav"
>
  <div class="fs-primary-nav-global-inner">
    <a href="/" class="fs-brand text-decoration-none">Forge<span class="fs-accent">SDLC</span></a>
    <a href="/product" class="nav-link">Product</a>
    <a href="/trust" class="nav-link">Trust</a>
    <a href="/docs" class="nav-link">Docs hub</a>
  </div>
</nav>
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content">
      <nav
        class="ks-doc-breadcrumb mb-2"
        aria-label="Breadcrumb"
        hash="Kbc"
        data-ks-hash="Kbc"
        data-ks-type="chrome-region"
        data-ks-name="doc-breadcrumb"
      >
        <ol class="breadcrumb mb-0" style="font-size:0.75rem">
          <li class="breadcrumb-item"><a href="/docs" class="text-cyan" style="text-decoration:none">Docs</a></li>
          <li class="breadcrumb-item active" aria-current="page">Getting started</li>
        </ol>
      </nav>
      <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">Getting started</h1>
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
      <a href="/docs/start" class="nav-link active text-cyan">Getting started</a>
      <a href="/docs/govern" class="nav-link">Governance</a>
    </nav>
  </aside>
  <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4">
    <div class="forge-card p-3">
      <p class="card-label mb-1">Body</p>
      <p class="forge-support mb-0">Primary IA, breadcrumb trail, and sidebar each own distinct destinations.</p>
    </div>
  </main>
</div>
```

## Evidence and remediation

**Evidence:** Metrics phase emits `navDedupReport` with `linkEntryCount` and `violations[]`. Each violation includes `kind` (`duplicate-destination` or `duplicate-primary-roots`), normalized `pathname`, conflicting `bands`, optional `labels`, and `selectorHint` (for example `primary.nav-link` or `sidebar`). Findings use area `informationArchitecture`, severity `warn` (or `major` for competing primary roots), and evidence such as `nav_dedup pathname="/docs/start" bands=primary+sidebar kind=duplicate-destination labels="Getting started | Getting started"`. Capture a viewport screenshot highlighting both nav roots and the duplicated anchor.

**Remediate (in order):**

1. **Split IA by band** — move handbook section links exclusively into **`Ksr`**; keep **`Kpn`** / `.site-header nav` to curated site-level destinations that do not repeat sidebar paths.
2. **Remove nested mastheads** — delete duplicate `.site-header nav` or in-`main` nav trees that compete with **`Kpn`**; enforce one primary horizon per **Kpn** contract.
3. **Fix mobile mirroring** — offcanvas should replace hidden desktop rails at small breakpoints, not stack identical hrefs beside visible sidebar + primary links.
4. **Use breadcrumb for hierarchy** — when a parent segment must appear twice, emit **`Kbc`** so orientation is explicit; do not copy the full sidebar tree into the header strip.
5. **Re-audit** — run `analyze-website-ux.mjs` on handbook hub and product overview URLs; confirm `navDedupReport.violations` is empty. Harness: `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.DEDUP`.

## Related rules

- `DET.NAV.BREADCRUMB` — **`Kbc`** breadcrumb chrome on doc hubs; breadcrumb duplicates exempt conflicting-band checks when hierarchy is intentional.
- `DET.NAV.DEPTH` — caps nested flyout depth in global nav; shallow **`Kpn`** pairs with deep **`Ksr`** trees.
- `DET.CHROME.BOUNDARY` — separated chrome bands; dedup ensures they also do not compete for the same destinations.
- `DET.APP.PERSISTENT_CHROME` — stable shell across routes; persistent nav must not drift into duplicate mirrors per view.
- `DET.PAGE.MODE` — homepage/product mode often co-audited with nav dedup via the `homepage-shell` check bundle.
- `DET.CONTEXT.BURDEN` — quantitative nav-band caps; duplicate destinations inflate cognitive load above the fold.
- `AI.APP.WORKFLOW_CONTINUITY` — subjective orientation when dedup passes but labels still diverge across bands.
