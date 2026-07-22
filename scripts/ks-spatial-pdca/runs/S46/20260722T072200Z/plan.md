# S46 — Fold accordion

**Kind:** component · **Hash:** `Fld` · **Depends on:** S02

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Fld`
- `docs/design/spatial/effects/fold-accordion.md`
- `docs/design/spatial/oracles/Fld.json`
- `docs/design/catalog/components/Fld-fold-accordion.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-fold-accordion`
- Hash `Fld` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S46` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S46`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
