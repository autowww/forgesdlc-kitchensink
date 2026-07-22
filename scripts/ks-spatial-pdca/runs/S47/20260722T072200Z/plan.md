# S47 — Card fan

**Kind:** component · **Hash:** `Fan` · **Depends on:** S11

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Fan`
- `docs/design/spatial/effects/card-fan.md`
- `docs/design/spatial/oracles/Fan.json`
- `docs/design/catalog/components/Fan-card-fan.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-card-fan`
- Hash `Fan` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S47` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S47`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
