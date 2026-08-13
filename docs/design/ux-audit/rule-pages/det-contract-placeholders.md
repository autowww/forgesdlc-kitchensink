---
rule_id: DET.CONTRACT.PLACEHOLDERS
lane: deterministic
title: Design contract placeholder language
summary: Registry-linked design contracts must not ship template filler (lorem ipsum, XYZ headings, insert markers) or unresolved TBD/TODO/FIXME stub bullets when strict catalog lint is enabled.
page_version: a25e1b29e769f8397ac3fe716c7daa6690e9bfff23d5d0b6a901334b67532b94
generated_at: 2026-05-19T22:45:00.000Z
agent_model: composer-2.5-fast
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
registry_status: implemented
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-contract-placeholders
---

## Purpose

Kitchen Sink **design contracts** (`docs/design/catalog/**/{HASH}-*.md`) are the implementation spec for registry-backed visuals. When a contract still reads like a copied template—`lorem ipsum`, `[placeholder]`, `example-visual`, `XYZ` headings, or stub bullets (`- TBD`, `- TODO`, `- FIXME`)—implementers and agents must guess anatomy, responsive rules, and verification gates. That produces drift between showcase HTML, consumer sites, and audit evidence.

This deterministic rule repo-scans every registry row with `contract_status: own` or `family-covered` (skipping `contract-template.md`). It reuses `analyzeContractPlaceholders` from `tools/design-catalog/lib/contract-placeholders.mjs`:

- **Always errors (any mode):** `lorem ipsum`, `example-visual`, `# XYZ` template headings, `[placeholder]`, and `<insert` markers.
- **Stub bullets:** `TBD` / `TODO` / `FIXME` list items are **warnings** by default; they become **errors** when `strictContractPlaceholders` is enabled (`--strict-contract-placeholders` on `check-visual-catalog.mjs` or `ctx.strictContractPlaceholders` in UX audits).

Findings cap at **12** per pass (`MAX_CONTRACT_PLACEHOLDER_FINDINGS`); run the catalog linter locally for the full list.

**Plan:** After allocating a hash or importing a contract from `contract-template.md`, list every section still marked stub. **Do:** Replace stubs with element-specific Expected look, Anatomy, States, and Deterministic checks tied to real selectors. **Check:** `node tools/design-catalog/check-visual-catalog.mjs --strict-contract-placeholders` reports zero placeholder errors. **Adjust:** If the same stub repeats across a family, move shared prose into the family contract and delete child-level `TBD` bullets.

## Passing signals

- Contract Markdown has no `lorem ipsum`, `example-visual`, `# XYZ …` heading, `[placeholder]`, or `<insert …` template markers.
- No `- TBD`, `- TODO`, or `- FIXME` stub bullets remain when strict placeholder mode is on (CI / remediation loops should enable strict before claiming catalog readiness).
- **Expected look** and **Anatomy** name concrete KS surfaces—`.ks-doc-breadcrumb`, `forge-card breathe-link`, `main#main` + `hash="Idx"`—so HTML builders do not invent Bootstrap stand-ins.
- `scanContractPlaceholders` / `metrics.contractPlaceholderReport` returns zero issues for the repo (or only non-strict warnings you have explicitly accepted with a remediation plan).
- Changelog entries document when stub contracts were replaced with authored guidance (for example **Kbc** on 2026-05-18).

## Failing signals

- **Placeholder markers (always):** `placeholder language (lorem ipsum)`, `template marker (example-visual)`, `template heading still uses XYZ`, or `explicit placeholder insert marker` on a registry-linked contract path.
- **Stub bullets (strict):** `contract still uses stub bullets (TBD, TODO, …)` when `strict: true`; auditor message `Design contract still uses unresolved stub bullets: …`.
- **Severity:** **minor** for placeholder markers and stub bullets in default UX audit mode; stub bullets surface as **warn** when mapped from catalog warnings in some pipelines.
- **Evidence:** `hash=Kbc contract=docs/design/catalog/chrome/Kbc-doc-breadcrumb.md` (or comma-separated hashes when one file backs multiple registry rows).
- **Truncation:** `Additional contract placeholder issues omitted (N more)` when the repo has more than 12 failures—remediation points to `--verbose-contract-placeholders`.
- **Skipped scan:** `skipped: true, reason: 'no-registry'` when `visual-registry.generated.json` is missing—fix inventory generation before trusting placeholder cleanliness.

