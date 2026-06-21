---
rule_id: DET.SCREENSHOT.STATUS
lane: deterministic
title: Visual catalog screenshot status
summary: Registry screenshot_status must match on-disk catalog PNGs; captured rows need screenshot_url; planned, missing, and blocked rows must document why.
page_version: 3df32ff59b36c63479998b1321ecdfed89c1da25b9dd2f3ce5cdbd800f328448
generated_at: 2026-05-29T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-screenshot-status
related_rules:
  - DET.CONTRACT.PATH
  - DET.CATALOG.CONTRACT_SPECIFICITY
  - DET.HASH.MARKERS
  - DET.HASH.REGISTRY_ROW
  - DET.INVENTORY.CROSSWALK
  - AI.CONTRACT.IMPLEMENTATION_USEFULNESS
---

## Purpose

Kitchen Sink maintains a **visual screenshot manifest** alongside the design catalog. Each registry row in `docs/design/catalog/visual-registry.yaml` (emitted to `visual-registry.generated.json`) carries `screenshot_status`, optional `screenshot_url`, `screenshot_reason`, and `notes`. Auditors, contracts, and handbook pages rely on that manifest to know whether a canonical desktop PNG exists at `docs/design/catalog/screenshots/{HASH}.png`, is hosted at `https://ks.forgesdlc.com/showcase/screenshots/{HASH}.png`, or is intentionally deferred.

**`DET.SCREENSHOT.STATUS`** is a **repo-wide** deterministic check in the **metrics** phase (`scanScreenshotStatus` in `design-rules/deterministic/generated/det-screenshot-status.check.js`). It does not judge page layout from DOM alone; it crosswalks registry rows against files on disk and documentation fields. Consumer HTML can look correct while the catalog still lies about capture state.

**Plan:** When a governed surface's canonical look changes, decide whether to capture, defer, or block before merging. **Do:** Run `python3 generator/build-showcase.py`, then `node tools/design-catalog/capture-showcase-screenshots.mjs --repo . --serve-showcase --update-registry` (or set an honest non-`captured` status with `screenshot_reason`). **Check:** `node tools/design-catalog/check-visual-catalog.mjs --repo .` and confirm `screenshotStatusReport.issues` is empty. **Adjust:** Commit missing PNGs, fix `screenshot_url`, or document blocked/planned rows — do not leave `screenshot_status: captured` without `docs/design/catalog/screenshots/Hbk.png` on disk.

## Passing signals

- `screenshot_status` is one of `planned`, `captured`, `missing`, `blocked`, or `not-applicable` per `docs/design/catalog/README.md`.
- Rows with **`captured`** have `docs/design/catalog/screenshots/{HASH}.png` present (for example `Hbk.png` for handbook layout **Hbk**) and a non-empty `screenshot_url` (typically `https://ks.forgesdlc.com/showcase/screenshots/Hbk.png`).
- Rows with **`planned`**, **`missing`**, or **`blocked`** include at least one of `screenshot_url`, non-empty `notes`, or `screenshot_reason` (for example **Kra** blocked with reason that the React showcase app is not a single static HTML root for Playwright).
- `scanScreenshotStatus` returns `{ skipped: false, issues: [] }` after regenerating registry JSON from YAML.
- Showcase pages such as `showcase/preview-handbook.html` still emit valid **Hbk** / **Ksr** / **Ksf** hash markers; screenshot governance is independent of **`DET.HASH.MARKERS`** pass/fail on a crawl.
- `not-applicable` rows are not required to carry capture documentation unless policy changes.

## Failing signals

- **`captured-missing-png` (warn):** Registry marks **Hbk** `screenshot_status: captured` but `docs/design/catalog/screenshots/Hbk.png` is absent after a local clone (common when YAML was updated without running capture or committing PNGs).
- **`captured-missing-url` (minor):** Status is `captured` but `screenshot_url` is empty — auditors cannot link contracts or rule pages to the hosted reference image.
- **`undocumented-status` (minor):** `screenshot_status: planned` | `missing` | `blocked` with no `screenshot_url`, `notes`, or `screenshot_reason` — reviewers cannot tell why capture was skipped.
- **`unknown-status` (minor):** Typo or legacy value outside the allowed set (for example `screenshot_status: pending`).
- Findings cap at **`MAX_SCREENSHOT_STATUS_FINDINGS` (12)** per pass with a trailing "additional issues omitted" finding when many rows break at once.
- `screenshotStatusReport.skipped: true` with `reason: no-registry` — regenerate `visual-registry.generated.json` before interpreting pass/fail on consumer sites.
- Passing **`DET.HASH.MARKERS`** or **`DET.CONTRACT.PATH`** on built HTML does **not** clear this rule if the manifest still claims a capture that does not exist.

## Before example

Failing governance: **Hbk** handbook shell HTML matches `showcase/preview-handbook.html`, but the registry row still says `screenshot_status: captured` while `docs/design/catalog/screenshots/Hbk.png` was never committed (and `screenshot_url` is empty). `DET.SCREENSHOT.STATUS` reports `captured-missing-png` and optionally `captured-missing-url`; DOM checks may still pass.

