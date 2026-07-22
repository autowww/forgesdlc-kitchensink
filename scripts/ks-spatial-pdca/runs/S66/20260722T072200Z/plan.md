# S66 — Fractured pyramid

**Kind:** component · **Hash:** `Pry` · **Depends on:** S02

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Pry`
- `docs/design/spatial/effects/fractured-pyramid.md`
- `docs/design/spatial/oracles/Pry.json`
- `docs/design/catalog/components/Pry-fractured-pyramid.md`

## Acceptance criteria

- Showcase section at `spatial-ambient.html#sec-fractured-pyramid`
- Hash `Pry` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S66` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S66`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
