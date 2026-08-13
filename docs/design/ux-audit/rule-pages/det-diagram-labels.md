---
rule_id: DET.DIAGRAM.LABELS
lane: deterministic
title: Diagram legend labels on surface
summary: Catalog-linked diagram tiles must expose readable SVG or ASCII text that matches js/ks-diagram-catalog.js legend node keys (items[].node).
page_version: 0858730d2b0252a1092b06d68f05eeb90f5106633e12ac673f4bc04f09f05986
generated_at: 2026-05-19T22:35:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-diagram-labels
---

## Purpose

Kitchen Sink diagrams teach mechanism through **visible node names**, not only modal legends or `alt` text. Catalog entries in `js/ks-diagram-catalog.js` declare `items[].node` strings (for example `Step A` on `linear`, `Stage 1` / `Gate 1` on `gate`). Template SVGs under `assets/svg/template-*.svg` and rendered tiles (`ks_diagram_tile_html`, `forge-diagram`, `ks-diagram-tile`, `data-diagram-key`) must surface those strings in **readable** `<text>` / `<tspan>` nodes—or, for ASCII figures, in `.forge-diagram-ascii-pre` lines—so sighted readers and zoomed UI see the same vocabulary as the catalog contract.

This deterministic rule complements `DET.DIAGRAM.ALT` (informative vs decorative exposure) and `DET.DIAGRAM.ASSET_REGISTRY` (registered keys and paths). It does **not** judge arrow direction or gate symbology (`AI.DIAGRAM.SEMANTIC_ACCURACY`). Coverage thresholds: at least **2** characters per label token; for catalog keys with legend entries, at least **2** matching nodes or **50%** of legend nodes (whichever is higher). Placeholder tokens such as `[subtitle]` and `[Title - …]` do not count as readable labels.

**Plan:** Open `js/ks-diagram-catalog.js` for the tile's `data-diagram-key`; list `items[].node` values. **Do:** Mirror those strings in SVG `<text>` (or ASCII body) when customizing `assets/svg/template-*.svg` or page copy. **Check:** Re-run auditor metrics (`diagramLabelsReport`, `diagramLabelsRepoReport`) or compare DevTools text nodes to the catalog modal legend. **Act:** Fix template SVG, catalog legend, or generator wiring—never rely on `alt` alone when the on-surface labels are empty or abbreviated.

## Passing signals

- **Linear template:** `data-diagram-key="linear"` tile shows SVG text **Step A**, **Step B**, **Step C**, **Step D** matching catalog nodes (see `assets/svg/template-linear-flow.svg`).
- **Gate template:** `data-diagram-key="gate"` tile exposes **Stage 1**, **Gate 1**, **Stage 2**, **Gate 2**, **Stage 3** as readable `<text>` (not only diamond **G** glyphs) when the catalog lists full gate names.
- **Catalog coverage:** For a key with *N* legend nodes, at least `max(2, ceil(N × 0.5))` node strings appear in fetched SVG or inline `svg` text (substring match allowed).
- **ASCII parity:** `figure.forge-diagram-ascii` / `.forge-diagram-ascii-pre` lines include catalog node tokens when `data-diagram-key` is set.
- **Repo scan clean:** `scanRepoDiagramLabels` reports no `repoIssues` for registered `template-*.svg` files mapped in `generator/pages/_diagram_gallery.py`.
- **Decorative skip:** Tiles with `aria-hidden="true"` or `role="presentation"` are excluded; charts under `[data-ks-chart]` / `.ks-chart-mount` are out of scope.
- **Readable minimum:** Each counted label is at least **2** characters after trim and is not a lone bracketed placeholder (`[subtitle]`, `[Footer note - …]`).

## Failing signals

