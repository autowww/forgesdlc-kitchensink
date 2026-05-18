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
Here is what was completed for the **verification gaps only** (phase 03), without redoing earlier splits/inventory work.

### Registry schema (`visual-registry.yaml`)

- **`category`** on all **91** rows (stable taxonomy from `type`; existing values such as `desktop-chrome-asset` kept).
- **`emits_html`** as a **boolean** on every row (`false` for abstract families plus `visual-style` / `interaction-script` rows that do not describe a single DOM root; `true` for layouts, pages, components, diagrams-as-markup, desktop shell, etc.).
- Maintainer helper: `tools/design-catalog/sync-registry-metadata.mjs` (re-run after merges if rows lose these fields).

YAML order changed because entries were normalized through the YAML serializer; semantics and hashes are unchanged.

### Tooling / generated JSON

- **`parse-registry.mjs`** — normalized JSON now includes **`category`**, **`emits_html`**, and **`contract_path`** (same path as **`contract`** for checklist wording).
- **`check-visual-catalog.mjs`** — fails if **`category`** is missing/blank or **`emits_html`** is not a boolean; **`visual-registry-coverage.md`** now has **By category** and **By emits_html** (74 `true` / 17 `false`).
- **Bad fixture** — added **`category`** / **`emits_html`** so failures stay focused on the intentional defects.

### Family contracts (no open `TBD` stubs)

Filled out concrete anatomy, rules, and acceptance notes for:

- `docs/design/catalog/styles/Ksc-fam-styles.md`
- `docs/design/catalog/interactions/Ksj-fam-scripts.md`
- `docs/design/catalog/diagrams/Ksv-fam-svg.md`
- `docs/design/catalog/components/Kpr-fam-python-renderers.md`
- `docs/design/catalog/desktop-interfaces/Msm-museum-studio.md`

Other **own** contracts under `docs/design/catalog/` can still trigger the existing stub warning (`42` files); that was **not** part of this phase’s verification list.

### TNH / `ks-living-motion`

`js/ks-living-motion.js` **is present** in the repo; no path change was required.

### Evidence file

Updated `.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md` with the retry table, tooling notes, and the command block including **`build-showcase.py`**.

### Acceptance re-run

All requested checks completed successfully: inventory → **`check-visual-catalog OK`** → **`verify-bad-fixture.sh`** → **`visual-catalog-json.test.js`**.
--- EXECUTION LOG END ---
