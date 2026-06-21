---
rule_id: AI.NARRATIVE.COHERENCE
lane: ai
title: Narrative coherence
summary: The page tells one ordered story—problem, outcome, mechanism, next step—with section sequencing that does not contradict earlier claims.
page_version: b6ebf728d379d1b4e965405508dc63b6cbca4bc9dd44bf63f07a532e235169a7
generated_at: 2026-05-28T17:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-narrative-coherence
related_rules:
  - DET.PAGE.MODE
  - DET.SECTION.SINGLE_JOB
  - DET.SECTION.HEADING
  - DET.CTA.HIERARCHY
  - AI.CONTEXT.COGNITIVE_CLARITY
  - AI.TRUST.BOUNDARY_CLARITY
  - AI.VISUAL.HIERARCHY
  - AI.CREDIBILITY.NO_OVERCLAIM
  - AI.CONTEXT.BURDEN_SUBJECTIVE
---

## Purpose

Kitchen Sink **`landing_page`** and **`product_page`** shells stitch **`landing-hero`**, **`forge-section`**, outcome cards, mechanism steps, and final CTAs into a single arc. This AI rule judges whether the **visible section order** tells one story—**problem → outcome → mechanism → next step**—without argumentative contradictions between bands.

Deterministic checks (`DET.PAGE.MODE`, `DET.SECTION.HEADING`, `DET.SECTION.SINGLE_JOB`, `DET.CTA.HIERARCHY`) catch page mode, heading structure, and CTA prominence; they do **not** judge whether the reader's mental thread holds from hero to footer. A page can pass heading order yet still open with a signup CTA before stating the problem, place trust copy that conflicts with mechanism steps, or bury the outcome under reference content.

**Plan:** Sketch the story in four beats on paper; walk the DOM top to bottom and note where a beat is missing, reordered, or contradicted. **Do:** Re-sequence `forge-section` bands; align hero tagline, mechanism cards, and trust copy to the same boundary claims; defer dense reference to after the arc completes. **Check:** A stranger can retell the page as one sentence with four clauses in order. **Adjust:** If the same sequencing defect repeats (CTA before outcome, trust/mechanism mismatch), propose a deterministic `DET.*` companion such as a landing-band order lint.

## Passing signals

- Hero states the **problem and intended outcome** before naming implementation (`product-landing-title` → `landing-hero-tagline`; mechanism vocabulary waits for band three).
- The next major band delivers **outcomes or proof** (what changes for the reader)—not API tables, schemas, or maintainer indexes.
- A **mechanism band** (`section-label` "How it works" or equivalent) explains *how* the outcome is achieved with 4–6 ordered steps or cards—after outcomes, before the hard sell.
- **Trust or boundary copy** (`forge-card` trust tiles, `landing-hero-clarification`) uses the same data/execution/human-control claims as the mechanism band—no silent policy flip.
- **Primary CTA** appears after the reader understands problem, outcome, and mechanism; secondary links point to depth, not a competing story (`btn-forge` → Quickstart or `#how-it-works`, not three equal primaries).
- In-page progression matches scan order: no footer CTA promising "local-only" when an earlier band already described a hosted control plane.
- Section labels and headings **advance the plot** (Problem → Outcomes → How it works → Trust → Next step)—not five bands all titled "Overview".

## Failing signals

- Hero headline is a **feature list or endpoint catalog** with no problem frame; reader never learns why the page exists.
- **CTA or signup band** appears before outcomes or mechanism—the page asks for action before earning the story.
- **Contradictory claims** across sections: hero says local-first / no cloud dependency; a later `forge-section` sells a hosted SaaS dashboard or managed tenancy without reconciliation.
- **Mechanism before motivation**: step cards or diagrams appear in band two while the outcome is still ambiguous.
- **Trust band contradicts mechanism**: "fully automated, no human gates" in one section and "human approval required" in the next without scope qualifiers.
- **Reference dump interrupts the arc**: schema tables or generated link walls sit between hero and outcomes, breaking narrative momentum.
- Sections **repeat the same beat** (two outcome grids back-to-back with no mechanism between) or **argue past each other** (band A says "for operators only"; band B promises "for every developer on day one").
- Final CTA copy **does not match** the story above (hero about methodology; footer button "Download compliance pack" with no preceding trust frame).

## Before example

Failing KS markup: CTA before outcome, mechanism scattered, and contradictory local vs hosted claims.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-narrative-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Forge Lenses</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          SQLite catalogs, hash registries, and POST /v1/admin routes
        </h1>
        <p class="forge-support landing-hero-tagline mb-4">
          Clone the repo, run the server, inspect workspace state—100% local, no cloud account.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="/signup">Create cloud workspace</a>
            <a class="btn btn-cyan-outline" href="/pricing">See hosted plans</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Ref" data-ks-hash="Ref" data-ks-type="section" data-ks-name="reference-interrupt">
  <div class="container">
    <p class="section-label text-cyan mb-2">Reference</p>
    <h2 class="h3 mb-4">Workspace API index</h2>
    <div class="forge-card p-4">
      <ul class="forge-support mb-0">
        <li><code>GET /v1/workspaces</code> — list tenants</li>
        <li><code>POST /v1/workspaces</code> — provision hosted project</li>
      </ul>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Tru" data-ks-hash="Tru" data-ks-type="section" data-ks-name="trust-contradiction">
  <div class="container">
    <p class="section-label text-cyan mb-2">Trust</p>
    <h2 class="h3 mb-4">Your data stays in our cloud</h2>
    <p class="forge-support mb-0">
      Managed tenancy, automatic sync, and zero local setup—sign up to start in minutes.
    </p>
  </div>
