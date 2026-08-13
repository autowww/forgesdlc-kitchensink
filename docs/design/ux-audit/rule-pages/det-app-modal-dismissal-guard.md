---
rule_id: DET.APP.MODAL_DISMISSAL_GUARD
lane: deterministic
title: App modal dismissal guard
summary: Modals include close affordance and unsaved/destructive guards.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-modal-dismissal-guard
registry_status: implemented
page_version: a81f9e214ddf53e0e5f203a22cfee8bd6404a4d2425c27bcfc6c0682a0868d63
registry_fingerprint: 7a15a7be7af91647cbbfc3980fa46689f53c2e2847742c4feaf57baaee5004e4
generated_at: 2026-08-13T02:31:57.037Z
---

## Purpose

Modals/panels include close affordance, escape handling where safe, and unsaved-change guard for destructive workflows.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.MODAL_DISMISSAL_GUARD`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-modal-dismissal-guard.check.js`.
