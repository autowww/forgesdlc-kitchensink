---
rule_id: DET.HASH.MARKERS
lane: deterministic
title: Visual hash marker pairing
summary: Each governed visual root emits matching hash="XYZ" and data-ks-hash="XYZ" values (exactly three ASCII letters).
page_version: d1aa2d4c999392ad3ab6ffb34581d8776d8bf2e3ced4d902d4c967a01d9ef33b
generated_at: 2026-05-19T22:20:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-hash-markers
---

## Purpose

Kitchen Sink assigns every reusable **visual root** (layout shell, chrome region, page, section, component, diagram block, React primitive root) a three-letter **hash** registered in `docs/design/catalog/visual-registry.yaml`. Emitted HTML must expose that hash twice on the same element: `hash="XYZ"` and `data-ks-hash="XYZ"`, plus `data-ks-type` and `data-ks-name` where the catalog defines them. The pair lets crawlers, auditors, and remediation plans locate governed surfaces in raw HTML without relying on class names alone.

This deterministic rule evaluates **`metrics.ksVisualHashReport`** from the UX auditor crawl (`lib/dom-metrics.js`). It flags invalid token shapes, attribute mismatches, one-sided markers, and (as a warning) repeated hashes on multiple nodes. **Registry membership** is **`DET.HASH.REGISTRY_ROW`**; contract file presence is **`DET.CONTRACT.PATH`**. Python source should use `ks_hash_attrs()` (`components/ks_hash_attrs.py`) so builds fail before shipping one-sided markers.

**Plan:** Allocate or reuse a hash when adding a visual surface. **Do:** Emit both attributes from `ks_hash_attrs`, `layout_shell_attrs`, `chrome_region_attrs`, or React `ksVisualAttrs` / `ksReactPrimitiveAttrs`. **Check:** `node tools/website-ux-auditor/analyze-website-ux.mjs` on built `website/` or `showcase/`, or grep HTML for `[data-ks-hash]` and confirm each node has a matching `hash=`. **Adjust:** Fix pairing before chasing registry or contract issues — a page can pass **`DET.HASH.MARKERS`** while **`DET.CONTRACT.PATH`** still fails.

## Passing signals

- Every element with `[data-ks-hash]` or `[hash]` that represents a governed visual root has **both** attributes set to the **same** three-letter value (for example `hash="Hbk"` and `data-ks-hash="Hbk"`).
- Marker values match `/^[A-Za-z]{3}$/` (exactly three ASCII letters). Python `ks_hash_attrs()` also requires three **distinct** letters at build time.
- Companion metadata is present where KS emits it: `data-ks-type="layout"`, `data-ks-name="layout-handbook"`, `data-ks-type="chrome-region"`, `data-ks-name="doc-sidebar"`, and similar pairs on showcase pages such as `showcase/preview-handbook.html`.
- `ksVisualHashReport.validUnique` lists discovered hashes; `invalidRaw`, `mismatches`, and `incompleteMarkers` are empty for the page.
- `instanceCountByHash` shows at most one instance per hash on a page, or duplicates are intentional and documented in the catalog contract.
- Consumer sites that submodule KS reproduce the same marker pattern on handbook shells (**Hbk**, **Ksr**, **Kco**, **Ksf**) and doc pages (**Ctr**, **Fag**) after `build-showcase.py` / site generators run.

## Failing signals

- **`invalidRaw` (minor):** Value is not exactly three ASCII letters — for example `data-ks-hash="abcd"`, `hash="12"`, or placeholder tokens copied from docs.
- **`mismatches` (minor):** `hash="Hbk"` and `data-ks-hash="Xyz"` on the same node — often a partial edit or manual HTML paste.
- **`incompleteMarkers` (warn):** Only `data-ks-hash` without `hash=`, or only `hash=` without `data-ks-hash` on a governed root.
- **`instanceCountByHash` > 1 (warn):** Same hash on multiple elements (for example two `data-ks-hash="Ksr"` sidebars) — may be valid for reusable chrome but needs catalog justification.
- Stray `hash=` on non-visual nodes pollutes the scan; remove or align with registry policy.
- Findings cap at **`MAX_HASH_MARKER_FINDINGS` (10)** per page with a trailing “additional issues omitted” message when many nodes break at once.
- Passing this rule does **not** imply the hash is registered (**`DET.HASH.REGISTRY_ROW`**) or that contracts exist (**`DET.CONTRACT.PATH`**).

## Before example

Failing handbook shell: layout root carries `data-ks-hash` and type metadata but omits the paired `hash=` attribute. Sidebar has `hash=` but omits `data-ks-hash`. Crawl reports `incompleteMarkers`.

```html
<div
  class="container-fluid px-0"
  data-ks-hash="Hbk"
  data-ks-type="layout"
  data-ks-name="layout-handbook"
>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="Ksr"
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
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0">Layout root missing hash=; sidebar missing data-ks-hash.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Inner card is not a catalog visual root.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing handbook shell (aligned with `showcase/preview-handbook.html`): layout and chrome roots emit matching pairs and type metadata from `ks_hash_attrs()` / `chrome_region_attrs()`.

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
    <main
      id="main"
      class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5"
      hash="Vhb"
      data-ks-hash="Vhb"
      data-ks-type="layout-preview"
      data-ks-name="preview-handbook"
    >
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Handbook sample page</h1>
          <p class="forge-support mt-2 mb-0" style="font-size:1rem">Markers pair on every governed root.</p>
        </header>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">Footer hash paired.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Capture:** Save the audited URL, raw HTML snippet around each flagged selector (`[data-ks-hash="…"]`), and the `ksVisualHashReport` slice from analyze output (`invalidRaw`, `mismatches`, `incompleteMarkers`, `instanceCountByHash`). For KS repo work, grep `showcase/` or rebuilt `website/` after `python3 generator/build-showcase.py`.

**Remediation (PDCA):**

1. **Plan** — Identify the visual root in `visual-registry.yaml` (hash, `type`, `name`). Do not invent ad hoc tokens.
2. **Do** — In Python renderers, use `ks_hash_attrs(hash_id, visual_type, name)` or layout/chrome helpers; in React, use `ksReactPrimitiveAttrs()` / `ksVisualAttrs()`. Never set only one of `hash` or `data-ks-hash`.
3. **Check** — Re-run `analyze-website-ux.mjs` on the built tree; confirm `DET.HASH.MARKERS` is clean, then run `DET.HASH.REGISTRY_ROW` and `node tools/design-catalog/check-visual-catalog.mjs --repo .`.
4. **Adjust** — For intentional duplicate instances, document repetition in the design contract; for consumer sites, bump the `kitchensink` submodule after fixing emitters in **forgesdlc-kitchensink**.

Module: `design-rules/deterministic/generated/det-hash-markers.check.js` (auditor package). Default severity **minor**; incomplete pairs and duplicate-instance warnings use **warn**.

## Related rules

- `DET.HASH.REGISTRY_ROW` — hash exists in generated registry with expected `type` (orthogonal DOM pairing check).
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes are a subset of registry; no stray tokens.
- `DET.CONTRACT.PATH` — registry row resolves to an on-disk design contract (may fail while markers pass).
- `DET.PY.KS_HASH_ATTRS` — Python sources call `ks_hash_attrs()` at emit sites (build-time complement).
- `DET.REACT.KS_ATTRS` — React primitives emit governed `data-ks-type` / `data-ks-name` / hash trio.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — contracts should cite `DET.HASH.MARKERS` in verification sections for implementers.
