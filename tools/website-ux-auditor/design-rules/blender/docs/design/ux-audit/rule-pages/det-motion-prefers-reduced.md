---
rule_id: DET.MOTION.PREFERS_REDUCED
lane: deterministic
title: Prefers-reduced-motion compliance
summary: When the user enables reduced motion, non-essential CSS animation, transitions, autoplay video, and SVG SMIL must stop; essential loading and progress indicators may continue.
page_version: d9481ea972486cca7587b718930908984ff9fee24b576e1086411685a71ddade
generated_at: 2026-05-29T12:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-motion-prefers_reduced
related_rules:
  - DET.MOTION.NO_AUTO_PLAY_FLASH
  - AI.MOTION.INTENTIONALITY
  - AI.AMBIENT.READABILITY_CONFLICT
---

## Purpose

Visitors who enable **Reduce motion** in their OS expect pages to hold still unless motion communicates essential status. Kitchen Sink ships decorative motion in **`Ksc`** (`css/forge-theme.css`: `.pulse`, `.pulse-amber`, `.breathe-link`, `.breathe-static`, `.ks-tilt-wrap`, `.forge-card` hover transitions), ambient layers (`css/forge-ambient.css`, `css/ks-living-background.css`), and script fly-ins (`css/script-assembly.css`: `.ks-sa-fly-chip`, `.ks-sa-seq-in`). Theme CSS already gates some surfaces — `.forge-card` transitions, `.ks-tilt-inner` / `.ks-parallax-inner`, theme-dropdown aurora, ambient shimmer, living-background drift, and `.ks-sa-root` blanket overrides — but **`.pulse` / `.breathe-*` do not ship with built-in `@media (prefers-reduced-motion: reduce)` blocks**; consumer pages must add them when those classes appear on visible surfaces. This rule verifies that **every visible element** respects reduced motion at audit time.

The check module `design-rules/deterministic/generated/det-motion-prefers-reduced.check.js` emulates **`prefers-reduced-motion: reduce`** in Playwright, then scans visible DOM for:

- **Active CSS animations** with duration above **~0.02s** (20ms) that are not essential loading/progress indicators.
- **Active CSS transitions** with duration above **~0.02s** on non-essential elements.
- **Autoplay video** (`<video autoplay>`) still visible in the viewport.
- **SVG SMIL** (`<animate>`, `<animateTransform>`, `<set>`) that CSS media queries cannot disable.

**Essential motion** (allowed to continue): elements with `aria-busy="true"`, `role="progressbar"` or `role="status"`, or class/animation names matching `spinner`, `loading`, `skeleton`, or `progress`.

