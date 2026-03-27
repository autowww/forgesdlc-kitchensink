# Living background system — current-state audit

This document inventories the Forge kitchensink stack as of implementation and records gaps relative to the **living background / motion** product direction (premium B2B, human-governed agent execution, no literal AI tropes).

## 1. Global atmospheric layers

| Mechanism | Location | Role |
|-----------|----------|------|
| `body::before` dot grid | [`forge-theme.css`](../css/forge-theme.css) | Fixed full-viewport texture, `z-index: -2` |
| `.forge-aurora` | `forge-theme.css`, [`forge-light-theme.css`](../css/forge-light-theme.css) | Top-centered conic blur; `z-index: -1` |
| Theme tokens | `forge-theme.css`, [`forgesdlc-theme.css`](../css/forgesdlc-theme.css) | `--forge-*` (handbook/docs); `--fs-*` (product landing) |

**Gap:** Aurora and dots are CSS-only. There is no shared **SVG field** that scrolls with the document while preserving a single “governed system” read. **Mitigation:** `ks-living-scene` global layer + `living/global/*.svg`.

## 2. Section-local treatment (product landing)

| Mechanism | Location | Role |
|-----------|----------|------|
| `.fs-landing-section::before` | [`forgesdlc-theme.css`](../css/forgesdlc-theme.css) | Radial/linear gradients per `data-fs-section` |
| `.fs-home-section` | Generator HTML in consumer (`landing_sections.py`) | Marketing bands without SVG overlays |

**Gap:** Differentiation is mostly **gradient blobs**, not reusable **rails / traces / frames**. **Mitigation:** `data-ks-living-archetype` + optional `.ks-section-bg` with `data-ks-bg-src` motifs.

## 3. Ambient SVG pipeline

| Piece | Location | Notes |
|-------|----------|------|
| `.ks-ambient-bg`, density/overlay classes | [`ks-animated-backgrounds.css`](../css/ks-animated-backgrounds.css) | Forge tokens; `isolation` |
| `KsAmbientBg` | [`ks-animated-backgrounds.js`](../js/ks-animated-backgrounds.js) | Fetch → inline SVG; SMIL pause/unpause; `prefers-reduced-motion`; `IntersectionObserver` batching |
| Gallery | [`svg_backgrounds.py`](../generator/pages/svg_backgrounds.py), [`svg-background-gallery.js`](../js/svg-background-gallery.js) | Asset preview |

**Gap:** No **scroll- or pointer-driven** scene variables; no **archetype presets** document for generators. **Mitigation:** `ks-living-motion.js`, `assets/motion-presets/living-archetype-presets.json`.

## 4. Asset library (`assets/svg/backgrounds/`)

Existing families: dots, neurons, sinusoids, stars, grids, contours, orbits, signals, etc.

**Brand guardrail:** Folder name **neurons** and titles like “Neurons softmesh” read as **literal neural metaphor** in the showcase. Prefer **field / mesh / network** language in UI labels while keeping geometry abstract.

**Mitigation:** Showcase gallery labels updated to “Field & mesh”; long-term optional rename of on-disk paths (breaking for URLs) can be deferred.

## 5. Layout hooks

| Layout | Hook |
|--------|------|
| `landing_page` | `landing-hero`, `fs-landing-body-shell`, optional footer |
| `showcase_page` / docs | `forge-aurora`, sidebar shell |

**Gap:** No first-class **living scene** slot in `landing_page`. **Mitigation:** `living_background=True` injects `ks-living-scene` + asset links.

## 6. Accessibility & motion

- `@media (prefers-reduced-motion: reduce)` appears in theme CSS and defers/suppresses some motion.
- `KsAmbientBg.prefersReducedMotion()` pauses SMIL after inline.

**Gap:** Any new **rAF scroll/pointer** logic must **mirror** this (no parallax or live SMIL when reduced). **Mitigation:** `ks-living-motion.js` gates all optional motion.

## 7. Consumer asset sync

[`ks_assets.sync_product_site_assets`](../generator/ks_assets.py) copies forge core, `forgesdlc-theme.css`, product JS, and **all** `assets/svg/**/*.svg`. New `living` SVGs are included automatically. **New** `ks-living-background.css` and `ks-living-motion.js` must be added to the copy list explicitly.

---

## Summary

| Area | Status |
|------|--------|
| Atmospheric CSS | Strong baseline |
| Section gradients | Present; limited reusability |
| SVG fetch + SMIL | Production-ready (`KsAmbientBg`) |
| Global SVG field + archetypes | **New** (`living/*`, presets, CSS, JS) |
| Scroll / pointer scene | **New** (CSS variables on `#ks-living-scene`) |
| Showcase / docs | **New** (audit doc, demo page, preset matrix) |
