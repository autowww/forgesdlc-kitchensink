---
rule_id: DET.SECTION.SINGLE_JOB
lane: deterministic
title: Section single job
summary: Each major content section expresses one coherent story topic—detectable via intent buckets, subheading alignment, heading–body overlap, and card-title clustering.
page_version: a02e490ddd88ad710ba66fb729532ee48682de2d853ce6bd6e59cf6b2ac30339
generated_at: 2026-05-29T18:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-section-single-job
related_rules:
  - DET.SECTION.HEADING
  - DET.PROSE.LENGTH
  - DET.LANDMARKS.REQUIRED
  - DET.LAYOUT.GRID_CONSISTENCY
  - DET.NAV.IN_PAGE_TOC
  - DET.CARD.ACTION_LIMIT
  - DET.CONTEXT.BURDEN
  - DET.PY.OPTIONAL_REGIONS
  - AI.NARRATIVE.COHERENCE
  - AI.CONTEXT.COGNITIVE_CLARITY
  - AI.VISUAL.HIERARCHY
---

## Purpose

Forge landing pages, product overviews, and handbook chapters are composed as stacked **`forge-section`** / **`ks-section`** bands inside **`main#main.doc-main`**. Enterprise scan patterns (hero → outcomes → mechanism → trust → ecosystem → CTA) assume each major band does **one job**: one outcome story, one workflow explanation, one trust model, or one ecosystem map—not every message at once.

This deterministic rule runs in the **metrics** phase (`det-section-single-job.check.js`). With Playwright it builds `sectionSingleJobReport` by scanning visible **`section`** and **`article`** nodes in `main`, using the same major-section thresholds as **`DET.SECTION.HEADING`** (**≥ 45 words** or height **≥ 48px**). Chrome in `nav`, `.forge-toc`, `.ks-doc-toc`, `aside.forge-sidebar`, `#ks-sidebar-aside`, `.fs-sidebar`, `footer`, and cookie banners is excluded. Platform handbook **inner** doc URLs (`siteKind: platform` with inner paths) are skipped entirely.

For each major section the check clusters **intent buckets** (workflow, trust, outcome, ecosystem, reference, pricing, onboarding) from the primary heading, peer **`h3+`** subheadings, and body sample; compares subheading token overlap (Jaccard); tests heading–body keyword drift; and flags unrelated **`.forge-card`** titles in one band. Up to **6** findings per page (`MAX_SECTION_SINGLE_JOB_FINDINGS`).

**Plan:** Crawl product and handbook URLs; inspect `sectionSingleJobReport.sections[].buckets` and violation kinds. **Do:** Split mixed bands into separate `forge-section` shells; align subheads with the section title; group cards under one shared intent. **Check:** `violationsFromSectionSingleJobSnapshot` is empty and `findingsFromSectionSingleJobReport` returns no rows. **Adjust:** Fix `components/layouts.py`, `marketing_sections.py`, or consumer Markdown, then re-run `analyze-website-ux.mjs`.

## Passing signals

- Each major **`section.forge-section.ks-section`** with ≥ 45 words hits **≤ 2** intent buckets in its heading + subheading + body cluster (`MAX_TOPIC_BUCKETS_PER_SECTION`).
- Peer **`h3`** / **`h4`** subheadings under one **`h2.font-display`** share token overlap with the primary title (no `divergent-subheadings` pair below Jaccard **0.12**).
- Section body keywords overlap the primary heading tokens above drift threshold **0.1** when the section has ≥ 80 words and a substantive **`h2`** title.
- Card grids in one band advertise one subsection theme—e.g. three trust boundary cards under a trust **`section-label`**—not unrelated jobs (`card-title-sprawl` absent).
- `metrics.sectionSingleJobReport` lists separate mechanism, trust, and ecosystem sections with distinct `buckets` arrays per band.
- Generic product and handbook URLs are in scope; platform inner handbook paths intentionally return no findings.

## Failing signals

- **`multi-topic-buckets`:** One major section mixes **3+** intent buckets (workflow + trust + pricing + ecosystem in one cluster)—evidence `multi_topic_buckets section="section.forge-section" buckets=workflow,trust,ecosystem count=4`. Severity **minor** at three buckets; **major** when bucket count ≥ **4**.
- **`divergent-subheadings`:** Two or more peer subheadings under one section title point at unrelated topics (low mutual and primary overlap)—evidence `divergent_subheadings section="section.mixed" subheadings=3 sample="…"`. Severity **minor**; **major** when subheading count ≥ **3**.
- **`heading-body-drift`:** Primary heading tokens barely appear in section body keywords (Jaccard **< 0.1**)—evidence `heading_body_drift section="…" heading="Security posture…" jaccard=0.042`. Severity **minor**.
- **`card-title-sprawl`:** **≥ 3** visible cards in one section with mostly unrelated titles—evidence `card_title_sprawl section="…" cards=4 sample="…"`. Severity **major**.
- One long **`forge-support`** paragraph that strings onboarding, pricing, trust, and ecosystem lexicon together without section breaks (often triggers `multi-topic-buckets` even when headings exist).
- Page may pass **`DET.SECTION.HEADING`** (every band has an `h2`) yet still fail here when all story beats share one `forge-section`.

