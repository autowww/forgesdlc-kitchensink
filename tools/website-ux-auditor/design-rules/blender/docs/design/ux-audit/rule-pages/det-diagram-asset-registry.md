---
rule_id: DET.DIAGRAM.ASSET_REGISTRY
lane: deterministic
title: Diagram asset registry
summary: Diagram catalog keys and shipped assets/svg paths must roll up under active diagram-family and diagram-asset-group rows in the Kitchen Sink visual registry before consumers render them.
page_version: 604982aa5871246f5988431b98954a0107c4eb95b773e28ec569ceb6857db68c
generated_at: 2026-05-29T18:00:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 87724e906a848a7d5ec60eacbed3cb849b1fc7ec44727bf62faba16465d8b2ff
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-diagram-asset-registry
related_rules:
  - DET.DIAGRAM.LABELS
  - DET.DIAGRAM.ALT
  - DET.HASH.MARKERS
  - DET.HASH.REGISTRY_ROW
  - DET.INVENTORY.CROSSWALK
  - AI.DIAGRAM.SEMANTIC_ACCURACY
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
---

## Purpose

Kitchen Sink ships reusable diagram tiles through `ks_diagram_tile_html`, `render_ks_diagram_block`, `js/ks-diagram-catalog.js`, and `generator/pages/_diagram_gallery.py`. Consumer sites inherit those keys and `assets/svg/template-*.svg` paths. Without registry governance, teams ship one-off SVGs or invented `data-diagram-key` values that bypass catalog contracts, legend maps, and hash coverage.

This deterministic rule aligns three layers:

1. **Repo baseline** — an active `diagram-family` parent (**Ksv** — Kitchen Sink SVG diagram & schematic assets) exists; every catalog key in `js/ks-diagram-catalog.js` maps to a gallery template in `_diagram_gallery.py`; every gallery `"svg"` filename appears on an active `diagram-family` or `diagram-asset-group` `source_paths` row (templates roll up under **Zxd** — diagram template SVGs).
2. **DOM crawl** — rendered `[data-diagram-key]` values exist in `window.__FORGE_KS_DIAGRAM_CATALOG`; `<img src="…assets/svg/…">` paths under `.forge-diagram`, `.ks-diagram-tile`, `[data-diagram-key] img`, or page-wide `img[src*="assets/svg/"]` mounts are registered.

**Plan:** Inventory diagram keys and SVG paths on the page and in repo sources. **Do:** Register new assets under `docs/design/catalog/visual-registry.yaml`, add gallery + catalog entries, regenerate `visual-registry.generated.json`. **Check:** metrics phase `diagramAssetRegistryRepoReport` / `diagramAssetRegistryReport`. **Adjust:** Remove stale keys or stop shipping unregistered paths to consumers.

## Passing signals

- Visual registry includes an **active `diagram-family`** row (**Ksv**) with child **`diagram-asset-group`** partitions (for example **Zxd** listing `assets/svg/template-gate-chain.svg`, `template-linear-flow.svg`, `template-swimlane.svg`, and siblings).
- Every **`data-diagram-key`** on consumer HTML matches a key in `js/ks-diagram-catalog.js` / `window.__FORGE_KS_DIAGRAM_CATALOG` (for example `linear`, `gate`, `swimlane` from `_diagram_gallery.py` `_FAMILIES` items).
- Shipped diagram **`<img src="assets/svg/template-*.svg">`** paths resolve to rows listed on active diagram-family or diagram-asset-group `source_paths`.
- **Repo parity:** keys parsed from `js/ks-diagram-catalog.js` each have a matching `"key"` entry in `generator/pages/_diagram_gallery.py`; gallery `"svg"` filenames map to registered `assets/svg/…` paths.
- Expandable tiles use **`forge-diagram-trigger ks-diagram-trigger`** only with **valid catalog keys** so `openDiagramWithDetail(this, …)` resolves against registered metadata.
- **No orphan consumer assets:** bespoke SVGs under `assets/svg/` that appear on public pages are either registered on a diagram-asset-group row or removed before deploy.

## Failing signals

- **Missing diagram family:** `visual-registry.generated.json` has no active `type: diagram-family` row — diagram assets cannot roll up under catalog governance (`missing-diagram-family`).
- **Unknown diagram key:** `data-diagram-key="gate-chain-delivery"` (or any string absent from the diagram catalog) on a shipped tile (`unknown-diagram-key`).
- **Unregistered SVG:** `<img src="assets/svg/custom-delivery-flow.svg">` (or any `assets/svg/` path not on a diagram-family / diagram-asset-group `source_paths` row) (`unregistered-diagram-svg`).
- **Catalog key without gallery mapping:** key present in `js/ks-diagram-catalog.js` but missing from `_diagram_gallery.py` `_FAMILIES` items (`catalog-key-unmapped`).
- **Gallery SVG not registered:** template added to `_diagram_gallery.py` and `assets/svg/` but **Zxd** (or the appropriate group) `source_paths` not updated before regeneration (`gallery-svg-not-registered`).
- **Stale expand modal key:** `onclick='openDiagramWithDetail(this, "bogus")'` where `"bogus"` is not a catalog key.
- **External or data URLs as bypass:** ad-hoc `https://…/diagram.svg` or inline-only diagrams on product pages without registry coverage when the team treats them as shipped KS visuals.

