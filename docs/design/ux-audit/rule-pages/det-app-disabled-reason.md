---
rule_id: DET.APP.DISABLED_REASON
lane: deterministic
title: App disabled control reason
summary: Disabled primary controls expose why they are disabled.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-disabled-reason
registry_status: implemented
page_version: d8eda00e7da9a748954a55e02e4c6c640e407a405cf5c042442599c628f1d449
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.015Z
---

## Purpose

Disabled primary controls expose visible reason or adjacent precondition text.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DISABLED_REASON`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-disabled-reason.check.js`.
