# S49 — Vinyl sleeve media

**Kind:** component · **Hash:** `Vnl` · **Depends on:** S05

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Vnl`
- `docs/design/spatial/effects/vinyl-sleeve-media.md`
- `docs/design/spatial/oracles/Vnl.json`
- `docs/design/catalog/components/Vnl-vinyl-sleeve-media.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-vinyl-sleeve`
- Hash `Vnl` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S49` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S49`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
