Verify this remediation phase without editing files.

Start your response with exactly one line:
VERDICT: PASS
or
VERDICT: FAIL

Then provide evidence, missing work, and exact next actions.

--- PHASE PROMPT START ---
# 05 - Apply hash attributes to emitted visual roots

## Purpose

Ensure the catalog is visible in generated HTML and component output so humans, scripts, auditors, and screenshots can refer to actual rendered elements by hash.

## Required output attributes

Every dominant visible root for a cataloged emitted visual should include:

```html
hash="XYZ"
data-ks-hash="XYZ"
data-ks-type="component|layout|page|style|diagram|interaction|desktop-interface|..."
data-ks-name="stable-kebab-name"
```

Use `hash="XYZ"` because it is the requested human-facing reference format. Use `data-ks-hash="XYZ"` because it is selector-safe and tooling-friendly.

## Required implementation areas

Inspect and update as needed:

```text
components/layouts.py
components/*.py
generator/pages/*.py
generator/layout_previews.py
react/*.tsx
css showcase wrappers where visual styles are demonstrated
js interaction/demo wrappers
assets/svg showcase wrappers
museum/studio static HTML or generated pages
```

## Helper policy

- Prefer central helpers for Python-generated HTML.
- Prefer a small React helper or prop pattern for React primitives.
- Avoid hand-copying attributes in many places when a generator or wrapper can do it correctly.
- Add tests or snapshot checks where feasible.

## Build verification

Run or document the equivalent of:

```bash
python3 generator/build-showcase.py
```

Then verify generated HTML contains expected markers:

```bash
grep -R 'data-ks-hash=' site docs out build dist 2>/dev/null | head
```

Adjust paths to the repo's actual output folders.

## Acceptance criteria

- All registry entries marked as emitted/rendered have either an emitted hash marker or a documented reason why the marker cannot be attached.
- Generated showcase HTML contains hash markers for layouts, pages, sections, components, diagrams, visual style demos, interactions, and desktop/app surfaces where applicable.
- React primitives expose or render hash markers in their showcase/demo surfaces.
- `check-visual-catalog.mjs` can validate emitted hash marker coverage.
- `.cursor/plans/ks-visual-catalog-remediation/05-hash-attribute-emission.md` records commands and marker counts.

## Do not

- Do not attach hashes to invisible implementation wrappers when a visible root exists.
- Do not reuse one hash across multiple independent visual roots.
- Do not change visual appearance unless necessary to expose a marker safely.
--- PHASE PROMPT END ---

--- EXECUTION LOG START ---
## Done

### Museum studio markers
The cataloged **museum** surfaces had no markers in-repo. They now match the usual quartet (`hash`, `data-ks-hash`, `data-ks-type`, `data-ks-name`):

- **`museum/studio/index.html`** — `#root` tagged as **`Msm`** (`desktop-interface` / `museum-studio`).
- **`museum/studio/icons.svg`** & **`museum/studio/favicon.svg`** — root `<svg>` tagged as **`vYA`** (`museum-chrome-asset` / `museum-studio-chrome-graphics`).

### Catalog checker
**`tools/design-catalog/check-visual-catalog.mjs`** now validates **`museum/studio/*.html|*.svg`** for any **`emits_html`** registry row (skips missing paths), using the same paired `hash` + `data-ks-hash` rule as showcase files. The module header comment documents this.

### Verification
- `python3 generator/build-showcase.py` — OK  
- `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` — OK  

**Counts** (grep): **`showcase/`** ≈172 lines with `data-ks-hash=` and `data-ks-type=`; **`museum/studio/`** 3 lines with `data-ks-hash=` (shell + two SVG roots).

### Evidence
**`.cursor/plans/ks-visual-catalog-remediation/05-hash-attribute-emission.md`** — scope, acceptance table, commands, and counts.

Showcase/HTML layouts, previews, chrome, and React primitives were already emitting the full helper shape via **`ks_hash_attrs`** / **`ks_catalog_hashes`** and **`react/ksVisualAttrs.ts`**; this phase fills the **`museum/studio`** gap called out in the prompt and wires it into **`check-visual-catalog.mjs`** so regressions fail CI early.
--- EXECUTION LOG END ---
