---
rule_id: DET.SURFACE.ELEVATION_TOKEN
lane: deterministic
title: Surface elevation tokens
summary: Elevated Kitchen Sink surfaces (cards, glass panels, dialogs, dropdowns) must use sanctioned theme elevation custom properties in box-shadow—not ad-hoc rgba shadow literals on surface selectors or inline styles.
page_version: dfa0e32571642394bbf6b082920b949482c55bdf097e4c8f459a64ffbb92d23b
generated_at: 2026-05-29T18:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-surface-elevation_token
related_rules:
  - DET.TOKEN.NO_DRIFT
  - DET.THEME.CONTRAST_MIN
  - DET.CARD.TITLE
  - AI.PREMIUM.ENTERPRISE_FEEL
  - AI.THEME.PERSONALITY_COHERENCE
---

## Purpose

Elevated Kitchen Sink surfaces—**`.forge-card`**, **`.glass`** / **`.glass-amber`**, modals, **`.ks-nrm-dialog`**, dropdowns, popovers, and other panel shells—communicate depth and hierarchy through **box-shadow**. When each feature stylesheet or inline `style` invents its own `rgba(...)` stack, elevation drifts across pages: cards feel heavier than dialogs, glass hover glows disagree with theme packs, and remediation cannot target a single token source.

This deterministic rule enforces that **box-shadow on surface selectors** references **sanctioned theme custom properties** via `var(...)`, not raw multi-layer shadow literals outside theme packs.

**Sanctioned `var()` prefixes** (any layer may use these):

- `--forge-glow-` (e.g. `var(--forge-glow-cyan)`, `var(--forge-glow-amber)`)
- `--forge-` (e.g. `var(--forge-elevation-modal)`, `var(--forge-elevation-dropdown)`, `var(--forge-elevation-panel)`)
- `--ks-`
- `--bs-` (Bootstrap focus rings where applicable)
- `--le-surface`

**Surface selectors** matched in CSS and live DOM include: `card`, `forge-card`, `modal`, `dialog`, `popover`, `offcanvas`, `dropdown-menu`, `tooltip`, `tile-panel`, `ks-nrm-dialog`, `ks-tile-panel`, `panel`, `surface`, `[data-card]`, and `.ks-*` classes ending in `dialog`, `panel`, `popover`, or `surface`. Inner card anatomy (**`.card-title`**, **`.card-header`**, **`.card-body`**, etc.) is excluded so title rows are not treated as elevation surfaces.

**Theme packs** (`forge-theme.css`, `docs-theme.css`, `forgesdlc-theme.css`, pack CSS, and related basenames) may define raw shadow values as **token sources**. The repo scan walks **`css/*.css` feature files** only—skipping those pack files. **Border-ring** layers (`0 0 0 Npx …`) and **zero/no-op** layers are ignored. Declarations inside **`@keyframes`** are excluded.

**Severity:** `warn` (default). **Cap:** 12 findings per audit pass (`MAX_SURFACE_ELEVATION_FINDINGS`).

## Passing signals

- **`.forge-card`** and **`.forge-card.card-amber:hover`** use theme tokens such as `box-shadow: var(--forge-glow-amber)` defined in `css/forge-theme.css`, not feature-local rgba stacks on `.forge-card`.
- **`.glass`** / **`.glass-amber:hover`** rely on `var(--forge-glow-cyan)` / `var(--forge-glow-amber)` from the theme pack; markup does not add inline `box-shadow`.
- **`.ks-nrm-dialog`** in `css/nested-roadmap.css` uses `box-shadow: var(--forge-elevation-modal)` with no inline override on the dialog root.
- Dropdowns, modals, and panels reference **`--forge-elevation-*`** or other sanctioned prefixes in stylesheets that target surface selectors.
- Multi-layer shadows split on commas are valid when **every** layer is sanctioned, uses a border-ring substitute, or is a zero layer.
- `metrics.surfaceElevationReport.violations` is empty after crawl; repo scan (`scanRepoSurfaceElevation`) reports no raw shadows on surface rules in non-pack CSS.

## Failing signals

- **Inline** `style="box-shadow:0 24px 80px rgba(0,0,0,0.55)"` on a visible **`.forge-card`**, **`.glass`**, or dialog root (`kind: inline-raw-box-shadow`, `selectorHint` with tag/classes/hash).
- Feature CSS such as `css/nested-roadmap.css` or page-specific sheets declaring **raw rgba box-shadow** on `.forge-card`, `.glass`, `.ks-nrm-dialog`, `.modal`, `[data-card]`, or `.panel` selectors (`kind: raw-box-shadow` with `path` + `selector`).
- Shadows using `var(--custom-shadow)` where the custom property name does **not** start with a sanctioned prefix.
- Auditors emit up to **12** warnings per pass with evidence `raw_surface_box_shadow` and message: *An elevated surface uses a raw box-shadow instead of a sanctioned elevation token*.
- **Not flagged:** raw shadows inside theme pack basenames; border rings; keyframe animations; non-surface selectors (e.g. **`.card-label`** only).

