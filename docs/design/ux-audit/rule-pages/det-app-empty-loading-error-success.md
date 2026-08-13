---
rule_id: DET.APP.EMPTY_LOADING_ERROR_SUCCESS
lane: deterministic
title: App workspace primary states
summary: Workspaces show one primary state with heading and next action.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-empty-loading-error-success
registry_status: implemented
page_version: 44972b37f993101f7f01b1cf80584ec9eeda2dfc0732a1c160ac80d83c629128
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.017Z
---

## Purpose

Workspaces show one primary state with heading and next action for empty/loading/error/success paths.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.EMPTY_LOADING_ERROR_SUCCESS`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-empty-loading-error-success.check.js`.
