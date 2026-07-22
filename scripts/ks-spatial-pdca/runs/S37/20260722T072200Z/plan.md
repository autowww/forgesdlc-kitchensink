# S37 — Flip clock counter duplicate skip

**Kind:** skip · **Hash:** `Fck` · **Depends on:** S32

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- (none — duplicate coverage)

## Acceptance criteria

- Phase skipped; coverage owned by S32

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S37`
3. Spot-check showcase URL when `` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
