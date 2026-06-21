# Ruleset harness closure checklist

Workbench campaigns are gitignored; this file records authoritative pass counts and re-run commands.

## Quota gates (CLI `agent`)

| When | Probe | Result |
|------|-------|--------|
| 2026-05-23 (plan) | `agent -p --model auto "Reply with exactly: QUOTA_OK"` | PASS |
| 2026-05-25 (execution) | same | PASS |

Re-probe before large `pagegen` batches, agent pilot, and AI harness if a run hits usage limits.

## Phase 1 — Ship (KS repo)

| Item | Status | Notes |
|------|--------|-------|
| Harness scripts + fixture builder | committed | `77a2dad` feat(ux-auditor): DET/AI ruleset harness |
| 29 bootstrap rule pages | committed | `b060df4` docs(ux-audit): bootstrap DET rule pages |
| In-repo index | done | `auditor-tests/DET-RULESET-HARNESS-INDEX.md` |

## Phase 2 — Handbook upgrade (29 bootstrap)

| Item | Status | Campaign / notes |
|------|--------|------------------|
| `invoke-det-ruleset-handbook-upgrade.sh` | added | Batched `npm run pagegen`; manifest field `id` |
| `invoke-sync-handbook-versions.sh` | done | `rule-page-version.mjs --sync-stale` — **71/71** manifest `current`, **0** missing |
| `DET.THEME.FONT_STACK` handbook | done | Bootstrap page via `bootstrap_missing_rule_pages.py --only-rule` (stub; harness excluded) |
| Pagegen (Cursor) | optional | Use when Before/After content must change; sync suffices when harness already passes |

## Phase 3 — Deterministic remediation verify (50 rules)

| Item | Status | Campaign |
|------|--------|----------|
| `invoke-det-ruleset-remediation-verify.sh` | added | Apply After + `expect-rule-clean.sh` (design-rule-runtime only) |
| Full pass | **50/50** `remediation_ok` | `ruleset-remediation-verify-20260525T103812Z` (dedupe `state.jsonl` by `ruleId`) |

Fixtures use `LOOP_REPO=fixture-website`, minimal `harness-minimal-assets/`, and `seed_harness_repo()` for registry-heavy rules.

## Phase 3b — Detection regression (50 rules)

| Item | Status | Campaign |
|------|--------|----------|
| Re-run after handbook/fixture tooling | **50/50** `detection_ok` | `ruleset-harness-20260525T104745Z` (dedupe by `ruleId`) |

## Phase 4 — Agent remediation pilot (5 rules)

First attempt (`ruleset-agent-pilot-20260525T110025Z`) rebuilt an empty fixture root — **4× `missing_fixture`**, `DET.HASH.MARKERS` → `remediation_fail` (2 findings after agent).

**Retry** must set shared detection fixtures:

```bash
export FORGE_UX_CURSOR_AGENT_MODEL=auto
export FORGE_UX_RULESET_FIXTURE_ROOT=workbench/ux-auditor/rule-defect-fixtures/ruleset-harness-20260525T104745Z
export UX_AUDIT_OUT_DIR=workbench/ux-auditor/ux-audit/ruleset-agent-pilot-retry-<timestamp>
cd tools/website-ux-auditor/auditor-tests
for r in DET.HASH.MARKERS DET.APP.PERSISTENT_CHROME DET.CONTRACT.PATH DET.SURFACE.ELEVATION_TOKEN DET.NAV.BREADCRUMB; do
  ./invoke-det-ruleset-harness.sh --only-rule "$r" --enable-agents --force --no-watch
done
```

**Retry** (`ruleset-agent-pilot-retry-20260525T114500Z`, shared fixtures):

| Rule | Status | Findings after agent |
|------|--------|----------------------|
| `DET.CONTRACT.PATH` | `remediation_ok` | 0 |
| `DET.HASH.MARKERS` | `remediation_fail` | 2 |
| `DET.APP.PERSISTENT_CHROME` | `remediation_fail` | 2 |
| `DET.SURFACE.ELEVATION_TOKEN` | `remediation_fail` | 7 |
| `DET.NAV.BREADCRUMB` | `remediation_fail` | 1 |

