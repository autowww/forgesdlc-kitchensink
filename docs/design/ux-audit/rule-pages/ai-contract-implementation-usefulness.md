---
rule_id: AI.CONTRACT.IMPLEMENTATION_USEFULNESS
lane: ai
title: Contract implementation usefulness
summary: Design contracts must give engineers element-specific anatomy, states, and verification so hashed KS surfaces ship without guessing UX intent.
page_version: f7ff82700a1d09b1e3cadd2e41ab3466a52a73692ba53f2f8fbf67274be91e1f
generated_at: 2026-05-19T17:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-contract-implementation-usefulness
---

## Purpose

Kitchen Sink treats **design contracts** under `docs/design/catalog/**/{HASH}-*.md` as the implementation spec for registry-backed visuals: anatomy, states, responsive rules, accessibility, forbidden patterns, and screenshot acceptance. Deterministic gates (`DET.CONTRACT.PATH`, `DET.CONTRACT.PLACEHOLDERS`, `DET.CATALOG.CONTRACT_SPECIFICITY`) prove files exist and resist boilerplate; this AI rule judges whether a contract is **useful to implement**—an engineer or agent can build or refactor the surface without inventing IA, spacing, interaction, or landmark behavior.

**Plan:** Pair each audited hash with its contract, showcase or consumer HTML, and screenshot (when available). Flag gaps where anatomy, states, or verification are missing or could apply to any unrelated component. **Do:** Rewrite contracts with registry `root_selector`, concrete selectors, state tables, and acceptance checks tied to that hash. **Check:** A reviewer can trace contract bullets to emitted markup (`hash` / `data-ks-hash`) and to deterministic checks listed in the contract. **Adjust:** When the same ambiguity repeats (for example missing terminal-crumb policy on all breadcrumbs), propose a `DET.*` candidate or tighten the catalog template.

## Passing signals

- **Expected look** and **Anatomy** name real KS classes and regions (for example `.ks-doc-breadcrumb`, `forge-card`, `forge-ambient-content`)—not “looks professional” without selectors.
- **States** cover what implementers must ship: default, interactive, empty, loading/error (when relevant), and reduced-motion coordination with related hashes.
- **Responsive behavior** states collapse, truncation, or wrap rules (for example deep breadcrumb paths ellipsis + `title`, not horizontal scroll).
- **Accessibility contract** specifies landmarks, focus order, `aria-current`, decorative separators (`aria-hidden`), and contrast expectations.
- **Deterministic checks** in the contract cite repeatable gates (`DET.HASH.MARKERS`, `DET.NAV.BREADCRUMB`, hash-specific DOM anchors) with thresholds or scripts where KS ships them.
- **Implementation notes** point to real entrypoints (`components/layouts.py`, `render_breadcrumbs`, `chrome_region_attrs`) and hash emitters.
- **Forbidden patterns** are specific to the surface (not copied verbatim across unrelated hashes).
- Showcase or consumer HTML matches the contract’s root selector and hash markers without contradictory structure.

## Failing signals

- Contract reads like template soup: identical **Expected look** / **Enterprise look** paragraphs across unrelated hashes with no element-specific anatomy.
- States section omitted or says only “default” when the surface has interactive, empty, or motion-sensitive behavior.
- No `root_selector` alignment between registry, contract, and emitted DOM (auditors cannot anchor snapshots).
- Implementation notes missing while the surface is composed from Python/React helpers—implementers must read source to discover structure.
- Screenshot acceptance vague (“looks good”) with no width, contrast, or hash-bearing root requirement.
- Emitted markup invents structure (generic `div` stacks, wrong active-crumb semantics) because the contract never specified them.
- Family-level contract claims to cover children whose layout jobs differ materially (`AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` escalation).

## Before example

Failing KS markup: breadcrumb chrome invented because the contract only said “show a trail”—no `Kbc` root, no `nav`/`ol`, terminal crumb still a link, separators exposed to assistive tech.

```html
<header class="site-header d-none d-lg-block">
  <div class="text-muted small mb-2">
    <a href="/showcase/">Showcase</a> /
    <a href="/showcase/layouts.html">Layouts</a> /
    <a href="/showcase/handbook-chapter.html">Handbook chapter</a>
  </div>
  <h1 class="font-display forge-gradient-text mb-0">Handbook chapter</h1>
</header>
```

## After example

Passing KS markup: matches **Kbc — Doc breadcrumb** contract—`ks-doc-breadcrumb` root, hash markers, `nav[aria-label="breadcrumb"]`, Bootstrap `breadcrumb` list, terminal item `aria-current="page"` (showcase header from `_showcase_header` + `render_breadcrumbs`).

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-3 col-xl-2 site-header-brand">
      <p class="forge-brand mb-0"><span class="brand-icon">F</span> <span class="text-amber">Forge Kitchen Sink</span></p>
      <p class="mt-1 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Design system museum</p>
    </div>
    <div class="col-lg-9 col-xl-10 site-header-content">
      <div
        class="ks-doc-breadcrumb"
        hash="Kbc"
        data-ks-hash="Kbc"
        data-ks-type="chrome-region"
        data-ks-name="doc-breadcrumb"
      >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb small mb-3">
            <li class="breadcrumb-item"><a href="/showcase/">Showcase</a></li>
            <li class="breadcrumb-item"><a href="/showcase/layouts.html">Layouts</a></li>
            <li class="breadcrumb-item active" aria-current="page">Handbook chapter</li>
          </ol>
        </nav>
      </div>
      <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">Handbook chapter</h1>
    </div>
  </div>
</header>
```

## Evidence and remediation

**Capture:** contract path (`docs/design/catalog/.../{HASH}-*.md`), registry row (`root_selector`, `contract_status`), HTML snippet or DOM snapshot from showcase/build output, and screenshot when `screenshot_status` is `captured` or `planned`. Note which contract sections justify the markup.

**Remediate (in order):**

1. Add or fix **Anatomy** with registry `root_selector` and child regions; align **Implementation notes** with real `source_paths`.
2. Author **States**, **Responsive behavior**, and **Accessibility contract** for every behavior implementers would otherwise guess.
3. Replace generic **Expected look** copy with element-specific rhythm, density, and neighbor relationships (see `DET.CATALOG.CONTRACT_SPECIFICITY`).
4. List **Deterministic checks** that map to shipped auditor rules; run `node tools/design-catalog/check-visual-catalog.mjs` and contract inventory after edits.
5. Rebuild showcase (`python3 generator/build-showcase.py`) and verify `hash` / `data-ks-hash` on the visual root.
6. If variance across children invalidates family wording, split contracts or justify family coverage under `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED`.

## Related rules

- `DET.CATALOG.CONTRACT_SPECIFICITY` — element-specific expected anatomy and forbidden patterns, not boilerplate.
- `DET.CONTRACT.PATH` — registry rows reference an on-disk contract where required.
- `DET.CONTRACT.PLACEHOLDERS` — no unresolved `TBD` / `TODO` / `FIXME` in strict mode.
- `DET.HASH.MARKERS` — emitted roots carry `hash` and `data-ks-hash`.
- `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` — family contracts must truly cover child variance.
