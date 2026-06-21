---
rule_id: DET.CATALOG.CONTRACT_SPECIFICITY
lane: deterministic
title: Catalog contract element specificity
summary: Registry-linked design contracts must carry hash-specific Expected look, Anatomy, Forbidden patterns, and Deterministic checks—not thin generic boilerplate or duplicated slabs pasted across unrelated hashes.
page_version: 8cba9be552de740cab12a4c2d508101e424e4e77b17ae0dd898360d47d4890cf
generated_at: 2026-05-28T16:12:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-catalog-contract-specificity
related_rules:
  - DET.CONTRACT.PATH
  - DET.CONTRACT.PLACEHOLDERS
  - DET.HASH.MARKERS
  - DET.HASH.REGISTRY_ROW
  - AI.CONTRACT.IMPLEMENTATION_USEFULNESS
  - AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED
---

## Purpose

Kitchen Sink **design contracts** (`docs/design/catalog/**/{HASH}-*.md`) are the implementation spec for registry-backed visuals. When **Expected look**, **Anatomy**, **Forbidden patterns**, or **Deterministic checks** read like template filler—or the same paragraph is pasted across unrelated hashes—implementers and auditors cannot tell what markup, landmarks, or motion a hash must emit.

The source rule table names **Expected anatomy** and **Verification**; the enforced headings are **`## Expected look`**, **`## Anatomy`**, **`## Forbidden patterns`**, and **`## Deterministic checks`** (verification gates). This deterministic rule repo-scans every registry row with `contract_status: own` or `family-covered` (excluding `contract-template.md`, README/ONTOLOGY, and screenshot paths). It requires those headings, flags thin/generic **Expected look** copy, detects the shared “Calm Forge enterprise atmosphere” slab on stateful types, clusters duplicate **Expected look** bodies across layouts/pages/chrome regions, and surfaces missing **States** coverage as minors. Findings cap at **12** per audit pass (`MAX_CONTRACT_SPECIFICITY_FINDINGS`); run the full catalog report locally for the complete list.

**Plan:** After registry or contract edits, list contracts tied to changed hashes. **Do:** Rewrite each section with element-specific selectors, neighbor relationships, and verification gates tied to shipped scripts or DOM anchors. **Check:** `node tools/design-catalog/check-visual-catalog.mjs --repo .` reports no specificity errors; `metrics.contractSpecificityReport.issues` is empty in UX audits. **Adjust:** When the same gap repeats across a family, tighten the family contract or split child hashes—do not paste one generic slab across unrelated registry types.

## Passing signals

- Contract includes all required headings: **`## Expected look`**, **`## Anatomy`**, **`## Forbidden patterns`**, and **`## Deterministic checks`**.
- **Expected look** names concrete KS rhythm and roles—selectors such as `.ks-doc-breadcrumb`, `forge-card breathe-link`, `bento-grid`, `glass forge-stat`—with word count and phrasing that survive the generic-stock heuristic (no stacked “clean and modern / enterprise-grade / great user experience” without anatomy cues).
- **Anatomy** traces outer root through major regions and aligns with registry **`root_selector`** (for example `main#main` for **Idx**, `.ks-doc-breadcrumb` for **Kbc**).
- **Forbidden patterns** call out hash-specific anti-patterns (breadcrumb scroll traps, anonymous card stacks, hero link walls)—not copied UX platitudes shared verbatim with unrelated hashes.
- **Deterministic checks** cite repeatable gates: `hash` / `data-ks-hash` markers, structural selectors, inventory scripts, or auditor rule IDs the surface is expected to satisfy.
- Stateful registry types (`layout`, `page`, `chrome-region`, `layout-preview`) include a **`## States`** section with at least two concrete bullets (default, interactive, empty, loading, reduced-motion as applicable).
- No duplicate normalized **Expected look** body appears on two or more sensitive contracts (layouts/pages/chrome regions above the length threshold).
- `scanCatalogContractSpecificity` / `metrics.contractSpecificityReport` returns zero issues for the repo.

## Failing signals

- **Missing sections:** Auditor message `missing ## Anatomy`, `missing ## Forbidden patterns`, or `missing ## Deterministic checks` on a registry-linked contract path.
- **Thin generic Expected look:** `Expected look is thin (N words) and relies on generic phrasing` when body is under ~14 words and matches stock phrases (`clean and modern`, `enterprise-grade look`, `great user experience`, etc.).
- **Stacked generics:** `Expected look stacks multiple generic stock phrases without concrete layout/anatomy cues` when three or more hint phrases appear in under ~40 words.
- **Atmosphere slab:** `Expected look uses duplicated Forge atmosphere slab` on `layout` / `page` / `chrome-region` rows that still paste the Calm Forge atmosphere paragraph instead of hash-specific guidance.
- **Cross-contract duplication:** `Expected look duplicates N other contract(s)` when the same normalized paragraph appears on multiple layout/page/chrome contracts.
- **States gap (minor):** `missing ## States section` or `States section should enumerate multiple concrete states` for stateful registry types.
- **Severity:** **warn** for missing sections, thin/generic/duplicate Expected look, and atmosphere slab; **minor** for States gaps and truncated finding lists.
- Evidence strings include `hash=… contract=docs/design/catalog/…` paths; remediation points to `check-visual-catalog.mjs` and deepening contract sections.

## Before example

