# S33 — JS pointer tilt surface

**Kind:** component · **Hash:** `Tlj` · **Depends on:** S00

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Tlj`
- `docs/design/spatial/effects/tilt-js.md`
- `docs/design/spatial/oracles/Tlj.json`
- `docs/design/catalog/components/Tlj-tilt-js.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-tilt-js`
- Hash `Tlj` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S33` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S33`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
