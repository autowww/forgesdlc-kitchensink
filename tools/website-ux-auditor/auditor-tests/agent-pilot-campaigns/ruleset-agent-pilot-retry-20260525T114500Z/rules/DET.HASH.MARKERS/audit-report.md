---
title: Forge UX audit report
kind: ux-audit
site_kind: Forge website
schema_version: 2
generated_at: 2026-05-25T13:42:28.361Z
audit_run_id: 1155752f1b60c456
design_standard_sha256: 40024741d985bfa397f6adfeeb78b66d3a88ec80211bd13a198cd72c9895e603
design_theme: default
crawl_stop_reason: normal_completion
---

# Forge UX audit report

## Scope

- Repo: `/home/lzvyahin/Code/forgesdlc-kitchensink`
- Site URL: `http://127.0.0.1:60563/`
- Product profile: **Forge website**
- Product one-liner: A Forge product site for governed AI-enabled delivery.
- Framework detected: static/html
- Files indexed: 1606
- URLs analyzed this run: **1**
- **Crawl breadth:** **full** within `--max-pages` (`--breadth-crawl` / `--stop-disable`). **Priority batch** shows up to ten worst for readability (**24** in **All findings this run** and per-page arrays in `audit-data.json`).
- **Audit run id:** `1155752f1b60c456` — **schema:** `2` (see `audit-data.json`)
- **Generated at (UTC):** `2026-05-25T13:42:28.361Z`
- **Design theme:** `default` · fingerprint `dbf82571c5b10bd86cfe1baf01b2e772ae05f745789c684bef4dbf49081f4fc0`
- **Design standard pin:** `/home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/forge-enterprise-ai-website-standard.md` · id `forge.enterprise-ai-website-standard` · sha256 `40024741d985bfa397f6adfeeb78b66d3a88ec80211bd13a198cd72c9895e603`

## Crawl mode

Live crawl **completed** (`normal_completion`, mode `full_budget_within_max_pages`). Major+ backlog total `6`; URLs queued but not visited `1`; page capture budget `1`. Major+ threshold **(off — breadth crawl)** — breadth: **`--breadth-crawl`** (alias **`--stop-disable`**).

