---
rule_id: AI.DIAGRAM.SEMANTIC_ACCURACY
lane: ai
title: Diagram semantic accuracy
summary: Diagram topology, arrow direction, and node labels must match the mechanism described in captions, body copy, and catalog legend keys—not merely look polished.
page_version: 3319dce935a7c7298634bba56f854c498cece01023c95f17075c4c4850066db7
generated_at: 2026-05-19T18:15:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-diagram-semantic-accuracy
---

## Purpose

Kitchen Sink ships diagrams as static SVG tiles (`render_ks_diagram_block`, `ks_diagram_tile_html`), ASCII figures (`forge-diagram-ascii`), and optional expand modals (`ks-diagram-trigger`, `data-diagram-key`). Deterministic gates (`DET.DIAGRAM.LABELS`, `DET.DIAGRAM.ALT`, `DET.DIAGRAM.ASSET_REGISTRY`) prove labels exist, alt policy is coherent, and assets are registered; they do **not** judge whether arrows, gates, and node roles match the story the page tells.

This AI rule asks: **do shapes and flow match the described mechanism?** A loop template under a "linear gate chain" caption, an agent→human arrow when copy says "human approves before agent work," or diamond gates drawn as plain rectangles all fail—even when contrast and hash markers pass.

**Plan:** For each informative diagram, read caption, surrounding prose, and catalog `legend_map` / contract semantics together with the SVG topology (or modal legend). **Do:** Swap template keys, relabel nodes, or redraw edges so direction, cardinality, and gate symbology align. **Check:** A reader can trace the claimed sequence on the figure without mental correction. **Adjust:** When the same mismatch repeats (for example caption always says "sequential" while `template-loop-cycle` ships), propose a `DET.*` candidate or tighten diagram contract `semantics` fields.

## Passing signals

- **Caption ↔ topology:** Prose says "sequential review gates" and the figure is a left-to-right gate chain (`template-gate-chain`) or linear flow—not a cycle, fork, or reversed arrow unless the text explicitly allows it.
- **Arrow direction matches agency:** "Human approves, then agent executes" shows approval **before** the agent box; release follows evidence, not a shortcut from intent to ship.
- **Shape vocabulary is consistent:** Diamonds (or catalog gate glyphs) mean checkpoints; rectangles mean work stages; dashed vs solid edges match optional vs required paths in the contract legend.
- **Labels tie to legend keys:** SVG `data-node` / text labels use the same terms as the figcaption and `DET.DIAGRAM.LABELS` contract keys (no orphan "Step B" when the story names "Review gate").
- **Alt and caption agree:** `alt` and surrounding copy describe the same path the eye can follow (informative diagrams are not decorative while claiming a mechanism).
- **Expand modal legend matches tile:** When `forge-diagram-trigger` + `data-diagram-key` open `ks-diagram-catalog.js` detail, modal narrative does not contradict the static tile.
- **Template choice is intentional:** `render_ks_diagram_block(key=…)` or `assets/svg/template-*.svg` selection matches the mechanism class (linear, gated, decision branch, network)—not "whatever thumbnail looked good."

## Failing signals

- Caption promises a **one-way gate chain** but the tile shows a **loop**, bidirectional edge, or agent path that skips the human review node.
- **Arrow reversal:** edges run opposite to numbered steps in body copy or section heading.
- **Wrong template family:** linear-flow copy paired with loop-cycle, org-chart, or network mesh topology.
- **Gate symbology drift:** diamonds labeled "optional" in text drawn as required hard gates (or absent gates where copy says "hard stop").
- **Decorative misclassification:** `role="presentation"` / empty `alt` while the surrounding section argues a product mechanism (`DET.DIAGRAM.ALT` may pass classification while semantics still fail).
- **Legend modal contradicts tile:** expanded catalog text describes a different sequence than the inline SVG.
- **Unlabeled decision points:** fork or join with no label while prose refers to "if review fails, return to intent"—topology hides the branch.

## Before example

Failing KS markup: section copy and figcaption describe a **sequential human-then-agent gate chain**, but the shipped tile uses a **loop-back** template and an `alt` that describes a cycle—topology does not match the mechanism.

```html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="section" data-ks-name="delivery-gates">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Human review before agent execution</h2>
    <p class="forge-support mb-4">
      Work moves in one direction: shape intent, pass a human review gate, then let the agent execute inside bounded scope, then release with evidence.
    </p>
    <figure class="forge-diagram breathe-static ks-diagram-tile mb-0" role="figure">
      <div class="ks-diagram-canvas">
        <img
          src="assets/svg/template-loop-cycle.svg"
          alt="Cyclic loop: agent executes, then human review, then back to agent"
          loading="lazy"
        />
      </div>
      <figcaption class="forge-support small mt-2 mb-0">
        Linear gate chain: Intent → Human review → Agent execution → Release
      </figcaption>
    </figure>
  </div>
</section>
```

## After example

Passing KS markup: same story with a **gate-chain** template, left-to-right arrows, and labels that match caption and body copy (`ks_diagram_tile_html` + expandable catalog key).

```html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="section" data-ks-name="delivery-gates">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Human review before agent execution</h2>
    <p class="forge-support mb-4">
      Work moves in one direction: shape intent, pass a human review gate, then let the agent execute inside bounded scope, then release with evidence.
    </p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger"
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
      Linear gate chain: Intent → Human review → Agent execution → Release (matches left-to-right arrows and diamond gates in the SVG).
    </p>
  </div>
</section>
```

## Evidence and remediation

**Capture:** screenshot of the diagram tile and (if expandable) modal legend; copy the figcaption or support line and one paragraph of mechanism prose; export SVG or note `data-diagram-key` / `src` path; link the catalog diagram contract `legend_map` and `semantics` when present.

**Remediate (in order):**

1. Restate the mechanism in one sentence (actors, order, gates, branches). List required nodes and edge directions.
2. Pick the matching template family (`template-linear-flow`, `template-gate-chain`, `template-decision-flow`, etc.) or update custom SVG labels/`data-node` attributes to match.
3. Align `alt`, caption or support copy, and body text to the same sequence; fix `DET.DIAGRAM.ALT` classification if the diagram is informative.
4. Run `DET.DIAGRAM.LABELS` and registry checks; ensure `DET.DIAGRAM.ASSET_REGISTRY` and `DET.HASH.MARKERS` still pass after edits.
5. Re-run AI review on the page batch; if the same topology mismatch repeats across sites, propose a deterministic `DET.DIAGRAM.*` semantic proxy or tighten catalog `semantics` / `forbidden_patterns`.

## Related rules

- `DET.DIAGRAM.LABELS` — SVG text and legend keys are present and readable.
- `DET.DIAGRAM.ALT` — decorative vs informative classification matches `role` / `aria-hidden` usage.
- `DET.DIAGRAM.ASSET_REGISTRY` — diagram families are registered when shipped to consumers.
- `DET.HASH.MARKERS` — visual roots emit matching `hash` and `data-ks-hash` markers.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — diagrams should explain product structure or user benefit, not generic decoration.
- `AI.DATA.INSIGHT_LEGIBILITY` — charts must communicate the intended insight; adjacent judgment for data visuals, not SVG flows.
