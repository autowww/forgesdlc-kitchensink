# S34 — Pro-mode guard toggle

**Kind:** component · **Hash:** `Pmg` · **Depends on:** S09

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Pmg`
- `docs/design/spatial/effects/pro-mode-guard-toggle.md`
- `docs/design/spatial/oracles/Pmg.json`
- `docs/design/catalog/components/Pmg-pro-mode-guard-toggle.md`

## Acceptance criteria

- Showcase section at `spatial-controls.html#sec-pro-mode-guard`
- Hash `Pmg` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S34` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S34`
3. Spot-check showcase URL when `spatial-controls.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
