---
rule_id: DET.APP.BULK_ACTION_SCOPE
lane: deterministic
title: App bulk action scope
summary: Bulk/destructive actions state selected count before execution.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-bulk-action-scope
registry_status: implemented
---

## Purpose

Bulk/destructive actions show selected count and scope before action execution.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.BULK_ACTION_SCOPE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-bulk-action-scope.check.js`.
