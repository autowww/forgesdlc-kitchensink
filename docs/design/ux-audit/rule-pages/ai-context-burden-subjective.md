---
rule_id: AI.CONTEXT.BURDEN_SUBJECTIVE
lane: ai
title: Subjective context burden
summary: Even when numeric first-screen caps pass, the page must not feel visually noisy, cognitively dense, or split by competing focal points.
page_version: 5c7a1c97a37ff3c56c078d9489397cdba0c8350dbc4b720f9c8ecb87e78f7629
generated_at: 2026-05-19T19:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-context-burden-subjective
---

## Purpose

Kitchen Sink **`landing_page`** and **`product_page`** shells can satisfy **`DET.CONTEXT.BURDEN`** numeric caps—hero interactive controls ≤ 3, header nav links ≤ 7, pre-main link clusters within budget—while still **feeling overwhelming** on screenshot review. This AI rule catches subjective overload that counts miss: stacked hero copy bands, dense diagrams beside headlines, multiple equal-weight cards in the first viewport, and ambient or decorative layers that compete with the story.

Deterministic burden checks enforce enterprise first-screen **budgets**; this rule enforces **perceived load**. A page may pass every threshold yet fail if a first-time reader cannot pick a single focal path before the fold.

**Plan:** Capture the first viewport and ask whether one story wins—or whether hero copy, diagram, cards, and chrome all shout at equal volume. **Do:** Stage the product story (hero → outcomes → mechanism → depth); defer dense diagrams and link clusters below the fold. **Check:** Re-read with fresh eyes; confirm `DET.CONTEXT.BURDEN` still passes after edits. **Adjust:** If the same overload pattern repeats (for example hero copy band count or diagram-in-hero), propose a deterministic `DET.*` companion.

## Passing signals

- First viewport has **one dominant focal path**: gradient `product-landing-title` → short `landing-hero-tagline` → primary CTA pair—not six parallel copy bands.
- Hero interactive controls stay within budget **and** read as a clear next step (`btn btn-forge` + one secondary), not a button row plus a secondary link wall.
- Product visuals (`landing-hero-visual`, `landing-forge-visual` from `render_landing_signal_field`) **support** the headline; dense `forge-diagram` / `ks-diagram-tile` topology is deferred to a labeled section below the fold.
- Outcome or proof content lives in the **next** `forge-section` with `section-label`, not three equal-weight `forge-card` tiles competing with the hero in the same viewport.
- Ambient layers use restrained modifiers (`forge-ambient--subtle`) when explanatory copy is present; expressive mesh stays out of text-heavy heroes.
- Each visible band has a single job (`DET.SECTION.SINGLE_JOB`); navigation chrome is curated, not duplicated as inline link clusters inside the hero.

## Failing signals

- Hero stacks kicker, two-line title, tagline, clarification, explainer, audience line, CTA row, secondary links, **and** support bullets—reads as a wall even with ≤ 3 buttons.
- Large labeled architecture diagram (`ks-diagram-tile`, `forge-diagram`) sits beside the headline at hero scale, forcing split attention before the promise lands.
- Three or more `forge-card` outcome tiles with `card-amber` accents share the first viewport with the hero at equal visual weight.
- Competing `section-label` headings, announcement strips, and hero kickers create **multiple entry points** with no clear read order.
- Numeric caps pass (`DET.CONTEXT.BURDEN` green) but screenshot review still feels like documentation cover or link-wall lite—visual noise and competing focal points dominate.

## Before example

