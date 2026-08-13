---
rule_id: DET.CONTRACT.PATH
lane: deterministic
title: Registry contract path resolution
summary: Active visual-registry rows with contract_status own or family-covered must point at an on-disk design contract Markdown file under docs/design/catalog/.
page_version: 848626e86a3652322ea702d014dde7556718aa3e88bda14b221cdd1b49364352
generated_at: 2026-05-19T21:30:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-contract-path
---

## Purpose

Kitchen Sink ties every **active** visual-registry row to a **design contract** — a Markdown file under `docs/design/catalog/**/{HASH}-*.md` that records anatomy, states, accessibility, forbidden patterns, and screenshot acceptance. When `contract_status` is **`own`** or **`family-covered`**, the registry must list a non-empty `contract` / `contract_path` that resolves to a real file in the repo. Without that link, showcase HTML can still render with correct `hash` / `data-ks-hash` markers while implementers and auditors have no authoritative spec.

This deterministic rule scans `docs/design/catalog/visual-registry.generated.json` during the **metrics** phase (`scanContractPaths`). It flags **`empty-path`** (required status but no path) and **`missing-file`** (path set but file absent). Rows with other statuses (for example **`not-applicable`**) are out of scope when policy does not require a contract file.

**Plan:** After adding or renaming a hash, allocate or update the registry row and contract file together. **Do:** Set `contract:` to the canonical path (for example `docs/design/catalog/layouts/Hbk-layout-handbook.md`) and commit the Markdown contract in the same change. **Check:** `node tools/design-catalog/check-visual-catalog.mjs --repo .` and confirm `contractPathReport.issues` is empty. **Adjust:** Either restore the contract file, fix the registry path, or change `contract_status` with a justified family rule when a separate contract is not required.

## Passing signals

- Every **active** registry entry with `contract_status: own` has `contract` (or `contract_path`) set to an existing file such as `docs/design/catalog/layouts/Hbk-layout-handbook.md`.
- **Family-covered** rows reference the family contract on disk (for example a shared `Ksc` style-family contract) — path is non-empty and `fs.existsSync` succeeds from repo root.
- `contractPathFromRegistryEntry` returns the same path the catalog linter and `check-visual-catalog.mjs` use (`entry.contract ?? entry.contract_path`).
- `scanContractPaths` returns `{ skipped: false, issues: [] }` after regenerating the registry JSON from `visual-registry.yaml`.
- Showcase and consumer builds emit layout chrome (**Hbk**, **Ksr**, **Ksf**, **Kbc**) that matches the contract named in the registry row for that hash.
- `contract_status: not-applicable` rows are not required to carry a contract path unless policy changes — no false positives for intentionally uncovered primitives.

## Failing signals

- **`empty-path`:** `status: active` and `contract_status: own` (or `family-covered`) but `contract` is null, `""`, or whitespace — message cites `contract_status` and hash.
- **`missing-file`:** Registry lists `docs/design/catalog/layouts/Hbk-layout-handbook-OLD.md` (or a typo directory) after a rename; HTML and hashes unchanged but the contract file was deleted or never added.
- Contract moved under `docs/design/catalog/chrome/` without updating `visual-registry.yaml` / regenerating JSON.
- New hash allocated in Python (`layout_shell_attrs`, `chrome_region_attrs`) while the registry row still has `contract_status: own` and an empty `contract` field.
- Auditor caps at **`MAX_CONTRACT_PATH_FINDINGS` (12)** per pass with a trailing “additional issues omitted” finding when many rows break at once.
- `contractPathReport.skipped: true` with `reason: no-registry` — fix registry generation before interpreting pass/fail on consumer sites.

## Before example

Failing governance: **Hbk** handbook shell HTML is valid and hash-marked, but the registry row still points at a removed contract path (`docs/design/catalog/layouts/Hbk-layout-handbook-OLD.md`). `DET.CONTRACT.PATH` reports `missing-file`; `DET.HASH.MARKERS` may still pass on the emitted page.

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
        <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
      </div>
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0" style="font-size:1rem">Long-form reading column with sidebar rail.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Markup matches Hbk anatomy, but registry contract path is broken.</p>
        </div>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">© Forge — footer contract unlinked in registry.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## After example

