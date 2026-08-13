---
rule_id: AI.VISUAL.HIERARCHY
lane: ai
title: Visual hierarchy
summary: Scale, contrast, and grouping establish an obvious focal path—hero → proof → depth—with one primary next read and no equal-weight shouting.
page_version: f6d81bfc0c83823cf0838eb02cbc229098bdb56c430d718f216d638b0171f77e
generated_at: 2026-05-19T23:48:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-visual-hierarchy
---

## Purpose

Kitchen Sink **`landing_page`**, **`product_page`**, and **`forge-section`** bands communicate through **visual weight**—type scale, contrast steps, grouping, and CTA prominence—not only copy order. This AI rule judges whether a first-time scanner can answer **"what do I read next?"** without hunting: a clear **hero focal point**, a **proof or outcomes** band that supports it, then **depth** (mechanism, trust, reference) at deliberately lower weight.

Deterministic checks (`DET.CTA.HIERARCHY`, `DET.BUTTON.GROUP.MAX`, `DET.SECTION.HEADING`) catch button-class scans and heading ladders; they do **not** judge whether every tile, label, and accent competes at the same volume. A page can pass CTA class rules yet still present four equal primaries, three display-scale headlines in one viewport, or outcome cards that all shout with `card-amber` and `forge-gradient-text`.

**Plan:** Mark the intended focal path (hero headline → primary CTA → first proof band → mechanism). **Do:** Demote secondary actions to `btn-cyan-outline` / `landing-hero-secondary-link`; reserve `card-amber` and gradient display type for one beat per band. **Check:** Squint test—one dominant shape in the hero; proof band reads as support, not a second homepage. **Adjust:** When the same equal-weight pattern repeats, propose deterministic companions (CTA count caps, accent-role lint) or align with `AI.VISUAL.HIERARCHY_CONFIDENCE` promotion.

## Passing signals

- **Single hero focal**: one **`product-landing-title`** (`font-display forge-gradient-text`) dominates the fold; supporting copy uses **`landing-hero-tagline`** / **`forge-support`** at clearly lower weight.
- **CTA ladder**: one **`btn btn-forge`** primary in **`landing-hero-actions__buttons`**; secondary uses **`btn-cyan-outline`** or **`landing-hero-secondary-link`**—not four filled buttons at the same size.
- **Contrast steps**: section eyebrows use **`section-label text-cyan`**; band titles use **`h3`**; card titles use **`h5`**—no band opens with two display-scale headlines side by side.
- **Hero → proof → depth**: outcomes or trust tiles (`forge-card` + **`card-label`**) appear before dense reference tables or API indexes; proof cards share one elevation language (`breathe-link` / `breathe-static`).
- **Restrained accent**: at most one **`card-amber`** column per row draws extra attention; sibling tiles stay default **`forge-card`** so the featured outcome is obvious.
- **Grouping**: related controls sit in one **`landing-hero-actions`** or **`forge-section`** container with consistent `g-3` / `g-4` gaps—readers perceive chunks, not scattered widgets.
- **Visual defers to narrative**: hierarchy supports problem → outcome → mechanism (`AI.NARRATIVE.COHERENCE`); decorative diagrams in **`landing-hero-visual`** do not outrank the headline.

## Failing signals

- **Equal-weight shouting**: hero shows multiple `h2`/`h3` elements, badge rows, and stat callouts at similar size—no clear first read.
- **CTA democracy**: three or four filled buttons (`btn-forge`, `btn-warning`, `btn-success`) in one **`landing-hero-actions`** row—scanner cannot pick a primary path (`DET.BUTTON.GROUP.MAX` may pass class heuristics while judgment still fails).
- **Accent overload**: every outcome tile uses **`card-amber`**, cyan borders, and **`forge-gradient-text`**—nothing reads as support material.
- **Competing focal bands**: sticky promo bar, sidebar signup, and hero primary CTA share the same visual volume and color role.
- **Proof before focal**: reference/API **`forge-card`** or diagram wall sits in the first viewport beside a half-size headline—depth competes with the hero job.
- **Flat section bands**: five consecutive **`forge-section`** blocks each open with `h3` + three equally styled cards—no contrast step between "main story" and "supporting detail".
- **Typography drift**: inline `font-size` / `font-weight` overrides on headings break the Forge scale; body copy outside **`forge-support`** patterns fights card titles for attention.
- **Decorative dominance**: ambient mesh, oversized raster in **`landing-hero-visual`**, or animated accents draw the eye before **`product-landing-title`** copy.

## Before example

