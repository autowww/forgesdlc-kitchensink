# S43 — Stellar slide navigator

**Kind:** component · **Hash:** `Stn` · **Depends on:** S22

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `components/spatial_wave2.py::render_*` for `Stn`
- `docs/design/spatial/effects/stellar-slide-navigator.md`
- `docs/design/spatial/oracles/Stn.json`
- `docs/design/catalog/components/Stn-stellar-slide-navigator.md`

## Acceptance criteria

- Showcase section at `spatial-rails.html#sec-stellar-nav`
- Hash `Stn` in visual-registry.yaml with `emits_html`
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S43` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S43`
3. Spot-check showcase URL when `spatial-rails.html` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