## Before example

Failing KS markup: handbook shell built while the **Kbc** contract still had `- TBD` under **Responsive behavior** and generic Bootstrap breadcrumb copy—no `.ks-doc-breadcrumb` root, no hash markers, separators not treated as decorative.

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-9 col-xl-10 site-header-content">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-2">
          <li class="breadcrumb-item"><a href="/showcase/">Home</a></li>
          <li class="breadcrumb-item"><a href="/showcase/layouts.html">Layouts</a></li>
          <li class="breadcrumb-item active" aria-current="page">Handbook</li>
        </ol>
      </nav>
      <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">
        Handbook chapter
      </h1>
      <p class="text-muted small mb-0">Lorem ipsum dolor sit amet — orientation TBD.</p>
    </div>
  </div>
</header>
```

## After example

Passing KS markup: matches an authored **Kbc — Doc breadcrumb** contract—`.ks-doc-breadcrumb` chrome root with hash markers, muted crumb links, decorative separators, terminal current page (`components/layouts.py` / `chrome_region_attrs("doc-breadcrumb")`).

```html
<header class="site-header d-none d-lg-block">
  <div class="row g-0">
    <div class="col-lg-9 col-xl-10 site-header-content">
      <div
        class="ks-doc-breadcrumb"
        hash="Kbc"
        data-ks-hash="Kbc"
        data-ks-type="chrome-region"
        data-ks-name="doc-breadcrumb"
      >
        <a class="forge-support" href="/showcase/index.html">Showcase</a>
        <span class="text-muted px-1" aria-hidden="true">/</span>
        <a class="forge-support" href="/showcase/layouts.html">Layouts</a>
        <span class="text-muted px-1" aria-hidden="true">/</span>
        <span class="forge-support" aria-current="page">Handbook chapter</span>
      </div>
      <h1 class="font-display forge-gradient-text mb-0" style="font-size:clamp(1.25rem,3vw,1.75rem)">
        Handbook chapter
      </h1>
    </div>
  </div>
</header>
```

## Evidence and remediation

| Signal | Where to look | Remediation |
|--------|----------------|-------------|
| Placeholder marker on contract | UX audit `visual-catalog` finding; `check-visual-catalog.mjs` stderr | Remove `lorem ipsum`, `example-visual`, `XYZ` headings, `[placeholder]`, and `<insert` text; rewrite with hash-specific anatomy. |
| Stub bullets (`TBD` / `TODO` / `FIXME`) | Same; only fails audit when strict | Replace each stub bullet with concrete behavior (breakpoints, focus order, landmark list). Enable strict only after clearing stubs. |
| Contract file missing from disk | Often paired with `DET.CONTRACT.PATH` | Restore or re-link contract path in `visual-registry.yaml`, then regenerate inventory. |
| Many omitted findings | `contract_placeholder_total=N` in evidence | `node tools/design-catalog/check-visual-catalog.mjs --verbose-contract-placeholders` |

**Commands (repo root):**

```bash
node tools/design-catalog/check-visual-catalog.mjs --repo . --strict-contract-placeholders
node tools/design-catalog/inventory-ks-visuals.mjs
```

After contract edits that change expected HTML, run `python3 generator/build-showcase.py` and re-check showcase inventory markers (`DET.HASH.MARKERS`). Pair with `DET.CATALOG.CONTRACT_SPECIFICITY` when stubs were removed but sections still read generic.

## Related rules

- `DET.CONTRACT.PATH` — registry-linked contracts must resolve to on-disk `.md` files.
- `DET.CATALOG.CONTRACT_SPECIFICITY` — contracts need element-specific Expected look, Anatomy, Forbidden patterns, and Deterministic checks—not boilerplate slabs.
- `DET.HASH.MARKERS` — built HTML must emit `hash` / `data-ks-hash` (and related `data-ks-*`) on visual roots.
- `AI.CONTRACT.IMPLEMENTATION_USEFULNESS` — AI review for whether a non-stub contract is actually implementable end-to-end.
