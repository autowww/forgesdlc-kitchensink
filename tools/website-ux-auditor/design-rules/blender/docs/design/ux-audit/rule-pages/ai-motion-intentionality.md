---
rule_id: AI.MOTION.INTENTIONALITY
lane: ai
title: Motion intentionality
summary: Motion and transitions should guide attention toward the next read or action—not compete with copy, controls, or reading rhythm.
page_version: 136728ab3fe29e6d695661f901d3c331816c1d82725d75fc155f673d279da7ce
generated_at: 2026-05-28T17:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-motion-intentionality
related_rules:
  - DET.MOTION.PREFERS_REDUCED
  - DET.MOTION.NO_AUTO_PLAY_FLASH
  - AI.AMBIENT.READABILITY_CONFLICT
  - AI.JS.BEHAVIOR_DISCOVERABILITY
---

## Purpose

Kitchen Sink ships motion primitives across **`Ksc`** (`css/forge-theme.css`: `.pulse`, `.pulse-amber`, `.breathe-link`, `.breathe-static`, `.ks-tilt-wrap`, `.ks-parallax-wrap`), **Forge ambient** loops (`css/forge-ambient.css`), **living background** (`#ks-living-scene`, `js/ks-living-motion.js`), and **script-assembly** fly-ins (`.ks-sa-fly-chip`, `.ks-sa-seq-in` in `css/script-assembly.css`). Deterministic gates (`DET.MOTION.PREFERS_REDUCED`, `DET.MOTION.NO_AUTO_PLAY_FLASH`) prove reduced-motion respect and flash-risk bounds; this AI rule judges **intentionality**: does motion reinforce hierarchy and the visitor job, or pull eyes away from headlines, body copy, and primary CTAs?

**Plan:** On first-screen and scroll captures, list every visible loop, entrance, parallax, and hover oscillation; note what each motion is meant to signal. **Do:** Keep one focal motion per viewport band; move decorative loops behind scrims or to hover-only surfaces; align duration/easing with KS defaults (approx. 0.2–0.45s transitions, slow breathe/pulse cycles). **Check:** A still screenshot communicates the same story; reduced-motion paths quiet non-essential animation without breaking layout. **Adjust:** When the same distraction repeats (e.g. multiple `.pulse` tiles above explanatory copy), propose a `DET.*` threshold or tighten **`Mtn`** / contract forbidden patterns.

## Passing signals

- **One primary motion cue** per first-screen band (e.g. a single `.pulse-amber` accent on a stat tile, not on every card in a bento row).
- **Hover-gated** emphasis (`.breathe-link`, card lift) for secondary tiles; static surfaces for decorative blocks until interaction.
- **Entrance motion** is short, staggered, and settles (`.ks-sa-seq-in` with modest delay steps)—not perpetual fly-ins across the reading column.
- **Ambient and living layers** stay slow and behind content; foreground copy does not sit on competing oscillations (`AI.AMBIENT.READABILITY_CONFLICT`).
- **Parallax/tilt** (`.ks-tilt-wrap`, `.ks-parallax-wrap`) responds to pointer or scroll with restrained transform; `@media (prefers-reduced-motion: reduce)` disables tracking transitions.
- **Modals, offcanvas, and theme dropdown** use brief open/close transitions; no auto-open on load or timer without user intent (`AI.JS.BEHAVIOR_DISCOVERABILITY` overlap).
- Motion **timing and easing** feel calm (ease-out / cubic-bezier curves in theme tokens)—not bouncy loops on enterprise explanatory pages.

## Failing signals

- Three or more **infinite loops** visible at once (pulse + breathe + ambient mesh + living mid-layer) in the same reading band.
- **Always-on** `.pulse` / `.pulse-amber` on hero copy wrappers, primary CTAs, or full-width `.glass` panels behind paragraphs.
- **Autoplay entrance** chains (script-assembly fly-ins, carousel slides, modal reveal) that restart while the user is still reading above the fold.
- **Competing focal points**: stat counters, diagram breathe glow, and CTA pulse all animate at similar frequency—nothing reads as “start here.”
- **Fast or strobing** decorative motion on large surfaces (even when below deterministic flash thresholds, still feels hectic).
- Motion on **non-interactive** blocks that look clickable (`.breathe-static` + strong glow on inert `figure`/`div`) without discoverability copy.
- **Parallax drift** on text columns or nav chrome that makes labels feel unstable during scroll.

## Before example

Failing KS markup: landing band stacks multiple infinite loops and autoplay fly-ins on explanatory copy and CTAs.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--hero forge-ambient--expressive"
  hash="Mtn"
  data-ks-hash="Mtn"
  data-ks-type="page"
  data-ks-name="motion-hero-fail"
