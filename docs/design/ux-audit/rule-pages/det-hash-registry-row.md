---
rule_id: DET.HASH.REGISTRY_ROW
lane: deterministic
title: Visual hash registry crosswalk
summary: Each emitted three-letter KS hash must exist in visual-registry.generated.json with registry type matching data-ks-type when that attribute is present.
page_version: 7a21ba7f71ebcb59647ac5a517f9cabad7e39f338561da5a3b0ba238ce0e3dca
generated_at: 2026-05-19T22:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-hash-registry-row
---

## Purpose

Kitchen Sink registers every governed visual surface in `docs/design/catalog/visual-registry.yaml`, emitted as `docs/design/catalog/visual-registry.generated.json`. When HTML ships with `hash="XYZ"` / `data-ks-hash="XYZ"`, auditors must confirm that **XYZ is a real registry row** and that optional DOM metadata matches the row's **`type`** field (for example `layout` for **Hbk**, `chrome-region` for **Ksr**).

This deterministic rule runs in the **metrics** phase (`det-hash-registry-row.check.js`). It collects hash instances from `metrics.ksVisualHashReport` or live DOM (`[data-ks-hash]`, `[hash]`), then crosswalks each three-letter token against the generated registry. **`DET.HASH.MARKERS`** only checks marker shape and pairing; **`DET.HASH.REGISTRY_ROW`** answers whether the token is catalog-governed and typed correctly. Contract file presence remains **`DET.CONTRACT.PATH`**.

**Plan:** Allocate or reuse a hash in `visual-registry.yaml` before emitting it from Python (`ks_hash_attrs`, `layout_shell_attrs`, `chrome_region_attrs`) or React helpers. **Do:** Regenerate JSON after registry edits; keep `data-ks-type` aligned with the registry `type` column. **Check:** `node tools/design-catalog/check-visual-catalog.mjs --repo .` and `analyze-website-ux.mjs` on `showcase/` or consumer `website/`. **Adjust:** Register unknown hashes, migrate deprecated aliases, or fix `data-ks-type` mismatches before relying on contract or AI usefulness rules.

## Passing signals

- Every rendered hash on a governed visual root (for example **Hbk**, **Ksr**, **Ksf**, **Kco**) appears in `visual-registry.generated.json` with `status: active` (or an allowed non-deprecated state).
- When `data-ks-type` is present on the DOM node, it equals the registry row's `type` after normalization (case-insensitive trim): `layout` for handbook shell **Hbk**, `chrome-region` for `aside.forge-sidebar` **Ksr**, `chrome-region` for **Ksf** footer region.
- `buildHashRegistryRowReport` returns `{ skipped: false, issues: [] }` for the page's hash instance list.
- `hash` and `data-ks-hash` agree on the canonical token (conflicting pairs are skipped by the collector, per **`DET.HASH.MARKERS`**).
- Showcase builds after `python3 generator/build-showcase.py` emit only registry-known hashes on preview pages such as `showcase/preview-handbook.html`.
- No `unknown-hash`, `type-mismatch`, or `deprecated` kinds in `hashRegistryRowReport.issues`.
- Generated registry has no duplicate hash keys (`registry-duplicate` is empty).

## Failing signals

- **`unknown-hash` (warn):** HTML emits `data-ks-hash="Zzz"` (or any three-letter token) with no row in `visual-registry.generated.json` — common after a local experiment or copy-paste from docs without running `allocate-visual-hash.mjs`.
- **`type-mismatch` (minor):** Registry lists **Ksr** as `type: chrome-region` but DOM has `data-ks-type="component"` or `data-ks-type="layout"` on the sidebar root.
- **`deprecated` (minor):** Registry row `status: deprecated` still emitted on a consumer site; remediation should follow registry `aliases` to the successor hash.
- **`registry-missing` (minor):** Markers present in HTML but `visual-registry.generated.json` is absent or unreadable at repo root — fix catalog generation before interpreting other visual-catalog rules.
- **`registry-duplicate` (warn):** Generated JSON lists the same hash twice — repair `visual-registry.yaml` / generator output so `entryByHash` is unambiguous.
- Findings cap at **`MAX_HASH_REGISTRY_ROW_FINDINGS` (12)** per pass with a trailing "additional issues omitted" finding when many hashes break at once.
- Passing **`DET.HASH.MARKERS`** does not imply registry membership; a perfectly paired unknown token still fails here.

