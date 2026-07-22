# S51 — Rolling cube 404 scene

**Kind:** component · **Hash:** `Erc` · **Depends on:** S14

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Erc`
- `docs/design/spatial/effects/rolling-cube-404.md`
- `docs/design/spatial/oracles/Erc.json`
- `docs/design/catalog/components/Erc-rolling-cube-404.md`

## Acceptance criteria

- Showcase section at `spatial-ambient.html#sec-error-cube`
- Hash `Erc` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S51` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S51`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
