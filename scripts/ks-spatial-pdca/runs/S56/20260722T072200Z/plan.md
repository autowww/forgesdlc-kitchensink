# S56 — Sphere family ambient

**Kind:** component · **Hash:** `Orb` · **Depends on:** S02

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Orb`
- `docs/design/spatial/effects/sphere-family.md`
- `docs/design/spatial/oracles/Orb.json`
- `docs/design/catalog/components/Orb-sphere-family.md`

## Acceptance criteria

- Showcase section at `spatial-ambient.html#sec-sphere-family`
- Hash `Orb` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S56` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S56`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