>
  <div class="forge-ambient-bg ks-ambient-bg" data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg" aria-hidden="true"></div>
  <div class="forge-ambient-content py-5">
    <div class="container-fluid px-3 px-xxl-5">
      <div class="glass p-4 pulse mb-4">
        <h1 class="product-landing-title mb-3">Governed agent delivery</h1>
        <p class="forge-support mb-4">Intent, delegation, review gates, and evidence—for teams shipping with human-owned control.</p>
        <button type="button" class="btn btn-primary pulse-amber">Start the methodology tour</button>
      </div>
      <div class="bento-grid bento-3">
        <div class="forge-card breathe-static p-3 text-center">
          <div class="stat-value text-cyan">42</div>
          <div class="stat-label">Handbook pages</div>
        </div>
        <div class="glass-amber p-3 pulse-amber text-center">
          <span class="section-label">Always pulsing</span>
        </div>
        <div class="forge-card breathe-static p-3 text-center">
          <div class="stat-value text-amber">12</div>
          <div class="stat-label">Methodologies</div>
        </div>
      </div>
      <div class="ks-sa-root mt-4 position-relative" style="min-height:6rem" aria-hidden="true">
        <div class="ks-sa-fly-mount">
          <div class="ks-sa-fly-chip ks-sa-fly-chip--in-1">Ingest</div>
          <div class="ks-sa-fly-chip ks-sa-fly-chip--in-2">Review</div>
          <div class="ks-sa-fly-chip ks-sa-fly-chip--in-3">Release</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: subtle ambient, one hover-gated accent, static stats, and no fly-in loop over the reading column.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--subtle"
  hash="Mtn"
  data-ks-hash="Mtn"
  data-ks-type="page"
  data-ks-name="motion-hero-pass"
>
  <div class="forge-ambient-bg ks-ambient-bg" data-ks-bg-src="assets/svg/ambient/mesh-bloom.svg" aria-hidden="true"></div>
  <div class="forge-ambient-scrim" aria-hidden="true"></div>
  <div class="forge-ambient-content py-5">
    <div class="container-fluid px-3 px-xxl-5">
      <div class="forge-card p-4 mb-4 border border-secondary border-opacity-25">
        <h1 class="product-landing-title mb-3">Governed agent delivery</h1>
        <p class="forge-support mb-4">Intent, delegation, review gates, and evidence—for teams shipping with human-owned control.</p>
        <a class="btn btn-primary" href="#quickstart">Start the methodology tour</a>
      </div>
      <div class="bento-grid bento-3">
        <a class="forge-card breathe-link d-block p-3 text-center text-decoration-none" href="#methodologies">
          <div class="stat-value text-cyan">42</div>
          <div class="stat-label">Handbook pages</div>
        </a>
        <div class="glass p-3 text-center">
          <div class="forge-stat">
            <div class="stat-value text-amber pulse-amber">12</div>
            <div class="stat-label">Methodologies</div>
          </div>
        </div>
        <div class="forge-card p-3 text-center">
          <div class="stat-value" style="color:var(--forge-emerald)">99%</div>
          <div class="stat-label">Coverage</div>
        </div>
      </div>
      <p class="forge-support mt-3 mb-0">Diagram motion activates on hover—see <a href="motion.html#sec-breathe">Breathe patterns</a>.</p>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** first-screen screenshot (still frame), short screen recording (3–5s) noting loop count, and DOM snapshot listing active `animation-name` / `transition-duration` on visible nodes. Test with `prefers-reduced-motion: reduce` enabled.

**Remediate (in order):**

1. Remove always-on `.pulse` / `.pulse-amber` from copy wrappers and primary CTAs; reserve one accent loop or hover-gated `.breathe-link` per band.
2. Step ambient/living intensity down (`forge-ambient--subtle`) and add scrim when motion sits behind text (`AI.AMBIENT.READABILITY_CONFLICT`).
3. Stop autoplay fly-ins and entrance chains over reading columns; show static labels or a single one-shot reveal on user action.
4. Verify `DET.MOTION.PREFERS_REDUCED` and `DET.MOTION.NO_AUTO_PLAY_FLASH`—fix deterministic failures before re-reviewing intentionality.
5. Document motion intent in the **`Mtn`** contract or page contract (what moves, why, static fallback); if the pattern repeats site-wide, propose a deterministic cap (e.g. max N infinite animations in first viewport).

## Related rules

- `DET.MOTION.PREFERS_REDUCED` — non-essential animation disabled under reduced-motion preference.
- `DET.MOTION.NO_AUTO_PLAY_FLASH` — no seizure-risk flash frequency on visible surfaces.
- `AI.AMBIENT.READABILITY_CONFLICT` — ambient layers must not fight legibility.
- `AI.JS.BEHAVIOR_DISCOVERABILITY` — motion must not substitute for interaction hints.
