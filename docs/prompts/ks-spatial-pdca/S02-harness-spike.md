# S02 — Test harness spike

**Phase:** S02  
**Kind:** foundation  
**Depends on:** S01

## Goal

Bootstrap the verification stack: Playwright oracle runner in `tools/spatial-effects-verifier/`, LCDL `ks_spatial_effect_evaluate_v1` task (in `forge-lcdl` repo), `DET.SPATIAL.*` rule stubs, `check-oracle-doc-sync.mjs`, and a golden-path oracle for existing tilt (`Tlz` / `ks-tilt-wrap`).

## Files to inspect

- `tools/design-catalog/check-visual-catalog.mjs`
- `tools/website-ux-auditor/auditor-tests/DET-RULESET-HARNESS-INDEX.md`
- `forge-lcdl` — `pw_extractor_parity_evaluate` pattern (sibling repo)
- `docs/design/spatial/ORACLE-SCHEMA.md`

## Expected changes (KS repo)

| Path | Action |
|------|--------|
| `tools/spatial-effects-verifier/package.json` | Node package `@forge/ks-spatial-effects-verifier` |
| `tools/spatial-effects-verifier/run-oracle.mjs` | CLI: `--url`, `--oracle` |
| `tools/spatial-effects-verifier/run-all-oracles.mjs` | Batch runner for showcase |
| `tools/spatial-effects-verifier/check-oracle-doc-sync.mjs` | Doc ↔ oracle ID parity |
| `tools/spatial-effects-verifier/tests/` | Offline comparator + fixture HTML |
| `docs/design/ux-audit/rule-pages/DET.SPATIAL.*.md` | Bootstrap spatial DET rules |
| `.github/workflows/ci.yml` | Optional CI job stub for verifier |

## Expected changes (forge-lcdl repo — separate commit)

| Path | Action |
|------|--------|
| `src/forge_lcdl/tasks/ks_spatial_effect_evaluate_v1.py` | Evaluate task |
| `src/forge_lcdl/contracts/ks_spatial_effect_evaluate/v1/contract.md` | Contract |
| `tests/spatial/test_ks_spatial_oracle.py` | Offline tests |

## Acceptance criteria

- `cd tools/spatial-effects-verifier && npm test` passes
- Golden path: tilt oracle (`Tlz`) scores against built showcase (local `http.server` on `showcase/` if needed)
- `check-oracle-doc-sync.mjs` reports no drift for scaffolded effects
- `./scripts/ks-spatial-pdca/check-phase-gate.sh S02` is GREEN

## Check commands

```bash
python3 generator/build-showcase.py
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
cd tools/spatial-effects-verifier && npm test -- --hash Tlz
./scripts/ks-spatial-pdca/pdca-run-phase.sh S02 check
```

## Rollback

Revert S02 commits in KS and forge-lcdl separately; remove verifier package and DET.SPATIAL stubs.

## Governance

- **No Fleet-specific UX auditor profile.**
- Spatial verifier must **not** import or call `analyze-website-ux.mjs` or `score-website-ux.mjs`.
- Pixel-diff regression is out of scope; use computed-style oracles.
