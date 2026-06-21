---
rule_id: AI.PY.HTML_AUTHORING_QUALITY
lane: ai
title: Python HTML authoring quality
summary: Python renderers should emit intentional Kitchen Sink markup with clear section shells and stable heading ladders, not redundant wrapper soup.
page_version: eddf841cfaab677f10ee5d31210c7f9ae09147211bdb2501e58a5e8c041ec28c
generated_at: 2026-05-28T17:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-py-html-authoring-quality
related_rules:
  - DET.PY.KS_HASH_ATTRS
  - DET.PY.OPTIONAL_REGIONS
  - DET.SECTION.HEADING
  - DET.SECTION.SINGLE_JOB
  - DET.HASH.MARKERS
  - AI.CONTRACT.IMPLEMENTATION_USEFULNESS
---

## Purpose

Kitchen Sink ships most public surfaces through **Python HTML modules** (`components/components.py`, `components/layouts.py`, `components/presentation.py`, `components/marketing_sections.py`, generator page composers). Deterministic gates prove hash markers and heading order exist; this AI rule judges whether the emitted HTML **reads as authored on purpose**—a reviewer can infer section jobs, scan headings, and map DOM to `render_*` entrypoints without mentally unwrapping accidental nesting.

**Plan:** Open showcase or consumer HTML for a page type, trace each major block to its renderer, and note heading jumps, anonymous wrapper stacks, and spacing hacks that bypass KS helpers. **Do:** Refactor toward `render_section`, `render_alert`, `chrome_region_attrs` / `ks_hash_attrs`, and registry-backed roots. **Check:** Outline order matches `h2` then `h3`/`h4`/`h5` inside sections; optional slots omit ghost headings (`DET.PY.OPTIONAL_REGIONS`). **Adjust:** When the same anti-pattern repeats (for example triple-wrapped card grids), propose a `DET.*` candidate or tighten the contract `anatomy` field.

## Passing signals

- Major content blocks use **`render_section`** (or layout equivalents): `<section class="mb-5" id="…">`, optional `section-label`, one `<h2 class="font-display">`, then body—not a chain of unlabeled `<div>` shells.
- **Heading ladder** stays coherent under each section `h2`: static grids use `h5` on `forge-card` cells (`card-label` eyebrows); rails use `h4` from `_rail_card_cell`—not `h1` → `h4` jumps with no section `h2`.
- **Visual roots** carry `hash` / `data-ks-hash` via `ks_hash_attrs` or `chrome_region_attrs` where the registry defines a hash (`DET.PY.KS_HASH_ATTRS`, `DET.HASH.MARKERS`).
- Spacing and rhythm use KS tokens (`forge-divider`, `mb-5`, `forge-support`, `forge-card`, `breathe-static`, `row`/`col-*`) instead of anonymous wrappers with inline `margin-top`.
- **Optional regions** (`render_card_rail` with empty items, optional sidebars) return `""` or omit the section—no empty `h2` or placeholder shells.
- Card rails and callouts use shared helpers (`render_card_rail`, `render_alert`, `_rail_card_cell`) so structure matches showcase “For agents” documentation.
- A maintainer can point from DOM to **implementation notes** in the design contract without guessing which Python function produced a subtree.

## Failing signals

- **Nesting soup:** three or more consecutive wrapper `<div>`s with no KS class, landmark, or hash—only inline `style` for spacing.
- **Heading jumps:** page-level `h1` followed by card `h4`/`h5` with no intervening section `h2`, or multiple `h1` elements in one article.
- **Redundant wrappers** duplicating what `render_section` already provides (extra `<section>` inside `<section>` with duplicate titles).
- **Ghost structure:** optional lists render empty rails, blank `forge-card` shells, or `section-label` above missing body copy.
- **Ad-hoc semantics:** breadcrumbs, alerts, or CTAs hand-rolled with generic classes while `render_breadcrumbs` / `render_alert` / `render_nav_buttons` exist.
- **Hash afterthought:** visual chrome invented in raw strings while registry rows expect `ks-doc-breadcrumb`, `ks-section`, or catalog hashes.
- Copy-pasted markup blocks across pages with drifting class lists—signals the renderer should be centralized in `components/`.

## Before example

Failing KS markup: anonymous wrapper stack, heading jump (`h1` → `h4`), spacing via nested unclassed `<div>`s instead of `render_section` / `forge-divider`, and outcome cells without `forge-card` or section shell.

