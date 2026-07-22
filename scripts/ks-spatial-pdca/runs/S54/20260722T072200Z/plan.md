# S54 — Hex tunnel ambient

**Kind:** component · **Hash:** `Hex` · **Depends on:** S16

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Hex`
- `docs/design/spatial/effects/hex-tunnel.md`
- `docs/design/spatial/oracles/Hex.json`
- `docs/design/catalog/components/Hex-hex-tunnel.md`

## Acceptance criteria

- Showcase section at `spatial-ambient.html#sec-hex-tunnel`
- Hash `Hex` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S54` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S54`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
