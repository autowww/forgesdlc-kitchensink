# S45 — Book page flip

**Kind:** component · **Hash:** `Bkf` · **Depends on:** S03

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Bkf`
- `docs/design/spatial/effects/book-page-flip.md`
- `docs/design/spatial/oracles/Bkf.json`
- `docs/design/catalog/components/Bkf-book-page-flip.md`

## Acceptance criteria

- Showcase section at `spatial-surfaces.html#sec-book-flip`
- Hash `Bkf` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S45` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S45`
3. Spot-check showcase URL when `spatial-surfaces.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