```html
<main id="main">
  <div>
    <div style="margin-top:2rem">
      <div>
        <h1 class="font-display forge-gradient-text mb-0">Governed delivery</h1>
        <p class="forge-support">Human-owned intent with agent execution.</p>
      </div>
    </div>
    <div style="margin-top:3rem">
      <div>
        <div>
          <p class="section-label text-cyan mb-2">Outcomes</p>
          <div class="row g-3">
            <div class="col-md-4">
              <div>
                <div>
                  <h4 class="font-display mb-2">Traceable</h4>
                  <p class="small text-muted mb-0">Evidence on every change.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div>
                <div>
                  <h4 class="font-display mb-2">Reviewable</h4>
                  <p class="small text-muted mb-0">Gates before release.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div>
                <h4 class="font-display mb-2">Bounded</h4>
                <p class="small text-muted mb-0">Clear execution limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
```

## After example

Passing KS markup: `render_section` shell (`components/components.py`) with `forge-divider`, `section-label`, section `h2`, and static outcome cells matching showcase card grids (`forge-card breathe-static`, `card-label`, `h5`, `forge-support`).

```html
<main id="main">
  <hr class="forge-divider" />
  <section class="mb-5" id="outcomes">
    <p class="section-label text-cyan mb-2">Outcomes</p>
    <h2 class="font-display mb-4" style="font-size:1.75rem">What teams gain</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100">
          <p class="card-label">Traceable</p>
          <h5 class="font-display mt-2 mb-2">Evidence on every change</h5>
          <p class="forge-support small mb-0">Reviewers can follow intent to work to proof without opening source maps.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100">
          <p class="card-label">Reviewable</p>
          <h5 class="font-display mt-2 mb-2">Gates before release</h5>
          <p class="forge-support small mb-0">Human checkpoints stay visible in the delivery spine.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="forge-card breathe-static p-3 h-100">
          <p class="card-label">Bounded</p>
          <h5 class="font-display mt-2 mb-2">Clear execution limits</h5>
          <p class="forge-support small mb-0">Agents and automation run inside declared boundaries.</p>
        </div>
      </div>
    </div>
  </section>
</main>
```

## Evidence and remediation

**Capture:** generator module path (for example `generator/pages/*.py`, `components/components.py`), function name (`render_section`, `render_card_rail`), built HTML snippet or DOM snapshot, design contract `render_entrypoints` / `anatomy`, and screenshot when the page is registry-backed. Note heading order (`h1` count, first `h2`, card heading levels) and wrapper depth.

**Remediate (in order):**

1. Replace anonymous wrapper stacks with **`render_section`** (or layout slot contracts) so each major block has one `id`, one `h2`, and optional `section-label`.
2. Normalize **heading levels** inside sections (`h5` on static card grids, `h4` on `_rail_card_cell` rails under section `h2`); fix page-level `h1` policy per layout contract.
3. Route cards, rails, and callouts through **`forge-card`**, `render_card_rail`, `render_alert`, or other shared helpers—do not fork markup strings.
4. Emit **`ks_hash_attrs` / `chrome_region_attrs`** on visual roots required by the registry; align with `DET.PY.KS_HASH_ATTRS`.
5. Guard **optional slots** so empty inputs omit the region entirely (`DET.PY.OPTIONAL_REGIONS`).
6. Update the element contract **anatomy** and **forbidden_patterns** when structure changes; rebuild showcase (`python3 generator/build-showcase.py`) and re-run AI batch on the affected URLs.
7. If the same nesting or heading jump appears across multiple renderers, propose a deterministic `DET.*` (for example max anonymous wrapper depth) in the remediation plan.

## Related rules

- `DET.PY.KS_HASH_ATTRS` — Python renderers attach `ks_hash_attrs` on catalog visual roots.
- `DET.PY.OPTIONAL_REGIONS` — empty optional slots must not leave ghost headings or shells.
- `DET.SECTION.HEADING` — one heading per major section; order matches the page outline.
- `DET.SECTION.SINGLE_JOB` — each section block serves one scannable job.
- `DET.HASH.MARKERS` — `hash` and `data-ks-hash` on emitted visual roots.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — contracts must specify anatomy so HTML authoring has a spec to match.
