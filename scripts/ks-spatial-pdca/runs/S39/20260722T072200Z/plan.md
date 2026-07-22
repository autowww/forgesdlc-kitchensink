# S39 — Cube login form shell

**Kind:** component · **Hash:** `Clf` · **Depends on:** S02

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Clf`
- `docs/design/spatial/effects/cube-login-form.md`
- `docs/design/spatial/oracles/Clf.json`
- `docs/design/catalog/components/Clf-cube-login-form.md`

## Acceptance criteria

- Showcase section at `spatial-controls.html#sec-cube-login`
- Hash `Clf` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S39` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S39`
3. Spot-check showcase URL when `spatial-controls.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
