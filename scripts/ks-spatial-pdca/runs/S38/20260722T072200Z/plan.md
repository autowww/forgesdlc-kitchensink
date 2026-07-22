# S38 — RGB keyboard surface

**Kind:** component · **Hash:** `Kbd` · **Depends on:** S29

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Kbd`
- `docs/design/spatial/effects/rgb-keyboard.md`
- `docs/design/spatial/oracles/Kbd.json`
- `docs/design/catalog/components/Kbd-rgb-keyboard.md`

## Acceptance criteria

- Showcase section at `spatial-controls.html#sec-rgb-keyboard`
- Hash `Kbd` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S38` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S38`
3. Spot-check showcase URL when `spatial-controls.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
