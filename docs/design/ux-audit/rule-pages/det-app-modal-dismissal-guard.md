---
rule_id: DET.APP.MODAL_DISMISSAL_GUARD
lane: deterministic
title: App modal dismissal guard
summary: Modals include close affordance and unsaved/destructive guards.
source_rule: docs/design/ux-audit/deterministic-design-rules.md#det-app-modal-dismissal-guard
registry_status: implemented
---

## Purpose

Modals/panels include close affordance, escape handling where safe, and unsaved-change guard for destructive workflows.

## Evidence and remediation

Run `tools/website-ux-auditor/auditor-tests/invoke-det-ruleset-harness.sh --only-rule DET.APP.MODAL_DISMISSAL_GUARD`. Implementation: `tools/website-ux-auditor/design-rules/deterministic/generated/det-app-modal-dismissal-guard.check.js`.
