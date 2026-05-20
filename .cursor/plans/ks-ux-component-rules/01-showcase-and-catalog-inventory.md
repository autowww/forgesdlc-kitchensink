# Phase 01 — Showcase and catalog inventory

**Completed:** 2026-05-19 (forgesdlc-kitchensink repo root).

**Governance:** No Fleet-specific UX profile was added. Fleet remains only a generic regression example per workspace rules.

## Live showcase access

| URL | Result |
|-----|--------|
| `https://ks.forgesdlc.com/showcase/` | HTTP **404** (from this environment) |
| `https://ks.forgesdlc.com/` | HTTP **200** |
| `https://kitchensink.forgesdlc.com/` | DNS resolution failed (`curl` exit 6) |

Because live showcase paths were not reliably reachable, validation used a **local showcase build** and committed catalog artifacts under the repo.

## Local showcase build

| Command | Result |
|---------|--------|
| `python3 generator/build-showcase.py` | Exit **0** — 22 pages + layout previews written to `showcase/` |

## Inventory tooling (`tools/design-catalog/inventory-ks-visuals.mjs`)

The script still emits the source-derived `items[]` list (no YAML dependency). It now optionally loads **`docs/design/catalog/visual-registry.generated.json`** (JSON only) and adds **`catalogCrosswalk`**:

- All registry rows and counts by `type`
- Emitted 3-letter hashes from `showcase/*.html` + `showcase/assets/*.js` (same scan semantics as `check-visual-catalog.mjs`)
- Contract file presence + non-strict stub detection (TBD/TODO/FIXME bullets) via `lib/contract-placeholders.mjs`
- Screenshot PNG presence at `docs/design/catalog/screenshots/{hash}.png` and `showcase/screenshots/{hash}.png`
- Family parents with resolved child labels, `family-covered` rows, shared contracts covering many hashes, and broad-family risk hints

**CLI additions:** `--showcase <dir>` (default `showcase`), `--registry-json <path>`, `--no-registry`.

**Generated outputs:**

- `docs/design/catalog/visual-inventory.generated.json`
- `docs/design/catalog/visual-inventory.generated.md` (includes a short “Catalog crosswalk” section when JSON is present)

## Catalog validation

| Command | Result |
|---------|--------|
| `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` | Exit **0** — `check-visual-catalog OK (91 entries)`; refreshed `docs/design/catalog/visual-registry-coverage.md` and `visual-registry.generated.json` |

## Inventory totals (source-derived)

From `visual-inventory.generated.json` **`summary`** (2026-05-19 run):

| Metric | Count |
|--------|------:|
| Total inventory line items | **363** |
| Distinct `source_path` values (inventory) | **290** |

### Inventory rows by `proposed_type` (top-level)

| proposed_type | Count |
|---------------|------:|
| diagram-or-asset | 79 |
| design-terminology | 70 |
| component | 59 |
| generated-showcase-page | 29 |
| visual-style | 22 |
| page-instance | 23 |
| museum-surface-asset | 23 |
| interaction-module | 18 |
| layout | 9 |
| primitive | 10 |
| layout-preview | 7 |
| chrome-region | 6 |
| python-component-anchor | 4 |
| visual-helper | 1 |
| showcase-app-source | 1 |
| desktop-interface | 1 |
| library-consumer | 1 |

## Registry totals (`visual-registry.yaml` / generated JSON)

| Metric | Count |
|--------|------:|
| Registry rows | **91** |
| Active rows | **91** |
| Distinct registry hashes | **91** |

### Registry rows by `type`

| type | Count |
|------|------:|
| page | 23 |
| python-component-module | 11 |
| layout | 9 |
| react-primitive | 10 |
| chrome-region | 6 |
| layout-preview | 7 |
| visual-style | 5 |
| interaction-script | 5 |
| diagram-asset-group | 5 |
| primitive-family | 1 |
| style-family | 1 |
| script-family | 1 |
| diagram-family | 1 |
| python-renderer-family | 1 |
| docs-family | 1 |
| showcase-app-family | 1 |
| desktop-interface | 1 |
| museum-chrome-asset | 1 |
| library-consumer | 1 |

## Emitted-hash coverage (local `showcase/` scan)

From **`catalogCrosswalk`** in `visual-inventory.generated.json`:

| Metric | Value |
|--------|-------|
| Distinct hashes seen in showcase HTML/JS | **54** |
| Rows with `emit_marker_in_showcase: true` but hash **not** in scan | **0** |
| Hashes in scan but **not** in registry | **0** (no stray tokens) |

**Interpretation:** Every registry row that claims a showcase marker **does** appear in the built showcase scan. **37** registry hashes do **not** appear in the scan; that is expected for roll-up families, stylesheet/script/Svg rows, blocked capture rows, and other entries that do not emit their own DOM root in static showcase HTML.

## Contracts

| Check | Result |
|-------|--------|
| Contract path missing on disk | **0** rows |
| Contracts with TBD/TODO/FIXME bullets (non-strict) | **0** in this pass |

Weakness is more about **specificity** (phase 05) than missing files: several contracts are intentionally **shared** across many hashes (see “Visual groups needing more specific rules” below).

## Screenshots

| `screenshot_status` (registry) | Count |
|-------------------------------|------:|
| captured | 48 |
| not-applicable | 41 |
| blocked | 2 |

**Blocked (documented, not a bug):**

- **Kra** — Showcase React app sources; SPA not one static HTML root for the Playwright pipeline.
- **Msm** — Museum studio shell; Electron/desktop target, not static showcase HTML.

**Local PNG files:**

- **`docs/design/catalog/screenshots/{hash}.png`:** **48** hashes have a baseline file (matches all `captured` rows).
- **`showcase/screenshots/`:** no `*.png` present in this clone (canonical committed baselines live under **`docs/design/catalog/screenshots/`**; `showcase/screenshots/` is optional mirror per master sequence).

**Mismatch vs public URLs:** Registry `screenshot_url` values still point at `https://ks.forgesdlc.com/showcase/screenshots/...`; local evidence uses the catalog directory above.

## Family-covered rows and roll-ups

- **`contract_status: family-covered`:** **37** rows (mostly per-file children under `Ksc`, `Ksj`, `Ksv`, `Kpr`, shared React primitive doc, etc.).
- **Parent rows listing `child_hashes`:** **5** (`Kpr`, `Rpf`, `Ksc`, `Ksj`, `Ksv`).

### Broad families (high concentration — candidate for stricter child rules)

| Parent hash | Name | Children | Risk (inventory heuristic) |
|-------------|------|----------|----------------------------|
| **Kpr** | Python HTML renderer helpers | 11 modules | high |
| **Rpf** | React primitives family | 10 primitives | high |
| **Ksc** | Kitchen Sink stylesheets | 5 child styles | medium |
| **Ksj** | Kitchen Sink interaction scripts | 5 child scripts | medium |
| **Ksv** | SVG diagram and schematic assets | 5 child groups | medium |

Shared contracts covering **≥4** member hashes (family roll-up + children) include `Kpr-fam-python-renderers.md`, `FAM-react-primitives.md`, `Ksc-fam-styles.md`, `Ksj-fam-scripts.md`, and `Ksv-fam-svg.md`.

## Visual groups needing more specific rules (next phases)

1. **`Kpr` / `python-component-module` children** — Eleven Python renderer modules share one family contract; deterministic rules should still anchor **per-module** showcase pages and hashes (`VtQ`, `pvx`, `rJd`, …) for regressions.
2. **`Rpf` / React primitives** — Ten components share `FAM-react-primitives.md`; judgment and hierarchy checks should not collapse into one generic “primitive” boilerplate across unrelated controls.
3. **`Ksc`, `Ksj`, `Ksv` medium fan-out** — Five children each; CSS/JS/SVG groups are the right place for **surface-class** rules, but high-impact modules (charts, roadmap, portal) may need **narrower** addenda where repeat defects show up.
4. **Screenshot pipeline vs marketing URLs** — Align “captured” status with where PNGs actually live (`docs/design/catalog/subdir`) and what public mirrors guarantee after deploy.

## Artifacts touched this phase

- `tools/design-catalog/inventory-ks-visuals.mjs` — extended with registry/showcase crosswalk.
- Regenerated `docs/design/catalog/visual-inventory.generated.json` and `.md`.
- `python3 generator/build-showcase.py` refreshed `showcase/`.
- `node tools/design-catalog/check-visual-catalog.mjs …` refreshed `docs/design/catalog/visual-registry.generated.json` and `visual-registry-coverage.md` (per normal catalog workflow).
