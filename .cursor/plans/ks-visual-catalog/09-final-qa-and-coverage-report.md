# 09 — Final QA and coverage report (filled)

**Date:** 2026-05-18 (run in repo `forgesdlc-kitchensink`)

## Commands run

| Command | Result |
|---------|--------|
| `python3 generator/build-showcase.py` | OK — 22 pages + layout previews |
| `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json` | OK — **342** inventory items + `.md` sibling (`museum/studio/*`, **generated `showcase/*.html`**, `docs/design/**`, `PAGE-LAYOUT-TAXONOMY.md`) |
| `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` | OK — 57 registry entries; wrote `visual-registry.generated.json` + `visual-registry-coverage.md` (registry + **inventory snapshot**, Kdt alignment warnings, `generated-showcase-page` validation) |
| `cd tools/website-ux-auditor && npm test` | OK — 57 tests pass |
| `cd showcase-react-app && npm ci && npm run build` | OK (CI + local before `build-showcase`) |
| `pytest forge-autodoc/tests -q` | Not run locally (PEP 668 / no venv); **still run in CI** via `design-catalog` + `forge-autodoc` jobs |

## Files changed (this effort — high level)

- `components/ks_catalog_hashes.py` — `page_main_attrs` resolves **`page`** and **`layout-preview`** registry rows (fixes preview HTML marker validation).
- `docs/design/catalog/` — added `README.md`, `contract-template.md`, `ONTOLOGY.md`, `sections/README.md`, `screenshots/README.md`.
- `tools/design-catalog/` — added `allocate-visual-hash.mjs`, `capture-showcase-screenshots.mjs`, `changed-visual-contracts.mjs`; fixed `package.json` + lockfile (YAML + Playwright devDep).
- `tools/website-ux-auditor/` — `dom-metrics` collects `ksVisualHashes`; new `checks/visual-catalog-awareness.js`; `crawlAndAnalyze` passes `repoRoot`; analyze/score crawls pass `repoRoot`; `design-dimensions` adds **`visualCatalogGovernance`** pillar.
- `react/*.tsx` + `react/ksVisualAttrs.ts` — hash / `data-ks-*` on primitive roots.
- `.github/workflows/ci.yml` — **`design-catalog`** job runs **`showcase-react-app`** `npm ci` + `npm run build` before `build-showcase.py` so **`react-primitives-demo.js`** exists for catalog checks.
- `check-visual-catalog.mjs` — deprecated without **`aliases`** when still emitted; **`react-primitive`** marker checks in built JS; **`screenshot_status`** + **inventory snapshot** in **`visual-registry-coverage.md`**; **`design-terminology`** / **`docs/design/*.md`** must match **Kdt** (catalog subtree exempt); **`generated-showcase-page`** path + registry slug checks.
- `inventory-ks-visuals.mjs` — **`showcase/*.html`** as **`generated-showcase-page`**; museum walk; **`docs/design/**`** + taxonomy; **`showcase-react-app/src`** sources.
- `tools/website-ux-auditor/lib/visual-catalog.js` — re-exports registry parser + **`loadGeneratedRegistry`** (auditor bridge; design-catalog CLIs stay separate).
- `docs/design/catalog/README.md` — **Prompt 10** maintenance checklist (Kdt paths, Kra expansion, CI).
- `.cursor/rules/forge-visual-catalog-governance.mdc` — kit-aligned checklist + inventory regen + **Kdt** path updates.
- `FAM-react-primitives.md` — **Covered child hashes** table aligned to **`Rpf.child_hashes`**.
- `checks/visual-catalog-awareness.js` — findings for **`contract_status: missing`** and missing contract files for **`own` / `family-covered`**.

## Inventory totals

- **342** items in `visual-inventory.generated.json` (see `summary.byType` in file).
- Notable buckets: `diagram-or-asset` 79, `component` 59, `design-terminology` 60, **`generated-showcase-page` 29**, `visual-style` 22, `page-instance` 22, `interaction-module` 18, **`museum-surface-asset`**, `layout` 9, `layout-preview` 7.

## Registry / coverage

See `docs/design/catalog/visual-registry-coverage.md`:

- **57** registry entries, all `status: active`.
- `contract_status`: **47** `own`, **10** `family-covered`.
- **`visual-registry-coverage.md`** also lists an **inventory snapshot** (by `proposed_type`) for kit QA metrics.

## Emitted HTML marker coverage

- `check-visual-catalog` with `--showcase showcase` validates hashes for layouts, pages, and layout-previews with `emit_marker_in_showcase: true`.
- **`react-primitive`** rows: each `emit_marker_in_showcase: true` hash must appear in showcase output (including `hash:"Xxx"` literals in **`showcase/assets/react-primitives-demo.js`** after Vite build).
- Layout shell (`layout_shell_attrs`) + `<main>` (`page_main_attrs`) carry `hash` + `data-ks-hash` per registry.

## Screenshot status

- Registry rows use `screenshot_status: planned` for phase 1; capture via `capture-showcase-screenshots.mjs` when a local server serves `showcase/`.

## Known gaps / phase-1 honesty

- **Consumer sites** (blueprints-website, forgesdlc, etc.) are not fully hash-instrumented in this PR — registry documents layout consumers (e.g. forge-autodoc) but DOM validation targets **KS showcase** first.
- **Museum/studio** bundled app: inventory lists bundle files under **`museum/studio/`**; fine-grained DOM stamping inside hashed bundles is still deferred.
- **Section-level** contracts: only `sections/README.md` placeholder unless future rows add `section` types.

## Auditor / scorer

- Both remain **separate CLIs**; neither invokes the other.
- Shared behavior: optional **`visual-catalog-awareness`** check when `repoRoot` contains `visual-registry.generated.json` (unknown hash, deprecated, **`contract_status: missing`**, missing contract file on disk).
- Scorer/analytics include **`visualCatalogGovernance`** dimension driven by `area: visual-catalog` findings.

## Follow-up

- Host `showcase/screenshots/{HASH}.png` under `https://ks.forgesdlc.com/` and flip `screenshot_status` to `captured` where appropriate.
- Consider deduplicating CI (design-catalog job overlaps forge-autodoc + website-ux-auditor) if runtime cost matters.
- Add lightweight **unit test** for `visual-catalog-awareness` + `ksVisualHashes` extraction (optional — check now covers missing contract / missing status paths in code).