- **`diagram-labels-no-readable-text`:** Visible `data-diagram-key` tile (for example `linear`) whose SVG/ASCII surface has only placeholders or empty `<text>` nodes—no catalog node strings on the rendered surface.
- **`diagram-labels-legend-gap`:** Some labels exist but fewer than required matches (for example only **Step A** on a four-node `linear` legend; **Stage 1**–**Stage 3** without **Gate 1** / **Gate 2** on `gate`).
- **Abbreviated gate glyphs:** Catalog lists **Gate 1** but SVG shows only **G** inside diamonds—legend keys do not appear on the surface.
- **Alt-only naming:** Informative `alt` describes nodes while SVG text stays generic; this rule still fails because it inspects on-diagram text, not `alt`.
- **Catalog drift:** Renamed legend nodes in `js/ks-diagram-catalog.js` without updating `assets/svg/template-*.svg` (or the reverse).
- **Unkeyed tiles:** Diagrams without `data-diagram-key` are not scored for legend alignment (fix registry first under `DET.DIAGRAM.ASSET_REGISTRY`).

## Before example

Failing KS markup: catalog key `linear` with template SVG whose visible text is only bracket placeholders (`diagram-labels-no-readable-text`). Second tile uses key `gate` but surface text abbreviates gates to **G** while the catalog expects **Gate 1** / **Gate 2** (`diagram-labels-legend-gap`).

```html
<div class="ks-section" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <p class="forge-support small mb-2">Diagram label coverage</p>
  <h2 class="h4 mb-3">Catalog keys without on-surface names</h2>
  <motion.div
    class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-4"
    data-diagram-key="linear"
    role="figure"
    hash="Lnf"
    data-ks-hash="Lnf"
  >
    <motion.div class="ks-diagram-canvas">
      <img
        src="assets/svg/template-linear-flow.svg"
        alt="Linear flow with four placeholder steps"
        loading="lazy"
      />
    </motion.div>
    <p class="forge-support small mt-2 mb-0">
      Modal legend lists Step A–D, but the SVG surface only shows [subtitle] placeholders.
    </p>
  </motion.div>
  <motion.div
    class="forge-diagram breathe-static ks-diagram-tile mb-0"
    data-diagram-key="gate"
    role="figure"
    hash="Gtc"
    data-ks-hash="Gtc"
  >
    <motion.div class="ks-diagram-canvas">
      <svg viewBox="0 0 700 280" role="img" aria-label="Gate chain with abbreviated gate labels">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="70" y="52" text-anchor="middle" fill="#F1F5F9" font-size="11">Stage 1</text>
        <text x="196" y="58" text-anchor="middle" fill="#F59E0B" font-size="9">G</text>
        <text x="300" y="52" text-anchor="middle" fill="#F1F5F9" font-size="11">Stage 2</text>
        <text x="426" y="58" text-anchor="middle" fill="#F59E0B" font-size="9">G</text>
        <text x="530" y="52" text-anchor="middle" fill="#F1F5F9" font-size="11">Stage 3</text>
      </svg>
    </motion.div>
    <p class="forge-support small mt-2 mb-0">
      Catalog legend requires Gate 1 and Gate 2; diamonds only show G.
    </p>
  </motion.div>
</div>
```

## After example

Passing KS markup: `linear` tile uses registered `template-linear-flow.svg` with catalog node strings on the surface; `gate` tile spells out full gate names.

```html
<div class="ks-section" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <p class="forge-support small mb-2">Diagram label coverage</p>
  <h2 class="h4 mb-3">Legend keys visible on the tile</h2>
  <motion.div
    class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-4"
    data-diagram-key="linear"
    role="figure"
    hash="Lnf"
    data-ks-hash="Lnf"
  >
    <motion.div class="ks-diagram-canvas">
      <img
        src="assets/svg/template-linear-flow.svg"
        alt="Linear flow: Step A through Step D"
        loading="lazy"
      />
    </motion.div>
    <p class="forge-support small mt-2 mb-0">Step A, Step B, Step C, Step D (matches catalog nodes)</p>
  </motion.div>
  <motion.div
    class="forge-diagram breathe-static ks-diagram-tile mb-0"
    data-diagram-key="gate"
    role="figure"
    hash="Gtc"
    data-ks-hash="Gtc"
  >
    <motion.div class="ks-diagram-canvas">
      <img
        src="assets/svg/template-gate-chain.svg"
        alt="Gate chain: Stage 1, Gate 1, Stage 2, Gate 2, Stage 3"
        loading="lazy"
      />
    </motion.div>
    <p class="forge-support small mt-2 mb-0">
      Surface text includes Stage 1, Gate 1, Stage 2, Gate 2, Stage 3 per catalog.
    </p>
  </motion.div>
</div>
```

