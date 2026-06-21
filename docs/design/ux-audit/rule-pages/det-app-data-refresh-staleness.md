---
rule_id: DET.APP.DATA_REFRESH_STALENESS
lane: deterministic
title: App data refresh staleness
summary: Data-heavy panels show freshness and refresh/retry actions.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-data-refresh-staleness
registry_status: implemented
---

## Purpose

Data-heavy app screens show freshness/last updated, fetch failed/stale state, and refresh action where applicable.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DATA_REFRESH_STALENESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-data-refresh-staleness.check.js`.
