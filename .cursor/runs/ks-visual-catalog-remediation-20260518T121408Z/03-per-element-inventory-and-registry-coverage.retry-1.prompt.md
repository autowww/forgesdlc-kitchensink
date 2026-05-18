The previous verification failed or was inconclusive. Complete only the missing work for this phase. Do not redo completed work. After changes, rerun the relevant acceptance checks and update the phase evidence file.

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

--- VERIFICATION OUTPUT START ---
VERDICT: FAIL

### Evidence (what matches the phase / log)

- **Registry size**: `visual-registry.yaml` has **91** `hash:` rows and **no duplicate** hash values (`uniq -d` empty); aligns with `visual-registry-coverage.md` (“Registry entries: 91”) and the plan doc’s **64 → 91** table  
  ([`.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md), [`docs/design/catalog/visual-registry-coverage.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/visual-registry-coverage.md)).
- **Family split structure**: **Ksc / Ksj / Ksv / Kpr** parents list **`child_hashes`**, use **`source_paths: []`**, and children carry **`parent_hash`** (example Kpr block):

```2228:2265:/home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/visual-registry.yaml
  - family: python-components
    aliases: []
    parent_hash: null
    child_hashes:
      - VtQ
      - pvx
      - rJd
      - VPc
      - ARv
      - Gtf
      - qrv
      - vZr
      - bNG
      - nzA
      - Khx
    ...
    hash: Kpr
    ...
    type: python-renderer-family
    category: python-renderer-family
    ...
    source_paths: []
```

- **Msm**: Parent **Msm** has **`child_hashes: [vYA]`** and **vYA** references `museum/studio/icons.svg` / `favicon.svg`; deferred **`museum/studio/assets/*`** chunks are documented under **“Uncovered or deferred museum inventory paths”** with **“Needs registry attention: (none)”** ([`visual-registry-coverage.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/visual-registry-coverage.md) lines 69–79).
- **Inventory tooling**: `inventory-ks-visuals.mjs` defines **`python-component-anchor`** ([`tools/design-catalog/inventory-ks-visuals.mjs`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/tools/design-catalog/inventory-ks-visuals.mjs) ~248).
- **Family contract ↔ children**: e.g. **`Ksc-fam-styles.md`** includes a **“Per-group registry children”** section naming **Ech, Mar, DVN, FXK, KEm** ([`docs/design/catalog/styles/Ksc-fam-styles.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/styles/Ksc-fam-styles.md) lines 79–85).
- **JS path typo**: **TNH** lists `js/ks-living-motion.js` ([`visual-registry.yaml`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/visual-registry.yaml) ~1878–1883).

### Missing work / gaps vs the phase prompt (why FAIL)

1. **`category` not on every registry row** — Phase requires **each** entry to include **`category`**. Only **32** lines match `^    category:` in `visual-registry.yaml` (**59** entries have **no** `category`). Example: layout **Hbk** has hash/name/type/contract/etc. but **no** `category` field ([`visual-registry.yaml`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/visual-registry.yaml) lines 14–29 vs families starting ~1629).

2. **`emits_html` (or documented equivalent for every row)** — There is **no** `emits_html` field anywhere in `visual-registry.yaml` (`emits_html` grep: none). **`emit_marker_in_showcase`** exists but does **not** substitute a general **HTML emission** signal per visual surface as the phase describes.

3. **`contract_path` wording** — Phase asks for **`contract_path`**; the schema uses **`contract:`** (reasonable equivalent), but if reviewers enforce the checklist literally, call out the naming mismatch.

4. **Governance vs contract stubs** — **`Ksc-fam-styles.md`** still contains **“TBD”** / **stub** sections (e.g. Anatomy, Content rules, Dependencies, checklist unchecked), which conflicts with the workspace rule **“Do not leave design contracts with unresolved placeholder language.”** Same pattern appears in the excerpt ([`Ksc-fam-styles.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/catalog/styles/Ksc-fam-styles.md) lines 22–41, 87–99).

5. **Execution log precision** — The log implies broad **“per-element”** coverage; many children remain **multi-file bundles** (e.g. **DVN** spans many CSS paths). That can still be allowed under **family-covered** rules **if** constraints are explicit in contracts—but combined with **TBD** stubs, the **“explicitly names the child item and its constraints”** bar is only partially met.

### Exact next actions

1. Add a **`category`** value on **all 91** registry entries (derive a stable taxonomy from `type` / `family`, including layouts, pages, primitives, library-consumer, etc.).
2. Add **`emits_html`** (boolean or enum) **or** publish an explicit mapping doc/schema stating which existing fields imply HTML/React/static emission for **every** `type`.
3. Replace **`TBD`** / unchecked stubs in updated **family contracts** with concrete anatomy/constraints—or **explicit deferrals** that satisfy catalog governance (not open placeholders).
4. Re-run and attach outputs to the phase doc (same commands already listed in [`03-per-element-inventory-and-registry-coverage.md`](file:///home/lzvyahin/Code/forgesdlc-kitchensink/.cursor/plans/ks-visual-catalog-remediation/03-per-element-inventory-and-registry-coverage.md)): **`inventory-ks-visuals.mjs`**, **`check-visual-catalog.mjs`**, **`verify-bad-fixture.sh`**, **`visual-catalog-json.test.js`**.

*(Ask mode: no edits/tests were run here beyond read-only inspection and a duplicate-hash line count via `grep`; re-running Node checks locally will confirm the log’s “OK” claims on your machine.)*
--- VERIFICATION OUTPUT END ---