Failing KS markup: showcase home (**Idx**) implemented from a contract that only promised a “clean, modern, enterprise-grade” portal—no `forge-card` / `bento-grid` anatomy, no hash root, generic Bootstrap cards instead of museum portal tiles.

```html
<main id="main">
  <section class="py-5 text-center">
    <h1 class="display-4 mb-3">Kitchen Sink</h1>
    <p class="lead text-muted mb-4">
      Clean and modern enterprise-grade look with a great user experience.
    </p>
  </section>
  <div class="row g-3">
    <div class="col-md-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Components</h5>
          <p class="card-text text-muted">Browse the museum.</p>
          <a class="btn btn-primary btn-sm" href="/showcase/buttons.html">Open</a>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Layouts</h5>
          <p class="card-text text-muted">Browse the museum.</p>
          <a class="btn btn-primary btn-sm" href="/showcase/layouts.html">Open</a>
        </div>
      </div>
    </div>
  </div>
</main>
```

## After example

Passing KS markup: matches **Idx — Showcase home** contract—`main#main` root with hash markers, curated `forge-card breathe-link` portal tiles (`card-label`, `forge-support`), and `bento-grid` / `glass forge-stat` density band (from `generator/pages/index.py`).

```html
<main
  id="main"
  hash="Idx"
  data-ks-hash="Idx"
  data-ks-type="page"
  data-ks-name="showcase-home"
>
  <h2 class="font-display text-center mb-4" style="font-size:1.5rem">Explore components</h2>
  <div class="row g-3 mb-5">
    <div class="col-md-6 col-lg-4">
      <a class="forge-card breathe-link" href="buttons.html">
        <p class="card-label">Foundation</p>
        <h5 class="mt-2 mb-1">Buttons</h5>
        <p class="forge-support mb-0">Primary, outline, and icon controls with Forge tokens.</p>
      </a>
    </div>
    <div class="col-md-6 col-lg-4">
      <a class="forge-card card-amber breathe-link" href="layouts.html">
        <p class="card-label">Foundation</p>
        <h5 class="mt-2 mb-1">Layouts</h5>
        <p class="forge-support mb-0">Handbook, product, and marketing shells.</p>
      </a>
    </div>
  </div>
  <div class="bento-grid bento-3 mb-4">
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-amber">42</div>
      <div class="stat-label">Diagram templates</div>
    </div>
    <div class="glass p-4 forge-stat">
      <div class="stat-value text-cyan">7</div>
      <div class="stat-label">Page layouts</div>
    </div>
    <div class="glass p-4 forge-stat">
      <div class="stat-value" style="color:var(--forge-emerald)">11</div>
      <div class="stat-label">Color tokens</div>
    </div>
  </div>
</main>
```

## Evidence and remediation

**Evidence:** UX auditor field `metrics.contractSpecificityReport` with `contractCount` and `issues[]` (`severity`, `hash`, `contract`, `message`). Messages are repo-relative paths plus heuristic detail (missing heading, word counts, duplicate cluster size). Up to **12** findings surface per pass; overflow notes `contract_specificity_total=N`. Reproduce locally:

```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . \
  --registry docs/design/catalog/visual-registry.yaml \
  --showcase showcase
```

Add **`--strict-contract-governance`** when validating separate Deterministic vs AI review headings on stateful contracts.

**Remediate (in order):**

1. **Add missing headings** — copy structure from [`docs/design/catalog/contract-template.md`](../../catalog/contract-template.md) into the hash file; never edit the template in place for a real hash.
2. **Rewrite Expected look** — replace stock adjectives with selector-level rhythm, density, and neighbor relationships (what sits above/below **Kpn**, **Ksr**, `site-header`, etc.).
3. **Deepen Anatomy and Forbidden patterns** — align bullets with registry `root_selector` and real `source_paths`; forbid hash-specific failures (link-card plus inner `btn-forge`, breadcrumb horizontal scroll, and similar).
4. **Author Deterministic checks** — list gates this hash must pass (`DET.HASH.MARKERS`, `DET.NAV.BREADCRUMB`, layout/grid rules) and scripts (`check-visual-catalog.mjs`, inventory crosswalk).
5. **States and responsive behavior** — for `layout` / `page` / `chrome-region`, enumerate default, interactive, empty, and reduced-motion coordination with **`Ksj`** / **`Ksc`** where motion applies.
6. **Deduplicate slabs** — run `node tools/design-catalog/apply-contract-governance-sections.mjs` or slug-keyed blurbs (`contract-element-blurbs.mjs`) when multiple contracts share the same Expected look paragraph.
7. Rebuild showcase (`python3 generator/build-showcase.py`) and re-run catalog + UX audits; escalate judgment gaps to **`AI.CONTRACT.IMPLEMENTATION_USEFULNESS`** only after deterministic specificity passes.

## Related rules

- `DET.CONTRACT.PATH` — registry rows must reference an on-disk contract where policy requires it.
- `DET.CONTRACT.PLACEHOLDERS` — contracts must not ship unresolved `TBD` / `TODO` / `FIXME` in strict inventory mode.
- `DET.HASH.MARKERS` — emitted visual roots carry matching `hash` and `data-ks-hash` attributes.
- `DET.HASH.REGISTRY_ROW` — three-letter hash exists in `visual-registry.yaml` with the expected `type`.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — judgment layer after deterministic specificity: can an engineer still implement without guessing intent?
- `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` — when one family contract covers multiple hashes, wording must truly span child variance.
