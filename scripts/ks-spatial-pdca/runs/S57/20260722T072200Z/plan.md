# S57 — Scroll layer parallax

**Kind:** component · **Hash:** `Slp` · **Depends on:** S17, S19

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Slp`
- `docs/design/spatial/effects/scroll-layer-parallax.md`
- `docs/design/spatial/oracles/Slp.json`
- `docs/design/catalog/components/Slp-scroll-layer-parallax.md`

## Acceptance criteria

- Showcase section at `spatial-ambient.html#sec-scroll-parallax`
- Hash `Slp` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S57` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S57`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