## Before example

Failing crosswalk: handbook shell **Hbk** is registered and typed correctly, but **Ksr** declares `data-ks-type="component"` while the registry row is `chrome-region`, and a stray hero block emits unregistered hash **Zzz**.

```html
<div
  class="container-fluid px-0"
  hash="Hbk"
  data-ks-hash="Hbk"
  data-ks-type="layout"
  data-ks-name="layout-handbook"
>
  <section class="landing-hero forge-section" style="position:relative;overflow:hidden">
    <div
      class="hero-content"
      hash="Zzz"
      data-ks-hash="Zzz"
      data-ks-type="section"
      data-ks-name="experimental-hero"
    >
      <p class="section-label text-cyan mb-2">Preview</p>
      <h1 class="product-landing-title mb-3">Unregistered surface</h1>
      <p class="forge-support mb-0">Hash Zzz is not in visual-registry.generated.json.</p>
    </div>
  </section>
  <div class="row g-0 flex-lg-nowrap min-vh-100">
    <aside
      class="forge-sidebar col-lg-3 col-xl-2 d-none d-lg-flex flex-column p-0"
      hash="Ksr"
      data-ks-hash="Ksr"
      data-ks-type="component"
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
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Registry crosswalk failure</h1>
          <p class="forge-support mt-2 mb-0">Ksr type does not match catalog; Zzz is unknown.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Inner card has no hash — not evaluated by this rule.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing crosswalk: remove or register experimental surfaces; **Ksr** uses `data-ks-type="chrome-region"` per `docs/design/catalog/chrome/Ksr-doc-sidebar.md`; only registry-known hashes remain on visual roots.

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
          <p class="forge-support mt-2 mb-0">Hbk and Ksr rows match visual-registry.generated.json.</p>
        </header>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">Footer hash Ksf is registered as chrome-region.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics may include `hashRegistryRowReport` with `registryJson`, `rowCount`, `issues[]` (`kind: unknown-hash | type-mismatch | deprecated | registry-missing | registry-duplicate`, `hash`, optional `domType` / `registryType`, `message`). Findings use area **`visual-catalog`**, default severity **`warn`** for unknown hashes, **`minor`** for type mismatches and deprecated rows. Selectors such as `[data-ks-hash="Ksr"]` anchor remediation to the DOM node. Attach the registry row snippet from `visual-registry.yaml` and the built HTML fragment showing `data-ks-type`.

**Remediate (in order):**

1. **Unknown hash** — run `node tools/design-catalog/allocate-visual-hash.mjs`, add the row to `visual-registry.yaml`, create or link the design contract, regenerate `visual-registry.generated.json`, then emit the hash from `ks_hash_attrs()` / layout helpers. If the surface is not governed, remove the markers instead of inventing a token.
2. **Type mismatch** — align `data-ks-type` with the registry `type` field (see `components/ks_hash_attrs.py` and `ks_catalog_hashes.py` for canonical `layout` vs `chrome-region` labels).
3. **Deprecated hash** — migrate HTML and contracts to the successor hash listed under registry `aliases`; stop emitting the deprecated token on new builds.
4. **Missing or duplicate registry JSON** — run the design-catalog generator and `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` until the registry report is clean.
5. **Re-audit** — run `node tools/website-ux-auditor/analyze-website-ux.mjs` on the KS repo or consumer site; clear **`DET.HASH.REGISTRY_ROW`** before treating **`DET.CONTRACT.PATH`** or **`AI.CONTRACT.IMPLEMENTATION_USEFULNESS`** as authoritative for that hash.

## Related rules

- `DET.HASH.MARKERS` — each visual root must pair `hash=` and `data-ks-hash=` with valid three-letter tokens.
- `DET.CONTRACT.PATH` — active registry rows must resolve to an on-disk design contract when policy requires it.
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes must be a subset of registry inventory output.
- `DET.CATALOG.CONTRACT_SPECIFICITY` — contracts must be element-specific, not generic boilerplate.
- `DET.PY.KS_HASH_ATTRS` — Python builds should emit hash, type, and name via `ks_hash_attrs()`.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — judges whether an on-disk contract is actionable after registry and path gates pass.