Passing ASCII diagram (catalog-aligned node tokens in `.forge-diagram-ascii-pre`):

```html
<figure
  class="forge-diagram forge-diagram-ascii breathe-static mb-0"
  data-diagram-key="gate"
  role="figure"
  hash="Asc"
  data-ks-hash="Asc"
>
  <div class="forge-diagram-ascii-canvas">
    <pre class="forge-code forge-diagram-ascii-pre"><code class="language-text">[ Stage 1 ] --&gt; [ Gate 1 ] --&gt; [ Stage 2 ] --&gt; [ Gate 2 ] --&gt; [ Stage 3 ]</code></pre>
  </div>
  <figcaption class="forge-diagram-ascii-caption forge-support small mt-2 mb-0">
    ASCII gate chain uses the same node names as js/ks-diagram-catalog.js.
  </figcaption>
</figure>
```

## Evidence and remediation

**Evidence:** Auditor metrics `diagramLabelsReport` (DOM) and `diagramLabelsRepoReport` (repo template scan). Violations include `kind` (`diagram-labels-no-readable-text`, `diagram-labels-legend-gap`), `key`, `selectorHint` (for example `motion.div.forge-diagram[key=linear]`), `matched` / `required` / `legendCount`, and `svg=assets/svg/template-….svg` for template issues. Findings default to **warn** under `visualCatalogGovernance`. Capture outer HTML for the diagram root plus fetched SVG source or inline `svg` subtree.

**Remediate (in order):**

1. **`diagram-labels-no-readable-text`:** Add `<text>` / `<tspan>` labels (at least 2 characters) for catalog `items[].node` strings in `assets/svg/template-*.svg`, or embed matching tokens in `.forge-diagram-ascii-pre`. Remove reliance on `[subtitle]`-only surfaces for informative diagrams.
2. **`diagram-labels-legend-gap`:** Align abbreviated glyphs (for example **G**) with full legend names (**Gate 1**), or update `js/ks-diagram-catalog.js` when the shorter form is intentional—then re-run repo scan.
3. **Gallery wiring:** Ensure `generator/pages/_diagram_gallery.py` maps the key to the SVG you edited; run `DET.DIAGRAM.ASSET_REGISTRY` if the key or path is new.
4. **Generator path:** Prefer `render_ks_diagram_block(key="linear")` / `ks_diagram_tile_html` over hand-rolled tiles so `data-diagram-key` and asset paths stay registered.
5. **Follow-on:** After labels pass, verify `DET.DIAGRAM.ALT` and `DET.HASH.MARKERS`; use `AI.DIAGRAM.SEMANTIC_ACCURACY` when labels exist but topology disagrees with prose.

## Related rules

- `DET.DIAGRAM.ALT` — decorative vs informative `alt` / `aria-hidden` policy for the same diagram roots.
- `DET.DIAGRAM.ASSET_REGISTRY` — `data-diagram-key` and `assets/svg/` paths must be catalog-registered before label alignment matters.
- `DET.HASH.MARKERS` — visual roots should emit `hash` / `data-ks-hash` on diagram tiles.
- `AI.DIAGRAM.SEMANTIC_ACCURACY` — arrows, gates, and roles match the story even when labels are present.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — labels should teach product structure, not only satisfy coverage minima.