**Plan:** Inventory decorative animation, hover transitions, ambient loops, autoplay video, and inline SMIL on first-screen URLs. **Do:** Add or extend `@media (prefers-reduced-motion: reduce)` blocks in theme CSS and page-local styles; pause decorative video; replace SMIL with static SVG or script guards. **Check:** Run the auditor metrics phase or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.PREFERS_REDUCED`. **Adjust:** When motion still feels noisy but passes this gate, pair with `AI.MOTION.INTENTIONALITY`; when slow ambient loops compete with copy, review `AI.AMBIENT.READABILITY_CONFLICT`.

## Passing signals

- **Stylesheets include** `@media (prefers-reduced-motion: reduce)` rules that disable decorative animation (`animation: none` or near-zero duration) and transitions (`transition: none` or **≤ 0.02s**) — see KS patterns in `forge-theme.css` (`.forge-card`, `.ks-tilt-inner`, theme dropdown), `forge-ambient.css` (`.fa-css-shimmer`), `ks-living-background.css` (`.ks-living-drift-layer`), and `script-assembly.css` (`.ks-sa-root` blanket override).
- **Always-on pulses** (`.pulse`, `.pulse-amber`) and hover breathing (`.breathe-link`, `.breathe-static`) are static when reduced motion is preferred — via page-local or theme media query.
- **Parallax/tilt** (`.ks-tilt-wrap`, `.ks-parallax-wrap`) sets `transition: none !important` on inner layers under reduced motion; `js/ks-tilt-tiles.js` skips pointer tracking when the media query matches.
- **Autoplay video** is absent, paused, or replaced with a static poster when `prefers-reduced-motion: reduce` matches.
- **No visible SVG SMIL** on decorative diagrams, or SMIL is removed/paused under reduced motion (`js/ks-animated-backgrounds.js` pauses injected SMIL when reduce is set).
- **Loading and progress** indicators (`.spinner-border`, `loading`, `skeleton`, `progress-ring`, `role="status"`, `aria-busy="true"`) may keep motion — the check treats them as essential.
- **`reducedMotionCssRuleCount` > 0** in audit metrics when custom motion is present (stylesheet contains at least one reduced-motion media block).

## Failing signals

- **`.pulse-amber` / `.pulse`** (or custom `@keyframes`) still running with **duration > 0.02s** when reduced motion is emulated — common when a page adds decorative classes without a matching media override.
- **`.breathe-link` / `.breathe-static`** hover transitions (**0.25s** in theme) or hover **infinite** `breathe-amber` / `breathe-cyan` animations remain active on visible cards.
- **`.forge-card`** or link tiles keep **`transition: all 0.2s`** because a consumer stylesheet reintroduces transitions without the theme's reduced-motion block.
- **`.ks-tilt-inner`** still animates transform under reduced motion when a page overrides theme CSS or omits `forge-theme.css`.
- **Visible `<video autoplay>`** on hero or ambient bands while reduced motion is preferred.
- **Inline `<style>` blocks** that define infinite animation without a `@media (prefers-reduced-motion: reduce)` companion.
- **SVG `<animate>` / `<animateTransform>`** inside handbook diagrams — SMIL ignores CSS `animation: none` on the parent SVG.
- **Zero** `prefers-reduced-motion` media rules in stylesheets while the page ships custom motion primitives.

## Before example

Failing KS markup: always-on pulse accent, hover breathing without override, card transitions, autoplay video, SVG SMIL, and no reduced-motion media query.

```html
<main id="main" class="doc-main px-4 py-4">
  <style>
    @keyframes ks-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .ks-hero-float {
      animation: ks-float 3s ease-in-out infinite;
    }
  </style>
  <section class="forge-section py-4">
    <div class="glass-amber p-4 pulse-amber mb-4">
      <span class="section-label d-block mb-2">Featured guide</span>
      <p class="ks-hero-float forge-support mb-0">
        Decorative float and pulse keep running when Reduce motion is on.
      </p>
    </div>
    <div class="bento-grid bento-2">
      <a href="#quickstart" class="forge-card breathe-link p-3 text-decoration-none">
        <span class="card-label">Path</span>
        <h3 class="h5 mb-0">Quickstart</h3>
      </a>
      <div class="forge-card breathe-static p-3">
        <div class="stat-value text-cyan">24</div>
        <div class="stat-label">Active rules</div>
      </div>
    </div>
    <div class="forge-diagram ks-diagram-card mt-3 p-3">
      <svg viewBox="0 0 120 40" role="img" aria-label="Animated flow">
        <circle cx="20" cy="20" r="8" fill="currentColor" class="text-cyan">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="40" y="24" class="forge-support">SMIL ignores CSS animation:none</text>
      </svg>
    </div>
    <video
      class="w-100 mt-3"
      autoplay
      loop
      muted
      playsinline
      aria-label="Decorative ambient loop"
    >
      <source src="assets/video/ambient-loop.mp4" type="video/mp4" />
    </video>
  </section>