Failing KS markup: competing display headlines, four equal primaries, and outcome tiles that all shout at the same weight.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="hierarchy-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
      <div class="row align-items-center g-2 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Forge Platform</p>
        <h2 class="font-display forge-gradient-text h3 mb-2">New: Agent orchestration</h2>
        <h1 class="font-display forge-gradient-text product-landing-title mb-2" style="font-size:1.75rem;">
          Governed delivery
        </h1>
        <h2 class="font-display text-cyan h4 mb-3">Plus LCDL · Fleet · Lenses</h2>
        <p class="forge-support landing-hero-tagline mb-3">
          Everything you need for AI-assisted SDLC—in one banner.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="/signup">Start free</a>
            <a class="btn btn-forge" href="/demo">Book demo</a>
            <a class="btn btn-warning" href="/pricing">See pricing</a>
            <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
          </p>
        </div>
      </div>
      <div class="col-12 col-xl-5 landing-hero-visual">
        <div class="forge-card card-amber p-4 text-center">
          <p class="card-label text-cyan mb-1">Live stats</p>
          <p class="font-display forge-gradient-text h2 mb-0">99.9% uptime</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-4" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcomes-equal-weight">
  <div class="container">
    <h2 class="font-display forge-gradient-text h3 mb-3">Why teams choose Forge</h2>
    <div class="row g-2">
      <div class="col-md-4">
        <div class="forge-card card-amber breathe-link p-3 h-100">
          <h3 class="font-display forge-gradient-text h5 mb-2">Control</h3>
          <p class="forge-support mb-0">Human gates everywhere.</p>
        </div>
      </div>
      <div class="col-md-4">
          <div class="forge-card card-amber breathe-link p-3 h-100">
          <h3 class="font-display text-cyan h5 mb-2">Speed</h3>
          <p class="forge-support mb-0">Ship 10× faster with agents.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card card-amber breathe-link p-3 h-100">
          <h3 class="font-display text-amber h5 mb-2">Compliance</h3>
          <p class="forge-support mb-0">Certified out of the box.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: one hero focal, restrained CTA pair, proof band with a single accented tile, and calmer siblings.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="hierarchy-pass"
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
            One headline carries the fold; tagline and CTAs stay visibly subordinate.
          </p>
          <div class="landing-hero-actions">
            <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
              <a class="btn btn-forge" href="/quickstart">Start with Quickstart</a>
              <a class="btn btn-cyan-outline" href="#how-it-works">See how it works</a>
            </p>
            <p class="landing-hero-secondary-links forge-support text-muted mb-0 mt-2">
              <a class="landing-hero-secondary-link" href="/docs">Read architecture docs</a>
            </p>
          </div>
        </div>
        <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
          <div class="landing-forge-visual">
            <img
              src="assets/svg/diagrams/governed-delivery-spine.svg"
              alt="Spine from intent through review to evidence"
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

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcomes-hierarchy">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What changes for your team</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Primary outcome</p>
          <h3 class="h5 mt-2 mb-1">Human-owned gates</h3>
          <p class="forge-support mb-0">One accented tile marks the hero proof point; siblings stay quieter.</p>
        </a>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static h-100 p-3">
          <p class="card-label">Supporting</p>
          <h3 class="h5 mt-2 mb-1">Evidence trail</h3>
          <p class="forge-support mb-0">Default elevation and body scale—readable, not competing.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static h-100 p-3">
          <p class="card-label">Supporting</p>
          <h3 class="h5 mt-2 mb-1">Bounded automation</h3>
          <p class="forge-support mb-0">Depth links appear after the eye learns the focal path.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="How" data-ks-hash="How" data-ks-type="section" data-ks-name="mechanism-depth">
  <div class="container">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h3 mb-4">Mechanism at lower weight</h2>
    <p class="forge-support mb-0">
      Mechanism and reference bands use section labels and body copy—not a second display headline in the fold.
    </p>
  </div>
</section>
```

## Evidence and remediation

**Capture:** first-viewport screenshot with blur/squint check annotated; DOM outline of headings (`h1`–`h3`) and button classes in **`landing-hero-actions`**; list of accent roles per row (`card-amber`, `forge-gradient-text`, filled vs outline buttons). Note where a second band equals hero weight.

**Remediate (in order):**

1. Collapse hero to **one** `product-landing-title`; demote announcements to `landing-hero-kicker` or a later `forge-section`.
2. Enforce **one** `btn-forge` primary; move extras to `btn-cyan-outline`, `landing-hero-secondary-link`, or below the fold (`DET.CTA.HIERARCHY`).
3. Cap horizontal hero actions at two visible primaries; tuck overflow behind docs/nav (`DET.BUTTON.GROUP.MAX`).
4. In outcome rows, feature **one** `card-amber` tile; set siblings to `forge-card breathe-static` without gradient titles.
5. Re-stage bands: **proof** before API/reference dumps; lower mechanism/reference headings to `h3` + `forge-support` (`AI.NARRATIVE.COHERENCE`).
6. Remove inline heading overrides; restore `section-label` → `h3` → card `h5` ladder (`DET.SECTION.HEADING`).
7. If the same equal-weight defect repeats, record a `candidateDeterministicRule` (for example accent-role count per row) and cross-link `AI.VISUAL.HIERARCHY_CONFIDENCE`.

## Related rules

- `AI.VISUAL.HIERARCHY_CONFIDENCE` — canonical judgment lens for focal-path confidence; align promotions and findings across both ids.
- `DET.CTA.HIERARCHY` — one primary CTA class per logical viewport region.
- `DET.BUTTON.GROUP.MAX` — horizontal action count before overflow/disclosure.
- `DET.SECTION.HEADING` — heading ladder matches intended contrast steps.
- `AI.NARRATIVE.COHERENCE` — story order; hierarchy should reinforce hero → proof → depth sequencing.
- `AI.PREMIUM.ENTERPRISE_FEEL` — calm spacing and surface consistency; hierarchy failures often read as hectic polish.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — equal-weight tiles increase perceived noise even when burden metrics pass.

