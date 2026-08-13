---
rule_id: AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
lane: ai
title: Product explanatory value
summary: Product visuals, diagrams, and hero imagery must explain structure or user benefit—not generic decoration that could ship on any SaaS landing page.
page_version: e7ab9b3f6c3c1aebb070b32038485ee1b020647f568f8908b3e1cba25fbbd01d
generated_at: 2026-05-19T22:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-visual-product-explanatory-value
---

## Purpose

Kitchen Sink product surfaces—`render_product_landing_hero`, `landing-forge-visual`, `forge-diagram` / `ks-diagram-tile`, outcome `forge-card` bands, and chart mounts—often pass hash, alt-classification, and label checks while still failing the visitor's real question: **what does this product do, and what should I learn from this picture?**

Deterministic rules prove diagrams have labels (`DET.DIAGRAM.LABELS`), alt policy is coherent (`DET.DIAGRAM.ALT`), assets are registered (`DET.DIAGRAM.ASSET_REGISTRY`), and charts expose summaries (`DET.CHART.ALT_SUMMARY`). Legacy `product-visual` heuristics flag missing or decorative hero imagery on homepages. This AI rule judges **explanatory value**: whether the visual teaches product structure, mechanism, or outcome tied to adjacent claims—not wallpaper, stock icon grids, or interchangeable cloud-platform art.

**Plan:** For each informative visual block, read the headline, support copy, and caption together with the figure. Ask what a first-time reader learns that they could not learn from text alone. **Do:** Replace decorative assets with mechanism diagrams, labeled architecture, or product screenshots; write captions that name actors, boundaries, and benefit. **Check:** Removing the visual would lose a concrete mental model, not just atmosphere. **Adjust:** When the same decorative pattern repeats (empty-alt spectral hero, unlabeled icon grids), propose a `DET.*` candidate or tighten catalog `decorative_rule` / contract `semantics`.

## Passing signals

- **Hero visual answers the headline:** `landing-hero-visual` shows a governance spine, workspace screenshot, or registered diagram whose `alt` names the same outcome as `product-landing-title` and `landing-hero-tagline` (informative images are not `role="presentation"` with empty `alt`).
- **Caption earns its space:** `figcaption`, `forge-support` under the tile, or `landing-hero-clarification` states structure or benefit (Intent → Human review → Agent execution → Evidence)—not "our powerful platform."
- **Diagrams tied to claims:** `forge-diagram` / `ks-diagram-tile` in a labeled `forge-section` uses a catalog key or template that matches the section mechanism story; expand triggers (`forge-diagram-trigger`, `data-diagram-key`) deepen the same narrative.
- **Icons map to product layers:** card or band icons label control plane, data boundary, or workflow step—not anonymous glyphs at equal weight.
- **Charts teach outcome:** takeaway copy sits beside `ks-chart-mount` (see `AI.DATA.INSIGHT_LEGIBILITY`); color emphasis supports the sentence, not decoration alone.
- **Decorative assets stay decorative:** ambient sinusoids and spectral backgrounds use `aria-hidden` / empty `alt` behind copy, not as the only product proof in the fold.
- **Visual type matches intent:** `landing-hero-visual--cover` raster art shows real UI chrome; SVG templates are chosen for the mechanism class (gate chain, linear flow)—not whichever thumbnail looked polished.

## Failing signals

- **Generic hero filler:** `landing-forge-visual` with `role="presentation"`, empty `alt`, and a spectral or mesh background while copy promises governed delivery architecture.
- **Stock metaphor soup:** unlabeled icon grids, cloud + lock + gear tiles, or `assets/svg/diagrams/generic-cloud.svg` with no mapping to product nouns on the page.
- **Caption-free mechanism:** dense `ks-diagram-canvas` topology with no figcaption, support line, or expandable legend—visitor must infer structure from shapes alone.
- **Misleading classification:** informative diagram marked decorative (`DET.DIAGRAM.ALT` may pass category while explanatory value still fails).
- **Duplicate story, zero visual information:** hero image repeats the headline verbatim with no new nodes, boundaries, or workflow steps.
- **Decoration at hero scale:** largest above-fold visual is ambient texture or brand flourish; real mechanism diagram pushed far below the headline.
- **Placeholder art:** lorem diagram labels, Feature / Feature / Feature cards with identical glyphs and no anatomy link to contracts or hashes.

## Before example

