---
rule_id: DET.APP.EMPTY_LOADING_ERROR_SUCCESS
lane: deterministic
title: App workspace primary states
summary: Workspaces show one primary state with heading and next action.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-empty-loading-error-success
registry_status: implemented
---

## Purpose

Workspaces show one primary state with heading and next action for empty/loading/error/success paths.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.EMPTY_LOADING_ERROR_SUCCESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-empty-loading-error-success.check.js`.