```json
{
  "crawlMode": "full_budget_within_max_pages",
  "stopReason": "normal_completion",
  "majorPlusFindingCountTotal": 6,
  "queuedRemainingAtStop": 1,
  "pagesCaptured": 1,
  "stopAfterMajorPlus": null,
  "stopAfterBacklog": null,
  "backlogFindingCountTotal": 24,
  "pagesPlannedBudget": 1,
  "stopDisabled": true,
  "haltOnQualityGate": false,
  "stopAfterGateViolationUnits": null,
  "qualityGateThresholds": {
    "blocker": 0,
    "critical": 0,
    "major": 0,
    "warn": 5,
    "minor": 10,
    "trivial": 15,
    "cosmetic": 100
  },
  "qualityGateHaltSeverity": null,
  "qualityGateViolationUnitsTotal": 17,
  "deterministicConcurrency": 5,
  "pageConcurrency": 1,
  "maxLinkDepth": null,
  "designTheme": {
    "id": "default",
    "fingerprint": "dbf82571c5b10bd86cfe1baf01b2e772ae05f745789c684bef4dbf49081f4fc0",
    "generatedPath": "/home/lzvyahin/Code/forgesdlc-kitchensink/docs/design/themes/default/theme.generated.json"
  },
  "excludeCrawlPreseeded": 0,
  "designRuleRegistryFingerprint": "2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c",
  "designRuleRegistryPath": "/home/lzvyahin/Code/forgesdlc-kitchensink/tools/website-ux-auditor/design-rules/registry.generated.json",
  "deterministicImplementedRuleIds": [
    "DET.AMBIENT.Z_INDEX",
    "DET.APP.FOCUS_TRAP",
    "DET.APP.PERSISTENT_CHROME",
    "DET.BUTTON.GROUP.MAX",
    "DET.CARD.ACTION_LIMIT",
    "DET.CARD.TITLE",
    "DET.CATALOG.CONTRACT_SPECIFICITY",
    "DET.CHART.ALT_SUMMARY",
    "DET.CHROME.BOUNDARY",
    "DET.CONTEXT.BURDEN",
    "DET.CONTRACT.PATH",
    "DET.CONTRACT.PLACEHOLDERS",
    "DET.CTA.HIERARCHY",
    "DET.CTA.LABEL_NONEMPTY",
    "DET.DATA.COLOR_ONLY",
    "DET.DATA.TABLE_HEADERS",
    "DET.DIAGRAM.ALT",
    "DET.DIAGRAM.ASSET_REGISTRY",
    "DET.DIAGRAM.LABELS",
    "DET.HASH.MARKERS",
    "DET.HASH.REGISTRY_ROW",
    "DET.HTML.EMPTY_INLINE",
    "DET.INVENTORY.CROSSWALK",
    "DET.JS.NO_CONSOLE_ERROR",
    "DET.JS.PROGRESSIVE",
    "DET.LANDMARKS.REQUIRED",
    "DET.LAYOUT.GRID_CONSISTENCY",
    "DET.MOTION.NO_AUTO_PLAY_FLASH",
    "DET.MOTION.PREFERS_REDUCED",
    "DET.NAV.BREADCRUMB",
    "DET.NAV.DEDUP",
    "DET.NAV.DEPTH",
    "DET.NAV.FOCUS_ORDER",
    "DET.NAV.IN_PAGE_TOC",
    "DET.PAGE.LANG",
    "DET.PAGE.MODE",
    "DET.PAGE.TITLE",
    "DET.PAGE.VIEWPORT",
    "DET.PROSE.LENGTH",
    "DET.PY.KS_HASH_ATTRS",
    "DET.PY.OPTIONAL_REGIONS",
    "DET.REACT.A11Y_ROLE",
    "DET.REACT.KS_ATTRS",
    "DET.SCREENSHOT.STATUS",
    "DET.SECTION.HEADING",
    "DET.SECTION.SINGLE_JOB",
    "DET.SURFACE.ELEVATION_TOKEN",
    "DET.THEME.CONTRAST_MIN",
    "DET.TOKEN.NO_DRIFT",
    "DET.VISUAL.RHYTHM"
  ],
  "ruleExecutionCoverage": {
    "pagesVisited": 1,
    "pageLoadErrors": [],
    "legacyChecks": [
      {
        "checkId": "cta-trust-ecosystem",
        "pagesRan": 1,
        "totalFindings": 2
      },
      {
        "checkId": "first-screen-density",
        "pagesRan": 1,
        "totalFindings": 0
      },
      {
        "checkId": "hero-headings",
        "pagesRan": 1,
        "totalFindings": 0
      },
      {
        "checkId": "homepage-shell",
        "pagesRan": 1,
        "totalFindings": 0
      },
      {
        "checkId": "metadata-a11y",
        "pagesRan": 1,
        "totalFindings": 1
      },
      {
        "checkId": "product-visual",
        "pagesRan": 1,
        "totalFindings": 1
      },
      {
        "checkId": "readability-structure",
        "pagesRan": 1,
        "totalFindings": 1
      },
      {
        "checkId": "storyline-flow",
        "pagesRan": 1,
        "totalFindings": 0
      },
      {
        "checkId": "technical-depth",
        "pagesRan": 1,
        "totalFindings": 0
      },
      {
        "checkId": "visual-catalog-awareness",
        "pagesRan": 1,
        "totalFindings": 0
      }
    ],
    "deterministicRules": [
      {
        "ruleId": "DET.AMBIENT.Z_INDEX",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.APP.FOCUS_TRAP",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.APP.PERSISTENT_CHROME",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.BUTTON.GROUP.MAX",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CARD.ACTION_LIMIT",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CARD.TITLE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CATALOG.CONTRACT_SPECIFICITY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CHART.ALT_SUMMARY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CHROME.BOUNDARY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CONTEXT.BURDEN",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CONTRACT.PATH",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CONTRACT.PLACEHOLDERS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CTA.HIERARCHY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.CTA.LABEL_NONEMPTY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.DATA.COLOR_ONLY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.DATA.TABLE_HEADERS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.DIAGRAM.ALT",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.DIAGRAM.ASSET_REGISTRY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.DIAGRAM.LABELS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 0,
        "with_findings": 1,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.HASH.MARKERS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.HASH.REGISTRY_ROW",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.HTML.EMPTY_INLINE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.INVENTORY.CROSSWALK",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.JS.NO_CONSOLE_ERROR",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.JS.PROGRESSIVE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.LANDMARKS.REQUIRED",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.LAYOUT.GRID_CONSISTENCY",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 0,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 1,
        "zero_findings": 0,
        "with_findings": 0,
        "pagesRan": 0
      },
      {
        "ruleId": "DET.MOTION.NO_AUTO_PLAY_FLASH",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.MOTION.PREFERS_REDUCED",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.NAV.BREADCRUMB",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.NAV.DEDUP",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.NAV.DEPTH",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.NAV.FOCUS_ORDER",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.NAV.IN_PAGE_TOC",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PAGE.LANG",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PAGE.MODE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 0,
        "with_findings": 1,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PAGE.TITLE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PAGE.VIEWPORT",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PROSE.LENGTH",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PY.KS_HASH_ATTRS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 0,
        "with_findings": 1,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.PY.OPTIONAL_REGIONS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.REACT.A11Y_ROLE",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.REACT.KS_ATTRS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.SCREENSHOT.STATUS",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.SECTION.HEADING",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.SECTION.SINGLE_JOB",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.SURFACE.ELEVATION_TOKEN",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.THEME.CONTRAST_MIN",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.THEME.FONT_STACK",
        "registryStatus": "stub",
        "implementationSource": "generated-stub-locked",
        "ran": 0,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 1,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 0,
        "with_findings": 0,
        "pagesRan": 0
      },
      {
        "ruleId": "DET.TOKEN.NO_DRIFT",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 0,
        "with_findings": 1,
        "pagesRan": 1
      },
      {
        "ruleId": "DET.VISUAL.RHYTHM",
        "registryStatus": "implemented",
        "implementationSource": "explicit-map",
        "ran": 1,
        "skipped_no_findings_cache": 0,
        "skipped_stub": 0,
        "skipped_status": 0,
        "import_error": 0,
        "no_run": 0,
        "threw": 0,
        "zero_findings": 1,
        "with_findings": 0,
        "pagesRan": 1
      }
    ],
    "registryImplementedCount": 50,
    "deterministicRanOnAllVisitedPages": false,
    "deterministicMissingOnPages": [
      "DET.LAYOUT.GRID_CONSISTENCY"
    ]
  },
  "deterministicPreflight": {
    "ok": true,
    "registryFingerprint": "2ce40848effce579d3e4879f6ca85535183a14db201870a6c007da424624550c",
    "registryImplementedCount": 50,
    "registryStubCount": 1,
    "resolvedImplementedCount": 50,
    "importOk": 50,
    "importFail": [],
    "implementedRuleIds": [
      "DET.AMBIENT.Z_INDEX",
      "DET.APP.FOCUS_TRAP",
      "DET.APP.PERSISTENT_CHROME",
      "DET.BUTTON.GROUP.MAX",
      "DET.CARD.ACTION_LIMIT",
      "DET.CARD.TITLE",
      "DET.CATALOG.CONTRACT_SPECIFICITY",
      "DET.CHART.ALT_SUMMARY",
      "DET.CHROME.BOUNDARY",
      "DET.CONTEXT.BURDEN",
      "DET.CONTRACT.PATH",
      "DET.CONTRACT.PLACEHOLDERS",
      "DET.CTA.HIERARCHY",
      "DET.CTA.LABEL_NONEMPTY",
      "DET.DATA.COLOR_ONLY",
      "DET.DATA.TABLE_HEADERS",
      "DET.DIAGRAM.ALT",
      "DET.DIAGRAM.ASSET_REGISTRY",
      "DET.DIAGRAM.LABELS",
      "DET.HASH.MARKERS",
      "DET.HASH.REGISTRY_ROW",
      "DET.HTML.EMPTY_INLINE",
      "DET.INVENTORY.CROSSWALK",
      "DET.JS.NO_CONSOLE_ERROR",
      "DET.JS.PROGRESSIVE",
      "DET.LANDMARKS.REQUIRED",
      "DET.LAYOUT.GRID_CONSISTENCY",
      "DET.MOTION.NO_AUTO_PLAY_FLASH",
      "DET.MOTION.PREFERS_REDUCED",
      "DET.NAV.BREADCRUMB",
      "DET.NAV.DEDUP",
      "DET.NAV.DEPTH",
      "DET.NAV.FOCUS_ORDER",
      "DET.NAV.IN_PAGE_TOC",
      "DET.PAGE.LANG",
      "DET.PAGE.MODE",
      "DET.PAGE.TITLE",
      "DET.PAGE.VIEWPORT",
      "DET.PROSE.LENGTH",
      "DET.PY.KS_HASH_ATTRS",
      "DET.PY.OPTIONAL_REGIONS",
      "DET.REACT.A11Y_ROLE",
      "DET.REACT.KS_ATTRS",
      "DET.SCREENSHOT.STATUS",
      "DET.SECTION.HEADING",
      "DET.SECTION.SINGLE_JOB",
      "DET.SURFACE.ELEVATION_TOKEN",
      "DET.THEME.CONTRAST_MIN",
      "DET.TOKEN.NO_DRIFT",
      "DET.VISUAL.RHYTHM"
    ],
    "stubRuleIds": [
      "DET.THEME.FONT_STACK"
    ],
    "deterministicCoverage": {
      "documentedRuleCount": 51,
      "implementedCount": 50,
      "stubCount": 1,
      "implementedRuleIds": [
        "DET.AMBIENT.Z_INDEX",
        "DET.APP.FOCUS_TRAP",
        "DET.APP.PERSISTENT_CHROME",
        "DET.BUTTON.GROUP.MAX",
        "DET.CARD.ACTION_LIMIT",
        "DET.CARD.TITLE",
        "DET.CATALOG.CONTRACT_SPECIFICITY",
        "DET.CHART.ALT_SUMMARY",
        "DET.CHROME.BOUNDARY",
        "DET.CONTEXT.BURDEN",
        "DET.CONTRACT.PATH",
        "DET.CONTRACT.PLACEHOLDERS",
        "DET.CTA.HIERARCHY",
        "DET.CTA.LABEL_NONEMPTY",
        "DET.DATA.COLOR_ONLY",
        "DET.DATA.TABLE_HEADERS",
        "DET.DIAGRAM.ALT",
        "DET.DIAGRAM.ASSET_REGISTRY",
        "DET.DIAGRAM.LABELS",
        "DET.HASH.MARKERS",
        "DET.HASH.REGISTRY_ROW",
        "DET.HTML.EMPTY_INLINE",
        "DET.INVENTORY.CROSSWALK",
        "DET.JS.NO_CONSOLE_ERROR",
        "DET.JS.PROGRESSIVE",
        "DET.LANDMARKS.REQUIRED",
        "DET.LAYOUT.GRID_CONSISTENCY",
        "DET.MOTION.NO_AUTO_PLAY_FLASH",
        "DET.MOTION.PREFERS_REDUCED",
        "DET.NAV.BREADCRUMB",
        "DET.NAV.DEDUP",
        "DET.NAV.DEPTH",
        "DET.NAV.FOCUS_ORDER",
        "DET.NAV.IN_PAGE_TOC",
        "DET.PAGE.LANG",
        "DET.PAGE.MODE",
        "DET.PAGE.TITLE",
        "DET.PAGE.VIEWPORT",
        "DET.PROSE.LENGTH",
        "DET.PY.KS_HASH_ATTRS",
        "DET.PY.OPTIONAL_REGIONS",
        "DET.REACT.A11Y_ROLE",
        "DET.REACT.KS_ATTRS",
        "DET.SCREENSHOT.STATUS",
        "DET.SECTION.HEADING",
        "DET.SECTION.SINGLE_JOB",
        "DET.SURFACE.ELEVATION_TOKEN",
        "DET.THEME.CONTRAST_MIN",
        "DET.TOKEN.NO_DRIFT",
        "DET.VISUAL.RHYTHM"
      ],
      "stubRuleIds": [
        "DET.THEME.FONT_STACK"
      ],
      "byImplementationSource": {
        "explicit-map": 50
      }
    }
  }
}
```

