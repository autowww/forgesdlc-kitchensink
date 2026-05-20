Verify this phase without editing files.

Start with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide concise evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 01 — Showcase and catalog inventory

Goal: build a trustworthy source-derived inventory of KS visuals and compare it against current catalog contracts and screenshots.

Tasks:

1. Try to access/capture the live showcase URLs if network is available:
   - `https://ks.forgesdlc.com/showcase/`
   - `https://kitchensink.forgesdlc.com/`
2. If live is unavailable, build local showcase with `python3 generator/build-showcase.py` and use local generated pages and `docs/design/catalog/screenshots/*.png`.
3. Run or improve `tools/design-catalog/inventory-ks-visuals.mjs` so it reports:
   - all registry rows;
   - all visual source files;
   - all emitted hashes in generated HTML;
   - screenshot availability;
   - contract availability;
   - family-covered rows and their children;
   - high-risk broad-family coverage.
4. Produce `.cursor/plans/ks-ux-component-rules/01-showcase-and-catalog-inventory.md` with:
   - inventory totals;
   - registry totals by type;
   - missing/weak contracts;
   - screenshot gaps/mismatches;
   - emitted-hash coverage;
   - visual groups needing more specific rules.

Acceptance:
- local showcase builds;
- inventory report exists;
- no Fleet-specific profile is created.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
Here is what was completed for **phase 01**.

### Live URLs
- `https://ks.forgesdlc.com/showcase/` → **404**
- `https://ks.forgesdlc.com/` → **200**
- `https://kitchensink.forgesdlc.com/` → **DNS failure**

### Local showcase
- Ran `python3 generator/build-showcase.py` → **exit 0** (22 pages + previews under `showcase/`).

### `inventory-ks-visuals.mjs` (scoped upgrade)
- Still builds the YAML-free source inventory (`items`, `summary.byType`).
- Loads **`docs/design/catalog/visual-registry.generated.json`** when present and appends **`catalogCrosswalk`**: registry counts by type, showcase hash scan (same rules as `check-visual-catalog.mjs`), contract presence + stub bullets, PNG presence under `docs/design/catalog/screenshots/` and `showcase/screenshots/`, family parents (with child labels), `family-covered` rows, shared-contract roll-ups, and broad-family risk hints.
- New flags: `--showcase`, `--registry-json`, `--no-registry`.
- Generated **Markdown** now includes a **Catalog crosswalk** summary when crosswalk data exists.

### Checks run
- `node tools/design-catalog/inventory-ks-visuals.mjs --repo . --out docs/design/catalog/visual-inventory.generated.json`
- `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` → **OK (91 entries)**

### Evidence / report
- **`.cursor/plans/ks-ux-component-rules/01-showcase-and-catalog-inventory.md`** — tables for inventory (363 items / 290 paths), registry (91 rows), emitted hashes (54 in scan, 0 emit-marker gaps), screenshots (48 `captured` with local PNG; 2 `blocked`: Kra, Msm), family coverage, and groups that need tighter rules later (**Kpr**, **Rpf**, **Ksc**, **Ksj**, **Ksv**).
- **No Fleet-specific profile** was introduced.

Regenerated artifacts you may want to review in git: `docs/design/catalog/visual-inventory.generated.{json,md}`, `showcase/`, and the files `check-visual-catalog` normally refreshes (`visual-registry.generated.json`, `visual-registry-coverage.md`).
--- EXECUTION LOG END ---
