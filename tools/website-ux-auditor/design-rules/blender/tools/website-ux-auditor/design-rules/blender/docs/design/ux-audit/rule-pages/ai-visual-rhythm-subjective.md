---
rule_id: AI.VISUAL.RHYTHM_SUBJECTIVE
lane: ai
title: Visual rhythm (subjective)
summary: Spacing and grouping feel intentional and repeatable—aligned grids, consistent section motifs, and predictable vertical cadence—not accidental pile-ups that pass numeric gap checks.
page_version: 9fbfe714c08657d840e57a345b04ff9431a6b0dc38d34eda8b2afa605bf99672
generated_at: 2026-05-28T18:12:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-visual-rhythm-subjective
related_rules:
  - DET.VISUAL.RHYTHM
  - DET.LAYOUT.GRID_CONSISTENCY
  - DET.SECTION.HEADING
  - AI.VISUAL.HIERARCHY
  - AI.PREMIUM.ENTERPRISE_FEEL
  - AI.CONTEXT.BURDEN_SUBJECTIVE
---

## Purpose

Kitchen Sink **`landing_page`**, **`product_page`**, and **`forge-section`** bands should read as **one measured scroll**—sections breathe at a shared cadence, card rows align to a grid, and repeated motifs (`section-label`, `forge-card`, `g-3 g-lg-4`) signal structure before the reader parses copy. This AI rule judges **felt rhythm**: whether spacing and grouping look deliberate, not like fragments pasted together.

Deterministic **`DET.VISUAL.RHYTHM`** samples median vertical gaps and spread ratios; **`DET.LAYOUT.GRID_CONSISTENCY`** guards column class patterns. This rule catches when those checks pass yet the page still **feels** accidental—misaligned card baselines, alternating container widths, one-off padding stacks, or section headers that break the motif mid-page.

**Plan:** Scroll the page and mark where the beat breaks—sections that jump padding, rows with mismatched column spans, or card bands that abandon the established label → heading → grid pattern. **Do:** Re-stage bands with shared KS spacing utilities (`py-5`, `g-3 g-lg-4`), one container width per page mode, and repeated `section-label` + heading anatomy. **Check:** Screenshot review from hero through two mid-page bands; confirm adjacent sections share vertical cadence and column alignment. **Adjust:** When the same accidental grouping repeats (for example mixed card padding in one row), propose a deterministic `DET.*` companion or catalog contract tightening.

## Passing signals

- Section stack repeats a **motif**: `forge-section py-5` (or consistent `fs-landing-section py-4 px-2 px-md-3`) with `section-label text-cyan` → one `h2`/`h3` → content grid—reader anticipates the next band.
- Row gutters stay on the **same scale**: `g-3 g-lg-4` (or `g-4`) across outcome, proof, and depth bands—not `g-1` beside `g-4` without semantic reason.
- Card rows use **uniform shells**: `forge-card breathe-link h-100` (or `breathe-static`) with matching internal spacing (`card-label`, `h5`, `forge-support`)—columns align at the top and feel like one grid unit.
- Container width is **stable** within a page mode: `container` for narrative bands or `container-fluid landing-hero-wide px-3 px-xxl-5` for hero/wide diagrams—not arbitrary switches every other section.
- Vertical cadence **echoes** between bands: similar `py-*` between major sections, predictable gap from hero actions to the first `forge-section`, no random `mt-5` / `mb-1` stacks breaking flow.
- Column spans follow a **readable grid**: three-up `col-md-4`, two-up `col-lg-6`, or four-up `col-6 col-md-3`—not `col-md-4` beside `col-md-5` beside `col-md-3` in the same logical row.
- Hash-marked layout roots (`hash="…"`, `data-ks-hash`, `data-ks-type`, `data-ks-name`) appear on major bands so rhythm fixes map back to catalog contracts.

## Failing signals

