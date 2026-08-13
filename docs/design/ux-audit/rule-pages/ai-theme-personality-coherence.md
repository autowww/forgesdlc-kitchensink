---
rule_id: AI.THEME.PERSONALITY_COHERENCE
lane: ai
title: Theme personality coherence
summary: Forge theme accents, dark foundation, and typography reinforce calm enterprise temperament—amber and cyan play predictable roles without fighting copy or mixing unrelated palettes.
page_version: aebc8f3a70ca0a7be73927bca9202acd7aa2cf32a6d9b3c9c7c733b4cedf4d66
generated_at: 2026-05-19T22:35:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-theme-personality-coherence
---

## Purpose

Kitchen Sink theme packs (`forge-theme.css`, `forgesdlc-theme.css`, `docs-theme.css`) encode a **deliberate Forge temperament**: dark, spacious foundation; **amber** for primary emphasis and warmth; **cyan** for informational labels and secondary actions. This AI rule judges whether a page **feels like one brand**—accent colors, gradients, glass surfaces, and dark/light balance support reading and trust instead of competing with it.

Deterministic rules guard token allowlists, font stacks, and contrast floors (`DET.TOKEN.NO_DRIFT`, `DET.THEME.FONT_STACK`, `DET.THEME.CONTRAST_MIN`); this rule guards **personality coherence** that passes token scans yet still reads as patchwork: random Bootstrap accent buttons, inline hex rainbows, gradient text on every heading, or a bright band dropped into an otherwise dark product shell.

**Plan:** Walk the page and map where each accent appears—labels, CTAs, cards, links, ambient layers. **Do:** Reassign colors to Forge roles (cyan eyebrows, amber primary CTA, restrained `forge-gradient-text` on the hero title only). **Check:** Screenshots show one calm dark personality with accents that guide, not shout. **Adjust:** When the same accent drift repeats (for example ad-hoc `btn-success` beside `btn-forge`), propose a deterministic `DET.*` companion or catalog contract tightening.

## Passing signals

- **Accent roles are stable:** `section-label text-cyan` and `card-label` on **`card-amber`** tiles mark structure; **`btn-forge`** carries the primary action; **`btn-cyan-outline`** or **`btn-forge-outline`** carries secondary—no stray `btn-warning`, `btn-success`, or inline `#22c55e` / `#a855f7` accents.
- **Dark foundation stays dominant:** body and section bands use Forge dark surfaces (`forge-section`, `forge-card`, `glass` / `glass-amber` on `#0A0E17` family backgrounds); light strips are intentional and brief, not accidental Bootstrap defaults.
- **Gradient display is focal, not noisy:** **`forge-gradient-text`** appears on the hero **`product-landing-title`** (or one display headline), not on every `h2`–`h5` and link.
- **Glass and card variants match temperament:** `glass-amber` and **`forge-card card-amber`** share the same amber story; default **`forge-card`** handles neutral tiles—surfaces do not each invent a new accent hue.
- **Theme pack choice is consistent:** marketing/product pages load **`forgesdlc-theme.css`** after **`forge-theme.css`** and use **`landing-hero`**, **`fs-landing-hero-band`**, and **`landing-hero-kicker`** patterns; handbook pages use **`docs-theme.css`** cues without dropping marketing gradients mid-chapter.
- **Ambient layers respect personality:** expressive **`forge-ambient--expressive`** mesh stays behind scrimmed copy (`AI.AMBIENT.READABILITY_CONFLICT`); cyan/amber sparks do not become a third competing accent system.
- **Typography reinforces brand calm:** **`font-display`** headlines, **`forge-support`** body, **`text-dim`** / **`text-muted-4`** for de-emphasis—weights and colors stay on the Forge scale.

## Failing signals

- **Accent roulette:** adjacent sections use cyan labels, amber cards, green success buttons, purple inline links, and orange warning badges—no readable role system.
- **Gradient overload:** `forge-gradient-text` on hero, section titles, card headings, and footer links; copy feels like a promo filter, not enterprise documentation.
- **Theme pack collision:** docs-style **`nav-section-label`** beside **`landing-hero-kicker`**, or handbook **`glass-solid`** panels mixed with product **`fs-marketing-stat-band`** without a transition—reads as two sites stitched together.
- **Light/dark whiplash:** full-width `bg-light text-dark` band between dark **`forge-section`** blocks with no scrim or bridge; eyes re-adapt every scroll.
- **Bootstrap defaults fighting Forge:** raw `btn-primary` / `btn-info` / `text-info` beside tokenized **`btn-forge`**; **`card border-info`** next to **`forge-card card-amber`**.
- **Inline hex drift:** `style="color:#e879f9"` or custom gradients on heroes despite **`DET.TOKEN.NO_DRIFT`** policy—personality leaves the Forge palette entirely.
- **Accent behind content:** high-opacity **`forge-ambient--hero`** cyan/amber mesh with no scrim makes labels feel like part of the decoration, not the message.

## Before example

Failing KS markup: mixed Bootstrap accents, inline hex colors, gradient text everywhere, and a bright band that breaks the dark Forge personality.

