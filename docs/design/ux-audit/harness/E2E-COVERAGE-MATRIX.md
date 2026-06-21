# E2E coverage matrix (ruleset harness)

Generated: `2026-05-25T14:33:25.949Z` by `tools/website-ux-auditor/auditor-tests/generate-harness-e2e-matrix.mjs`.

Column keys map to [harness DoR/DoD](README.md) artifacts.

## Campaign sources

| Lane | Campaign directory |
|------|-------------------|
| DET detection | `/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/ruleset-harness-20260525T104745Z` |
| DET remediation fix | `/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/ruleset-remediation-verify-20260525T103812Z` |
| DET agent pilot | `/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/ruleset-agent-pilot-applyfirst-20260525T120000Z` |
| AI detection | `/home/lzvyahin/Code/workbench/ux-auditor/ux-audit/ai-ruleset-harness-20260525T110026Z` |

## Summary by E2E tier

| Lane | fixer_e2e | full_e2e | detect_e2e | agent_e2e | gap | catalog_only |
|------|-----------|----------|------------|-----------|-----|--------------|
| DET (51 rows) | 0 | 50 | 0 | 0 | 0 | 1 stub |
| AI (20 rows) | 0 | 20 | 0 | 0 | 0 |

Handbook **bootstrap/version_sync** flag (quality, not tier): **19** rules.

### Tier definitions

| Tier | Meaning |
|------|---------|
| fixer_e2e | detection_ok + remediation_ok + fixer_ok (deterministic fixer lane) |
| full_e2e | detection_ok + remediation_ok (DET deterministic fix; fixer_ok not recorded) |
| detect_e2e | detection_ok; no DET remediation verify (AI default) |
| agent_e2e | remediation_ok via --enable-agents |
| gap | detection_miss, remediation_fail, missing_fixture |
| catalog_only_stub | Registry stub; excluded from defect fixtures (e.g. DET.THEME.FONT_STACK) |
| catalog_only | Not in implemented harness set or no campaign row |

## Per-rule matrix

| ruleId | lane | ruleset | rule_page | handbook_quality | detection_check | fixture | auditor_detect | remediation_fix | fixer_ok | agent_required | remediation_agent | e2e_tier | next_work |
|--------|------|---------|-----------|------------------|-----------------|---------|----------------|-------------------|----------|----------------|-------------------|----------|-----------|
| AI.AMBIENT.READABILITY_CONFLICT | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.APP.DENSITY_BALANCE | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.APP.WORKFLOW_CONTINUITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.CONTEXT.BURDEN_SUBJECTIVE | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.CONTEXT.COGNITIVE_CLARITY | ai | implemented | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.CONTRACT.IMPLEMENTATION_USEFULNESS | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.CREDIBILITY.NO_OVERCLAIM | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.DATA.INSIGHT_LEGIBILITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.DIAGRAM.SEMANTIC_ACCURACY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.JS.BEHAVIOR_DISCOVERABILITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.MOTION.INTENTIONALITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.NARRATIVE.COHERENCE | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.PREMIUM.ENTERPRISE_FEEL | ai | implemented | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.PY.HTML_AUTHORING_QUALITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.APP.PRIMITIVE_CONSISTENCY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.THEME.PERSONALITY_COHERENCE | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.TRUST.BOUNDARY_CLARITY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.VISUAL.HIERARCHY | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.VISUAL.PRODUCT_EXPLANATORY_VALUE | ai | implemented | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| AI.VISUAL.RHYTHM_SUBJECTIVE | ai | generated | stale | pagegen | Y | - | detection_ok | - | - | - | - | detect_e2e |  |
| DET.AMBIENT.Z_INDEX | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.APP.FOCUS_TRAP | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.APP.PERSISTENT_CHROME | deterministic | implemented | current | pagegen | Y | multi_page | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.BUTTON.GROUP.MAX | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CARD.ACTION_LIMIT | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CARD.TITLE | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CATALOG.CONTRACT_SPECIFICITY | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CHART.ALT_SUMMARY | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CHROME.BOUNDARY | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CONTEXT.BURDEN | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CONTRACT.PATH | deterministic | implemented | stale | pagegen | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CONTRACT.PLACEHOLDERS | deterministic | implemented | stale | pagegen | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CTA.HIERARCHY | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.CTA.LABEL_NONEMPTY | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.DATA.COLOR_ONLY | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.DATA.TABLE_HEADERS | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.DIAGRAM.ALT | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.DIAGRAM.ASSET_REGISTRY | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.DIAGRAM.LABELS | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.HASH.MARKERS | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | remediation_fail | full_e2e | agent prompt (optional) |
| DET.HASH.REGISTRY_ROW | deterministic | implemented | stale | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.HTML.EMPTY_INLINE | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.INVENTORY.CROSSWALK | deterministic | implemented | current | pagegen | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.JS.NO_CONSOLE_ERROR | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.JS.PROGRESSIVE | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.LANDMARKS.REQUIRED | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.LAYOUT.GRID_CONSISTENCY | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.MOTION.NO_AUTO_PLAY_FLASH | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.MOTION.PREFERS_REDUCED | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.NAV.BREADCRUMB | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.NAV.DEDUP | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.NAV.DEPTH | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.NAV.FOCUS_ORDER | deterministic | implemented | current | pagegen | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.NAV.IN_PAGE_TOC | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PAGE.LANG | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PAGE.MODE | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PAGE.TITLE | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PAGE.VIEWPORT | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PROSE.LENGTH | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PY.KS_HASH_ATTRS | deterministic | implemented | current | version_sync | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.PY.OPTIONAL_REGIONS | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.APP.CONTROL_A11Y | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.APP.PRIMITIVE_MARKERS | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.SCREENSHOT.STATUS | deterministic | implemented | current | version_sync | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.SECTION.HEADING | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.SECTION.SINGLE_JOB | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.SURFACE.ELEVATION_TOKEN | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.THEME.CONTRAST_MIN | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.THEME.FONT_STACK | deterministic | stub | current | version_sync | Y | - | - | - | - | - | - | catalog_only_stub | stub excluded from harness |
| DET.TOKEN.NO_DRIFT | deterministic | implemented | current | version_sync | Y | repo_overlay | detection_ok | remediation_ok | - | - | - | full_e2e |  |
| DET.VISUAL.RHYTHM | deterministic | implemented | current | version_sync | Y | standalone | detection_ok | remediation_ok | - | - | - | full_e2e |  |