- **Accidental pile-up**: hero uses `py-2 g-1`, next band `py-5 g-4`, then `py-3` with no narrative reason—scroll feels like stacked templates, even if median gap passes **`DET.VISUAL.RHYTHM`**.
- **Grid drift**: sibling `forge-card` tiles in one row use `col-md-4`, `col-md-6`, and `col-md-2`—columns do not align; card baselines and gutters disagree.
- **Motif break**: first two sections use `section-label` + `h3`, then a mid-page band jumps to bare `h2` with no label and different `container-fluid px-1` padding—reader loses the scan pattern.
- **In-row inconsistency**: cards mix `p-2`, `p-4`, and inline `padding` in the same row; one tile is `forge-card`, another is raw `glass`—grouping reads accidental, not rhythmic.
- **Width whiplash**: alternating `container` and `container-fluid px-1` sections cause content rails to jump left/right without a layout mode change (`DET.LAYOUT.GRID_CONSISTENCY` may flag; this rule catches perceived jerkiness on screenshot review).
- **Orphan spacing**: lone `mt-5` on one card, `mb-0` on neighbors, or a `row g-2` inserted between two `g-4` bands—micro-gaps fight the section cadence.
- **Heading ladder noise**: section titles alternate `h2`, `h4`, and unclassed headings with no scale step—vertical rhythm breaks even when copy is fine (`DET.SECTION.HEADING` partially covers; subjective beat still fails).

## Before example

Failing KS markup: numeric gaps may average out, but section padding, gutters, column spans, and card treatments jump—grouping feels accidental.

```html
<section class="landing-hero fs-landing-hero-band forge-section py-2">
  <div class="container-fluid px-1">
    <div class="row g-1 align-items-center">
      <div class="col-12 col-lg-7">
        <p class="landing-hero-kicker mb-0">Forge Platform</p>
        <h1 class="font-display product-landing-title mb-1">Governed delivery spine</h1>
        <p class="forge-support landing-hero-tagline mb-2">Structure intent and keep review points visible.</p>
        <div class="landing-hero-actions">
          <p class="landing-hero-actions__buttons d-flex flex-wrap gap-1 mb-0">
            <a class="btn btn-forge btn-sm" href="/quickstart">Quickstart</a>
            <a class="btn btn-cyan-outline btn-sm" href="/docs">Docs</a>
          </p>
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="landing-forge-visual">
          <img src="assets/svg/diagrams/governed-delivery-spine.svg" alt="" class="landing-forge-visual__img" />
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What changes</h2>
    <div class="row g-4">
      <div class="col-md-4">
        <div class="forge-card breathe-static p-4 h-100">
          <p class="card-label">Control</p>
          <h3 class="h5 mt-2 mb-1">Human gates</h3>
          <p class="forge-support mb-0">Review stays visible.</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="glass p-2 h-100">
          <span class="text-cyan">Evidence</span>
          <p class="forge-support mb-0 mt-3">Logs linked inline.</p>
        </div>
      </div>
      <div class="col-md-2">
        <div class="forge-card breathe-static p-1 text-center h-100">
          <strong>Depth</strong>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-3">
  <div class="container-fluid px-1">
    <h2 class="h4 mb-2">How it works</h2>
    <div class="row g-2">
      <div class="col-lg-6">
        <div class="forge-card breathe-static p-3 mb-5">
          <p class="card-label">Step 1</p>
          <p class="forge-support mb-0">Shape intent.</p>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="forge-card breathe-static p-4">
          <p class="card-label">Step 2</p>
          <p class="forge-support mb-0">Delegate with bounds.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="fs-landing-section fs-marketing-stat-band py-4 px-2 px-md-3">
  <div class="container">
    <div class="row g-1 text-center">
      <div class="col-4"><p class="forge-support mb-0">12 modules</p></div>
      <div class="col-4"><p class="forge-support mb-0">48 endpoints</p></div>
      <div class="col-4"><p class="forge-support mb-0">∞ agents</p></div>
    </div>
  </div>
</section>
```

## After example

Passing KS markup: repeated section motif, stable gutters, aligned three-up grid, and consistent card anatomy—rhythm reads intentional on scroll.

