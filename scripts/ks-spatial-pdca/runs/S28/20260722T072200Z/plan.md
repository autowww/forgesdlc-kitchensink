# S28 — Tunnel warp variant

**Kind:** upgrade · **Hash:** `Tun` · **Depends on:** S16

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py` (v2 emitter)
- `components/spatial.py` (re-export)
- `css/ks-spatial-wave2.css`
- `docs/design/spatial/oracles/Tun.json`
- `generator/spatial_wave2_showcase.py`

## Acceptance criteria

- v2 mode live at `spatial-ambient.html#sec-tunnel-warp`
- Oracle scenario documents wave2 variant on `Tun`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S28` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S28`
3. Spot-check showcase URL when `spatial-ambient.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
