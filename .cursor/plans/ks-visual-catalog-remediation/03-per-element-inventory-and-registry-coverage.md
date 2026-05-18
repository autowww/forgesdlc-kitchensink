# Phase 03 — Per-element inventory and registry coverage

## Evidence — acceptance

### Commands run

```bash
python3 generator/build-showcase.py
node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json --quiet
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase --inventory docs/design/catalog/visual-inventory.generated.json
bash tools/design-catalog/verify-bad-fixture.sh
cd tools/website-ux-auditor && node --test auditor-tests/visual-catalog-json.test.js
```

All completed successfully (`check-visual-catalog OK`). Expected `[warn]` remains for non-family contracts that still use template bullets (`--strict-contract-placeholders` not enabled).

### Counts (before → after)

| Metric | Before | After |
|--------|--------|-------|
| Registry entries | 64 | 91 |
| Inventory items | 356 | 360 |
| `contract_status: family-covered` rows | 10 | 37 |

### Verification retry — governance gaps closed (phase checklist)

| Item | Resolution |
|------|------------|
| **`category` on every row** | All **91** entries include **`category`** (taxonomy keyed off `type`; runner: `node tools/design-catalog/sync-registry-metadata.mjs`). |
| **`emits_html` signal** | All **91** entries include boolean **`emits_html`** (`false` for stylesheet/script/SVG/Python/docs/showcase families and `visual-style` / `interaction-script` children; `true` for emitted DOM/SVG/component/layout/page rows). See **`visual-registry-coverage.md`** → **By emits_html**. |
| **`contract_path` checklist wording** | **`visual-registry.generated.json`** duplicates **`contract`** as **`contract_path`** for consumers expecting that field name; YAML remains **`contract:`** as canonical. |
| **Family contract stubs** | **`Ksc-fam-styles.md`**, **`Ksj-fam-scripts.md`**, **`Ksv-fam-svg.md`**, **`Kpr-fam-python-renderers.md`**, **`Msm-museum-studio.md`** — removed open **`TBD`** bullets; added concrete anatomy, constraints, and acceptance notes (family rows documented as non-DOM-hash surfaces where applicable). |
| **TNH path** | **`js/ks-living-motion.js`** exists in-repo; prior “typo” report was incorrect. |

### What changed

1. **Families split into child rows** (distinct hashes, `parent_hash` → family, `contract_status: family-covered` to the existing family contract):
   - **Ksc** → five `visual-style` rows: **Ech**, **Mar**, **DVN**, **FXK**, **KEm** (core themes, packs/light, shared surfaces, desktop chrome, ambient).
   - **Ksj** → five `interaction-script` rows: **LJa**, **TNH**, **Kfr**, **pUW**, **Bru** (nav/docs, theme/motion, diagrams/charts, roadmap, tiles/presentation).
   - **Ksv** → five `diagram-asset-group` rows: **hMR**, **TXK**, **LkY**, **Zmg**, **Zxd** (ambient, backgrounds, layout schematics, living, templates).
   - **Kpr** → eleven `python-component-module` rows: **VtQ**, **pvx**, **rJd**, **VPc**, **ARv**, **Gtf**, **qrv**, **vZr**, **bNG**, **nzA**, **Khx** (per `components/*.py` module plus **Khx** for `ks_hash_attrs.py` + `ks_catalog_hashes.py`).
   - **Msm** → child **vYA** (`museum-chrome-asset`) for `icons.svg` and `favicon.svg`.

2. **Inventory** (`inventory-ks-visuals.mjs`): `python-component-anchor` items for helper-only modules; `__init__.py` excluded from anchors.

3. **Validation** (`check-visual-catalog.mjs`): path coverage unions for CSS/JS/SVG/Kpr modules; inventory matching for new row types; stricter `python-component-module` ↔ inventory path coverage; museum deferral section in `visual-registry-coverage.md`; **`category`** / **`emits_html`** required on every registry row; coverage report adds **By category** and **By emits_html**.

4. **Family contracts** updated to name child hashes/constraints: `Ksc-fam-styles.md`, `Ksj-fam-scripts.md`, `Ksv-fam-svg.md`, `Kpr-fam-python-renderers.md`, `Msm-museum-studio.md`.

5. **Generated JSON** (`parse-registry.mjs`): exports **`category`**, **`emits_html`**, **`contract_path`** (mirror of **`contract`**).

### Deferred (documented)

- **Museum studio** content-hashed Vite outputs under `museum/studio/assets/*` — listed in inventory but not given per-chunk registry hashes; policy and counts are in `docs/design/catalog/visual-registry-coverage.md` (**Needs registry attention:** none).

### Hash allocation note

New hashes were chosen with `allocate-visual-hash.mjs` and verified **globally unique** and **three distinct letters** via `check-visual-catalog.mjs` (no duplicates, no invalid format).
