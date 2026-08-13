---
rule_id: DET.CHROME.BOUNDARY
lane: deterministic
title: Chrome boundary separation
summary: Visible header, footer, and sidebar chrome outside main must separate from the reading canvas via border, distinct background, or box-shadow per chrome-region contracts.
page_version: 0a07923a0bc853e8ed2d43e4e90d5ddb1558122f34d09dfa70847acb1f74cf97
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-chrome-boundary
---

## Purpose

Handbook, product, and app shells use **chrome regions** outside `main` — `site-header`, **`Ksr`** doc rail (`aside.forge-sidebar`), **`Ksf`** footer (`.ks-site-footer-region`), product mastheads (**`Kpn`**), and `[data-shell-region]` roots. Readers must see where chrome ends and the content canvas begins without guessing from whitespace alone.

This deterministic rule samples computed styles on visible chrome roots that sit **outside `main`** and overlap the main column in the viewport. A region **passes** when at least one separation cue is present: a visible **border** on any edge (≥ 0.5px and non-transparent color), a non-zero **box-shadow**, a chrome **background** whose luminance differs from the main canvas by ≥ **0.06**, or a qualifying **`::before` / `::after`** separator (border, shadow, or filled pseudo). Cues must match the chrome-region design contract (**Ksr**, **Ksf**, **Kpn**, etc.).

**Plan:** Identify contracted chrome roots per layout. **Do:** Apply KS tokens (`var(--forge-border)`, `var(--forge-bg)` elevation) on the edge facing `main`. **Check:** `chromeBoundaryReport.violations` is empty. **Adjust:** Add `border-right` on `.forge-sidebar`, `border-bottom` on `.site-header`, or `border-top` on `.ks-site-footer-region` before weakening contrast.

## Passing signals

- **`aside.forge-sidebar`** (**Ksr**) shows `border-right: 1px solid var(--forge-border)` (theme default) or an equivalent contract-aligned edge facing `main`.
- **`.site-header`** carries `border-bottom` (showcase/handbook CSS) so the masthead band separates from `.doc-main` / `main`.
- **`.ks-site-footer-region`** (**Ksf**) uses a top border or distinct footer background so closing utilities do not bleed into the last `main` section.
- Chrome background luminance differs from the effective `main` canvas by ≥ **0.06** when borders are omitted by design (for example a raised app header panel).
- **`::after` / `::before`** pseudo separators on chrome roots register as cues when they draw a visible edge (`.forge-sidebar::after` texture is additive; the rail still needs a real boundary cue on the element or pseudo).
- Modals, offcanvas drawers, cookie banners, and elements inside `main` are **out of scope** — only persistent shell chrome is measured.

## Failing signals

- **`missing-boundary`:** A visible `header`, `footer`, `aside.forge-sidebar`, `.site-header`, `.landing-header`, `.ks-site-footer-region`, or `[data-shell-region]` outside `main` overlaps the main column but reports `cuesFound: none`.
- Chrome and `main` share the same flat `var(--forge-bg)` with **no** border, shadow, or luminance delta — sidebar and reading column look like one surface.
- Inline overrides such as `border-right: none` / `border-bottom: none` on contracted rails remove all measurable cues.
- Footer band flush with the last paragraph block — no top edge or background step before **Ksf** links.
- Relying on text color alone without a structural separator on the chrome root (typography contrast does not count).

## Before example

Failing KS markup: handbook-style shell with **Ksr** / **Ksf** hashes present but borders stripped and chrome background matched to `main` — auditor finds no border, shadow, or background cue.