### Deterministic rule execution coverage

- **Pages with execution trace:** 1
- **Registry implemented DET rules:** 50
- **All implemented rules ran on every visited page:** no
- **Rules not ran on every page:** DET.LAYOUT.GRID_CONSISTENCY
- **Rules with import/runtime errors:** DET.LAYOUT.GRID_CONSISTENCY

Implemented DET rules: `DET.AMBIENT.Z_INDEX`, `DET.APP.FOCUS_TRAP`, `DET.APP.PERSISTENT_CHROME`, `DET.BUTTON.GROUP.MAX`, `DET.CARD.ACTION_LIMIT`, `DET.CARD.TITLE`, `DET.CATALOG.CONTRACT_SPECIFICITY`, `DET.CHART.ALT_SUMMARY`, `DET.CHROME.BOUNDARY`, `DET.CONTEXT.BURDEN`, `DET.CONTRACT.PATH`, `DET.CONTRACT.PLACEHOLDERS`, `DET.CTA.HIERARCHY`, `DET.CTA.LABEL_NONEMPTY`, `DET.DATA.COLOR_ONLY`, `DET.DATA.TABLE_HEADERS`, `DET.DIAGRAM.ALT`, `DET.DIAGRAM.ASSET_REGISTRY`, `DET.DIAGRAM.LABELS`, `DET.HASH.MARKERS`, `DET.HASH.REGISTRY_ROW`, `DET.HTML.EMPTY_INLINE`, `DET.INVENTORY.CROSSWALK`, `DET.JS.NO_CONSOLE_ERROR`, `DET.JS.PROGRESSIVE`, `DET.LANDMARKS.REQUIRED`, `DET.LAYOUT.GRID_CONSISTENCY`, `DET.MOTION.NO_AUTO_PLAY_FLASH`, `DET.MOTION.PREFERS_REDUCED`, `DET.NAV.BREADCRUMB`, `DET.NAV.DEDUP`, `DET.NAV.DEPTH`, `DET.NAV.FOCUS_ORDER`, `DET.NAV.IN_PAGE_TOC`, `DET.PAGE.LANG`, `DET.PAGE.MODE`, `DET.PAGE.TITLE`, `DET.PAGE.VIEWPORT`, `DET.PROSE.LENGTH`, `DET.PY.KS_HASH_ATTRS`, `DET.PY.OPTIONAL_REGIONS`, `DET.REACT.A11Y_ROLE`, `DET.REACT.KS_ATTRS`, `DET.SCREENSHOT.STATUS`, `DET.SECTION.HEADING`, `DET.SECTION.SINGLE_JOB`, `DET.SURFACE.ELEVATION_TOKEN`, `DET.THEME.CONTRAST_MIN`, `DET.TOKEN.NO_DRIFT`, `DET.VISUAL.RHYTHM`


