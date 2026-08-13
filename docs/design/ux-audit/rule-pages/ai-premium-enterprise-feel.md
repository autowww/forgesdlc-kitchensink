---
rule_id: AI.PREMIUM.ENTERPRISE_FEEL
lane: ai
title: Premium enterprise feel
summary: Pages feel deliberate, calm, and confident—generous spacing, refined typography, consistent surfaces, and purposeful visuals—not hectic template soup.
page_version: 654052a99fedd59f007f886b8b9aee4bf82b5b2857426b3de9dbe1f5577782ff
generated_at: 2026-05-19T22:10:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-premium-enterprise-feel
---

## Purpose

Kitchen Sink **`landing_page`**, **`product_page`**, and **`forge-card`** surfaces should read as **one deliberate system**—calm enough for enterprise buyers, confident enough to trust with governance work. This AI rule judges holistic polish: spacing generosity, typographic refinement, consistent radii and elevation, and imagery that earns its place. It does **not** replace token or contrast checks; it catches when everything technically passes yet still feels like assembled template fragments.

Deterministic rules guard elevation tokens, font stacks, and grid classes (`DET.SURFACE.ELEVATION_TOKEN`, `DET.TOKEN.NO_DRIFT`, `DET.LAYOUT.GRID_CONSISTENCY`); this rule guards **perceived finish** on screenshots and DOM review.

**Plan:** Walk the page top to bottom and note where rhythm breaks—cramped bands, mixed card treatments, ad-hoc inline styles, or decorative layers that cheapen copy. **Do:** Re-stage sections with KS layout primitives (`landing-hero`, `forge-section`, `section-label`, consistent `forge-card` variants). **Check:** First viewport and one mid-page band feel spacious, aligned, and typographically controlled. **Adjust:** When the same polish failure repeats (for example mixed card padding or competing accent stacks), propose a deterministic `DET.*` companion or catalog contract tightening.

## Passing signals

- Hero uses the **`landing-hero`** / **`fs-landing-hero-band`** stack with **`product-landing-title`**, a single **`landing-hero-tagline`**, and a restrained CTA pair—copy bands breathe; nothing feels crammed into the fold.
- Section rhythm repeats **`forge-section`** + **`section-label text-cyan`** + one **`h3`** heading; vertical padding (`py-5`, `g-3` / `g-4`) is generous and consistent between bands.
- Cards share one elevation language: **`forge-card`** with either default or **`card-amber`**, paired with **`breathe-link`** or **`breathe-static`**—not a mix of inline borders, one-off shadows, and unrelated Bootstrap card classes.
- Typography stays on the Forge scale: **`font-display`** for headlines, **`forge-support`** for body and hints, **`card-label`** for tile eyebrows—no arbitrary inline font sizes or weight stacks.
- Imagery and diagrams are **purposeful**: product visuals in **`landing-hero-visual`** or labeled **`forge-diagram`** sections support the claim; decorative noise does not compete with text.
- Accent usage is **restrained**: amber and cyan appear in predictable roles (primary CTA, section labels, one card accent column)—not every tile shouting a different color.
- Surfaces respect tokenized elevation and radius; dark background, glass cards, and ambient layers feel cohesive with **`forgesdlc-theme.css`** / **`forge-theme.css`**—not a patchwork of legacy marketing classes.

## Failing signals

- **Template soup**: adjacent sections use different card shells (`forge-card`, raw `glass`, Bootstrap `card`, inline-styled divs) with mismatched padding and corner radii.
- **Cramped first screen**: hero copy, three outcome tiles, stat band, and announcement strip stack with `g-1` / `g-2` gaps—reads hectic despite passing numeric burden caps.
- **Typography drift**: headlines mix `h1`–`h5` without hierarchy, inline `font-size` overrides, or body copy outside **`forge-support`** / **`landing-hero-tagline`** patterns.
- **Competing accents**: every **`forge-card`** uses a different accent modifier, gradient text, and button style—no calm focal path (`AI.VISUAL.HIERARCHY_CONFIDENCE`).
- **Decorative filler**: stock-style icon grids, placeholder diagrams, or expressive ambient mesh behind dense copy—visuals do not explain product structure (`AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`).
- **Hype stacking**: loud gradients, badge rows, and superlatives layered on top of already busy layout—undermines enterprise calm (`AI.CREDIBILITY.NO_OVERCLAIM`).
- **Broken rhythm**: columns misaligned across rows, inconsistent `container` vs `container-fluid` widths, or sections that jump between full-bleed and narrow rails without reason.

