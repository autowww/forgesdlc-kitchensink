---
rule_id: AI.CONTEXT.COGNITIVE_CLARITY
lane: ai
title: Cognitive clarity
summary: A first-time reader can form a correct mental model in one pass—jargon is explained before reuse, headings match substance, and depth is staged.
page_version: c98f19a56c2b082c37cb1d42807999dbe41e920ab262a3ca15acf9a67f7644ab
generated_at: 2026-05-19T20:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-context-cognitive-clarity
---

## Purpose

Kitchen Sink **`landing_page`** and **`product_page`** shells (`landing-hero`, `forge-section`, `section-label`, `forge-card`) are built to tell a product story in layers. This AI rule judges whether a **first-time reader** can build the right mental model **in one pass**—without insider vocabulary, heading bait-and-switch, or reference dumps where an outcome should live.

Deterministic checks (`DET.SECTION.HEADING`, `DET.CONTEXT.BURDEN`, `DET.PROSE.LENGTH`) catch structural budgets and heading order; this rule covers judgment they miss: acronyms used before definition, section titles that do not match body substance, and technical depth placed above the fold before the reader knows what the product does.

**Plan:** Read the first viewport and the next section as a stranger—note undefined terms, logical jumps, and headings that promise one job but deliver another. **Do:** Lead with problem → outcome → mechanism; define Forge terms inline on first use; link schemas, APIs, and long indexes below the story. **Check:** A colleague can paraphrase the page's single promise without guessing. **Adjust:** If the same clarity defect repeats (undefined product names in heroes, misleading `section-label` text), propose a deterministic `DET.*` companion.

## Passing signals

- Hero copy states **what it is and who it is for** in plain language before naming sub-products (`product-landing-title` → short `landing-hero-tagline` → one primary CTA).
- Product names (**Lenses**, **LCDL**, **Fleet**, **ForgeSDLC**) appear **after** a one-line plain-language gloss, or only in a dedicated ecosystem band—not unexplained in the headline.
- Each `section-label` and following `h2`/`h3` **match the section body** (no "Quickstart" band that is actually a schema dump).
- Progressive disclosure: API tables, prop lists, and long `forge-support` asides live in the **next** `forge-section` or behind a clear "Read reference" link—not in the hero grid.
- Headings follow a scannable ladder (`h1` once, section jobs obvious); in-page TOC entries (`DET.NAV.IN_PAGE_TOC`) align with what the eye sees.
- Paragraphs stay readable (`DET.PROSE.LENGTH`); lists use at most three bullets per card when explaining outcomes.

## Failing signals

- Headline or tagline stacks acronyms and internal codenames with **no** inline definition ("LCDL + Fleet + Lenses control plane" before the reader knows the problem).
- `section-label` or card `card-label` promises onboarding or outcomes but the body is endpoint lists, generated nav, or maintainer-only detail.
- Heading text is generic ("Overview", "Details", "More") while the section mixes unrelated jobs—reader cannot predict what they will learn.
- Hero `landing-hero-explainer` or `landing-hero-clarification` paragraphs jump from trust model to JSON shapes without a mechanism sentence in between.
- First screen reads like documentation cover: dense `forge-card` tiles with implementation vocabulary and no outcome framing.
- Jargon is **reused** in CTAs and secondary links before it was introduced anywhere on the page.

## Before example

Failing KS markup: undefined product names in the hero, misleading section label, reference dump in the outcomes band.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-cognitive-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Forge Platform</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          LCDL, Fleet, and Lenses in one spine
        </h1>
        <p class="forge-support landing-hero-tagline mb-4">
          POST /v1/jobs, SQLite job store, governed task operators, and workspace hash catalogs.
        </p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-2 mb-0">
            <a class="btn btn-forge" href="/schemas">Open schemas</a>
            <a class="btn btn-cyan-outline" href="/reference">API reference</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Sec" data-ks-hash="Sec" data-ks-type="section" data-ks-name="outcomes-mismatch">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What you get on day one</h2>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="forge-card p-4 h-100">
          <p class="card-label">Reference</p>
          <h3 class="h5 mt-2">Job plane endpoints</h3>
          <ul class="forge-support mb-0">
            <li><code>POST /v1/jobs</code> — docker_argv payload</li>
            <li><code>GET /v1/jobs/{id}</code> — status and logs pointer</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: plain-language promise first, terms defined on first use, outcomes band matches labels, reference deferred.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-cognitive-pass"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="row align-items-center g-4 landing-hero-grid">
      <div class="col-12 col-xl-7 landing-hero-copy text-center text-xl-start">
        <p class="landing-hero-kicker mb-0">Forge Platform</p>
        <h1 class="font-display forge-gradient-text product-landing-title mb-3">
          Governed delivery from intent to evidence
        </h1>
        <p class="forge-support landing-hero-tagline mb-2">
          Teams delegate more work to agents but still need clear intent, review gates, and proof.
        </p>
        <p class="landing-hero-clarification forge-support mb-4">
          <strong>Lenses</strong> (workspace visibility),
          <strong>LCDL</strong> (governed LLM tasks in Python), and
          <strong>Fleet</strong> (bounded job execution)—linked below, not assumed.
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

<section class="forge-section py-5" id="how-it-works" hash="Sec" data-ks-hash="Sec" data-ks-type="section" data-ks-name="outcomes-aligned">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What you get on day one</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust">
          <p class="card-label">Trust</p>
          <h3 class="h5 mt-2 mb-1">Bounded execution</h3>
          <p class="forge-support mb-0">Human approval points and inspectable job history.</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/quickstart">
          <p class="card-label">Speed</p>
          <h3 class="h5 mt-2 mb-1">Agent-ready structure</h3>
          <p class="forge-support mb-0">Intent and evidence without a docs dump in the hero.</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/reference">
          <p class="card-label">Depth</p>
          <h3 class="h5 mt-2 mb-1">Reference when you need it</h3>
          <p class="forge-support mb-0">Schemas and API tables live in Reference—not the first screen.</p>
        </a>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** first-viewport screenshot, heading outline (H1–H3), and a plain-language paraphrase test ("What is this page asking me to believe?"). Note any acronym or product name that appears before definition.

**Remediate (in order):**

1. Rewrite hero to **problem → outcome**; move endpoint lists, schemas, and maintainer vocabulary to Reference or a lower `forge-section`.
2. Align every `section-label` / `h2` with the section's single job (`DET.SECTION.SINGLE_JOB`); split mixed bands.
3. Define Forge terms **inline on first use** (short parenthetical or `landing-hero-clarification` sentence)—then reuse freely.
4. Stage depth: outcome cards in band two; mechanism diagram or steps in band three; link walls last.
5. Re-check `DET.SECTION.HEADING` order and `DET.CONTEXT.BURDEN` after edits.
6. If the pattern repeats (e.g. undefined product names in heroes), propose a deterministic companion such as a glossary-first hero lint or heading/substance matcher.

## Related rules

- `DET.SECTION.HEADING` — one heading per major section; order matches outline.
- `DET.SECTION.SINGLE_JOB` — each visible band does one job.
- `DET.CONTEXT.BURDEN` — first-screen link and control budgets.
- `DET.PROSE.LENGTH` — paragraph and list caps for scannability.
- `DET.NAV.IN_PAGE_TOC` — in-page TOC matches on-page headings.
- `AI.NARRATIVE.COHERENCE` — problem → outcome → mechanism → next step sequencing.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — page feels overwhelming despite passing numeric caps.