Pilot validated the `--enable-agents` path; fixture HTML + prompt tuning remain for non-overlay rules.

**Apply-first remediation (2026-05-25):** `run-agent-pilot-*-remediation.sh` scripts apply handbook After + `expect-rule-clean` — **4/4** pilot rules clean on in-repo campaign copies. [harness-remediation.prompt.md](harness-remediation.prompt.md) updated (`FORGE_UX_RULESET_FIXTURE_ROOT`, apply before hand-edit).

## Phase 5 — AI ruleset harness (20 rules)

| Item | Status | Campaign |
|------|--------|----------|
| Full AI lane | **20/20** `detection_ok`, **0** `detection_miss` | `ai-ruleset-harness-20260525T110026Z` |

## Phase 6 — Tests & docs

| Item | Status |
|------|--------|
| `invoke-det-ruleset-harness.test.sh` | dry-run OK (`DET_HARNESS_SKIP_E2E=1`) |
| `invoke-det-ruleset-remediation-verify.test.sh` | dry-run OK (`DET_REMEDIATION_SKIP_E2E=1`) |
| `invoke-sync-handbook-versions.test.sh` | manifest 71 current |
| `invoke-det-ruleset-handbook-upgrade.test.sh` | dry-run OK |
| `build-rule-defect-fixtures.test.sh` | single-rule build OK |
| `invoke-det-ruleset-harness-agent.test.sh` | dry-run + apply/clean smoke (`DET_AGENT_HARNESS_SKIP_E2E=1` default) |
| `generate-harness-e2e-matrix.mjs` | regenerates [E2E-COVERAGE-MATRIX.md](../../docs/design/ux-audit/harness/E2E-COVERAGE-MATRIX.md) |
| `npm test` | **554 pass / 21 fail** (2026-05-25; +2 tests from harness smokes; failures unchanged baseline) |

## Phase 7 — Prompt 10 closure (harness matrix + release pack)

| Item | Status |
|------|--------|
| `lib/harness-coverage-matrix.mjs` | DET fixture / AI prompt / fixer / Studio allowlist validators |
| `ruleset-harness-coverage.test.js` | Matrix gates in `npm test` |
| `e2e-smoke-coverage.test.js` | Generic static audit, KS hash path, scenario scorecard, form DET |
| `scripts/write-harness-current-coverage.mjs` | Writes [CURRENT-COVERAGE.md](../../docs/design/ux-audit/harness/CURRENT-COVERAGE.md) |
| [RELEASE-NOTES-2026-05-29.md](../../docs/design/ux-audit/RELEASE-NOTES-2026-05-29.md) | Migration + rule summary |
| `workbench/pack-studio-ruleset-bundle.sh` | Ships harness summaries + release notes |
| `workspace-scripts/verify-ruleset-pack-self-contained.mjs` | Requires CURRENT-COVERAGE + closure doc in self-contained packs |

## Quick re-run commands

```bash
cd forgesdlc-kitchensink/tools/website-ux-auditor/auditor-tests
unset UX_AUDIT_OUT_DIR

# Detection (≥1 finding per rule)
./invoke-det-ruleset-harness.sh --rebuild-fixtures

# Remediation verify (0 findings after After)
./invoke-det-ruleset-remediation-verify.sh --rebuild-fixtures

# AI detection (≥1 principle finding per rule)
export FORGE_UX_CURSOR_AGENT_MODEL=auto
./invoke-ai-ruleset-harness.sh --rebuild-fixtures
```

## Deferred (documented, not gaps)

- `DET.THEME.FONT_STACK` — excluded from harness by design
- Agent remediation for all 50 DET rules — out of scope (pilot only)
- Committing workbench `ux-audit/` artifacts — ephemeral; paths referenced here and in `DET-RULESET-HARNESS-INDEX.md`