```html
<section class="landing-hero py-4" style="background:linear-gradient(90deg,#312e81,#0A0E17,#064e3b);">
  <div class="container">
    <p class="section-label mb-1" style="color:#e879f9;">GOVERNANCE · AI · CLOUD · ANALYTICS</p>
    <h1 class="font-display forge-gradient-text product-landing-title mb-2">Ship faster with AI!!!</h1>
    <h2 class="font-display forge-gradient-text h4 mb-3">Everything in one platform</h2>
    <p class="forge-support mb-3" style="color:#4ade80;">Agents, automation, and compliance-ready workflows.</p>
    <div class="d-flex flex-wrap gap-2">
      <a class="btn btn-forge" href="#">Get started</a>
      <a class="btn btn-success" href="#">Start free</a>
      <a class="btn btn-warning" href="#">Book demo</a>
      <a class="btn btn-info" href="#">Watch video</a>
    </div>
  </div>
</section>

<section class="bg-light text-dark py-4">
  <div class="container">
    <p class="section-label text-cyan mb-2">Features</p>
    <div class="row g-2">
      <div class="col-md-4">
        <div class="card border-info h-100 p-3">
          <h3 class="forge-gradient-text h5 mb-1">Traceability</h3>
          <p class="mb-0 small">Logs everywhere</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-amber p-3 h-100">
          <p class="section-label text-amber mb-1">Security</p>
          <p class="mb-0 forge-support">Enterprise grade</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card p-3 h-100" style="border:2px solid #a855f7;">
          <h3 class="h5 mb-1" style="color:#c084fc;">Smart AI</h3>
          <p class="mb-0 forge-support">Magic automation</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: dark Forge foundation, cyan informational labels, amber primary emphasis, gradient display on the hero title only, and a consistent CTA pair.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Thm"
  data-ks-hash="Thm"
  data-ks-type="layout"
  data-ks-name="theme-personality-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 landing-hero-grid">
        <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">
            Governed delivery you can inspect
          </h1>
          <p class="forge-support landing-hero-tagline mb-4">
            Calm dark surfaces, amber primary actions, and cyan structure labels—accents that guide reading instead of decorating every line.
          </p>
          <div class="landing-hero-actions">
            <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
              <a class="btn btn-forge" href="/quickstart">Start with Quickstart</a>
              <a class="btn btn-cyan-outline" href="/how-it-works">See how it works</a>
            </p>
          </div>
        </div>
        <div class="col-12 col-xl-5 landing-hero-visual">
          <div class="landing-forge-visual">
            <img
              src="assets/svg/diagrams/governed-delivery-spine.svg"
              alt="Governance spine from intent through review to evidence"
              width="800"
              height="450"
              class="landing-forge-visual__img"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="theme-outcomes">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 font-display mb-4">One temperament across the page</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Control</p>
          <h3 class="h5 mt-2 mb-1">Human-owned gates</h3>
          <p class="forge-support mb-0">Amber accent marks the primary story tile—same role on every card.</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#evidence">
          <p class="card-label">Evidence</p>
          <h3 class="h5 mt-2 mb-1">Inspectable artifacts</h3>
          <p class="forge-support mb-0">Headlines stay solid display type; gradient reserved for the hero.</p>
        </a>
      </div>
      <div class="col-md-4">
        <div class="glass p-3 h-100 breathe-static">
          <p class="section-label text-cyan mb-1">Depth</p>
          <p class="forge-support mb-0">Neutral glass for supporting copy—cyan label, no third accent hue.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** full-page screenshot plus crops of hero, first accent band, and CTA row. Record loaded theme sheets (`forge-theme.css`, `forgesdlc-theme.css`, or `docs-theme.css`), accent class usage (`text-cyan`, `text-amber`, `card-amber`, `btn-forge`), and any inline color overrides. Note whether `forge-gradient-text` appears more than once above the fold.

**Remediate (in order):**

1. **Assign accent roles:** cyan for `section-label` / informational eyebrows; amber for primary CTA (`btn-forge`) and accent cards (`card-amber`); remove stray Bootstrap semantic buttons (`btn-success`, `btn-warning`, `btn-info`).
2. **Restore dark foundation:** replace accidental `bg-light` bands with `forge-section` on dark surfaces, or isolate intentional light strips with clear hierarchy and matching typography tokens.
3. **Limit gradient display:** keep `forge-gradient-text` on the hero `product-landing-title` (or one focal headline); revert section and card titles to solid `font-display` color.
4. **Align theme pack:** marketing/product pages use `landing-hero` + `forgesdlc-theme.css` patterns; handbook pages stay on `docs-theme.css` cues—do not mix kicker/hero marketing classes into chapter bodies.
5. **Remove inline hex and custom gradients**; map colors to Forge CSS variables (`--forge-amber`, `--forge-cyan`, `--forge-bg`) and re-run `DET.TOKEN.NO_DRIFT` when policy is enabled.
6. **Tune ambient intensity** so cyan/amber atmosphere stays behind scrimmed content (`AI.AMBIENT.READABILITY_CONFLICT`).
7. Re-run AI batch with `principleId: AI.THEME.PERSONALITY_COHERENCE`; propose a deterministic companion when the same accent drift repeats (for example banning non-Forge button classes on product landing roots).

## Related rules

- `AI.PREMIUM.ENTERPRISE_FEEL` — spacing, typography, and surface finish must feel deliberate; personality coherence is part of that calm.
- `AI.AMBIENT.READABILITY_CONFLICT` — expressive ambient layers must not become a competing accent system behind copy.
- `AI.VISUAL.HIERARCHY_CONFIDENCE` — predictable accent roles reinforce focal path; random hues flatten hierarchy.
- `DET.TOKEN.NO_DRIFT` — raw hex and off-palette colors break Forge temperament even when contrast passes.
- `DET.THEME.FONT_STACK` — display, body, and label fonts must match approved stacks for the loaded theme pack.
- `DET.THEME.CONTRAST_MIN` — dark/light balance must remain readable after accent cleanup.
- `DET.SURFACE.ELEVATION_TOKEN` — `forge-card`, `glass`, and `glass-amber` use governed elevation, not one-off glow stacks that fight the theme.