## Before example

Failing KS markup: cramped hero, mixed card treatments, inline styling, and competing accents—template soup despite using some Forge classes.

```html
<section class="landing-hero forge-section py-2" style="background: linear-gradient(135deg,#1a1030,#0A0E17);">
  <div class="container px-2">
    <div class="row g-1 align-items-center">
      <div class="col-12 col-lg-8">
        <p class="mb-1" style="font-size:0.65rem;letter-spacing:0.3em;color:#06B6D4;">PLATFORM · AI · GOVERNANCE · DOCS</p>
        <h1 class="mb-2" style="font-size:2.8rem;font-weight:900;">Everything you need!!!</h1>
        <p class="mb-2">Agents, automation, compliance, analytics, dashboards, and more in one place.</p>
        <div class="d-flex flex-wrap gap-1 mb-2">
          <a class="btn btn-warning btn-sm" href="#">Get started</a>
          <a class="btn btn-outline-info btn-sm" href="#">Learn more</a>
          <a class="btn btn-success btn-sm" href="#">Book demo</a>
          <a class="btn btn-secondary btn-sm" href="#">Watch video</a>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card bg-dark border-info p-2" style="border-radius:4px;">
          <img src="assets/svg/diagrams/generic-cloud.svg" alt="" class="img-fluid" />
        </div>
      </div>
    </div>
    <div class="row g-1 mt-1">
      <div class="col-md-4">
        <div class="forge-card p-2" style="box-shadow:0 0 24px #F59E0B;">
          <strong>Fast</strong>
          <p class="mb-0 small">Ship instantly</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass p-3" style="border:2px solid #06B6D4;border-radius:12px;">
          <span class="text-cyan">Secure</span>
          <p class="mb-0">Enterprise grade</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-amber p-4">
          <h4 class="text-amber mb-0">Smart AI</h4>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-3">
  <div class="container-fluid px-1">
    <h2 style="font-size:1.1rem;">Why teams choose us</h2>
    <div class="row g-2">
      <div class="col-6 col-md-3"><div class="forge-card breathe-static p-1 text-center">Feature</div></div>
      <div class="col-6 col-md-3"><div class="forge-card breathe-static p-1 text-center">Feature</div></div>
      <div class="col-6 col-md-3"><div class="forge-card breathe-static p-1 text-center">Feature</div></div>
      <div class="col-6 col-md-3"><div class="forge-card breathe-static p-1 text-center">Feature</div></div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: calm hero rhythm, consistent card language, generous spacing, and restrained accents on real layout primitives.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-enterprise-feel-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">
            Governed delivery you can inspect
          </h1>
          <p class="forge-support landing-hero-tagline mb-4">
            Structure intent, delegate safely, and keep human review points—presented with calm, deliberate spacing.
          </p>
          <div class="landing-hero-actions">
            <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
              <a class="btn btn-forge" href="/quickstart">Start with Quickstart</a>
              <a class="btn btn-cyan-outline" href="/how-it-works">See how it works</a>
            </p>
          </div>
        </div>
        <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
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

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcomes-calm">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What changes for your team</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Control</p>
          <h3 class="h5 mt-2 mb-1">Human-owned gates</h3>
          <p class="forge-support mb-0">
            Review points stay visible—copy and card treatment match the rest of the page.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#evidence">
          <p class="card-label">Evidence</p>
          <h3 class="h5 mt-2 mb-1">Inspectable artifacts</h3>
          <p class="forge-support mb-0">
            Logs and contracts linked with the same elevation and typography rhythm as adjacent tiles.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/docs/architecture">
          <p class="card-label">Depth</p>
          <h3 class="h5 mt-2 mb-1">Mechanism on demand</h3>
          <p class="forge-support mb-0">
            Technical detail deferred to docs—this band stays spacious and scannable.
          </p>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="fs-landing-section fs-marketing-stat-band py-5 px-2 px-md-3">
  <div class="container-fluid px-3 px-xxl-5" style="max-width:90rem;margin:0 auto;">
    <h2 class="h3 text-center mb-4 font-display">Operating model at a glance</h2>
    <div class="row g-3 g-lg-4 justify-content-center forge-stat-band">
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="glass p-4 forge-stat forge-stat--amber h-100">
          <p class="fs-marketing-stat-band__title forge-support small mb-2 mb-lg-3">Intent</p>
          <div class="stat-value text-amber">Shape</div>
          <p class="fs-marketing-stat-band__hint forge-support small text-muted mb-0 mt-2">
            Clear problem statement before delegation
          </p>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="glass p-4 forge-stat forge-stat--cyan h-100">
          <p class="fs-marketing-stat-band__title forge-support small mb-2 mb-lg-3">Execution</p>
          <div class="stat-value text-cyan">Delegate</div>
          <p class="fs-marketing-stat-band__hint forge-support small text-muted mb-0 mt-2">
            Bounded jobs and governed LLM tasks
          </p>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="glass p-4 forge-stat forge-stat--amber h-100">
          <p class="fs-marketing-stat-band__title forge-support small mb-2 mb-lg-3">Assurance</p>
          <div class="stat-value text-amber">Review</div>
          <p class="fs-marketing-stat-band__hint forge-support small text-muted mb-0 mt-2">
            Evidence you can trace—not decorative KPI noise
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** full-page and first-viewport screenshots; note section spacing (`py-*`, `g-*`), card variant mix, typography classes vs inline overrides, accent usage, and whether imagery supports the story. Record relevant hashes (`hash="Ldg"`, outcome section roots) and theme pack if present.

**Remediate (in order):**

1. **Restage the hero** on `landing-hero` / `fs-landing-hero-band` with one kicker, title, tagline, and CTA pair—remove extra copy bands and button rows that break calm (`AI.CONTEXT.BURDEN_SUBJECTIVE`).
2. **Normalize cards** to `forge-card` + `card-amber` (when accent is needed) + `breathe-link` / `breathe-static`; drop inline shadows, borders, and one-off Bootstrap `card` shells.
3. **Restore section rhythm**: `forge-section` or `fs-landing-section`, `section-label`, consistent `container` / `landing-hero-wide` widths, and `g-3` / `g-4` gutters (`DET.LAYOUT.GRID_CONSISTENCY`).
4. **Align typography** to `font-display`, `product-landing-title`, `forge-support`, and `card-label`; remove inline font-size and weight hacks.
5. **Tame accents and ambient layers** so cyan/amber appear in predictable roles (`AI.THEME.PERSONALITY_COHERENCE`); keep expressive mesh out of text-heavy heroes.
6. **Swap decorative imagery** for product-explanatory diagrams or defer dense topology below the fold (`AI.VISUAL.PRODUCT_EXPLANATORY_VALUE`).
7. Re-run AI batch with `principleId: AI.PREMIUM.ENTERPRISE_FEEL`; set `deterministicCoverage` and propose `DET.*` promotion when the same polish defect repeats (for example banned inline style on hero roots or mixed card padding tiers).

## Related rules

- `AI.VISUAL.HIERARCHY_CONFIDENCE` — scale, contrast, and grouping establish an obvious focal path without equal-weight shouting.
- `AI.VISUAL.RHYTHM_SUBJECTIVE` — spacing and grouping feel rhythmic, not accidental pile-ups.
- `AI.THEME.PERSONALITY_COHERENCE` — theme accents and dark/light balance reinforce brand temperament without fighting content.
- `AI.CREDIBILITY.NO_OVERCLAIM` — hype stacking and fake proof rows undermine enterprise calm.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — numeric caps can pass while the page still feels visually noisy and cramped.
- `DET.SURFACE.ELEVATION_TOKEN` — card and glass surfaces use governed elevation roles, not ad-hoc shadows.
- `DET.TOKEN.NO_DRIFT` — colors, radii, and spacing stay on Forge tokens rather than inline overrides.
- `DET.LAYOUT.GRID_CONSISTENCY` — column widths and gutters align across sections on the same page mode.