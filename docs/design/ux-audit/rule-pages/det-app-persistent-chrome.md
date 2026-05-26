---
rule_id: DET.APP.PERSISTENT_CHROME
lane: deterministic
title: Persistent app chrome across routes
summary: When a desktop-interface contract promises a persistent shell, header, nav, aside, and footer regions outside main must stay mounted with stable KS hashes and global link sets across crawled routes.
page_version: 1d09413b2bebf6089bc9f8253fdceea08b04c854b166747b11f65cf8badd4b94
generated_at: 2026-05-19T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-persistent-chrome
---

## Purpose

Kitchen Sink **desktop interfaces** (`data-ks-type="desktop-interface"`, museum studio shell **`Msm`**, Lenses-style operator UIs) often promise a **persistent shell**: chrome stays put while only the workspace pane swaps. Operators rely on that continuity to know where they are and what global actions remain available.

This deterministic rule runs during **route crawl**. For each origin it fingerprints visible shell regions **outside `main`** — `header`, `nav`, `aside`, `footer`, and explicit `[data-shell-region]` roots — using role, stable `id`, `data-ks-hash`, and a sorted link signature from visible anchor text. The first crawled route becomes the baseline; later routes are compared.

Persistence is assumed when any of these signals appear: `data-persistent-chrome="true"`, `data-shell-persistent="true"`, `data-route-contract` containing "persistent", `[data-shell-regions]` / `[data-shell-region]`, `[data-ks-type="desktop-interface"]`, or body classes such as `museum-studio`, `forge-studio`, `ks-app-shell`, or `workspace-lens`.

**Plan:** Crawl two or more routes on the same app origin. **Do:** Mount contracted shell regions outside `main`, reuse the same visual root hash per region, and keep global nav labels/hrefs stable. **Check:** `appPersistentChromeReport.violations` is empty and route crawl finds no `missing-region`, `hash-drift`, or `nav-drift`. **Adjust:** Move route-specific links into `main`; re-mount dropped aside/header roots; align hashes with the design contract.

## Passing signals

- Contract signals (`data-persistent-chrome`, `data-shell-regions`, `data-ks-type="desktop-interface"`) match measurable shell landmarks **outside `main`**.
- `header`, `nav`, and `aside` (or `data-shell-region="header|nav|aside"`) appear on every crawled route with the **same `id`** and **`data-ks-hash`** (for example **`Msm`** on the studio root and stable child hashes where contracted).
- Global navigation link sets are **identical** across routes (same visible labels and href targets in the persistent shell); route-specific actions live inside **`main`**.
- Only **`main`** / `data-shell-region="main"` content changes between routes — workspace cards, wizard panels, diagnostics — not the outer shell anatomy.
- `data-shell-regions="header,nav,main"` (or equivalent) documents which regions are promised persistent for auditors and implementers.

## Failing signals

- **`missing-region`:** Baseline route had `aside#app-nav` (or `nav` outside main) but a later route omits it or moves nav inside `main` so it no longer fingerprints as shell.
- **`nav-drift`:** Primary shell `header` or `nav` link signature changes between routes (for example baseline `home|docs|flow` becomes `back|settings` on a child route).
- **`hash-drift`:** Same contracted shell region (`role` + `id`) carries a different `data-ks-hash` on a later route without an intentional contract update.
- **`promised-no-regions`:** Page declares persistence (`data-persistent-chrome="true"`, desktop-interface type, etc.) but no visible `header` / `nav` / `aside` / `footer` / `data-shell-region` exists outside `main`.
- Full shell remount per route — different header markup, swapped side rails, or duplicate competing nav bands — even when individual landmarks still exist.

## Before example

Failing KS markup: **`/settings`** route rewrites global header links, drops the side session rail, and nests wayfinding inside `main` (baseline **`/flow`** had persistent `header` + `nav` outside main).

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
  data-persistent-chrome="true"
  data-route-contract="persistent-shell"
>
  <header id="app-header" class="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
    <p class="nav-section-label mb-0">Lenses Studio</p>
    <nav class="ms-auto d-flex gap-3">
      <a href="/settings" class="forge-support">Back</a>
      <a href="/settings/advanced" class="forge-support">Advanced</a>
      <a href="/settings/logout" class="forge-support">Sign out</a>
    </nav>
  </header>
  <main id="workspace" class="p-3">
    <nav class="mb-3 d-flex gap-2 flex-wrap" aria-label="Page tabs">
      <a href="/settings/profile" class="btn btn-sm btn-outline-secondary">Profile</a>
      <a href="/settings/tokens" class="btn btn-sm btn-primary">Tokens</a>
      <a href="/settings/notifications" class="btn btn-sm btn-outline-secondary">Notifications</a>
    </nav>
    <div class="forge-card p-3">
      <p class="card-label mb-1">Settings</p>
      <h1 class="h5 mb-2">API tokens</h1>
      <p class="forge-support mb-0">Route-local nav replaced the global shell; aside rail from baseline is gone.</p>
    </div>
  </main>