Failing KS markup: headline claims governed delivery, but the hero visual is decorative spectral art with empty `alt`; a generic cloud icon sits in an outcome card with no product mapping.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-explanatory-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">
            Governed human and agent delivery
          </h1>
          <p class="forge-support landing-hero-tagline mb-0">
            See how intent, review gates, and evidence connect across your workspace.
          </p>
        </div>
        <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
          <div class="landing-forge-visual breathe-static" role="presentation" aria-hidden="true">
            <img
              src="assets/svg/backgrounds/sinusoids/bg-fourier-forge-spectral-animated-01.svg"
              alt=""
              width="800"
              height="450"
              class="landing-forge-visual__img"
              decoding="async"
              fetchpriority="low"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcome-icons-generic">
  <div class="container">
    <p class="section-label text-cyan mb-2">Why teams choose us</p>
    <h2 class="h3 mb-4">Everything you need</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100 text-center">
          <img src="assets/svg/diagrams/generic-cloud.svg" alt="" class="mb-2" width="48" height="48" />
          <h3 class="h6 mb-1">Secure</h3>
          <p class="forge-support small mb-0">Enterprise-grade protection</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100 text-center">
          <img src="assets/svg/diagrams/generic-cloud.svg" alt="" class="mb-2" width="48" height="48" />
          <h3 class="h6 mb-1">Fast</h3>
          <p class="forge-support small mb-0">Move at AI speed</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100 text-center">
          <img src="assets/svg/diagrams/generic-cloud.svg" alt="" class="mb-2" width="48" height="48" />
          <h3 class="h6 mb-1">Smart</h3>
          <p class="forge-support small mb-0">Powered by agents</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: hero visual is an informative governance diagram with meaningful `alt`; outcome cards name mechanisms; a below-fold diagram section ties caption to topology.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-explanatory-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
          <p class="landing-hero-kicker mb-0">Forge Platform</p>
          <h1 class="font-display forge-gradient-text product-landing-title mb-3">
            Governed human and agent delivery
          </h1>
          <p class="forge-support landing-hero-tagline mb-2">
            Structure intent, keep human review gates, and ship with evidence—not ambient decoration alone.
          </p>
          <p class="landing-hero-clarification forge-support mb-0">
            The diagram shows the same spine the product implements: intent → review → bounded agent work → release artifact.
          </p>
        </div>
        <div class="col-12 col-xl-5 col-lg-10 landing-hero-visual">
          <div class="landing-forge-visual">
            <img
              src="assets/svg/template-gate-chain.svg"
              alt="Gate chain: Intent, Human review gate, Agent execution inside scope, Release with evidence"
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

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcome-mechanisms-labeled">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What each layer gives you</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Human control</p>
          <h3 class="h5 mt-2 mb-1">Review before agent work</h3>
          <p class="forge-support mb-0">
            Gates in the diagram match operator-owned approval points—not a generic lock icon.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#evidence">
          <p class="card-label">Evidence</p>
          <h3 class="h5 mt-2 mb-1">Artifacts you can inspect</h3>
          <p class="forge-support mb-0">
            Release node ties to logs and contracts linked from this handbook.
          </p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/how-it-works">
          <p class="card-label">Mechanism</p>
          <h3 class="h5 mt-2 mb-1">Full gate-chain detail</h3>
          <p class="forge-support mb-0">
            Expand the registered diagram below for labels and catalog legend keys.
          </p>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="section" data-ks-name="delivery-gate-chain-detail">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Gate chain matches the hero visual</h2>
    <p class="forge-support mb-4">
      Follow left-to-right: intent is shaped, humans approve, agents execute inside scope, then release carries evidence.
    </p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-0"
      data-diagram-key="gate-chain-delivery"
      role="figure"
      onclick="openDiagramWithDetail(this, 'gate-chain-delivery')"
    >
      <div class="ks-diagram-canvas">
        <img
          src="assets/svg/template-gate-chain.svg"
          alt="Gate chain: Intent, Human review gate, Agent execution, Release checkpoint"
          loading="lazy"
        />
      </div>
    </div>
    <p class="forge-support small mt-2 mb-0">
      Same topology as the hero: captions name actors and order so the visual teaches structure, not mood.
    </p>
  </div>
</section>
```

## Evidence and remediation

**Capture:** screenshot of hero and any diagram/chart band at desktop and narrow widths; copy `alt`, figcaption, and the headline or `landing-hero-tagline` they should support; note `data-diagram-key`, `src`, and catalog contract paths; record whether `hero_primary_visual.decorative_guess` fired in analyzer output.

**Remediate (in order):**

1. State the **one-sentence mechanism or benefit** the visual must teach (actors, boundaries, order, artifact).
2. Replace decorative hero assets with a **registered diagram, product screenshot, or labeled architecture**; fix `alt` and `role` / `aria-hidden` classification (`DET.DIAGRAM.ALT`).
3. Add or tighten **caption / clarification** copy (`landing-hero-clarification`, `forge-support` under `ks-diagram-tile`) so it names structure—not marketing adjectives.
4. Swap generic icon grids for **outcome cards** that reference real layers (`card-label`, linked trust or how-it-works sections).
5. For charts, add takeaway titles and summaries (`AI.DATA.INSIGHT_LEGIBILITY`, `DET.CHART.ALT_SUMMARY`).
6. Re-run AI review; if empty-alt spectral heroes repeat across consumers, propose a deterministic decorative-vs-informative proxy or homepage `product-visual` threshold tightening.

## Related rules

- `DET.DIAGRAM.ALT` — decorative vs informative classification for diagrams and hero imagery.
- `DET.DIAGRAM.LABELS` — SVG text and legend keys are present and readable.
- `DET.DIAGRAM.ASSET_REGISTRY` — diagram families are registered when shipped to consumers.
- `DET.CHART.ALT_SUMMARY` — charts expose non-trivial text summaries where required.
- `AI.DIAGRAM.SEMANTIC_ACCURACY` — diagram topology and arrows match captioned mechanism (adjacent judgment).
- `AI.DATA.INSIGHT_LEGIBILITY` — charts communicate the intended takeaway, not geometry alone.
- `AI.PREMIUM.ENTERPRISE_FEEL` — purposeful imagery supports calm polish; decorative noise undermines both.
- `AI.VISUAL.HIERARCHY_CONFIDENCE` — explanatory visuals should support the focal path, not compete with equal-weight filler.
