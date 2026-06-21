---
rule_id: DET.APP.ERROR_BOUNDARY_RECOVERY
lane: deterministic
title: App error boundary recovery
summary: Failed routes show recovery UI instead of a blank shell.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-error-boundary-recovery
registry_status: implemented
---

## Purpose

Failed routes show recovery UI instead of a blank shell.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ERROR_BOUNDARY_RECOVERY`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-error-boundary-recovery.check.js`.
