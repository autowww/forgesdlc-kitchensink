---
rule_id: DET.APP.BULK_ACTION_SCOPE
lane: deterministic
title: App bulk action scope
summary: Bulk/destructive actions state selected count before execution.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-bulk-action-scope
registry_status: implemented
page_version: 97e223cb22b18295208650d0620450bce4c3ee1b918c685027e272aaa48c12cb
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:56.997Z
---

## Purpose

Bulk/destructive actions show selected count and scope before action execution.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.BULK_ACTION_SCOPE`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-bulk-action-scope.check.js`.