```html
<div
  class="container-fluid px-0"
  hash="Hbk"
  data-ks-hash="Hbk"
  data-ks-type="layout"
  data-ks-name="layout-handbook"
>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      style="min-height:100vh;position:sticky;top:0;overflow-y:auto;align-self:flex-start;max-height:100vh"
    >
      <div class="px-3 py-3" style="border-bottom:1px solid var(--forge-border)">
        <p class="forge-brand mb-0">
          <span class="brand-icon">F</span>
          <span class="text-amber">Forge SDLC</span>
        </p>
        <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
      </div>
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0">Showcase HTML is correct; catalog claims captured PNG that is not on disk.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Screenshot manifest</p>
          <p class="forge-support mb-0">Registry: screenshot_status=captured, screenshot_url unset, docs/design/catalog/screenshots/Hbk.png missing.</p>
        </div>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">Footer chrome — separate Ksf row must also satisfy screenshot policy.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing governance: same **Hbk** / **Ksr** / **Ksf** handbook shell. Registry row aligns with manifest files: `screenshot_status: captured`, `screenshot_url: https://ks.forgesdlc.com/showcase/screenshots/Hbk.png`, and `docs/design/catalog/screenshots/Hbk.png` committed (capture via `capture-showcase-screenshots.mjs`). Surfaces that cannot be captured statically (for example **Kra** React app) use `screenshot_status: blocked` with `screenshot_reason` instead of false `captured`.

```html
<div
  class="container-fluid px-0"
  hash="Hbk"
  data-ks-hash="Hbk"
  data-ks-type="layout"
  data-ks-name="layout-handbook"
>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      style="min-height:100vh;position:sticky;top:0;overflow-y:auto;align-self:flex-start;max-height:100vh"
    >
      <div class="px-3 py-3" style="border-bottom:1px solid var(--forge-border)">
        <p class="forge-brand mb-0">
          <span class="brand-icon">F</span>
          <span class="text-amber">Forge SDLC</span>
        </p>
        <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
      </div>
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0">Showcase HTML matches catalog; Hbk PNG and screenshot_url are aligned.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Screenshot manifest</p>
          <p class="forge-support mb-0">Registry: screenshot_status=captured, screenshot_url=https://ks.forgesdlc.com/showcase/screenshots/Hbk.png, docs/design/catalog/screenshots/Hbk.png present.</p>
        </div>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">Footer chrome — Ksf registry row follows the same screenshot_status policy.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics phase stores `screenshotStatusReport` with `skipped`, `issues[]` (`kind: captured-missing-png | captured-missing-url | undocumented-status | unknown-status`, `hash`, `screenshotStatus`, optional `catalogPng` rel path). Findings use area **`visual-catalog`**, default severity **`warn`** for missing PNGs and **`minor`** for URL/documentation gaps. Attach the registry row from `visual-registry.yaml`, `ls docs/design/catalog/screenshots/{HASH}.png`, and the `screenshotStatusReport` slice from `analyze-website-ux.mjs` or `check-visual-catalog.mjs`.

**Remediate (in order):**

1. **Regenerate registry JSON** — emit `visual-registry.generated.json` from YAML before auditing consumer trees (`screenshotStatusReport.skipped: no-registry` otherwise).
2. **Capture or correct status** — for static showcase roots, run `python3 generator/build-showcase.py`, then `node tools/design-catalog/capture-showcase-screenshots.mjs --repo . --serve-showcase --update-registry`; commit `docs/design/catalog/screenshots/{HASH}.png` and set `screenshot_url` to the hosted showcase path.
3. **Document deferrals** — set `screenshot_status` to `planned`, `missing`, or `blocked` with `screenshot_reason`, `notes`, or `screenshot_url`; never use `captured` without on-disk PNG and URL.
4. **Fix unknown values** — replace legacy tokens (for example `pending`) with an allowed status from `docs/design/catalog/README.md`.
5. **Re-check** — `node tools/design-catalog/check-visual-catalog.mjs --repo .` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SCREENSHOT.STATUS`; confirm `issues` is empty before relying on DOM-only passes.

Module: `design-rules/deterministic/generated/det-screenshot-status.check.js` (auditor package). Finding cap **`MAX_SCREENSHOT_STATUS_FINDINGS` (12)** per pass.

## Related rules

- `DET.CONTRACT.PATH` — registry `contract` path resolves on disk; orthogonal to screenshot manifest truth.
- `DET.CATALOG.CONTRACT_SPECIFICITY` — contracts should cite screenshot references when `screenshot_status: captured`.
- `DET.HASH.MARKERS` — governed roots emit paired `hash` / `data-ks-hash`; HTML can pass while manifest lies.
- `DET.HASH.REGISTRY_ROW` — hash exists in registry with expected `type` before screenshot rows are meaningful.
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes ⊆ registry inventory.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — contracts should link hosted screenshots when capture is claimed.
