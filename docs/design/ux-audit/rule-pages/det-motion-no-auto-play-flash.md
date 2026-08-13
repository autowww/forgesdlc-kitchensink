---
rule_id: DET.MOTION.NO_AUTO_PLAY_FLASH
lane: deterministic
title: No auto-play flash patterns
summary: Visible CSS animations and autoplay video must stay below WCAG general flash frequency (more than three flashes per second) and avoid blink/strobe keyframe names.
page_version: 9b9cc8e4e70ccca5e8a80ca50209b95781ab2a9b511a8453cdb7a154b0453013
generated_at: 2026-05-25T14:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-motion-no_auto_play_flash
---

## Purpose

Photosensitive visitors and readers under cognitive load need pages that do not **auto-play strobing motion**. Kitchen Sink ships always-on motion primitives in **`Ksc`** (`css/forge-theme.css`: `.pulse`, `.pulse-amber`, `.breathe-link`, `.breathe-static`), ambient loops, living backgrounds, and script-assembly fly-ins — most use **slow** cycles (≥2s) on box-shadow or outline, not rapid opacity toggles. This deterministic rule enforces the **WCAG 2.3.1 general flash threshold**: a simple on/off luminance cycle must not exceed **three flashes per second** (~**0.67s minimum** duration for an infinite opacity toggle).

The check module `design-rules/deterministic/generated/det-motion-no-auto-play-flash.check.js` scans visible DOM nodes and stylesheets in Playwright for:

- **Fast infinite animations** — `animation-iteration-count: infinite` with duration below the safe toggle cycle.
- **Risky animation/@keyframes names** — `blink`, `flash`, `strobe`, `seizure`, or `flicker`.
- **Autoplay video** — visible `<video autoplay>` that may include rapid luminance changes.

**Plan:** Inventory every visible infinite loop, custom `@keyframes` name, and autoplay video on first-screen URLs. **Do:** Keep decorative motion slow, rename risky keyframes, gate fast loops behind user intent, and provide static fallbacks under `prefers-reduced-motion`. **Check:** Run the auditor metrics phase or `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.NO_AUTO_PLAY_FLASH`. **Adjust:** When a product surface needs attention without strobing, use KS `.pulse` / hover `.breathe-*` (≥2s) or one-shot entrances — not sub-second opacity blinks.

## Passing signals

- **No risky names** on running animations or `@keyframes` rules (`pulse-glow`, `breathe-cyan`, `forge-theme-aurora` are fine; `blink`, `flash-strobe`, `ks-flicker-border` are not).
- **Infinite loops** on visible elements use **duration ≥ ~0.67s** for simple on/off cycles, or use **slow KS defaults** (`.pulse` / `.pulse-amber` at **3s**, `.breathe-*` at **2.2–2.5s** on hover).
- **Opacity or luminance** changes stay gradual (ease-in-out, box-shadow/outline pulses) rather than hard 0↔1 toggles faster than 3 Hz.
- **Autoplay video** is absent, or muted decorative video is hidden/off-screen with **`prefers-reduced-motion: reduce`** pausing playback and a static poster fallback.
- **`@media (prefers-reduced-motion: reduce)`** disables non-essential infinite animation (pairs with `DET.MOTION.PREFERS_REDUCED`).
- **Decorative motion** stays on small accents (stat tile, badge) — not full-viewport strobing backgrounds behind body copy.

## Failing signals

- Custom **`@keyframes blink`** / **`flash`** / **`strobe`** applied with **`animation: … 0.2s infinite`** (or any duration **< 0.67s** with infinite iteration) on visible text, cards, or hero bands.
- **Animation names** containing `blink`, `flash`, `strobe`, `seizure`, or `flicker` even when duration looks slow — the name signals intent the check flags.
- **Multiple fast infinite loops** in the same viewport (status badge + alert banner + background mesh all strobing).
- **Autoplay video** visible without user gesture (`<video autoplay>` on hero or ambient layer), especially when unmuted.
- **Inline `<style>` blocks** in handbook/showcase pages that reintroduce seizure-risk patterns outside theme tokens.
- **Full-width `.glass` / `.forge-card` panels** with hard opacity oscillation that estimates **> 3 flashes per second** on a simple toggle model.

## Before example

