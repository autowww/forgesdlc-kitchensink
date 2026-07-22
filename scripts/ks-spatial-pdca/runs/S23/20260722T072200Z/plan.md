# S23 — Wave 2 traceability spike

**Kind:** foundation · **Hash:** `—` · **Depends on:** S22

## Assumptions

- Wave 2 scope covers FreeFrontend CSS 3D Yes/Partial examples only.
- Showcase built with `python3 generator/build-showcase.py` before gate check.
- One commit increment per phase in `forgesdlc-kitchensink` when executed live.

## Files to touch

- `docs/design/spatial/freefrontend-traceability.md`
- `docs/design/spatial/wave2-registry.yaml`
- `scripts/ks-spatial-pdca/SEQUENCE.yaml`

## Acceptance criteria

- 79-row FF traceability matrix present
- Wave 2 phases S24–S67 registered in SEQUENCE.yaml
- `check-phase-gate.sh S23` passes

## Test plan

1. `python3 generator/build-showcase.py`
2. `./scripts/ks-spatial-pdca/check-phase-gate.sh S23`
3. Spot-check showcase URL when `` is set.

## Rollback

Revert the phase commit in `forgesdlc-kitchensink`; re-run gate on prior phase.