## Severity ladder (schema v2)

| Level | Meaning |
|-------|---------|
| **Blocker** | Would likely block enterprise review on a key landing page — script uses sparingly when heuristics show a catastrophic miss (story/hero failure). |
| **Critical** | Severe deviation: first-screen/hero violations, dense technical content above fold, missing CTA hierarchy, absent trust framing. |
| **Major** | Clear standard violation: overcrowded nav, too many competing CTAs, weak ecosystem/trust cues, readability or visible a11y/metadata issues. |
| **Warn** | Catalog alignment, governance, or policy nits that should be fixed but are unlikely to block a release alone (e.g. unknown or mismatched KS visual hash markers). |
| **Minor** | Noticeable polish or IA friction without breaking comprehension. |
| **Trivial** | Low-impact inconsistency. |
| **Cosmetic** | Visual/spatial nits; usually deferred to human judgement. |

Each structured finding carries **`severity`** and **`legacySeverity`** (`high` / `medium` / `low`) for older tooling during transition.

## Design-standard UX rollup (heuristic)

- **Interpretation:** this block combines optional **prior-run deltas** (--prior-ux-scores), an optional **precrawl sitewide** rollup (--scores-first), optional **sitewide scorer loop deltas** (`ux-quality-score-loop-delta.json` from `score-website-ux.mjs`), and the rollup for **URLs analyzed in this audit output**.

### Audit crawl rollup (this report’s URLs)

- **Overall score:** **41** / 100 (schema **v2**) — logarithmic pillar penalties + harmonic blend over **only** URLs that appear above in the crawl tables.
- **Breadth:** for a paused Major+ crawl without precrawl/scorer pairing, run **`npm run score -- …`** (**`score-website-ux.mjs`**) across the site budget.

| Pillar id | Score | Damage | Findings |
|-----------|-------|--------|-----------|
| `narrativeHero` | 35 | 75 | 2 |
| `informationArchitecture` | 100 | 0 | 0 |
| `depthAndTechnicalDisclosure` | 23 | 168 | 12 |
| `trustAndEcosystemTruth` | 54 | 20 | 1 |
| `visualRhythmFirstScreen` | 40 | 55 | 1 |
| `accessibilitySemanticsMeta` | 54 | 20 | 1 |
| `visualCatalogGovernance` | 36 | 72 | 6 |

**Coverage flags** — `staticOnly`, `crawlStoppedEarly`, `effectiveFindingCount` (excluding ancillary `inventory`, `site-inspection`) + `perfectScoreEligible`; see `audit-data.json → uxScores`.


## Scorecard

| Page | Score | Maj+ | Sub-maj | Words | Nav links |
|---|---:|---:|---:|---:|---:|
| http://127.0.0.1:60563/ | 8 | 6 | 18 | 13 | 0 |

Findings rollup: **blocker: 2; critical: 1; major: 3; minor: 2**

## Homepage / first analyzed URL — first-screen snapshot

- URL: http://127.0.0.1:60563/
- H1: "Handbook sample page"
- Above-fold words: 39
- CTA-like items above fold: None detected.
- Technical artifacts above fold: 0
- Trust terms: 1
- Ecosystem terms: 0

## Priority sample (worst first — rows capped at 10 for readability)

