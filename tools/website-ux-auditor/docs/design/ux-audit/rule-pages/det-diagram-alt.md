---
rule_id: DET.DIAGRAM.ALT
lane: deterministic
title: Diagram decorative vs informative alt
summary: aria-hidden, role, and alt/aria-label must agree for Kitchen Sink diagram tiles, ASCII figures, and catalog-linked SVG mounts.
page_version: 2a41d2762a8955a191adcfb2803cbf7d10eb49e43c8b575f7545749b36ddb51d
generated_at: 2026-05-19T21:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 6773fda516344e110b5a7b1435e655e1264e773825ca8bbe62194189891c42ba
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-diagram-alt
related_rules:
  - DET.DIAGRAM.LABELS
  - DET.DIAGRAM.ASSET_REGISTRY
  - DET.CHART.ALT_SUMMARY
  - AI.DIAGRAM.SEMANTIC_ACCURACY
  - AI.VISUAL.PRODUCT_EXPLANATORY_VALUE
---

## Purpose

Kitchen Sink ships mechanism diagrams as static tiles (`ks_diagram_tile_html`, `forge-diagram`, `ks-diagram-tile`, `ks-diagram-canvas`), ASCII figures (`forge-diagram-ascii`), and catalog-linked mounts (`data-diagram-key`, expandable `forge-diagram-trigger`). Screen readers need a **consistent contract**: decorative assets stay out of the accessibility tree; informative diagrams expose a name through `alt`, `aria-label`, `aria-labelledby`, `aria-describedby`, or nearby `figcaption` / `forge-support` copy (minimum **3 characters**).

This deterministic rule scans visible diagram roots (`.forge-diagram`, `.ks-diagram-tile`, `[data-diagram-key]`, `figure.forge-diagram`, `figure.forge-diagram-ascii`, and qualifying `svg[role="img"]` inside diagram mounts). It excludes data-chart mounts (`[data-ks-chart]`, `.ks-chart-mount`, chart containers) and ambient layers (`.forge-ambient-bg`, `.ks-living-scene`, nav, toolbars). Violation kinds: `diagram-alt-missing-summary`, `diagram-alt-informative-hidden`, `diagram-alt-decorative-named`, `diagram-alt-conflicting-role`.

**Plan:** List diagram tiles on the page; note whether each block teaches a mechanism (informative) or only adds texture (decorative). **Do:** Use `ks_diagram_tile_html(..., decorative=True)` for wallpaper tiles; use `role="figure"` or `role="img"` plus meaningful `alt` / caption for catalog-linked diagrams. **Check:** Re-run auditor metrics (`diagramAltReport`) or inspect each `.ks-diagram-tile` in DevTools for `aria-hidden`, `role`, and name sources. **Act:** Fix generator flags, page templates, or hand-authored HTML so classification matches assistive-tech exposure; for semantic accuracy of arrows and labels, see `AI.DIAGRAM.SEMANTIC_ACCURACY`.

## Passing signals

- **Informative catalog tile:** `div.forge-diagram.ks-diagram-tile` with `data-diagram-key`, `role="figure"`, inner `img` with **`alt` at least 3 characters**, and no `aria-hidden="true"` on the root or primary `img` / `svg`.
- **Informative SVG mount:** `svg[role="img"]` inside `.ks-diagram-canvas` with **`aria-label`** (or `aria-labelledby` to visible caption text) when the tile is not decorative.
- **Figure + caption:** `figure.forge-diagram` or `figure.forge-diagram-ascii` with **`figcaption.forge-support`** whose text is at least 3 characters, satisfying the name requirement without duplicating a misleading `alt`.
- **Decorative tile:** `role="presentation"` on the root, **`alt=""`** on `img`, and **`aria-hidden="true"`** on the decorative asset—**no** `aria-label`, non-empty `alt`, or `role="img"` on the same subtree.
- **ASCII diagram:** `figure.forge-diagram.forge-diagram-ascii` with `data-diagram-key` and caption in `figcaption.forge-diagram-ascii-caption` when the ASCII teaches structure; decorative ASCII uses presentation role and hidden subtree per `ascii_diagram_figure_html` decorative mode.
- **Expand trigger consistency:** `forge-diagram-trigger` / `ks-diagram-trigger` does not hide an informative name while the adjacent section argues a product mechanism.
- **Chart exclusion:** `.ks-chart-mount` and `[data-ks-chart]` regions are scored under `DET.CHART.ALT_SUMMARY`, not this rule.

