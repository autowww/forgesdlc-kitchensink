# S35 — Vertical rocker switch

**Kind:** component · **Hash:** `Vrk` · **Depends on:** S09

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Vrk`
- `docs/design/spatial/effects/vertical-rocker-switch.md`
- `docs/design/spatial/oracles/Vrk.json`
- `docs/design/catalog/components/Vrk-vertical-rocker-switch.md`

## Acceptance criteria

- Showcase section at `spatial-controls.html#sec-rocker-switch`
- Hash `Vrk` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S35` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S35`
3. Spot-check showcase URL when `spatial-controls.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