## Before example

Failing KS markup: consumer page ships an **invented catalog key** and an **unregistered one-off SVG** inside standard diagram tile chrome (`unknown-diagram-key`, `unregistered-diagram-svg`).

```html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Delivery gate chain</h2>
    <p class="forge-support mb-4">
      Work moves through intent, human review, agent execution, and release checkpoints.
    </p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-0"
      data-diagram-key="gate-chain-delivery"
      role="figure"
      onclick="openDiagramWithDetail(this, 'gate-chain-delivery')"
    >
      <div class="ks-diagram-canvas">
        <img
          src="assets/svg/custom-delivery-flow.svg"
          alt="Delivery gate chain diagram"
          loading="lazy"
        />
      </div>
    </div>
    <p class="forge-support small mt-2 mb-0">
      Custom flow for this landing page only — not in ks-diagram-catalog or Zxd source_paths.
    </p>
  </div>
</section>
```

## After example

Passing KS markup: **registered catalog key** (`gate` from `_diagram_gallery.py` / catalog) and **registered template SVG** (`assets/svg/template-gate-chain.svg` on **Zxd** `source_paths`), matching `ks_diagram_tile_html` output.

```html
<section class="forge-section py-5" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <div class="container-fluid px-3 px-xxl-5">
    <p class="section-label text-cyan mb-2">How it works</p>
    <h2 class="h4 mb-3">Delivery gate chain</h2>
    <p class="forge-support mb-4">
      Work moves through intent, human review, agent execution, and release checkpoints.
    </p>
    <div
      class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger ks-diagram-trigger mb-0"
      data-diagram-key="gate"
      role="figure"
      onclick="openDiagramWithDetail(this, 'gate')"
    >
      <div class="ks-diagram-canvas">
        <img
          src="assets/svg/template-gate-chain.svg"
          alt="Gate chain: Stage 1, Gate 1, Stage 2, Gate 2, Stage 3"
          loading="lazy"
        />
      </div>
    </div>
    <p class="forge-support small mt-2 mb-0">
      Registered under Ksv / Zxd — catalog key <code>gate</code> matches gallery and visual registry.
    </p>
  </div>
</section>
```

## Evidence and remediation

**Evidence:** Auditor metrics `diagramAssetRegistryRepoReport` (repo scan via `scanRepoDiagramAssetRegistry`) and `diagramAssetRegistryReport` (DOM collection via `collectDiagramAssetRegistryReport`). Findings include kinds `missing-diagram-family`, `catalog-key-unmapped`, `gallery-svg-not-registered`, `unknown-diagram-key`, and `unregistered-diagram-svg` with evidence tokens `key=…`, `svg=assets/svg/…`, and `url=…`. Default severity is **warn** on score dimension `visualCatalogGovernance` (cap **12** findings per pass). Capture the tile outer HTML, `data-diagram-key`, `img[src]`, and the matching registry row ids (**Ksv**, **Zxd**).

**Remediate (in order):**

1. **Add or confirm parent family** — ensure an active `diagram-family` row (**Ksv**) exists in `docs/design/catalog/visual-registry.yaml`.
2. **Register the SVG** — add `assets/svg/template-….svg` (or the bespoke path, if truly reusable) to the appropriate `diagram-asset-group` `source_paths` (for templates, **Zxd**).
3. **Wire catalog + gallery** — add the key to `generator/pages/_diagram_gallery.py` `_FAMILIES` items and mirror legend metadata in `js/ks-diagram-catalog.js`.
4. **Regenerate catalog JSON** — run `node tools/design-catalog/inventory-ks-visuals.mjs` and `node tools/design-catalog/check-visual-catalog.mjs --repo . --strict-inventory` for the full coverage report.
5. **Fix consumer markup** — replace invented keys with valid catalog keys; point `src` at registered paths; use `render_ks_diagram_block(key="gate")` or `ks_diagram_tile_html` in generators instead of hand-rolled paths.
6. **Follow-on checks** — after registry alignment, run `DET.DIAGRAM.LABELS`, `DET.DIAGRAM.ALT`, and `DET.HASH.MARKERS`; semantic accuracy remains under `AI.DIAGRAM.SEMANTIC_ACCURACY`.

## Related rules

- `DET.DIAGRAM.LABELS` — SVG text nodes and legend keys are present and readable for registered templates.
- `DET.DIAGRAM.ALT` — decorative vs informative classification matches `role` / `aria-hidden` on diagram tiles.
- `DET.HASH.MARKERS` — visual roots emit matching `hash` and `data-ks-hash` markers where applicable.
- `DET.HASH.REGISTRY_ROW` — emitted hashes resolve to active registry rows with expected `type`.
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes are a subset of registry entries.
- `AI.DIAGRAM.SEMANTIC_ACCURACY` — registered templates must still match the mechanism described in copy.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — registered diagrams should teach product structure, not merely satisfy inventory gates.