## Failing signals

- **`diagram-alt-missing-summary`:** Visible `data-diagram-key` tile or `role="figure"` / `role="img"` diagram with **no** `alt`, `aria-label`, labelledby/describedby target, or `figcaption` text of at least 3 characters.
- **`diagram-alt-informative-hidden`:** Meaningful `alt` / `aria-label` or caption text present while root or target has **`aria-hidden="true"`** or **`role="presentation"`** (assistive tech cannot reach the claimed name).
- **`diagram-alt-decorative-named`:** **`alt=""`** on `img` but a non-empty accessible name elsewhere (for example `aria-label` on parent) without `aria-hidden` / presentation role—empty alt and named exposure conflict.
- **`diagram-alt-conflicting-role`:** **`aria-hidden="true"`** combined with **`role="img"`** on the same diagram or primary `svg` / `img` target.
- **Misclassified hero texture:** Section background diagram inside `ks-section` marked informative while copy treats it as ambient-only (or the reverse).
- **Chart misfiled as diagram:** Do not fix chart mounts here; wire summaries under `DET.CHART.ALT_SUMMARY` instead.

## Before example

Failing KS markup (div wrappers only): informative tile hidden from AT (`diagram-alt-informative-hidden`), `aria-hidden` with `role="img"` (`diagram-alt-conflicting-role`), catalog tile without a name (`diagram-alt-missing-summary`), and empty `alt` with parent `aria-label` (`diagram-alt-decorative-named`).

```html
<div class="ks-section" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <p class="forge-support small mb-2">How governed delivery flows</p>
  <h2 class="h4 mb-3">Intent to release</h2>
  <div
    class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger mb-4"
    data-diagram-key="template-gate-chain"
    role="figure"
    aria-hidden="true"
    hash="Gtc"
    data-ks-hash="Gtc"
  >
    <div class="ks-diagram-canvas">
      <img
        src="assets/svg/template-gate-chain.svg"
        alt="Linear gate chain from intent through human review to agent execution and release"
        loading="lazy"
      />
    </div>
  </div>
  <div
    class="forge-diagram breathe-static ks-diagram-tile mb-4"
    data-diagram-key="template-loop-cycle"
    role="img"
    aria-hidden="true"
    aria-label="Decorative loop texture"
  >
    <div class="ks-diagram-canvas">
      <img src="assets/svg/template-loop-cycle.svg" alt="" loading="lazy" />
    </div>
  </div>
  <div
    class="forge-diagram breathe-static ks-diagram-tile mb-4"
    data-diagram-key="template-linear-flow"
    role="figure"
    hash="Lnf"
    data-ks-hash="Lnf"
  >
    <div class="ks-diagram-canvas">
      <img src="assets/svg/template-linear-flow.svg" alt="" loading="lazy" />
    </div>
  </div>
  <div class="forge-diagram breathe-static ks-diagram-tile mb-0" role="figure" aria-label="Ambient forge texture">
    <div class="ks-diagram-canvas">
      <img src="assets/svg/template-network-mesh.svg" alt="" loading="lazy" />
    </div>
  </div>
</div>
```

## After example

Passing KS markup: informative catalog tile with `role="figure"`, non-empty `alt`, and visible `forge-support` caption; decorative companion uses presentation + empty alt + `aria-hidden` only.

