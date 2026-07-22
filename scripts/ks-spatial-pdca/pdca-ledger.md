# KS spatial effects PDCA ledger

Operator log for `scripts/ks-spatial-pdca/` runs.

| At (UTC) | Phase | Status | Note |
|----------|-------|--------|------|

## Waves

| Command | Phases |
|---------|--------|
| `./pdca-orchestrate.sh wave-foundation` | S00, S01, S02 |
| `./pdca-orchestrate.sh wave-components` | S03–S22 |
| `./pdca-orchestrate.sh plan-only` | S00–S22 (plan step only per phase) |

## Smoke (prompt assembly only)

```bash
KS_SPATIAL_PDCA_PLAN_ONLY=1 ./pdca-orchestrate.sh wave-foundation
```

## Single phase

```bash
./pdca-run-phase.sh S05 plan
./pdca-run-phase.sh S05 approve
./pdca-run-phase.sh S05 do
./pdca-run-phase.sh S05 check
```
