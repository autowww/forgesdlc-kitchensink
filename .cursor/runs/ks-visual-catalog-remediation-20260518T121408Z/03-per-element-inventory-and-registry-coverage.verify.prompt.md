Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 03 - Expand per-element inventory and registry coverage

## Purpose

Move from broad family-level catalog coverage to real per-element coverage wherever KS emits independent visuals.

## Source areas to scan

At minimum, scan:

```text
components/layouts.py
components/*.py
generator/pages/*.py
generator/layout_previews.py
react/*.tsx
css/*.css
js/*.js
assets/svg/*.svg
museum/studio/**
showcase-react-app/**
static/generated HTML if present
```

## Required behavior

- Build a source-derived inventory first. Do not trust existing registry rows blindly.
- Identify every emitted visual surface that can appear independently in HTML, React, showcase output, desktop/app UI, diagrams, theme/style galleries, interaction modules, or consumer pages.
- Allocate stable three-letter hashes for independent emitted visuals.
- Split broad rows such as `Kpr`, `Ksc`, `Ksj`, `Ksv`, and `Msm` into child entries when they cover distinct emitted visuals.
- Keep family rows only for true abstract families or non-rendered implementation groups.
- Each registry entry must include:
  - `hash`
  - `name`
  - `type`
  - `category`
  - `source_paths`
  - `emits_html` or equivalent
  - `contract_path`
  - `contract_status`
  - `showcase_url` or status/reason
  - `screenshot_url` or status/reason
  - `owner` or maintenance area if available
  - `deprecated` status if relevant

## Coverage policy

Not all inventory items require an own contract, but every visible emitted item must be addressable by hash or explicitly covered by a named family hash.

Family-covered is allowed only when:

- the item is not visible independently, or
- the visual differences are purely content-level, or
- the family contract explicitly names the child item and its constraints.

## Acceptance criteria

- Registry coverage materially increases beyond the initial phase-1 registry.
- No broad family row is the sole coverage for many independent emitted visuals without child rows or explicit rationale.
- `visual-registry-coverage.md` lists uncovered items, and the list is either empty or has justified deferrals.
- Every new hash is valid and globally unique.
- The registry includes page types, layouts, pages, sections, components, primitives, styles, diagrams, interactions, and desktop interfaces where present.
- `.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md` records before/after counts.

## Do not

- Do not generate random hashes without checking uniqueness.
- Do not rename existing hashes unless the existing hash is invalid or duplicative.
- Do not delete old hashes without marking them deprecated and providing a migration note.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
## Done (phase 03)

### Registry expansion
- **64 → 91** entries by splitting the broad families into hashed children:
  - **Ksc** → **Ech, Mar, DVN, FXK, KEm** (`visual-style`, grouped by theme/packs/surfaces/desktop chrome/ambient).
  - **Ksj** → **LJa, TNH, Kfr, pUW, Bru** (`interaction-script`, grouped by nav, theme/motion, diagrams/charts, roadmap, tiles/presentation). Fixed typo **`ks-living-motion.js`** in paths.
  - **Ksv** → **hMR, TXK, LkY, Zmg, Zxd** (`diagram-asset-group`, ambient / backgrounds / layout schematics / living / templates).
  - **Kpr** → **VtQ, pvx, rJd, VPc, ARv, Gtf, qrv, vZr, bNG, nzA** plus **Khx** for **`ks_hash_attrs.py`** + **`ks_catalog_hashes.py`** (`python-component-module`).
  - **Msm** → child **vYA** (`museum-chrome-asset`) for **`icons.svg`** + **`favicon.svg`**, `family-covered` under **`Msm-museum-studio.md`**.
- Parent rows (**Ksc, Ksj, Ksv, Kpr**) now use **`source_paths: []`** and **`child_hashes`**; coverage is on children. **`category`** set on new rows.

### Inventory + checks
- **`inventory-ks-visuals.mjs`**: adds **`python-component-anchor`** for helper-only `components/*.py` modules; skips **`__init__.py`**.
- **`check-visual-catalog.mjs`**: unions paths for CSS/JS/SVG/Kpr validation; matches **visual-style**, **interaction-script**, **diagram-asset-group**, **python-component-module**, **museum-chrome-asset**; **every** path on a multi-path `python-component-module` must appear in inventory; **`visual-registry-coverage.md`** now has **Uncovered or deferred museum inventory paths** (Vite bundles under `museum/studio/assets/*` deferred; **needs attention: none**).

### Contracts
- Family contracts name the child hashes: **`Ksc-fam-styles.md`**, **`Ksj-fam-scripts.md`**, **`Ksv-fam-svg.md`**, **`Kpr-fam-python-renderers.md`**, **`Msm-museum-studio.md`**.

### Regenerated / verified
- **`visual-inventory.generated.json`** / **`.md`**, **`visual-registry.generated.json`**, **`visual-registry-coverage.md`**
- **`verify-bad-fixture.sh`** OK  
- **`tools/website-ux-auditor/auditor-tests/visual-catalog-json.test.js`** OK  

### Evidence
- **`.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md`** — before/after table, new hashes, deferral note, commands.
--- EXECUTION LOG END ---
