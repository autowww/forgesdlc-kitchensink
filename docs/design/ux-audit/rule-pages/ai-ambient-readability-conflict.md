---
rule_id: AI.AMBIENT.READABILITY_CONFLICT
lane: ai
title: Ambient readability conflict
summary: Ambient SVG, canvas, and parallax layers must not compete with foreground copy, controls, or affordance clarity.
page_version: 6de36bdf97bd2a4e2c286d6eede4a3e438e1dc4da7fdd9f15ea4b3232d768e13
generated_at: 2026-05-19T16:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-ambient-readability-conflict
---

## Purpose

Kitchen Sink ships **Forge ambient** (`.forge-ambient`, `.forge-ambient-bg`, `.forge-ambient-scrim`, `.forge-ambient-content`) and the **living background** system (`#ks-living-scene`, `.ks-living-layer--back|mid|front`) to add atmosphere without replacing content. This AI rule judges whether those layers still let visitors read headlines, support copy, and primary actions at a glance.

Deterministic checks (`DET.AMBIENT.Z_INDEX`, `DET.THEME.CONTRAST_MIN`) catch stacking and sampled contrast; this rule covers judgment that numbers miss: busy particles behind thin type, sparks crossing button edges, parallax drift that makes labels feel unstable, or scrims so weak that accent lines read through body text.

**Plan:** On hero and band screenshots, note where ambient intensity, motion, or missing separation overlaps readable UI. **Do:** Tune intensity modifiers (`forge-ambient--subtle`), scrim tokens, and foreground surfaces before weakening brand motion. **Check:** First-screen copy and CTAs stay legible in still captures and with `prefers-reduced-motion: reduce`. **Adjust:** If the same failure repeats across pages, propose a deterministic companion (for example mandatory scrim when hero and expressive modifiers combine).

## Passing signals

- Foreground copy and CTAs sit in `forge-ambient-content` with a **readable scrim** (`forge-ambient-scrim`) when the ambient style is medium or stronger.
- Intensity modifiers match the job: **`forge-ambient--subtle`** for explanatory bands; reserve **`forge-ambient--hero`** + **`forge-ambient--expressive`** for short headlines with strong scrim and card/surface wrappers.
- Support and secondary text use full theme contrast (`forge-support` without ad-hoc `opacity-50` on critical lines).
- Primary actions use `btn btn-primary` on an opaque or card-backed surface (`forge-card`), not directly on un-scrimmed mesh lines.
- Ambient SVG/canvas stays behind content per `DET.AMBIENT.Z_INDEX`; reduced-motion paths quiet animation without removing the scrim.

## Failing signals

- Hero + expressive mesh-bloom behind a full paragraph and CTA with **no** `forge-ambient-scrim`.
- Body or support copy forced to `opacity-50` (or similar) to fit the atmosphere instead of adjusting ambient intensity.
- Spark/node density competes with link underlines, focus rings, or card borders.
- Multiple stacked ambient planes (mesh + parallax + living background) with no unified scrim on the reading column.
- Controls appear disabled because contrast under particles/canvas fails the intended hierarchy—even when raw token math is borderline.

## Before example

Failing KS markup: hero + expressive mesh-bloom, no scrim, faded support text.

```html
<section
  class="forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--hero forge-ambient--expressive forge-ambient--on-dark"
  hash="KEm"
  data-ks-hash="KEm"
  data-ks-type="visual-style"
  data-ks-name="ambient-hero-fail"
>
  <div class="forge-ambient-bg ks-ambient-bg" data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg" aria-hidden="true"></div>
  <div class="forge-ambient-content py-5">
    <h1 class="h2 mb-3">Governed agent delivery</h1>
    <p class="forge-support opacity-50 mb-4">Intent, delegation, review gates, and evidence—without losing readability under the mesh.</p>
    <button type="button" class="btn btn-primary">Start the methodology tour</button>
  </div>
</section>
```

## After example

Passing KS markup: subtle mesh-bloom with scrim and `forge-card` wrapper for copy and CTA.

```html
<section
  class="forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--subtle forge-ambient--on-dark"
  hash="KEm"
  data-ks-hash="KEm"
  data-ks-type="visual-style"
  data-ks-name="ambient-hero-pass"
>
  <div class="forge-ambient-bg ks-ambient-bg" data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg" aria-hidden="true"></div>
  <div class="forge-ambient-scrim" aria-hidden="true"></div>
  <div class="forge-ambient-content py-5">
    <div class="forge-card p-4 border border-secondary border-opacity-25 bg-dark bg-opacity-75">
      <h1 class="h2 mb-3">Governed agent delivery</h1>
      <p class="forge-support mb-4">Intent, delegation, review gates, and evidence—with ambient tone behind a scrim and card surface.</p>
      <button type="button" class="btn btn-primary">Start the methodology tour</button>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** full-section screenshot (light and dark if themed), zoom on first-screen copy + primary CTA, and a contrast sample under the ambient stack. Note `prefers-reduced-motion` behavior.

**Remediate (in order):**

1. Add or strengthen `forge-ambient-scrim`; step down to `forge-ambient--subtle` (or medium) if hero/expressive modifiers are not required.
2. Remove opacity hacks on `forge-support`; fix ambient intensity instead.
3. Wrap reading columns in `forge-card` or an equivalent opaque surface when mesh/canvas remains visible.
4. Re-check `DET.THEME.CONTRAST_MIN` on real foreground colors (not assumed defaults).
5. If the pattern repeats, propose a deterministic companion (e.g. scrim required when hero and expressive modifiers combine).

## Related rules

- `DET.AMBIENT.Z_INDEX` — ambient bg/canvas behind `forge-ambient-content`.
- `DET.THEME.CONTRAST_MIN` — token-level text/UI contrast.
- `DET.MOTION.PREFERS_REDUCED` — respect reduced motion for ambient animation.
- `AI.MOTION.INTENTIONALITY` — motion should guide attention, not fight reading.