Failing KS markup: custom `blink` keyframes at 0.2s infinite on a hero stat band, plus visible autoplay video.

```html
<main id="main" class="doc-main px-4 py-4">
  <style>
    @keyframes blink {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .ks-status-flash {
      animation: blink 0.2s linear infinite;
    }
  </style>
  <section class="forge-section py-4">
    <div class="glass p-4 mb-4">
      <span class="section-label d-block mb-2">Live status</span>
      <p class="ks-status-flash forge-support mb-0">
        Sync in progress — strobing faster than three flashes per second.
      </p>
    </div>
    <div class="forge-card p-3">
      <div class="stat-value text-cyan ks-status-flash">99</div>
      <div class="stat-label">Checks passing</div>
    </div>
    <video
      class="w-100 mt-3"
      autoplay
      loop
      playsinline
      aria-label="Decorative background loop"
    >
      <source src="assets/video/ambient-loop.mp4" type="video/mp4" />
    </video>
  </section>
</main>
```

## After example

Passing KS markup: slow theme pulse on an accent tile, static copy for status, no autoplay video, reduced-motion fallback.

```html
<main id="main" class="doc-main px-4 py-4">
  <style>
    @media (prefers-reduced-motion: reduce) {
      .pulse-amber { animation: none !important; }
    }
  </style>
  <section class="forge-section py-4">
    <div class="glass p-4 mb-4">
      <span class="section-label d-block mb-2">Live status</span>
      <p class="forge-support mb-0">
        Sync complete — static text; motion reserved for hover accents.
      </p>
    </div>
    <div class="bento-grid bento-3">
      <div class="forge-card p-3 text-center">
        <div class="stat-value text-cyan">99</div>
        <div class="stat-label">Checks passing</div>
      </div>
      <div class="glass-amber p-3 pulse-amber text-center">
        <span class="section-label">Primary accent</span>
        <p class="forge-support mb-0 small">Slow 3s glow — below flash threshold.</p>
      </div>
      <div class="forge-card breathe-static p-3 text-center">
        <div class="stat-value text-amber">12</div>
        <div class="stat-label">Guides linked</div>
      </div>
    </div>
  </section>
</main>
```

## Evidence and remediation

**Evidence:** Auditor metrics field `motionNoAutoPlayFlashReport.violations[]` with kinds:

| Kind | Meaning |
|------|---------|
| `fast-infinite-animation` | Infinite loop duration below ~0.67s; `estimatedFlashesPerSecond` above 3 |
| `risky-animation-name` | Running `animation-name` matches blink/flash/strobe/seizure/flicker |
| `risky-keyframes-name` | Stylesheet `@keyframes` rule name matches risky keywords |
| `autoplay-video` | Visible `<video autoplay>` on the page |

Each finding includes `selectorHint` (tag, class, optional `data-ks-hash`), duration, estimated Hz, and page URL.

**Remediate (in order):**

1. **Remove or slow** infinite animations — target **≥ 0.67s** per cycle for on/off toggles; prefer KS **`.pulse`** / **`.pulse-amber`** (3s) or hover-only **`.breathe-link`** / **`.breathe-static`** (≥2.2s).
2. **Rename** `@keyframes` and `animation-name` values — drop `blink`, `flash`, `strobe`, `seizure`, `flicker` from identifiers.
3. **Delete autoplay** on decorative video; require user play, or hide video under `prefers-reduced-motion` with a static poster image.
4. **Add reduced-motion overrides** (`animation: none !important`) for any remaining decorative loops — see `DET.MOTION.PREFERS_REDUCED`.
5. Re-run `analyze-website-ux.mjs` metrics on affected URLs; pair with `AI.MOTION.INTENTIONALITY` when motion volume still feels distracting but passes frequency gates.

Harness verification:

```bash
python3 generator/build_rule_defect_fixtures.py
auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.MOTION.NO_AUTO_PLAY_FLASH
```

## Related rules

- `DET.MOTION.PREFERS_REDUCED` — non-essential animation must disable under `prefers-reduced-motion: reduce`.
- `AI.MOTION.INTENTIONALITY` — judgment layer for whether remaining motion supports hierarchy (this rule only bounds flash frequency and risky names).
- `AI.AMBIENT.READABILITY_CONFLICT` — slow ambient loops behind copy still need scrim/readability review when they compete with reading.
