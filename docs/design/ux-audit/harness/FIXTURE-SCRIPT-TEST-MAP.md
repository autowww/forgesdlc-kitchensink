# Fixture and script test map

Generated: `2026-05-25T14:33:25.953Z` by `generate-harness-e2e-matrix.mjs` (static template; update script when harness scripts change).

Maps **harness scripts** to **fixture requirements** and **automated tests** for validating the tooling itself (not per-rule E2E — see [E2E-COVERAGE-MATRIX.md](E2E-COVERAGE-MATRIX.md)).

## Script matrix

| Harness script | Fixture campaign needed | Gate / assertion | Automated test |
|----------------|-------------------------|------------------|----------------|
| `invoke-det-ruleset-harness.sh` | Rebuild or `--rebuild-fixtures`; full DET manifest | `expect-rule-detection.sh` → `detection_ok` | `invoke-det-ruleset-harness.test.sh` |
| `invoke-det-ruleset-remediation-verify.sh` | Same fixture root + `harness-minimal-assets/` | `run-deterministic-fixers.mjs` (handbook_after) + audit + `expect-rule-clean.sh` → `remediation_ok` / `fixerOk` | `invoke-det-ruleset-remediation-verify.test.sh` |
| `invoke-ai-ruleset-harness.sh` | AI defect fixtures campaign | AI detection gate | `invoke-ai-ruleset-harness.test.sh` |
| `apply-harness-fixture-remediation.py` | Per-rule `fixture-website/` or campaign `website/` | 0 targeted findings post-apply | Indirect (remediation-verify test only) |
| `invoke-det-ruleset-harness.sh --enable-agents` | **Must** set `FORGE_UX_RULESET_FIXTURE_ROOT` to existing detection campaign | `remediation_ok` | `invoke-det-ruleset-harness-agent.test.sh` |
| `invoke-det-ruleset-handbook-upgrade.sh` | None (repo Markdown only) | pagegen manifest `current` | `invoke-det-ruleset-handbook-upgrade.test.sh` |
| `invoke-sync-handbook-versions.sh` | None | manifest `current` | `invoke-sync-handbook-versions.test.sh` |
| `generator/build_rule_defect_fixtures.py` | Valid Before HTML in handbook | `manifest.json` + fail HTML | `build-rule-defect-fixtures.test.sh` |
| `expect-rule-detection.sh` / `expect-rule-clean.sh` | `audit-data.json` from prior loop step | exit 0 / 1 | Used inside harness tests |

## Known gaps

1. **Agent loop** (`--enable-agents`) still depends on Cursor quota; CI uses apply+clean smoke only.
2. **Full pagegen** for 28+ rules remains optional when `invoke-sync-handbook-versions.sh` suffices.
3. **Workbench-only fixtures** — full 50-rule campaigns are gitignored; CI tests use smaller fixtures or dry-run paths (see each `*.test.sh`).
4. Optional follow-up: committed `auditor-tests/fixtures/golden/` for offline tests without workbench (not implemented).

## Regenerate E2E rule matrix

```bash
cd tools/website-ux-auditor/auditor-tests
node generate-harness-e2e-matrix.mjs
```
