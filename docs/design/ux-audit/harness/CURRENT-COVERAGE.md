# Harness current coverage

Generated: `2026-05-29T00:00:00.000Z` by `lib/harness-coverage-matrix.mjs` (Prompt 10 closure).

## Registry

| Lane | Documented | Implemented | Stubbed |
|------|------------|-------------|---------|
| UX DET | 65 | 65 | 0 |
| UX AI active | 20 | — | — |
| UX AI legacy/doc-only | 5 | — | (3 legacy) |

## Production fixer decisions (UX DET)

| Category | Count |
|----------|-------|
| Production auto-fix | 14 |
| Plan-only (intentional) | 27 |
| Handbook After default | ~24 |
| Repo overlay | via `defaultFixerDecision` |

Pilot registry may list additional `pendingRegistry` rows for rules documented ahead of the next `blend-rules` bump.

## Studio dynamic allowlist

- Resolved dynamic rules: **~44** (intersection of `STUDIO_DYNAMIC_UX_RUN` + primitives with implemented registry)
- App-safe allowlist: explicit include/skip lists in `ui-app-audit/lib/studio-dynamic-ux-ruleset.mjs`

## Matrix gates

| Gate | Status |
|------|--------|
| DET harness fixture (rule page Before or repo overlay) | PASS (see `ruleset-harness-coverage.test.js`) |
| AI defect prompt on disk | PASS |
| Fixer decision per DET rule | PASS |
| Studio dynamic allowlist complete | PASS |

## Verification commands

```bash
cd forgesdlc-kitchensink/tools/website-ux-auditor
npm run blend-rules
npm run pagegen:manifest
npm run preflight-deterministic
npm test
npm run harness:coverage
cd ../website-a11y-auditor && npm test
cd ../ui-app-audit && npm test
node ../../../workspace-scripts/verify-ruleset-pack-self-contained.mjs --root ../../..
```
