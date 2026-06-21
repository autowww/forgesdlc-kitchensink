---
rule_id: DET.NAV.DEPTH
lane: deterministic
title: Global navigation depth
summary: Global primary nav outside main stays at top level plus one flyout tier (list depth ≤ 2); deeper trees belong in Ksr sidebar, offcanvas, or an explicit mega-menu pattern (≤ 4 tiers).
page_version: b7e94625988e41288d460143e9a3cec75b6b23c9587218a75540c4611a71ae79
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-nav-depth
related_rules:
  - DET.NAV.DEDUP
  - DET.NAV.BREADCRUMB
  - DET.NAV.FOCUS_ORDER
  - DET.CONTEXT.BURDEN
  - DET.PAGE.MODE
  - DET.CHROME.BOUNDARY
---

## Purpose

Curated global navigation (**`Kpn`**, `nav.fs-primary-nav-global`; marketing **`landing-nav`**) must stay shallow so first-time visitors scan one horizon of site IA. Nested flyouts beyond **top level + one tier** force hover chains, obscure keyboard paths, and compete with handbook side rails (**`Ksr`**) that are designed for deep section trees.

This deterministic rule runs during the metrics phase. Playwright evaluates visible nav roots **outside `main`** matching:

- `nav.fs-primary-nav-global`, `[data-ks-hash="Kpn"]`
- `nav.landing-nav`, `header.landing-header .landing-nav`
- `header.site-header nav[aria-label*="Site navigation" i]`

It measures **list depth** — nested `ul`, `ol`, or `[role="menu"]` tiers containing `a[href]` — and applies caps from `det-nav-depth.check.js`:

| Pattern | Max list depth |
|---------|----------------|
| Standard global nav (no mega-menu marker) | **2** |
| Explicit mega-menu (`.fs-mega-menu`, `.fs-mega-nav`, `[data-fs-mega-menu]`, etc.) | **4** |

**Excluded subtrees:** theme preference dropdowns (`.forge-theme-dropdown`, `.forge-theme-menu`, `[data-forge-pref]`) — not primary IA.

**Sidebar / offcanvas doc rails** (`aside.forge-sidebar`, `#ks-sidebar-aside`, `.fs-sidebar`, **Ksr**) are **not** global-nav roots; deep handbook trees there are expected and do not satisfy this rule by themselves if the masthead still nests flyouts.

**Plan:** Audit global chrome selectors and list nesting before shipping HTML. **Do:** Keep **`Kpn`** / **`landing-nav`** to curated top-level links plus at most one **`fs-nav-dropdown`** or Bootstrap `dropdown-menu` tier; relocate handbook depth to **`Ksr`** or mobile **`Kco`** offcanvas. **Check:** `navDepthReport.violations` is empty and `maxListDepth ≤ 2` (or ≤ 4 with mega-menu marker). **Adjust:** Flatten nested `<ul>` flyouts; adopt mega-menu contract only when columnar IA is intentional per **Kpn**.

## Passing signals

- **`Kpn`** (`nav.fs-primary-nav-global`) exposes flat primary links (Overview, Trust, Quickstart) with **zero or one** flyout tier via **`fs-nav-dropdown`** (`data-fs-nav-dropdown`, `.fs-nav-dropdown__trigger`, `.fs-nav-dropdown__panel-inner`) or a single `.dropdown-menu` — `list_depth ≤ 2`.
- **`landing-nav`** on **`landing_page`** / **`marketing_page`** uses horizontal `.landing-nav-link` anchors or one dropdown panel — no nested `<ul>` chains inside the global root.
- Deep section IA lives in **`Ksr`** (`aside.forge-sidebar`, `#ks-sidebar-aside`, `.fs-sidebar`) or **`Kco`** offcanvas (`#fsNav`) — outside the global-nav depth budget.
- When a mega-menu is justified, root includes `.fs-mega-menu` / `[data-fs-mega-menu]` and total list depth stays ≤ **4**.
- Theme / preference menus (`.forge-theme-menu`) do not inflate primary-nav depth metrics.
- Evidence shape: `nav_depth list_depth=2 max=2 mega=no kind=nested-flyout-depth` absent; report shows `maxListDepth` within cap.

## Failing signals

- **`nested-flyout-depth`** — global nav nests `<ul>` inside `<ul>` inside `<ul>` (list depth **3+**) without a mega-menu marker; common smell: full handbook tree copied into **`landing-nav`** or **`Kpn`**.
- **`mega-depth-exceeded`** — mega-menu marker present but list depth **> 4** (column stacks or recursive flyouts still too deep).
- Nested flyouts in `.site-header nav` on showcase/handbook shells when **`Ksr`** already carries the same tree — often co-fails **`DET.NAV.DEDUP`** and **`DET.CONTEXT.BURDEN`**.
- Keyboard/hover traps: third-tier links only reachable through chained `:hover` panels on **`fs-primary-nav-global`**.
- Severity escalates to **major** when depth exceeds cap by more than one tier (`list_depth > max + 1`).
- Evidence shape: `nav_depth list_depth=4 max=2 mega=no kind=nested-flyout-depth hint="nav.landing-nav"`.

## Before example

