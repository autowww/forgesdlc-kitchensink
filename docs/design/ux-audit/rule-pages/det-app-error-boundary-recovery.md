---
rule_id: DET.APP.ERROR_BOUNDARY_RECOVERY
lane: deterministic
title: App error boundary recovery
summary: Failed routes show recovery UI instead of a blank shell.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-error-boundary-recovery
registry_status: implemented
page_version: 23d2efaf38e395672525dc404ef97d4c1dd46dcd1039a36c84e6b56e326543d0
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.028Z
---

## Purpose

Failed routes show recovery UI instead of a blank shell.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ERROR_BOUNDARY_RECOVERY`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-error-boundary-recovery.check.js`.
