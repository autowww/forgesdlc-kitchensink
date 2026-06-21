# UX / A11y ruleset release notes — 2026-05-29

Closure pack for the **Forge enterprise website UX** and **A11y** ruleset campaign (Prompts 00–10). Use this when bumping Kitchen Sink consumers or publishing a `studio-ruleset-pack-*` export.

## Summary

| Area | Count (approx.) | Notes |
|------|-----------------|-------|
| UX DET documented / implemented | 65 / 65 | Zero stubs; `DET.THEME.FONT_STACK` implemented |
| UX AI active (registry) | 20 | Legacy aliases normalized (`AI.VISUAL.HIERARCHY`, etc.) |
| UX production auto-fix | 12+ | Vite/React app + theme font stack + responsive overflow |
| UX plan-only fixer | 25+ | Live scenario, crawl, KS governance, generic forms |
| A11y DET | 68 | WCAG 2.0–2.2 + 3.0 bronze proxy packs at zero uncovered |
| A11y AI | 21 | Manual SC rows include AI tooling |
| Studio dynamic UX rules | 45+ | Explicit allowlist in `ui-app-audit` |

## New or materially changed UX DET rules

### Theme

- **`DET.THEME.FONT_STACK`** — real check (computed font roles); production fixer patches shared CSS/theme files.

### Vite / React app (`DET.APP.*`)

- **`DET.APP.ROUTE_DEEPLINK_STATE`**, **`DET.APP.ERROR_BOUNDARY_RECOVERY`**, **`DET.APP.EMPTY_LOADING_ERROR_SUCCESS`**, **`DET.APP.DISABLED_REASON`**, **`DET.APP.TOAST_LIFECYCLE`**, **`DET.APP.MODAL_DISMISSAL_GUARD`**, **`DET.APP.WIZARD_PROGRESS_CONTROLS`**, **`DET.APP.BULK_ACTION_SCOPE`**, **`DET.APP.DATA_REFRESH_STALENESS`**, **`DET.APP.CLIENT_ERROR_LOG_CLEAN`** — scenario-safe DOM checks; most are **plan-only** fixers (live replay / product copy).

### Kitchen Sink governance (`DET.KS.*`)

- **`DET.KS.PRIMITIVE_VERSION_MATCH`**, **`DET.KS.CONSUMER_ASSET_BUNDLE`**, **`DET.KS.HASH_SEMANTIC_UNIQUENESS`**, **`DET.KS.CONTRACT_EXAMPLE_SYNC`**, **`DET.KS.CSS_SCOPE_LEAK`**, **`DET.KS.VISUAL_FAMILY_COVERAGE`** — repo overlay + live crawl; plan-only fixers.

### Generic website

- **`DET.ROUTE.*`**, **`DET.RESPONSIVE.*`**, **`DET.FORM.*`**, **`DET.SEARCH.*`**, **`DET.TABLE.*`**, **`DET.LOADING.*`**, **`DET.STATUS.*`**, **`DET.METADATA.*`**, **`DET.EXTERNAL_LINK.*`**, **`DET.MEDIA.*`** — marketing/docs sites; crawl or standalone harness modes.

## AI governance

- Canonical **`AI.VISUAL.HIERARCHY`** (alias: `AI.VISUAL.HIERARCHY_CONFIDENCE`).
- Canonical **`AI.CREDIBILITY.NO_OVERCLAIM`** (alias: `AI.GOVERNANCE.CREDIBILITY`).
- **`AI.CONTRACT.FAMILY_COVERAGE_JUSTIFIED`** and **`AI.RULE_DISCOVERY.CANDIDATE_DETERMINISTIC_RULE`** remain **discovery-only** (not scored batches).

## Migration notes

1. **Regenerate after pull:** `cd forgesdlc-kitchensink/tools/website-ux-auditor && npm run blend-rules && npm run pagegen:manifest`.
2. **Pilot registry:** `npm run fixers:generate-pilot-registry` when `production-fixer-decisions.mjs` changes.
3. **Harness gates:** `node --test auditor-tests/ruleset-harness-coverage.test.js` and `e2e-smoke-coverage.test.js`.
4. **Release pack:** `bash workbench/pack-studio-ruleset-bundle.sh` then `node workspace-scripts/verify-ruleset-pack-self-contained.mjs --root workbench/studio-ruleset-pack-<UTC>`.
5. **Consumer submodule bump:** update `kitchensink` pointer in product repos; rebuild static sites per `auto-build-sites.mdc`.

## Deferred / residual risks

- Full **agent remediation** for all 65 DET rules remains out of scope (5-rule pilot only).
- **Handbook pagegen** for AI rules may still show `stale` in E2E matrix until Cursor pagegen campaigns refresh Before/After narratives.
- **`DET.THEME.SPACING_TOKEN_DRIFT`** / **`DET.THEME.RADIUS_SHADOW_TOKEN_DRIFT`** documented as backlog only (not in registry).

## Verification

```bash
cd forgesdlc-kitchensink/tools/website-ux-auditor
npm run blend-rules
npm run pagegen:manifest
npm run preflight-deterministic
npm test
node scripts/write-harness-current-coverage.mjs
cd ../website-a11y-auditor && npm test
cd ../ui-app-audit && npm test
node ../../../workspace-scripts/verify-ruleset-pack-self-contained.mjs --root ../../..
```
