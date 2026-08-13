---
rule_id: DET.APP.DATA_REFRESH_STALENESS
lane: deterministic
title: App data refresh staleness
summary: Data-heavy panels show freshness and refresh/retry actions.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-data-refresh-staleness
registry_status: implemented
page_version: a7bdc6cf019c51d1e139a181cd82ff56a394c9c147be5e2463b62c8fad533bb6
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.010Z
---

## Purpose

Data-heavy app screens show freshness/last updated, fetch failed/stale state, and refresh action where applicable.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DATA_REFRESH_STALENESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-data-refresh-staleness.check.js`.
