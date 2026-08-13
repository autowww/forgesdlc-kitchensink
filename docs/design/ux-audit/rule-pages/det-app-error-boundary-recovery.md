---
rule_id: DET.APP.ERROR_BOUNDARY_RECOVERY
lane: deterministic
title: App error boundary recovery
summary: Failed routes show recovery UI instead of a blank shell.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-error-boundary-recovery
registry_status: implemented
page_version: aeb27af67134ea35aa162ebb85e6bcb960b99f81a56052d774d4ea3d110d5392
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.028Z
---

## Purpose

Failed routes show recovery UI instead of a blank shell.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.ERROR_BOUNDARY_RECOVERY`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-error-boundary-recovery.check.js`.
