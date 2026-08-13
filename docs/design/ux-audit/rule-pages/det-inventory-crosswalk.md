---
rule_id: DET.INVENTORY.CROSSWALK
lane: deterministic
title: Showcase inventory crosswalk
summary: Showcase-emitted KS hashes must be a subset of visual-registry.generated.json; no invalid-format hash tokens in showcase HTML or JS.
page_version: 0fd08e4e5faaa32b1464eb426f621cc8788f24ee840e7cc50de5a1d352e3097c
generated_at: 2026-05-25T14:32:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-inventory-crosswalk
---

## Purpose

Kitchen Sink builds a **showcase** tree (`showcase/*.html`, `showcase/assets/*.js`) that demonstrates every governed visual surface. Those files emit `hash="XYZ"` and `data-ks-hash="XYZ"` markers on catalog roots. **`DET.INVENTORY.CROSSWALK`** is a **repo-wide** deterministic check (metrics phase) that crosswalks **all showcase-emitted hashes** against `docs/design/catalog/visual-registry.generated.json` and flags **stray tokens** whose values are not exactly three ASCII letters.

Primary evidence lives in `docs/design/catalog/visual-inventory.generated.json` → `catalogCrosswalk`, refreshed by `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`. The check module `design-rules/deterministic/generated/det-inventory-crosswalk.check.js` reads that block (or rescans `showcase/` when the block is absent) and surfaces findings capped at **`MAX_INVENTORY_CROSSWALK_FINDINGS` (12)** per audit pass.

**Plan:** Register a surface in `visual-registry.yaml` before adding its hash to showcase output. **Do:** Run `python3 generator/build-showcase.py` after component changes; regenerate inventory JSON so `catalogCrosswalk.showcase_hashes_not_in_registry` stays empty. **Check:** `node tools/design-catalog/check-visual-catalog.mjs --repo . --refresh-inventory` and `analyze-website-ux.mjs` metrics for `inventoryCrosswalkReport`. **Adjust:** Register missing hashes, remove experimental markers, or fix invalid token shapes before chasing per-page **`DET.HASH.REGISTRY_ROW`** failures on consumer sites.

Unlike per-page rules, this rule evaluates the **entire showcase inventory**, not a single crawled URL. Passing **`DET.HASH.MARKERS`** on one page does not guarantee the repo crosswalk is clean if another showcase file still emits an unregistered hash.

## Passing signals

- `visual-inventory.generated.json` includes a `catalogCrosswalk` block without `error`, listing `showcase_dir` (typically `showcase`) and an empty `showcase_hashes_not_in_registry` array.
- Every hash collected from showcase HTML/JS by `collectEmittedHashes()` exists in `visual-registry.generated.json` with a valid three-letter token (for example **Hbk**, **Ksr**, **Ksf**, **Vln**, **Ldg** on preview pages).
- `collectShowcaseStrayTokens()` returns empty `hash` and `dataKsHash` arrays — no values like `ABCD`, `12`, or placeholder slugs on `hash=` / `data-ks-hash=` attributes.
- Showcase JS under `showcase/assets/` uses the same three-letter convention in `hash:"XYZ"` and `"data-ks-hash":"XYZ"` literals when present.
- `buildInventoryCrosswalkReport(repoRoot)` returns `{ skipped: false, issues: [] }`.
- After `python3 generator/build-showcase.py`, preview shells such as `showcase/preview-handbook.html` and `showcase/preview-landing.html` emit only registry-known layout and chrome hashes.
- Consumer submodule sites inherit a showcase tree whose crosswalk was verified at KS source — drift appears when local edits add markers without updating the registry.

## Failing signals

- **`unregistered-emitted` (warn):** Showcase HTML emits `hash="Zzz"` / `data-ks-hash="Zzz"` but **Zzz** has no row in `visual-registry.generated.json` — common after a prototype component ships before `allocate-visual-hash.mjs` / registry YAML update.
- **`stray-token` (minor):** Invalid marker shape in showcase — for example `hash="ABCD"` (four letters), `hash="12"`, or `data-ks-hash="todo"` — detected by `collectShowcaseStrayTokens()`.
- **`crosswalk-missing` (minor):** `visual-inventory.generated.json` exists but lacks `catalogCrosswalk`; regenerate inventory before interpreting crosswalk results.
- **`crosswalk-error` (minor):** `catalogCrosswalk.error` is set — inventory generation failed; fix upstream catalog tooling first.
- **`inventory-parse-error` / `no-inventory`:** Missing or unreadable inventory JSON — run `inventory-ks-visuals.mjs` from repo root.
- Findings truncate at 12 issues with a trailing "additional inventory crosswalk issues omitted" message when many showcase files drift at once.
- Passing **`DET.HASH.REGISTRY_ROW`** on a single built page does **not** clear this rule if another showcase file still emits an orphan hash.

