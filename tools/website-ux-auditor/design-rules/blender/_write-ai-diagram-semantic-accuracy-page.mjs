#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dest = path.resolve(
  __dirname,
  '../../../../docs/design/ux-audit/rule-pages/ai-diagram-semantic-accuracy.md',
);

const body = `---
rule_id: AI.DIAGRAM.SEMANTIC_ACCURACY
lane: ai
title: Diagram semantic accuracy
summary: Diagram topology, arrow direction, and node labels must match the mechanism described in captions, body copy, and catalog legend keys—not merely look polished.
page_version: 8bb03a75ed4ad02de06c7242c8f4cfb9d828437dfb255fb87ae7e543f58d694a
generated_at: 2026-05-28T17:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: generated
source_rule: docs/design/ux-audit/ai-enabled-design-principles.md#ai-diagram-semantic-accuracy
related_rules:
  - DET.DIAGRAM.LABELS
  - DET.DIAGRAM.ALT
  - DET.DIAGRAM.ASSET_REGISTRY
  - DET.HASH.MARKERS
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
  - AI.DATA.INSIGHT_LEGIBILITY
---

## Purpose

Kitchen Sink ships mechanism diagrams as static SVG tiles (\`ks_diagram_tile_html\`, \`render_ks_diagram_block\`, \`forge-diagram\`, \`ks-diagram-tile\`, \`ks-diagram-canvas\`), ASCII figures (\`figure.forge-diagram-ascii\`), and expandable catalog mounts (\`forge-diagram-trigger\`, \`ks-diagram-trigger\`, \`data-diagram-key\`, \`openDiagramWithDetail\`). Deterministic gates prove labels exist (\`DET.DIAGRAM.LABELS\`), alt policy is coherent (\`DET.DIAGRAM.ALT\`), assets are registered (\`DET.DIAGRAM.ASSET_REGISTRY\`), and hashes are emitted (\`DET.HASH.MARKERS\`); they do **not** judge whether arrows, gates, and node roles match the story the page tells.

This AI rule asks: **do shapes and flow match the described mechanism?** A loop template under a "linear gate chain" caption, an agent→human arrow when copy says "human approves before agent work," or diamond gates drawn as plain rectangles all fail—even when contrast and registry checks pass.

**Plan:** For each informative diagram, read caption, surrounding prose, and catalog \`legend_map\` / contract \`semantics\` together with the SVG topology (or modal legend from \`ks-diagram-catalog.js\`). **Do:** Swap template families, relabel nodes, or redraw edges so direction, cardinality, and gate symbology align. **Check:** A reader can trace the claimed sequence on the figure without mental correction. **Adjust:** When the same mismatch repeats (for example linear copy always paired with \`template-loop-cycle\`), propose a \`DET.*\` candidate or tighten diagram contract \`semantics\` / \`forbidden_patterns\`.

## Passing signals

- **Caption ↔ topology:** Prose says "sequential review gates" and the figure is a left-to-right gate chain (\`template-gate-chain\`, catalog key \`gate\`) or linear flow—not a cycle, fork, or reversed arrow unless the text explicitly allows it.
- **Arrow direction matches agency:** "Human approves, then agent executes" shows approval **before** the agent box; release follows evidence, not a shortcut from intent to ship.
- **Shape vocabulary is consistent:** Diamonds (or catalog gate glyphs) mean checkpoints; rectangles mean work stages; dashed vs solid edges match optional vs required paths in the contract legend.
- **Labels tie to legend keys:** SVG text and \`data-node\` attributes use the same terms as the figcaption and \`DET.DIAGRAM.LABELS\` contract keys (no orphan "Step B" when the story names "Human review gate").
- **Alt and caption agree:** \`alt\` and surrounding \`forge-support\` copy describe the same path the eye can follow (informative diagrams are not decorative while claiming a mechanism).
- **Expand modal legend matches tile:** When \`forge-diagram-trigger\` opens catalog detail, modal narrative does not contradict the static tile.
- **Template choice is intentional:** \`render_ks_diagram_block(key="gate")\` or \`assets/svg/template-*.svg\` selection matches the mechanism class (linear, gated, decision branch, network)—not "whatever thumbnail looked good."

## Failing signals

- Caption promises a **one-way gate chain** but the tile shows a **loop**, bidirectional edge, or agent path that skips the human review node.
- **Arrow reversal:** edges run opposite to numbered steps in body copy or section heading.
- **Wrong template family:** linear-flow copy paired with \`template-loop-cycle\`, org-chart, or network mesh topology.
- **Gate symbology drift:** diamonds labeled "optional" in text drawn as required hard gates (or absent gates where copy says "hard stop").
- **Decorative misclassification:** \`role="presentation"\` / empty \`alt\` while the surrounding section argues a product mechanism (\`DET.DIAGRAM.ALT\` may pass classification while semantics still fail).
- **Legend modal contradicts tile:** expanded catalog text describes a different sequence than the inline SVG.
- **Unlabeled decision points:** fork or join with no label while prose refers to "if review fails, return to intent"—topology hides the branch.

## Before example

Failing KS markup: section copy and support line describe a **sequential human-then-agent gate chain**, but the shipped tile uses a **loop-back** template and an \`alt\` that describes a cycle—topology does not match the mechanism.

\`\`\`html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="section" data-ks-name="delivery-gates">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Human review before agent execution</h2>
    <p class="forge-support mb-4">
      Work moves in one direction: shape intent, pass a human review gate, then let the agent execute inside bounded scope, then release with evidence.
    </p>
    <figure class="forge-diagram breathe-static ks-diagram-tile mb-0" role="figure" hash="Lpc" data-ks-hash="Lpc">
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
\`\`\`

## After example

Passing KS markup: same story with the **gate-chain** template, registered catalog key \`gate\`, left-to-right arrows, and labels that match caption and body copy (\`ks_diagram_tile_html\` output shape).

\`\`\`html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="section" data-ks-name="delivery-gates">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Human review before agent execution</h2>
    <p class="forge-support mb-4">
      Work moves in one direction: shape intent, pass a human review gate, then let the agent execute inside bounded scope, then release with evidence.
    </p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-0"
      data-diagram-key="gate"
      role="figure"
      hash="Gtc"
      data-ks-hash="Gtc"
      onclick="openDiagramWithDetail(this, 'gate')"
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
\`\`\`

## Evidence and remediation

**Capture:** screenshot of the diagram tile and (if expandable) modal legend; copy the figcaption or \`forge-support\` line and one paragraph of mechanism prose; export SVG or note \`data-diagram-key\` / \`img[src]\`; link the catalog diagram contract \`legend_map\` and \`semantics\` when present.

**Remediate (in order):**

1. Restate the mechanism in one sentence (actors, order, gates, branches). List required nodes and edge directions.
2. Pick the matching template family (\`template-linear-flow\`, \`template-gate-chain\`, \`template-decision-flow\`, etc.) or update custom SVG labels / \`data-node\` attributes to match.
3. Align \`alt\`, caption or support copy, and body text to the same sequence; fix \`DET.DIAGRAM.ALT\` classification if the diagram is informative.
4. Run \`DET.DIAGRAM.LABELS\` and \`DET.DIAGRAM.ASSET_REGISTRY\`; ensure \`DET.HASH.MARKERS\` still pass after edits.
5. Re-run AI review on the page batch; if the same topology mismatch repeats across sites, propose a deterministic \`DET.DIAGRAM.*\` semantic proxy or tighten catalog \`semantics\` / \`forbidden_patterns\`.

## Related rules

- \`DET.DIAGRAM.LABELS\` — SVG text and legend keys are present and readable.
- \`DET.DIAGRAM.ALT\` — decorative vs informative classification matches \`role\` / \`aria-hidden\` usage.
- \`DET.DIAGRAM.ASSET_REGISTRY\` — diagram families are registered when shipped to consumers.
- \`DET.HASH.MARKERS\` — visual roots emit matching \`hash\` and \`data-ks-hash\` markers.
- \`AI.VISUAL.PRODUCT_EXPLANATORY_VALUE\` — diagrams should explain product structure or user benefit, not generic decoration.
- \`AI.DATA.INSIGHT_LEGIBILITY\` — charts must communicate the intended insight; adjacent judgment for data visuals, not SVG flows.
`;

await fs.writeFile(dest, body, 'utf8');
console.log('wrote', dest);
