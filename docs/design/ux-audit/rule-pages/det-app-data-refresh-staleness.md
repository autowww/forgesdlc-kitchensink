---
rule_id: DET.APP.DATA_REFRESH_STALENESS
lane: deterministic
title: App data refresh staleness
summary: Data-heavy panels show freshness and refresh/retry actions.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-data-refresh-staleness
registry_status: implemented
page_version: 268202638f60f253de828d7b163dff295fde0ae7be0a9165df0b10cecab870a4
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.010Z
---

## Purpose

Data-heavy app screens show freshness/last updated, fetch failed/stale state, and refresh action where applicable.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DATA_REFRESH_STALENESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-data-refresh-staleness.check.js`.
