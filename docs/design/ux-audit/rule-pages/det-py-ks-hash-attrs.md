---
rule_id: DET.PY.KS_HASH_ATTRS
lane: deterministic
title: Python ks_hash_attrs emitters
summary: Python HTML renderers stamp governed visual roots through ks_hash_attrs or ks_catalog_hashes helpers—not inline hash or data-ks-* attribute strings.
page_version: 48909d6366c5c9c2cb694779a0c480eb0fac5f8be49e471b3b9a0624cfb24d5e
generated_at: 2026-05-25T16:20:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-py-ks_hash_attrs
---

## Purpose

Kitchen Sink Python generators (`components/layouts.py`, `components/components.py`, `generator/build-showcase.py`, `forge-autodoc/forge_autodoc/page.py`, and registry-listed emitter modules) stamp **governed visual roots** with catalog markers: `hash="XYZ"`, `data-ks-hash="XYZ"`, `data-ks-type`, and `data-ks-name`. Those attributes must come from **`ks_hash_attrs()`** (`components/ks_hash_attrs.py`) or registry-backed wrappers in **`components/ks_catalog_hashes.py`** — `layout_shell_attrs()`, `page_main_attrs()`, and `chrome_region_attrs()` — not from hand-typed attribute strings in f-strings or concatenation.

This deterministic rule runs in the **metrics** phase on the **kitchensink repo root** (`det-py-ks-hash-attrs.check.js`). It scans Python under `components/`, `generator/`, and `forge-autodoc/` for forbidden inline marker literals and verifies that every **marker emitter** module calls a canonical helper. DOM rules (**`DET.HASH.MARKERS`**, **`DET.HASH.REGISTRY_ROW`**) judge built HTML; **`DET.PY.KS_HASH_ATTRS`** catches emitters before a bad build ships incomplete or drift-prone markup.

**Plan:** When adding or editing a layout, chrome region, or showcase shell, resolve the hash in `visual-registry.yaml` first. **Do:** Import `layout_shell_attrs` / `chrome_region_attrs` from `ks_catalog_hashes` (or call `ks_hash_attrs` directly for one-off roots). **Check:** Run `analyze-website-ux.mjs` with `--repo` pointing at **forgesdlc-kitchensink** so `pyKsHashAttrsReport` is populated. **Adjust:** Replace manual literals; rebuild with `python3 generator/build-showcase.py`, then confirm **`DET.HASH.MARKERS`** on `showcase/` or consumer `website/`.

## Passing signals

- Marker emitter modules call **`ks_hash_attrs(`**, **`layout_shell_attrs(`**, **`page_main_attrs(`**, or **`chrome_region_attrs(`**, or import **`ks_catalog_hashes`** — for example `components/layouts.py` sets `_la_hbk = layout_shell_attrs("handbook_page")` and splices the fragment onto `class="container-fluid px-0"`.
- `components/components.py` uses **`chrome_region_attrs("doc-breadcrumb")`** and **`chrome_region_attrs("doc-toc-sidebar")`** when rendering **Kbc** / **Ktx** chrome.
- `components/ks_catalog_hashes.py` resolves registry rows and delegates to **`ks_hash_attrs`** for `layout`, `chrome-region`, `page`, and `layout-preview` types.
- Built HTML shows paired markers on governed roots — handbook shell **`hash="Hbk"`** / **`data-ks-hash="Hbk"`**, sidebar **`Ksr`**, breadcrumb **`Kbc`**, footer **`Ksf`** — with matching **`data-ks-type`** and **`data-ks-name`** slugs from the registry.
- `pyKsHashAttrsReport.issues` is empty after scanning the repo root; `emitterPathCount` includes base emitters plus active registry `source_paths` ending in `.py` for `layout`, `chrome-region`, and `layout-preview` rows.
- Only **`components/ks_hash_attrs.py`** may contain inline `data-ks-hash=` / `hash="XYZ"` string literals (canonical helper implementation).

## Failing signals

- **`manual-literal` (minor):** A `.py` file under `components/`, `generator/`, or `forge-autodoc/` contains inline `data-ks-hash=`, `data-ks-type=`, `data-ks-name=`, or `hash="XYZ"` literals outside the exempt helper module — common in bootstrap scripts, defect fixtures, or copy-pasted HTML fragments embedded in Python.
- **`missing-helper` (minor):** A registry-listed emitter module exists but never calls **`ks_hash_attrs`** or **`ks_catalog_hashes`** wrappers — emitters lose catalog alignment even if HTML looks correct today.
- **`missing-emitter` (warn):** A registry `source_paths` entry points at a `.py` file that is absent on disk.
- Emitted HTML may still fail **`DET.HASH.MARKERS`** when Python used partial manual strings — for example layout root with only **`data-ks-hash="Hbk"`** and no paired **`hash="Hbk"`**, or breadcrumb with class **`ks-doc-breadcrumb`** but no **Kbc** markers.
- Findings cap at **`MAX_PY_KS_HASH_ATTRS_FINDINGS` (12)** per pass with a trailing “additional issues omitted” message when many files violate at once.
- Passing this rule does **not** prove registry membership (**`DET.HASH.REGISTRY_ROW`**) or contract presence (**`DET.CONTRACT.PATH`**).

