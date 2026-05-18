# Phase 05 — Apply hash attributes to emitted visual roots

## Scope completed

- **`museum/studio/index.html`**: SPA mount `#root` now emits **`hash` / `data-ks-hash` / `data-ks-type` / `data-ks-name`** for registry **`Msm`** (`desktop-interface` / `museum-studio`), matching the Python/React helper shape used in showcase shells.
- **`museum/studio/icons.svg`** and **`museum/studio/favicon.svg`**: Root `<svg>` carries the same quartet for child registry **`vYA`** (`museum-chrome-asset` / `museum-studio-chrome-graphics`) so chrome graphics remain discoverable without treating hashed Vite bundles as marker sources.
- **`tools/design-catalog/check-visual-catalog.mjs`**: After showcase validation, verifies every **`emits_html`** registry row whose `source_paths` include **`museum/studio/*.html|*.svg`** (existing files only) contains both `hash="<Hhh>"` and `data-ks-hash="<Hhh>"` for that row’s hash.

Existing KS Python surfaces (`ks_hash_attrs` → `layout_shell_attrs`, `page_main_attrs`, `chrome_region_attrs`) and React (`ksVisualAttrs` / `ksReactPrimitiveAttrs`) already emitted the full marker set on built showcase pages; this phase closes the documented gap for **museum studio** static assets outside `showcase/`.

## Acceptance evidence

| Criterion | Result |
|-----------|--------|
| Registry **`emit_marker_in_showcase`** entries validated in **`showcase/*.html`** | Unchanged — still enforced by checker (paired `hash` + `data-ks-hash`; React also via **`showcase/assets/*.js`**). |
| **`museum/studio`** shell + SVG chrome marked | **`Msm`** on `#root`; **`vYA`** on both SVG roots. |
| **`check-visual-catalog.mjs`** covers non-showcase emitted sources | Validates **`museum/studio/`** `.html`/`.svg` paths tied to **`emits_html`** rows. |
| Build | `python3 generator/build-showcase.py` ✅ |
| Checker | `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` ✅ |

## Commands run (2026-05-18)

```bash
python3 generator/build-showcase.py
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
```

## Marker counts (repo root)

From `grep -R`:

| Location | Pattern | Approx. line matches |
|----------|---------|---------------------|
| `showcase/` | `data-ks-hash=` | **172** |
| `showcase/` | `data-ks-type=` | **172** |
| `museum/studio/` | `data-ks-hash=` | **3** (index + 2 SVG roots) |

## Notes

- **`data-ks-type` / `data-ks-name`** on **`showcase/`** layouts, pages, and chrome regions continue to originate from **`ks_hash_attrs`** in Python-generated HTML per existing generators.
- **Per-file SVG diagram inventory** (`assets/svg/…`) is not forced to duplicate layout/page markers inline; catalog validation for those families remains anchored on emitted HTML wrappers in showcase and registry policy, not on every standalone asset file.