## Before example

Failing KS markup: static **`.forge-card`** with an ad-hoc deep shadow inline—bypasses `--forge-glow-*` and `--forge-elevation-*` tokens.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="row g-3">
    <div class="col-md-6">
      <div
        class="forge-card breathe-static p-3"
        style="box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55)"
        hash="KCt"
        data-ks-hash="KCt"
        data-ks-type="component"
        data-ks-name="elevation-inline-fail"
      >
        <p class="card-label">Outcome</p>
        <h5 class="mt-2 mb-1">Ad-hoc elevation</h5>
        <p class="forge-support mb-0">
          Inline rgba shadow on the card root triggers DET.SURFACE.ELEVATION_TOKEN.
        </p>
      </div>
    </div>
  </div>
</main>
```

## After example

Passing KS markup: **`.glass`** panel inherits hover elevation from `forge-theme.css`—no inline `box-shadow`.

```html
<main id="main" class="doc-main px-4 py-4">
  <div class="row g-3">
    <div class="col-md-4">
      <div class="glass p-3">
        <p class="section-label text-cyan mb-1">Glass</p>
        <p class="mb-0 forge-support">Cyan hover glow from var(--forge-glow-cyan) in theme CSS.</p>
      </div>
    </div>
    <div class="col-md-4">
      <div class="glass-amber p-3">
        <p class="section-label text-amber mb-1">Glass amber</p>
        <p class="mb-0 forge-support">Amber accent via theme tokens only.</p>
      </div>
    </div>
    <div class="col-md-4">
      <div class="forge-card breathe-static p-3">
        <p class="card-label">Static</p>
        <h5 class="mt-2 mb-1">Token-backed card</h5>
        <p class="forge-support mb-0">Default card surface; hover glow comes from theme rules when applicable.</p>
      </div>
    </div>
  </div>
</main>
```

Passing dialog shell (**`.ks-nrm-dialog`**) with hash governance and modal elevation token in stylesheet:

```html
<div
  class="ks-nrm-dialog"
  role="dialog"
  aria-modal="true"
  aria-labelledby="nrm-dialog-title"
  hash="Nrm"
  data-ks-hash="Nrm"
  data-ks-type="component"
  data-ks-name="nested-roadmap-dialog"
>
  <div class="ks-nrm-dialog__head">
    <h2 id="nrm-dialog-title" class="ks-nrm-dialog__title">Roadmap detail</h2>
    <button type="button" class="ks-nrm-dialog__close" aria-label="Close">
      <span class="ks-nrm-dialog__close-icon" aria-hidden="true"></span>
    </button>
  </div>
  <div class="ks-nrm-dialog__body">
    <p class="forge-support mb-0">Elevation from var(--forge-elevation-modal) in nested-roadmap.css—not inline shadow.</p>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Browser metrics `surfaceElevationReport.violations[]` with `kind` (`inline-raw-box-shadow`, `stylesheet-raw-box-shadow`, or `raw-box-shadow` from repo scan), `selector` / `selectorHint`, `path` (stylesheet basename or CSS rel path), and truncated `value`. Findings use **warn** severity, area `readability`, and evidence prefix `raw_surface_box_shadow` plus `path=`, `selector="…"`, `value="…"`, and page `url=` when available.

**Remediate (in order):**

1. **Remove inline `box-shadow`** from surface roots; let theme CSS apply elevation.
2. In **`css/forge-theme.css`** (or the active theme pack), define or reuse a custom property—e.g. `--forge-elevation-panel`, `--forge-glow-cyan`—with the raw rgba stack as the **token source** only.
3. In feature CSS (e.g. `css/nested-roadmap.css`), set `box-shadow: var(--forge-elevation-modal)` on **`.ks-nrm-dialog`**, `var(--forge-glow-cyan)` on **`.glass:hover`**, etc.
4. If a new elevation level is needed site-wide, add a **`--forge-elevation-*`** or **`--ks-*`** variable in the theme pack, then reference it on surface selectors—do not copy rgba literals into feature files.
5. Re-run `generator/build_rule_defect_fixtures.py` and `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SURFACE.ELEVATION_TOKEN` for harness closure.
6. Pair with **`DET.TOKEN.NO_DRIFT`** when fixing adjacent raw color/spacing literals in the same stylesheet.

## Related rules

- `DET.TOKEN.NO_DRIFT` — prevents raw hex/rgba drift for colors and spacing outside sanctioned tokens.
- `DET.THEME.CONTRAST_MIN` — ensures token-backed text/background pairs remain readable on elevated surfaces.
- `DET.CARD.TITLE` — named card anatomy on `.forge-card` tiles that often share elevation with this rule.
- `AI.PREMIUM.ENTERPRISE_FEEL` — subjective judgment that depth, glow, and panel rhythm feel calm and enterprise-grade once tokens are consistent.
- `AI.THEME.PERSONALITY_COHERENCE` — subjective check that cyan/amber glow and modal elevation match the active theme personality.
