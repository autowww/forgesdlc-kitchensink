# S48 — Card deck stack

**Kind:** component · **Hash:** `Dck` · **Depends on:** S03

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Dck`
- `docs/design/spatial/effects/card-deck-stack.md`
- `docs/design/spatial/oracles/Dck.json`
- `docs/design/catalog/components/Dck-card-deck-stack.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-card-deck`
- Hash `Dck` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S48` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S48`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
