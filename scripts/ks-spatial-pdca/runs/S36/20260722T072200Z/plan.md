# S36 — CSS bookmark control

**Kind:** component · **Hash:** `Bkm` · **Depends on:** S02

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Bkm`
- `docs/design/spatial/effects/css-bookmark.md`
- `docs/design/spatial/oracles/Bkm.json`
- `docs/design/catalog/components/Bkm-css-bookmark.md`

## Acceptance criteria

- Showcase section at `spatial-controls.html#sec-css-bookmark`
- Hash `Bkm` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S36` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S36`
3. Spot-check showcase URL when `spatial-controls.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