## Before example

Failing KS markup: a single **`forge-section`** stacks workflow, trust, pricing, and ecosystem copy; peer subheadings diverge; and four outcome/trust/reference/ecosystem cards compete—triggers `multi-topic-buckets`, `divergent-subheadings`, and `card-title-sprawl` in one band.

```html
<main id="main" class="doc-main px-4 py-4">
  <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
    <p class="forge-support mt-2 mb-0">Human-owned, agent-executed software delivery.</p>
  </header>
  <section
    class="forge-section ks-section"
    id="everything-at-once"
    hash="EAA"
    data-ks-hash="EAA"
    data-ks-type="section"
    data-ks-name="mixed-story-band"
  >
    <p class="section-label text-cyan mb-2">Overview</p>
    <h2 class="h4 font-display mb-3">Everything you need on one scroll</h2>
    <h3 class="h5 mb-2">SQLite job store schema</h3>
    <h3 class="h5 mb-2">Hero marketing outcomes</h3>
    <p class="forge-support mb-4">
      How it works: shape intent, run a governed workflow through lifecycle stages from intent to evidence.
      Trust boundary, security governance, privacy, audit logs, and compliance posture for enterprise teams.
      Pricing tiers, subscription plans, license cost, and team plans for growing organizations.
      ForgeSDLC methodology, Lenses workspace visibility, LCDL governed tasks, Fleet controlled jobs,
      Platform architecture, and Blueprints practice knowledge in one ecosystem map.
      Get started quickstart install setup try sign up start now without leaving this band.
    </p>
    <div class="row g-3 g-lg-4">
      <div class="col-md-3">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Oc1"
          data-ks-hash="Oc1"
          data-ks-type="component"
          data-ks-name="outcome-card-sprawl"
        >
          <p class="card-label mb-1">Outcomes</p>
          <h4 class="h6 mt-2 mb-2">Why teams choose Forge</h4>
          <p class="forge-support mb-0">Outcome benefit value impact result for governed delivery.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Tr1"
          data-ks-hash="Tr1"
          data-ks-type="component"
          data-ks-name="trust-card-sprawl"
        >
          <p class="card-label mb-1">Trust</p>
          <h4 class="h6 mt-2 mb-2">Audit evidence trail</h4>
          <p class="forge-support mb-0">Trust security governance boundary privacy audit evidence.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Rf1"
          data-ks-hash="Rf1"
          data-ks-type="component"
          data-ks-name="reference-card-sprawl"
        >
          <p class="card-label mb-1">Reference</p>
          <h4 class="h6 mt-2 mb-2">API schema appendix</h4>
          <p class="forge-support mb-0">Reference API schema endpoint handbook ADR documentation depth.</p>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Ec1"
          data-ks-hash="Ec1"
          data-ks-type="component"
          data-ks-name="ecosystem-card-sprawl"
        >
          <p class="card-label mb-1">Ecosystem</p>
          <h4 class="h6 mt-2 mb-2">Lenses and LCDL map</h4>
          <p class="forge-support mb-0">Forgesdlc lenses lcdl fleet platform blueprints ecosystem partners.</p>
        </div>
      </div>
    </div>
  </section>
</main>
```

## After example

Passing KS markup: mechanism, trust (three related trust cards), and ecosystem each get their own **`forge-section`** with aligned copy and card themes.