```html
<div class="ks-section" hash="Dgm" data-ks-hash="Dgm" data-ks-type="page" data-ks-name="diagrams">
  <p class="forge-support small mb-2">How governed delivery flows</p>
  <h2 class="h4 mb-3">Intent to release</h2>
  <div
    class="forge-diagram breathe-static ks-diagram-tile forge-diagram-trigger mb-4"
    data-diagram-key="template-gate-chain"
    role="figure"
    hash="Gtc"
    data-ks-hash="Gtc"
  >
    <div class="ks-diagram-canvas">
      <img
        src="assets/svg/template-gate-chain.svg"
        alt="Gate chain: intent, human review, agent execution, release with evidence"
        loading="lazy"
      />
    </div>
    <p class="forge-support small mt-2 mb-0">
      Linear gate chain: Intent → Human review → Agent execution → Release
    </p>
  </div>
  <div
    class="forge-diagram breathe-static ks-diagram-tile mb-0"
    role="presentation"
    aria-hidden="true"
  >
    <div class="ks-diagram-canvas">
      <img src="assets/svg/template-loop-cycle.svg" alt="" aria-hidden="true" loading="lazy" />
    </div>
  </div>
</div>
```

Passing ASCII diagram block (informative) using `div` wrappers and `forge-diagram-ascii` classes:

```html
<div class="forge-diagram forge-diagram-ascii breathe-static mb-4" data-diagram-key="ascii-gate-sketch" role="figure" hash="Asc" data-ks-hash="Asc">
  <div class="forge-diagram-ascii-canvas">
    <pre class="forge-code forge-diagram-ascii-pre">[ Intent ] --&gt; [ Review ] --&gt; [ Agent ] --&gt; [ Release ]</pre>
  </div>
  <p class="forge-diagram-ascii-caption forge-support small mt-2 mb-0">
    ASCII sketch of the same linear gate chain for text-only readers.
  </p>
</div>
```

## Evidence and remediation

**Evidence:** Auditor metrics `diagramAltReport` with `violations[]` entries carrying `kind` (`diagram-alt-missing-summary`, `diagram-alt-informative-hidden`, `diagram-alt-decorative-named`, `diagram-alt-conflicting-role`), `selectorHint` (for example `div.ks-diagram-tile[key=template-gate-chain][@Gtc]`), and `className`. Findings surface as **major** accessibility issues with remediation text keyed by `kind`. Capture outer HTML for the diagram root, primary `img` / `svg`, and adjacent `forge-support` / caption nodes.

**Remediate (in order):**

1. **`diagram-alt-missing-summary`:** Add meaningful `alt`, `aria-label`, `aria-labelledby`, or `figcaption` / `forge-support` copy (≥ 3 characters) on informative tiles; or mark purely decorative tiles with `decorative=True` in `ks_diagram_tile_html`.
2. **`diagram-alt-informative-hidden`:** Remove `aria-hidden="true"` and `role="presentation"` from informative roots; keep the caption and `alt` aligned with body copy.
3. **`diagram-alt-decorative-named`:** Remove stray `aria-label` / non-empty `alt` from decorative assets, or reclassify as informative and drop empty-alt + hidden flags.
4. **`diagram-alt-conflicting-role`:** Never pair `aria-hidden="true"` with `role="img"`; use `role="presentation"` and hidden subtree for decorative SVG/img only.
5. Re-run deterministic diagram checks; if names exist but topology or legend keys disagree with prose, address **`AI.DIAGRAM.SEMANTIC_ACCURACY`** and **`DET.DIAGRAM.LABELS`** separately.

## Related rules

- `DET.DIAGRAM.LABELS` — SVG text and legend keys must be readable and tied to contract labels.
- `DET.DIAGRAM.ASSET_REGISTRY` — catalog-linked `data-diagram-key` assets must appear in the visual registry.
- `DET.CHART.ALT_SUMMARY` — data chart mounts use chart summary policy, not diagram alt classification.
- `AI.DIAGRAM.SEMANTIC_ACCURACY` — arrow direction, gate symbology, and template choice match the described mechanism.
- `AI.VISUAL.PRODUCT_EXPLANATORY_VALUE` — product diagrams should teach structure, not only satisfy alt minima.