```html
<section
  class="landing-hero fs-landing-hero-band forge-section"
  hash="Ldg"
  data-ks-hash="Ldg"
  data-ks-type="layout"
  data-ks-name="landing-rhythm-pass"
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
            Structure intent, delegate safely, and keep human review points—presented with deliberate vertical cadence.
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
              class="landing-forge-visual__img"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Out" data-ks-hash="Out" data-ks-type="section" data-ks-name="outcomes-rhythm">
  <div class="container">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="h3 mb-4">What changes for your team</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#human-control">
          <p class="card-label">Control</p>
          <h3 class="h5 mt-2 mb-1">Human-owned gates</h3>
          <p class="forge-support mb-0">Review points stay visible in every band.</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/trust#evidence">
          <p class="card-label">Evidence</p>
          <h3 class="h5 mt-2 mb-1">Inspectable artifacts</h3>
          <p class="forge-support mb-0">Logs and contracts use the same card rhythm as neighbors.</p>
        </a>
      </div>
      <div class="col-md-4">
        <a class="forge-card card-amber breathe-link h-100" href="/docs/architecture">
          <p class="card-label">Depth</p>
          <h3 class="h5 mt-2 mb-1">Mechanism on demand</h3>
          <p class="forge-support mb-0">Technical detail deferred—this row stays aligned and even.</p>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="forge-section py-5" hash="Hiw" data-ks-hash="Hiw" data-ks-type="section" data-ks-name="how-it-works-rhythm">
  <div class="container">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h3 mb-4">From intent to evidence</h2>
    <div class="row g-3 g-lg-4">
      <div class="col-lg-6">
        <div class="forge-card breathe-static h-100">
          <p class="card-label">Step 1</p>
          <h3 class="h5 mt-2 mb-1">Shape intent</h3>
          <p class="forge-support mb-0">Capture goals and boundaries before delegation.</p>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="forge-card breathe-static h-100">
          <p class="card-label">Step 2</p>
          <h3 class="h5 mt-2 mb-1">Delegate with bounds</h3>
          <p class="forge-support mb-0">Agents execute inside review gates you define.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section
  class="fs-landing-section fs-marketing-stat-band py-4 px-2 px-md-3"
  hash="Stb"
  data-ks-hash="Stb"
  data-ks-type="section"
  data-ks-name="stat-band-rhythm"
>
  <div class="container">
    <div class="row g-3 g-lg-4 text-center">
      <div class="col-md-4">
        <p class="forge-support mb-0"><strong class="text-amber">4</strong> layers</p>
      </div>
      <div class="col-md-4">
        <p class="forge-support mb-0"><strong class="text-amber">1</strong> governance spine</p>
      </div>
      <div class="col-md-4">
        <p class="forge-support mb-0"><strong class="text-amber">0</strong> mystery gaps</p>
      </div>
    </div>
  </div>
</section>
```

## Evidence and remediation

**Capture:** full-page desktop screenshot plus a crop of two adjacent mid-page bands. Note section `py-*` classes, row `g-*` utilities, container width, column spans per row, and card shell consistency. Record whether **`DET.VISUAL.RHYTHM`** and **`DET.LAYOUT.GRID_CONSISTENCY`** passed despite subjective jerkiness.

**Remediate (in order):**

1. Normalize major section padding to one cadence (`forge-section py-5` or matched `fs-landing-section py-4 px-2 px-md-3`)—remove one-off `py-2` / `py-3` unless marking a distinct page mode.
2. Restore the **section motif**: `section-label text-cyan` → one heading → grid; do not drop labels mid-page without reason.
3. Align row gutters (`g-3 g-lg-4`) and column spans (`col-md-4` triplets, `col-lg-6` pairs)—fix orphan `col-md-6` + `col-md-2` splits in the same logical band.
4. Unify card anatomy inside a row: one shell (`forge-card breathe-link` or `breathe-static`), shared internal spacing (`card-label`, `h5`, `forge-support`), `h-100` for equal height.
5. Stabilize container width per page mode—hero wide rail vs narrative `container`; avoid `container-fluid px-1` beside `container` without layout intent.
6. Re-run deterministic rhythm/grid checks; if accidental grouping repeats with stable DOM signals (mixed card padding in one row, column span drift), propose **`DET.*`** promotion (for example card-row padding parity or max column-span variance per row).

## Related rules

- `DET.VISUAL.RHYTHM` — median vertical section gaps and spread ratio within tolerance (numeric cadence).
- `DET.LAYOUT.GRID_CONSISTENCY` — column class patterns and grid token alignment across bands.
- `DET.SECTION.HEADING` — heading level ladder matches section depth and does not skip scales arbitrarily.
- `AI.VISUAL.HIERARCHY` — scale, contrast, and grouping establish an obvious focal path when rhythm is even but nothing reads first.
- `AI.PREMIUM.ENTERPRISE_FEEL` — holistic polish: calm spacing, refined typography, consistent surfaces.
- `AI.CONTEXT.BURDEN_SUBJECTIVE` — subjective overload when numeric burden caps pass but the page still feels noisy.
