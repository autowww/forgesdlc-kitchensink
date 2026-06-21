---
rule_id: DET.AMBIENT.Z_INDEX
lane: deterministic
title: Ambient layer z-index contract
summary: Decorative ambient SVG, canvas, and living-background planes must sit below interactive content with pointer-events disabled on non-interactive layers.
page_version: 54e80db235ce4fc278994d6cdc4ad3aed4e21b93059c53f2d3a57eeb0fc1463a
generated_at: 2026-05-28T16:42:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-ambient-z-index
related_rules:
  - AI.AMBIENT.READABILITY_CONFLICT
  - DET.MOTION.PREFERS_REDUCED
  - AI.MOTION.INTENTIONALITY
---

## Purpose

Kitchen Sink ships three ambient systems that share a **stacking contract**:

- **Forge ambient** — `.forge-ambient` with `.forge-ambient-bg`, optional `.forge-ambient-scrim`, and `.forge-ambient-content` (`css/forge-ambient.css`).
- **Animated backgrounds** — `.ks-has-ambient-bg` with `.ks-ambient-bg`, `.ks-ambient-bg-overlay`, and `.ks-content` (`css/ks-animated-backgrounds.css`).
- **Living background** — `#ks-living-scene` / `.ks-living-scene` and section-local `.ks-living-section` bands (`css/ks-living-background.css`).

The contract is **bg at z-index 0**, **scrim/overlay at z-index 1**, **foreground content at z-index 2**, and **`pointer-events: none`** on every decorative plane. Ambient layers must never intercept clicks, cover CTAs, or stack above prose and controls.

`design-rules/deterministic/generated/det-ambient-z-index.check.js` samples computed styles in Playwright and flags stack inversions, elevated ambient z-index, and interactive canvases inside ambient containers.

**Plan:** Identify first-screen sections that use ambient markup. **Do:** Use KS slot classes; avoid inline z-index or `pointer-events` overrides on bg/canvas layers. **Check:** Run the auditor metrics phase or inspect computed `z-index` and `pointer-events` in DevTools. **Adjust:** Move drawing surfaces into the bg slot and wrap interactive UI in `.forge-ambient-content` or `.ks-content`.

## Passing signals

- `.forge-ambient-bg` / `.ks-ambient-bg` (including `.ks-section-bg.ks-ambient-bg` and `.ks-living-scene__global.ks-ambient-bg`) report **z-index 0–1** and **`pointer-events: none`**.
- Foreground copy and controls live in **`.forge-ambient-content`** or **`.ks-content`** with **z-index ≥ 2** (or `.container` / `.container-fluid` direct children of `.ks-living-section` at z-index 1 when the section bg is 0).
- Optional scrims use **`.forge-ambient-scrim`** or **`.ks-ambient-bg-overlay`** at z-index 1, also with `pointer-events: none`.
- **`#ks-living-scene`** / **`.ks-living-scene`** stays at **z-index 0** with **`pointer-events: none`** so the global parallax field never blocks the page.
- `<canvas>` elements inside `.forge-ambient`, `.ks-has-ambient-bg`, or `.ks-living-scene` sit in the bg slot at z-index 0 with `pointer-events: none`, or are omitted in favor of SVG loaded via `data-ks-bg-src`.
- Asset-gallery sections use **`.ks-has-ambient-bg`** + **`.ks-bg-overlay--soft`** (or `--medium` / `--strong`) with the same 0 / 1 / 2 plane order.

## Failing signals

- Ambient bg/canvas **`z-index > 1`** (for example inline `style="z-index: 5"` on `.forge-ambient-bg`).
- **`pointer-events: auto`** (or unset on an absolutely positioned canvas/SVG) on a decorative layer that overlaps buttons or links.
- **Stack inversion:** ambient layer z-index **≥ content wrapper** z-index inside the same `.forge-ambient` / `.ks-has-ambient-bg` / `.ks-living-section` container.
- Hero markup places headings and CTAs in a bare `<div>` while a canvas or bg layer sits above them in paint order.
- `.ks-living-scene` with **`z-index > 0`** or **`pointer-events` other than `none`**, blocking interaction with the document below.
- Violation kinds from the check module: `pointer-events`, `z-index-high`, `stack-inversion`, `canvas-layer`.

## Before example

Failing KS markup: canvas and ambient bg elevated above prose; no content wrapper; pointer events enabled on decorative layers.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--hero forge-ambient--expressive forge-ambient--on-dark"
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

Passing KS markup: canonical Forge ambient slots — bg 0, scrim 1, content 2 — with no pointer capture on decorative planes (matches `generator/pages/forge_ambient.py` showcase snippets).

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--medium forge-ambient--on-dark"
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

## Evidence and remediation

**Evidence:** Auditor metrics `ambientZIndexReport.violations[]` with kinds `pointer-events`, `z-index-high`, `stack-inversion`, or `canvas-layer`. Each finding includes the offending class, computed z-index, and page URL. In DevTools, select `.forge-ambient-bg` / `.ks-ambient-bg` and confirm `z-index: 0` and `pointer-events: none`.

**Remediate (in order):**

1. Remove inline or custom CSS that raises ambient bg/canvas above z-index 1.
2. Set **`pointer-events: none`** on every decorative SVG, canvas, and global living-scene root.
3. Wrap interactive UI in **`.forge-ambient-content`** or **`.ks-content`**; add **`.forge-ambient-scrim`** or **`.ks-ambient-bg-overlay`** when readability needs separation (see `AI.AMBIENT.READABILITY_CONFLICT`).
4. For particle/canvas effects, mount the canvas inside the bg slot (sibling before the content wrapper), not as a sibling above prose.
5. Re-run `analyze-website-ux.mjs` metrics on first-screen URLs; stack inversions often co-occur with unreadable hero bands.

## Related rules

- `AI.AMBIENT.READABILITY_CONFLICT` — scrim and intensity when ambient competes with copy (judgment layer above this z-index gate).
- `DET.MOTION.PREFERS_REDUCED` — living and ambient animation must quiet under reduced-motion preference.
- `AI.MOTION.INTENTIONALITY` — parallax and ambient motion should not pull focus from interactive targets this rule keeps reachable.
