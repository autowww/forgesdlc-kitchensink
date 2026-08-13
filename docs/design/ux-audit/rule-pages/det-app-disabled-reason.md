---
rule_id: DET.APP.DISABLED_REASON
lane: deterministic
title: App disabled control reason
summary: Disabled primary controls expose why they are disabled.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-disabled-reason
registry_status: implemented
page_version: 92ed77c94c7904dda26b1a1b8dda4895d3272b05daff64a5d4da381c2cfcac13
registry_fingerprint: aef1de6082cf0f50d463783c843dee0ffb9132fbd5ed4ea6e5bb3f031f359c72
generated_at: 2026-08-13T02:31:57.015Z
---

## Purpose

Disabled primary controls expose visible reason or adjacent precondition text.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.DISABLED_REASON`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-disabled-reason.check.js`.
