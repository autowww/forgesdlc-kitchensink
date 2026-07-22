# N00 — Architecture spike

**Phase:** N00  
**Kind:** foundation  
**Depends on:** none

## Goal

Establish the nav-layout implementation layer in Kitchen Sink: shared CSS depth tokens, pointer engine, tilt refactor, tactile tokens, container-query depth clamps, and `@supports` / reduced-motion fallbacks. Do not implement all 20 component demos in this phase.

## Files to inspect

- `css/forge-theme.css` — existing tilt rules to migrate or extend
- `js/ks-tilt-tiles.js` — refactor target for `ks-pointer-depth.js`
- `generator/ks_assets.py` — asset copy wiring
- `components/nav-layout.py` — emitter stubs (if present)

## Expected changes

| Path | Action |
|------|--------|
| `css/ks-nav-layout.css` | New depth tokens, preserve-3d gates, reduced-motion |
| `js/ks-nav-shared.js` | Shared pointer → CSS vars (`--ks-rx`, `--ks-ry`, `--ks-light-angle`) |
| `js/ks-tilt-tiles.js` | Consume pointer engine; no duplicate tracking logic |
| `generator/ks_assets.py` | Copy nav-layout CSS/JS into showcase and consumer bundles |

## Acceptance criteria

- `python3 generator/build-showcase.py` succeeds
- `node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase` passes (no regression)
- `css/ks-nav-layout.css` and `js/ks-nav-shared.js` exist and are wired into showcase assets
- Tilt behavior preserved or improved on existing `ks-tilt-wrap` surfaces

## Check commands

```bash
./scripts/ks-nav-layout-pdca/pdca-run-phase.sh N00 check
```

## Rollback

Revert the N00 commit; restore prior tilt-only behavior in `forge-theme.css` / `ks-tilt-tiles.js`.

## Governance

- **No Fleet-specific UX auditor profile.**
- Do not call `analyze-website-ux.mjs` from `score-website-ux.mjs` or vice versa.
- Nav-layout verifier package is out of scope for N00 (arrives in N02).
