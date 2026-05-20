---
rule_id: DET.AMBIENT.Z_INDEX
lane: deterministic
title: Ambient layer z-index contract
summary: Decorative ambient SVG, canvas, and living-background planes must sit below interactive content with pointer-events disabled on non-interactive layers.
page_version: c85b9d27a8f29b758a41bb53c76bfb4ec754f10bf5d2ec9e8eafeebd799ea335
generated_at: 2026-05-19T18:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ambient-z-index
related_rules:
  - AI.AMBIENT.READABILITY_CONFLICT
  - DET.MOTION.PREFERS_REDUCED
  - AI.MOTION.INTENTIONALITY
---

## Purpose

Kitchen Sink ships two ambient systems that share a **stacking contract**:

- **Forge ambient** — `.forge-ambient` with `.forge-ambient-bg`, optional `.forge-ambient-scrim`, and `.forge-ambient-content` (`css/forge-ambient.css`).
- **Animated backgrounds** — `.ks-has-ambient-bg` with `.ks-ambient-bg`, `.ks-ambient-bg-overlay`, and `.ks-content` (`css/ks-animated-backgrounds.css`).
- **Living background** — `#ks-living-scene` / `.ks-living-scene` and section-local `.ks-living-section` bands (`css/ks-living-background.css`).

The contract is **bg at z-index 0**, **scrim/overlay at z-index 1**, **foreground content at z-index 2**, and **`pointer-events: none`** on every decorative plane. Ambient layers must never intercept clicks, cover CTAs, or stack above prose and controls.

This deterministic rule samples computed styles in Playwright and flags stack inversions, elevated ambient z-index, and interactive canvases inside ambient containers.

**Plan:** Identify pages with ambient markup on the first screen. **Do:** Use KS slot classes and avoid inline z-index overrides on bg/canvas layers. **Check:** Run the auditor metrics phase or inspect computed `z-index` and `pointer-events` in DevTools. **Adjust:** Move drawing surfaces into the bg slot and wrap interactive UI in `.forge-ambient-content` or `.ks-content`.

## Passing signals

- `.forge-ambient-bg` / `.ks-ambient-bg` (including `.ks-section-bg.ks-ambient-bg` and `.ks-living-scene__global.ks-ambient-bg`) report **z-index 0–1** and **`pointer-events: none`**.
- Foreground copy and controls live in **`.forge-ambient-content`** or **`.ks-content`** with **z-index ≥ 2** (or `.container` / `.container-fluid` direct children of `.ks-living-section` at z-index 1 when the section bg is 0).
- Optional scrims use **`.forge-ambient-scrim`** or **`.ks-ambient-bg-overlay`** at z-index 1, also with `pointer-events: none`.
- **`#ks-living-scene`** / **`.ks-living-scene`** stays at **z-index 0** with **`pointer-events: none`** so the global parallax field never blocks the page.
- `<canvas>` elements inside `.forge-ambient`, `.ks-has-ambient-bg`, or `.ks-living-scene` sit in the bg slot at z-index 0 with `pointer-events: none`, or are omitted in favor of SVG loaded via `data-ks-bg-src`.

## Failing signals

- Ambient bg/canvas **`z-index > 1`** (for example inline `style="z-index: 5"` on `.forge-ambient-bg`).
- **`pointer-events: auto`** (or unset on an absolutely positioned canvas/SVG) on a decorative layer that overlaps buttons or links.
- **Stack inversion:** ambient layer z-index **≥ content wrapper** z-index inside the same `.forge-ambient` / `.ks-has-ambient-bg` / `.ks-living-section` container.
- Hero markup places headings and CTAs in a bare `<div>` while a canvas or bg layer sits above them in paint order.
- `.ks-living-scene` with **`z-index > 0`** or **`pointer-events` other than `none`**, blocking interaction with the document below.

## Before example

Failing KS markup: canvas and ambient bg elevated above prose; no content wrapper; pointer events enabled on decorative layers.

```html
<section
  class="forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--hero forge-ambient--on-dark"
  hash="KEm"
  data-ks-hash="KEm"
  data-ks-type="visual-style"
  data-ks-name="ambient-z-fail"
>
  <canvas
    id="hero-particles"
    style="position:absolute;inset:0;z-index:3;pointer-events:auto"
    aria-hidden="true"
  ></canvas>
  <div
    class="forge-ambient-bg ks-ambient-bg"
    style="z-index:2;pointer-events:auto"
    data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg"
    aria-hidden="true"
  ></div>
  <div class="py-5">
    <h1 class="h2 mb-3">Governed agent delivery</h1>
    <p class="forge-support mb-4">Clicks may hit the canvas or SVG instead of the button below.</p>
    <button type="button" class="btn btn-primary">Start the methodology tour</button>
  </div>
</section>
```

## After example

Passing KS markup: canonical Forge ambient slots — bg 0, scrim 1, content 2 — with no pointer capture on decorative planes.

```html
<section
  class="forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--medium forge-ambient--on-dark"
  hash="KEm"
  data-ks-hash="KEm"
  data-ks-type="visual-style"
  data-ks-name="ambient-z-pass"
>
  <div
    class="forge-ambient-bg ks-ambient-bg"
    data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg"
    aria-hidden="true"
  ></div>
  <div class="forge-ambient-scrim" aria-hidden="true"></div>
  <div class="forge-ambient-content py-5">
    <h1 class="h2 mb-3">Governed agent delivery</h1>
    <p class="forge-support mb-4">Ambient stays behind scrim and content; controls remain clickable.</p>
    <button type="button" class="btn btn-primary">Start the methodology tour</button>
  </div>
</section>
```

Alternative passing pattern for asset-gallery sections:

```html
<section class="forge-section ks-has-ambient-bg ks-bg-overlay--soft">
  <div class="ks-ambient-bg" data-ks-bg-src="assets/svg/bg/mesh-soft.svg" aria-hidden="true"></div>
  <div class="ks-ambient-bg-overlay" aria-hidden="true"></div>
  <div class="ks-content container py-5">
    <h2 class="h3 mb-3">Section with animated background</h2>
    <a class="btn btn-outline-primary" href="#next">Continue</a>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor report fields `ambientZIndexReport.violations[]` with kinds `pointer-events`, `z-index-high`, `stack-inversion`, or `canvas-layer`. Each finding includes the offending class, computed z-index, and page URL. In DevTools, select `.forge-ambient-bg` / `.ks-ambient-bg` and confirm `z-index: 0` and `pointer-events: none`.

**Remediate (in order):**

1. Remove inline or custom CSS that raises ambient bg/canvas above z-index 1.
2. Set **`pointer-events: none`** on every decorative SVG, canvas, and global living-scene root.
3. Wrap interactive UI in **`.forge-ambient-content`** or **`.ks-content`**; add **`.forge-ambient-scrim`** or **`.ks-ambient-bg-overlay`** when readability needs separation (see `AI.AMBIENT.READABILITY_CONFLICT`).
4. For particle/canvas effects, mount the canvas inside the bg slot (sibling before content wrapper), not as a sibling above prose.
5. Re-run `analyze-website-ux.mjs` metrics on first-screen URLs; stack inversions often co-occur with unreadable hero bands.

## Related rules

- `AI.AMBIENT.READABILITY_CONFLICT` — scrim and intensity when ambient competes with copy (judgment layer above this z-index gate).
- `DET.MOTION.PREFERS_REDUCED` — living and ambient animation must quiet under reduced-motion preference.
- `AI.MOTION.INTENTIONALITY` — parallax and ambient motion should not pull focus from interactive targets this rule keeps reachable.