</div>
```

## After example

Passing KS markup: same **`Msm`** shell on every route — stable `header` + `nav` outside `main`, global links unchanged; only workspace body inside `main` swaps.

```html
<div
  id="root"
  hash="Msm"
  data-ks-hash="Msm"
  data-ks-type="desktop-interface"
  data-ks-name="museum-studio"
  data-persistent-chrome="true"
  data-shell-regions="header,nav,main"
  data-route-contract="persistent-shell"
>
  <header
    id="app-header"
    data-shell-region="header"
    hash="Msm"
    data-ks-hash="Msm"
    class="d-flex align-items-center gap-3 px-3 py-2 border-bottom"
  >
    <p class="nav-section-label mb-0">Lenses Studio</p>
    <nav class="ms-auto d-flex gap-3" aria-label="Global">
      <a href="/" class="forge-support">Home</a>
      <a href="/docs" class="forge-support">Docs</a>
      <a href="/flow" class="forge-support">Flow</a>
      <a href="/settings" class="forge-support">Settings</a>
    </nav>
  </header>
  <div class="d-flex min-vh-100">
    <nav
      id="app-nav"
      data-shell-region="nav"
      class="border-end p-3"
      style="min-width:14rem"
      aria-label="Sessions"
    >
      <p class="nav-section-label">Sessions</p>
      <ul class="ks-wizard-flow__session-list list-unstyled mb-0">
        <li><button type="button" class="ks-wizard-flow__session-item w-100 text-start">Docs health — May 19</button></li>
        <li><button type="button" class="ks-wizard-flow__session-item w-100 text-start">Blueprint wizard — draft</button></li>
      </ul>
    </nav>
    <main id="workspace" data-shell-region="main" class="flex-grow-1 p-3">
      <div class="forge-card p-3">
        <p class="card-label mb-1">Settings</p>
        <h1 class="h5 mb-2">API tokens</h1>
        <p class="forge-support mb-3">Create and rotate tokens for automation jobs.</p>
        <button type="button" class="btn btn-sm btn-primary">Generate token</button>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Route-crawl findings include `appPersistentChromeReport.violations[]` with kinds `missing-region`, `hash-drift`, `nav-drift`, or `promised-no-regions`. Each finding cites `role`, `id`, baseline vs current hash or link signature, crawled URL, and baseline URL. Capture paired screenshots of baseline and failing routes with the same viewport width; highlight header/nav/aside deltas.

**Remediate (in order):**

1. **Restore missing regions** — re-mount contracted `header`, `nav`, `aside`, or `footer` outside `main` on every route; do not tuck global rails into the workspace pane.
2. **Stabilize global nav** — keep the same anchor labels and hrefs in persistent shell; move route-specific tabs and breadcrumbs into `main` (`DET.NAV.DEDUP` / `DET.NAV.BREADCRUMB` as needed).
3. **Fix hash drift** — reuse the same `data-ks-hash` on persistent roots across routes, or update the design contract when shell anatomy intentionally changes.
4. **Emit contract markers** — add `data-shell-regions` and `data-shell-region` on persistent roots when `data-persistent-chrome="true"` so auditors can measure regions (`promised-no-regions` otherwise fires).
5. **Re-crawl** — run `analyze-website-ux.mjs` across at least two app routes on the same origin; confirm violations clear before closing remediation.

## Related rules

- `DET.LANDMARKS.REQUIRED` — app shells expose semantic `header` / `nav` / `main` / `footer` landmarks.
- `DET.CHROME.BOUNDARY` — marketing chrome vs app workspace boundaries stay distinct.
- `DET.NAV.BREADCRUMB` — in-app location trails when hierarchy depth warrants them.
- `DET.NAV.DEDUP` — duplicate nav rails with conflicting destinations.
- `DET.APP.FOCUS_TRAP` — modals and overlays keep keyboard focus until dismissed.
- `AI.APP.WORKFLOW_CONTINUITY` — subjective sense-of-place when panels and routes swap inside a stable shell.
- `AI.APP.DENSITY_BALANCE` — operator density stays governed inside persistent chrome.