Failing KS markup: **`landing-nav`** nests four list tiers (handbook-style tree in global chrome) — exceeds the primary-nav budget of **2** without a mega-menu pattern.

```html
<header class="landing-header">
  <div class="landing-header-inner px-3 px-xxl-5">
    <a class="fs-brand text-decoration-none" href="/">Forge<span class="fs-accent">SDLC</span></a>
    <nav class="landing-nav" aria-label="Site navigation">
      <ul class="list-unstyled mb-0 d-flex flex-wrap gap-2">
        <li>
          <a class="landing-nav-link" href="/">Home</a>
          <ul class="list-unstyled mb-0">
            <li>
              <a class="landing-nav-link" href="/docs">Docs</a>
              <ul class="list-unstyled mb-0">
                <li>
                  <a class="landing-nav-link" href="/docs/start">Getting started</a>
                  <ul class="list-unstyled mb-0">
                    <li><a class="landing-nav-link" href="/docs/start/install">Install</a></li>
                    <li><a class="landing-nav-link" href="/docs/start/configure">Configure</a></li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</header>
<main id="main" class="fs-landing-main px-3 px-xxl-5 py-4">
  <p class="forge-support mb-0">Global nav list_depth=4 — auditor flags nested-flyout-depth on nav.landing-nav.</p>
</main>
```

## After example

Passing KS markup: shallow **`Kpn`** with one **`fs-nav-dropdown`** tier; deep handbook links live in **`Ksr`** sidebar (outside global-nav roots).

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
    <a href="/" class="landing-nav-link active">Overview</a>
    <a href="/how-it-works" class="landing-nav-link">How it works</a>
    <a href="/trust" class="landing-nav-link">Trust</a>
    <div class="fs-nav-dropdown" data-fs-nav-dropdown>
      <button type="button" class="fs-nav-dropdown__trigger" aria-expanded="false">Docs</button>
      <div class="fs-nav-dropdown__panel">
        <div class="fs-nav-dropdown__panel-inner">
          <a class="fs-nav-dropdown__link" href="/docs/start">Getting started</a>
          <a class="fs-nav-dropdown__link" href="/docs/govern">Governance</a>
          <a class="fs-nav-dropdown__link" href="/docs/reference">Reference</a>
        </div>
      </div>
    </div>
    <a href="/quickstart" class="landing-nav-link landing-nav-cta btn btn-forge btn-sm">Quickstart</a>
  </div>
</nav>
<div class="container-fluid fs-layout">
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
        <a href="/docs/start" class="nav-link">Getting started</a>
        <a href="/docs/start/install" class="nav-link ps-3">Install</a>
        <a href="/docs/start/configure" class="nav-link ps-3">Configure</a>
        <a href="/docs/govern" class="nav-link">Governance</a>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 fs-main px-4 py-4">
      <p class="forge-support mb-0">Global nav list_depth=2; deep IA in Ksr — passes DET.NAV.DEPTH.</p>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Playwright `collectNavDepthReport` → `metrics.navDepthReport` with `navRootCount`, `maxListDepth`, `hasMegaMenu`, and `violations[]` (`kind`, `listDepth`, `maxAllowed`, `selectorHint`). Findings cite `nav_depth list_depth=N max=M mega=yes|no kind=nested-flyout-depth|mega-depth-exceeded hint="nav.fs-primary-nav-global"`.

**Remediate (in order):**

1. **Flatten masthead flyouts** — remove nested `<ul>` chains from **`Kpn`** / **`landing-nav`**; keep at most one **`fs-nav-dropdown`** or `.dropdown-menu` tier per top-level item.
2. **Relocate handbook trees** — move section links into **`Ksr`** (`aside.forge-sidebar`, `.fs-sidebar`) or **`Kco`** offcanvas; pair with **`Kbc`** breadcrumb for orientation (`DET.NAV.BREADCRUMB`).
3. **Adopt mega-menu deliberately** — when columnar IA is required, add `.fs-mega-menu` / `[data-fs-mega-menu]` per **Kpn** contract and cap column depth at **4** list tiers; do not use mega-menu to hide uncurated link walls.
4. **De-duplicate bands** — if the same deep tree appears in global nav and sidebar, remove the masthead copy (`DET.NAV.DEDUP`).
5. **Verify focus order** — after flattening, re-check keyboard traversal through **`fs-nav-dropdown__trigger`** and panels (`DET.NAV.FOCUS_ORDER`).
6. Re-run `analyze-website-ux.mjs`; for harness fixtures use `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.NAV.DEPTH`.

## Related rules

- `DET.NAV.DEDUP` — same destination must not repeat across conflicting chrome bands; deep trees copied into **`Kpn`** often duplicate **`Ksr`**.
- `DET.NAV.BREADCRUMB` — **`Kbc`** orientation when sidebar depth alone is insufficient on condensed viewports.
- `DET.NAV.FOCUS_ORDER` — flattened flyouts must preserve logical tab order through dropdown triggers and panels.
- `DET.CONTEXT.BURDEN` — shallow global nav reduces pre-main link clusters on landing routes.
- `DET.PAGE.MODE` — marketing/landing shells should not expose handbook-depth trees in the masthead.
- `DET.CHROME.BOUNDARY` — **`Kpn`** stays visually distinct from **`Ksr`** doc rails.