</main>
```

## After example

Passing KS markup: theme-aligned reduced-motion overrides, static decorative surfaces, essential spinner allowed, no autoplay video, static SVG diagram.

```html
<main id="main" class="doc-main px-4 py-4">
  <style>
    @media (prefers-reduced-motion: reduce) {
      .pulse,
      .pulse-amber,
      .ks-hero-float,
      .breathe-link,
      .breathe-static {
        animation: none !important;
      }
      .breathe-link,
      .breathe-static,
      .forge-card {
        transition: none !important;
      }
      .breathe-link::before {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }
  </style>
  <section class="forge-section py-4">
    <div class="glass p-4 mb-4">
      <span class="section-label d-block mb-2">Featured guide</span>
      <p class="forge-support mb-0">
        Static copy — motion reserved for essential status only.
      </p>
    </div>
    <div class="bento-grid bento-2">
      <a href="#quickstart" class="forge-card p-3 text-decoration-none">
        <span class="card-label">Path</span>
        <h3 class="h5 mb-0">Quickstart</h3>
      </a>
      <div class="forge-card p-3" aria-busy="true" role="status">
        <div class="stat-value text-cyan d-flex align-items-center gap-2">
          <span class="spinner-border spinner-border-sm text-cyan" aria-hidden="true"></span>
          24
        </div>
        <div class="stat-label">Syncing rules</div>
      </div>
    </div>
    <div class="forge-diagram ks-diagram-card mt-3 p-3">
      <svg viewBox="0 0 120 40" role="img" aria-label="Static flow">
        <circle cx="20" cy="20" r="8" fill="currentColor" class="text-cyan" />
        <text x="40" y="24" class="forge-support">Static SVG — no SMIL</text>
      </svg>
    </div>
    <img
      class="w-100 mt-3 rounded"
      src="assets/img/ambient-poster.jpg"
      alt="Static poster frame replacing autoplay video under reduced motion"
    />
  </section>
</main>
```

## Evidence and remediation

**Evidence:** Auditor metrics field `motionPrefersReducedReport` with:

| Field | Meaning |
|-------|---------|
| `reducedMotionPreferred` | `true` when emulateMedia applied |
| `reducedMotionCssRuleCount` | Stylesheet `@media (prefers-reduced-motion: reduce)` rule count |
| `nonEssentialMotionCount` | Visible non-essential motion instances |
| `violations[]` | Up to 12 sampled violations with `kind`, `selectorHint`, durations |

**Violation kinds:**

| Kind | Severity | Meaning |
|------|----------|---------|
| `active-animation` | major | Non-essential `animation-name` with duration **> 0.02s** |
| `active-transition` | warn | Non-essential `transition-duration` **> 0.02s** |
| `autoplay-video` | warn | Visible `<video autoplay>` |
| `smil-animation` | major | SVG SMIL element inside visible SVG |

Each finding includes `selectorHint` (tag, classes, optional `data-ks-hash`), animation/transition metadata, and page URL.

**Remediate (in order):**

1. **Add theme-level overrides** — mirror KS patterns: `animation: none !important` for `.pulse`, `.breathe-*`, ambient shimmer, living-background drift; `transition: none` for `.forge-card`, `.ks-tilt-inner`, `.breathe-*`.
2. **Scope page-local motion** — wrap custom `@keyframes` in `@media (prefers-reduced-motion: no-preference)` or provide a `reduce` block that sets `animation: none`.
3. **Remove or pause autoplay video** under reduced motion; ship a static `<img>` poster (as in the after example).
4. **Replace SVG SMIL** with static paths or pause via script when `matchMedia('(prefers-reduced-motion: reduce)').matches` — CSS alone cannot stop external SMIL.
5. **Keep essential indicators** — use Bootstrap `.spinner-border`, `aria-busy="true"`, or `role="status"` for real progress; do not strip loading motion users need.
6. Re-run `analyze-website-ux.mjs` metrics on affected URLs; pair with `DET.MOTION.NO_AUTO_PLAY_FLASH` when fast strobing remains after motion is gated.

Harness verification:

```bash
python3 generator/build_rule_defect_fixtures.py
auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.PREFERS_REDUCED
```

## Related rules

- `DET.MOTION.NO_AUTO_PLAY_FLASH` — bounds flash frequency and risky animation names; reduced-motion overrides are the first remediation step for infinite loops.
- `AI.MOTION.INTENTIONALITY` — judgment layer for whether remaining motion supports hierarchy (this rule only verifies reduced-motion compliance).
- `AI.AMBIENT.READABILITY_CONFLICT` — slow ambient loops disabled under reduced motion may still need scrim/readability review when motion stays enabled.