| Severity | Legacy | Area | URL | Finding |
|----------|--------|------|-----|---------|
| blocker | high | first-screen | http://127.0.0.1:60563/ | Homepage lacks a hero-scale product/system visual in the first viewport. |
| blocker | high | conversion | http://127.0.0.1:60563/ | No CTAs detected above the fold while the trust model is also insufficiently explicit. |
| critical | high | informationArchitecture | http://127.0.0.1:60563/ | Homepage reads as handbook/docs mode instead of public landing/marketing mode above the fold. |
| major | medium | ecosystem | http://127.0.0.1:60563/ | The page does not clearly show where it fits in the Forge ecosystem. |
| major | medium | messaging | http://127.0.0.1:60563/ | The page may be mechanism-led rather than outcome-led. |
| major | medium | metadata | http://127.0.0.1:60563/ | Meta description is missing or too short. |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-bullet-chart.svg for "bullet" matches only 1/2 required catalog legend node labels (of  |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-pie-donut.svg for "pie" matches only 0/2 required catalog legend node labels (of 4 lege |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-radar.svg for "radar" matches only 1/2 required catalog legend node labels (of 3 legend |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-waterfall.svg for "waterfall" matches only 2/3 required catalog legend node labels (of  |


### Priority detail

- **BLOCKER / first-screen** (http://127.0.0.1:60563/): Homepage lacks a hero-scale product/system visual in the first viewport.
  - Evidence: main_hero_visual_above_fold_count=0
  - Remediation: Add a hero-scale product screenshot, architecture diagram, or governed-flow visual inside <main> above the fold (see Product Visual Requirement in docs/design/forge-enterprise-ai-website-standard.md). Do not satisfy this finding by rewriting Markdown hero copy alone—allocate a visual slot in the landing layout first.
- **BLOCKER / conversion** (http://127.0.0.1:60563/): No CTAs detected above the fold while the trust model is also insufficiently explicit.
  - Evidence: 1 trust terms; no matched CTA verbs above fold.
  - Remediation: Add one primary action, one secondary action, and a concise trust block (boundaries, control, evidence) above the fold.
- **CRITICAL / informationArchitecture** (http://127.0.0.1:60563/): Homepage reads as handbook/docs mode instead of public landing/marketing mode above the fold.
  - Evidence: home_modes=handbook layout=layout-handbook expected=marketing url=http://127.0.0.1:60563/
  - Remediation: Use product/landing shell on `/` (mode 1 — public landing page): curated top nav only; route handbook trees to /docs or /handbook. Fix layout/routing before hero copy edits.
- **MAJOR / ecosystem** (http://127.0.0.1:60563/): The page does not clearly show where it fits in the Forge ecosystem.
  - Evidence: 0 ecosystem terms detected.
  - Remediation: Add an ecosystem strip linking ForgeSDLC, Lenses, LCDL, Fleet, Platform, and Blueprints where relevant.
- **MAJOR / messaging** (http://127.0.0.1:60563/): The page may be mechanism-led rather than outcome-led.
  - Evidence: 1 outcome terms detected.
  - Remediation: Rewrite section headings and cards around user outcomes before mechanisms.
- **MAJOR / metadata** (http://127.0.0.1:60563/): Meta description is missing or too short.
  - Evidence: No meta description found.
  - Remediation: Add a 120-160 character description that states what the product is and why it matters.
- **WARN / visual-catalog** (http://127.0.0.1:60563/): Template SVG assets/svg/template-bullet-chart.svg for "bullet" matches only 1/2 required catalog legend node labels (of 4 legend entries).
  - Evidence: diagram-labels-legend-gap key=bullet svg=assets/svg/template-bullet-chart.svg matched=1 required=2 url=http://127.0.0.1:60563/
  - Remediation: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN / visual-catalog** (http://127.0.0.1:60563/): Template SVG assets/svg/template-pie-donut.svg for "pie" matches only 0/2 required catalog legend node labels (of 4 legend entries).
  - Evidence: diagram-labels-legend-gap key=pie svg=assets/svg/template-pie-donut.svg matched=0 required=2 url=http://127.0.0.1:60563/
  - Remediation: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN / visual-catalog** (http://127.0.0.1:60563/): Template SVG assets/svg/template-radar.svg for "radar" matches only 1/2 required catalog legend node labels (of 3 legend entries).
  - Evidence: diagram-labels-legend-gap key=radar svg=assets/svg/template-radar.svg matched=1 required=2 url=http://127.0.0.1:60563/
  - Remediation: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.
- **WARN / visual-catalog** (http://127.0.0.1:60563/): Template SVG assets/svg/template-waterfall.svg for "waterfall" matches only 2/3 required catalog legend node labels (of 5 legend entries).
  - Evidence: diagram-labels-legend-gap key=waterfall svg=assets/svg/template-waterfall.svg matched=2 required=3 url=http://127.0.0.1:60563/
  - Remediation: Align SVG text nodes with catalog legend `items[].node` strings for the data-diagram-key, or update the catalog legend when labels were intentionally renamed.

## All findings this run (24)

| Severity | Legacy | Area | URL | Finding | Evidence (trim) |
|----------|--------|------|-----|---------|----------------|
| blocker | high | first-screen | http://127.0.0.1:60563/ | Homepage lacks a hero-scale product/system visual in the first viewport. | main_hero_visual_above_fold_count=0 |
| blocker | high | conversion | http://127.0.0.1:60563/ | No CTAs detected above the fold while the trust model is also insufficiently explicit. | 1 trust terms; no matched CTA verbs above fold. |
| critical | high | informationArchitecture | http://127.0.0.1:60563/ | Homepage reads as handbook/docs mode instead of public landing/marketing mode above the fold. | home_modes=handbook layout=layout-handbook expected=marketing url=http://127.0.0 |
| major | medium | ecosystem | http://127.0.0.1:60563/ | The page does not clearly show where it fits in the Forge ecosystem. | 0 ecosystem terms detected. |
| major | medium | messaging | http://127.0.0.1:60563/ | The page may be mechanism-led rather than outcome-led. | 1 outcome terms detected. |
| major | medium | metadata | http://127.0.0.1:60563/ | Meta description is missing or too short. | No meta description found. |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-bullet-chart.svg for "bullet" matches only 1/2 required catalog leg | diagram-labels-legend-gap key=bullet svg=assets/svg/template-bullet-chart.svg ma |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-pie-donut.svg for "pie" matches only 0/2 required catalog legend no | diagram-labels-legend-gap key=pie svg=assets/svg/template-pie-donut.svg matched= |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-radar.svg for "radar" matches only 1/2 required catalog legend node | diagram-labels-legend-gap key=radar svg=assets/svg/template-radar.svg matched=1  |
| warn | medium | visual-catalog | http://127.0.0.1:60563/ | Template SVG assets/svg/template-waterfall.svg for "waterfall" matches only 2/3 required catalog leg | diagram-labels-legend-gap key=waterfall svg=assets/svg/template-waterfall.svg ma |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #6b7280 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-queued" p |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #2563eb is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-running"  |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #b91c1c is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-failed" p |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #a16207 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".st-cancelled |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #1e293b is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #1e293b is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector=".fleet-tile-- |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #e2e8f0 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #1e293b is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| warn | medium | readability | http://127.0.0.1:60563/ | Raw hex color #334155 is used outside the theme token allowlist; prefer var(--forge-*) or other sanc | raw_hex_outside_allowlist path=css/forge-fleet-admin.css selector="[data-bs-them |
| minor | medium | visual-catalog | http://127.0.0.1:60563/ | generator/bootstrap_missing_rule_pages.py inlines governed KS hash attributes (/data-ks-hash\s*=\s*[ | python_source=generator/bootstrap_missing_rule_pages.py kind=manual-literal |
| minor | medium | visual-catalog | http://127.0.0.1:60563/ | generator/build_rule_defect_fixtures.py inlines governed KS hash attributes (/data-ks-hash\s*=\s*["' | python_source=generator/build_rule_defect_fixtures.py kind=manual-literal |

## Repository inventory hints

### Likely page/content files

- `docs/ascii-to-ks-diagrams.md`
- `docs/BACKLOG-layouts-components.md`
- `docs/design/catalog/chrome/Kbc-doc-breadcrumb.md`
- `docs/design/catalog/chrome/Kco-doc-offcanvas.md`
- `docs/design/catalog/chrome/Kpn-product-primary-nav.md`
- `docs/design/catalog/chrome/Ksf-site-footer.md`
- `docs/design/catalog/chrome/Ksr-doc-sidebar.md`
- `docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`
- `docs/design/catalog/components/Kpr-fam-python-renderers.md`
- `docs/design/catalog/consumer-site-hash-verification.md`
- `docs/design/catalog/contract-template.md`
- `docs/design/catalog/desktop-interfaces/Msm-museum-studio.md`
- `docs/design/catalog/diagrams/Ksv-fam-svg.md`
- `docs/design/catalog/interactions/Ksj-fam-scripts.md`
- `docs/design/catalog/layouts/Chp-layout-chapter.md`
- `docs/design/catalog/layouts/Gly-layout-gallery.md`
- `docs/design/catalog/layouts/Hbk-layout-handbook.md`
- `docs/design/catalog/layouts/Ldg-layout-landing.md`
- `docs/design/catalog/layouts/Lst-layout-listing.md`
- `docs/design/catalog/layouts/Mkt-layout-marketing.md`
- `docs/design/catalog/layouts/Prd-layout-product.md`
- `docs/design/catalog/layouts/Shw-layout-showcase.md`
- `docs/design/catalog/layouts/Spl-layout-split.md`
- `docs/design/catalog/ONTOLOGY.md`
- `docs/design/catalog/page-types/Fad-forge-autodoc.md`
- `docs/design/catalog/page-types/Kdt-fam-design-terminology.md`
- `docs/design/catalog/page-types/Ks-page-type-design-guidelines.md`
- `docs/design/catalog/pages/Ctr-controls.md`
- `docs/design/catalog/pages/Dca-data-charts-api.md`
- `docs/design/catalog/pages/Dce-diagram-code-examples.md`
- `docs/design/catalog/pages/Dcs-data-charts-static.md`
- `docs/design/catalog/pages/Dgm-diagrams.md`
- `docs/design/catalog/pages/Enm-enterprise-marketing.md`
- `docs/design/catalog/pages/Fag-for-agents.md`
- `docs/design/catalog/pages/Fam-forge-ambient.md`
- `docs/design/catalog/pages/Frp-forge-react-primitives.md`
- `docs/design/catalog/pages/Hdc-handbook-chapter.md`
- `docs/design/catalog/pages/Idx-index.md`
- `docs/design/catalog/pages/Kcm-ks-creation-mindmap.md`
- `docs/design/catalog/pages/Kra-fam-showcase-react-app.md`
- `docs/design/catalog/pages/Lvg-living-background.md`
- `docs/design/catalog/pages/Lyt-layouts.md`
- `docs/design/catalog/pages/Mtn-motion.md`
- `docs/design/catalog/pages/Nav-navigation.md`
- `docs/design/catalog/pages/Ndr-nested-roadmap.md`
- `docs/design/catalog/pages/Pnz-presentation.md`
- `docs/design/catalog/pages/Rpl-react-primitives-live.md`
- `docs/design/catalog/pages/Sgb-svg-backgrounds.md`
- `docs/design/catalog/pages/Slt-split-layout.md`
- `docs/design/catalog/pages/Srf-surfaces.md`
- `docs/design/catalog/pages/Tkn-tokens.md`
- `docs/design/catalog/pages/Vcp-preview-chapter.md`
- `docs/design/catalog/pages/Vhb-preview-handbook.md`
- `docs/design/catalog/pages/Vlg-preview-listing.md`
- `docs/design/catalog/pages/Vln-preview-landing.md`
- `docs/design/catalog/pages/Vmk-preview-marketing.md`
- `docs/design/catalog/pages/Vpd-preview-product.md`
- `docs/design/catalog/pages/Vsp-preview-split.md`
- `docs/design/catalog/primitives/FAM-react-primitives.md`
- `docs/design/catalog/README.md`

### Likely components/layout files

None detected.

### Likely navigation/shell files

- `docs/BACKLOG-layouts-components.md`
- `docs/design/catalog/chrome/Kpn-product-primary-nav.md`
- `docs/design/catalog/chrome/Ksr-doc-sidebar.md`
- `docs/design/catalog/chrome/Ktx-doc-toc-sidebar.md`
- `docs/design/catalog/layouts/Chp-layout-chapter.md`
- `docs/design/catalog/layouts/Gly-layout-gallery.md`
- `docs/design/catalog/layouts/Hbk-layout-handbook.md`
- `docs/design/catalog/layouts/Ldg-layout-landing.md`
- `docs/design/catalog/layouts/Lst-layout-listing.md`
- `docs/design/catalog/layouts/Mkt-layout-marketing.md`
- `docs/design/catalog/layouts/Prd-layout-product.md`
- `docs/design/catalog/layouts/Shw-layout-showcase.md`
- `docs/design/catalog/layouts/Spl-layout-split.md`
- `docs/design/catalog/pages/Lyt-layouts.md`
- `docs/design/catalog/pages/Nav-navigation.md`
- `docs/design/catalog/pages/Slt-split-layout.md`
- `docs/design/lenses-studio-shell.md`
- `docs/design/ux-audit/rule-pages/det-data-table-headers.md`
- `docs/design/ux-audit/rule-pages/det-layout-grid-consistency.md`
- `docs/design/ux-audit/rule-pages/det-nav-breadcrumb.md`
- `docs/design/ux-audit/rule-pages/det-nav-dedup.md`
- `docs/design/ux-audit/rule-pages/det-nav-depth.md`
- `docs/design/ux-audit/rule-pages/det-nav-focus-order.md`
- `docs/design/ux-audit/rule-pages/det-nav-in-page-toc.md`
- `docs/PAGE-LAYOUT-TAXONOMY.md`
- `js/docs-nav.js`
- `js/fs-nav-dropdown.js`
- `js/portal-nav.js`
- `museum/studio/assets/BlueprintsWizardLayout-WheM6hfS.js`
- `react/ForgeRunHeader.tsx`
- `tools/website-ux-auditor/.staging-det-data-table-headers.md`
- `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/02-homepage-shell-and-product-landing-mode.md`
- `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/04-information-architecture-and-navigation.md`
- `tools/website-ux-auditor/.ux-loop-e2e-8q54ptYDtj/09-screenshot-and-homepage-shell-review.md`
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/assets/forge-theme.js`
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/assets/showcase.js`
- `tools/website-ux-auditor/auditor-tests/agent-pilot-campaigns/ruleset-agent-pilot-retry-20260525T114500Z/rules/DET.NAV.BREADCRUMB/fixture-website/index.html`
- `tools/website-ux-auditor/auditor-tests/copy-det-data-table-headers-dest.test.js`
- `tools/website-ux-auditor/auditor-tests/det-data-table-headers.test.js`
- `tools/website-ux-auditor/auditor-tests/det-layout-grid-consistency.test.js`
- `tools/website-ux-auditor/auditor-tests/det-nav-breadcrumb.test.js`
- `tools/website-ux-auditor/auditor-tests/det-nav-dedup.test.js`
- `tools/website-ux-auditor/auditor-tests/det-nav-depth.test.js`
- `tools/website-ux-auditor/auditor-tests/det-nav-focus-order.test.js`
- `tools/website-ux-auditor/auditor-tests/det-nav-in-page-toc.test.js`
- `tools/website-ux-auditor/checks/homepage-shell.js`
- `tools/website-ux-auditor/design-rules/deterministic/generated/det-data-table-headers.check.js`
- `tools/website-ux-auditor/design-rules/deterministic/generated/det-layout-grid-consistency.check.js`
- `tools/website-ux-auditor/design-rules/deterministic/generated/det-nav-breadcrumb.check.js`
- `tools/website-ux-auditor/design-rules/deterministic/generated/det-nav-dedup.check.js`

### Likely style/theme files

- `css/docs-theme.css`
- `css/forge-ambient-themes.css`
- `css/forge-ambient.css`
- `css/forge-data-charts.css`
- `css/forge-fleet-admin.css`
- `css/forge-light-theme.css`
- `css/forge-react-primitives.css`
- `css/forge-theme.css`
- `css/forgesdlc-pack-contrast.css`
- `css/forgesdlc-pack-enterprise.css`
- `css/forgesdlc-pack-focus.css`
- `css/forgesdlc-pack-minimal.css`
- `css/forgesdlc-pack-showcase.css`
- `css/forgesdlc-theme.css`
- `css/fs-sticker-board.css`
- `css/ks-animated-backgrounds.css`
- `css/ks-living-background.css`
- `css/nested-roadmap.css`
- `css/script-assembly.css`
- `css/svg-background-gallery.css`
- `css/tile-dropdown.css`
- `css/wizard-flow.css`
- `css/workspace-lens.css`
- `docs/design/catalog/pages/Tkn-tokens.md`
- `docs/design/catalog/styles/Ksc-fam-styles.md`
- `docs/design/themes/default/ai-principles.md`
- `docs/design/themes/default/contracts/README.md`
- `docs/design/themes/default/design-standard.md`
- `docs/design/themes/default/deterministic-rules.md`
- `docs/design/themes/default/theme.generated.json`
- `docs/design/themes/default/theme.yaml`
- `docs/design/themes/default/tokens.json`
- `docs/design/themes/README.md`
- `docs/design/themes/softserve/ai-principles.md`
- `docs/design/themes/softserve/contracts/README.md`
- `docs/design/themes/softserve/design-standard.md`
- `docs/design/themes/softserve/deterministic-rules.md`
- `docs/design/themes/softserve/extraction-summary.json`
- `docs/design/themes/softserve/theme.generated.json`
- `docs/design/themes/softserve/theme.yaml`

## Screenshots

- screenshots/01-127-0-0-1-60563.png
- screenshots/00-mobile-127-0-0-1-60563.png


## Standard excerpt used for this audit

```md
---
id: forge.enterprise-ai-website-standard
kind: design-principle
status: draft
owner: Forge UX
applies_to:
  - forgesdlc.com
  - lcdl.forgesdlc.com
  - fleet.forgesdlc.com
  - lenses.forgesdlc.com
  - platform.forgesdlc.com
aliases:
  - Forge public website standard
  - Forge enterprise AI UX standard
  - Forge landing page principle
updated: 2026-05-18
---

**Canonical document.** All homepage shell rules, first-screen budgets, page-mode taxonomy, Platform root requirements, product-story contracts, and screenshot acceptance criteria live **in this file**. The historical companion file [`forge-enterprise-ai-website-standard-v2-addendum.md`](forge-enterprise-ai-website-standard-v2-addendum.md) is a short redirect stub for existing links.

# Forge enterprise AI website standard

## Purpose

All public Forge websites should feel bold, spacious, enterprise-ready, AI-enabled, and easy to understand. A first-time visitor should understand what the product is, what it does, who it is for, why it is trustworthy, and what to do next before encountering dense implementation details.

This standard is designed to be stored in the knowledge store and reused by any Forge website or AI coding agent.

## Core principle

Lead with the human outcome, show the governed agentic system, and reveal technical depth only when the user asks for it.

Forge should not feel like a generated documentation tree. It should feel like a coherent enterprise product ecosystem whose details remain available behind clear paths.

## Product Story Contract (Linear benchmark)

Public product homepages should mirror a **short enterprise product story**, not a documentation cover page. Use this structure:

1. **Category hero** — A tight line that states what category the product lives in and the outcome (compare: a short hero label + headline, not a README title).
2. **Immediate product/system visual** — Before the visitor reads long copy, show **one** primary visual in the hero band: product screenshot, architecture diagram, or governed flow. Icons alone do not satisfy the **Product Visual Requirement** below.
3. **Staged workflow story** — After the hero, reveal **how work flows** in discrete stages (steps, lanes, or cards). Prefer “intent → structure → execution → review → evidence” language adapted per product.
4. **AI as a real workflow capability** — AI or agents must appear as **steps, boundaries, or controls** in that workflow (delegation, review gates, contracts), not as a vague “AI-powered” badge without system placement.
5. **Proof and trust after the product promise** — Social proof, boundaries, ecosystem fit, and trust modules come **after** the visitor understands what the product **does**. Do not open with maintainer evidence, ADR trees, or compliance-adjacent walls before the promise.

**Forbidden:** Docs-first dominance — handbook framing, generated chapter lists, or sidebar indexes that occupy the first screen ahead of the landing story.

## Root Homepage Shell Contract

**Landing/product shell (required on `/`):**

- Full-width hero band with headline, subhead, CTA pair, and **hero-scale visual slot** (see Product Visual Requirement).
- Curated top navigation only on the root first screen — no persistent full documentation sidebar on desktop homepage view.
- Full handbook/reference trees live under **`/docs`**, **`/handbook`**, **`/reference`**, **`/operate`**, or equivalent deep routes — not on the root first screen.

**Docs/handbook shell (not allowed as the root `/` experience for public Forge product sites):**

- Generated multi-level docs nav or sidebar visible **before** the main hero story.
- “Handbook”, “Chapters”, exhaustive docs trees, or maintainer indexes acting as the dominant chrome on `/`.

**Verification:** Ask whether a screenshot of `/` at desktop width reads as **product/architecture landing** or **documentation reader**. If the latter, the shell is wrong regardless of hero copy quality.

**Forge Platform:** The root homepage must use **mode 1 — public landing page** (see Page mode taxonomy). Full handbook navigation belongs under **Docs / Handbook / Reference**, not the root first screen.

## Public homepage shell rule

A public Forge homepage must not use a generated handbook shell as its primary first-screen experience.

**Required:**

- No persistent full documentation sidebar on public homepage desktop view.
- No generated documentation tree before the hero.
- No duplicated desktop/mobile nav trees exposed before the main story.
- No “Handbook”, “Product-agnostic”, “Chapters”, “Docs tree”, “ADR”, “Evidence”, or “Sprints” framing above the hero unless the page is explicitly a docs/handbook page.
- Homepage layout should use a landing/product shell with full-width hero, curated top nav, short product-local nav, visual slot, outcome cards, ecosystem strip, and trust block.

**Allowed:**

- A compact “Docs” or “Handbook” CTA.
- A “For maintainers” card later on the page.
- Full generated navigation only inside `/docs`, `/handbook`, `/reference`, `/operate`, or equivalent routes.
```
