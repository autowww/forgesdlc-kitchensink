# S42 — Orbital photo gallery

**Kind:** component · **Hash:** `Opg` · **Depends on:** S00

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Opg`
- `docs/design/spatial/effects/orbital-photo-gallery.md`
- `docs/design/spatial/oracles/Opg.json`
- `docs/design/catalog/components/Opg-orbital-photo-gallery.md`

## Acceptance criteria

- Showcase section at `spatial-rails.html#sec-orbital-gallery`
- Hash `Opg` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S42` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S42`
3. Spot-check showcase URL when `spatial-rails.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