## Before example

Failing emitted fragment (typical of manual Python attribute strings in a layout f-string): layout shell carries only **`data-ks-hash`**; doc breadcrumb omits catalog markers. A crawl reports **`DET.HASH.MARKERS`** `incompleteMarkers` even before **`DET.PY.KS_HASH_ATTRS`** flags the generator source.

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
      <header class="site-header mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
        <div class="site-header-content">
          <nav class="ks-doc-breadcrumb mb-2" aria-label="Breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="/">Home</a></li>
              <li class="breadcrumb-item active" aria-current="page">Handbook</li>
            </ol>
          </nav>
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
        </div>
      </header>
      <div class="forge-card p-3">
        <p class="forge-support mb-0">Markers pasted manually in Python — not from chrome_region_attrs().</p>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing handbook shell (aligned with `handbook_page` in `components/layouts.py`): **`layout_shell_attrs("handbook_page")`**, **`chrome_region_attrs("doc-sidebar")`**, and **`chrome_region_attrs("doc-breadcrumb")`** emit the full helper fragment on each governed root.

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
      <header class="site-header mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
        <div class="site-header-content">
          <nav
            class="ks-doc-breadcrumb mb-2"
            hash="Kbc"
            data-ks-hash="Kbc"
            data-ks-type="chrome-region"
            data-ks-name="doc-breadcrumb"
            aria-label="Breadcrumb"
          >
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="/">Home</a></li>
              <li class="breadcrumb-item active" aria-current="page">Handbook</li>
            </ol>
          </nav>
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Handbook sample page</h1>
          <p class="forge-support mt-2 mb-0">Emitters use ks_catalog_hashes helpers.</p>
        </div>
      </header>
      <div
        hash="Ksf"
        data-ks-hash="Ksf"
        data-ks-type="chrome-region"
        data-ks-name="site-footer"
        class="ks-site-footer-region border-top py-4 mt-4"
        style="border-color: var(--forge-border);"
      >
        <p class="forge-support mb-0 text-center">Footer stamped via chrome_region_attrs("site-footer").</p>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Capture:** Save `pyKsHashAttrsReport` from analyze output (`issues[]` with `kind`, `path`, `message`) and the finding `evidence` string (`python_source=<rel-path> kind=<kind>`). For HTML validation, attach a built fragment from `showcase/` or `website/` and the matching `ksVisualHashReport` slice when **`DET.HASH.MARKERS`** also fires.

| Kind | Severity | Remediation |
|------|----------|-------------|
| `manual-literal` | minor | Remove inline `hash=` / `data-ks-*` strings; call `ks_hash_attrs()` or `layout_shell_attrs` / `page_main_attrs` / `chrome_region_attrs`. |
| `missing-helper` | minor | Add `from ks_catalog_hashes import chrome_region_attrs, layout_shell_attrs` (or equivalent) and splice `_{var} = layout_shell_attrs("…")` onto visual root `class=` / tag openers. |
| `missing-emitter` | warn | Restore the missing `.py` module or fix `source_paths` in `visual-registry.yaml`. |

**Remediation (PDCA):**

1. **Plan** — Locate the visual root in `docs/design/catalog/visual-registry.yaml` (hash, `type`, `slug`, `source_paths`). Prefer registry wrappers over hard-coded three-letter tokens.
2. **Do** — In Python emitters, use `layout_shell_attrs("handbook_page")`, `chrome_region_attrs("doc-breadcrumb")`, or `ks_hash_attrs(hash_id, visual_type, name)`; rebuild with `python3 generator/build-showcase.py` (and consumer site generators after submodule bump).
3. **Check** — `node tools/website-ux-auditor/analyze-website-ux.mjs --repo /path/to/forgesdlc-kitchensink` with metrics including `pyKsHashAttrsReport`; grep built HTML for paired `hash="XYZ"` and `data-ks-hash="XYZ"`.
4. **Adjust** — For harness-only scripts that intentionally embed marker literals for defect fixtures, relocate strings outside scanned trees or refactor fixtures to call helpers; do not weaken the check for production emitters.

Module: `design-rules/deterministic/generated/det-py-ks-hash-attrs.check.js` (auditor package). Default severity **minor**; missing emitter modules use **warn**.

## Related rules

- `DET.HASH.MARKERS` — built HTML must pair `hash=` and `data-ks-hash=` on governed roots (DOM complement).
- `DET.HASH.REGISTRY_ROW` — emitted hash must exist in `visual-registry.generated.json` with matching `data-ks-type`.
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes must be a subset of the registry; no stray token shapes.
- `DET.CONTRACT.PATH` — registry row resolves to an on-disk design contract.
- `DET.APP.PRIMITIVE_MARKERS` — React primitives use `ksVisualAttrs` / `ksReactPrimitiveAttrs` instead of Python helpers.
- `AI.PY.HTML_AUTHORING_QUALITY` — AI review of Python HTML modules; should cite helper usage for visual roots.
