---
rule_id: AI.CONTEXT.COGNITIVE_CLARITY
lane: ai
title: Cognitive clarity
summary: A first-time reader can form a correct mental model in one pass—jargon is explained before reuse, headings match substance, and depth is staged.
page_version: 6e81c7c0577b957c7d2acb206e7c6be73fbe0d30586eef5655a3fef5df21efb3
generated_at: 2026-05-28T17:12:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-context-cognitive-clarity
related_rules:
  - DET.SECTION.HEADING
  - DET.SECTION.SINGLE_JOB
  - DET.CONTEXT.BURDEN
  - DET.PROSE.LENGTH
  - DET.NAV.IN_PAGE_TOC
  - AI.NARRATIVE.COHERENCE
  - AI.CONTEXT.BURDEN_SUBJECTIVE
  - AI.VISUAL.HIERARCHY_CONFIDENCE
---

## Purpose

Kitchen Sink **`landing_page`**, **`product_page`**, and **`handbook_page`** shells (`landing-hero`, `forge-section`, `section-label`, `forge-card`) are composed in `components/layouts.py` and `components/components.py` to tell a product story in layers. This AI rule judges whether a **first-time reader** can build the right mental model **in one pass**—without insider vocabulary, heading bait-and-switch, or reference dumps where an outcome should live.

Deterministic checks (`DET.SECTION.HEADING`, `DET.CONTEXT.BURDEN`, `DET.PROSE.LENGTH`, `DET.NAV.IN_PAGE_TOC`) catch structural budgets, heading order, and list caps; they do **not** judge whether acronyms are defined before reuse, whether `section-label` text matches body substance, or whether technical depth appears above the fold before the reader knows what the product does.

**Plan:** Read the first viewport and the next `forge-section` as a stranger—list undefined terms, logical jumps, and headings that promise one job but deliver another. **Do:** Lead with problem → outcome → mechanism; define Forge terms inline on first use (`landing-hero-clarification`); link schemas, APIs, and long indexes below the story. **Check:** A colleague can paraphrase the page's single promise without guessing; re-run `analyze-website-ux.mjs` AI batch for this principle. **Adjust:** When the same clarity defect repeats (undefined product names in heroes, misleading `section-label` copy), propose a deterministic `DET.*` companion in the finding's `candidateDeterministicRule` field.

## Passing signals

- Hero copy states **what it is and who it is for** in plain language before naming sub-products (`product-landing-title` → short `landing-hero-tagline` → one primary `btn btn-forge` CTA).
- Product names (**Lenses**, **LCDL**, **Fleet**, **ForgeSDLC**) appear **after** a one-line plain-language gloss in `landing-hero-clarification` or `landing-hero-explainer`—not unexplained in the `h1`.
- Each `section-label text-cyan` and following `h2`/`h3` **match the section body** (no "Outcomes" band that is actually an endpoint catalog).
- Progressive disclosure: API tables, prop lists, and long `forge-support` asides live in the **next** `forge-section` or behind a clear "Reference" / "Read the docs" link—not in the hero grid.
- Headings follow a scannable ladder (`h1` once per page, section jobs obvious); in-page TOC entries align with what the eye sees (`DET.NAV.IN_PAGE_TOC`).
- Paragraphs and card lists stay within readable budgets (`DET.PROSE.LENGTH`); outcome cards use at most three bullets when explaining benefits.
- Handbook inner pages (`handbook_page`) open with a chapter job sentence before dense `forge-card` cross-refs or maintainer vocabulary.

## Failing signals

- Headline or `landing-hero-tagline` stacks acronyms and internal codenames with **no** inline definition ("LCDL + Fleet + Lenses control plane" before the reader knows the problem).
- `section-label` or `card-label` promises onboarding or outcomes but the body is endpoint lists, generated nav, or maintainer-only detail.
- Heading text is generic ("Overview", "Details", "More") while the section mixes unrelated jobs—reader cannot predict what they will learn.
- `landing-hero-explainer` or `landing-hero-clarification` jumps from trust model to JSON shapes without a mechanism sentence in between.
- First screen reads like documentation cover: dense `forge-card` tiles with implementation vocabulary and no outcome framing.
- Jargon is **reused** in CTAs and `landing-hero-secondary-link` clusters before it was introduced anywhere on the page.
- `landing-hero-audience` names three personas and three products in one sentence without scoping who should read which band next.

## Before example

Failing KS markup: undefined product names in the hero, misleading `section-label`, reference dump in the outcomes band.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-cognitive-fail"
>
  <div class="container-fluid landing-hero-wide px-3 px-xxl-5">
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
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
  </div>
</section>

<section
  class="forge-section py-5"
  hash="Sec"
  data-ks-hash="Sec"
  data-ks-type="section"
  data-ks-name="outcomes-mismatch"
>
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
            <li><code>GET /v1/admin/snapshot</code> — operator snapshot</li>
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
    <div class="landing-hero-grid-wrap">
      <div class="row align-items-center g-4 g-xl-5 landing-hero-grid">
        <div class="col-12 col-xl-7 col-lg-10 landing-hero-copy text-center text-xl-start">
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
            <strong>Fleet</strong> (bounded job execution)—explained below, not assumed.
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
  </div>
</section>

<section
  class="forge-section py-5"
  id="how-it-works"
  hash="Sec"
  data-ks-hash="Sec"
  data-ks-type="section"
  data-ks-name="outcomes-aligned"
>
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

**Capture:** first-viewport screenshot, heading outline (H1–H3), and a plain-language paraphrase test ("What is this page asking me to believe?"). Note any acronym or product name that appears before definition. For AI findings, include `principleId`, `deterministicCoverage`, `screenshotOrDomEvidence`, and `hashesOrContractsAffected` per `ai-enabled-design-principles.md`.

**Remediate (in order):**

1. Rewrite hero to **problem → outcome**; move endpoint lists, schemas, and maintainer vocabulary to Reference or a lower `forge-section`.
2. Align every `section-label` / `h2` with the section's single job (`DET.SECTION.SINGLE_JOB`); split mixed bands.
3. Define Forge terms **inline on first use** (short parenthetical in `landing-hero-clarification`)—then reuse freely in later bands.
4. Stage depth: outcome `forge-card` tiles in band two; mechanism steps or `ks-diagram-tile` in band three; `landing-hero-secondary-link` walls last.
5. Re-check `DET.SECTION.HEADING` order, `DET.PROSE.LENGTH`, and `DET.CONTEXT.BURDEN` after edits.
6. If the pattern repeats (undefined product names in heroes, heading/substance mismatch), record a `candidateDeterministicRule` (for example glossary-first hero lint or section-label substance matcher).

## Related rules

- `DET.SECTION.HEADING` — one heading per major section; order matches outline.
- `DET.SECTION.SINGLE_JOB` — each visible band does one job.
- `DET.CONTEXT.BURDEN` — first-screen link and control budgets.
- `DET.PROSE.LENGTH` — paragraph and list caps for scannability.
- `DET.NAV.IN_PAGE_TOC` — in-page TOC matches on-page headings.
- `AI.NARRATIVE.COHERENCE` — problem → outcome → mechanism → next step sequencing.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — page feels overwhelming despite passing numeric caps.
- `AI.VISUAL.HIERARCHY_CONFIDENCE` — focal path when clarity and hierarchy compete in the first viewport.