Failing KS markup: within numeric hero-control budget, but copy bands, dense diagram, and outcome cards compete in one viewport.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--hero forge-ambient--expressive"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-page-overload"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 landing-hero-grid">
        <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">
            Governed delivery spine
            <span class="product-landing-title__line2 d-block mt-1">for human-owned agent execution</span>
          </h1>
          <p class="forge-support landing-hero-tagline mb-2">Intent, structure, delegation, review, and evidence in one workspace.</p>
          <p class="landing-hero-clarification forge-support mb-3">Not a docs tree—a product control plane you can inspect.</p>
          <p class="landing-hero-explainer forge-support mb-2">Lenses shows workspace state; LCDL governs LLM tasks; Fleet runs bounded jobs.</p>
          <p class="landing-hero-audience forge-support text-muted mb-4">For platform engineers, operators, and methodology leads.</p>
          <div class="landing-hero-actions">
            <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-3">
              <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
              <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
            </p>
            <p class="landing-hero-secondary-links forge-support text-muted mb-0">
              <a class="landing-hero-secondary-link" href="/trust">Trust</a>
              <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
              <a class="landing-hero-secondary-link" href="/schemas">Schemas</a>
              <span class="landing-hero-secondary-sep" aria-hidden="true">·</span>
              <a class="landing-hero-secondary-link" href="/operate">Operate</a>
            </p>
          </div>
          <ul class="landing-hero-support list-unstyled forge-support mb-0 mt-3">
            <li class="landing-hero-support__item">Local-first workspace visibility</li>
            <li class="landing-hero-support__item">Governed LLM task layer</li>
            <li class="landing-hero-support__item">Token-protected job plane</li>
          </ul>
        </div>
        <div class="col-12 col-xl-5 landing-hero-visual">
          <figure class="forge-diagram breathe-static ks-diagram-tile ks-diagram-trigger mb-0">
            <div class="ks-diagram-canvas">
              <img src="assets/svg/diagrams/platform-architecture.svg" alt="Platform architecture with twelve labeled nodes and crossing edges" />
            </div>
            <figcaption class="forge-support small mt-2 mb-0">Full platform topology—all subsystems visible</figcaption>
          </figure>
        </div>
      </div>
    </div>
    <div class="row g-3 mt-2">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#methodology">
          <p class="card-label">Methodology</p>
          <h5 class="mt-2 mb-1">ForgeSDLC</h5>
          <p class="forge-support mb-0">Intent to evidence</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#lenses">
          <p class="card-label">Control plane</p>
          <h5 class="mt-2 mb-1">Lenses</h5>
          <p class="forge-support mb-0">Workspace visibility</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#lcdl">
          <p class="card-label">Reasoning</p>
          <h5 class="mt-2 mb-1">LCDL</h5>
          <p class="forge-support mb-0">Governed LLM tasks</p>
        </a>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: same product story staged—short hero, signal visual, outcome cards in the next section, diagram deferred.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section forge-ambient forge-ambient--mesh-bloom forge-ambient--subtle"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-page-staged"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid justify-content-center justify-content-xl-between">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">Governed delivery spine</h1>
          <p class="forge-support landing-hero-tagline mb-4">Human-owned intent, agent execution, and reviewable evidence—without opening the full handbook first.</p>
          <div class="landing-hero-actions">
            <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
              <a class="btn btn-forge" href="/quickstart">Start quickstart</a>
              <a class="btn btn-cyan-outline" href="/docs">Read docs</a>
            </p>
          </div>
        </div>
        <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
          <div class="landing-forge-visual breathe-static" role="presentation" aria-hidden="true">
            <img src="assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg" alt="" width="800" height="450" class="landing-forge-visual__img" decoding="async" fetchpriority="low" />
          </div>
          <p class="forge-support small mt-2 mb-0 text-center text-xl-start">One governed-flow snapshot—not the full architecture map.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcome-cards">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-amber mb-2">Outcomes</p>
    <h2 class="h4 mb-4">Three layers, one story</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#methodology">
          <p class="card-label">Methodology</p>
          <h5 class="mt-2 mb-1">ForgeSDLC</h5>
          <p class="forge-support mb-0">Shape intent and release with evidence</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#lenses">
          <p class="card-label">Control plane</p>
          <h5 class="mt-2 mb-1">Lenses</h5>
          <p class="forge-support mb-0">See workspace state and next safe action</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="#lcdl">
          <p class="card-label">Reasoning</p>
          <h5 class="mt-2 mb-1">LCDL</h5>
          <p class="forge-support mb-0">Versioned, schema-aware LLM tasks</p>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Hiw" data-ks-hash="Hiw" data-ks-type="section" data-ks-name="architecture-diagram">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Platform topology</h2>
    <p class="forge-support mb-4">Full subsystem map for readers who already understand the promise.</p>
    <figure class="forge-diagram breathe-static ks-diagram-tile ks-diagram-trigger">
      <div class="ks-diagram-canvas">
        <img src="assets/svg/diagrams/platform-architecture.svg" alt="Platform architecture diagram" />
      </div>
    </figure>
  </div>
</section>
```

## Evidence and remediation

**Capture:** desktop first-viewport screenshot; note whether `DET.CONTEXT.BURDEN` passed. Crop hero copy column, hero visual, and any cards visible without scrolling. Record competing focal points and copy band count.

**Remediate (in order):**

1. Collapse hero copy to kicker + headline + one tagline; move clarification, ecosystem lists, and support bullets below the fold or into outcome cards.
2. Replace hero-scale dense diagrams with a **signal visual** (`landing-forge-visual` / product screenshot); defer full `ks-diagram-tile` to a labeled How it works section with intro copy.
3. Move outcome `forge-card` rows into the next `forge-section`; keep ≤ 3 cards per row and one `section-label` per band.
4. Step ambient intensity down (`forge-ambient--subtle`) when hero copy is long; add scrim/card surfaces if mesh remains visible (`AI.AMBIENT.READABILITY_CONFLICT`).
5. Re-run `DET.CONTEXT.BURDEN`; if subjective overload repeats with stable DOM signals (hero copy band count, diagram-in-hero), propose a deterministic companion (for example max hero copy paragraphs above CTA).

## Related rules

- `DET.CONTEXT.BURDEN` — numeric first-screen / chrome caps (hero controls, nav links, link clusters).
- `AI.CONTEXT.COGNITIVE_CLARITY` — first-time readers can form a correct mental model in one pass.
- `AI.NARRATIVE.COHERENCE` — sections follow problem → outcome → mechanism → next step.
- `AI.VISUAL.HIERARCHY_CONFIDENCE` — scale, contrast, and grouping establish an obvious focal path.
- `DET.SECTION.SINGLE_JOB` — each section band serves one purpose, not stacked competing jobs.
