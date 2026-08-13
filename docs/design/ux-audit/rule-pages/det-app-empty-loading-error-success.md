---
rule_id: DET.APP.EMPTY_LOADING_ERROR_SUCCESS
lane: deterministic
title: App workspace primary states
summary: Workspaces show one primary state with heading and next action.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-empty-loading-error-success
registry_status: implemented
page_version: 5be4ea9ab1153c5ceb30f61e422f94b4f3ddb2985acf113e4645e978de95653c
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.017Z
---

## Purpose

Workspaces show one primary state with heading and next action for empty/loading/error/success paths.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.EMPTY_LOADING_ERROR_SUCCESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-empty-loading-error-success.check.js`.