```html
<div class="container-fluid">
  <header class="site-header d-none d-lg-block" style="border-bottom: none; background: var(--forge-bg);">
    <div class="row g-0">
      <div class="col-lg-3 col-xl-2 site-header-brand" style="border-right: none;">
        <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge</span></p>
      </div>
      <div class="col-lg-9 col-xl-10 site-header-content">
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
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      style="border-right: none; background: var(--forge-bg);"
    >
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Sections">
        <p class="nav-section-label">Handbook</p>
        <a href="/docs/start" class="nav-link active">Getting started</a>
        <a href="/docs/govern" class="nav-link">Governance</a>
      </nav>
    </aside>
    <main id="main" class="doc-main col-lg-9 col-xl-10 px-4 py-4" style="background: var(--forge-bg);">
      <div class="forge-card p-3">
        <p class="card-label mb-1">Body</p>
        <p class="forge-support mb-0">Sidebar and header visually merge with main — no measurable boundary.</p>
      </div>
    </main>
  </div>
  <div
    hash="Ksf"
    data-ks-hash="Ksf"
    data-ks-type="chrome-region"
    data-ks-name="site-footer"
    class="ks-site-footer-region py-4"
    style="border-top: none; background: var(--forge-bg);"
  >
    <p class="forge-support mb-0 text-center">© Forge — footer band indistinguishable from main.</p>
  </div>
</div>
```

## After example

Passing KS markup: same handbook anatomy with contract-aligned separators — theme `.forge-sidebar` border, `.site-header` bottom edge, **Ksf** top rule.

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
        <p class="forge-support mb-0">Chrome edges are visible; reading column stays clearly inside main.</p>
      </div>
    </main>
  </div>
  <div
    hash="Ksf"
    data-ks-hash="Ksf"
    data-ks-type="chrome-region"
    data-ks-name="site-footer"
    class="ks-site-footer-region border-top py-4 mt-4"
    style="border-color: var(--forge-border);"
  >
    <div class="row">
      <div class="col-md-6">
        <p class="forge-support mb-0">Docs</p>
      </div>
      <div class="col-md-6 text-md-end">
        <p class="forge-support mb-0">© Forge</p>
      </div>
    </div>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics phase emits `chromeBoundaryReport` with `chromeRegionCount` and `violations[]` (`kind: missing-boundary`, `role`, `selectorHint`, `cuesFound: none`). Findings use area `informationArchitecture`, severity `warn`, and evidence such as `missing_chrome_boundary role=sidebar hint="aside.forge-sidebar[@Ksr]" cues=none`. Capture a full-viewport screenshot with devtools highlighting the chrome root and computed border/background on the edge facing `main`.

**Remediate (in order):**

1. **Restore the contract edge** — re-enable `border-right` on `.forge-sidebar`, `border-bottom` on `.site-header`, or `border-top` on `.ks-site-footer-region` using `var(--forge-border)`; remove inline `border-*: none` overrides.
2. **Use a distinct chrome background token** — when borders are intentionally minimal, set a chrome surface token with ≥ **0.06** luminance delta from the `main` canvas (do not match `var(--forge-bg)` on both sides without another cue).
3. **Add a subtle shadow last** — prefer borders/tokens first; use a sanctioned `box-shadow` only when the design contract allows elevation instead of a hairline.
4. **Update the design contract** — if anatomy changes, revise **Ksr** / **Ksf** / **Kpn** expected-look and re-run showcase build so hashes and contracts stay aligned.
5. **Re-audit** — run `analyze-website-ux.mjs` on representative handbook and product URLs; confirm `chromeBoundaryReport.violations` is empty.

## Related rules

- `DET.LANDMARKS.REQUIRED` — chrome roots are semantic `header` / `aside` / `footer` landmarks outside `main`.
- `DET.LAYOUT.GRID_CONSISTENCY` — gutters and max-width align; boundaries complement grid discipline.
- `DET.APP.PERSISTENT_CHROME` — app shells keep the same chrome regions across routes; this rule checks they visually separate from workspace content.
- `DET.NAV.BREADCRUMB` — orientation chrome stays lighter than primary rails (**Kbc** vs **Ksr**).
- `DET.NAV.DEDUP` — multiple nav bands must not fight for the same visual band without hierarchy.
- `AI.APP.WORKFLOW_CONTINUITY` — subjective sense-of-place when panels swap inside a separated shell.
- `AI.VISUAL.HIERARCHY` — judgment when separation exists but hierarchy still feels flat.
