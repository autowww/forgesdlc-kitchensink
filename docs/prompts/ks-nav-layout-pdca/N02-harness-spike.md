# N02 — Test harness spike

**Phase:** N02  
**Kind:** foundation  
**Depends on:** N01

## Goal

Bootstrap the verification stack: Playwright oracle runner in `tools/nav-layout-effects-verifier/`, LCDL `ks_nav-layout_effect_evaluate_v1` task (in `forge-lcdl` repo), `DET.SPATIAL.*` rule stubs, `check-oracle-doc-sync.mjs`, and a golden-path oracle for existing tilt (`Tlz` / `ks-tilt-wrap`).

## Files to inspect

- `tools/design-catalog/check-visual-catalog.mjs`
- `tools/website-ux-auditor/auditor-tests/DET-RULESET-HARNESS-INDEX.md`
- `forge-lcdl` — `pw_extractor_parity_evaluate` pattern (sibling repo)
- `docs/design/nav-layout/ORACLE-SCHEMA.md`

## Expected changes (KS repo)

| Path | Action |
|------|--------|
| `tools/nav-layout-effects-verifier/package.json` | Node package `@forge/ks-nav-layout-effects-verifier` |
| `tools/nav-layout-effects-verifier/run-oracle.mjs` | CLI: `--url`, `--oracle` |
| `tools/nav-layout-effects-verifier/run-all-oracles.mjs` | Batch runner for showcase |
| `tools/nav-layout-effects-verifier/check-oracle-doc-sync.mjs` | Doc ↔ oracle ID parity |
| `tools/nav-layout-effects-verifier/tests/` | Offline comparator + fixture HTML |
| `docs/design/ux-audit/rule-pages/DET.SPATIAL.*.md` | Bootstrap nav-layout DET rules |
| `.github/workflows/ci.yml` | Optional CI job stub for verifier |

## Expected changes (forge-lcdl repo — separate commit)

| Path | Action |
|------|--------|
| `src/forge_lcdl/tasks/ks_nav-layout_effect_evaluate_v1.py` | Evaluate task |
| `src/forge_lcdl/contracts/ks_nav-layout_effect_evaluate/v1/contract.md` | Contract |
| `tests/nav-layout/test_ks_nav-layout_oracle.py` | Offline tests |

## Acceptance criteria

- `cd tools/nav-layout-effects-verifier && npm test` passes
- Golden path: tilt oracle (`Tlz`) scores against built showcase (local `http.server` on `showcase/` if needed)
- `check-oracle-doc-sync.mjs` reports no drift for scaffolded effects
- `./scripts/ks-nav-layout-pdca/check-phase-gate.sh N02` is GREEN

## Check commands

```bash
python3 generator/build-showcase.py
node tools/design-catalog/check-visual-catalog.mjs --repo . --registry docs/design/catalog/visual-registry.yaml --showcase showcase
cd tools/nav-layout-effects-verifier && npm test -- --hash Tlz
./scripts/ks-nav-layout-pdca/pdca-run-phase.sh N02 check
```

## Rollback

Revert N02 commits in KS and forge-lcdl separately; remove verifier package and DET.SPATIAL stubs.

## Governance

- **No Fleet-specific UX auditor profile.**
- Nav-layout verifier must **not** import or call `analyze-website-ux.mjs` or `score-website-ux.mjs`.
- Pixel-diff regression is out of scope; use computed-style oracles.
