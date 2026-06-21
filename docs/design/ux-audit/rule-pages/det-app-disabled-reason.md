---
rule_id: DET.APP.DISABLED_REASON
lane: deterministic
title: App disabled control reason
summary: Disabled primary controls expose why they are disabled.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-disabled-reason
registry_status: implemented
---

## Purpose

Disabled primary controls expose visible reason or adjacent precondition text.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DISABLED_REASON`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-disabled-reason.check.js`.
