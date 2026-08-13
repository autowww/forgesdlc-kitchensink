---
rule_id: DET.APP.BULK_ACTION_SCOPE
lane: deterministic
title: App bulk action scope
summary: Bulk/destructive actions state selected count before execution.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-bulk-action-scope
registry_status: implemented
page_version: 8f688afab910e9c7fbfaa6d1fa97497a37a8628ba2f96d36fcd74c1410e13b44
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:56.997Z
---

## Purpose

Bulk/destructive actions show selected count and scope before action execution.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.BULK_ACTION_SCOPE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-bulk-action-scope.check.js`.