## Before example

Failing showcase fragment: layout preview emits an **unregistered** hash **Zzz** and a sidebar carries a **stray** four-letter token. Inventory crosswalk reports both `unregistered-emitted` and `stray-token` kinds.

```html
<div
  class="container-fluid px-0"
  hash="Zzz"
  data-ks-hash="Zzz"
  data-ks-type="layout"
  data-ks-name="layout-experimental"
>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="ABCD"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      style="min-height:100vh;position:sticky;top:0;overflow-y:auto;align-self:flex-start;max-height:100vh"
    >
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Showcase</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Inventory crosswalk failure</h1>
          <p class="forge-support mt-2 mb-0">Zzz is not in visual-registry.generated.json; hash="ABCD" is not three ASCII letters.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Inner card has no hash markers — only governed roots are crosswalked.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing showcase fragment (aligned with `showcase/preview-handbook.html`): every emitted hash is registered; markers use exactly three ASCII letters with matching pairs.

```html
<div
  class="container-fluid px-0"
  hash="Hbk"
  data-ks-hash="Hbk"
  data-ks-type="layout"
  data-ks-name="layout-handbook"
>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="chrome-region"
      data-ks-name="doc-sidebar"
      style="min-height:100vh;position:sticky;top:0;overflow-y:auto;align-self:flex-start;max-height:100vh"
    >
      <div class="px-3 py-3" style="border-bottom:1px solid var(--forge-border)">
        <p class="forge-brand mb-0">
          <span class="brand-icon">F</span>
          <span class="text-amber">Forge SDLC</span>
        </p>
      </div>
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0">Hbk and Ksr are registered; showcase crosswalk is clean.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Site footer region uses registered hash Ksf when emitted below main.</p>
        </div>
      </div>
      <div
        class="ks-site-footer-region"
        hash="Ksf"
        data-ks-hash="Ksf"
        data-ks-type="chrome-region"
        data-ks-name="site-footer"
      >
        <p class="forge-support small py-3 mb-0">footer_html</p>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

| Finding kind | Severity | Remediation |
|--------------|----------|-------------|
| `unregistered-emitted` | warn | Add the surface to `docs/design/catalog/visual-registry.yaml`, regenerate `visual-registry.generated.json`, or remove the stray showcase marker if the surface is not governed. |
| `stray-token` | minor | Replace invalid values with a registered three-letter hash in both `hash="XYZ"` and `data-ks-hash="XYZ"`, or remove the marker from showcase HTML/JS. |
| `crosswalk-missing` / `crosswalk-error` | minor | Run `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`, then `node tools/design-catalog/check-visual-catalog.mjs --repo . --refresh-inventory`. |
| Truncated list (>12 issues) | minor | Use the full catalog check output; fix registry and showcase in batch before re-auditing. |

**Workflow (PDCA):**

1. **Plan** — When adding a visual root to `components/` or showcase previews, allocate or reuse a registry hash first (`allocate-visual-hash.mjs` / edit `visual-registry.yaml`).
2. **Do** — Emit markers via `ks_hash_attrs()`, `layout_shell_attrs()`, or `chrome_region_attrs()` in Python generators; rebuild showcase with `python3 generator/build-showcase.py`.
3. **Check** — Refresh inventory JSON and run the UX auditor on the KS repo (metrics phase reads `inventoryCrosswalkReport`). Confirm `showcase_hashes_not_in_registry` is empty and no stray tokens appear in `showcase/`.
4. **Adjust** — Register orphan hashes, delete experimental markers, or normalize invalid token shapes; regenerate inventory before consumer submodule bumps.

Harness verification: `python3 generator/build_rule_defect_fixtures.py` (overlay with unregistered **Zzz**), then `auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.INVENTORY.CROSSWALK`.

## Related rules

- `DET.HASH.MARKERS` — per-page marker pairing and three-letter shape on crawled HTML.
- `DET.HASH.REGISTRY_ROW` — per-page registry membership and `data-ks-type` alignment.
- `DET.CONTRACT.PATH` — registered hashes must reference on-disk design contract files where required.
- `DET.DIAGRAM.ASSET_REGISTRY` — diagram SVG assets referenced by registry rows exist on disk.
- `DET.PY.KS_HASH_ATTRS` — Python generators must use `ks_hash_attrs()` instead of manual hash literals.