</section>
```

## After example

Passing KS markup: problem and outcome in hero, outcomes band, ordered mechanism, aligned trust, deferred CTA.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-narrative-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Forge Lenses</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          See workspace state before you delegate the next task
        </h1>
        <p class="forge-support landing-hero-tagline mb-2">
          Teams using agents need a visible control plane—not another opaque automation black box.
        </p>
        <p class="landing-hero-clarification forge-support mb-4">
          Outcome first: inspect repos, docs, and job history locally, then choose the next safe action.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="#how-it-works">See how it works</a>
            <a class="btn btn-cyan-outline" href="/docs">Read the docs</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcomes-band">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What changes on day one</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="forge-card card-amber p-4 h-100">
          <p class="card-label">Visibility</p>
          <h3 class="h5 mt-2 mb-1">Workspace snapshot</h3>
          <p class="forge-support mb-0">Know which repos, docs, and jobs matter before you act.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card card-amber p-4 h-100">
          <p class="card-label">Control</p>
          <h3 class="h5 mt-2 mb-1">Human gates stay explicit</h3>
          <p class="forge-support mb-0">Delegation stays bounded; approval points stay visible.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card card-amber p-4 h-100">
          <p class="card-label">Evidence</p>
          <h3 class="h5 mt-2 mb-1">Inspectable history</h3>
          <p class="forge-support mb-0">Job and doc changes link back to intent—not mystery automation.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" id="how-it-works" hash="Hiw" data-ks-hash="Hiw" data-ks-type="section" data-ks-name="mechanism-band">
  <div class="container">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h3 mb-4">From intent to the next safe action</h2>
    <div class="row g-3">
      <div class="col-md-3">
        <div class="forge-card p-3 h-100">
          <p class="card-label mb-1">1 · Connect</p>
          <p class="forge-support mb-0">Point Lenses at your local workspace root.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="forge-card p-3 h-100">
          <p class="card-label mb-1">2 · Inspect</p>
          <p class="forge-support mb-0">Review hashes, docs, and open jobs in one dashboard.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="forge-card p-3 h-100">
          <p class="card-label mb-1">3 · Decide</p>
          <p class="forge-support mb-0">Pick the next human or agent step with context attached.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="forge-card p-3 h-100">
          <p class="card-label mb-1">4 · Record</p>
          <p class="forge-support mb-0">Leave an evidence trail aligned to ForgeSDLC review gates.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Tru" data-ks-hash="Tru" data-ks-type="section" data-ks-name="trust-aligned">
  <div class="container">
    <p class="section-label text-cyan mb-2">Trust</p>
    <h2 class="h3 mb-4">Local-first by default</h2>
    <p class="forge-support mb-4">
      Data stays on infrastructure you run; optional Fleet jobs use token-scoped APIs—not a mandatory hosted tenancy.
    </p>
    <a class="btn btn-forge" href="/quickstart">Start local Quickstart</a>
  </div>
</section>
```

## Evidence and remediation

**Capture:** full-page screenshot with section labels visible; heading outline (H1–H3) annotated with story beats (P/O/M/N); a one-sentence paraphrase test ("Because … teams get … by … so next …"). Flag any claim that appears twice with different scope.

**Remediate (in order):**

1. Rewrite hero to **problem + outcome** only; strip mechanism vocabulary and premature CTAs from the first viewport.
2. Insert or reorder an **outcomes** `forge-section` before mechanism; each card states one reader benefit, not endpoint names.
3. Add **How it works** (4–6 steps) after outcomes; steps must explain the outcome cards above, not introduce a new product story.
4. Place **trust/boundary** copy after mechanism; reconcile data, execution, and human-control language with hero and steps (`AI.TRUST.BOUNDARY_CLARITY`).
5. Move API indexes, schemas, and generated nav to **Reference** after the arc; keep one primary CTA aligned with the final beat (`DET.CTA.HIERARCHY`).
6. Re-read top to bottom for **contradictions**; add scope qualifiers instead of silent policy changes.
7. If the same reordering defect repeats across pages, propose a deterministic companion (e.g. landing-band sequence lint keyed on `section-label` patterns).

## Related rules

- `DET.PAGE.MODE` — page declares landing vs docs mode; narrative arc expectations differ by mode.
- `DET.SECTION.SINGLE_JOB` — each band advances one story beat, not mixed jobs.
- `DET.SECTION.HEADING` — heading ladder matches the on-page outline.
- `DET.CTA.HIERARCHY` — primary CTA prominence after the story earns the ask.
- `AI.CONTEXT.COGNITIVE_CLARITY` — jargon and heading substance; complements arc clarity.
- `AI.TRUST.BOUNDARY_CLARITY` — trust copy must not contradict mechanism claims mid-story.
- `AI.VISUAL.HIERARCHY` — focal path supports hero → proof → depth read order.
- `AI.CREDIBILITY.NO_OVERCLAIM` — story claims stay bounded and verifiable across sections.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — arc can be logically ordered yet still feel overwhelming.