Passing governance: same **Hbk** / **Ksr** / **Ksf** handbook shell; registry `contract` resolves to `docs/design/catalog/layouts/Hbk-layout-handbook.md` (file present). Chrome contracts (**Ksr**, **Ksf**) remain linked in their own registry rows for family or own status.

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
        <p class="mt-2 mb-0" style="font-family:var(--bs-body-font-family);font-size:0.6rem;font-weight:600;color:var(--forge-text-4);letter-spacing:0.06em">Handbook &middot; Product-agnostic</p>
      </div>
      <nav class="nav-scroll flex-grow-1 px-2 py-3" aria-label="Primary navigation">
        <p class="nav-section-label">Chapters</p>
        <div class="nav-rail">
          <a href="/docs/start" class="nav-link active">Getting started</a>
          <a href="/docs/govern" class="nav-link">Governance</a>
        </div>
      </nav>
    </aside>
    <main id="main" class="col-lg-9 col-xl-10 px-3 px-md-5 pt-4 pt-lg-5 pb-5" style="position:relative">
      <div class="mx-auto doc-content" style="max-width:56rem">
        <header class="mb-4 pb-3" style="border-bottom:1px solid var(--forge-border)">
          <p class="section-label text-cyan mb-2">Handbook</p>
          <h1 class="font-display" style="font-size:clamp(1.75rem,4vw,2.5rem)">Governed delivery</h1>
          <p class="forge-support mt-2 mb-0" style="font-size:1rem">Registry contract_path matches on-disk Hbk-layout-handbook.md.</p>
        </header>
        <div class="forge-card p-3">
          <p class="card-label mb-1">Body</p>
          <p class="forge-support mb-0">Implementers can trace anatomy to docs/design/catalog/layouts/Hbk-layout-handbook.md.</p>
        </div>
        <div
          hash="Ksf"
          data-ks-hash="Ksf"
          data-ks-type="chrome-region"
          data-ks-name="site-footer"
          class="ks-site-footer-region border-top py-4 mt-4"
          style="border-color: var(--forge-border);"
        >
          <p class="forge-support mb-0 text-center">© Forge — catalog contract path resolves.</p>
        </div>
      </div>
    </main>
  </div>
</div>
```

## Evidence and remediation

**Evidence:** Metrics phase stores `contractPathReport` with `rowCount`, `issues[]` (`kind: empty-path | missing-file`, `hash`, `contractStatus`, optional `contract` rel path). Findings use area **`visual-catalog`**, severity **`minor`**, and evidence such as `hash=Hbk contract_status=own contract=docs/design/catalog/layouts/Hbk-layout-handbook-OLD.md`. Attach the registry row snippet from `visual-registry.yaml` and `git status` showing whether the contract file exists.

**Remediate (in order):**

1. **Restore or create the contract** — add `docs/design/catalog/**/{HASH}-*.md` with identity, anatomy, and verification sections; match the hash slug convention used elsewhere in the catalog.
2. **Fix the registry path** — set `contract:` (and regenerate `visual-registry.generated.json`) to the real file; run `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase`.
3. **Empty path** — if the row should not own a contract, set `contract_status` to **`not-applicable`** only with a documented family rule; do not leave `own` with a blank `contract`.
4. **Family-covered** — point at the family contract file that explicitly covers child hashes (`AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` when variance is high).
5. **Re-audit** — run `analyze-website-ux.mjs` on the KS repo or consumer site; confirm no `DET.CONTRACT.PATH` findings before relying on `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` or `DET.CATALOG.CONTRACT_SPECIFICITY`.

## Related rules

- `DET.CONTRACT.PLACEHOLDERS` — contract body must not leave unresolved `TBD` / `TODO` / `FIXME` in strict mode.
- `DET.CATALOG.CONTRACT_SPECIFICITY` — contract content must be element-specific, not generic boilerplate.
- `DET.HASH.REGISTRY_ROW` — emitted hashes must exist in the registry with expected `type`.
- `DET.HASH.MARKERS` — visual roots carry `hash` and `data-ks-hash`; orthogonal to path resolution.
- `DET.INVENTORY.CROSSWALK` — showcase-emitted hashes ⊆ registry inventory.
- `DET.SCREENSHOT.STATUS` — when `screenshot_status: captured`, PNG paths must exist (separate catalog gate).
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — judges whether an on-disk contract is actionable for implementers.
- `AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED` — family contracts must truly cover child surfaces.