```html
<main id="main" class="doc-main px-4 py-4">
  <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
    <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
    <p class="forge-support mt-2 mb-0">Human-owned, agent-executed software delivery.</p>
  </header>
  <section
    class="forge-section ks-section"
    id="mechanism"
    hash="MEC"
    data-ks-hash="MEC"
    data-ks-type="section"
    data-ks-name="mechanism-band"
  >
    <p class="section-label text-cyan mb-2">Mechanism</p>
    <h2 class="h4 font-display mb-3">How governed workflow runs</h2>
    <p class="forge-support mb-0">
      Shape intent, delegate through lifecycle stages and pipeline checkpoints, and release with reviewable
      evidence from intent to ship.
    </p>
  </section>
  <section
    class="forge-section ks-section"
    id="trust"
    hash="TRU"
    data-ks-hash="TRU"
    data-ks-type="section"
    data-ks-name="trust-band"
  >
    <p class="section-label text-cyan mb-2">Trust</p>
    <h2 class="h4 font-display mb-3">Boundaries operators can explain</h2>
    <p class="forge-support mb-4">
      Data stays in repositories you control. Execution runs in bounded job planes. Humans retain approval gates.
    </p>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Td1"
          data-ks-hash="Td1"
          data-ks-type="component"
          data-ks-name="trust-data-boundary"
        >
          <p class="card-label mb-1">Data</p>
          <h3 class="h5 mt-2 mb-2">Repository boundary</h3>
          <p class="forge-support mb-0">Source and docs remain in workspaces you own; no hidden exfiltration path.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Te1"
          data-ks-hash="Te1"
          data-ks-type="component"
          data-ks-name="trust-execution-boundary"
        >
          <p class="card-label mb-1">Execution</p>
          <h3 class="h5 mt-2 mb-2">Job plane boundary</h3>
          <p class="forge-support mb-0">Automation runs through token-scoped orchestration with audit logs per job.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div
          class="forge-card breathe-static p-3 h-100"
          hash="Th1"
          data-ks-hash="Th1"
          data-ks-type="component"
          data-ks-name="trust-human-gate"
        >
          <p class="card-label mb-1">Control</p>
          <h3 class="h5 mt-2 mb-2">Human approval gate</h3>
          <p class="forge-support mb-0">Review gates and evidence trails stay on critical release paths.</p>
        </div>
      </div>
    </div>
  </section>
  <section
    class="forge-section ks-section"
    id="ecosystem"
    hash="ECO"
    data-ks-hash="ECO"
    data-ks-type="section"
    data-ks-name="ecosystem-band"
  >
    <p class="section-label text-cyan mb-2">Ecosystem</p>
    <h2 class="h4 font-display mb-3">How Forge products connect</h2>
    <p class="forge-support mb-0">
      ForgeSDLC methodology, Lenses workspace visibility, LCDL governed reasoning, controlled execution,
      and Blueprints practice knowledge form one composable platform story—linked from curated nav, not dumped here.
    </p>
  </section>
</main>
```

## Evidence and remediation

1. **Collect:** Run `analyze-website-ux.mjs` on the target site or read `metrics.sectionSingleJobReport` from the ruleset harness (`auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.SECTION.SINGLE_JOB`). Unit coverage: `auditor-tests/det-section-single-job.test.js`; defect HTML via `generator/build_rule_defect_fixtures.py`.
2. **Multi-topic buckets:** Split the band into separate `forge-section` shells—one for workflow/mechanism, one for trust, one for ecosystem/pricing/onboarding. Move reference depth to linked handbook pages (`reference` bucket).
3. **Divergent subheadings:** Give each topic its own section with one `h2.font-display` title; demote nested topics to child pages or sequential sections instead of unrelated `h3` peers under one overview title.
4. **Heading–body drift:** Rewrite the opening `forge-support` paragraphs so keywords match the `h2`, or retitle the section to match the prose actually present.
5. **Card-title sprawl:** Keep card grids thematic (three trust cards, three outcome cards) or split grids across sections; respect **`DET.CARD.ACTION_LIMIT`** when cards carry CTAs.
6. **Verify:** Rebuild affected HTML (`python3 generator/build-showcase.py` or consumer `build-site.py` / `build-handbook.py`), re-audit until violations are empty; confirm **`DET.SECTION.HEADING`** and **`DET.PROSE.LENGTH`** still pass on the same URLs.

## Related rules

- `DET.SECTION.HEADING` — one primary heading per major section; outline clarity supports single-job bands.
- `DET.PROSE.LENGTH` — long prose blocks often need section breaks when one band mixes jobs.
- `DET.LANDMARKS.REQUIRED` — `main` landmark must exist before section single-job scans apply.
- `DET.LAYOUT.GRID_CONSISTENCY` — section bands should align with the same content grid as body copy.
- `DET.NAV.IN_PAGE_TOC` — TOC anchors map to one intent per visible band.
- `DET.CARD.ACTION_LIMIT` — card-led sections should not stack unrelated actions on one tile grid.
- `DET.CONTEXT.BURDEN` — link walls and dense indexes raise scan cost when combined with multi-job sections.
- `DET.PY.OPTIONAL_REGIONS` — populated optional slots must not inject unrelated story beats into one section.
- `AI.NARRATIVE.COHERENCE` — judgment on whether the reader's thread holds across sections.
- `AI.CONTEXT.COGNITIVE_CLARITY` — subjective scan burden when bands mix competing messages.
- `AI.VISUAL.HIERARCHY` — visual weight of display headings versus support copy within each band.
